/**
 * Visor 3D de patógenos (ilustraciones conceptuales, NO imágenes de microscopía).
 *
 * Cada agente tiene una forma propia basada en su morfología conocida:
 *   coronavirus (espigas en maza) · paramixovirus pleomórfico (H y F) · influenza (HA + NA) ·
 *   herpesvirus (cápside icosaédrica dentro de la envoltura) · bacilo tuberculoso (pared cerosa, cordones) ·
 *   flavivirus (pequeño, superficie icosaédrica de proteína E) · Plasmodium (esporozoíto + glóbulo rojo) ·
 *   filovirus (filamento curvado) · poxvirus (ladrillo) · rabdovirus (bala) · Vibrio (coma + flagelo polar).
 *
 * También genera miniaturas para las tarjetas de enfermedades.
 */
import { getPathogen } from '../data/pathogens.js';

const fib = (n) => {
  const pts = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    pts.push(new THREE.Vector3(Math.cos(g * i) * r, y, Math.sin(g * i) * r));
  }
  return pts;
};

function std(color, o = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05, ...o });
}

/** Coloca "n" copias de una geometría orientadas hacia fuera sobre una esfera de radio r. */
function spikes(group, geo, mat, r, dirs, scaleFn) {
  const im = new THREE.InstancedMesh(geo, mat, dirs.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), s = new THREE.Vector3();
  dirs.forEach((d, i) => {
    q.setFromUnitVectors(up, d);
    const k = scaleFn ? scaleFn(i) : 1;
    m.compose(d.clone().multiplyScalar(r), q, s.set(k, k, k));
    im.setMatrixAt(i, m);
  });
  group.add(im);
  return im;
}

