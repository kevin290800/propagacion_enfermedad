/**
 * Explorador didáctico de ecuaciones.
 *
 * Para el modelo activo (SIR, SIS, SEIR, SIRD, SEIRD) muestra cada ecuación tal como está
 * IMPLEMENTADA en epidemicModels.js, con:
 *   - tabla de variables (símbolo · significado · unidad),
 *   - interpretación en lenguaje sencillo,
 *   - procedimiento paso a paso con los NÚMEROS de la solución RK4 en el día elegido,
 *   - un paso completo de Runge-Kutta 4 calculado en vivo.
 * Los valores son deterministas (EDO). Nunca se mezclan con los de los agentes.
 */

export function tex(s, display = false) {
  if (window.katex) {
    try { return window.katex.renderToString(s, { throwOnError: false, displayMode: display }); } catch (e) { /* respaldo */ }
  }
  return `<code class="tex-fallback">${s}</code>`;
}

export const VARS = {
  S: ['S', 'Personas susceptibles (sanas, pueden contagiarse)', 'personas'],
  E: ['E', 'Personas expuestas: infectadas pero aún no contagian (incubación)', 'personas'],
  I: ['I', 'Personas infectadas que pueden contagiar', 'personas'],
  R: ['R', 'Personas recuperadas (inmunes)', 'personas'],
  D: ['D', 'Personas fallecidas (acumuladas)', 'personas'],
  V: ['V', 'Personas vacunadas (protegidas)', 'personas'],
  N: ['N', 'Población viva: S + E + I + R + V', 'personas'],
  t: ['t', 'Tiempo', 'días'],
  beta: ['\\beta', 'Tasa de transmisión: contagios por día que produce un infectado si todos fueran susceptibles', 'día⁻¹'],
  sigma: ['\\sigma', 'Tasa de incubación = 1 / (periodo de incubación)', 'día⁻¹'],
  gamma: ['\\gamma', 'Tasa de recuperación = 1 / (periodo infeccioso)', 'día⁻¹'],
  mu: ['\\mu', 'Tasa de mortalidad por la enfermedad = letalidad × γ', 'día⁻¹'],
  nu: ['\\nu', 'Tasa efectiva de vacunación = vacunación diaria × eficacia', 'día⁻¹'],
  SIN: ['\\tfrac{S\\,I}{N}', 'Encuentros susceptible–infectado por unidad de población (ley de acción de masas)', 'personas'],
  dS: ['\\tfrac{dS}{dt}', 'Velocidad de cambio de los susceptibles', 'personas / día'],
  dE: ['\\tfrac{dE}{dt}', 'Velocidad de cambio de los expuestos', 'personas / día'],
  dI: ['\\tfrac{dI}{dt}', 'Velocidad de cambio de los infectados', 'personas / día'],
  dR: ['\\tfrac{dR}{dt}', 'Velocidad de cambio de los recuperados', 'personas / día'],
  dD: ['\\tfrac{dD}{dt}', 'Velocidad de cambio de los fallecidos', 'personas / día'],
  R0: ['R_0', 'Número reproductivo básico: contagios promedio de un caso en población totalmente susceptible', 'adimensional'],
  Rt: ['R_t', 'Número reproductivo efectivo en el tiempo t', 'adimensional'],
  h: ['h', 'Paso de integración de RK4 (0,1 días = 2,4 horas)', 'días'],
  k: ['k_1 \\dots k_4', 'Pendientes (derivadas) evaluadas en 4 puntos del intervalo', 'personas / día']
};

const fmt = (x, d = 2) => {
  if (!isFinite(x)) return '—';
  const a = Math.abs(x);
  if (a !== 0 && (a < 0.001 || a >= 1e6)) return x.toExponential(2).replace('e', '\\times10^{') + '}';
  return x.toLocaleString('es-CO', { maximumFractionDigits: d, minimumFractionDigits: 0 });
};
const num = (x, d = 2) => fmt(x, d).replace(/\./g, '{.}').replace(/,/g, '{,}');

export class MathExplorer {
  constructor(container) {
    this.container = container;
    this.day = 0;
    this.open = new Set(['dS']);
    container.addEventListener('click', (e) => {
      const b = e.target.closest('[data-eq]');
      if (b) {
        const k = b.dataset.eq;
        if (this.open.has(k)) this.open.delete(k); else this.open.add(k);
        this.render();
      }
    });
    container.addEventListener('input', (e) => {
      if (e.target.id === 'mx-day') { this.day = +e.target.value; this.render(true); }
    });
  }

