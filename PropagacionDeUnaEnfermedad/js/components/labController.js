/**
 * Controlador del laboratorio virtual (v6): une el motor de agentes con la vista 3D,
 * el mapa 2D analítico, el HUD, la ficha individual, la cámara cinematográfica,
 * la "cámara de contagios" y el panel didáctico. Contiene el único bucle de animación.
 */
import { EpiEngine, STATES, STATE_NAMES } from '../simulation/epiEngine.js';
import { MECHANISMS } from '../simulation/diseaseProfiles.js';
import { Lab3D } from '../render3d/lab3d.js';
import { PlanView, ROUTE_COLORS } from '../render2d/planView.js';
import { DidacticPanel, contagionMath } from './didacticPanel.js';
import { tex } from './mathExplorer.js';

export const DAYS_PER_SECOND_1X = 1 / 30; // a 1x, un día simulado dura 30 s reales

const ROLE = { child: 'Niño/a', adult: 'Adulto/a', elder: 'Persona mayor' };
const PLACE_ICON = { house: '🏠', school: '🏫', plaza: '⛲', market: '🛒', hospital: '🏥', park: '🌳', well: '🪣' };
const STATE_ICON = ['🙂', '❓', '🤒', '💚', '🕯️', '🛡️'];
export const ROUTE_NAME = { 'gotículas': 'Gotículas', aerosol: 'Aerosoles', contacto: 'Contacto directo', hogar: 'Convivencia en el hogar', mosquito: 'Picadura de mosquito', agua: 'Agua contaminada', manual: 'Usuario', seed: 'Caso índice' };

export class LabController {
  constructor(callbacks = {}) {
    this.cb = callbacks;
    this.engine = new EpiEngine();
    this.running = false;
    this.speed = 1;
    this.selectedId = -1;
    this.tool = 'select';
    this.pauseOnInfection = false;
    this.contagionCam = false;
    this.lastFrame = performance.now();
    this.uiTimer = 0;
    this.lastDay = 0;
    this.slowUntil = 0;
    this.dom = {
      viewport: document.getElementById('lab-viewport'),
      plan: document.getElementById('plan-canvas'),
      hud: document.getElementById('lab-hud'),
      inspector: document.getElementById('lab-inspector'),
      toast: document.getElementById('lab-toast'),
      feed: document.getElementById('event-feed'),
      concepts: document.getElementById('concepts-panel'),
      mechBadge: document.getElementById('lab-mechanism'),
      card: document.getElementById('contagion-card'),
      mapStats: document.getElementById('map-stats'),
      mapDay: document.getElementById('map-day'),
      mapDayLabel: document.getElementById('map-day-label')
    };
    this.lab3d = new Lab3D(this.dom.viewport, this.engine);
    this.plan = new PlanView(this.dom.plan, this.engine);
    this.didactic = new DidacticPanel(this.dom.feed, this.dom.concepts);
    this.didactic.onSelect = (id) => { this.cb.onNavigate && this.cb.onNavigate('sim'); this.select(id, true); };
    this.engine.on((ev) => this.onEngineEvent(ev));
    this.bindUI();
    requestAnimationFrame((t) => this.loop(t));
  }

  configure(disease, params) {
    this.engine.setDisease(disease);
    this.engine.setParams(params);
  }

  reset(opts) {
    this.pause();
    this.engine.reset(opts);
    this.selectedId = -1;
    this.lastDay = 0;
    this.peakAnnounced = false;
    if (this.lab3d.ok) this.lab3d.onEngineReset();
    this.plan.setDay(null);
    this.didactic.clear();
    this.didactic.renderConcepts(this.engine);
    this.updateMechanismUI();
    this.renderInspector();
    this.hideCard();
    this.updateHUD();
    this.updateMapPanel();
    if (this.cb.onDay) this.cb.onDay(this.engine);
    this.renderOnce = true;
  }

  setParams(p) {
    this.engine.setParams(p);
    clearTimeout(this._conceptTimer);
    this._conceptTimer = setTimeout(() => this.didactic.renderConcepts(this.engine), 250);
  }

