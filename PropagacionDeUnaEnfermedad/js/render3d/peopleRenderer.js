/**
 * EpiDynamics 6.0 — Personajes humanos estilizados con esqueleto procedural.
 *
 * Cada persona tiene una jerarquía de articulaciones (pelvis → columna → cuello → cabeza,
 * hombros → codos → manos, caderas → rodillas → tobillos → calzado) y un rostro (ojos con
 * parpadeo, nariz y boca expresiva). Cada pieza es UN InstancedMesh para toda la población.
 *
 * Animación: sistema de capas con pesos suavizados (sin saltos):
 *   locomoción (caminar / correr, fase ligada a la distancia recorrida → sin deslizamiento),
 *   sentarse (silla o suelo), conversar, saludar, toser, estornudar, respirar con dificultad,
 *   escalofríos, sujetarse el abdomen, debilidad, reposo en cama y recuperación progresiva.
 *   Cada persona tiene "personalidad": ritmo, amplitud y postura propios.
 *
 * IMPORTANTE: el renderer sólo LEE el motor. Ninguna animación cambia el resultado matemático.
 */
import { STATES } from '../simulation/epiEngine.js';

const TOPS = [0x2563eb, 0x0f766e, 0x7c3aed, 0xd97706, 0xdb2777, 0x16a34a, 0xdc2626, 0x0891b2, 0x4f46e5, 0xea580c,
  0x65a30d, 0x9333ea, 0x0284c7, 0xe11d48, 0xf59e0b, 0x334155];
const BOTTOMS = [0x1e293b, 0x334155, 0x1e3a8a, 0x3f3f46, 0x57534e, 0x172554, 0x7c2d12, 0x14532d];
const SKINS = [0xffdbac, 0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0x6b4226, 0xf5d0b5, 0xd9a066];
const HAIRS = [0x1c1917, 0x3f2a1d, 0x6b4423, 0xa16207, 0x7c2d12, 0x111827, 0xd6a75c, 0x4b3621];
const SHOES = [0x111827, 0x7c2d12, 0xf8fafc, 0x1e40af, 0x52525b, 0x991b1b];
const RING_COLORS = [0x38bdf8, 0xfbbf24, 0xef4444, 0x10b981, 0x94a3b8, 0xa855f7];
const GOWN = 0xbfe3f5, COAT = 0xf8fafc;