  /** Parámetros derivados exactamente como en epidemicModels.js. */
  rates(p) {
    const gamma = p.infectiousDays > 0 ? 1 / p.infectiousDays : 0.14;
    const sigma = p.incubationDays > 0 ? 1 / p.incubationDays : 1;
    const mu = p.fatalityRate * gamma;
    const beta0 = p.r0 * (gamma + mu);
    const nu = p.vaccinationRateDaily * p.vaccineEfficacy;
    return { gamma, sigma, mu, beta0, nu };
  }

  update(params, solution, diseaseName) {
    this.params = params;
    this.sol = solution;
    this.diseaseName = diseaseName;
    this.day = Math.min(this.day, solution.times.length - 1);
    this.render();
  }

  state(d) {
    const s = this.sol;
    const i = Math.max(0, Math.min(s.times.length - 1, d));
    const S = s.S[i], E = s.E[i] || 0, I = s.I[i], R = s.R[i], D = s.D[i], V = s.V[i] || 0;
    return { S, E, I, R, D, V, N: Math.max(1, S + E + I + R + V), t: s.times[i] };
  }

  equations(model) {
    const hasE = model === 'SEIR' || model === 'SEIRD';
    const sis = model === 'SIS';
    const inflow = hasE ? 'E' : 'I';
    const eqs = [];
    eqs.push({
      key: 'dS', title: 'Susceptibles',
      tex: sis ? '\\frac{dS}{dt} = -\\beta\\frac{S\\,I}{N} + \\gamma I - \\nu S' : '\\frac{dS}{dt} = -\\beta\\frac{S\\,I}{N} - \\nu S',
      vars: ['dS', 'beta', 'S', 'I', 'N', 'SIN', 'nu', ...(sis ? ['gamma'] : [])],
      idea: `Los susceptibles disminuyen cuando se contagian (término βSI/N) y cuando se vacunan (νS)${sis ? '; en el modelo SIS los recuperados regresan a S (+γI)' : ''}. El signo negativo indica que S sólo puede bajar.`
    });
    if (hasE) eqs.push({
      key: 'dE', title: 'Expuestos (incubación)',
      tex: '\\frac{dE}{dt} = \\beta\\frac{S\\,I}{N} - \\sigma E',
      vars: ['dE', 'beta', 'S', 'I', 'N', 'sigma', 'E'],
      idea: 'Entran los recién contagiados (βSI/N) y salen, a tasa σ, quienes terminan la incubación y empiezan a contagiar.'
    });
    eqs.push({
      key: 'dI', title: 'Infectados',
      tex: hasE ? '\\frac{dI}{dt} = \\sigma E - (\\gamma + \\mu) I' : '\\frac{dI}{dt} = \\beta\\frac{S\\,I}{N} - (\\gamma + \\mu) I',
      vars: ['dI', ...(hasE ? ['sigma', 'E'] : ['beta', 'S', 'N']), 'I', 'gamma', 'mu'],
      idea: `Entran desde ${inflow === 'E' ? 'la incubación (σE)' : 'los contagios (βSI/N)'} y salen por recuperación (γI) o fallecimiento (μI). Si las entradas superan a las salidas, la epidemia crece.`
    });
    if (!sis) eqs.push({
      key: 'dR', title: 'Recuperados', tex: '\\frac{dR}{dt} = \\gamma I', vars: ['dR', 'gamma', 'I'],
      idea: 'Cada día se recupera una fracción γ de los infectados. Como γ = 1/T_inf, en promedio cada persona permanece infectada T_inf días.'
    });
    eqs.push({
      key: 'dD', title: 'Fallecidos', tex: '\\frac{dD}{dt} = \\mu I', vars: ['dD', 'mu', 'I'],
      idea: 'Fallece una fracción μ de los infectados por día. Si se supera la capacidad hospitalaria, el modelo aumenta μ (colapso sanitario).'
    });
    eqs.push({
      key: 'R0', title: 'Número reproductivo R₀ y Rₜ',
      tex: 'R_0 = \\frac{\\beta}{\\gamma + \\mu} \\qquad R_t = R_0\\,\\frac{S}{N}',
      vars: ['R0', 'Rt', 'beta', 'gamma', 'mu', 'S', 'N'],
      idea: 'R₀ compara la velocidad de contagio (β) con la velocidad de salida de I (γ+μ). Rₜ corrige por los susceptibles que quedan: el brote crece si Rₜ > 1 y decrece si Rₜ < 1.'
    });
    eqs.push({
      key: 'rk4', title: 'Método numérico Runge–Kutta 4',
      tex: '\\mathbf{y}_{n+1} = \\mathbf{y}_n + \\frac{h}{6}\\left(\\mathbf{k}_1 + 2\\mathbf{k}_2 + 2\\mathbf{k}_3 + \\mathbf{k}_4\\right)',
      vars: ['h', 'k', 't'],
      idea: 'El sistema no tiene solución con fórmulas elementales (por el término no lineal S·I). RK4 avanza la solución promediando cuatro pendientes; su error global es del orden de h⁴.'
    });
    return eqs;
  }

