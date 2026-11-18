/**
 * Modo "APRENDER LA EPIDEMIA": recorrido guiado de 10 etapas sobre la simulación REAL.
 * Cada etapa: acción en la ciudad (cámara, velocidad, brote) · explicación breve · fórmula ·
 * variables · pregunta de comprensión · botones Repetir / Continuar.
 * Lo que se ve son eventos reales del motor: el recorrido sólo controla la cámara y el tiempo.
 */
import { tex, VARS } from './mathExplorer.js';
import { STATES } from '../simulation/epiEngine.js';
import { MECHANISMS } from '../simulation/diseaseProfiles.js';
import { getPathogen, PATHOGEN_TYPES } from '../data/pathogens.js';

const f = (x, d = 2) => Number(x).toLocaleString('es-CO', { maximumFractionDigits: d });

export class LearnTour {
  constructor(panel, ctx) {
    this.panel = panel;   // contenedor del panel guía
    this.ctx = ctx;       // { app, lab }
    this.i = -1;
    this.active = false;
    this.timer = null;
    panel.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tour]');
      if (!b) return;
      const act = b.dataset.tour;
      if (act === 'next') this.go(this.i + 1);
      else if (act === 'prev') this.go(this.i - 1);
      else if (act === 'repeat') this.go(this.i, true);
      else if (act === 'exit') this.stop();
      else if (act === 'answer') this.answer(+b.dataset.opt);
    });
  }

  get lab() { return this.ctx.lab; }
  get engine() { return this.ctx.lab.engine; }

  start() {
    this.active = true;
    this.savedSeeds = this.ctx.app.agentConfig.initialInfected;
    this.ctx.app.navigate('sim');
    this.panel.classList.add('open');
    this.go(0);
  }

  stop() {
    this.active = false;
    clearInterval(this.timer);
    this.panel.classList.remove('open');
    this.panel.innerHTML = '';
    this.ctx.app.agentConfig.initialInfected = this.savedSeeds ?? 6;
    this.lab.setSpeed(this.ctx.app.speed || 1);
  }

  /** Avanza el reloj (sin dibujar) hasta una hora del día, para escenas diurnas. */
  advanceToHour(h) {
    const e = this.engine;
    let guard = 0;
    while ((e.clockHour < h || e.clockHour > h + 0.5) && guard++ < 400) e.advance(0.01);
    this.lab.afterAdvance();
  }

  stages() {
    const app = this.ctx.app, lab = this.lab, e = this.engine;
    const P = () => e.params;
    const mech = () => MECHANISMS[e.mechanism];
    return [
      {
        title: '1 · Una comunidad sana',
        enter: () => {
          app.agentConfig.initialInfected = 0;
          app.resetSimulation();
          this.advanceToHour(10);
          lab.lab3d.ok && lab.lab3d.setCameraMode('overview');
          lab.setSpeed(1); lab.play();
        },
        text: () => `Aquí viven <b>${e.agents.length} personas</b> con su rutina: escuela, mercado, plaza, parque y hogar. Todavía <b>nadie está infectado</b>. En matemáticas, toda la población está en el compartimento S.`,
        formula: 'N = S + E + I + R + V \\qquad I(0) = 0',
        vars: ['N', 'S', 'I'],
        question: { q: 'Si I = 0, ¿cuánto vale el término de contagio βSI/N?', options: ['0', 'β', 'S'], correct: 0,
          explain: 'Sin infectados no hay contagios: el sistema está en el equilibrio libre de enfermedad (dS/dt = 0).' }
      },
      {
        title: '2 · El patógeno',
        enter: () => { lab.setSpeed(1); },
        text: () => {
          const pg = getPathogen(app.currentDiseaseId);
          return `Elegimos <b>${app.currentDisease.name}</b>, causada por <b>${pg.agent}</b> (${PATHOGEN_TYPES[pg.type].label.toLowerCase()}, ${pg.size}).
            Se transmite por <b>${mech().name.toLowerCase()}</b>. Su número reproductivo básico es R₀ = ${f(P().r0)}.`;
        },
        thumb: true,
        formula: () => `R_0 = \\frac{\\beta}{\\gamma+\\mu} = ${f(P().r0)} \\;\\Rightarrow\\; \\beta = ${f(e.beta, 3)}\\ \\text{día}^{-1}`,
        vars: ['R0', 'beta', 'gamma', 'mu'],
        question: { q: () => `Con R₀ = ${f(P().r0)}, un caso en una población totalmente susceptible contagia en promedio a…`, options: () => [`≈ ${f(P().r0)} personas`, `≈ ${f(1 / P().r0)} personas`, 'A toda la población'], correct: 0,
          explain: 'R₀ es un promedio: algunos casos contagian a más y otros a nadie (azar). Por eso la simulación individual varía de una corrida a otra.' }
      },
      {
        title: '3 · El paciente inicial',
        enter: () => {
          this.advanceToHour(9.5);
          const cands = e.agents.filter((a) => a.state === STATES.S && a.role === 'adult' && a.placeKey && ['market', 'plaza', 'school'].includes(a.placeKey));
          const a = cands[0] || e.agents.find((x) => x.state === STATES.S);
          this.patient = a.id;
          e.manualInfect(a.id);
          lab.select(a.id);
          lab.lab3d.ok && lab.lab3d.setCameraMode('close', a);
          lab.setSpeed(0.2); lab.play();
        },
        text: () => {
          const a = e.agents[this.patient];
          const st = a.state === STATES.E ? 'está en <b>incubación (E)</b>: tiene el patógeno pero todavía no contagia' : 'ya es <b>infeccioso (I)</b>';
          return `<b>${a.name}</b> (#${a.id}, ${a.age} años) se infecta. Ahora ${st}. Observa su anillo y su icono: ${a.state === STATES.E ? '“?” ámbar' : 'virus rojo'}.`;
        },
        formula: () => e.hasE ? `E(0) = 1,\\quad \\text{sale de E a tasa } \\sigma = \\tfrac{1}{${f(P().incubationDays)}} = ${f(1 / P().incubationDays, 3)}\\ \\text{día}^{-1}` : 'I(0) = 1,\\quad S(0) = N - 1',
        vars: () => e.hasE ? ['E', 'sigma'] : ['I', 'S'],
        question: { q: '¿Puede esta persona contagiar a otros ahora mismo?', options: () => e.hasE ? ['No, está incubando (E)', 'Sí, ya contagia'] : ['Sí, ya es infecciosa (I)', 'No'], correct: 0,
          explain: () => e.hasE ? `En el modelo ${P().modelType} el contagio empieza al pasar de E a I, en promedio tras ${P().incubationDays} días.` : `En el modelo ${P().modelType} no hay periodo latente: se contagia desde el inicio.` }
      },
      {
        title: '4 · ¿Cómo se transmite?',
        enter: () => {
          lab.lab3d.opts.showZones = true; lab.lab3d.opts.showAerosols = true;
          lab.setSpeed(5); lab.play();
        },
        wait: () => e.agents[this.patient].state === STATES.I,
        waitText: 'Avanzando hasta que el paciente termine la incubación…',
        text: () => `${mech().summary}<br>La zona roja alrededor del infectado es su radio de contagio; en interiores el aire se tiñe según la carga de aerosoles.`,
        formula: 'P(\\text{contagio}) = 1 - e^{-\\lambda},\\qquad \\lambda = c\\,\\Delta t\\sum_{i\\in I} K(d_{ij})',
        vars: [],
        extraVars: [['\\lambda', 'Dosis acumulada de exposición en un paso de 15 min', 'adimensional'], ['K(d)', 'Peso del contacto según la distancia d (máximo de cerca)', 'adimensional'], ['\\Delta t', 'Paso de tiempo del motor (15 min)', 'días']],
        question: { q: 'Si la dosis λ se duplica, la probabilidad de contagio…', options: ['Aumenta, pero menos del doble', 'Se duplica exactamente', 'Disminuye'], correct: 0,
          explain: 'P = 1 − e^(−λ) crece cada vez más despacio (nunca supera 1). Por eso la probabilidad no es proporcional a la exposición cuando ésta es alta.' }
      },
      {
        title: '5 · El primer contagio',
        enter: () => {
          this.firstTr = null;
          this.startTr = e.transmissions.length ? e.transmissions[e.transmissions.length - 1] : null;
          lab.setSpeed(5); lab.play();
        },
        wait: () => {
          const tr = e.infectionLog.find((x) => x.from === this.patient);
          if (tr && !this.firstTr) {
            this.firstTr = tr;
            lab.pause();
            lab.select(tr.to);
            lab.lab3d.ok && lab.lab3d.setCameraMode('event', e.agents[tr.to]);
          }
          return !!this.firstTr;
        },
        waitText: 'Esperando el primer contagio causado por el paciente inicial…',
        text: () => {
          const tr = this.firstTr;
          const b = e.agents[tr.to];
          const p = (1 - Math.exp(-(b.infectedLambda || 0))) * 100;
          return `<b>${b.name}</b> se contagió por <b>${tr.route}</b> en ${b.infectedPlaceName}. Para esta persona, la probabilidad en ese intervalo era <b>${f(p, 1)} %</b> (resultado <b>probabilístico</b> del agente).`;
        },
        formula: () => {
          const tr = this.firstTr;
          const N = tr.N || e.agents.length;
          const exp = e.beta * tr.S * Math.max(1, tr.I) / N * (1 / 96);
          return `\\underbrace{\\beta\\frac{S\\,I}{N}\\Delta t}_{\\text{EDO: esperado}} = ${f(e.beta, 3)}\\cdot\\frac{${tr.S}\\cdot ${Math.max(1, tr.I)}}{${N}}\\cdot\\frac{1}{96} = ${f(exp, 4)}\\ \\text{contagios}`;
        },
        vars: ['beta', 'S', 'I', 'N'],
        extraVars: [['\\Delta t', '15 minutos = 1/96 día', 'días']],
        question: { q: 'El valor β·S·I/N·Δt de la EDO representa…', options: ['El número ESPERADO de contagios en toda la población en Δt', 'La probabilidad de que esta persona concreta se contagie', 'El número exacto de contagios que ocurrirán'], correct: 0,
          explain: 'La EDO da promedios deterministas de la población; el agente vive un evento aleatorio con probabilidad P = 1 − e^(−λ). Son cosas distintas que coinciden “en promedio”.' }
      },
      {
        title: '6 · La ecuación del contagio',
        enter: () => { lab.lab3d.ok && lab.lab3d.setCameraMode('overview'); lab.setSpeed(5); lab.play(); },
        text: () => {
          const c = e.counts, N = c.N - c.D;
          const term = e.beta * c.S * c.I / Math.max(1, N);
          return `Con los valores actuales de la ciudad (S = ${c.S}, I = ${c.I}, N = ${N}) el término de contagio vale <b>${f(term, 2)} personas/día</b>. Ese flujo sale de S (signo −) y entra a ${e.hasE ? 'E' : 'I'} (signo +).`;
        },
        formula: () => e.hasE ? '\\frac{dS}{dt} = -\\beta\\frac{SI}{N}, \\qquad \\frac{dE}{dt} = \\beta\\frac{SI}{N} - \\sigma E' : '\\frac{dS}{dt} = -\\beta\\frac{SI}{N}, \\qquad \\frac{dI}{dt} = \\beta\\frac{SI}{N} - (\\gamma+\\mu) I',
        vars: () => e.hasE ? ['dS', 'dE', 'SIN', 'sigma'] : ['dS', 'dI', 'SIN', 'gamma', 'mu'],
        question: { q: '¿Por qué dS/dt lleva signo negativo?', options: ['Porque los susceptibles sólo pueden disminuir al contagiarse', 'Porque la población está disminuyendo', 'Porque β es negativo'], correct: 0,
          explain: 'El mismo término aparece con signo + en la ecuación siguiente: las personas no desaparecen, cambian de compartimento (conservación).' }
      },
      {
        title: '7 · Propagación del brote',
        enter: () => { lab.lab3d.ok && lab.lab3d.setCameraMode('aerial'); lab.lab3d.opts.showChains = true; lab.setSpeed(20); lab.play(); },
        wait: () => e.cumulative >= e.agents.length * 0.2 || e.t > 60,
        waitText: 'Acelerando el tiempo (20x): observa cómo se ramifican las cadenas de contagio…',
        text: () => `Cada arco amarillo es un contagio real. Al principio casi todos son susceptibles (S ≈ N), y los infectados crecen de forma <b>aproximadamente exponencial</b>. Ya se contagió el <b>${f(e.cumulative / e.agents.length * 100, 0)} %</b> de la población.`,
        formula: () => `I(t) \\approx I_0\\, e^{(\\beta-\\gamma-\\mu)t},\\quad \\beta-\\gamma-\\mu = ${f(e.beta - e.gamma - e.mu, 3)}\\ \\text{día}^{-1}`,
        vars: ['I', 't', 'beta', 'gamma', 'mu'],
        question: { q: () => `Con una tasa de crecimiento r = ${f(e.beta - e.gamma - e.mu, 3)} día⁻¹, ¿cada cuánto se duplican aproximadamente los casos?`, options: () => {
          const r = Math.max(0.001, e.beta - e.gamma - e.mu);
          return [`ln 2 / r ≈ ${f(Math.log(2) / r, 1)} días`, `r / 2 ≈ ${f(r / 2, 3)} días`, `2r ≈ ${f(2 * r, 2)} días`];
        }, correct: 0, explain: 'De I₀e^{rT} = 2I₀ se obtiene T = ln 2 / r: el tiempo de duplicación.' }
      },
      {
        title: '8 · La curva epidemiológica',
        enter: () => { lab.setSpeed(20); lab.play(); },
        chart: true,
        text: () => `La curva muestra I(t) de los agentes. Su pendiente es dI/dt. A medida que S disminuye, cada infectado encuentra menos susceptibles: <b>Rₜ = R₀·S/N</b> baja. Rₜ de los agentes ahora ≈ <b>${e.estimateRt() === null ? '—' : f(e.estimateRt(), 2)}</b>.`,
        formula: 'R_t = R_0\\,\\frac{S}{N} \\qquad \\frac{dI}{dt} > 0 \\iff R_t > 1',
        vars: ['Rt', 'R0', 'S', 'N'],
        question: { q: '¿En qué momento dejan de aumentar los infectados?', options: ['Cuando Rₜ = 1', 'Cuando S = 0', 'Cuando I = N'], correct: 0,
          explain: 'Si Rₜ = 1, cada caso produce exactamente un caso nuevo: dI/dt = 0. Ese es el pico de la curva.' }
      },
      {
        title: '9 · El pico de infección',
        enter: () => { lab.setSpeed(20); lab.play(); },
        chart: true,
        wait: () => {
          const h = e.history;
          let mx = 0, md = 0;
          for (const x of h) if (x.I > mx) { mx = x.I; md = x.day; }
          this.peak = { I: mx, day: md };
          const ok = mx > 2 && e.t - md >= 3 && e.counts.I < mx * 0.85;
          if (ok && lab.isRunning) { lab.pause(); lab.lab3d.ok && lab.lab3d.setCameraMode('overview'); }
          return ok;
        },
        waitText: 'Esperando a que la curva alcance su máximo…',
        text: () => {
          const sp = e.history.find((x) => x.day === this.peak.day);
          return `El pico se alcanzó el <b>día ${this.peak.day}</b> con <b>${this.peak.I} infectados</b> simultáneos. En ese momento quedaban S = ${sp ? sp.S : '—'} susceptibles (S/N ≈ ${sp ? f(sp.S / e.agents.length, 2) : '—'}); la teoría (modelo SIR) predice el pico cuando S/N = 1/R₀ = ${f(1 / P().r0, 2)}.`;
        },
        formula: '\\frac{dI}{dt} = 0 \\;\\Rightarrow\\; \\frac{S_{pico}}{N} \\approx \\frac{1}{R_0}',
        vars: ['S', 'N', 'R0'],
        question: { q: 'Después del pico, ¿por qué disminuyen los infectados si aún hay susceptibles?', options: ['Porque Rₜ < 1: se recuperan más de los que se contagian', 'Porque se acabaron los susceptibles', 'Porque el virus muta'], correct: 0,
          explain: 'El brote se frena antes de agotar a todos los susceptibles: es el efecto de la inmunidad colectiva.' }
      },
      {
        title: '10 · Recuperación y fin del brote',
        enter: () => { lab.lab3d.ok && lab.lab3d.setCameraMode('overview'); lab.setSpeed(60); lab.play(); },
        chart: true,
        wait: () => {
          const done = (e.counts.I + e.counts.E === 0) || e.t > 170;
          if (done && lab.isRunning) lab.pause();
          return done;
        },
        waitText: 'Acelerando (60x) hasta que se apague el brote…',
        text: () => {
          const c = e.counts;
          const att = e.cumulative / e.agents.length * 100;
          const hit = P().r0 > 1 ? (1 - 1 / P().r0) * 100 : 0;
          return `Fin del brote en el día ${Math.floor(e.t)}: se contagió el <b>${f(att, 0)} %</b>, se recuperaron ${c.R}, fallecieron ${c.D} y ${c.S} nunca se infectaron. El umbral de inmunidad colectiva era ${f(hit, 0)} %: la epidemia “se pasa” de ese umbral por inercia.`;
        },
        formula: '\\ln\\frac{S_\\infty}{S_0} = R_0\\left(\\frac{S_\\infty}{N} - 1\\right) \\quad\\text{(tamaño final, modelo SIR)}',
        vars: ['S', 'N', 'R0'],
        extraVars: [['S_\\infty', 'Susceptibles que quedan al final del brote', 'personas']],
        question: { q: '¿Por qué no se contagió toda la población?', options: ['Porque Rₜ cayó por debajo de 1 antes de que todos se infectaran', 'Porque el modelo tiene errores', 'Porque la enfermedad desapareció sin causa'], correct: 0,
          explain: '¡Excelente! Ya recorriste la epidemia completa. Explora ahora las ecuaciones paso a paso en “Modelos” o compara agentes vs EDO.' }
      }
    ];
  }

  go(i, repeat = false) {
    const st = this.stages();
    if (i < 0) i = 0;
    if (i >= st.length) { this.stop(); return; }
    this.i = i;
    this.stage = st[i];
    this.answered = null;
    this.stage.enter && this.stage.enter(repeat);
    clearInterval(this.timer);
    this.timer = setInterval(() => this.render(), 400);
    this.render(true);
  }

  answer(k) { this.answered = k; this.render(true); }

  val(x) { return typeof x === 'function' ? x() : x; }

  render(force = false) {
    if (!this.active) return;
    const s = this.stage;
    const ready = !s.wait || s.wait();
    const key = `${this.i}|${ready}|${this.answered}`;
    if (!force && key === this.lastKey && !s.chart) return;
    this.lastKey = key;
    const n = 10;
    const dots = Array.from({ length: n }, (_, k) => `<span class="${k < this.i ? 'done' : k === this.i ? 'cur' : ''}"></span>`).join('');
    let body = '';
    if (!ready) body = `<div class="tour-wait"><span class="spinner"></span>${s.waitText || 'Observa la simulación…'}</div>`;
    else {
      const vars = [...(this.val(s.vars) || []).map((k) => VARS[k]).filter(Boolean), ...(s.extraVars || [])];
      const q = s.question;
      const opts = this.val(q.options);
      const fb = this.answered === null ? '' : this.answered === q.correct
        ? `<div class="q-fb ok">✅ ¡Correcto! ${this.val(q.explain)}</div>` : `<div class="q-fb bad">❌ No exactamente. ${this.val(q.explain)}</div>`;
      const pg = s.thumb ? getPathogen(this.ctx.app.currentDiseaseId) : null;
      body = `
        ${pg && this.ctx.app.thumbs && this.ctx.app.thumbs[this.ctx.app.currentDiseaseId] ? `<img class="tour-thumb" src="${this.ctx.app.thumbs[this.ctx.app.currentDiseaseId]}" alt="Ilustración conceptual del patógeno">` : ''}
        <p class="tour-text">${this.val(s.text)}</p>
        <div class="tour-formula">${tex(this.val(s.formula), true)}</div>
        ${vars.length ? `<table class="var-table compact"><tbody>${vars.map(([sy, m, u]) => `<tr><td class="sym">${tex(sy)}</td><td>${m}</td><td class="unit">${u}</td></tr>`).join('')}</tbody></table>` : ''}
        ${s.chart ? '<canvas class="tour-chart" width="320" height="110"></canvas>' : ''}
        <div class="tour-q"><div class="q-title">❓ ${this.val(q.q)}</div>
          ${opts.map((o, k) => ({ o, k })).sort((p1, p2) => ((p1.k + this.i * 2 + 1) % opts.length) - ((p2.k + this.i * 2 + 1) % opts.length)).map(({ o, k }) => `<button class="q-opt ${this.answered === k ? (k === q.correct ? 'ok' : 'bad') : ''}" data-tour="answer" data-opt="${k}">${o}</button>`).join('')}
          ${fb}</div>`;
    }
    this.panel.innerHTML = `
      <div class="tour-head"><span class="tour-badge">🎓 Aprender la epidemia</span><div class="tour-dots">${dots}</div>
        <button class="tour-x" data-tour="exit" title="Salir">✕</button></div>
      <h3>${s.title}</h3>
      ${body}
      <div class="tour-actions">
        <button class="btn-sim btn-small" data-tour="prev" ${this.i === 0 ? 'disabled' : ''}>◀ Anterior</button>
        <button class="btn-sim btn-small" data-tour="repeat" title="Volver a mostrar esta etapa">↺ Repetir</button>
        <button class="btn-sim btn-primary-sim btn-small" data-tour="next" ${ready ? '' : 'disabled'}>${this.i === n - 1 ? 'Finalizar ✓' : 'Continuar ▶'}</button>
      </div>`;
    if (s.chart && ready) this.drawChart(this.panel.querySelector('.tour-chart'));
  }

  drawChart(cv) {
    if (!cv) return;
    const c = cv.getContext('2d'), h = this.engine.history, W = cv.width, H = cv.height;
    c.fillStyle = '#0b1220'; c.fillRect(0, 0, W, H);
    const N = this.engine.agents.length;
    const maxD = Math.max(20, h.length);
    const X = (d) => 30 + (d / maxD) * (W - 40), Y = (v) => H - 18 - (v / N) * (H - 28);
    c.strokeStyle = 'rgba(255,255,255,0.15)'; c.beginPath(); c.moveTo(30, 8); c.lineTo(30, H - 18); c.lineTo(W - 8, H - 18); c.stroke();
    for (const [k, col] of [['S', '#38bdf8'], ['I', '#ef4444'], ['R', '#10b981']]) {
      c.strokeStyle = col; c.lineWidth = 2; c.beginPath();
      h.forEach((x, i) => (i ? c.lineTo(X(x.day), Y(x[k])) : c.moveTo(X(x.day), Y(x[k]))));
      c.stroke();
    }
    c.fillStyle = '#94a3b8'; c.font = '10px system-ui';
    c.fillText('personas', 2, 12); c.fillText('días →', W - 40, H - 4);
    c.fillStyle = '#ef4444'; c.fillText('I(t)', W - 40, 14);
  }
}