  get isRunning() { return this.running; }
  play() { this.running = true; this.lastFrame = performance.now(); if (this.cb.onRunState) this.cb.onRunState(true); }
  pause() { this.running = false; if (this.cb.onRunState) this.cb.onRunState(false); }
  toggle() { if (this.running) this.pause(); else this.play(); }
  setSpeed(s) { this.speed = s; }

  stepDay() {
    for (let k = 0; k < 4; k++) this.engine.advance(0.25);
    this.afterAdvance();
    this.renderOnce = true;
  }

  randomOutbreak(n = 5) { const k = this.engine.randomOutbreak(n); this.toast(`💥 Brote: ${k} persona(s) infectadas al azar`); this.afterAdvance(); }
  vaccinateFraction(f) { const k = this.engine.vaccinateFraction(f); this.toast(`💉 Jornada de vacunación: ${k} persona(s) protegidas`); this.afterAdvance(); }

  loop(now) {
    const dt = Math.min(0.1, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (this.running) {
      const sp = now < this.slowUntil ? Math.min(this.speed, 0.3) : this.speed; // cámara lenta al enfocar un contagio
      this.engine.advance(dt * sp * DAYS_PER_SECOND_1X);
      this.afterAdvance();
    }
    if (this.dom.viewport.offsetParent !== null && this.lab3d.ok) this.lab3d.render(dt, this.selectedId);
    if (this.dom.plan.offsetParent !== null) this.plan.render(this.selectedId, this.lab3d.opts);
    this.uiTimer += dt;
    if (this.uiTimer > 0.25 || this.renderOnce) {
      this.uiTimer = 0;
      this.renderOnce = false;
      this.updateHUD();
      if (this.selectedId >= 0) this.renderInspector();
      if (this.dom.plan.offsetParent !== null) this.updateMapPanel();
      if (this.cb.onStats) this.cb.onStats(this.engine);
    }
    requestAnimationFrame((t) => this.loop(t));
  }

  afterAdvance() {
    const day = Math.floor(this.engine.t);
    if (day !== this.lastDay) {
      this.lastDay = day;
      this.didactic.flushVaccinations(this.engine);
      this.checkPeak();
      if (this.cb.onDay) this.cb.onDay(this.engine);
    }
  }

  /** Detecta el pico de infectados de los agentes y lo explica. */
  checkPeak() {
    if (this.peakAnnounced) return;
    const h = this.engine.history;
    let mx = 0, md = 0;
    for (const x of h) if (x.I > mx) { mx = x.I; md = x.day; }
    const now = h[h.length - 1];
    if (mx >= 4 && now && now.day - md >= 3 && now.I < mx * 0.85) {
      this.peakAnnounced = true;
      this.didactic.addPeak(this.engine, md, mx, h.find((x) => x.day === md));
      this.toast(`🏔️ Pico de la epidemia (agentes): día ${md}, ${mx} infectados simultáneos`);
      if (this.cb.onPeak) this.cb.onPeak(md, mx);
    }
  }

  onEngineEvent(ev) {
    if (this.engine.calibrating) return;
    this.didactic.add(ev, this.engine);
    if (ev.type !== 'infection') return;
    if (this.pauseOnInfection) {
      this.pauseOnInfection = false;
      document.getElementById('btn-explain-next')?.classList.remove('active');
      this.pause();
      this.select(ev.agentId, false);
      this.focusEvent(ev, true);
      return;
    }
    if (this.contagionCam && this.running && performance.now() > (this.camCooldown || 0)) {
      this.camCooldown = performance.now() + 6000;
      this.slowUntil = performance.now() + 2600;
      this.focusEvent(ev, false);
    }
  }

  focusEvent(ev, sticky) {
    const a = this.engine.agents[ev.agentId];
    if (a && this.lab3d.ok && this.dom.viewport.offsetParent !== null) this.lab3d.setCameraMode('event', a);
    this.showCard(ev, sticky);
  }

  showCard(ev, sticky) {
    const el = this.dom.card;
    if (!el) return;
    const e = this.engine;
    const a = e.agents[ev.agentId];
    const src = ev.otherId >= 0 ? e.agents[ev.otherId] : null;
    const mech = MECHANISMS[e.mechanism];
    const m = contagionMath(ev, e);
    el.innerHTML = `
      <button class="cc-x" data-cc="close" title="Cerrar">✕</button>
      <div class="cc-kicker" style="color:${ROUTE_COLORS[ev.route] || '#facc15'}">${mech.icon} ${ROUTE_NAME[ev.route] || ev.route} · Día ${ev.day} · ${ev.clock}</div>
      <div class="cc-title">${src ? `${src.name} #${src.id} → ` : ''}<b>${a.name} #${a.id}</b></div>
      <p>${src ? `Contagio en <b>${ev.place}</b>.` : 'Contagio desde el ambiente.'} ${a.name} pasa a <b>${e.hasE ? 'EXPUESTO' : 'INFECTADO'}</b>.</p>
      <div class="cc-cols">
        <div class="cc-box abm"><div class="cc-lab">🎲 Agente (probabilístico)</div>${tex(m.agentTex)}<small>${m.agentText}</small></div>
        <div class="cc-box ode"><div class="cc-lab">📈 EDO (esperado, determinista)</div>${tex(m.odeTex)}<small>${m.odeText}</small></div>
      </div>
      <div class="cc-next">Evolución: ${e.hasE ? `incubará ≈ ${e.params.incubationDays} d (σ) → contagiará ≈ ${e.params.infectiousDays} d (γ)` : `contagiará ≈ ${e.params.infectiousDays} d (γ)`}.</div>
      <div class="cc-actions"><button class="btn-sim btn-small" data-cc="follow">🎥 Seguir a ${a.name}</button><button class="btn-sim btn-small" data-cc="resume">▶ Continuar</button></div>`;
    el.dataset.agent = a.id;
    el.classList.add('show');
    clearTimeout(this._cardT);
    if (!sticky) this._cardT = setTimeout(() => this.hideCard(), 7000);
  }

  hideCard() { this.dom.card && this.dom.card.classList.remove('show'); }

  bindUI() {
    document.querySelectorAll('[data-tool]').forEach((b) => b.addEventListener('click', () => {
      this.tool = b.dataset.tool;
      document.querySelectorAll('[data-tool]').forEach((x) => x.classList.toggle('active', x === b));
      this.dom.viewport.dataset.tool = this.tool;
    }));
    const tg = (id, key, fn) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', () => { this.lab3d.opts[key] = el.checked; if (fn) fn(el.checked); this.renderOnce = true; });
      this.lab3d.opts[key] = el.checked;
    };
    tg('tg-zones', 'showZones');
    tg('tg-chains', 'showChains');
    tg('tg-contacts', 'showContacts');
    tg('tg-fx', 'showFx');
    tg('tg-aerosols', 'showAerosols');
    tg('tg-icons', 'showIcons');
    tg('tg-labels', 'labels');
    tg('tg-roofs', 'roofs');
    tg('tg-shadows', 'shadows', (v) => this.lab3d.ok && this.lab3d.setShadows(v));
    const cc = document.getElementById('tg-contagion-cam');
    if (cc) cc.addEventListener('change', () => { this.contagionCam = cc.checked; this.toast(cc.checked ? '📸 Cámara de contagios: enfocará automáticamente los nuevos contagios.' : 'Cámara de contagios desactivada.'); });
    document.querySelectorAll('[data-cam]').forEach((b) => b.addEventListener('click', () => {
      if (!this.lab3d.ok) return;
      const mode = b.dataset.cam;
      const sel = this.engine.agents[this.selectedId];
      if ((mode === 'close' || mode === 'follow') && !sel) { this.toast('Primero selecciona a una persona (herramienta 🔍 y clic).'); return; }
      this.lab3d.setCameraMode(mode, sel || null);
    }));
    document.getElementById('btn-explain-next')?.addEventListener('click', (e) => {
      this.pauseOnInfection = !this.pauseOnInfection;
      e.currentTarget.classList.toggle('active', this.pauseOnInfection);
      if (this.pauseOnInfection && !this.running) this.play();
      this.toast(this.pauseOnInfection ? '🔎 La simulación se pausará en el próximo contagio.' : 'Modo explicación desactivado.');
    });
    document.querySelectorAll('[data-layers-toggle]').forEach((b) => b.addEventListener('click', (ev) => {
      ev.stopPropagation();
      document.getElementById('layers-pop').classList.toggle('open');
    }));
    document.addEventListener('click', (ev) => {
      const pop = document.getElementById('layers-pop');
      if (pop && pop.classList.contains('open') && !pop.contains(ev.target)) pop.classList.remove('open');
    });
    this.dom.card?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cc]');
      if (!b) return;
      const id = +this.dom.card.dataset.agent;
      if (b.dataset.cc === 'close') this.hideCard();
      if (b.dataset.cc === 'follow') { this.select(id); this.lab3d.ok && this.lab3d.setCameraMode('follow', this.engine.agents[id]); this.hideCard(); }
      if (b.dataset.cc === 'resume') { this.hideCard(); this.play(); }
    });

    const handle = (id, world) => {
      const e = this.engine;
      const a = e.agents[id];
      switch (this.tool) {
        case 'select': this.select(id); break;
        case 'infect':
          if (a && e.manualInfect(id)) this.toast(`🦠 ${a.name} #${id} fue infectado`);
          else if (world) this.toast(`💥 Brote local: ${e.outbreakAt(world.x, world.z, 3)} persona(s)`);
          break;
        case 'vaccinate':
          if (a && e.manualVaccinate(id)) this.toast(`💉 ${a.name} #${id} vacunado`);
          else if (a) this.toast('Sólo se puede vacunar a personas susceptibles (sanas).');
          break;
        case 'cure':
          if (a && e.manualCure(id)) this.toast(`💊 ${a.name} #${id} recibió tratamiento`);
          break;
        case 'outbreak':
          if (world) this.toast(`💥 Brote local: ${e.outbreakAt(world.x, world.z, 5)} persona(s)`);
          break;
      }
      if (id >= 0 && this.tool !== 'select') this.select(id);
      this.renderOnce = true;
    };
    if (this.lab3d.ok) {
      this.lab3d.controls.onClick = (x, y) => {
        const id = this.lab3d.pick(x, y);
        const gp = this.lab3d.groundPoint(x, y);
        handle(id, gp ? { x: gp.x, z: gp.z } : null);
      };
      this.lab3d.controls.onUserMove = () => { if (this.lab3d.opts.follow) this.lab3d.opts.follow = false; };
    }
    this.dom.plan.addEventListener('click', (ev) => {
      if (this.plan.day !== null) { this.toast('Estás viendo un día pasado. Pulsa “En vivo” para interactuar.'); return; }
      const r = this.plan.pick(ev.clientX, ev.clientY);
      if (this.tool === 'select' && r.id < 0) { this.select(-1); return; }
      handle(r.id, r.world);
    });
    document.querySelectorAll('[data-maplayer]').forEach((c) => c.addEventListener('change', () => { this.plan.layers[c.dataset.maplayer] = c.checked; }));
    this.dom.mapDay?.addEventListener('input', () => {
      const d = +this.dom.mapDay.value;
      this.plan.setDay(d >= this.engine.snapshots.length - 1 ? null : d);
      this.updateMapPanel();
    });
    document.getElementById('map-live')?.addEventListener('click', () => { this.plan.setDay(null); this.updateMapPanel(); });

