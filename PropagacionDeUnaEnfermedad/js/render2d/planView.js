/**
 * Mapa epidemiológico 2D (Canvas) — herramienta ANALÍTICA del mismo motor de agentes.
 *
 * Capas: mapa de calor de contagios · personas por estado · densidad de infectados ·
 * rutas de transmisión (por mecanismo) · contactos del seleccionado · vectores ·
 * fuentes de agua contaminadas · nombres de lugares.
 * Línea de tiempo: "en vivo" o revisión de cualquier día pasado a partir de las
 * instantáneas diarias del motor (engine.snapshots) y del registro de contagios (engine.infectionLog).
 *
 * Conserva el comportamiento clásico de la vista 2D: clic para infectar, curar o crear un brote.
 */
import { WORLD, STREET_N, V_STREETS } from '../simulation/townMap.js';
import { STATES, STATE_COLORS } from '../simulation/epiEngine.js';

export const ROUTE_COLORS = {
  'gotículas': '#7dd3fc', aerosol: '#f87171', contacto: '#fb923c', hogar: '#fdba74',
  mosquito: '#ef4444', agua: '#38bdf8', manual: '#e2e8f0', seed: '#facc15'
};

export class PlanView {
  constructor(canvas, engine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;
    this.day = null; // null = en vivo
    this.layers = { heat: true, people: true, density: false, routes: true, contacts: true, vectors: true, sources: true, labels: true };
    this.heat = document.createElement('canvas');
    this.heatKey = '';
    this.hover = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('mousemove', (e) => { const r = canvas.getBoundingClientRect(); this.hover = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    canvas.addEventListener('mouseleave', () => { this.hover = null; });
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.canvas.getBoundingClientRect();
    const w = r.width || (this.canvas.parentElement && this.canvas.parentElement.clientWidth) || 600;
    const h = r.height || (this.canvas.parentElement && this.canvas.parentElement.clientHeight) || 400;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w; this.h = h;
    const sx = (w - 20) / (WORLD.x1 - WORLD.x0 + 4), sz = (h - 20) / (WORLD.z1 - WORLD.z0 + 4);
    this.s = Math.min(sx, sz);
    this.ox = w / 2; this.oz = h / 2;
    this.heatKey = '';
  }

  X(x) { return this.ox + x * this.s; }
  Z(z) { return this.oz + z * this.s; }
  toWorld(px, pz) { return { x: (px - this.ox) / this.s, z: (pz - this.oz) / this.s }; }

  setDay(day) { this.day = day; this.heatKey = ''; }

  pick(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    const p = this.toWorld(clientX - r.left, clientY - r.top);
    let best = -1, bd = Math.max(1.2, 9 / this.s);
    if (this.day === null) {
      for (const a of this.engine.agents) {
        if (a.state === STATES.D) continue;
        const d = Math.hypot(a.x - p.x, a.z - p.z);
        if (d < bd) { bd = d; best = a.id; }
      }
    }
    return { id: best, world: p };
  }

  /** Datos que se dibujan: en vivo o de la instantánea del día elegido. */
  frame() {
    const e = this.engine;
    if (this.day === null || !e.snapshots.length) {
      return { live: true, x: (i) => e.agents[i].x, z: (i) => e.agents[i].z, s: (i) => e.agents[i].state, n: e.agents.length,
        tMax: e.t, water: e.water, mosq: e.mosquitoes };
    }
    const snap = e.snapshots[Math.min(this.day, e.snapshots.length - 1)];
    return { live: false, x: (i) => snap.x[i], z: (i) => snap.z[i], s: (i) => snap.s[i], n: snap.s.length,
      tMax: snap.day + 0.0001, water: snap.water, mosq: snap.mosq.map(([x, z]) => ({ x, z, state: 2 })), day: snap.day };
  }

  /** Mapa de calor: suma de núcleos gaussianos en la ubicación de cada contagio (hasta el día elegido). */
  buildHeat(tMax) {
    const log = this.engine.infectionLog;
    let n = 0;
    while (n < log.length && log[n].t <= tMax) n++;
    const key = `${n}|${this.w}|${this.h}`;
    if (key === this.heatKey) return this.heatCount;
    this.heatKey = key;
    this.heatCount = n;
    const c = this.heat;
    c.width = Math.max(1, Math.round(this.w / 2)); c.height = Math.max(1, Math.round(this.h / 2));
    const x = c.getContext('2d');
    x.clearRect(0, 0, c.width, c.height);
    if (!n) return 0;
    const rad = Math.max(8, 5 * this.s / 2);
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const ev = log[i];
      const px = this.X(ev.x) / 2, pz = this.Z(ev.z) / 2;
      const g = x.createRadialGradient(px, pz, 0, px, pz, rad);
      g.addColorStop(0, 'rgba(255,255,255,0.16)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g;
      x.fillRect(px - rad, pz - rad, rad * 2, rad * 2);
    }
    const img = x.getImageData(0, 0, c.width, c.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = d[i + 3] / 255; // intensidad acumulada (canal alfa sumado)
      if (v <= 0.02) { d[i + 3] = 0; continue; }
      // rampa: amarillo → naranja → rojo → granate
      d[i] = v > 0.75 ? 255 - (v - 0.75) * 380 : 255;
      d[i + 1] = Math.max(20, 225 - v * 230);
      d[i + 2] = Math.max(10, 70 - v * 80);
      d[i + 3] = Math.min(215, 25 + v * 210);
    }
    x.putImageData(img, 0, 0);
    return n;
  }

  render(selectedId, opts = {}) {
    if (!this.w) this.resize();
    const c = this.ctx, e = this.engine, s = this.s, L = this.layers;
    const F = this.frame();
    c.fillStyle = '#0b1220';
    c.fillRect(0, 0, this.w, this.h);
    c.fillStyle = '#16301f';
    c.fillRect(this.X(WORLD.x0), this.Z(WORLD.z0), (WORLD.x1 - WORLD.x0) * s, (WORLD.z1 - WORLD.z0) * s);
    // cuadrícula de 10 m
    c.strokeStyle = 'rgba(148,163,184,0.06)'; c.lineWidth = 1;
    for (let x = WORLD.x0; x <= WORLD.x1; x += 10) { c.beginPath(); c.moveTo(this.X(x), this.Z(WORLD.z0)); c.lineTo(this.X(x), this.Z(WORLD.z1)); c.stroke(); }
    for (let z = WORLD.z0; z <= WORLD.z1; z += 10) { c.beginPath(); c.moveTo(this.X(WORLD.x0), this.Z(z)); c.lineTo(this.X(WORLD.x1), this.Z(z)); c.stroke(); }
    c.fillStyle = '#2b3442';
    for (const z of [STREET_N, -STREET_N]) c.fillRect(this.X(WORLD.x0), this.Z(z - 2.3), (WORLD.x1 - WORLD.x0) * s, 4.6 * s);
    for (const x of V_STREETS) c.fillRect(this.X(x - 1.6), this.Z(-STREET_N), 3.2 * s, 2 * STREET_N * s);
    const fills = { house: '#334155', school: '#57401a', plaza: '#4b463f', market: '#5a2a14', hospital: '#6b7280', park: '#1f5130', well: '#0e7490' };
    for (const k in e.town.places) {
      const p = e.town.places[k], r = p.rect;
      c.fillStyle = fills[p.type] || '#444';
      c.globalAlpha = 0.85;
      c.fillRect(this.X(r.x0), this.Z(r.z0), r.w * s, r.d * s);
      c.globalAlpha = 1;
      c.strokeStyle = 'rgba(255,255,255,0.08)';
      c.strokeRect(this.X(r.x0), this.Z(r.z0), r.w * s, r.d * s);
    }
    const mem = e.town.memorial;
    c.fillStyle = 'rgba(77,124,58,0.6)';
    c.fillRect(this.X(mem.x0), this.Z(mem.z0), mem.w * s, mem.d * s);

    // densidad de infectados (rejilla 6 m)
    if (L.density) {
      const cell = 6, cols = Math.ceil((WORLD.x1 - WORLD.x0) / cell), rows = Math.ceil((WORLD.z1 - WORLD.z0) / cell);
      const g = new Uint16Array(cols * rows);
      let max = 1;
      for (let i = 0; i < F.n; i++) {
        if (F.s(i) !== STATES.I) continue;
        const cx = Math.floor((F.x(i) - WORLD.x0) / cell), cz = Math.floor((F.z(i) - WORLD.z0) / cell);
        if (cx >= 0 && cz >= 0 && cx < cols && cz < rows) max = Math.max(max, ++g[cz * cols + cx]);
      }
      for (let k = 0; k < g.length; k++) {
        if (!g[k]) continue;
        const v = g[k] / max;
        c.fillStyle = `rgba(168,85,247,${0.15 + v * 0.5})`;
        c.fillRect(this.X(WORLD.x0 + (k % cols) * cell), this.Z(WORLD.z0 + Math.floor(k / cols) * cell), cell * s, cell * s);
      }
    }
    // mapa de calor de contagios
    let heatN = 0;
    if (L.heat) {
      heatN = this.buildHeat(F.tMax);
      if (heatN) c.drawImage(this.heat, 0, 0, this.w, this.h);
    }
    // fuentes de agua y su contaminación
    if (L.sources) {
      for (const w of e.town.waterSources) {
        const W = F.water[w.id] || 0;
        const lv = e.mechanism === 'water' ? Math.min(1, W / (W + 5)) : 0;
        c.beginPath(); c.arc(this.X(w.x), this.Z(w.z), 1.3 * s, 0, Math.PI * 2);
        c.fillStyle = lv > 0.05 ? `rgb(${56 + 90 * lv},${189 - 70 * lv},${248 - 200 * lv})` : '#38bdf8';
        c.fill();
        if (lv > 0.05) {
          c.strokeStyle = `rgba(132,204,22,${0.4 + lv * 0.5})`; c.lineWidth = 2 + lv * 4;
          c.beginPath(); c.arc(this.X(w.x), this.Z(w.z), (1.8 + lv * 3) * s, 0, Math.PI * 2); c.stroke();
          c.fillStyle = '#ecfccb'; c.font = '600 10px system-ui';
          c.fillText(`W=${W.toFixed(1)}`, this.X(w.x) + 2.4 * s, this.Z(w.z));
        }
      }
    }
    // zonas de contagio (en vivo)
    if (F.live && opts.showZones && (e.mechanism === 'respiratory' || e.mechanism === 'contact')) {
      const zr = (e.mechanism === 'contact' ? 1.5 : 3) * s;
      c.strokeStyle = 'rgba(239,68,68,0.35)';
      for (const a of e.agents) if (a.state === STATES.I) { c.beginPath(); c.arc(this.X(a.x), this.Z(a.z), zr, 0, Math.PI * 2); c.stroke(); }
    }
    // vectores
    if (L.vectors && F.mosq.length) {
      for (const m of F.mosq) {
        c.fillStyle = m.state === 2 ? '#ef4444' : m.state === 1 ? '#f59e0b' : 'rgba(148,163,184,0.35)';
        c.fillRect(this.X(m.x) - 1, this.Z(m.z) - 1, m.state ? 2.5 : 1.5, m.state ? 2.5 : 1.5);
      }
    }
    // rutas de transmisión (todas hasta el día elegido)
    if (L.routes) {
      c.lineWidth = 1.2;
      for (const ev of e.infectionLog) {
        if (ev.t > F.tMax) break;
        if (ev.from < 0 && ev.route !== 'mosquito') continue;
        const age = F.tMax - ev.t;
        c.strokeStyle = ROUTE_COLORS[ev.route] || '#facc15';
        c.globalAlpha = Math.max(0.12, 0.85 - age / 20);
        c.beginPath(); c.moveTo(this.X(ev.fx), this.Z(ev.fz)); c.lineTo(this.X(ev.x), this.Z(ev.z)); c.stroke();
      }
      c.globalAlpha = 1;
    }
    // personas
    if (L.people) {
      const r = Math.max(2, 0.55 * s);
      for (let i = 0; i < F.n; i++) {
        const st = F.s(i);
        if (st === STATES.D) continue;
        c.beginPath();
        c.arc(this.X(F.x(i)), this.Z(F.z(i)), st === STATES.I ? r * 1.3 : r, 0, Math.PI * 2);
        c.fillStyle = STATE_COLORS[st];
        c.fill();
        if (st === STATES.I) { c.strokeStyle = '#fff'; c.lineWidth = 0.8; c.stroke(); }
      }
    }
    // contactos del seleccionado
    const sel = F.live ? e.agents[selectedId] : null;
    if (sel && sel.state !== STATES.D) {
      if (L.contacts && e.hash) {
        c.strokeStyle = 'rgba(34,211,238,0.8)';
        e.forNeighbors(sel.x, sel.z, 2, (b) => { if (b !== sel) { c.beginPath(); c.moveTo(this.X(sel.x), this.Z(sel.z)); c.lineTo(this.X(b.x), this.Z(b.z)); c.stroke(); } });
      }
      c.strokeStyle = '#fff'; c.lineWidth = 2;
      c.beginPath(); c.arc(this.X(sel.x), this.Z(sel.z), Math.max(2, 0.55 * s) + 4, 0, Math.PI * 2); c.stroke();
    }
    if (L.labels) {
      c.font = '600 11px system-ui, sans-serif';
      for (const k in e.town.places) {
        const p = e.town.places[k];
        if (p.type === 'house' || p.type === 'well') continue;
        c.fillStyle = 'rgba(248,250,252,0.85)';
        c.fillText(p.name, this.X(p.rect.x0) + 4, this.Z(p.rect.z0) + 13);
      }
    }
    this.drawLegend(F, heatN);
    this.drawHover(F);
  }

  drawLegend(F, heatN) {
    const c = this.ctx;
    const x0 = 10, y0 = this.h - 58;
    c.fillStyle = 'rgba(9,13,22,0.82)';
    c.fillRect(x0, y0, 250, 50);
    c.fillStyle = '#e2e8f0'; c.font = '600 11px system-ui, sans-serif';
    c.fillText(F.live ? `En vivo · día ${Math.floor(this.engine.t)}` : `Revisión histórica · día ${F.day}`, x0 + 8, y0 + 15);
    const g = c.createLinearGradient(x0 + 8, 0, x0 + 150, 0);
    g.addColorStop(0, 'rgba(255,230,80,0.6)'); g.addColorStop(0.5, '#f97316'); g.addColorStop(1, '#7f1d1d');
    c.fillStyle = g; c.fillRect(x0 + 8, y0 + 22, 142, 8);
    c.fillStyle = '#94a3b8'; c.font = '10px system-ui';
    c.fillText(`Calor = contagios acumulados (${heatN})`, x0 + 8, y0 + 43);
    // barra de escala 10 m
    c.strokeStyle = '#e2e8f0'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x0 + 170, y0 + 26); c.lineTo(x0 + 170 + 10 * this.s, y0 + 26); c.stroke();
    c.fillText('10 m', x0 + 172, y0 + 40);
  }

  drawHover(F) {
    if (!this.hover || !F.live) return;
    const p = this.toWorld(this.hover.x, this.hover.y);
    let best = null, bd = Math.max(1.2, 8 / this.s);
    for (const a of this.engine.agents) {
      if (a.state === STATES.D) continue;
      const d = Math.hypot(a.x - p.x, a.z - p.z);
      if (d < bd) { bd = d; best = a; }
    }
    if (!best) return;
    const c = this.ctx;
    const t = `${best.name} #${best.id} · ${['Susceptible', 'Expuesto', 'Infectado', 'Recuperado', 'Fallecido', 'Vacunado'][best.state]}`;
    c.font = '600 11px system-ui';
    const w = c.measureText(t).width + 14;
    const x = Math.min(this.hover.x + 12, this.w - w - 4), y = this.hover.y - 10;
    c.fillStyle = 'rgba(9,13,22,0.92)'; c.fillRect(x, y - 14, w, 20);
    c.fillStyle = '#f8fafc'; c.fillText(t, x + 7, y);
  }

  /** Estadísticas por lugar y por vía (para el panel lateral del mapa). */
  stats() {
    const e = this.engine;
    const tMax = this.day === null ? Infinity : (e.snapshots[Math.min(this.day, e.snapshots.length - 1)] || {}).day + 0.0001;
    const byPlace = {}, byRoute = {};
    let total = 0;
    for (const ev of e.infectionLog) {
      if (ev.t > tMax) break;
      if (ev.route === 'seed') continue;
      total++;
      let name = 'Calle';
      if (ev.place && e.town.places[ev.place]) {
        const p = e.town.places[ev.place];
        name = p.type === 'house' ? 'Viviendas' : p.name;
      } else if (ev.place && ev.place.startsWith('water')) name = e.town.waterSources[+ev.place.slice(5)].name;
      byPlace[name] = (byPlace[name] || 0) + 1;
      byRoute[ev.route] = (byRoute[ev.route] || 0) + 1;
    }
    return { total, byPlace, byRoute };
  }
}
