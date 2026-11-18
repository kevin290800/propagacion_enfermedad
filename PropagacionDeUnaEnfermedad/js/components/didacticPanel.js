/**
 * Panel didáctico: traduce cada evento individual (contagio, fin de incubación,
 * recuperación, fallecimiento, vacunación…) a su significado matemático en el
 * sistema de EDO, y presenta tarjetas de conceptos (R₀, SIR/SEIR/SEIRD,
 * contactos y transmisión, estocástico vs determinista).
 */
import { MECHANISMS } from '../simulation/diseaseProfiles.js';

const ROUTE_TEXT = {
  'gotículas': 'gotículas a corta distancia',
  aerosol: 'aerosoles en un espacio cerrado compartido',
  contacto: 'contacto físico directo',
  hogar: 'convivencia / cuidado dentro del hogar',
  mosquito: 'la picadura de un mosquito infectado',
  agua: 'beber agua contaminada',
  manual: 'acción del usuario',
  seed: 'caso índice'
};

/**
 * Ejemplo numérico de un contagio, separando SIEMPRE:
 *  - el valor ESPERADO de la EDO (determinista, para toda la población en Δt = 15 min),
 *  - la probabilidad INDIVIDUAL del agente (estocástica).
 */
export function contagionMath(ev, engine) {
  const c = engine.counts || { S: 0, I: 1, N: engine.agents.length, D: 0 };
  const N = Math.max(1, c.N - c.D);
  const S = c.S + 1, I = Math.max(1, c.I); // S antes de este contagio
  const dt = 1 / 96;
  const expected = engine.beta * S * I / N * dt;
  const f = (x, d = 3) => Number(x).toFixed(d).replace('.', '{.}');
  const odeTex = `\\beta\\frac{S\\,I}{N}\\Delta t = ${f(engine.beta)}\\cdot\\frac{${S}\\cdot${I}}{${N}}\\cdot\\frac{1}{96} = ${f(expected, 4)}`;
  const odeText = 'Contagios esperados en TODA la población durante 15 minutos (promedio).';
  let agentTex, agentText;
  if (ev.route === 'mosquito') {
    agentTex = `P = b_{mh} = ${f(engine.vector.b, 2)}`;
    agentText = 'Probabilidad de que la picadura de un mosquito infeccioso transmita el virus.';
  } else if (ev.route === 'manual') {
    agentTex = 'P = 1';
    agentText = 'Infección introducida por el usuario (condición inicial).';
  } else {
    const p = 1 - Math.exp(-ev.lambda);
    agentTex = `P = 1 - e^{-\\lambda} = 1 - e^{-${f(ev.lambda, 4)}} = ${f(p * 100, 2)}\\,\\%`;
    agentText = ev.route === 'agua' ? 'λ = c·W: dosis por beber agua de una fuente contaminada.' : 'λ = dosis de exposición acumulada por esta persona en 15 min.';
  }
  return { odeTex, odeText, agentTex, agentText, expected };
}