function bumpySphere(r, detail, amp, seed = 1) {
  const g = new THREE.IcosahedronGeometry(r, detail);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = Math.sin(v.x * 3.1 + seed) * Math.cos(v.y * 2.7 + seed * 2) * Math.sin(v.z * 3.3 + seed * 3);
    v.multiplyScalar(1 + n * amp);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export function buildPathogen(id) {
  const P = getPathogen(id);
  const g = new THREE.Group();
  const main = std(P.color), acc = std(P.accent, { roughness: 0.35 });
  switch (P.model) {
    case 'corona': {
      g.add(new THREE.Mesh(bumpySphere(1, 4, 0.03), main));
      const stalk = new THREE.CylinderGeometry(0.03, 0.05, 0.32, 6).translate(0, 0.16, 0);
      const head = new THREE.SphereGeometry(0.11, 10, 8).scale(1, 0.75, 1).translate(0, 0.36, 0);
      const dirs = fib(70);
      spikes(g, stalk, acc, 0.98, dirs);
      spikes(g, head, acc, 0.98, dirs);
      spikes(g, new THREE.SphereGeometry(0.05, 6, 5), std(0xfef3c7), 1.0, fib(40).map((d) => d.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.3)));
      break;
    }
    case 'paramyxo': {
      const body = new THREE.Mesh(bumpySphere(1, 4, 0.18, 2.3), main);
      body.scale.set(1.15, 0.9, 1);
      g.add(body);
      const dirs = fib(140);
      const rod = new THREE.CylinderGeometry(0.025, 0.025, 0.2, 5).translate(0, 0.1, 0);
      const imH = spikes(g, rod, acc, 0.95, dirs.filter((_, i) => i % 2 === 0));
      const imF = spikes(g, rod, std(0xfffbeb), 0.95, dirs.filter((_, i) => i % 2 === 1), () => 0.8);
      imH.scale.copy(body.scale); imF.scale.copy(body.scale);
      break;
    }
    case 'influenza': {
      g.add(new THREE.Mesh(bumpySphere(1, 4, 0.04, 5), main));
      const dirs = fib(160);
      const ha = new THREE.CylinderGeometry(0.03, 0.04, 0.3, 6).translate(0, 0.15, 0);
      const naStalk = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 5).translate(0, 0.125, 0);
      const naHead = new THREE.BoxGeometry(0.11, 0.06, 0.11).translate(0, 0.27, 0);
      const haDirs = dirs.filter((_, i) => i % 5 !== 0), naDirs = dirs.filter((_, i) => i % 5 === 0);
      spikes(g, ha, acc, 0.98, haDirs);
      spikes(g, naStalk, std(0xfef08a), 0.98, naDirs);
      spikes(g, naHead, std(0xfef08a), 0.98, naDirs);
      break;
    }
    case 'herpes': {
      const env = new THREE.Mesh(bumpySphere(1.1, 4, 0.05, 7), std(P.color, { transparent: true, opacity: 0.35, depthWrite: false }));
      g.add(env);
      const teg = new THREE.Mesh(new THREE.SphereGeometry(0.82, 24, 16), std(0xfbcfe8, { transparent: true, opacity: 0.25, depthWrite: false }));
      g.add(teg);
      const cap = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), std(P.accent, { flatShading: true, roughness: 0.3 }));
      g.add(cap);
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.61, 0)), new THREE.LineBasicMaterial({ color: 0xffffff })));
      spikes(g, new THREE.CylinderGeometry(0.02, 0.03, 0.18, 5).translate(0, 0.09, 0), std(0xede9fe), 1.08, fib(90));
      break;
    }
    case 'bacillus': {
      const rod = new THREE.CapsuleGeometry(0.28, 1.9, 8, 16);
      const wax = std(P.color, { roughness: 0.9 });
      for (const [x, y, z, rz, rx] of [[0, 0, 0, 0.25, 0], [0.5, 0.25, 0.2, 0.45, 0.3], [-0.45, -0.2, -0.15, 0.05, -0.2]]) {
        const m = new THREE.Mesh(rod, wax);
        m.position.set(x, y, z); m.rotation.set(rx, 0, rz);
        g.add(m);
      }
      spikes(g, new THREE.SphereGeometry(0.035, 5, 4), std(P.accent), 0.3, fib(60), () => 1);
      break;
    }
    case 'flavi': {
      const body = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), std(P.color, { flatShading: true, roughness: 0.35 }));
      g.add(body);
      // dímeros de proteína E: placas planas en "espina de pescado" sobre la superficie
      const plate = new THREE.BoxGeometry(0.34, 0.05, 0.1);
      const dirs = fib(90);
      const im = new THREE.InstancedMesh(plate, std(P.accent, { roughness: 0.4 }), dirs.length);
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
      dirs.forEach((d, i) => {
        q.setFromUnitVectors(up, d);
        q2.setFromAxisAngle(up, (i % 3) * (Math.PI / 3));
        q.multiply(q2);
        m.compose(d.clone().multiplyScalar(1.0), q, new THREE.Vector3(1, 1, 1));
        im.setMatrixAt(i, m);
      });
      g.add(im);
      break;
    }
    case 'plasmodium': {
      // glóbulo rojo bicóncavo (perfil por revolución) con un trofozoíto en "anillo" dentro
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const r = 1.4 * t;
        const h = 0.18 + 0.32 * Math.pow(t, 2) * (1 - Math.pow(t, 6));
        pts.push(new THREE.Vector2(r, h));
      }
      pts.push(new THREE.Vector2(1.42, 0));
      const top = new THREE.LatheGeometry(pts, 40);
      const rbcMat = std(0xdc2626, { roughness: 0.55, side: THREE.DoubleSide });
      const a = new THREE.Mesh(top, rbcMat);
      const b = new THREE.Mesh(top, rbcMat); b.scale.y = -1;
      const rbc = new THREE.Group(); rbc.add(a, b);
      rbc.rotation.x = 1.0;
      rbc.position.set(-0.4, -0.2, 0);
      g.add(rbc);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 10, 30), std(P.color));
      ring.position.set(0.25, 0.35, 0); rbc.add(ring);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), std(0x581c87)); dot.position.set(0.5, 0.36, 0.05); rbc.add(dot);
      // esporozoíto: cuerpo alargado y curvo
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.4, 0.9, 0.4), new THREE.Vector3(1.0, 1.3, 0.2), new THREE.Vector3(1.6, 1.2, -0.1), new THREE.Vector3(2.0, 0.7, -0.2)]);
      const spz = new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.09, 10), std(P.accent === 0xef4444 ? 0xc084fc : P.accent));
      g.add(spz);
      break;
    }
    case 'filo': {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.2, -1.2, 0), new THREE.Vector3(-1.4, 0.4, 0.2), new THREE.Vector3(-0.2, 1.0, 0), new THREE.Vector3(0.9, 0.7, -0.2),
        new THREE.Vector3(1.3, -0.2, 0), new THREE.Vector3(0.9, -0.9, 0.2), new THREE.Vector3(0.2, -0.7, 0.1)
      ]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.2, 14), main));
      const pts = curve.getSpacedPoints(160);
      const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 5, 4), acc, pts.length * 3);
      const m = new THREE.Matrix4();
      let k = 0;
      pts.forEach((p, i) => { for (let j = 0; j < 3; j++) { const a = j * 2.1 + i; m.makeTranslation(p.x + Math.cos(a) * 0.22, p.y + Math.sin(a) * 0.22, p.z + Math.sin(a + 1) * 0.22); im.setMatrixAt(k++, m); } });
      g.add(im);
      g.scale.setScalar(0.75);
      break;
    }
    case 'pox': {
      const box = new THREE.BoxGeometry(1.6, 2.0, 1.0, 10, 12, 6);
      const p = box.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) { // redondear el "ladrillo"
        v.fromBufferAttribute(p, i);
        const n = v.clone().normalize();
        v.lerp(n.multiplyScalar(v.length()), 0.35);
        p.setXYZ(i, v.x, v.y, v.z);
      }
      box.computeVertexNormals();
      g.add(new THREE.Mesh(box, std(P.color, { roughness: 0.6 })));
      for (let k = -4; k <= 4; k++) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.03, 6, 30, Math.PI), acc);
        t.position.set(0, k * 0.2, 0); t.rotation.set(Math.PI / 2, 0, (k % 2) * 0.4);
        t.scale.set(0.95, 0.62, 1);
        g.add(t);
      }
      break;
    }
    case 'rhabdo': {
      const body = new THREE.Group();
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.6, 24, 1, true), std(P.color, { side: THREE.DoubleSide }));
      const capTop = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(P.color));
      capTop.position.y = 0.8;
      const flat = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), std(P.color));
      flat.rotation.x = Math.PI / 2; flat.position.y = -0.8;
      body.add(cyl, capTop, flat);
      const dirs = [];
      for (let i = 0; i < 18; i++) for (let j = 0; j < 9; j++) {
        const a = (i / 18) * Math.PI * 2;
        dirs.push({ p: new THREE.Vector3(Math.cos(a) * 0.55, -0.7 + j * 0.18, Math.sin(a) * 0.55), d: new THREE.Vector3(Math.cos(a), 0, Math.sin(a)) });
      }
      const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.025, 0.03, 0.16, 5).translate(0, 0.08, 0), acc, dirs.length);
      const m = new THREE.Matrix4(), q = new THREE.Quaternion();
      dirs.forEach((o, i) => { q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), o.d); m.compose(o.p, q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, m); });
      body.add(im);
      body.rotation.z = 0.6;
      g.add(body);
      break;
    }
    case 'vibrio': {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-1.0, -0.3, 0), new THREE.Vector3(-0.3, 0.25, 0), new THREE.Vector3(0.5, 0.3, 0), new THREE.Vector3(1.0, -0.1, 0)]);
      const body = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.32, 16), main);
      g.add(body);
      for (const end of [curve.getPoint(0), curve.getPoint(1)]) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), main); c.position.copy(end); g.add(c);
      }
      // flagelo polar ondulante (se anima en tick)
      const fl = [];
      for (let i = 0; i <= 40; i++) fl.push(new THREE.Vector3(1.0 + i * 0.06, -0.1 + Math.sin(i * 0.5) * 0.15, Math.cos(i * 0.5) * 0.1));
      const flag = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fl), 60, 0.025, 6), acc);
      flag.userData.flagellum = true;
      g.add(flag);
      g.position.x = -0.4;
      break;
    }
    default: {
      g.add(new THREE.Mesh(bumpySphere(1, 3, 0.06, 9), main));
      spikes(g, new THREE.ConeGeometry(0.06, 0.25, 6).translate(0, 0.12, 0), acc, 0.98, fib(60));
    }
  }
  return g;
}

