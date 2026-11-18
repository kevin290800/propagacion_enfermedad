/**
 * Motor Matemático Epidemiológico - Ecuaciones Diferenciales Ordinarias (EDO)
 * Diseñado para la materia de Matemáticas 4 / Sistemas Dinámicos y Ecuaciones Diferenciales
 * 
 * Implementa:
 * - Modelos SIR, SEIR, SIRD, SEIRD, SIS con intervenciones
 * - Integrador numérico Runge-Kutta de 4to Orden (RK4)
 * - Cálculo analítico de R0, Rt, Umbral de Inmunidad de Rebaño (HIT)
 * - Detección de puntos de equilibrio y picos epidemiológicos
 */

export class EpidemicModel {
  /**
   * Resuelve el sistema de ecuaciones diferenciales usando RK4
   * @param {Object} params - Parámetros de simulación y epidemiológicos
   * @returns {Object} Historial temporal completo de cada compartimento
   */
  static solve(params) {
    const {
      modelType = 'SEIRD',
      population = 100000,
      initialInfected = 10,
      initialExposed = 20,
      initialRecovered = 0,
      r0 = 2.5,
      incubationDays = 4.0,
      infectiousDays = 7.0,
      fatalityRate = 0.02,
      hospitalCapacityRate = 0.05, // Capacidad hospitalaria como % de población
      overloadFatalityMultiplier = 2.5, // Aumento de mortalidad si colapsa el hospital
      days = 180,
      dt = 0.1, // Paso de integración (0.1 días = 2.4 horas)
      // Intervenciones
      quarantineStartDay = 999,
      quarantineEfficacy = 0.6, // 60% reducción de contactos
      vaccinationRateDaily = 0.0, // % diario de susceptibles vacunados
      vaccineEfficacy = 0.85,
      waningImmunityDays = 0 // 0 = inmunidad permanente; >0 = inmunidad decae
    } = params;

    const N = population;
    const sigma = incubationDays > 0 ? 1 / incubationDays : 1.0; // Tasa latente a infeccioso
    const gamma = infectiousDays > 0 ? 1 / infectiousDays : 0.14; // Tasa de recuperación
    const muBase = fatalityRate * gamma; // Tasa de mortalidad diaria
    const xi = waningImmunityDays > 0 ? 1 / waningImmunityDays : 0.0; // Pérdida de inmunidad

    // beta base derivado de R0: R0 = beta / (gamma + mu)
    const beta0 = r0 * (gamma + muBase);

    // Estado inicial
    let S = N - initialInfected - initialExposed - initialRecovered;
    let E = modelType.includes('E') ? initialExposed : 0;
    let I = initialInfected;
    let R = initialRecovered;
    let D = 0;
    let V = 0; // Vacunados

    // Historial de resultados
    const times = [];
    const S_hist = [];
    const E_hist = [];
    const I_hist = [];
    const R_hist = [];
    const D_hist = [];
    const V_hist = [];
    const Rt_hist = [];
    const newDailyInfections = [];

    const hospitalBeds = population * hospitalCapacityRate;

    // Función derivada f(t, y)
    const derivatives = (t, state) => {
      const [s, e, i, r, d, v] = state;
      const currentPop = Math.max(1, s + e + i + r + v);

      // Modulación de beta por cuarentena
      let beta = beta0;
      if (t >= quarantineStartDay) {
        beta = beta0 * (1 - quarantineEfficacy);
      }

      // Modulación de letalidad por saturación hospitalaria
      let currentMu = muBase;
      if (i > hospitalBeds) {
        const excessFraction = Math.min(2.0, (i - hospitalBeds) / hospitalBeds);
        currentMu = muBase * (1 + excessFraction * (overloadFatalityMultiplier - 1));
      }

      // Vacunación efectiva
      const vaccFlux = (vaccinationRateDaily > 0 && s > 0) ? (s * vaccinationRateDaily * vaccineEfficacy) : 0;

      let dS = 0, dE = 0, dI = 0, dR = 0, dD = 0, dV = 0;

      // Infección por ley de acción de masas: beta * S * I / N
      const infectionForce = (beta * s * i) / currentPop;

      switch (modelType) {
        case 'SIR':
          dS = -infectionForce + (xi * r) - vaccFlux;
          dI = infectionForce - (gamma * i) - (currentMu * i);
          dR = (gamma * i) - (xi * r);
          dD = currentMu * i;
          dV = vaccFlux;
          break;

        case 'SIS':
          // Sin inmunidad permanente: R vuelve a S de inmediato
          dS = -infectionForce + (gamma * i) - vaccFlux;
          dI = infectionForce - (gamma * i) - (currentMu * i);
          dR = 0;
          dD = currentMu * i;
          dV = vaccFlux;
          break;

        case 'SEIR':
          dS = -infectionForce + (xi * r) - vaccFlux;
          dE = infectionForce - (sigma * e);
          dI = (sigma * e) - (gamma * i) - (currentMu * i);
          dR = (gamma * i) - (xi * r);
          dD = currentMu * i;
          dV = vaccFlux;
          break;

        case 'SIRD':
          // Corrección v6.0: el modelo SIRD no tiene compartimento latente E
          // (antes compartía el sistema con SEIRD). Las fórmulas de S, I, R y D no cambian.
          dS = -infectionForce + (xi * r) - vaccFlux;
          dI = infectionForce - (gamma * i) - (currentMu * i);
          dR = (gamma * i) - (xi * r);
          dD = currentMu * i;
          dV = vaccFlux;
          break;

        case 'SEIRD':
        default:
          dS = -infectionForce + (xi * r) - vaccFlux;
          dE = infectionForce - (sigma * e);
          dI = (sigma * e) - (gamma * i) - (currentMu * i);
          dR = (gamma * i) - (xi * r);
          dD = currentMu * i;
          dV = vaccFlux;
          break;
      }

      return [dS, dE, dI, dR, dD, dV];
    };

    // Bucle temporal usando RK4
    const totalSteps = Math.round(days / dt);
    let state = [S, E, I, R, D, V];
    let prevInfectedAccum = initialInfected;

    for (let step = 0; step <= totalSteps; step++) {
      const t = step * dt;

      // Guardar muestreo cada día entero (o cada ~1 día)
      if (step % Math.round(1 / dt) === 0 || step === totalSteps) {
        const [s, e, i, r, d, v] = state;
        const currentPop = Math.max(1, s + e + i + r + v);
        
        // Beta en el tiempo t
        let currentBeta = beta0;
        if (t >= quarantineStartDay) {
          currentBeta = beta0 * (1 - quarantineEfficacy);
        }

        // Rt efectivo: Rt = R0 * (S / N) * modulación
        const currentRt = (currentBeta / (gamma + muBase)) * (s / currentPop);

        times.push(Math.round(t));
        S_hist.push(Math.max(0, s));
        E_hist.push(Math.max(0, e));
        I_hist.push(Math.max(0, i));
        R_hist.push(Math.max(0, r));
        D_hist.push(Math.max(0, d));
        V_hist.push(Math.max(0, v));
        Rt_hist.push(Math.max(0, currentRt));

        // Nuevos casos aproximados
        const totalCasesSoFar = N - s - v;
        const dailyNew = Math.max(0, totalCasesSoFar - prevInfectedAccum);
        newDailyInfections.push(dailyNew);
        prevInfectedAccum = totalCasesSoFar;
      }

      if (step === totalSteps) break;

      // Paso de Runge-Kutta 4
      const k1 = derivatives(t, state);
      
      const stateK2 = state.map((y, idx) => y + 0.5 * dt * k1[idx]);
      const k2 = derivatives(t + 0.5 * dt, stateK2);

      const stateK3 = state.map((y, idx) => y + 0.5 * dt * k2[idx]);
      const k3 = derivatives(t + 0.5 * dt, stateK3);

      const stateK4 = state.map((y, idx) => y + dt * k3[idx]);
      const k4 = derivatives(t + dt, stateK4);

      state = state.map((y, idx) => {
        const delta = (dt / 6) * (k1[idx] + 2 * k2[idx] + 2 * k3[idx] + k4[idx]);
        return Math.max(0, y + delta); // Restricción de no negatividad biológica
      });
    }

    // Métricas analíticas clave
    const peakInfected = Math.max(...I_hist);
    const peakDayIndex = I_hist.indexOf(peakInfected);
    const peakDay = times[peakDayIndex];
    const totalDeaths = D_hist[D_hist.length - 1];
    const totalRecovered = R_hist[R_hist.length - 1];
    const totalInfectedCumulative = population - S_hist[S_hist.length - 1] - V_hist[V_hist.length - 1];
    const attackRate = (totalInfectedCumulative / population) * 100;
    
    // Umbral de Inmunidad de Rebaño (HIT = 1 - 1/R0)
    const herdImmunityThreshold = r0 > 1 ? (1 - 1 / r0) * 100 : 0;

    // Día de saturación del sistema de salud
    let saturationDay = null;
    for (let i = 0; i < I_hist.length; i++) {
      if (I_hist[i] > hospitalBeds) {
        saturationDay = times[i];
        break;
      }
    }

    return {
      times,
      S: S_hist,
      E: E_hist,
      I: I_hist,
      R: R_hist,
      D: D_hist,
      V: V_hist,
      Rt: Rt_hist,
      newDaily: newDailyInfections,
      summary: {
        peakInfected: Math.round(peakInfected),
        peakDay,
        totalDeaths: Math.round(totalDeaths),
        totalRecovered: Math.round(totalRecovered),
        totalInfectedCumulative: Math.round(totalInfectedCumulative),
        attackRate: attackRate.toFixed(1),
        herdImmunityThreshold: herdImmunityThreshold.toFixed(1),
        r0: r0.toFixed(2),
        hospitalBeds: Math.round(hospitalBeds),
        saturationDay
      }
    };
  }

