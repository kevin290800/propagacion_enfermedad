/**
 * EpiDynamics 6.0 — Escenario 3D de la comunidad.
 *
 * Todo es procedural (geometría + texturas dibujadas en <canvas>): funciona sin conexión,
 * con doble clic y sin licencias de terceros. Incluye:
 *   viviendas con tejado a dos aguas, chimeneas, ventanas con marco y jardines; aceras con bordillo,
 *   pasos de cebra; plaza con fuente animada; mercado con toldos y frutas; escuela con patio de juegos;
 *   hospital con fachada, ambulancia y sala de camas; parque con estanque, flores y árboles variados;
 *   pozos; jardín memorial; vehículos que se detienen ante peatones; cielo, nubes y ciclo día/noche.
 *
 * Optimización: las mallas estáticas se fusionan por material (pocas llamadas de dibujo).
 * El tráfico, las nubes y la fuente son ambientación: NO influyen en el motor epidemiológico.
 */
import { WORLD, STREET_N, V_STREETS } from '../simulation/townMap.js';

const HOUSE_COLORS = [0xf3e3c3, 0xe9c9a1, 0xd6e4dc, 0xf6e7cf, 0xe6d3c9, 0xcfdcea, 0xf2d0cf, 0xdfe8c6, 0xf0dcb0, 0xd9d0ea];
const ROOF_COLORS = [0xb4532a, 0x9a3412, 0x7c2d12, 0x475569, 0x8b5e34];
const DOOR_COLORS = [0x5b3a1e, 0x1e3a8a, 0x14532d, 0x7f1d1d, 0x3f3f46];

function canvasTex(size, draw, repeat = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const x = c.getContext('2d');
  let s = 1234567;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  draw(x, size, rnd);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
const noise = (x, n, rnd, colors, count, rmax) => {
  for (let i = 0; i < count; i++) {
    x.fillStyle = colors[Math.floor(rnd() * colors.length)];
    const r = 1 + rnd() * rmax;
    x.fillRect(rnd() * n, rnd() * n, r, r);
  }
};
const lerpN = (a, b, k) => a + (b - a) * k;

export function makeLabelTexture(text, opts = {}) {
  const c = document.createElement('canvas');
  const fs = opts.fontSize || 44;
  const ctx = c.getContext('2d');
  ctx.font = `700 ${fs}px system-ui, Segoe UI, sans-serif`;
  const w = Math.ceil(ctx.measureText(text).width) + 40;
  c.width = w; c.height = fs + 30;
  ctx.font = `700 ${fs}px system-ui, Segoe UI, sans-serif`;
  ctx.fillStyle = opts.bg || 'rgba(15,23,42,0.78)';
  const r = 18;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r); ctx.lineTo(w, c.height - r);
  ctx.quadraticCurveTo(w, c.height, w - r, c.height); ctx.lineTo(r, c.height); ctx.quadraticCurveTo(0, c.height, 0, c.height - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.fill();
  ctx.fillStyle = opts.color || '#f8fafc';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 20, c.height / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, aspect: w / c.height };
}