export class PathogenViewer {
  constructor(container) {
    this.container = container;
    this.ok = false;
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    } catch (e) { return; }
    this.ok = true;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.domElement.className = 'pathogen-canvas';
    if (container) container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 0.6, 6.2);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(new THREE.HemisphereLight(0xe0f2fe, 0x1e1b4b, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 4, 5); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x67e8f9, 1.8); rim.position.set(-4, -1, -3); this.scene.add(rim);
    this.current = null;
    this.drag = null;
    this.rotY = 0; this.rotX = 0.2;
    if (container) {
      container.addEventListener('pointerdown', (e) => { this.drag = { x: e.clientX, y: e.clientY }; container.setPointerCapture(e.pointerId); });
      container.addEventListener('pointermove', (e) => {
        if (!this.drag) return;
        this.rotY += (e.clientX - this.drag.x) * 0.01; this.rotX += (e.clientY - this.drag.y) * 0.01;
        this.drag = { x: e.clientX, y: e.clientY };
      });
      container.addEventListener('pointerup', () => { this.drag = null; });
      if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe(container);
    }
    this.loop = this.loop.bind(this);
  }

  resize() {
    if (!this.container) return;
    const w = this.container.clientWidth || 300, h = this.container.clientHeight || 300;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  show(id) {
    if (!this.ok) return;
    if (this.current) { this.scene.remove(this.current); this.dispose(this.current); }
    this.current = buildPathogen(id);
    this.scene.add(this.current);
    this.resize();
    if (!this.running) { this.running = true; requestAnimationFrame(this.loop); }
  }

  dispose(obj) {
    obj.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  }

  loop(t) {
    if (!this.running) return;
    const visible = this.container && this.container.offsetParent !== null;
    if (visible && this.current) {
      if (!this.drag) this.rotY += 0.006;
      this.current.rotation.set(this.rotX, this.rotY, 0);
      this.current.traverse((o) => {
        if (o.userData.flagellum) o.rotation.x = Math.sin(t * 0.008) * 0.3;
      });
      this.current.scale.setScalar(1 + Math.sin(t * 0.0015) * 0.015);
      this.renderer.render(this.scene, this.camera);
    }
    requestAnimationFrame(this.loop);
  }

  /** Miniaturas (dataURL) de todos los patógenos para las tarjetas. */
  thumbnails(ids, w = 220, h = 160) {
    if (!this.ok) return {};
    const out = {};
    const prevSize = new THREE.Vector2();
    this.renderer.getSize(prevSize);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    for (const id of ids) {
      const g = buildPathogen(id);
      g.rotation.set(0.35, 0.6, 0);
      this.scene.add(g);
      this.renderer.render(this.scene, this.camera);
      out[id] = this.renderer.domElement.toDataURL('image/png');
      this.scene.remove(g);
      this.dispose(g);
    }
    this.resize();
    return out;
  }
}