export function explainEvent(ev, engine) {
  const A = engine.agents;
  const a = A[ev.agentId];
  if (!a) return null;
  const who = `<b>${a.name}</b> <span class="ev-id">#${a.id}</span>`;
  const P = engine.params;
  const f = (x, d = 3) => Number(x).toFixed(d);
  switch (ev.type) {
    case 'infection': {
      const src = ev.otherId >= 0 && A[ev.otherId] ? `${A[ev.otherId].name} <span class="ev-id">#${ev.otherId}</span>` : 'una fuente desconocida';
      const p = (1 - Math.exp(-ev.lambda)) * 100;
      let math;
      if (ev.route === 'mosquito') {
        math = `Ciclo vectorial: un mosquito picó antes a ${src}, incubó ${6} días y ahora transmitió con prob. b = ${f(engine.vector.b, 2)}. ` +
          `En la EDO este ciclo completo está resumido en β = R₀(γ+μ) = ${f(engine.beta)} día⁻¹.`;
      } else if (ev.route === 'agua') {
        math = `Probabilidad por toma P = 1 − e^(−c·W) = ${f(p, 2)} %. La fuente acumula bacterias: dW/dt = ξ·I − δ·W. ` +
          `En la EDO esta vía queda resumida en el término β·S·I/N.`;
      } else if (ev.route === 'manual') {
        math = 'Infección introducida por el usuario: equivale a cambiar la condición inicial I(0) del sistema.';
      } else {
        const cm = contagionMath(ev, engine);
        math = `<b>Agente (probabilístico):</b> dosis en 15 min λ = ${f(ev.lambda)} ⇒ P = 1 − e^(−λ) = ${f(p, 2)} %. ` +
          `<b>EDO (esperado):</b> β·S·I/N·Δt = ${cm.expected.toFixed(4)} contagios en toda la población en 15 min. ` +
          `Muchos contactos S–I con pequeñas probabilidades producen, en promedio, el flujo S→${engine.hasE ? 'E' : 'I'} de la EDO.`;
      }
      return {
        icon: '🦠', cls: 'ev-inf', title: 'Contagio',
        text: `${who} se contagió de ${src} por ${ROUTE_TEXT[ev.route] || ev.route} en ${ev.place}. Pasa a ${engine.hasE ? '<b>EXPUESTO</b> (incuba, aún no contagia)' : '<b>INFECTADO</b>'}.`,
        math
      };
    }
    case 'seed':
      return { icon: '🎯', cls: 'ev-inf', title: 'Caso índice', text: `${who} inicia el brote en su vivienda.`, math: 'Condición inicial I(0) > 0 del sistema dinámico.' };
    case 'onset':
      return {
        icon: '🌡️', cls: 'ev-onset', title: 'Fin de la incubación',
        text: `${who} comienza a contagiar y muestra síntomas. ${engine.profile.symptomText}`,
        math: `Transición E→I a tasa σ = 1/T_inc = 1/${P.incubationDays} = ${f(1 / P.incubationDays)} día⁻¹ (término σE). En los agentes la incubación sigue una distribución Erlang con media ${P.incubationDays} d.`
      };
    case 'recovery':
      return ev.sis ? {
        icon: '🔁', cls: 'ev-rec', title: 'Recuperación sin inmunidad (SIS)',
        text: `${who} se recuperó pero vuelve a ser susceptible.`,
        math: `Modelo SIS: el flujo γI regresa a S (dS/dt = −βSI/N + γI). Por eso la enfermedad puede volverse endémica.`
      } : {
        icon: '💚', cls: 'ev-rec', title: 'Recuperación',
        text: `${who} superó la enfermedad y quedó inmune${ev.manual ? ' (tratamiento aplicado por el usuario)' : ''}.`,
        math: `Transición I→R a tasa γ = 1/T_inf = ${f(1 / P.infectiousDays)} día⁻¹ (término γI).`
      };
    case 'death':
      return {
        icon: '🕯️', cls: 'ev-death', title: 'Fallecimiento',
        text: `${who} falleció. Se le recuerda en el jardín memorial.`,
        math: `Transición I→D: μ = CFR·γ = ${f(P.fatalityRate * 100, 2)}% × ${f(1 / P.infectiousDays)} = ${f(engine.mu, 4)} día⁻¹ (término μI). ` +
          (a.hadNoBed ? 'Esta persona no obtuvo cama: su riesgo se multiplicó ×2.5 (colapso hospitalario).' : '')
      };
    case 'vaccination':
      return {
        icon: '💉', cls: 'ev-vac', title: 'Vacunación',
        text: `${who} fue vacunado (${ev.how}).`,
        math: `Sale del compartimento S sin pasar por la infección: término −ν·S en dS/dt. Reduce Rₜ = R₀·S/N.`
      };
    case 'hospital':
      return {
        icon: '🏥', cls: 'ev-hosp', title: 'Hospitalización',
        text: `${who} es trasladado al hospital (caso grave). Camas ocupadas: ${engine.counts ? engine.counts.H : '?'} / ${engine.beds.length}.`,
        math: 'La capacidad hospitalaria es la misma que usa la EDO: si I supera las camas, la letalidad efectiva aumenta.'
      };
    case 'nobed':
      return {
        icon: '⚠️', cls: 'ev-death', title: 'Sin camas disponibles',
        text: `${who} necesita hospitalización pero el hospital está lleno.`,
        math: 'Colapso sanitario: en la EDO, μ se multiplica cuando I > capacidad; aquí el riesgo individual sube ×2.5.'
      };
    default:
      return null;
  }
}

