/**
 * Orquestador de la vista 3D: renderer WebGL, cámara, luces, escenario y población.
 * Sólo LEE el estado del motor epidemiológico (separación motor ↔ visualización).
 */
import { OrbitCameraControls } from './orbitControls.js';
import { CityRenderer } from './cityRenderer.js';
import { PeopleRenderer } from './peopleRenderer.js';

export class Lab3D {
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    this.ok = false;
    this.opts = { showZones: true, showChains: true, showContacts: true, showFx: true, showAerosols: true, showIcons: true, roofs: true, shadows: true, follow: false };
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch (e) {
      console.warn('WebGL no disponible, se usará la vista 2D.', e);
      return;
    }
    this.ok = true;
    const r = this.renderer;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.domElement.className = 'lab3d-canvas';
    container.appendChild(r.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x9fd3f0, 160, 380);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.3, 900);
    this.controls = new OrbitCameraControls(this.camera, r.domElement);

    this.hemi = new THREE.HemisphereLight(0xdbeafe, 0x4d6b3a, 0.9);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = -75; sc.right = 75; sc.top = 60; sc.bottom = -60; sc.near = 1; sc.far = 260;
    this.sun.shadow.bias = -0.0005;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    this.city = new CityRenderer(this.scene, engine.town);
    this.people = new PeopleRenderer(this.scene);
    this.lastBedCount = -1;
    this.startReal = performance.now() / 1000;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe(container);
  }

  resize() {
    if (!this.ok) return;
    const w = this.container.clientWidth || 600;
    const h = this.container.clientHeight || 400;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setShadows(on) {
    this.opts.shadows = on;
    this.renderer.shadowMap.enabled = on;
    this.sun.castShadow = on;
    this.people.setShadows(on);
    this.scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  }

  /**
   * Cámara cinematográfica: encuadres predefinidos con transición animada.
   *  overview: vista general · aerial: cenital para analizar la propagación ·
   *  street: a pie de calle · close: primer plano de una persona (síntomas).
   */
  setCameraMode(mode, target) {
    const c = this.controls;
    this.opts.follow = false;
    if (mode === 'overview') c.flyTo(0, 0, 80, 0.9, 0);
    else if (mode === 'aerial') c.flyTo(0, 0, 125, 0.12, 0);
    else if (mode === 'street') c.flyTo(0, 4, 24, 1.28, 0.6);
    else if (mode === 'close' && target) {
      // dentro de un edificio se mira desde arriba (por encima de las paredes)
      const indoor = target.placeKey && /^(house|school|hospital)/.test(target.placeKey);
      if (indoor || target.lying) c.flyTo(target.x, target.z, 9, 0.62, (target.yaw || 0));
      else c.flyTo(target.x, target.z, 7, 1.18, (target.yaw || 0));
    }
    else if (mode === 'event' && target) c.flyTo(target.x, target.z, 15, target.placeKey && /^house/.test(target.placeKey) ? 0.7 : 1.0);
    else if (mode === 'follow' && target) { this.opts.follow = true; c.flyTo(target.x, target.z, 14, 1.05); }
  }

  onEngineReset() {
    this.city.setMechanism(this.engine.mechanism);
    this.lastBedCount = -1;
    this.startReal = performance.now() / 1000;
    this.people.effects = [];
  }

  pick(clientX, clientY) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    return this.people.pick(this.engine, this.camera, x, y, rect.width / rect.height);
  }

  /** Punto del suelo bajo el cursor (para brotes en un lugar). */
  groundPoint(clientX, clientY) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const p = new THREE.Vector3();
    return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p) ? p : null;
  }

  render(dtReal, selectedId) {
    if (!this.ok) return;
    const e = this.engine;
    if (e.beds && e.beds.length !== this.lastBedCount) {
      this.city.setHospitalBeds(e.beds);
      this.lastBedCount = e.beds.length;
    }
    const sel = e.agents[selectedId];
    this.controls.tick(this.opts.follow && sel ? sel : null);
    this.city.setTimeOfDay(e.clockHour, this.sun, this.hemi, this.scene);
    this.city.update(dtReal, e, performance.now() / 1000);
    this.city.setLabelsVisible(this.opts.labels !== false);
    this.city.setRoofsVisible(this.opts.roofs, sel ? sel.homeKey : null);
    this.city.setMemorialCount(e.memorialCount || 0);
    if (e.mechanism === 'water') {
      this.city.setWaterContamination(e.water.map((w) => w / (w + 5)));
    } else this.city.setWaterContamination([0, 0, 0]);
    this.city.setAirLoad(e.mechanism === 'respiratory' ? e.airLoad : null, this.opts.showZones);
    this.people.selectedId = selectedId;
    this.people.update(e, {
      ...this.opts,
      camera: this.camera,
      dtReal,
      timeReal: performance.now() / 1000,
      startReal: this.startReal
    });
    this.renderer.render(this.scene, this.camera);
  }
}