function drawIcon(type) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const circle = (fill, stroke = '#ffffff') => {
    x.beginPath(); x.arc(64, 64, 54, 0, Math.PI * 2);
    x.fillStyle = fill; x.fill(); x.lineWidth = 8; x.strokeStyle = stroke; x.stroke();
  };
  x.lineCap = 'round'; x.lineJoin = 'round';
  if (type === 'E') {
    circle('#f59e0b');
    x.fillStyle = '#fff'; x.font = '900 78px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('?', 64, 70);
  } else if (type === 'I') {
    circle('#dc2626');
    x.strokeStyle = '#fff'; x.lineWidth = 7;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      x.beginPath(); x.moveTo(64 + Math.cos(a) * 20, 64 + Math.sin(a) * 20); x.lineTo(64 + Math.cos(a) * 36, 64 + Math.sin(a) * 36); x.stroke();
      x.beginPath(); x.arc(64 + Math.cos(a) * 38, 64 + Math.sin(a) * 38, 5, 0, Math.PI * 2); x.fillStyle = '#fff'; x.fill();
    }
    x.beginPath(); x.arc(64, 64, 20, 0, Math.PI * 2); x.fillStyle = '#fff'; x.fill();
  } else if (type === 'H') {
    circle('#ffffff', '#dc2626');
    x.fillStyle = '#dc2626'; x.fillRect(52, 28, 24, 72); x.fillRect(28, 52, 72, 24);
  } else if (type === 'R') {
    circle('#059669');
    x.strokeStyle = '#fff'; x.lineWidth = 14;
    x.beginPath(); x.moveTo(38, 66); x.lineTo(56, 84); x.lineTo(92, 44); x.stroke();
  } else if (type === 'V') {
    circle('#7c3aed');
    x.fillStyle = '#fff';
    x.beginPath(); x.moveTo(64, 26); x.lineTo(94, 38); x.quadraticCurveTo(94, 84, 64, 102); x.quadraticCurveTo(34, 84, 34, 38); x.closePath(); x.fill();
    x.strokeStyle = '#7c3aed'; x.lineWidth = 9;
    x.beginPath(); x.moveTo(50, 64); x.lineTo(61, 75); x.lineTo(80, 52); x.stroke();
  } else if (type === 'D') {
    x.beginPath(); x.arc(64, 64, 54, 0, Math.PI * 2); x.fillStyle = 'rgba(30,41,59,0.85)'; x.fill();
    x.fillStyle = '#f8fafc'; x.fillRect(52, 58, 24, 42);
    x.beginPath(); x.ellipse(64, 44, 9, 15, 0, 0, Math.PI * 2); x.fillStyle = '#fbbf24'; x.fill();
    x.beginPath(); x.ellipse(64, 47, 4, 8, 0, 0, Math.PI * 2); x.fillStyle = '#fff7ed'; x.fill();
  } else if (type === 'Q') {
    circle('#0ea5e9');
    x.fillStyle = '#fff';
    x.beginPath(); x.moveTo(64, 30); x.lineTo(98, 60); x.lineTo(30, 60); x.closePath(); x.fill();
    x.fillRect(40, 58, 48, 38);
    x.fillStyle = '#0ea5e9'; x.fillRect(57, 72, 14, 24);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function radialTexture(rgb) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, `rgba(${rgb},0.55)`);
  g.addColorStop(0.7, `rgba(${rgb},0.2)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const hash = (i, k) => {
  let h = (i * 374761393 + k * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const lerp = (a, b, k) => a + (b - a) * k;
const angleDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };

const PARTS = ['shoe', 'lowerLeg', 'upperLeg', 'pelvis', 'torso', 'neck', 'head', 'nose', 'eye', 'mouth',
  'hairCap', 'upperArm', 'forearm', 'hand'];
const PAIRED = { shoe: 2, lowerLeg: 2, upperLeg: 2, eye: 2, upperArm: 2, forearm: 2, hand: 2 };

export class PeopleRenderer {
  constructor(scene) {
    this.scene = scene;
    this.capacity = 0;
    this.meshes = null;
    this.zero = new THREE.Matrix4().makeScale(0, 0, 0);
    this.color = new THREE.Color();
    this.iconTypes = ['E', 'I', 'H', 'R', 'V', 'D', 'Q'];
    this.iconTex = {};
    for (const t of this.iconTypes) this.iconTex[t] = drawIcon(t);
    this.effects = [];
    this.puffs = [];
    this.fx = [];
    this.seenTransmissions = new WeakSet();
    this.selectedId = -1;
    this.M = {};
    for (const k of ['root', 'pelvis', 'spine', 'head', 'hipL', 'hipR', 'kneeL', 'kneeR',
      'shL', 'shR', 'elL', 'elR', 'out', 'loc']) this.M[k] = new THREE.Matrix4();
    this.E = new THREE.Euler();
    this.Q = new THREE.Quaternion();
    this.V = new THREE.Vector3();
    this.ONE = new THREE.Vector3(1, 1, 1);
    this.SV = new THREE.Vector3();
    this.iconPos = new THREE.Vector3();
    this.iconScale = new THREE.Vector3();
    this.iconMat = new THREE.Matrix4();
    this.buildShared();
  }

  buildShared() {
    const S = this.scene;
    const limb = (r, L) => new THREE.CapsuleGeometry(r, Math.max(0.01, L - 2 * r), 3, 7).translate(0, -L / 2, 0);
    const torsoProfile = [
      [0.0, 0.0], [0.135, 0.0], [0.15, 0.06], [0.145, 0.18], [0.16, 0.3], [0.185, 0.42], [0.18, 0.48], [0.12, 0.535], [0.0, 0.545]
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const torso = new THREE.LatheGeometry(torsoProfile, 12).scale(1, 1, 0.66);
    torso.computeVertexNormals();
    this.geo = {
      shoe: new THREE.CapsuleGeometry(0.052, 0.13, 2, 6).rotateX(Math.PI / 2).scale(1, 0.62, 1).translate(0, 0, 0.035),
      lowerLeg: limb(0.058, 0.44),
      upperLeg: limb(0.074, 0.45),
      pelvis: new THREE.CapsuleGeometry(0.14, 0.05, 3, 9).scale(1, 0.8, 0.7),
      torso,
      neck: new THREE.CylinderGeometry(0.048, 0.055, 0.1, 7, 1, true).translate(0, 0.05, 0),
      head: new THREE.SphereGeometry(0.135, 14, 10).scale(0.95, 1.05, 1),
      nose: new THREE.SphereGeometry(0.022, 5, 4),
      eye: new THREE.SphereGeometry(0.019, 5, 4),
      mouth: new THREE.BoxGeometry(0.055, 0.014, 0.012),
      hairCap: new THREE.SphereGeometry(0.145, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.56).translate(0, 0.012, -0.012),
      upperArm: limb(0.054, 0.29),
      forearm: limb(0.047, 0.27),
      hand: new THREE.SphereGeometry(0.047, 6, 5).scale(0.85, 1.05, 0.7),
      skirt: new THREE.CylinderGeometry(0.15, 0.27, 0.4, 12, 1, true).translate(0, -0.18, 0),
      hairLong: new THREE.CapsuleGeometry(0.11, 0.18, 3, 8).scale(1.15, 1, 0.55).translate(0, -0.08, -0.085),
      hairBun: new THREE.SphereGeometry(0.06, 7, 5),
      mask: new THREE.SphereGeometry(0.142, 14, 8, Math.PI * 0.2, Math.PI * 0.6, Math.PI * 0.5, Math.PI * 0.28),
      backpack: new THREE.BoxGeometry(0.26, 0.3, 0.12),
      stool: new THREE.CylinderGeometry(0.17, 0.15, 0.45, 8).translate(0, 0.225, 0),
      cap: new THREE.CylinderGeometry(0.15, 0.15, 0.06, 10),
      ring: new THREE.RingGeometry(0.36, 0.5, 28).rotateX(-Math.PI / 2),
      zone: new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2),
      icon: new THREE.PlaneGeometry(0.62, 0.62),
      mosq: this.mosquitoGeometry(),
      puff: new THREE.SphereGeometry(0.25, 8, 6),
      droplet: new THREE.SphereGeometry(0.06, 6, 5),
      pulse: new THREE.RingGeometry(0.75, 0.9, 32).rotateX(-Math.PI / 2),
      aerosol: new THREE.SphereGeometry(0.07, 6, 5)
    };
    const std = (o = {}) => new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0, ...o });
    this.mats = {
      body: std(),
      face: new THREE.MeshStandardMaterial({ color: 0x1f1410, roughness: 0.3 }),
      mouth: new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.6 }),
      mask: std({ color: 0xe0f2fe, roughness: 0.9, side: THREE.DoubleSide }),
      stool: std({ color: 0x92400e }),
      ring: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85, depthWrite: false }),
      zone: new THREE.MeshBasicMaterial({ map: radialTexture('239,68,68'), transparent: true, depthWrite: false }),
      mosq: new THREE.MeshStandardMaterial({ roughness: 0.5, side: THREE.DoubleSide }),
      puff: new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.38, depthWrite: false }),
      droplet: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85, depthWrite: false }),
      pulse: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }),
      aerosol: new THREE.MeshBasicMaterial({ color: 0xfca5a5, transparent: true, opacity: 0.45, depthWrite: false }),
      sel: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false })
    };
    this.selRing = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32).rotateX(-Math.PI / 2), this.mats.sel);
    this.selRing.visible = false;
    this.selRing.renderOrder = 4;
    S.add(this.selRing);

    this.lineGeo = new THREE.BufferGeometry();
    this.linePos = new Float32Array(6 * 3000);
    this.lineCol = new Float32Array(6 * 3000);
    this.lineGeo.setAttribute('position', new THREE.BufferAttribute(this.linePos, 3));
    this.lineGeo.setAttribute('color', new THREE.BufferAttribute(this.lineCol, 3));
    this.lines = new THREE.LineSegments(this.lineGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }));
    this.lines.frustumCulled = false;
    this.lines.renderOrder = 6;
    S.add(this.lines);

    const pool = (geo, mat, n, order = 5) => {
      const m = new THREE.InstancedMesh(geo, mat, n);
      m.count = 0; m.frustumCulled = false; m.renderOrder = order;
      S.add(m);
      return m;
    };
    this.puffMesh = pool(this.geo.puff, this.mats.puff, 300);
    this.mosqMesh = pool(this.geo.mosq, this.mats.mosq, 3200, 1);
    this.dropMesh = pool(this.geo.droplet, this.mats.droplet, 900, 6);
    this.pulseMesh = pool(this.geo.pulse, this.mats.pulse, 200, 6);
    this.aeroMesh = pool(this.geo.aerosol, this.mats.aerosol, 900, 2);
  }

  mosquitoGeometry() {
    const parts = [
      new THREE.CapsuleGeometry(0.018, 0.09, 3, 6).rotateX(Math.PI / 2),
      new THREE.PlaneGeometry(0.09, 0.03).rotateX(-Math.PI / 2).rotateY(0.5).translate(0.045, 0.012, -0.005),
      new THREE.PlaneGeometry(0.09, 0.03).rotateX(-Math.PI / 2).rotateY(-0.5).translate(-0.045, 0.012, -0.005),
      new THREE.BoxGeometry(0.11, 0.004, 0.004).translate(0, -0.02, 0.01)
    ].map((g) => g.toNonIndexed());
    let n = 0;
    for (const g of parts) n += g.attributes.position.count;
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
    let o = 0;
    for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    return merged;
  }

  allocate(n, shadows) {
    if (this.meshes) for (const k in this.meshes) { this.scene.remove(this.meshes[k]); this.meshes[k].dispose(); }
    if (this.icons) for (const k in this.icons) { this.scene.remove(this.icons[k]); this.icons[k].dispose(); }
    this.capacity = n;
    const mk = (geo, material, count, shadow = true, colored = true) => {
      const m = new THREE.InstancedMesh(geo, material, Math.max(1, count));
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.castShadow = shadow && shadows;
      m.frustumCulled = false;
      if (colored) m.setColorAt(0, this.color.set(0xffffff));
      this.scene.add(m);
      return m;
    };
    this.meshes = {};
    for (const p of PARTS) {
      const mat = p === 'eye' ? this.mats.face : p === 'mouth' ? this.mats.mouth : this.mats.body;
      const small = ['eye', 'mouth', 'nose'].includes(p);
      this.meshes[p] = mk(this.geo[p], mat, n * (PAIRED[p] || 1), !small, !['eye', 'mouth'].includes(p));
    }
    this.meshes.skirt = mk(this.geo.skirt, new THREE.MeshStandardMaterial({ roughness: 0.7, side: THREE.DoubleSide }), n);
    this.meshes.hairLong = mk(this.geo.hairLong, this.mats.body, n);
    this.meshes.hairBun = mk(this.geo.hairBun, this.mats.body, n);
    this.meshes.cap = mk(this.geo.cap, this.mats.body, n);
    this.meshes.mask = mk(this.geo.mask, this.mats.mask, n, false, false);
    this.meshes.backpack = mk(this.geo.backpack, this.mats.body, n);
    this.meshes.stool = mk(this.geo.stool, this.mats.stool, n, true, false);
    this.meshes.ring = mk(this.geo.ring, this.mats.ring, n, false);
    this.meshes.zone = mk(this.geo.zone, this.mats.zone, n, false, false);
    this.meshes.ring.renderOrder = 3;
    this.meshes.zone.renderOrder = 1;
    this.icons = {};
    for (const t of this.iconTypes) {
      const m = mk(this.geo.icon, new THREE.MeshBasicMaterial({ map: this.iconTex[t], transparent: true, depthWrite: false }), n, false, false);
      m.renderOrder = 7;
      this.icons[t] = m;
    }
    this.look = [];
    this.anim = [];
    for (let i = 0; i < n; i++) {
      const r = (k) => hash(i, k);
      const hs = r(2);
      this.look.push({
        top: TOPS[Math.floor(r(3) * TOPS.length)],
        bottom: BOTTOMS[Math.floor(r(4) * BOTTOMS.length)],
        skirtColor: TOPS[Math.floor(r(5) * TOPS.length)],
        skin: SKINS[Math.floor(r(6) * SKINS.length)],
        hair: HAIRS[Math.floor(r(7) * HAIRS.length)],
        shoe: SHOES[Math.floor(r(8) * SHOES.length)],
        capColor: TOPS[Math.floor(r(9) * TOPS.length)],
        dress: r(1) < 0.3,
        hairStyle: hs < 0.4 ? 'long' : hs < 0.52 ? 'bun' : hs < 0.6 ? 'cap' : 'short',
        height: 0.93 + r(10) * 0.14,
        build: 0.92 + r(11) * 0.18
      });
      this.anim.push({
        phase: r(12) * 6.28, visYaw: 0, init: false, prevWalk: 0,
        wWalk: 0, wRun: 0, wSit: 0, wGround: 0, wTalk: 0, wWave: 0, wLean: 0, wAbd: 0, wBreath: 0,
        cough: 0, sneeze: 0, lastCough: -1, blink: r(13) * 5, waveT: 0, wasTalking: false,
        gait: 0.85 + r(14) * 0.3, swing: 0.75 + r(15) * 0.5, posture: (r(16) - 0.5) * 0.08,
        idleSeed: r(17) * 100, lastKey: '', deathShown: false
      });
    }
  }

  setShadows(on) {
    if (!this.meshes) return;
    for (const k of PARTS) if (!['eye', 'mouth', 'nose'].includes(k)) this.meshes[k].castShadow = on;
  }

  refreshColors(a, i, engine) {
    const ill = a.state === STATES.I;
    const recovering = a.state === STATES.R && engine.t - a.stateSince < 2;
    const staff = a.occupation === 'hospital' && a.role === 'adult';
    const key = `${a.state}|${a.bedIdx >= 0}|${recovering}`;
    if (this.anim[i].lastKey === key) return false;
    this.anim[i].lastKey = key;
    const L = this.look[i], M = this.meshes, c = this.color, sym = engine.profile.symptoms;
    c.set(L.skin);
    if (ill) {
      if (sym.includes('jaundice')) c.lerp(new THREE.Color(0xe5d33b), 0.55);
      else if (sym.includes('rash')) c.lerp(new THREE.Color(0xd9534f), 0.38);
      else c.lerp(new THREE.Color(0xf3b0a8), 0.22);
    }
    for (const p of ['head', 'neck', 'nose']) M[p].setColorAt(i, c);
    M.hand.setColorAt(i * 2, c); M.hand.setColorAt(i * 2 + 1, c);
    const gown = a.bedIdx >= 0;
    const top = gown ? GOWN : staff ? COAT : L.top;
    c.set(top);
    M.torso.setColorAt(i, c);
    M.upperArm.setColorAt(i * 2, c); M.upperArm.setColorAt(i * 2 + 1, c);
    M.forearm.setColorAt(i * 2, c); M.forearm.setColorAt(i * 2 + 1, c);
    c.set(gown ? GOWN : L.dress ? L.skin : L.bottom);
    M.upperLeg.setColorAt(i * 2, c); M.upperLeg.setColorAt(i * 2 + 1, c);
    M.lowerLeg.setColorAt(i * 2, c); M.lowerLeg.setColorAt(i * 2 + 1, c);
    M.pelvis.setColorAt(i, c.set(gown ? GOWN : L.dress ? L.skirtColor : L.bottom));
    M.skirt.setColorAt(i, c.set(L.skirtColor));
    c.set(a.role === 'elder' ? 0xd4d4d4 : L.hair);
    M.hairCap.setColorAt(i, c); M.hairLong.setColorAt(i, c); M.hairBun.setColorAt(i, c);
    M.cap.setColorAt(i, c.set(L.capColor));
    M.shoe.setColorAt(i * 2, c.set(L.shoe)); M.shoe.setColorAt(i * 2 + 1, c);
    M.backpack.setColorAt(i, c.set(L.skirtColor));
    M.ring.setColorAt(i, c.set(RING_COLORS[a.state]));
    return true;
  }

  joint(out, parent, tx, ty, tz, rx = 0, ry = 0, rz = 0) {
    this.E.set(rx, ry, rz, 'YXZ');
    this.Q.setFromEuler(this.E);
    this.M.loc.compose(this.V.set(tx, ty, tz), this.Q, this.ONE);
    return out.multiplyMatrices(parent, this.M.loc);
  }

  /** Coloca una pieza (índice idx) relativa a una articulación. */
  put(mesh, idx, parent, tx, ty, tz, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    this.E.set(rx, ry, rz, 'YXZ');
    this.Q.setFromEuler(this.E);
    this.M.loc.compose(this.V.set(tx, ty, tz), this.Q, this.SV.set(sx, sy, sz));
    mesh.setMatrixAt(idx, this.M.out.multiplyMatrices(parent, this.M.loc));
  }

  update(engine, opts) {
    const agents = engine.agents;
    if (!this.meshes || this.capacity !== agents.length) this.allocate(agents.length, opts.shadows && agents.length <= 500);
    const M = this.meshes, MX = this.M;
    const sym = engine.profile.symptoms;
    const mech = engine.mechanism;
    const T = opts.timeReal;
    const dt = Math.min(0.1, Math.max(0.001, opts.dtReal || 0.016));
    const k5 = 1 - Math.exp(-dt * 5), k9 = 1 - Math.exp(-dt * 9);
    const camQ = opts.camera.quaternion;
    const iconCount = {};
    for (const t of this.iconTypes) iconCount[t] = 0;
    let colorsChanged = false;
    const cnt = { skirt: 0, hairLong: 0, hairBun: 0, cap: 0, mask: 0, backpack: 0, stool: 0, zone: 0 };
    const zoneR = mech === 'contact' ? 1.5 : 3.0;
    const coughs = sym.includes('cough');
    const { iconPos, iconScale, iconMat } = this;
    const masked = engine.params.maskUsageRate;
    const vis = opts.lod !== 'far';

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const an = this.anim[i];
      const L = this.look[i];
      if (this.refreshColors(a, i, engine)) colorsChanged = true;
      if (a.state === STATES.D) {
        this.hideAgent(i);
        if (!an.deathShown) {
          an.deathShown = true;
          if (T - (opts.startReal || 0) > 0.5) this.effects.push({ x: a.x, z: a.z, t0: T });
        }
        continue;
      }
      an.deathShown = false;
      const ill = a.state === STATES.I;
      const severe = ill && a.severe && engine.t >= a.severeAt;
      const recovering = a.state === STATES.R && engine.t - a.stateSince < 2;
      const scale = (a.role === 'child' ? 0.66 : a.role === 'elder' ? 0.93 : 1.0) * L.height;
      if (!an.init) { an.init = true; an.visYaw = a.yaw; an.prevWalk = a.walkDist; }

      // ---------------- locomoción: fase ligada a la distancia → los pies no patinan
      const dw = Math.max(0, a.walkDist - an.prevWalk);
      an.prevWalk = a.walkDist;
      const speedReal = dw / dt;
      const moving = a.moving && dw > 1e-5 && !a.lying;
      const running = moving && speedReal > 3.2;
      an.wWalk = lerp(an.wWalk, moving ? 1 : 0, k9);
      an.wRun = lerp(an.wRun, running ? 1 : 0, k5);
      const stride = (running ? 2.0 : 1.25) * scale;
      const maxRate = (running ? 3.2 : 2.2) * 2 * Math.PI * an.gait;
      if (moving) an.phase += Math.min((dw / stride) * 2 * Math.PI, maxRate * dt);
      let targetYaw = a.yaw;

      // ---------------- comportamiento en reposo (sólo visual)
      const place = a.placeKey ? engine.town.places[a.placeKey] : null;
      const idle = !moving && !a.lying && !a.traveling;
      let sitChair = false, sitGround = false, talking = false;
      if (idle && place) {
        if ((place.type === 'school' && a.role === 'child') || severe || (place.type === 'house' && hash(i, Math.floor(engine.t * 6)) < 0.45)) sitChair = true;
        else if (place.type === 'park' && hash(i, Math.floor(engine.t * 4) + 7) < 0.5) sitGround = true;
        else if (vis && engine.hash && place.type !== 'well') {
          let best = null, bd = 1.8;
          engine.forNeighbors(a.x, a.z, 1.8, (b, d) => { if (b !== a && d < bd && !b.moving && !b.lying) { bd = d; best = b; } });
          if (best) { talking = true; targetYaw = Math.atan2(best.x - a.x, best.z - a.z); }
        }
      }
      if (talking && !an.wasTalking && hash(i, Math.floor(engine.t * 20)) < 0.5) an.waveT = 1.2; // saludo
      an.wasTalking = talking;
      an.waveT = Math.max(0, an.waveT - dt);
      an.visYaw += angleDiff(an.visYaw, targetYaw) * (1 - Math.exp(-dt * (moving ? 10 : 4)));
      an.wSit = lerp(an.wSit, sitChair ? 1 : 0, k5);
      an.wGround = lerp(an.wGround, sitGround ? 1 : 0, k5);
      an.wTalk = lerp(an.wTalk, talking ? 1 : 0, k5);
      an.wWave = lerp(an.wWave, an.waveT > 0 ? 1 : 0, k9);
      const weak = (ill && (sym.includes('fatigue') || sym.includes('diarrhea'))) || severe;
      an.wLean = lerp(an.wLean, weak ? 1 : recovering ? 0.4 : 0, k5 * 0.6);
      an.wAbd = lerp(an.wAbd, ill && sym.includes('diarrhea') ? 1 : 0, k5);
      an.wBreath = lerp(an.wBreath, severe ? 1 : 0, k5);
      if (coughs && ill && a.coughAt !== an.lastCough) {
        if (an.lastCough >= 0 && !a.lying) {
          const isSneeze = hash(i, Math.floor(a.coughAt * 1000)) < 0.3;
          if (isSneeze) an.sneeze = 1; else an.cough = 1;
          this.spawnPuff(a, an.visYaw, a.uMask < masked, isSneeze);
        }
        an.lastCough = a.coughAt;
      }
      an.cough = Math.max(0, an.cough - dt * 1.5);
      an.sneeze = Math.max(0, an.sneeze - dt * 1.8);

      // ---------------- pose final por capas
      const ph = an.phase;
      const walkAmp = (0.42 + 0.35 * an.wRun) * (weak ? 0.6 : 1);
      const sL = Math.sin(ph), sR = Math.sin(ph + Math.PI);
      const W = an.wWalk;
      let hipL = -sL * walkAmp * W, hipR = -sR * walkAmp * W;
      let kneeL = (0.08 + Math.max(0, Math.sin(ph + 1.9)) * (0.75 + 0.5 * an.wRun)) * W;
      let kneeR = (0.08 + Math.max(0, Math.sin(ph + 1.9 + Math.PI)) * (0.75 + 0.5 * an.wRun)) * W;
      const armA = walkAmp * 0.9 * an.swing * W;
      let shL = sL * armA, shR = sR * armA;
      let elL = -0.25 - 0.45 * an.wRun * W - (weak ? 0.2 : 0), elR = elL;
      let shZL = 0.07, shZR = -0.07;
      const bob = Math.abs(Math.cos(ph)) * (0.025 + 0.04 * an.wRun) * W;
      let lean = an.posture + 0.12 * an.wRun * W + 0.32 * an.wLean + (a.role === 'elder' ? 0.12 : 0);
      let headP = -0.05 * an.wLean, headY = 0, twist = Math.sin(ph) * 0.08 * W;
      let drop = 0;
      const breathRate = an.wBreath > 0.5 ? 4.2 : 1.3;
      const breath = Math.sin(T * breathRate + an.idleSeed) * (0.012 + 0.035 * an.wBreath);
      if (!moving && !talking) headY += Math.sin(T * 0.35 + an.idleSeed) * 0.25; // mirar alrededor
      if (an.wSit > 0.01) {
        const w = an.wSit;
        hipL = lerp(hipL, -1.5, w); hipR = lerp(hipR, -1.5, w);
        kneeL = lerp(kneeL, 1.5, w); kneeR = lerp(kneeR, 1.5, w);
        drop += 0.45 * w;
        shL = lerp(shL, -0.35, w); shR = lerp(shR, -0.35, w);
        elL = lerp(elL, -0.9, w); elR = lerp(elR, -0.9, w);
      }
      if (an.wGround > 0.01) {
        const w = an.wGround;
        hipL = lerp(hipL, -1.45, w); hipR = lerp(hipR, -1.35, w);
        kneeL = lerp(kneeL, 0.15, w); kneeR = lerp(kneeR, 0.5, w);
        drop += 0.8 * w;
        shL = lerp(shL, 0.35, w); shR = lerp(shR, 0.35, w);
        shZL = lerp(shZL, 0.3, w); shZR = lerp(shZR, -0.3, w);
        lean = lerp(lean, -0.12, w);
      }
      if (an.wTalk > 0.01) {
        const w = an.wTalk, g = T * 2.3 + an.idleSeed;
        shR = lerp(shR, -0.45 + Math.sin(g) * 0.25, w);
        elR = lerp(elR, -1.1 + Math.sin(g * 1.7) * 0.35, w);
        shL = lerp(shL, -0.15 + Math.sin(g * 0.8 + 1) * 0.12, w * 0.6);
        headP += Math.sin(g * 1.3) * 0.08 * w;
        headY = lerp(headY, Math.sin(g * 0.5) * 0.15, w);
      }
      if (an.wWave > 0.01) {
        const w = an.wWave;
        shZR = lerp(shZR, -2.6, w);
        shR = lerp(shR, 0, w);
        elR = lerp(elR, -0.3 + Math.sin(T * 12) * 0.35, w);
      }
      if (an.wAbd > 0.01) {
        const w = an.wAbd;
        shL = lerp(shL, -0.55, w); shR = lerp(shR, -0.55, w);
        elL = lerp(elL, -1.35, w); elR = lerp(elR, -1.35, w);
        shZL = lerp(shZL, -0.25, w); shZR = lerp(shZR, 0.25, w);
        lean += 0.15 * w;
      }
      if (an.cough > 0) {
        const c = Math.sin(an.cough * Math.PI);
        const g = Math.min(1, an.cough * 2);
        shR = lerp(shR, -1.25, g); elR = lerp(elR, -2.0, g); shZR = lerp(shZR, 0.35, g);
        lean += 0.35 * c; headP += 0.25 * c;
      }
      if (an.sneeze > 0) {
        const s = an.sneeze;
        const back = s > 0.6 ? (1 - s) / 0.4 : 0;
        const fwd = s <= 0.6 ? Math.sin((s / 0.6) * Math.PI) : 0;
        headP += -0.35 * back + 0.55 * fwd;
        lean += 0.4 * fwd - 0.1 * back;
        shR = lerp(shR, -1.3, 0.8); elR = lerp(elR, -2.0, 0.8);
      }
      let jitter = 0;
      if (ill && sym.includes('chills')) jitter = Math.sin(T * 55 + i) * 0.03;
      if (ill && sym.includes('agitation')) { headY += Math.sin(T * 8 + i) * 0.45; twist += Math.sin(T * 6.5 + i) * 0.12; }
      an.blink -= dt;
      if (an.blink < -0.12) an.blink = 2 + hash(i, Math.floor(T)) * 4;
      const eyeOpen = an.blink < 0 || a.lying ? 0.12 : 1;

      // ---------------- matriz raíz
      const root = MX.root;
      if (a.lying) {
        const bedTop = a.bedIdx >= 0 ? 0.55 : 0.45;
        const yaw = a.bedIdx >= 0 ? 0 : Math.PI / 2;
        this.E.set(0, yaw, 0, 'YXZ'); this.Q.setFromEuler(this.E);
        root.compose(this.V.set(a.x + jitter, bedTop + 0.13 * scale, a.z), this.Q, this.SV.set(scale, scale, scale));
        this.joint(MX.out, root, 0, 0, 0.9, -Math.PI / 2, 0, 0);
        root.copy(MX.out);
        hipL = hipR = kneeL = kneeR = 0; shL = shR = 0.05; elL = elR = -0.15; shZL = 0.12; shZR = -0.12;
        lean = 0; headP = -0.15 + breath * 2; headY = Math.sin(T * 0.4 + i) * 0.2; drop = 0; twist = 0;
      } else {
        this.E.set(0, an.visYaw, 0, 'YXZ'); this.Q.setFromEuler(this.E);
        root.compose(this.V.set(a.x + jitter, 0, a.z), this.Q, this.SV.set(scale * L.build, scale, scale * L.build));
      }
      const pelvisY = 0.93 + (a.lying ? 0 : bob) - drop;
      this.joint(MX.pelvis, root, 0, pelvisY, 0, 0, twist * 0.5, 0);
      M.pelvis.setMatrixAt(i, MX.pelvis);
      this.joint(MX.hipL, MX.pelvis, 0.095, -0.02, 0, hipL, 0, 0.02);
      this.joint(MX.hipR, MX.pelvis, -0.095, -0.02, 0, hipR, 0, -0.02);
      M.upperLeg.setMatrixAt(i * 2, MX.hipL); M.upperLeg.setMatrixAt(i * 2 + 1, MX.hipR);
      this.joint(MX.kneeL, MX.hipL, 0, -0.45, 0, kneeL);
      this.joint(MX.kneeR, MX.hipR, 0, -0.45, 0, kneeR);
      M.lowerLeg.setMatrixAt(i * 2, MX.kneeL); M.lowerLeg.setMatrixAt(i * 2 + 1, MX.kneeR);
      const ground = an.wGround > 0.5 ? -1.2 : 0;
      this.put(M.shoe, i * 2, MX.kneeL, 0, -0.45, 0, -(hipL + kneeL) * 0.8 * (1 - an.wSit) + ground);
      this.put(M.shoe, i * 2 + 1, MX.kneeR, 0, -0.45, 0, -(hipR + kneeR) * 0.8 * (1 - an.wSit) + ground);
      if (L.dress && a.bedIdx < 0) this.put(M.skirt, cnt.skirt++, MX.pelvis, 0, 0.04, 0, 0, 0, 0, 1, 1 - an.wSit * 0.4 - an.wGround * 0.5, 1 + an.wSit * 0.5);
      this.joint(MX.spine, MX.pelvis, 0, 0.04, 0, lean, -twist, 0);
      const chest = 1 + breath;
      this.put(M.torso, i, MX.spine, 0, 0, 0, 0, 0, 0, chest, 1, chest);
      if (a.role === 'child' && !a.lying) this.put(M.backpack, cnt.backpack++, MX.spine, 0, 0.3, -0.16);
      M.neck.setMatrixAt(i, this.joint(MX.out, MX.spine, 0, 0.52, 0));
      this.joint(MX.head, MX.spine, 0, 0.6, 0.01, headP, headY, 0);
      this.put(M.head, i, MX.head, 0, 0.11, 0);
      this.put(M.nose, i, MX.head, 0, 0.09, 0.132);
      this.put(M.eye, i * 2, MX.head, 0.048, 0.135, 0.118, 0, 0, 0, 1, eyeOpen, 1);
      this.put(M.eye, i * 2 + 1, MX.head, -0.048, 0.135, 0.118, 0, 0, 0, 1, eyeOpen, 1);
      const mouthOpen = an.cough > 0 || an.sneeze > 0.1 ? 3.2 : an.wTalk > 0.5 ? 1 + Math.abs(Math.sin(T * 9 + i)) * 1.6 : 1;
      this.put(M.mouth, i, MX.head, 0, 0.045, 0.128, 0, 0, 0, ill || severe ? 0.7 : 1, mouthOpen, 1);
      if (L.hairStyle === 'cap' && a.role !== 'elder' && !a.lying) {
        this.put(M.hairCap, i, MX.head, 0, 0.11, 0, 0, 0, 0, 1, 0.9, 1);
        this.put(M.cap, cnt.cap++, MX.head, 0, 0.215, 0.0, -0.08);
      } else {
        this.put(M.hairCap, i, MX.head, 0, 0.11, 0);
        if (L.hairStyle === 'long' && a.role !== 'elder') this.put(M.hairLong, cnt.hairLong++, MX.head, 0, 0.11, 0);
        if (L.hairStyle === 'bun' || (a.role === 'elder' && L.hairStyle === 'long')) this.put(M.hairBun, cnt.hairBun++, MX.head, 0, 0.25, -0.08);
      }
      if (a.uMask < masked) this.put(M.mask, cnt.mask++, MX.head, 0, 0.1, 0.0);
      this.joint(MX.shL, MX.spine, 0.2, 0.47, 0, shL, 0, shZL);
      this.joint(MX.shR, MX.spine, -0.2, 0.47, 0, shR, 0, shZR);
      M.upperArm.setMatrixAt(i * 2, MX.shL); M.upperArm.setMatrixAt(i * 2 + 1, MX.shR);
      this.joint(MX.elL, MX.shL, 0, -0.29, 0, elL);
      this.joint(MX.elR, MX.shR, 0, -0.29, 0, elR);
      M.forearm.setMatrixAt(i * 2, MX.elL); M.forearm.setMatrixAt(i * 2 + 1, MX.elR);
      this.put(M.hand, i * 2, MX.elL, 0, -0.29, 0);
      this.put(M.hand, i * 2 + 1, MX.elR, 0, -0.29, 0);
      if (an.wSit > 0.6 && !a.lying) {
        this.E.set(0, an.visYaw, 0, 'YXZ'); this.Q.setFromEuler(this.E);
        MX.out.compose(this.V.set(a.x - Math.sin(an.visYaw) * 0.05, 0, a.z - Math.cos(an.visYaw) * 0.05), this.Q, this.SV.set(scale, scale, scale));
        M.stool.setMatrixAt(cnt.stool++, MX.out);
      }
      const pulse = a.state === STATES.E || ill ? 1 + Math.sin(T * 5 + i) * 0.12 : 1;
      MX.out.makeScale(pulse, 1, pulse);
      MX.out.setPosition(a.x, a.lying ? 0.62 : 0.07, a.z);
      M.ring.setMatrixAt(i, MX.out);
      if (opts.showZones && ill && (mech === 'respiratory' || mech === 'contact')) {
        const zr = zoneR * (1 + Math.sin(T * 3 + i) * 0.05);
        MX.out.makeScale(zr, 1, zr); MX.out.setPosition(a.x, 0.09, a.z);
        M.zone.setMatrixAt(cnt.zone++, MX.out);
      }
      let icon = null;
      if (a.bedIdx >= 0 || severe) icon = 'H';
      else if (ill) icon = 'I';
      else if (a.state === STATES.E) icon = 'E';
      else if (a.state === STATES.R && engine.t - a.stateSince < 3) icon = 'R';
      else if (a.state === STATES.V) icon = 'V';
      if (ill && icon === 'I' && a.uIso < engine.params.isolationRate && !a.lying) icon = 'Q';
      if (icon && opts.showIcons !== false) {
        const b2 = Math.sin(T * 2.2 + i) * 0.06;
        if (a.lying) iconPos.set(a.x, 1.5 + b2, a.z);
        else iconPos.set(a.x, (2.1 - drop) * scale + 0.2 + b2, a.z);
        const s = icon === 'V' || icon === 'R' ? 0.8 : 1;
        iconMat.compose(iconPos, camQ, iconScale.set(s, s, s));
        this.icons[icon].setMatrixAt(iconCount[icon]++, iconMat);
      }
    }
    this.effects = this.effects.filter((e) => T - e.t0 < 4);
    for (const e of this.effects) {
      const k = (T - e.t0) / 4;
      iconPos.set(e.x, 1.4 + k * 1.5, e.z);
      const s = 1.2 * (1 - k * 0.6);
      iconMat.compose(iconPos, camQ, iconScale.set(s, s, s));
      this.icons.D.setMatrixAt(iconCount.D++, iconMat);
    }
    for (const k in cnt) M[k].count = cnt[k];
    for (const t of this.iconTypes) { this.icons[t].count = iconCount[t]; this.icons[t].instanceMatrix.needsUpdate = true; }
    for (const k in M) M[k].instanceMatrix.needsUpdate = true;
    if (colorsChanged) for (const k in M) if (M[k].instanceColor) M[k].instanceColor.needsUpdate = true;

    this.updatePuffs(dt);
    this.updateMosquitoes(engine, T);
    this.updateTransmissionFx(engine, opts, T);
    this.updateAerosols(engine, opts, T);
    this.updateSelection(engine, T);
    this.updateLines(engine, opts);
  }

  hideAgent(i) {
    const M = this.meshes, z = this.zero;
    for (const p of ['pelvis', 'torso', 'neck', 'head', 'nose', 'mouth', 'hairCap', 'ring']) M[p].setMatrixAt(i, z);
    for (const p of ['shoe', 'lowerLeg', 'upperLeg', 'eye', 'upperArm', 'forearm', 'hand']) { M[p].setMatrixAt(i * 2, z); M[p].setMatrixAt(i * 2 + 1, z); }
  }

  spawnPuff(a, yaw, masked, sneeze) {
    const n = masked ? 2 : sneeze ? 12 : 6;
    const dirx = Math.sin(yaw), dirz = Math.cos(yaw);
    const v = masked ? 0.3 : sneeze ? 2.0 : 1.1;
    for (let k = 0; k < n && this.puffs.length < 290; k++) {
      this.puffs.push({
        x: a.x + dirx * 0.3, y: 1.5, z: a.z + dirz * 0.3,
        vx: dirx * v + (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.3) * 0.3, vz: dirz * v + (Math.random() - 0.5) * 0.6,
        age: 0, life: masked ? 0.6 : sneeze ? 1.6 : 1.3
      });
    }
  }

  updatePuffs(dt) {
    const m = this.M.out;
    let n = 0;
    this.puffs = this.puffs.filter((p) => (p.age += dt) < p.life);
    for (const p of this.puffs) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      p.vx *= 0.97; p.vz *= 0.97;
      const k = p.age / p.life;
      const s = (0.25 + k * 1.3) * (k > 0.7 ? (1 - k) / 0.3 : 1);
      m.makeScale(s, s, s); m.setPosition(p.x, p.y, p.z);
      this.puffMesh.setMatrixAt(n++, m);
    }
    this.puffMesh.count = n;
    this.puffMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Efectos de transmisión: se generan SÓLO a partir de contagios reales del motor
   * (engine.transmissions). Respiratorio: chorro de gotículas o aerosoles; contacto: pulsos entre
   * ambas personas; mosquito: destello de picadura; agua: gota y onda en quien bebió.
   */
  updateTransmissionFx(engine, opts, T) {
    const A = engine.agents;
    for (const tr of engine.transmissions) {
      if (this.seenTransmissions.has(tr)) continue;
      this.seenTransmissions.add(tr);
      if (engine.t - tr.t > 0.05 || opts.showFx === false) continue;
      this.fx.push({ tr, t0: T, life: tr.route === 'mosquito' || tr.route === 'agua' ? 1.6 : 2.2 });
    }
    this.fx = this.fx.filter((f) => T - f.t0 < f.life);
    const dm = this.dropMesh, pm = this.pulseMesh, m = this.M.out, c = this.color;
    let nd = 0, np = 0;
    const pulse = (x, z, k, col, y = 0.12, big = 1) => {
      if (np >= 200) return;
      const s = (0.4 + k * 1.6) * big;
      m.makeScale(s, 1, s); m.setPosition(x, y, z);
      pm.setMatrixAt(np, m); pm.setColorAt(np, c.set(col).multiplyScalar(1 - k * 0.7)); np++;
    };
    const drop = (x, y, z, s, col) => {
      if (nd >= 900) return;
      m.makeScale(s, s, s); m.setPosition(x, y, z);
      dm.setMatrixAt(nd, m); dm.setColorAt(nd, c.set(col)); nd++;
    };
    for (const f of this.fx) {
      const k = (T - f.t0) / f.life;
      const b = A[f.tr.to];
      if (!b) continue;
      const a = A[f.tr.from];
      const route = f.tr.route;
      if ((route === 'gotículas' || route === 'aerosol') && a) {
        const N = route === 'aerosol' ? 10 : 16;
        for (let q = 0; q < N; q++) {
          const u = (k * 1.4 + q / N) % 1;
          const jx = Math.sin(q * 12.9 + f.t0) * 0.25, jz = Math.cos(q * 7.3 + f.t0) * 0.25;
          const arcH = route === 'aerosol' ? 0.9 : 0.35;
          drop(lerp(a.x, b.x, u) + jx * Math.sin(u * Math.PI), 1.55 + Math.sin(u * Math.PI) * arcH, lerp(a.z, b.z, u) + jz * Math.sin(u * Math.PI),
            route === 'aerosol' ? 0.8 : 1.1, route === 'aerosol' ? 0xfca5a5 : 0xbae6fd);
        }
        pulse(b.x, b.z, k, 0xf59e0b);
      } else if ((route === 'contacto' || route === 'hogar') && a) {
        pulse(a.x, a.z, k, 0xf97316);
        pulse(b.x, b.z, (k + 0.3) % 1, 0xf97316);
        for (let q = 0; q < 6; q++) { const u = (k * 2 + q / 6) % 1; drop(lerp(a.x, b.x, u), 1.1, lerp(a.z, b.z, u), 0.8, 0xfb923c); }
      } else if (route === 'mosquito') {
        pulse(b.x, b.z, k, 0xdc2626, 0.12, 1.2);
        pulse(b.x, b.z, (k + 0.5) % 1, 0xdc2626, 1.4, 0.4);
      } else if (route === 'agua') {
        pulse(b.x, b.z, k, 0x0ea5e9, 0.12, 1.1);
        for (let q = 0; q < 5; q++) drop(b.x + Math.sin(q * 2) * 0.2, 1.6 - ((k * 2 + q * 0.2) % 1) * 1.4, b.z + Math.cos(q * 2) * 0.2, 1.3, 0x38bdf8);
      } else {
        pulse(b.x, b.z, k, 0xf59e0b);
      }
    }
    dm.count = nd; pm.count = np;
    dm.instanceMatrix.needsUpdate = true; pm.instanceMatrix.needsUpdate = true;
    if (dm.instanceColor) dm.instanceColor.needsUpdate = true;
    if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
  }

  /** Aerosoles suspendidos en interiores, proporcionales a la emisión real calculada por el motor. */
  updateAerosols(engine, opts, T) {
    const mesh = this.aeroMesh;
    if (!opts.showAerosols || engine.mechanism !== 'respiratory' || !engine.airLoad) { mesh.count = 0; return; }
    const vent = engine.params.ventilation;
    const m = this.M.out;
    let n = 0, pi = 0;
    for (const key in engine.airLoad) {
      const p = engine.town.places[key];
      pi++;
      if (!p || !p.indoor) continue;
      const load = engine.airLoad[key] * p.airFactor * (engine.profile.airWeight || 0) * (1 - vent);
      const count = Math.min(60, Math.round(load * 14));
      const r = p.rect;
      for (let k = 0; k < count && n < 900; k++) {
        const s1 = hash(pi, k), s2 = hash(pi, k + 99), s3 = hash(pi, k + 199);
        const flow = vent > 0 ? (T * (0.05 + vent * 0.3) + s2) % 1 : s2; // con ventilación el aire se renueva
        const x = r.x0 + 0.4 + (r.w - 0.8) * ((s1 + Math.sin(T * 0.3 + k) * 0.03 + 1) % 1);
        const z = r.z0 + 0.4 + (r.d - 0.8) * flow;
        const y = 0.6 + s3 * 1.8 + Math.sin(T * 0.8 + k) * 0.1;
        m.makeTranslation(x, y, z);
        mesh.setMatrixAt(n++, m);
      }
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
  }

  updateMosquitoes(engine, T) {
    const ms = engine.mosquitoes;
    const mesh = this.mosqMesh;
    const n = Math.min(ms.length, 3200);
    const m = this.M.out, c = this.color;
    for (let i = 0; i < n; i++) {
      const q = ms[i];
      const biting = engine.t - q.biteAt < 0.02;
      const y = biting ? 1.3 : q.y + Math.sin(T * 6 + q.phase) * 0.25;
      const s = biting ? 4.5 : 3.2;
      this.E.set(Math.sin(T * 30 + q.phase) * 0.1, q.phase + T * 1.5, 0, 'YXZ'); this.Q.setFromEuler(this.E);
      m.compose(this.V.set(q.x + Math.sin(T * 9 + q.phase) * 0.15, y, q.z + Math.cos(T * 7 + q.phase) * 0.15), this.Q, this.SV.set(s, s, s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(q.state === 2 ? 0xdc2626 : q.state === 1 ? 0xf59e0b : 0x27272a));
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }

  updateSelection(engine, T) {
    const a = engine.agents[this.selectedId];
    if (!a || a.state === STATES.D) { this.selRing.visible = false; return; }
    this.selRing.visible = true;
    const s = 1 + Math.sin(T * 4) * 0.1;
    this.selRing.scale.set(s, 1, s);
    this.selRing.position.set(a.x, a.lying ? 0.66 : 0.1, a.z);
  }

  updateLines(engine, opts) {
    const P = this.linePos, C = this.lineCol;
    let n = 0;
    const max = this.linePos.length / 6;
    const push = (x1, y1, z1, x2, y2, z2, r, g, b) => {
      if (n >= max) return;
      const o = n * 6;
      P[o] = x1; P[o + 1] = y1; P[o + 2] = z1; P[o + 3] = x2; P[o + 4] = y2; P[o + 5] = z2;
      C[o] = r; C[o + 1] = g; C[o + 2] = b; C[o + 3] = r; C[o + 4] = g; C[o + 5] = b;
      n++;
    };
    const A = engine.agents;
    const hy = (a) => (a.lying ? 0.9 : 1.7);
    const arc = (a, b, r, g, bl, k = 1) => {
      const segs = 8;
      const d = Math.hypot(b.x - a.x, b.z - a.z);
      let px = a.x, py = hy(a), pz = a.z;
      for (let s = 1; s <= segs; s++) {
        const t = s / segs;
        const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
        const y = hy(a) + (hy(b) - hy(a)) * t + Math.sin(t * Math.PI) * Math.min(4, 0.6 + d * 0.25);
        push(px, py, pz, x, y, z, r * k, g * k, bl * k);
        px = x; py = y; pz = z;
      }
    };
    if (opts.showChains) {
      for (const tr of engine.transmissions) {
        const a = A[tr.from], b = A[tr.to];
        if (!a || !b) continue;
        const k = Math.max(0.25, 1 - (engine.t - tr.t) / 1.5);
        if (tr.route === 'mosquito') arc(a, b, 0.86, 0.15, 0.15, k);
        else arc(a, b, 0.98, 0.75, 0.15, k);
      }
    }
    const sel = A[this.selectedId];
    if (sel && sel.state !== STATES.D) {
      if (sel.infectedBy !== null && A[sel.infectedBy]) arc(A[sel.infectedBy], sel, 0.75, 0.45, 1.0);
      for (const id of sel.secondary) if (A[id]) arc(sel, A[id], 1.0, 0.45, 0.2);
      if (opts.showContacts && engine.hash) {
        engine.forNeighbors(sel.x, sel.z, 2.0, (b) => {
          if (b.id !== sel.id) push(sel.x, hy(sel) - 0.4, sel.z, b.x, hy(b) - 0.4, b.z, 0.2, 0.85, 0.95);
        });
      }
    }
    this.lineGeo.setDrawRange(0, n * 2);
    this.lineGeo.attributes.position.needsUpdate = true;
    this.lineGeo.attributes.color.needsUpdate = true;
  }

  pick(engine, camera, ndcX, ndcY, aspect) {
    const v = new THREE.Vector3();
    let best = -1, bd = 0.0035;
    for (const a of engine.agents) {
      if (a.state === STATES.D) continue;
      v.set(a.x, a.lying ? 0.7 : 1.0, a.z).project(camera);
      if (v.z > 1) continue;
      const dx = (v.x - ndcX) * aspect, dy = v.y - ndcY;
      const d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = a.id; }
    }
    return best;
  }
}