  steps(eq, st, r) {
    const P = this.params;
    const beta = st.t >= P.quarantineStartDay ? r.beta0 * (1 - P.quarantineEfficacy) : r.beta0;
    const inc = (beta * st.S * st.I) / st.N;
    const q = st.t >= P.quarantineStartDay ? ` (cuarentena activa: β se reduce un ${Math.round(P.quarantineEfficacy * 100)} %)` : '';
    const L = [];
    const step = (title, body) => L.push({ title, body });
    switch (eq.key) {
      case 'dS': {
        step('Identificar los susceptibles', tex(`S = ${num(st.S, 0)}\\ \\text{personas}`));
        step('Identificar los infectados y la población', tex(`I = ${num(st.I, 1)},\\quad N = ${num(st.N, 0)}`));
        step('Aplicar la tasa de transmisión' + q, tex(`\\beta = R_0(\\gamma+\\mu) = ${num(P.r0, 2)}\\,(${num(r.gamma, 4)} + ${num(r.mu, 5)}) = ${num(beta, 4)}\\ \\text{día}^{-1}`));
        step('Calcular el término de contagio', tex(`\\beta\\frac{S\\,I}{N} = ${num(beta, 4)}\\cdot\\frac{${num(st.S, 0)}\\cdot ${num(st.I, 1)}}{${num(st.N, 0)}} = ${num(inc, 2)}\\ \\tfrac{\\text{personas}}{\\text{día}}`));
        const vac = r.nu * st.S;
        const ds = -inc - vac + (P.modelType === 'SIS' ? r.gamma * st.I : 0);
        step('Restar la vacunación' + (P.modelType === 'SIS' ? ' y sumar los que regresan (SIS)' : ''), tex(`\\nu S = ${num(r.nu, 4)}\\cdot ${num(st.S, 0)} = ${num(vac, 2)}`));
        step('Interpretar el signo negativo', `${tex(`\\frac{dS}{dt} = ${num(ds, 2)}\\ \\tfrac{\\text{personas}}{\\text{día}}`)}<p>Es negativo: cada día dejan de ser susceptibles unas <b>${fmt(-ds, 0)}</b> personas.</p>`);
        step('¿Cómo cambia S con el tiempo?', `<p>Aproximación lineal para un día (Euler): ${tex(`S(t+1) \\approx S + \\frac{dS}{dt}\\cdot 1 = ${num(st.S + ds, 0)}`)}. RK4 lo calcula con más precisión usando 10 pasos de 0,1 días.</p>`);
        break;
      }
      case 'dE': {
        const out = r.sigma * st.E;
        step('Contagios que entran a E', tex(`\\beta\\frac{S I}{N} = ${num(inc, 2)}`));
        step('Personas que terminan la incubación', tex(`\\sigma E = ${num(r.sigma, 4)}\\cdot ${num(st.E, 1)} = ${num(out, 2)}`));
        step('Resultado', `${tex(`\\frac{dE}{dt} = ${num(inc, 2)} - ${num(out, 2)} = ${num(inc - out, 2)}`)}<p>${inc > out ? 'Entran más de los que salen: los expuestos aumentan.' : 'Salen más de los que entran: los expuestos disminuyen.'}</p>`);
        break;
      }
      case 'dI': {
        const hasE = P.modelType === 'SEIR' || P.modelType === 'SEIRD';
        const inflow = hasE ? r.sigma * st.E : inc;
        const out = (r.gamma + r.mu) * st.I;
        step('Entradas a I', tex(hasE ? `\\sigma E = ${num(r.sigma, 4)}\\cdot ${num(st.E, 1)} = ${num(inflow, 2)}` : `\\beta\\frac{SI}{N} = ${num(inflow, 2)}`));
        step('Salidas de I (recuperación + fallecimiento)', tex(`(\\gamma+\\mu)I = (${num(r.gamma, 4)} + ${num(r.mu, 5)})\\cdot ${num(st.I, 1)} = ${num(out, 2)}`));
        step('Resultado e interpretación', `${tex(`\\frac{dI}{dt} = ${num(inflow, 2)} - ${num(out, 2)} = ${num(inflow - out, 2)}`)}<p>${inflow > out ? '📈 Los infectados <b>aumentan</b>: aún no se ha alcanzado el pico.' : '📉 Los infectados <b>disminuyen</b>: ya pasó el pico (o el brote se está apagando).'}</p>`);
        break;
      }
      case 'dR':
        step('Fracción que se recupera cada día', tex(`\\gamma = \\frac{1}{T_{inf}} = \\frac{1}{${num(P.infectiousDays, 1)}} = ${num(r.gamma, 4)}\\ \\text{día}^{-1}`));
        step('Resultado', tex(`\\frac{dR}{dt} = \\gamma I = ${num(r.gamma, 4)}\\cdot ${num(st.I, 1)} = ${num(r.gamma * st.I, 2)}\\ \\tfrac{\\text{personas}}{\\text{día}}`));
        break;
      case 'dD':
        step('Tasa de mortalidad', tex(`\\mu = \\text{CFR}\\cdot\\gamma = ${num(P.fatalityRate, 4)}\\cdot ${num(r.gamma, 4)} = ${num(r.mu, 5)}\\ \\text{día}^{-1}`));
        step('Resultado (sin colapso hospitalario)', tex(`\\frac{dD}{dt} = \\mu I = ${num(r.mu, 5)}\\cdot ${num(st.I, 1)} = ${num(r.mu * st.I, 3)}\\ \\tfrac{\\text{personas}}{\\text{día}}`));
        break;
      case 'R0': {
        const R0 = beta / (r.gamma + r.mu);
        const Rt = R0 * st.S / st.N;
        const hit = P.r0 > 1 ? 1 - 1 / P.r0 : 0;
        step('Calcular R₀', tex(`R_0 = \\frac{${num(beta, 4)}}{${num(r.gamma, 4)} + ${num(r.mu, 5)}} = ${num(R0, 2)}`));
        step('Proporción de susceptibles hoy', tex(`\\frac{S}{N} = \\frac{${num(st.S, 0)}}{${num(st.N, 0)}} = ${num(st.S / st.N, 3)}`));
        step('Rₜ e interpretación', `${tex(`R_t = ${num(R0, 2)}\\cdot ${num(st.S / st.N, 3)} = ${num(Rt, 2)}`)}<p>${Rt > 1 ? 'Rₜ > 1: cada caso genera más de un caso nuevo → crecimiento.' : 'Rₜ < 1: cada caso genera menos de uno → el brote decae.'}</p>`);
        step('Inmunidad de rebaño', tex(`H_{IT} = 1 - \\frac{1}{R_0} = ${num(hit * 100, 1)}\\,\\%`));
        break;
      }
      case 'rk4': {
        const h = 0.1;
        const f = (y) => this.derivs(y, r, beta);
        const y0 = [st.S, st.E, st.I, st.R, st.D, st.V];
        const k1 = f(y0);
        const k2 = f(y0.map((v, i) => v + 0.5 * h * k1[i]));
        const k3 = f(y0.map((v, i) => v + 0.5 * h * k2[i]));
        const k4 = f(y0.map((v, i) => v + h * k3[i]));
        const y1 = y0.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
        step('Estado inicial (componente I)', tex(`I_n = ${num(st.I, 3)},\\quad h = 0{.}1\\ \\text{días}`));
        step('Pendiente al inicio', tex(`k_1 = f(t_n, y_n) = ${num(k1[2], 3)}`));
        step('Pendiente a mitad de intervalo usando k₁', tex(`k_2 = f\\left(t_n+\\tfrac{h}{2},\\, y_n+\\tfrac{h}{2}k_1\\right) = ${num(k2[2], 3)}`));
        step('Pendiente a mitad de intervalo usando k₂', tex(`k_3 = ${num(k3[2], 3)}`));
        step('Pendiente al final usando k₃', tex(`k_4 = ${num(k4[2], 3)}`));
        step('Promedio ponderado y nuevo valor', `${tex(`I_{n+1} = ${num(st.I, 3)} + \\frac{0{.}1}{6}(${num(k1[2], 3)} + 2\\cdot${num(k2[2], 3)} + 2\\cdot${num(k3[2], 3)} + ${num(k4[2], 3)}) = ${num(y1[2], 3)}`)}<p>Se calcula igual para S, E, R, D y V a la vez (vector <b>y</b>). Repetido 10 veces avanza un día. (Ilustración sin el ajuste por saturación hospitalaria.)</p>`);
        break;
      }
    }
    return L;
  }