  /**
   * Genera el desglose LaTeX y explicaciones del modelo actual
   */
  static getMathematicalFormulation(modelType, params) {
    const { r0, incubationDays, infectiousDays, fatalityRate } = params;
    const sigma = (1 / incubationDays).toFixed(3);
    const gamma = (1 / infectiousDays).toFixed(3);
    const mu = (fatalityRate * (1 / infectiousDays)).toFixed(4);
    const beta = (r0 * ((1 / infectiousDays) + parseFloat(mu))).toFixed(3);

    const hit = r0 > 1 ? ((1 - 1 / r0) * 100).toFixed(1) : 0;

    let odeSystemLatex = '';
    let explanation = '';

    switch (modelType) {
      case 'SIR':
        odeSystemLatex = `\\begin{aligned}
\\frac{dS}{dt} &= -\\frac{\\beta S I}{N} \\\\[8pt]
\\frac{dI}{dt} &= \\frac{\\beta S I}{N} - \\gamma I \\\\[8pt]
\\frac{dR}{dt} &= \\gamma I
\\end{aligned}`;
        explanation = 'Modelo compartimental de Kermack-McKendrick (1927). Asume transmisión directa y recuperación con inmunidad esterilizante permanente.';
        break;

      case 'SIS':
        odeSystemLatex = `\\begin{aligned}
\\frac{dS}{dt} &= -\\frac{\\beta S I}{N} + \\gamma I \\\\[8pt]
\\frac{dI}{dt} &= \\frac{\\beta S I}{N} - \\gamma I
\\end{aligned}`;
        explanation = 'Modelo recurrente sin inmunidad adquirida permanente. Los individuos que se recuperan regresan de inmediato al compartimento Susceptible.';
        break;

      case 'SEIR':
        odeSystemLatex = `\\begin{aligned}
\\frac{dS}{dt} &= -\\frac{\\beta S I}{N} \\\\[8pt]
\\frac{dE}{dt} &= \\frac{\\beta S I}{N} - \\sigma E \\\\[8pt]
\\frac{dI}{dt} &= \\sigma E - \\gamma I \\\\[8pt]
\\frac{dR}{dt} &= \\gamma I
\\end{aligned}`;
        explanation = 'Modelo con compartimento latente (E). Considera el periodo de incubación durante el cual el individuo está infectado pero aún no es infeccioso.';
        break;

      case 'SIRD':
      case 'SEIRD':
      default:
        odeSystemLatex = `\\begin{aligned}
\\frac{dS}{dt} &= -\\frac{\\beta S I}{N} - \\nu S \\\\[8pt]
\\frac{dE}{dt} &= \\frac{\\beta S I}{N} - \\sigma E \\\\[8pt]
\\frac{dI}{dt} &= \\sigma E - (\\gamma + \\mu) I \\\\[8pt]
\\frac{dR}{dt} &= \\gamma I \\\\[8pt]
\\frac{dD}{dt} &= \\mu I
\\end{aligned}`;
        explanation = 'Modelo completo SEIRD con vacunación y mortalidad. Modela con precisión la dinámica poblacional separando a los recuperados de los fallecidos.';
        break;
    }

    const r0Equation = `R_0 = \\frac{\\beta}{\\gamma + \\mu} \\approx ${r0}`;
    const hitEquation = `H_{IT} = 1 - \\frac{1}{R_0} = ${hit}\\%`;

    return {
      odeSystemLatex,
      r0Equation,
      hitEquation,
      explanation,
      parameters: {
        beta: { symbol: '\\beta', value: beta, unit: 'días^{-1}', desc: 'Tasa de transmisión o tasa de contacto efectiva' },
        sigma: { symbol: '\\sigma', value: sigma, unit: 'días^{-1}', desc: `Tasa de progresión de latencia a infección (1/${incubationDays} d)` },
        gamma: { symbol: '\\gamma', value: gamma, unit: 'días^{-1}', desc: `Tasa de recuperación o remoción (1/${infectiousDays} d)` },
        mu: { symbol: '\\mu', value: mu, unit: 'días^{-1}', desc: 'Tasa de mortalidad inducida por la enfermedad' },
        r0: { symbol: 'R_0', value: r0, unit: 'adimensional', desc: 'Número reproductivo básico (promedio de infecciones secundarias)' }
      }
    };
  }
}