export class CityRenderer {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.roofs = [];
    this.airPlanes = {};
    this.wellWater = [];
    this.matCache = new Map();
    this.labels = [];
    this.makeTextures();
    this.build();
  }

  makeTextures() {
    this.tex = {
      grass: canvasTex(256, (x, n, r) => {
        x.fillStyle = '#6f9e4c'; x.fillRect(0, 0, n, n);
        noise(x, n, r, ['#5f8f3f', '#7fb058', '#689a45', '#86b862', '#5a8a3a'], 2600, 3);
      }, 40),
      park: canvasTex(256, (x, n, r) => {
        x.fillStyle = '#5c9443'; x.fillRect(0, 0, n, n);
        noise(x, n, r, ['#4f8638', '#6aa64e', '#7cb85c', '#558c3d'], 2600, 3);
        noise(x, n, r, ['#fde68a', '#fca5a5', '#f9fafb'], 40, 2);
      }, 6),
      asphalt: canvasTex(256, (x, n, r) => {
        x.fillStyle = '#3f444c'; x.fillRect(0, 0, n, n);
        noise(x, n, r, ['#383c43', '#4a5059', '#454a52', '#33373d'], 5000, 2);
      }, 12),
      sidewalk: canvasTex(128, (x, n, r) => {
        x.fillStyle = '#c8c2b6'; x.fillRect(0, 0, n, n);
        noise(x, n, r, ['#bdb7aa', '#d2ccc0'], 600, 2);
        x.strokeStyle = '#a8a294'; x.lineWidth = 3;
        for (let i = 0; i <= n; i += n / 2) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, n); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(n, i); x.stroke(); }
      }, 1),
      paving: canvasTex(256, (x, n, r) => {
        x.fillStyle = '#d9cdb3'; x.fillRect(0, 0, n, n);
        const s = n / 8;
        for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
          x.fillStyle = (i + j) % 2 ? '#e3d8c0' : '#cfc1a3';
          x.fillRect(i * s + 1, j * s + 1, s - 2, s - 2);
        }
        noise(x, n, r, ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.08)'], 900, 3);
      }, 5),
      roof: canvasTex(128, (x, n) => {
        x.fillStyle = '#ffffff'; x.fillRect(0, 0, n, n);
        for (let y = 0; y < n; y += 16) {
          x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(0, y + 12, n, 4);
          for (let xx = (y / 16) % 2 ? 8 : 0; xx < n; xx += 16) { x.fillStyle = 'rgba(0,0,0,0.08)'; x.fillRect(xx, y, 2, 14); }
        }
      }, 2),
      plaster: canvasTex(128, (x, n, r) => {
        x.fillStyle = '#ffffff'; x.fillRect(0, 0, n, n);
        noise(x, n, r, ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.07)', 'rgba(255,255,255,0.5)'], 1400, 2);
      }, 2),
      brick: canvasTex(128, (x, n, r) => {
        x.fillStyle = '#e8dccb'; x.fillRect(0, 0, n, n);
        for (let y = 0; y < n; y += 16) for (let xx = (y / 16) % 2 ? -16 : 0; xx < n; xx += 32) {
          x.fillStyle = `rgb(${200 + r() * 30},${120 + r() * 30},${90 + r() * 20})`;
          x.fillRect(xx + 1, y + 1, 30, 14);
        }
      }, 3),
      tiles: canvasTex(128, (x, n) => {
        x.fillStyle = '#eef2f7'; x.fillRect(0, 0, n, n);
        x.strokeStyle = '#cbd5e1'; x.lineWidth = 2;
        for (let i = 0; i <= n; i += n / 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, n); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(n, i); x.stroke(); }
      }, 8),
      awning: canvasTex(64, (x, n) => {
        for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#bbbbbb'; x.fillRect(i * 8, 0, 8, n); }
      }, 1),
      water: canvasTex(128, (x, n, r) => {
        x.fillStyle = '#ffffff'; x.fillRect(0, 0, n, n);
        x.strokeStyle = 'rgba(0,0,0,0.08)'; x.lineWidth = 2;
        for (let i = 0; i < 30; i++) { x.beginPath(); x.arc(r() * n, r() * n, 4 + r() * 10, 0, Math.PI); x.stroke(); }
      }, 2)
    };
    this.tex.paving.repeat.set(4, 6);
  }

  /** Materiales compartidos (permiten fusionar geometría por material). */
  mat(color, opts = {}) {
    const { rough, map, ...rest } = opts;
    const key = JSON.stringify([color, rough, map ? map.uuid : null, rest]);
    if (this.matCache.has(key)) return this.matCache.get(key);
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough ?? 0.85, metalness: 0, map: map || null, ...rest });
    this.matCache.set(key, m);
    return m;
  }

  box(w, h, d, color, x, y, z, opts = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), opts.material || this.mat(color, opts.matOpts));
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  cyl(rt, rb, h, color, x, y, z, opts = {}) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, opts.seg || 14), opts.material || this.mat(color, opts.matOpts));
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  plane(w, d, color, x, y, z, opts = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), opts.material || this.mat(color, opts.matOpts));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  label(text, x, y, z, scale = 3.2, opts) {
    const { tex, aspect } = makeLabelTexture(text, opts);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true }));
    s.scale.set(scale * aspect * 0.5, scale * 0.5, 1);
    s.position.set(x, y, z);
    s.renderOrder = 5;
    this.group.add(s);
    this.labels.push(s);
    return s;
  }

  build() {
    const groundTex = this.tex.grass.clone();
    groundTex.repeat.set(60, 50);
    groundTex.needsUpdate = true;
    this.plane(WORLD.x1 - WORLD.x0 + 200, WORLD.z1 - WORLD.z0 + 200, 0xffffff, 0, 0, 0, { matOpts: { map: groundTex } });
    this.buildStreets();
    this.buildPlaza();
    this.buildMarket();
    this.buildSchool();
    this.buildHospital();
    this.buildPark();
    this.buildHouses();
    this.buildWells();
    this.buildMemorial();
    this.buildTrees();
    this.buildLamps();
    this.buildAirPlanes();
    this.buildBreedingSites();
    this.buildSky();
    this.buildTraffic();
    for (const r of this.roofs) r.userData.dynamic = true;
    for (const w of this.wellWater) if (w) w.userData.dynamic = true;
    for (const k in this.airPlanes) this.airPlanes[k].userData.dynamic = true;
    this.mergeStatic();
  }

  buildStreets() {
    const asphalt = this.mat(0xffffff, { map: this.tex.asphalt, rough: 0.95 });
    const walk = this.mat(0xffffff, { map: this.tex.sidewalk, rough: 0.95 });
    const curb = this.mat(0xa8a29e, { rough: 0.9 });
    const W = WORLD.x1 - WORLD.x0 + 40;
    for (const z of [STREET_N, -STREET_N]) {
      this.plane(W, 4.6, 0, 0, 0.03, z, { material: asphalt });
      for (const s of [-1, 1]) {
        const b = this.box(W, 0.16, 1.4, 0, 0, 0.08, z + s * 3.0, { material: walk, cast: false });
        const uv = b.geometry.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * W / 1.4);
        this.box(W, 0.18, 0.12, 0, 0, 0.09, z + s * 2.3, { material: curb, cast: false });
      }
    }
    for (const x of V_STREETS) {
      this.plane(3.2, STREET_N * 2 - 6.2, 0, x, 0.03, 0, { material: asphalt });
      for (const s of [-1, 1]) this.box(0.9, 0.16, STREET_N * 2 - 6.2, 0, x + s * 2.05, 0.08, 0, { material: walk, cast: false });
    }
    const white = this.mat(0xf8fafc, { rough: 0.6 });
    const yellow = this.mat(0xfacc15, { rough: 0.6 });
    for (const z of [STREET_N, -STREET_N]) for (let x = WORLD.x0 - 10; x < WORLD.x1 + 10; x += 6) this.plane(2.4, 0.16, 0, x, 0.045, z, { material: yellow });
    const crossX = [...V_STREETS, -24, 0, 24, 50];
    for (const z of [STREET_N, -STREET_N]) for (const x of crossX) for (let k = -1.6; k <= 1.6; k += 0.8) this.plane(0.45, 4.2, 0, x + k, 0.05, z, { material: white });
  }

  buildPlaza() {
    const r = this.town.places.plaza.rect;
    this.plane(r.w + 1, r.d + 1, 0xffffff, r.cx, 0.05, r.cz, { matOpts: { map: this.tex.paving } });
    const stone = this.mat(0xe2e8f0, { map: this.tex.plaster, rough: 0.7 });
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.7, 0.7, 32), stone);
    basin.position.set(0, 0.35, 0); basin.castShadow = true; basin.receiveShadow = true;
    this.group.add(basin);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.15, map: this.tex.water, emissive: 0x0c4a6e, emissiveIntensity: 0.25 });
    const water = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.08, 32), waterMat);
    water.position.set(0, 0.68, 0);
    this.group.add(water);
    this.wellWater[0] = water;
    const tier = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.4, 0.35, 24), stone);
    tier.position.set(0, 1.65, 0); tier.castShadow = true;
    this.group.add(tier);
    this.cyl(0.2, 0.3, 1.5, 0, 0, 1.0, 0, { material: stone });
    this.jet = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 0.9, 10), new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.7, roughness: 0.1 }));
    this.jet.position.set(0, 2.2, 0);
    this.jet.userData.dynamic = true;
    this.group.add(this.jet);
    const wood = this.mat(0x8b5a2b, { rough: 0.8 });
    const metal = this.mat(0x334155, { rough: 0.5 });
    for (const [x, z, ry] of [[-6.5, -6.5, Math.PI / 4], [6.5, -6.5, -Math.PI / 4], [-6.5, 6.5, -Math.PI / 4 + Math.PI], [6.5, 6.5, Math.PI / 4 + Math.PI], [0, -9, 0], [0, 9, Math.PI]]) {
      this.bench(x, z, ry, wood, metal);
    }
    const planter = this.mat(0x9ca3af, { rough: 0.8 });
    for (const [x, z] of [[-7.5, 0], [7.5, 0], [0, -4.5], [0, 4.5]]) {
      this.box(1.4, 0.5, 1.4, 0, x, 0.25, z, { material: planter });
      this.flowerBush(x, 0.65, z, 0.6);
    }
    this.label('Plaza central', 0, 6.5, -2);
  }

  bench(x, z, ry, wood, metal) {
    const grp = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.5), wood); seat.position.y = 0.45;
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.07), wood); back.position.set(0, 0.72, -0.22); back.rotation.x = -0.15;
    const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.45), metal); l1.position.set(-0.8, 0.22, 0);
    const l2 = l1.clone(); l2.position.x = 0.8;
    grp.add(seat, back, l1, l2);
    grp.position.set(x, 0, z); grp.rotation.y = ry;
    grp.updateMatrix();
    for (const c of [...grp.children]) {
      c.updateMatrix();
      c.matrix.premultiply(grp.matrix);
      c.matrix.decompose(c.position, c.quaternion, c.scale);
      c.castShadow = true; c.receiveShadow = true;
      this.group.add(c);
    }
  }

  flowerBush(x, y, z, r) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), this.mat(0x3f7d2c, { flatShading: true }));
    b.position.set(x, y, z); b.castShadow = true;
    this.group.add(b);
    const cols = [0xf472b6, 0xfacc15, 0xf87171, 0xffffff, 0xa78bfa];
    for (let k = 0; k < 5; k++) {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), this.mat(cols[(k + Math.abs(Math.round(x))) % cols.length]));
      const a = (k / 5) * Math.PI * 2;
      f.position.set(x + Math.cos(a) * r * 0.7, y + r * 0.55, z + Math.sin(a) * r * 0.7);
      this.group.add(f);
    }
  }

  buildMarket() {
    const r = this.town.places.market.rect;
    this.plane(r.w + 1, r.d + 1, 0xffffff, r.cx, 0.05, r.cz, { matOpts: { map: this.tex.paving } });
    const post = this.mat(0x57534e, { rough: 0.6 });
    for (let x = r.x0 + 0.5; x <= r.x1 - 0.4; x += (r.w - 1) / 3) for (const z of [r.z0 + 0.5, r.z1 - 0.5]) this.box(0.3, 4, 0.3, 0, x, 2, z, { material: post });
    const roof = this.box(r.w + 1, 0.2, r.d + 1, 0xb45309, r.cx, 4.1, r.cz, { cast: false, matOpts: { transparent: true, opacity: 0.28, depthWrite: false } });
    this.roofs.push(roof);
    const colors = [0xef4444, 0xf59e0b, 0x22c55e, 0x3b82f6, 0xa855f7, 0xec4899];
    const fruit = [0xef4444, 0xf97316, 0xfacc15, 0x84cc16, 0x7c3aed];
    const woodM = this.mat(0x92400e, { rough: 0.8 });
    let k = 0;
    for (let x = r.x0 + 3; x < r.x1 - 2; x += 5) {
      for (const z of [-10, -3, 4, 11]) {
        this.box(2.4, 0.85, 1.1, 0, x, 0.43, z, { material: woodM });
        for (const dx of [-1.1, 1.1]) this.box(0.08, 2.2, 0.08, 0, x + dx, 1.1, z - 0.5, { material: post });
        const aw = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.06, 1.7), this.mat(colors[k % colors.length], { map: this.tex.awning }));
        aw.position.set(x, 2.15, z - 0.05); aw.rotation.x = 0.18; aw.castShadow = true;
        this.group.add(aw);
        for (let q = 0; q < 6; q++) {
          const f = new THREE.Mesh(new THREE.SphereGeometry(0.1, 7, 6), this.mat(fruit[(q + k) % fruit.length], { rough: 0.5 }));
          f.position.set(x - 0.9 + (q % 3) * 0.35 + (q > 2 ? 0.9 : 0), 0.95, z - 0.2 + (q % 2) * 0.25);
          this.group.add(f);
        }
        k++;
      }
    }
    this.label('Mercado', r.cx, 6.8, r.cz);
  }

  buildSchool() {
    const r = this.town.places.school.rect;
    this.plane(r.w + 1, r.d + 1, 0xffffff, r.cx, 0.05, r.cz, { matOpts: { map: this.tex.tiles } });
    this.walls(r, 2.6, this.mat(0xffffff, { map: this.tex.brick }), 2.4);
    const woodM = this.mat(0x92400e);
    for (let x = r.x0 + 3; x < r.x1 - 2; x += 3.2) for (let z = r.z0 + 4; z < r.z1 - 9; z += 4.5) this.box(1.4, 0.75, 0.7, 0, x, 0.38, z, { material: woodM });
    this.box(5, 1.6, 0.1, 0x14532d, r.cx, 1.5, r.z0 + 0.4, { matOpts: { rough: 0.4 } });
    const red = this.mat(0xdc2626, { rough: 0.5 }), blue = this.mat(0x2563eb, { rough: 0.5 }), yel = this.mat(0xfacc15, { rough: 0.5 });
    const px = r.x0 + 5, pz = r.z1 - 5;
    for (const [dx, dz] of [[-1.2, -0.6], [1.2, -0.6], [-1.2, 0.6], [1.2, 0.6]]) this.box(0.1, 2.2, 0.1, 0, px + dx, 1.1, pz + dz, { material: blue });
    this.box(2.6, 0.1, 0.1, 0, px, 2.2, pz, { material: blue });
    this.box(0.6, 0.06, 0.3, 0, px - 0.5, 0.6, pz, { material: yel }); this.box(0.6, 0.06, 0.3, 0, px + 0.5, 0.6, pz, { material: yel });
    const slide = this.box(0.8, 0.08, 3.2, 0, r.x1 - 5, 1.0, pz, { material: red });
    slide.rotation.x = 0.55;
    this.box(0.9, 1.9, 0.9, 0, r.x1 - 5, 0.95, pz - 1.8, { material: yel });
    this.cyl(0.05, 0.06, 6, 0xd1d5db, r.x0 + 1.5, 3, r.z0 + 1.5, { matOpts: { rough: 0.3 } });
    this.box(1.6, 0.9, 0.04, 0x2563eb, r.x0 + 2.35, 5.4, r.z0 + 1.5);
    const roof = this.box(r.w + 1.2, 0.3, r.d + 1.2, 0xb45309, r.cx, 2.75, r.cz, { cast: false, matOpts: { transparent: true, opacity: 0.25, depthWrite: false } });
    this.roofs.push(roof);
    this.label('Escuela', r.cx, 6.5, r.cz);
  }

  buildHospital() {
    const r = this.town.places.hospital.rect;
    this.plane(r.w + 1, r.d + 1, 0xffffff, r.cx, 0.05, r.cz, { matOpts: { map: this.tex.tiles } });
    const white = this.mat(0xffffff, { map: this.tex.plaster, rough: 0.7 });
    this.walls(r, 1.3, white, 2.4);
    const bx = r.x1 - 2.6, bz = -11.5;
    this.box(5.2, 6.4, 8, 0, bx, 3.2, bz, { material: white });
    const glass = this.mat(0x7dd3fc, { rough: 0.15, metalness: 0.3 });
    for (const y of [1.8, 4.4]) for (const dz of [-2.5, 0, 2.5]) this.box(0.08, 1.1, 1.5, 0, bx - 2.62, y, bz + dz, { material: glass, cast: false });
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xdc2626, emissiveIntensity: 0.5 });
    this.box(0.2, 2.2, 0.7, 0, bx - 2.7, 5.4, bz + 3.2, { material: crossMat });
    this.box(0.2, 0.7, 2.2, 0, bx - 2.7, 5.4, bz + 3.2, { material: crossMat });
    this.box(3, 0.15, 3, 0xe5e7eb, bx - 3.5, 2.6, bz + 5.5);
    for (const dz of [-1.3, 1.3]) this.cyl(0.08, 0.08, 2.6, 0x94a3b8, bx - 4.8, 1.3, bz + 5.5 + dz);
    this.label('Hospital', r.cx, 8.2, r.cz);
    this.bedMesh = null;
  }

  setHospitalBeds(beds) {
    for (const k of ['bedMesh', 'ivMesh', 'pillowMesh']) if (this[k]) { this.group.remove(this[k]); this[k].geometry.dispose(); }
    const n = Math.max(1, beds.length);
    const mk = (geo, mat) => { const m = new THREE.InstancedMesh(geo, mat, n); m.count = beds.length; m.castShadow = true; m.receiveShadow = true; this.group.add(m); return m; };
    this.bedMesh = mk(new THREE.BoxGeometry(1.0, 0.5, 2.2), this.mat(0xe0f2fe));
    this.pillowMesh = mk(new THREE.BoxGeometry(0.7, 0.12, 0.35), this.mat(0xffffff));
    this.ivMesh = mk(new THREE.CylinderGeometry(0.025, 0.025, 1.8, 6), this.mat(0x94a3b8, { rough: 0.3 }));
    const mtx = new THREE.Matrix4();
    beds.forEach((b, i) => {
      mtx.makeTranslation(b.x, 0.3, b.z); this.bedMesh.setMatrixAt(i, mtx);
      mtx.makeTranslation(b.x, 0.6, b.z - 0.85); this.pillowMesh.setMatrixAt(i, mtx);
      mtx.makeTranslation(b.x + 0.75, 0.9, b.z - 0.8); this.ivMesh.setMatrixAt(i, mtx);
    });
  }

  buildPark() {
    const r = this.town.places.park.rect;
    this.plane(r.w + 1, r.d + 1, 0xffffff, r.cx, 0.04, r.cz, { matOpts: { map: this.tex.park } });
    this.plane(1.8, r.d, 0xd6c49b, -44, 0.05, 0, { matOpts: { rough: 1 } });
    const pond = new THREE.Mesh(new THREE.CircleGeometry(5, 40),
      new THREE.MeshStandardMaterial({ color: 0x2f6f73, roughness: 0.1, metalness: 0.2, map: this.tex.water, emissive: 0x0b3b3d, emissiveIntensity: 0.3 }));
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(-50, 0.07, -4);
    pond.userData.dynamic = true;
    this.group.add(pond);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(5.05, 0.18, 6, 40), this.mat(0x9ca3af));
    rim.rotation.x = Math.PI / 2; rim.position.set(-50, 0.08, -4);
    this.group.add(rim);
    const lilyM = this.mat(0x4d7c0f);
    for (let k = 0; k < 7; k++) {
      const lily = new THREE.Mesh(new THREE.CircleGeometry(0.35, 10), lilyM);
      lily.rotation.x = -Math.PI / 2;
      lily.position.set(-50 + Math.cos(k * 1.9) * 3, 0.09, -4 + Math.sin(k * 1.9) * 3);
      this.group.add(lily);
    }
    const wood = this.mat(0x8b5a2b, { rough: 0.8 }), metal = this.mat(0x334155, { rough: 0.5 });
    for (const [x, z, ry] of [[-44, -12, 0], [-56, 10, Math.PI], [-41, 6, -Math.PI / 2]]) this.bench(x, z, ry, wood, metal);
    for (const [x, z] of [[-58, -12], [-40, -13], [-58, 4], [-46, 12]]) this.flowerBush(x, 0.35, z, 0.55);
    this.label('Parque', r.cx, 6.5, r.cz + 6);
  }

  walls(r, h, mat, doorW) {
    const t = 0.3;
    for (const z of [r.z0, r.z1]) {
      const seg = (r.w - doorW) / 2;
      this.box(seg, h, t, 0, r.x0 + seg / 2, h / 2, z, { material: mat });
      this.box(seg, h, t, 0, r.x1 - seg / 2, h / 2, z, { material: mat });
    }
    for (const x of [r.x0, r.x1]) this.box(t, h, r.d, 0, x, h / 2, r.cz, { material: mat });
  }

  /** Tejado a dos aguas (prisma) con alero; la cumbrera es paralela a la calle (eje x). */
  gableGeometry(w, d, h) {
    const shape = new THREE.Shape();
    shape.moveTo(-d / 2, 0); shape.lineTo(d / 2, 0); shape.lineTo(0, h); shape.lineTo(-d / 2, 0);
    const g = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    g.translate(-w / 2, 0, 0);
    g.computeVertexNormals();
    return g;
  }

  buildHouses() {
    this.windowMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, emissive: 0xfcd34d, emissiveIntensity: 0, roughness: 0.2, metalness: 0.2 });
    const frame = this.mat(0xf8fafc, { rough: 0.5 });
    const bedMat = this.mat(0xdbeafe);
    const floor = this.mat(0xa8896b, { rough: 0.9 });
    const fence = this.mat(0xf5f5f4, { rough: 0.7 });
    const chimney = this.mat(0x9a3412, { map: this.tex.brick });
    const roofGeo = this.gableGeometry(7.2, 7.2, 2.3);
    for (const h of this.town.houses) {
      const r = h.rect;
      const mat = this.mat(HOUSE_COLORS[h.index % HOUSE_COLORS.length], { map: this.tex.plaster });
      const H = 2.7;
      const sgn = r.cz > 0 ? 1 : -1;
      const front = sgn > 0 ? r.z0 : r.z1;
      const back = sgn > 0 ? r.z1 : r.z0;
      this.box(2.3, H, 0.25, 0, r.x0 + 1.15, H / 2, front, { material: mat });
      this.box(2.3, H, 0.25, 0, r.x1 - 1.15, H / 2, front, { material: mat });
      this.box(1.4, 0.6, 0.25, 0, r.cx, H - 0.3, front, { material: mat });
      this.box(r.w, H, 0.25, 0, r.cx, H / 2, back, { material: mat });
      this.box(0.25, H, r.d, 0, r.x0, H / 2, r.cz, { material: mat });
      this.box(0.25, H, r.d, 0, r.x1, H / 2, r.cz, { material: mat });
      this.box(1.0, 2.0, 0.08, 0, r.cx, 1.0, front - sgn * 0.09, { material: this.mat(DOOR_COLORS[h.index % DOOR_COLORS.length], { rough: 0.6 }), cast: false });
      this.box(1.25, 2.15, 0.06, 0, r.cx, 1.07, front - sgn * 0.04, { material: frame, cast: false });
      for (const wx of [r.x0 + 1.3, r.x1 - 1.3]) {
        this.box(1.15, 0.95, 0.06, 0, wx, 1.6, front - sgn * 0.16, { material: frame, cast: false });
        this.box(1.0, 0.8, 0.08, 0, wx, 1.6, front - sgn * 0.17, { material: this.windowMat, cast: false });
        this.box(1.2, 0.1, 0.25, 0, wx, 1.12, front - sgn * 0.22, { material: frame, cast: false });
      }
      for (const sx of [r.x0 - 0.02, r.x1 + 0.02]) this.box(0.08, 0.8, 1.0, 0, sx, 1.6, r.cz, { material: this.windowMat, cast: false });
      this.plane(r.w - 0.3, r.d - 0.3, 0, r.cx, 0.06, r.cz, { material: floor });
      this.box(2.4, 0.45, 1.1, 0, h.bed.x - 1.0, 0.23, h.bed.z, { material: bedMat });
      if (Math.abs(front) < 22) {
        const fz = front - sgn * 1.4;
        this.box(2.2, 0.5, 0.06, 0, r.x0 + 1.1, 0.25, fz, { material: fence, cast: false });
        this.box(2.2, 0.5, 0.06, 0, r.x1 - 1.1, 0.25, fz, { material: fence, cast: false });
        if (h.index % 2 === 0) this.flowerBush(r.x0 + 1.0, 0.3, front - sgn * 0.7, 0.4);
      }
      const roof = new THREE.Mesh(roofGeo, this.mat(ROOF_COLORS[h.index % ROOF_COLORS.length], { map: this.tex.roof, rough: 0.75 }));
      roof.position.set(r.cx, H, r.cz);
      roof.castShadow = true;
      roof.userData.houseKey = h.key;
      this.group.add(roof);
      this.roofs.push(roof);
      if (h.index % 3 === 0) {
        const ch = this.box(0.5, 1.4, 0.5, 0, r.x1 - 1.2, H + 1.6, r.cz + sgn * 1.2, { material: chimney });
        ch.userData.houseKey = h.key;
        this.roofs.push(ch);
      }
    }
  }

  buildWells() {
    const stone = new THREE.MeshStandardMaterial({ color: 0x9ca3af, map: this.tex.brick, roughness: 0.9, side: THREE.DoubleSide });
    const wood = this.mat(0x78350f);
    const roofM = this.mat(0x7c2d12);
    for (const s of this.town.waterSources) {
      if (s.id === 0) continue;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.9, 20, 1, true), stone);
      ring.position.set(s.x, 0.45, s.z); ring.castShadow = true;
      this.group.add(ring);
      const water = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, map: this.tex.water, emissive: 0x0c4a6e, emissiveIntensity: 0.25 }));
      water.rotation.x = -Math.PI / 2;
      water.position.set(s.x, 0.6, s.z);
      this.group.add(water);
      this.wellWater[s.id] = water;
      for (const dx of [-0.9, 0.9]) this.box(0.12, 2.0, 0.12, 0, s.x + dx, 1.0, s.z, { material: wood });
      const r1 = this.box(2.4, 0.08, 0.9, 0, s.x, 2.2, s.z + 0.32, { material: roofM }); r1.rotation.x = 0.5;
      const r2 = this.box(2.4, 0.08, 0.9, 0, s.x, 2.2, s.z - 0.32, { material: roofM }); r2.rotation.x = -0.5;
      this.cyl(0.05, 0.05, 1.8, 0, s.x, 1.5, s.z, { material: wood }).rotation.z = Math.PI / 2;
      this.label(s.name, s.x, 3.4, s.z, 2.2);
    }
  }

  setWaterContamination(levels) {
    const clean = new THREE.Color(0x38bdf8), dirty = new THREE.Color(0x7c6f2a);
    levels.forEach((lv, i) => {
      const w = this.wellWater[i];
      if (!w) return;
      w.material.color.copy(clean).lerp(dirty, Math.min(1, lv));
      w.material.emissive.set(lv > 0.05 ? 0x3f3a10 : 0x0c4a6e);
    });
  }

  buildMemorial() {
    const r = this.town.memorial;
    this.plane(r.w, r.d, 0xffffff, r.cx, 0.05, r.cz, { matOpts: { map: this.tex.park } });
    const hedge = this.mat(0x2f5d2a, { flatShading: true });
    this.box(r.w, 0.8, 0.5, 0, r.cx, 0.4, r.z0, { material: hedge });
    this.box(r.w, 0.8, 0.5, 0, r.cx, 0.4, r.z1, { material: hedge });
    this.box(0.5, 0.8, r.d, 0, r.x0, 0.4, r.cz, { material: hedge });
    this.box(0.5, 0.8, r.d, 0, r.x1, 0.4, r.cz, { material: hedge });
    this.label('Jardín memorial', r.cx, 3.2, r.cz, 2.4, { bg: 'rgba(30,41,59,0.7)', color: '#e2e8f0' });
    const g = new THREE.CapsuleGeometry(0.25, 0.4, 4, 10).scale(1, 1, 0.35).translate(0, 0.4, 0);
    this.stones = new THREE.InstancedMesh(g, this.mat(0xd6d3d1, { rough: 0.6 }), 400);
    this.stones.count = 0;
    this.stones.castShadow = true;
    this.group.add(this.stones);
    this.flowers = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 6), this.mat(0xfde68a, { emissive: 0x854d0e, emissiveIntensity: 0.2 }), 400);
    this.flowers.count = 0;
    this.group.add(this.flowers);
  }

  setMemorialCount(n) {
    n = Math.min(400, n);
    if (n === this.stones.count) return;
    const m = new THREE.Matrix4();
    for (let i = this.stones.count; i < n; i++) {
      const p = this.town.memorialSlot(i);
      m.makeTranslation(p.x, 0.05, p.z); this.stones.setMatrixAt(i, m);
      m.makeTranslation(p.x + 0.2, 0.12, p.z + 0.25); this.flowers.setMatrixAt(i, m);
    }
    this.stones.count = n; this.flowers.count = n;
    this.stones.instanceMatrix.needsUpdate = true;
    this.flowers.instanceMatrix.needsUpdate = true;
  }

  buildTrees() {
    const round = [], pine = [];
    let s = 99;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 30; i++) {
      const x = -61 + rnd() * 21, z = -14 + rnd() * 28;
      if (Math.hypot(x + 50, z + 4) > 7 && Math.abs(x + 44) > 1.5) (rnd() < 0.35 ? pine : round).push([x, z, 0.8 + rnd() * 0.6]);
    }
    for (let x = -60; x <= 60; x += 12) for (const z of [14.6, -14.6]) if (Math.abs(x) > 12 && (x < 36 || x > 38)) round.push([x + 2, z, 0.7]);
    for (let x = -58; x <= 58; x += 16) for (const z of [41.5, -41.5]) if (!(z > 0 && x > 45)) round.push([x, z, 0.8 + rnd() * 0.4]);
    for (let k = 0; k < 46; k++) {
      const a = rnd() * Math.PI * 2, d = 85 + rnd() * 30;
      pine.push([Math.cos(a) * d * 1.1, Math.sin(a) * d * 0.75, 1 + rnd() * 0.8]);
    }
    pine.push([52, 37.5, 1.1], [60, 37.5, 1.0]);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), p = new THREE.Vector3();
    const mk = (geo, mat, list, fn) => {
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach((t, i) => { fn(t, m); im.setMatrixAt(i, m); });
      im.castShadow = true; im.receiveShadow = true;
      this.group.add(im);
    };
    const all = [...round, ...pine];
    mk(new THREE.CylinderGeometry(0.18, 0.26, 2, 7), this.mat(0x6b4423), all, ([x, z, k], mm) => mm.compose(p.set(x, k, z), q, sv.set(k, k, k)));
    mk(new THREE.IcosahedronGeometry(1.5, 1), this.mat(0x4a8a32, { flatShading: true }), round, ([x, z, k], mm) => mm.compose(p.set(x, 2.6 * k, z), q, sv.set(k * 1.15, k * 1.05, k * 1.15)));
    mk(new THREE.IcosahedronGeometry(1.0, 1), this.mat(0x5ea33d, { flatShading: true }), round, ([x, z, k], mm) => mm.compose(p.set(x + 0.5 * k, 3.3 * k, z - 0.3 * k), q, sv.set(k, k, k)));
    mk(new THREE.ConeGeometry(1.4, 3.6, 8), this.mat(0x2f6b3a, { flatShading: true }), pine, ([x, z, k], mm) => mm.compose(p.set(x, 3.2 * k, z), q, sv.set(k, k, k)));
  }

  buildLamps() {
    this.bulbMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xfde68a, emissiveIntensity: 0 });
    const pts = [];
    for (let x = -56; x <= 56; x += 14) for (const z of [STREET_N + 3.2, -STREET_N - 3.2]) pts.push([x, z]);
    const dark = this.mat(0x334155);
    const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.09, 4, 6), dark, pts.length);
    const arms = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.06, 0.8), dark, pts.length);
    const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.26, 10, 8), this.bulbMat, pts.length);
    const m = new THREE.Matrix4();
    pts.forEach(([x, z], i) => {
      const dz = z > 0 ? -0.4 : 0.4;
      m.makeTranslation(x, 2, z); poles.setMatrixAt(i, m);
      m.makeTranslation(x, 4.0, z + dz); arms.setMatrixAt(i, m);
      m.makeTranslation(x, 3.85, z + dz * 2); bulbs.setMatrixAt(i, m);
    });
    poles.castShadow = true;
    this.group.add(poles, arms, bulbs);
  }

  buildAirPlanes() {
    const g = new THREE.PlaneGeometry(1, 1);
    g.rotateX(-Math.PI / 2);
    for (const key in this.town.places) {
      const p = this.town.places[key];
      if (!p.indoor) continue;
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0, depthWrite: false }));
      m.scale.set(p.rect.w - 0.4, 1, p.rect.d - 0.4);
      m.position.set(p.rect.cx, 1.2, p.rect.cz);
      m.visible = false;
      m.renderOrder = 2;
      this.group.add(m);
      this.airPlanes[key] = m;
    }
  }

  setAirLoad(load, enabled) {
    for (const key in this.airPlanes) {
      const m = this.airPlanes[key];
      const e = enabled && load ? (load[key] || 0) : 0;
      const p = this.town.places[key];
      const o = Math.min(0.3, e * p.airFactor * 0.18);
      m.visible = o > 0.01;
      m.material.opacity = o;
    }
  }

  buildBreedingSites() {
    this.breeding = new THREE.Group();
    for (const s of this.town.breedingSites) {
      if (s.r > 3) continue;
      const m = new THREE.Mesh(new THREE.CircleGeometry(s.r, 16), new THREE.MeshStandardMaterial({ color: 0x3f5f4a, roughness: 0.2 }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(s.x, 0.08, s.z);
      this.breeding.add(m);
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.14, 8, 16), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 }));
      tire.rotation.x = Math.PI / 2; tire.position.set(s.x + s.r + 0.3, 0.14, s.z);
      this.breeding.add(tire);
    }
    this.breedingLabel = this.label('Criadero (agua estancada)', -50, 2.6, -4, 2.0, { bg: 'rgba(63,95,74,0.85)' });
    this.breedingLabel.userData.dynamic = true;
    this.breedingLabel.visible = false;
    this.breeding.visible = false;
    this.scene.add(this.breeding);
  }

  setMechanism(mech) {
    this.breeding.visible = mech === 'vector';
    this.breedingLabel.visible = mech === 'vector';
  }

  setRoofsVisible(v, exceptKey) {
    for (const r of this.roofs) r.visible = v && !(exceptKey && r.userData.houseKey === exceptKey);
  }

  setLabelsVisible(v) {
    for (const l of this.labels) if (l !== this.breedingLabel) l.visible = v;
  }

  buildSky() {
    const g = new THREE.SphereGeometry(420, 32, 16);
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    this.sky = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    this.sky.renderOrder = -1;
    this.scene.add(this.sky);
    this.clouds = new THREE.Group();
    this.cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true, transparent: true, opacity: 0.92 });
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 9; k++) {
      const c = new THREE.Group();
      for (let q = 0; q < 5; q++) {
        const b = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + rnd() * 3, 1), this.cloudMat);
        b.position.set(q * 3.5 - 7, rnd() * 1.5, rnd() * 3);
        b.scale.y = 0.55;
        c.add(b);
      }
      c.position.set(-150 + rnd() * 300, 55 + rnd() * 25, -120 + rnd() * 200);
      c.userData.speed = 1 + rnd() * 2;
      this.clouds.add(c);
    }
    this.scene.add(this.clouds);
  }

  paintSky(top, horizon) {
    const pos = this.sky.geometry.attributes.position, col = this.sky.geometry.attributes.color;
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const k = Math.max(0, Math.min(1, (pos.getY(i) / 420) * 1.6));
      c.copy(horizon).lerp(top, k);
      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  }

  buildTraffic() {
    const n = 9;
    const bodyG = new THREE.BoxGeometry(1.8, 0.7, 3.8).translate(0, 0.65, 0);
    const cabG = new THREE.BoxGeometry(1.6, 0.6, 2.0).translate(0, 1.25, -0.2);
    const wheelG = new THREE.CylinderGeometry(0.34, 0.34, 0.25, 12).rotateZ(Math.PI / 2);
    const mk = (g, mat, c) => { const m = new THREE.InstancedMesh(g, mat, c); m.castShadow = true; m.frustumCulled = false; this.scene.add(m); return m; };
    this.carBody = mk(bodyG, new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.4 }), n + 1);
    this.carCab = mk(cabG, new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.6 }), n + 1);
    this.carWheel = mk(wheelG, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }), (n + 1) * 4);
    this.siren = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.3), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1 }));
    this.siren.visible = false;
    this.scene.add(this.siren);
    const cols = [0xdc2626, 0x2563eb, 0xf8fafc, 0x16a34a, 0xf59e0b, 0x334155, 0x7c3aed, 0x0891b2, 0xe11d48];
    this.cars = [];
    for (let i = 0; i < n; i++) {
      const dir = i % 2 ? 1 : -1;
      const street = i % 4 < 2 ? STREET_N : -STREET_N;
      this.cars.push({ x: -70 + i * 17, z: street + dir * 1.1, dir, speed: 6 + (i % 3) * 1.5, v: 0 });
      this.carBody.setColorAt(i, new THREE.Color(cols[i]));
    }
    this.amb = { x: 95, z: -STREET_N - 1.1, dir: -1, v: 0, active: false };
    this.carBody.setColorAt(n, new THREE.Color(0xffffff));
    this.carBody.instanceColor.needsUpdate = true;
    this._m = new THREE.Matrix4(); this._w = new THREE.Matrix4(); this._o = new THREE.Matrix4();
    this._q = new THREE.Quaternion(); this._e = new THREE.Euler(); this._p = new THREE.Vector3(); this._one = new THREE.Vector3(1, 1, 1);
  }

  updateTraffic(dt, engine, T) {
    if (!this.cars) return;
    const m = this._m;
    const place = (i, car) => {
      this._e.set(0, car.dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0); this._q.setFromEuler(this._e);
      m.compose(this._p.set(car.x, 0, car.z), this._q, this._one);
      this.carBody.setMatrixAt(i, m); this.carCab.setMatrixAt(i, m);
      for (let w = 0; w < 4; w++) {
        this._w.makeRotationX(car.x * 1.4 * car.dir);
        this._w.setPosition(w % 2 ? 0.85 : -0.85, 0.34, w < 2 ? 1.25 : -1.25);
        this.carWheel.setMatrixAt(i * 4 + w, this._o.multiplyMatrices(m, this._w));
      }
    };
    this.cars.forEach((car, i) => {
      let blocked = false;
      if (engine.hash) {
        engine.forNeighbors(car.x + car.dir * 3.2, car.z, 1.8, () => { blocked = true; });
        for (const o of this.cars) if (o !== car && o.z === car.z && (o.x - car.x) * car.dir > 0 && (o.x - car.x) * car.dir < 6) blocked = true;
      }
      car.v = lerpN(car.v, blocked ? 0 : car.speed, Math.min(1, dt * (blocked ? 4 : 1.2)));
      car.x += car.v * car.dir * dt;
      if (car.x > 95) car.x = -95;
      if (car.x < -95) car.x = 95;
      place(i, car);
    });
    const n = this.cars.length;
    const a = this.amb;
    const need = engine.counts && engine.counts.H > 0;
    if (need && !a.active) { a.active = true; a.x = 95; a.parked = false; }
    if (a.active) {
      if (!a.parked) {
        a.x -= 9 * dt;
        if (a.x <= 50) { a.x = 50; a.parked = true; a.parkT = T; }
      } else if (!need && T - a.parkT > 4) { a.x -= 9 * dt; if (a.x < -95) a.active = false; }
      place(n, a);
      this.siren.visible = true;
      this.siren.position.set(a.x, 1.65, a.z);
      this.siren.material.emissiveIntensity = Math.sin(T * (a.parked ? 4 : 12)) > 0.2 ? 2 : 0.2;
    } else {
      m.makeScale(0, 0, 0);
      this.carBody.setMatrixAt(n, m); this.carCab.setMatrixAt(n, m);
      for (let w = 0; w < 4; w++) this.carWheel.setMatrixAt(n * 4 + w, m);
      this.siren.visible = false;
    }
    this.carBody.instanceMatrix.needsUpdate = true;
    this.carCab.instanceMatrix.needsUpdate = true;
    this.carWheel.instanceMatrix.needsUpdate = true;
  }

  /** Animaciones ambientales: tráfico, nubes, chorro de la fuente y superficie del agua. */
  update(dt, engine, T) {
    this.updateTraffic(dt, engine, T);
    for (const c of this.clouds.children) { c.position.x += c.userData.speed * dt; if (c.position.x > 200) c.position.x = -200; }
    if (this.jet) { const k = 1 + Math.sin(T * 6) * 0.08; this.jet.scale.set(k, 1 + Math.sin(T * 3) * 0.15, k); }
    this.tex.water.offset.set(T * 0.02, T * 0.015);
  }

  mergeStatic() {
    const groups = new Map();
    const keep = [];
    for (const m of this.group.children) {
      if (!m.isMesh || m.isInstancedMesh || m.userData.dynamic || m.material.transparent) { keep.push(m); continue; }
      const key = `${m.material.uuid}|${m.castShadow}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(m);
    }
    this.group.clear();
    for (const m of keep) this.group.add(m);
    for (const list of groups.values()) {
      if (list.length === 1) { this.group.add(list[0]); continue; }
      let total = 0;
      const geos = list.map((m) => {
        m.updateMatrix();
        const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrix);
        total += g.attributes.position.count;
        return g;
      });
      const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), uv = new Float32Array(total * 2);
      let o = 0;
      for (const g of geos) {
        pos.set(g.attributes.position.array, o * 3);
        nor.set(g.attributes.normal.array, o * 3);
        if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
        o += g.attributes.position.count;
        g.dispose();
      }
      const merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      merged.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      merged.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, list[0].material);
      mesh.castShadow = list[0].castShadow;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
  }

  /** Ciclo día/noche: devuelve el factor de luz diurna (0 noche – 1 mediodía). */
  setTimeOfDay(hour, sun, hemi, scene) {
    const ang = ((hour - 6) / 12) * Math.PI;
    const elev = Math.sin(ang);
    const day = Math.max(0, Math.min(1, elev * 1.6 + 0.15));
    sun.position.set(Math.cos(ang) * 80, Math.max(10, elev * 90), 45);
    sun.intensity = 0.2 + day * 2.6;
    sun.color.setHSL(0.1, 0.65, 0.55 + day * 0.4);
    hemi.intensity = 0.35 + day * 0.8;
    const key = Math.round(hour * 12);
    if (key !== this._skyKey) {
      this._skyKey = key;
      const top = new THREE.Color(0x0a1022).lerp(new THREE.Color(0x3b82f6), day);
      const horizon = new THREE.Color(0x1e293b).lerp(new THREE.Color(0xbfe3f7), day);
      const dusk = Math.max(0, 1 - Math.abs(hour - 6.5) / 1.2) + Math.max(0, 1 - Math.abs(hour - 18.5) / 1.2);
      horizon.lerp(new THREE.Color(0xf6a26b), Math.min(1, dusk) * 0.6);
      this.paintSky(top, horizon);
      this.horizon = horizon;
      this.cloudMat.color.setScalar(0.35 + day * 0.65);
    }
    scene.background = this.horizon;
    if (scene.fog) scene.fog.color.copy(this.horizon);
    const night = 1 - day;
    this.windowMat.emissiveIntensity = night * 1.5;
    this.bulbMat.emissiveIntensity = night * 2.5;
    return day;
  }
}