    this.dom.inspector.addEventListener('click', (ev) => {
      const t = ev.target.closest('[data-act]');
      if (!t) return;
      const id = this.selectedId;
      const e = this.engine;
      const act = t.dataset.act;
      if (act === 'close') this.select(-1);
      else if (act === 'vaccinate') { if (!e.manualVaccinate(id)) this.toast('Sólo se vacuna a personas susceptibles.'); }
      else if (act === 'infect') { if (!e.manualInfect(id)) this.toast('Sólo se infecta a personas sanas, recuperadas o vacunadas.'); }
      else if (act === 'cure') e.manualCure(id);
      else if (act === 'follow') { if (this.lab3d.opts.follow) this.lab3d.opts.follow = false; else this.lab3d.setCameraMode('follow', e.agents[id]); }
      else if (act === 'close-up') this.lab3d.setCameraMode('close', e.agents[id]);
      else if (act === 'goto') this.select(+t.dataset.id, true);
      this.renderInspector();
    });
  }

  /** Revisión histórica: muestra en el mapa la ciudad de un día concreto. */
  showDayOnMap(day) {
    this.plan.setDay(Math.min(day, this.engine.snapshots.length - 1));
    this.updateMapPanel();
  }

  resize() {
    this.plan.resize();
    if (this.lab3d.ok) this.lab3d.resize();
  }

  select(id, fly = false) {
    this.selectedId = id;
    if (id < 0 && this.lab3d.opts) this.lab3d.opts.follow = false;
    if (fly && id >= 0 && this.lab3d.ok) this.lab3d.setCameraMode('event', this.engine.agents[id]);
    this.renderInspector();
  }

  toast(msg) {
    const t = this.dom.toast;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => t.classList.remove('show'), 2800);
  }

  updateMechanismUI() {
    const mech = MECHANISMS[this.engine.mechanism];
    if (this.dom.mechBadge) this.dom.mechBadge.textContent = `${mech.icon} ${mech.name}`;
    document.querySelectorAll('[data-mech]').forEach((el) => { el.style.display = el.dataset.mech === this.engine.mechanism ? '' : 'none'; });
  }

  updateMapPanel() {
    const e = this.engine;
    if (this.dom.mapDay) {
      const max = Math.max(0, e.snapshots.length - 1);
      this.dom.mapDay.max = max;
      if (this.plan.day === null) this.dom.mapDay.value = max;
      const d = this.plan.day === null ? Math.floor(e.t) : this.plan.day;
      this.dom.mapDayLabel.textContent = this.plan.day === null ? `En vivo · día ${d}` : `Día ${d} (histórico)`;
      document.getElementById('map-live')?.classList.toggle('active', this.plan.day === null);
    }
    if (!this.dom.mapStats) return;
    const st = this.plan.stats();
    const places = Object.entries(st.byPlace).sort((a, b) => b[1] - a[1]).slice(0, 7);
    const routes = Object.entries(st.byRoute).sort((a, b) => b[1] - a[1]);
    const mx = places.length ? places[0][1] : 1;
    const snap = this.plan.day === null ? null : e.snapshots[this.plan.day];
    let c = e.counts;
    if (snap) {
      const k = [0, 0, 0, 0, 0, 0];
      for (const s of snap.s) k[s]++;
      c = { S: k[0], E: k[1], I: k[2], R: k[3], D: k[4], V: k[5] };
    }
    this.dom.mapStats.innerHTML = `
      <div class="ms-counts">${['S', 'E', 'I', 'R', 'D', 'V'].map((k) => `<span class="st-${k}"><b>${c[k]}</b>${k}</span>`).join('')}</div>
      <h4>📍 Dónde ocurren los contagios (${st.total})</h4>
      ${places.length ? places.map(([n, v]) => `<div class="ms-bar"><span>${n}</span><i style="width:${(v / mx) * 100}%"></i><b>${v}</b></div>`).join('') : '<p class="muted">Aún no hay contagios registrados.</p>'}
      <h4>🧬 Vías de transmisión</h4>
      ${routes.map(([r, v]) => `<div class="ms-route"><i style="background:${ROUTE_COLORS[r] || '#facc15'}"></i>${ROUTE_NAME[r] || r}<b>${v}</b></div>`).join('') || '<p class="muted">—</p>'}
      <p class="muted small">Interpretación: las zonas más calientes son los lugares donde coinciden más personas durante más tiempo. Compáralas con las rutinas (escuela, mercado, hogares).</p>`;
  }

  updateHUD() {
    const e = this.engine;
    const c = e.counts || e.countStates();
    const rt = e.estimateRt();
    const h = e.clockHour;
    const isDay = h >= 6.5 && h < 18.5;
    const chip = (cls, icon, label, v, tip) => `<div class="hud-chip ${cls}" title="${tip || label}"><span>${icon}</span><b>${v}</b><small>${label}</small></div>`;
    this.dom.hud.innerHTML = `
      <div class="hud-time">${isDay ? '☀️' : '🌙'} <b>Día ${Math.floor(e.t)}</b> · ${e.clockString()}
        <span class="hud-tag">Agentes · estocástico</span></div>
      <div class="hud-chips">
        ${chip('c-s', '🙂', 'S', c.S, 'Susceptibles')}
        ${e.hasE ? chip('c-e', '❓', 'E', c.E, 'Expuestos (incubando)') : ''}
        ${chip('c-i', '🤒', 'I', c.I, 'Infectados')}
        ${chip('c-r', '💚', 'R', c.R, 'Recuperados')}
        ${chip('c-d', '🕯️', 'D', c.D, 'Fallecidos')}
        ${chip('c-v', '🛡️', 'V', c.V, 'Vacunados')}
        ${chip('c-h', '🏥', `${c.H}/${c.beds}`, c.H, 'Camas ocupadas / disponibles')}
      </div>
      <div class="hud-row">
        <span title="Contagios nuevos hoy">Nuevos: <b>${c.newToday}</b></span>
        <span title="Contagios acumulados">Acum.: <b>${c.cumulative}</b></span>
        <span title="Rt estimado de los agentes (7 días)">Rₜ: <b>${rt === null ? '—' : rt.toFixed(2)}</b></span>
        ${c.waiting ? `<span class="hud-alert">⚠️ ${c.waiting} grave(s) sin cama</span>` : ''}
      </div>`;
  }

  renderInspector() {
    const el = this.dom.inspector;
    const e = this.engine;
    const a = e.agents[this.selectedId];
    if (!a) { el.classList.remove('open'); el.innerHTML = ''; return; }
    el.classList.add('open');
    const place = a.placeKey ? e.town.places[a.placeKey] : null;
    const where = a.state === STATES.D ? 'Jardín memorial'
      : place ? `${PLACE_ICON[place.type] || ''} ${place.name}` : `🚶 En camino a ${e.town.places[a.destKey]?.name || '—'}`;
    const days = (t) => (t === null || t === undefined ? '—' : `día ${t.toFixed(1)}`);
    let timer = '', prog = 0;
    if (a.state === STATES.E) { timer = `Fin de incubación: ${days(a.incEnd)} (faltan ${Math.max(0, a.incEnd - e.t).toFixed(1)} d)`; prog = (e.t - a.stateSince) / Math.max(0.01, a.incEnd - a.stateSince); }
    if (a.state === STATES.I) { timer = `Fin del periodo infeccioso: ${days(a.infEnd)} (faltan ${Math.max(0, a.infEnd - e.t).toFixed(1)} d)`; prog = (e.t - a.infStart) / Math.max(0.01, a.infEnd - a.infStart); }
    const masked = a.uMask < e.params.maskUsageRate;
    const dist = a.uDist < e.params.socialDistancingRate;
    const infector = a.infectedBy !== null && e.agents[a.infectedBy]
      ? `<a data-act="goto" data-id="${a.infectedBy}">${e.agents[a.infectedBy].name} #${a.infectedBy}</a>` : (a.infectedRoute === 'seed' ? 'Caso índice' : a.infectedRoute === 'manual' ? 'Usuario' : '—');
    const sec = a.secondary.slice(-12).map((id) => `<a data-act="goto" data-id="${id}">#${id}</a>`).join(' ');
    const hist = a.history.slice(-10).reverse().map((h) =>
      `<li><span class="h-day">D${h.t.toFixed(1)}</span><span class="h-st">${STATE_ICON[h.state]}</span>${h.text}</li>`).join('');
    const sevTxt = a.state === STATES.I ? (a.severe ? (a.bedIdx >= 0 ? `Grave — hospitalizado (cama ${a.bedIdx + 1})` : e.t >= a.severeAt ? 'Grave — sin cama' : 'Evolucionará a grave') : a.restHome ? 'Leve — reposo en casa' : 'Leve') : '—';
    el.innerHTML = `
      <div class="insp-head">
        <div class="insp-avatar st-bg-${a.state}">${STATE_ICON[a.state]}</div>
        <div><div class="insp-name">${a.name} <span class="ev-id">#${a.id}</span></div>
        <div class="insp-sub">${ROLE[a.role]} · ${a.age} años · ${e.town.places[a.homeKey].name}</div></div>
        <button class="insp-close" data-act="close" title="Cerrar">✕</button>
      </div>
      <div class="insp-state st-bg-${a.state}">${STATE_NAMES[a.state].toUpperCase()}<small> desde el día ${a.stateSince.toFixed(1)}</small></div>
      ${timer ? `<div class="insp-timer">⏱ ${timer}<div class="insp-prog"><i style="width:${Math.min(100, prog * 100)}%"></i></div></div>` : ''}
      <div class="insp-grid">
        <div><span>Ubicación</span><b>${where}</b></div>
        <div><span>Gravedad</span><b>${sevTxt}</b></div>
        <div><span>Se contagió</span><b>${a.infectedDay !== null ? days(a.infectedDay) : 'Nunca'}</b></div>
        <div><span>Contagiado por</span><b>${infector}</b></div>
        <div><span>Vía / lugar</span><b>${a.infectedRoute ? `${ROUTE_NAME[a.infectedRoute] || a.infectedRoute} · ${a.infectedPlaceName || ''}` : '—'}</b></div>
        <div><span>Ha contagiado a</span><b>${a.secondary.length} persona(s)</b></div>
        <div><span>Contactos ≤2 m hoy</span><b>${a.contactsToday.size}</b></div>
        <div><span>Contactos acumulados</span><b>${a.contactsTotal + a.contactsToday.size}</b></div>
        <div><span>Mascarilla</span><b>${masked ? '😷 Sí' : 'No'}</b></div>
        <div><span>Distanciamiento</span><b>${dist ? '↔️ Sí' : 'No'}</b></div>
        <div><span>Dosis actual λ</span><b>${a.lambdaNow > 0 ? a.lambdaNow.toFixed(4) : '0'}</b></div>
        <div><span>Velocidad</span><b>${a.moving ? `${a.speed.toFixed(0)} m/h` : a.lying ? 'En cama' : 'Detenido'}</b></div>
      </div>
      ${sec ? `<div class="insp-sec"><span>Contagios causados:</span> ${sec}</div>` : ''}
      <div class="insp-actions">
        <button data-act="vaccinate" ${a.state !== STATES.S ? 'disabled' : ''}>💉 Vacunar</button>
        <button data-act="infect" ${[STATES.S, STATES.R, STATES.V].includes(a.state) ? '' : 'disabled'}>🦠 Infectar</button>
        <button data-act="cure" ${[STATES.E, STATES.I].includes(a.state) ? '' : 'disabled'}>💊 Tratar</button>
        <button data-act="close-up" ${this.lab3d.ok ? '' : 'disabled'}>🔍 Primer plano</button>
        <button data-act="follow" class="${this.lab3d.opts && this.lab3d.opts.follow ? 'active' : ''}" ${this.lab3d.ok ? '' : 'disabled'}>🎥 Seguir</button>
      </div>
      <div class="insp-hist-title">Historial clínico</div>
      <ul class="insp-hist">${hist}</ul>`;
  }
}