export class DidacticPanel {
  constructor(feedEl, conceptsEl) {
    this.feed = feedEl;
    this.concepts = conceptsEl;
    this.items = [];
    this.onSelect = null;
    this.vaccBatch = 0;
    this.filter = 'all';
    this.feed.addEventListener('click', (e) => {
      const t = e.target.closest('[data-agent]');
      if (t && this.onSelect) this.onSelect(+t.dataset.agent);
    });
  }

  clear() {
    this.items = [];
    this.feed.innerHTML = '<div class="ev-empty">Pulsa ▶ Iniciar y observa: cada contagio, recuperación o fallecimiento aparecerá aquí con su explicación matemática.</div>';
  }

  add(ev, engine) {
    if (ev.type === 'vaccination' && ev.how === 'campaña') {
      this.vaccBatch++;
      return;
    }
    const x = explainEvent(ev, engine);
    if (!x) return;
    if (this.feed.querySelector('.ev-empty')) this.feed.innerHTML = '';
    const el = document.createElement('div');
    el.className = `ev ${x.cls}`;
    el.dataset.agent = ev.agentId;
    el.dataset.type = ev.type;
    el.innerHTML = `
      <div class="ev-head"><span class="ev-icon">${x.icon}</span><span class="ev-title">${x.title}</span>
      <span class="ev-time">Día ${ev.day} · ${ev.clock}</span></div>
      <div class="ev-text">${x.text}</div>
      <div class="ev-math">📐 ${x.math}</div>`;
    this.feed.prepend(el);
    while (this.feed.children.length > 60) this.feed.lastChild.remove();
  }

  /** Explicación automática del pico epidémico de los agentes. */
  addPeak(engine, day, I, row) {
    if (this.feed.querySelector('.ev-empty')) this.feed.innerHTML = '';
    const N = engine.agents.length;
    const sN = row ? row.S / N : null;
    const el = document.createElement('div');
    el.className = 'ev ev-peak';
    el.innerHTML = `<div class="ev-head"><span class="ev-icon">🏔️</span><span class="ev-title">Pico de la epidemia</span>
      <span class="ev-time">Día ${day}</span></div>
      <div class="ev-text">Los infectados alcanzaron su máximo: <b>${I}</b> personas a la vez. Desde entonces se recuperan más personas de las que se contagian.</div>
      <div class="ev-math">📐 En el pico dI/dt = 0, es decir Rₜ = R₀·S/N ≈ 1. Aquí S/N = ${sN === null ? '—' : sN.toFixed(2)}; la teoría (SIR) predice S/N = 1/R₀ = ${(1 / engine.params.r0).toFixed(2)}. Las diferencias se deben al azar, a los hogares y a las rutinas de los agentes.</div>`;
    this.feed.prepend(el);
  }

  flushVaccinations(engine) {
    if (!this.vaccBatch) return;
    const n = this.vaccBatch;
    this.vaccBatch = 0;
    const el = document.createElement('div');
    el.className = 'ev ev-vac';
    el.innerHTML = `<div class="ev-head"><span class="ev-icon">💉</span><span class="ev-title">Campaña de vacunación</span>
      <span class="ev-time">Día ${Math.floor(engine.t)}</span></div>
      <div class="ev-text">${n} persona(s) vacunadas hoy por la campaña diaria (ν = ${(engine.params.vaccinationRateDaily * 100).toFixed(2)}%/día, eficacia ${(engine.params.vaccineEfficacy * 100).toFixed(0)}%).</div>
      <div class="ev-math">📐 Flujo −ν·ef·S de la EDO aplicado individualmente: cada susceptible se vacuna con probabilidad 1 − e^(−ν·ef·Δt) en cada paso.</div>`;
    if (this.feed.querySelector('.ev-empty')) this.feed.innerHTML = '';
    this.feed.prepend(el);
  }