  /** Derivadas del modelo (mismas fórmulas que epidemicModels.js, sin saturación hospitalaria). */
  derivs([s, e, i, rr, d, v], r, beta) {
    const P = this.params;
    const N = Math.max(1, s + e + i + rr + v);
    const inf = (beta * s * i) / N;
    const vac = r.nu * s;
    const m = P.modelType;
    if (m === 'SIR' || m === 'SIRD') return [-inf - vac, 0, inf - (r.gamma + r.mu) * i, r.gamma * i, r.mu * i, vac];
    if (m === 'SIS') return [-inf + r.gamma * i - vac, 0, inf - (r.gamma + r.mu) * i, 0, r.mu * i, vac];
    return [-inf - vac, inf - r.sigma * e, r.sigma * e - (r.gamma + r.mu) * i, r.gamma * i, r.mu * i, vac];
  }

  render(onlySteps = false) {
    if (!this.sol || !this.params) return;
    const P = this.params;
    const r = this.rates(P);
    const st = this.state(this.day);
    const eqs = this.equations(P.modelType);
    const maxDay = this.sol.times.length - 1;
    const html = eqs.map((eq) => {
      const open = this.open.has(eq.key);
      const rows = eq.vars.map((k) => VARS[k]).map(([s, m, u]) => `<tr><td class="sym">${tex(s)}</td><td>${m}</td><td class="unit">${u}</td></tr>`).join('');
      const steps = open ? this.steps(eq, st, r).map((s, i) => `<li><div class="step-n">${i + 1}</div><div><div class="step-t">${s.title}</div><div class="step-b">${s.body}</div></div></li>`).join('') : '';
      return `
        <article class="eq-card ${open ? 'open' : ''}">
          <header><h4>${eq.title}</h4><span class="badge-tag">${P.modelType}</span></header>
          <div class="eq-tex">${tex(eq.tex, true)}</div>
          <p class="eq-idea">💡 ${eq.idea}</p>
          <table class="var-table"><thead><tr><th>Símbolo</th><th>Significado</th><th>Unidad</th></tr></thead><tbody>${rows}</tbody></table>
          <button class="btn-sim btn-small" data-eq="${eq.key}">${open ? '▲ Ocultar procedimiento' : '▶ Ver procedimiento paso a paso'}</button>
          ${open ? `<ol class="steps">${steps}</ol>` : ''}
        </article>`;
    }).join('');
    const head = `
      <div class="mx-head">
        <div>
          <h3>📐 Ecuaciones del modelo ${P.modelType} — ${this.diseaseName || ''}</h3>
          <p>Elige un día: los procedimientos usan los valores <b>deterministas</b> de la solución RK4 (N = ${fmt(this.sol.S[0] + (this.sol.E[0] || 0) + this.sol.I[0] + this.sol.R[0], 0)}).</p>
        </div>
        <label class="mx-day">Día <b>${st.t}</b><input type="range" id="mx-day" min="0" max="${maxDay}" value="${this.day}"></label>
        <div class="mx-state">${['S', 'E', 'I', 'R', 'D'].filter((k) => k !== 'E' || P.modelType === 'SEIR' || P.modelType === 'SEIRD').map((k) => `<span class="st-${k}">${k} = ${fmt(st[k], 0)}</span>`).join('')}</div>
      </div>`;
    const scrollY = this.container.scrollTop;
    this.container.innerHTML = head + `<div class="eq-grid">${html}</div>`;
    if (onlySteps) {
      const slider = this.container.querySelector('#mx-day');
      if (slider) slider.focus();
      this.container.scrollTop = scrollY;
    }
  }
}