  renderConcepts(engine, disease) {
    const P = engine.params;
    const mech = MECHANISMS[engine.mechanism];
    const f = (x, d = 3) => Number(x).toFixed(d);
    const hit = P.r0 > 1 ? (1 - 1 / P.r0) * 100 : 0;
    const mechMath = engine.mechanism === 'vector'
      ? `m = ${f(engine.vector.m, 2)} mosquitos/persona · a = ${engine.vector.a} picaduras/día · b = ${f(engine.vector.b, 2)} · supervivencia al periodo extrínseco e^(−g·n) = ${f(engine.vector.surv, 2)}`
      : engine.mechanism === 'water'
        ? `c = ${engine.cWater.toExponential(2)} por toma · ξ = 1 · δ = 1/3 día⁻¹ · tomas diarias por fuente E[D] ≈ ${f(engine.waterED, 0)}`
        : `c = ${f(engine.cTrans, 3)} · exposición media k̄ = ${f(engine.kMean, 2)} por día (calibrada con 2 días de rutina sin enfermedad)` +
          (engine.r0Reachable === false ? ' · ⚠️ R₀ demasiado alto para la red de contactos de esta población.' : '');
    this.concepts.innerHTML = `
      <details open class="concept"><summary>🔢 ¿Qué es R₀ y por qué importa?</summary>
        <p><b>R₀</b> es el número promedio de contagios que produce <i>un</i> infectado en una población totalmente susceptible.
        En la EDO, R₀ = β/(γ+μ) = <b>${f(P.r0, 2)}</b> ⇒ β = ${f(engine.beta)} día⁻¹.</p>
        <p>Si R₀ &gt; 1 el brote crece; si R₀ &lt; 1 se extingue. Para frenarlo hace falta inmunizar al menos
        H<sub>IT</sub> = 1 − 1/R₀ = <b>${f(hit, 1)}%</b> de la población. En la simulación, <b>Rₜ = R₀·S/N</b> baja a medida que los susceptibles se agotan:
        por eso la curva alcanza un pico y luego desciende.</p></details>
      <details class="concept"><summary>🧩 Diferencia entre SIR, SEIR y SEIRD</summary>
        <ul><li><b>SIR</b>: S → I → R. Se contagia en cuanto se infecta (sin periodo latente).</li>
        <li><b>SEIR</b>: añade <b>E</b> (expuestos): personas infectadas que aún no contagian. Retrasa y aplana el pico.</li>
        <li><b>SEIRD</b>: separa <b>D</b> (fallecidos) de R mediante μ·I.</li>
        <li><b>SIS</b>: tras la infección se vuelve a S (sin inmunidad) → puede quedar endémica.</li></ul>
        <p>En el escenario: anillo ámbar + “?” = E; anillo rojo + virus = I; ✓ verde = R; vela = D; escudo morado = V.</p></details>
      <details class="concept"><summary>🤝 Contactos y transmisión: de las personas a β</summary>
        <p>β = (contactos por día) × (probabilidad de contagio por contacto). En los agentes cada pareja S–I cercana suma una “dosis” λ y el contagio ocurre con probabilidad 1 − e^(−λ).
        Las constantes se calibran para que un caso índice produzca en promedio exactamente R₀ contagios.</p>
        <p><b>Mecanismo actual — ${mech.icon} ${mech.name}:</b> ${mech.summary}</p>
        <p class="mono small">${mechMath}</p></details>
      <details class="concept"><summary>📈 Las curvas epidemiológicas</summary>
        <p>S(t) decrece, I(t) crece de forma casi exponencial (∝ e^{(β−γ−μ)t}) mientras Rₜ &gt; 1, alcanza su máximo cuando Rₜ = 1
        y luego decae. R(t) y D(t) acumulan a quienes salen de I. El área bajo I(t) multiplicada por γ es el total de recuperados.</p></details>
      <details class="concept"><summary>🎲 Simulación individual (estocástica) vs EDO (determinista)</summary>
        <p>La <b>EDO (RK4)</b> describe promedios de una población infinita y perfectamente mezclada: siempre da la misma curva.
        Los <b>agentes</b> son ${engine.agents.length} personas con hogares, rutinas, azar y (según la enfermedad) mosquitos o pozos.
        Cada corrida es distinta. Diferencias esperables:</p>
        <ul><li><b>Extinción por azar</b>: con pocos casos iniciales el brote puede apagarse aunque R₀ &gt; 1.</li>
        <li><b>Agrupamiento en hogares</b>: se contagia primero a la familia (que se agota), por eso el pico suele ser menor y más tardío.</li>
        <li><b>Intervenciones sólo-agentes</b>: mascarillas, distanciamiento, aislamiento, ventilación, control vectorial y potabilización no existen en la EDO.</li>
        <li>Duraciones Erlang (más realistas) en lugar de exponenciales.</li></ul>
        <p>En la gráfica comparativa: <b>líneas = EDO</b> (con la misma N), <b>puntos = agentes</b>. Nunca se mezclan los valores.</p></details>`;
  }
}
