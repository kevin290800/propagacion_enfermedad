/**
 * Motor epidemiológico basado en agentes (modelo individual estocástico).
 *
 * Lógica pura: NO dibuja nada. La vista 3D (Three.js) y la vista 2D sólo leen su estado.
 *
 * Cada persona es un agente con identificador, posición, velocidad, rutina diaria,
 * estado epidemiológico (S, E, I, R, D, V), tiempos de incubación/infección,
 * historial clínico, contactos y árbol de contagios.
 *
 * Conexión con el modelo determinista (EDO):
 *   - Se usan los MISMOS parámetros: R₀, 1/σ (incubación), 1/γ (infeccioso), letalidad, ν, cuarentena…
 *   - β = R₀·(γ + μ) igual que en epidemicModels.js (μ = CFR·γ).
 *   - El "kernel" de contacto se CALIBRA con una corrida previa sin enfermedad:
 *       k̄ = exposición media diaria que un individuo genera sobre los demás,
 *       c = β / k̄  ⇒  un infeccioso en población totalmente susceptible produce en promedio β contagios/día,
 *       y por tanto ≈ R₀ contagios durante su periodo infeccioso.
 *   - Lo que el modelo EDO no contiene (hogares, rutinas, mascarillas, mosquitos, pozos, azar)
 *     produce diferencias que se muestran y explican en la interfaz.
 */

import { TownMap, WORLD, STREET_N } from './townMap.js';
import { getDiseaseProfile } from './diseaseProfiles.js';

export const STATES = { S: 0, E: 1, I: 2, R: 3, D: 4, V: 5 };
export const STATE_NAMES = ['Susceptible', 'Expuesto', 'Infectado', 'Recuperado', 'Fallecido', 'Vacunado'];
export const STATE_SHORT = ['S', 'E', 'I', 'R', 'D', 'V'];
export const STATE_COLORS = ['#38bdf8', '#fbbf24', '#ef4444', '#10b981', '#94a3b8', '#a855f7'];

export const TICK = 1 / 96;          // paso epidemiológico: 15 minutos
const CLOCK_START = 7 / 24;           // la simulación arranca un día a las 07:00
const WALK_SPEED = 55;                // m por hora simulada (lapso de tiempo)
const WANDER_SPEED = 14;
const CLOSE_SIGMA = { respiratory: 1.0, contact: 0.55 };
const CLOSE_CUTOFF = { respiratory: 3.0, contact: 1.5 };
const HOUSE_CONTACT_WEIGHT = 0.35;    // cuidado/convivencia en el hogar (contacto directo)
const CONTACT_DIST = 2.0;             // definición de "contacto cercano" para estadísticas
const OVERLOAD_MULT = 2.5;            // mismo multiplicador de letalidad que la EDO al colapsar
// Parámetros del vector (Aedes/Anopheles, valores típicos de la literatura)
const MOSQ = { bite: 0.5, death: 0.1, eip: 6, range: 6, speed: 150, baseRatio: 2 };
// Reservorio hídrico
const WATER = { shed: 1, decay: 1 / 3, drinks: [7, 12.5, 19] };

const FIRST_NAMES = ['Ana', 'Luis', 'María', 'José', 'Sofía', 'Carlos', 'Lucía', 'Mateo', 'Valentina', 'Diego',
  'Camila', 'Andrés', 'Isabella', 'Juan', 'Daniela', 'Pedro', 'Laura', 'Miguel', 'Paula', 'Jorge', 'Elena', 'Tomás',
  'Sara', 'Felipe', 'Gabriela', 'Samuel', 'Mariana', 'David', 'Julieta', 'Kevin', 'Rosa', 'Alejandro', 'Clara',
  'Martín', 'Natalia', 'Óscar', 'Carmen', 'Hugo', 'Victoria', 'Emilio', 'Teresa', 'Ramiro', 'Lina', 'Santiago'];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class EpiEngine {
  constructor() {
    this.town = new TownMap();
    this.listeners = [];
    this.params = {
      modelType: 'SEIRD', r0: 2.5, incubationDays: 4, infectiousDays: 7, fatalityRate: 0.02,
      hospitalCapacityRate: 0.05, vaccinationRateDaily: 0, vaccineEfficacy: 0.85,
      quarantineStartDay: 999, quarantineEfficacy: 0.6, socialDistancingRate: 0, maskUsageRate: 0,
      isolationRate: 0, ventilation: 0, vectorControl: 0, waterTreatment: 0
    };
    this.disease = null;
    this.profile = getDiseaseProfile(null);
    this.population = 300;
    this.initialInfected = 4;
    this.seed = 12345;
    this.agents = [];
    this.mosquitoes = [];
    this.water = [0, 0, 0];
    this.events = [];
    this.history = [];
    this.transmissions = []; // eventos recientes para dibujar cadenas de contagio
    this.t = 0;
  }

  // ------------------------------------------------------------------ API
  on(fn) { this.listeners.push(fn); }
  emit(ev) {
    ev.t = this.t;
    ev.day = Math.floor(this.t);
    ev.clock = this.clockString();
    this.events.push(ev);
    if (this.events.length > 400) this.events.shift();
    for (const fn of this.listeners) fn(ev);
  }

  setDisease(disease) {
    this.disease = disease;
    this.profile = getDiseaseProfile(disease);
  }

  setParams(p) {
    const prev = { ...this.params };
    Object.assign(this.params, p);
    const rateKeys = ['r0', 'infectiousDays', 'fatalityRate', 'modelType', 'hospitalCapacityRate'];
    if (rateKeys.some((k) => prev[k] !== this.params[k]) || this.cTrans === undefined) this.updateRates();
    if (this.agents.length && (prev.socialDistancingRate !== this.params.socialDistancingRate ||
      prev.quarantineStartDay !== this.params.quarantineStartDay || prev.quarantineEfficacy !== this.params.quarantineEfficacy)) {
      for (const a of this.agents) this.buildItinerary(a);
    }
    if (this.agents.length && prev.hospitalCapacityRate !== this.params.hospitalCapacityRate) this.setupBeds(true);
  }

  get mechanism() { return this.profile.mechanism; }
  get hasE() { return this.params.modelType.includes('E'); }
  get isSIS() { return this.params.modelType === 'SIS'; }
  get gamma() { return 1 / Math.max(0.5, this.params.infectiousDays); }
  get mu() { return this.params.fatalityRate * this.gamma; }
  /** β idéntico al del modelo EDO: R₀ = β / (γ + μ). */
  get beta() { return this.params.r0 * (this.gamma + this.mu); }
  get clockHour() { return (((this.t + CLOCK_START) % 1) + 1) % 1 * 24; }
  clockString() {
    const h = this.clockHour;
    const hh = Math.floor(h);
    const mm = Math.floor((h - hh) * 60);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }
  get lockdownActive() { return this.t >= this.params.quarantineStartDay; }

  // ------------------------------------------------------------------ Inicialización
  reset({ population, initialInfected, seed } = {}) {
    if (population) this.population = Math.round(population);
    if (initialInfected !== undefined) this.initialInfected = Math.max(0, Math.round(initialInfected));
    if (seed !== undefined) this.seed = seed;
    this.rng = mulberry32(this.seed);
    this.t = 0;
    this.nextTick = TICK;
    this.events = [];
    this.history = [];
    this.transmissions = [];
    this.infectionLog = [];   // registro espacial de todos los contagios (mapa de calor 2D)
    this.snapshots = [];      // instantánea diaria de la ciudad (revisión histórica)
    this.water = [0, 0, 0];
    this.memorialCount = 0;
    this.cumulative = 0;
    this.newToday = 0;
    this.dailyNew = [];
    this.dailyPrev = [];
    this.prevAccum = 0;
    this.prevSamples = 0;
    this.lastDay = 0;
    this.lastClockHour = this.clockHour;
    this.createAgents();
    this.setupBeds(false);
    this.calibrate();
    // volver a colocar a todos en casa tras la corrida de calibración
    this.t = 0;
    this.nextTick = TICK;
    this.lastClockHour = this.clockHour;
    for (const a of this.agents) this.placeAtHome(a);
    for (const a of this.agents) this.buildItinerary(a);
    this.updateRates();
    this.createMosquitoes(false);
    // Casos índice (semilla del brote)
    const candidates = this.agents.filter((a) => a.age >= 18);
    for (let k = 0; k < this.initialInfected && candidates.length; k++) {
      const idx = Math.floor(this.rng() * candidates.length);
      const a = candidates.splice(idx, 1)[0];
      this.infect(a, -1, 'seed', a.homeKey, 0, true);
    }
    this.countStates();
    this.pushHistory();
  }

  createAgents() {
    const rng = this.rng;
    const n = this.population;
    const houses = this.town.houses;
    this.agents = [];
    for (let i = 0; i < n; i++) {
      const house = houses[i % houses.length];
      const u = rng();
      const role = u < 0.24 ? 'child' : u < 0.82 ? 'adult' : 'elder';
      const age = role === 'child' ? 4 + Math.floor(rng() * 14) : role === 'adult' ? 18 + Math.floor(rng() * 44) : 62 + Math.floor(rng() * 28);
      let occupation = null;
      if (role === 'child') occupation = 'school';
      else if (role === 'adult') {
        const w = rng();
        occupation = w < 0.3 ? 'market' : w < 0.4 ? 'school' : w < 0.48 ? 'hospital' : w < 0.7 ? 'plaza' : w < 0.75 ? 'park' : null;
      }
      this.agents.push({
        id: i,
        name: FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)],
        age, role, occupation,
        homeKey: house.key,
        houseIndex: house.index,
        memberIndex: Math.floor(i / houses.length),
        sourceId: house.sourceId,
        x: house.rect.cx, z: house.rect.cz, yaw: rng() * Math.PI * 2,
        path: null, pathIdx: 0, speed: WANDER_SPEED, placeKey: house.key, destKey: house.key,
        traveling: false, nextWander: 0, lane: (rng() - 0.5) * 2.6, walkDist: 0, moving: false,
        speedFactor: role === 'elder' ? 0.75 : role === 'child' ? 1.1 : 1,
        state: STATES.S, stateSince: 0,
        incEnd: 0, infStart: 0, infEnd: 0, severe: false, severeAt: 0, restHome: false,
        bedIdx: -1, wantsBed: false, hadNoBed: false, lying: false,
        infectedDay: null, infectedBy: null, infectedRoute: null, infectedPlace: null, infectedLambda: 0,
        secondary: [],
        contactsToday: new Set(), contactsYesterday: 0, contactsTotal: 0,
        uMask: rng(), uDist: rng(), uLock: rng(), uIso: rng(),
        coughAt: -1,
        itinerary: [], essential: false,
        history: [{ t: 0, text: 'Inicio de la simulación: sano (susceptible).', state: STATES.S }],
        lambdaNow: 0
      });
    }
    const w = (a) => (a.role === 'child' ? 0.3 : a.role === 'elder' ? 3 : 1);
    this.meanAgeWeight = this.agents.reduce((s, a) => s + w(a), 0) / Math.max(1, n);
    this.ageWeight = w;
    this.users = [0, 0, 0];
    for (const a of this.agents) this.users[a.sourceId]++;
  }

  setupBeds(keep) {
    const nBeds = Math.max(2, Math.min(60, Math.round(this.population * this.params.hospitalCapacityRate)));
    const old = keep ? this.beds : null;
    this.beds = this.town.getHospitalBeds(nBeds).map((b) => ({ ...b, occupant: -1 }));
    if (old) {
      for (const a of this.agents) {
        if (a.bedIdx >= 0) {
          if (a.bedIdx < nBeds) this.beds[a.bedIdx].occupant = a.id;
          else { a.bedIdx = -1; a.wantsBed = true; }
        }
      }
    }
  }

  placeAtHome(a) {
    const h = this.town.places[a.homeKey];
    const p = this.town.randomPointIn(h, this.rng, 1.0);
    a.x = p.x; a.z = p.z;
    a.path = null; a.placeKey = a.homeKey; a.destKey = a.homeKey; a.traveling = false;
    a.contactsToday.clear(); a.contactsTotal = 0; a.contactsYesterday = 0;
  }

  // ------------------------------------------------------------------ Calibración
  /**
   * Corrida previa de 2 días SIN enfermedad ni intervenciones. Se registra, para cada PAR de
   * personas (i, j), cuánta exposición diaria genera i sobre j (cercanía + aire compartido / hogar),
   * separando la que ocurre dentro de la casa. Con esa red se resuelve c (ver updateRates).
   */
  calibrate() {
    this.calibrating = true;
    this.calib = { biteTry: 0, biteHit: 0, drinks: [0, 0, 0] };
    this._prevClockCal = undefined;
    this.createMosquitoes(true);
    for (const a of this.agents) this.buildItinerary(a, true);
    const DAYS = 2;
    this._pairs = this.agents.map(() => new Map()); // j -> [exposición en casa, exposición fuera]
    this.advance(DAYS, true);
    const n = Math.max(1, this.agents.length);
    this.pairExposure = this._pairs.map((m) => {
      const arr = [];
      for (const v of m.values()) arr.push(v[0] / DAYS, v[1] / DAYS);
      return Float64Array.from(arr);
    });
    this._pairs = null;
    let tot = 0;
    for (const arr of this.pairExposure) for (const v of arr) tot += v;
    this.kMean = tot / n;
    this.biteSuccess = this.calib.biteTry > 0 ? Math.max(0.05, this.calib.biteHit / this.calib.biteTry) : 0.5;
    // Agua: tomas diarias registradas en cada fuente
    const D = this.calib.drinks.map((x) => x / DAYS);
    let ED = 0;
    for (const a of this.agents) ED += D[a.sourceId];
    this.waterED = ED / n;
    this.calibrating = false;
  }

  /**
   * Recalcula las constantes de transmisión a partir de R₀ (se llama al cambiar parámetros).
   *  Proximidad: se busca c tal que el número ESPERADO de contagios de un caso índice en una
   *  población totalmente susceptible sea R₀:
   *      R₀ = promedio_i Σ_j E_T[ 1 − exp(−c · e_ij · T) ]
   *  (e_ij = exposición diaria del par, T = duración infecciosa ~ Erlang). Usar 1 − e^(−x)
   *  tiene en cuenta que a una misma persona no se la contagia dos veces (saturación en el hogar).
   *  Los casos que guardan reposo sólo exponen a su familia.
   */
  updateRates() {
    if (!this.pairExposure) return;
    const mech = this.mechanism;
    this.cTrans = (mech === 'respiratory' || mech === 'contact') ? this.solveC() : 0;

    // Vector: Ross–Macdonald  R0 = m a² b² e^{-g n} / (g (γ+μ))
    const af = MOSQ.bite * (this.biteSuccess || 0.5);
    const surv = Math.exp(-MOSQ.death * MOSQ.eip);
    let m = MOSQ.baseRatio;
    let b2 = (this.params.r0 * MOSQ.death * (this.gamma + this.mu)) / (m * af * af * surv);
    if (b2 > 0.81) { m = m * b2 / 0.81; b2 = 0.81; }
    this.vector = { m, b: Math.sqrt(b2), a: MOSQ.bite, af, surv };

    // Agua (Codeço):  R0 = c ξ E[D] / (δ (γ+μ)),  E[D] = tomas diarias en la fuente del infectado
    this.cWater = (this.params.r0 * WATER.decay * (this.gamma + this.mu)) / (WATER.shed * Math.max(1, this.waterED || 1));
  }

  solveC() {
    const n = this.agents.length;
    const target = this.params.r0;
    const restP = this.profile.restAtHome || 0;
    const sevP = Math.min(1, Math.max(this.disease ? (this.disease.hospitalizationRate || 0.05) : 0.05, this.params.fatalityRate));
    const mean = this.params.infectiousDays;
    // Cuadratura determinista de la distribución Erlang(k=3) de la duración infecciosa
    const T = [0.12, 0.37, 0.63, 0.88].map((q) => {
      let lo = 0, hi = 10;
      for (let it = 0; it < 40; it++) {
        const mid = (lo + hi) / 2;
        const x = mid * 3;
        const cdf = 1 - Math.exp(-x) * (1 + x + x * x / 2);
        if (cdf < q) lo = mid; else hi = mid;
      }
      return ((lo + hi) / 2) * mean;
    });
    // Muestra de hasta 120 casos índice con sus pares (arreglos planos para rapidez)
    const step = Math.max(1, Math.floor(n / 120));
    let total = 0, idxCount = 0;
    for (let i = 0; i < n; i += step) { total += this.pairExposure[i].length / 2; idxCount++; }
    const all = new Float64Array(total), home = new Float64Array(total);
    let q = 0;
    for (let i = 0; i < n; i += step) {
      const arr = this.pairExposure[i];
      for (let k = 0; k < arr.length; k += 2) { home[q] = arr[k] * 1.5; all[q++] = arr[k] + arr[k + 1]; }
    }
    // pesos de la cuadratura: (peso, duración efectiva)
    const quad = [];
    for (const t0 of T) {
      quad.push([(1 - sevP) / T.length, t0]);
      if (sevP > 0) quad.push([sevP / T.length, t0 * 0.3]); // graves: contagian hasta su traslado
    }
    const expected = (c) => {
      let tot = 0;
      for (const [w, t] of quad) {
        const ct = c * t;
        let s = 0;
        for (let k = 0; k < total; k++) {
          s += (1 - restP) * (1 - Math.exp(-ct * all[k])) + restP * (1 - Math.exp(-ct * home[k]));
        }
        tot += w * s;
      }
      return tot / Math.max(1, idxCount);
    };
    let lo = 0, hi = 1;
    while (expected(hi) < target && hi < 1e5) hi *= 4;
    this.r0Reachable = expected(hi) >= target * 0.98;
    for (let it = 0; it < 24; it++) {
      const mid = (lo + hi) / 2;
      if (expected(mid) < target) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  // ------------------------------------------------------------------ Vectores
  createMosquitoes(calibration) {
    this.mosquitoes = [];
    if (this.mechanism !== 'vector' && !calibration) return;
    const count = calibration ? Math.min(600, this.agents.length) : this.mosquitoTarget();
    for (let i = 0; i < count; i++) this.mosquitoes.push(this.newMosquito(true));
  }
  mosquitoTarget() {
    const m = this.vector ? this.vector.m : MOSQ.baseRatio;
    return Math.min(3000, Math.round(m * this.agents.length * (1 - this.params.vectorControl)));
  }
  newMosquito(anywhere) {
    const rng = this.rng;
    let x, z;
    if (anywhere) {
      x = WORLD.x0 + rng() * (WORLD.x1 - WORLD.x0);
      z = WORLD.z0 + rng() * (WORLD.z1 - WORLD.z0);
    } else {
      const s = this.town.breedingSites[Math.floor(rng() * this.town.breedingSites.length)];
      x = s.x + (rng() - 0.5) * s.r * 2;
      z = s.z + (rng() - 0.5) * s.r * 2;
    }
    return { x, z, y: 0.8 + rng() * 1.5, tx: x, tz: z, state: 0, eipEnd: 0, src: -1, biteAt: -1, phase: rng() * 6.28 };
  }

  // ------------------------------------------------------------------ Bucle temporal
  /** Avanza dt días. Movimiento continuo + "ticks" epidemiológicos fijos de 15 min (independiente de la velocidad de reproducción). */
  advance(dt, internal = false) {
    let remaining = Math.min(dt, internal ? 10 : 3);
    let guard = 0;
    while (remaining > 1e-9 && guard++ < 2000) {
      const toTick = this.nextTick - this.t;
      const step = Math.min(remaining, Math.max(0, toTick));
      if (step > 0) this.move(step);
      this.t += step;
      remaining -= step;
      if (this.t >= this.nextTick - 1e-9) {
        this.t = this.nextTick;
        this.tick();
        this.nextTick += TICK;
      }
    }
  }

  move(dt) {
    const hours = dt * 24;
    for (const a of this.agents) {
      a.moving = false;
      if (a.state === STATES.D) continue;
      if (!a.path) continue;
      let dist = a.speed * hours;
      while (dist > 0 && a.path) {
        const p = a.path[a.pathIdx];
        const dx = p.x - a.x, dz = p.z - a.z;
        const d = Math.hypot(dx, dz);
        if (d < 1e-6) { this.nextPoint(a); continue; }
        a.moving = true;
        a.yaw = Math.atan2(dx, dz);
        if (d <= dist) {
          a.x = p.x; a.z = p.z; dist -= d; a.walkDist += d;
          this.nextPoint(a);
        } else {
          a.x += (dx / d) * dist; a.z += (dz / d) * dist; a.walkDist += dist; dist = 0;
        }
      }
    }
    if (this.mosquitoes.length) {
      const sp = MOSQ.speed * hours;
      const rng = this.rng;
      for (const m of this.mosquitoes) {
        const dx = m.tx - m.x, dz = m.tz - m.z;
        const d = Math.hypot(dx, dz);
        if (d <= sp || d < 0.2) {
          m.x = m.tx; m.z = m.tz;
          m.tx = Math.max(WORLD.x0, Math.min(WORLD.x1, m.x + (rng() - 0.5) * 40));
          m.tz = Math.max(WORLD.z0, Math.min(WORLD.z1, m.z + (rng() - 0.5) * 40));
        } else { m.x += (dx / d) * sp; m.z += (dz / d) * sp; }
      }
    }
  }

  nextPoint(a) {
    a.pathIdx++;
    if (a.pathIdx >= a.path.length) {
      a.path = null;
      if (a.traveling) {
        a.traveling = false;
        a.placeKey = a.destKey;
        a.speed = WANDER_SPEED;
        a.nextWander = this.t + (0.2 + this.rng() * 0.8) / 24;
      }
    }
  }

  tick() {
    const prevClock = this.lastClockHour;
    const clock = this.clockHour;
    this.lastClockHour = clock;
    const newDay = clock < prevClock; // medianoche
    if (newDay && !this.calibrating) for (const a of this.agents) this.buildItinerary(a);
    if (newDay && this.calibrating) for (const a of this.agents) this.buildItinerary(a, true);

    this.buildHash();
    for (const a of this.agents) this.behave(a, clock);

    if (this.calibrating) {
      this.measureExposure();
      if (this.mosquitoes.length) this.mosquitoTick(true);
      return;
    }

    for (const a of this.agents) a.lambdaNow = 0;
    const mech = this.mechanism;
    if (mech === 'respiratory' || mech === 'contact') this.proximityTransmission(mech);
    else if (mech === 'vector') this.mosquitoTick(false);
    else if (mech === 'water') this.waterTick(prevClock, clock);

    this.vaccinationTick();
    this.progressionTick();
    this.contactsTick();
    this.countStates();

    // Prevalencia media del día (para estimar Rt)
    this.prevAccum += this.counts.I;
    this.prevSamples++;

    const day = Math.floor(this.t + 1e-9);
    if (day > this.lastDay) {
      this.lastDay = day;
      this.dailyNew.push(this.newToday);
      this.dailyPrev.push(this.prevAccum / Math.max(1, this.prevSamples));
      this.prevAccum = 0; this.prevSamples = 0;
      this.newToday = 0;
      for (const a of this.agents) {
        a.contactsYesterday = a.contactsToday.size;
        a.contactsTotal += a.contactsToday.size;
        a.contactsToday.clear();
      }
      this.pushHistory();
    }
    // Purga de cadenas de contagio antiguas
    while (this.transmissions.length && this.t - this.transmissions[0].t > 1.5) this.transmissions.shift();
  }

  // ------------------------------------------------------------------ Rutinas y comportamiento
  buildItinerary(a, calibration = false) {
    const rng = this.rng;
    const dayIndex = Math.floor(this.t + CLOCK_START + 1e-9);
    const weekend = dayIndex % 7 >= 5;
    const distancer = !calibration && a.uDist < this.params.socialDistancingRate;
    const it = [{ h: 0, key: a.homeKey }];
    const leisure = (h, options) => {
      if (distancer && rng() < 0.7) return; // el distanciamiento evita salidas no esenciales
      let u = rng(), acc = 0;
      for (const [key, p] of options) { acc += p; if (u < acc) { it.push({ h, key, leisure: true }); return; } }
    };
    const j = (s) => (rng() - 0.5) * s;
    if (!weekend && a.role === 'child') {
      it.push({ h: 7.6 + j(0.5), key: 'school' });
      it.push({ h: 13.5 + j(0.6), key: a.homeKey });
      leisure(15 + j(1), [['park', 0.3], ['plaza', 0.2]]);
      it.push({ h: 18 + j(0.6), key: a.homeKey });
    } else if (!weekend && a.role === 'adult' && a.occupation) {
      it.push({ h: 7.5 + j(1), key: a.occupation });
      leisure(12 + j(0.4), [['plaza', 0.3], ['market', 0.15]]);
      it.push({ h: 13 + j(0.3), key: a.occupation });
      leisure(17 + j(0.8), [['plaza', 0.25], ['park', 0.2], ['market', 0.15]]);
      it.push({ h: 19.5 + j(1), key: a.homeKey });
    } else {
      leisure(9.5 + j(1.5), [['market', 0.35], ['plaza', 0.3], ['park', 0.1]]);
      it.push({ h: 12 + j(0.6), key: a.homeKey });
      leisure(16 + j(1.5), [['park', 0.3], ['plaza', 0.3], ['market', 0.1]]);
      it.push({ h: 19 + j(0.8), key: a.homeKey });
    }
    it.sort((p, q) => p.h - q.h);
    // Ir a buscar agua: un miembro por hogar al día (relevante para el cólera)
    if (a.memberIndex === dayIndex % 3 || (a.memberIndex === 0 && this.agents.length < this.town.houses.length * 2)) {
      const src = this.town.waterSources[a.sourceId];
      const hs = rng() < 0.5 ? 9.5 + rng() : 16 + rng();
      const resume = this.activityAt(it, hs + 0.5);
      it.push({ h: hs, key: src.placeKey }, { h: hs + 0.5, key: resume });
      it.sort((p, q) => p.h - q.h);
    }
    a.itinerary = it;
    a.essential = rng() < 0.3;
  }

  activityAt(it, h) {
    let key = it[0].key;
    for (const s of it) if (s.h <= h) key = s.key;
    return key;
  }

  /** Decide a dónde debe estar el agente ahora (rutina + reglas clínicas + intervenciones). */
  behave(a, clock) {
    if (a.state === STATES.D) return;
    const P = this.params;
    let key, lying = false, bed = null, urgent = false;
    const ill = a.state === STATES.I;
    if (a.bedIdx >= 0) {
      key = 'hospital'; bed = this.beds[a.bedIdx]; lying = true; urgent = true;
    } else if (ill && a.severe && this.t >= a.severeAt) {
      key = a.homeKey; lying = true; bed = this.homeBed(a);
    } else if (ill && a.restHome) {
      key = a.homeKey; lying = true; bed = this.homeBed(a);
    } else if (ill && a.uIso < P.isolationRate) {
      key = a.homeKey;
    } else if (!this.calibrating && this.lockdownActive && a.uLock < P.quarantineEfficacy) {
      key = a.essential && clock > 10 && clock < 11 ? 'market' : a.homeKey;
    } else {
      key = this.activityAt(a.itinerary, clock);
    }

    const place = this.town.places[key];
    if (key !== a.destKey) {
      // Nuevo destino → planificar ruta por las calles
      const target = bed ? { x: bed.x, z: bed.z } : this.town.randomPointIn(place, this.rng, 1.0);
      const from = a.traveling ? null : this.town.places[a.placeKey];
      let path = this.town.route(from, place, target, a.lane);
      if (!from) path = [{ x: a.x, z: Math.abs(a.z) > STREET_N ? Math.sign(a.z) * STREET_N : a.z }, ...path];
      a.path = path; a.pathIdx = 0; a.destKey = key; a.traveling = true; a.placeKey = null;
      let sp = WALK_SPEED * a.speedFactor;
      if (ill && this.hasSymptom('fatigue')) sp *= 0.65;
      if (ill && this.hasSymptom('agitation')) sp *= 1.3;
      if (urgent) sp = WALK_SPEED * 1.6; // traslado al hospital
      a.speed = sp;
      a.lying = false;
      return;
    }
    if (a.traveling) return;
    if (lying) {
      if (!a.lying && bed) { a.path = [{ x: bed.x, z: bed.z }]; a.pathIdx = 0; a.speed = WANDER_SPEED; }
      a.lying = !a.path;
      return;
    }
    a.lying = false;
    if (!a.path && this.t >= a.nextWander) {
      // Deambular dentro del lugar
      let best = this.town.randomPointIn(place, this.rng, 1.0);
      if (!this.calibrating && a.uDist < P.socialDistancingRate) {
        let bestScore = -1;
        for (let k = 0; k < 4; k++) {
          const c = k === 0 ? best : this.town.randomPointIn(place, this.rng, 1.0);
          const sc = this.nearestDist(c.x, c.z, a.id);
          if (sc > bestScore) { bestScore = sc; best = c; }
        }
      }
      a.path = [best]; a.pathIdx = 0;
      a.speed = WANDER_SPEED * (ill && this.hasSymptom('fatigue') ? 0.5 : 1) * (ill && this.hasSymptom('agitation') ? 2.5 : 1);
      a.nextWander = this.t + (0.25 + this.rng() * 1.0) / 24;
    }
  }

  homeBed(a) {
    const h = this.town.places[a.homeKey];
    return { x: h.bed.x - (a.memberIndex % 4) * 1.0, z: h.bed.z };
  }

  hasSymptom(s) { return this.profile.symptoms.includes(s); }

  // ------------------------------------------------------------------ Rejilla espacial (vecinos)
  buildHash() {
    const CELL = 3;
    const nx = Math.ceil((WORLD.x1 - WORLD.x0) / CELL) + 1;
    const nz = Math.ceil((WORLD.z1 - WORLD.z0) / CELL) + 1;
    if (!this.hash || this.hash.nx !== nx) {
      this.hash = { nx, nz, CELL, start: new Int32Array(nx * nz + 1), items: new Int32Array(4096) };
    }
    const H = this.hash;
    if (H.items.length < this.agents.length) H.items = new Int32Array(this.agents.length * 2);
    const counts = H.start;
    counts.fill(0);
    const cellOf = (a) => {
      const cx = Math.max(0, Math.min(nx - 1, Math.floor((a.x - WORLD.x0) / CELL)));
      const cz = Math.max(0, Math.min(nz - 1, Math.floor((a.z - WORLD.z0) / CELL)));
      return cz * nx + cx;
    };
    for (const a of this.agents) { a._cell = a.state === STATES.D ? -1 : cellOf(a); if (a._cell >= 0) counts[a._cell + 1]++; }
    for (let i = 1; i < counts.length; i++) counts[i] += counts[i - 1];
    const fill = counts.slice();
    for (const a of this.agents) if (a._cell >= 0) H.items[fill[a._cell]++] = a.id;
  }

  forNeighbors(x, z, radius, fn) {
    const H = this.hash;
    const cx = Math.floor((x - WORLD.x0) / H.CELL);
    const cz = Math.floor((z - WORLD.z0) / H.CELL);
    const r = Math.ceil(radius / H.CELL);
    const r2 = radius * radius;
    for (let dz = -r; dz <= r; dz++) {
      const zz = cz + dz;
      if (zz < 0 || zz >= H.nz) continue;
      for (let dx = -r; dx <= r; dx++) {
        const xx = cx + dx;
        if (xx < 0 || xx >= H.nx) continue;
        const c = zz * H.nx + xx;
        for (let k = H.start[c]; k < H.start[c + 1]; k++) {
          const b = this.agents[H.items[k]];
          const ddx = b.x - x, ddz = b.z - z;
          const d2 = ddx * ddx + ddz * ddz;
          if (d2 <= r2) fn(b, Math.sqrt(d2));
        }
      }
    }
  }

  nearestDist(x, z, selfId) {
    let best = 6;
    this.forNeighbors(x, z, 6, (b, d) => { if (b.id !== selfId && d < best) best = d; });
    return best;
  }

  // ------------------------------------------------------------------ Calibración: exposición
  measureExposure() {
    const pairs = this._pairs;
    const mech = this.mechanism;
    const proximity = mech === 'respiratory' || mech === 'contact';
    const sig2 = 2 * (CLOSE_SIGMA[mech] || 1) ** 2;
    const cutoff = CLOSE_CUTOFF[mech] || 3;
    const add = (i, j, v, home) => {
      const m = pairs[i];
      let e = m.get(j);
      if (!e) { e = [0, 0]; m.set(j, e); }
      e[home ? 0 : 1] += v;
    };
    const occ = {};
    for (const a of this.agents) {
      if (a.placeKey) (occ[a.placeKey] = occ[a.placeKey] || []).push(a);
      if (!proximity) continue;
      const home = a.placeKey === a.homeKey;
      this.forNeighbors(a.x, a.z, cutoff, (b, d) => {
        if (b.id === a.id) return;
        add(a.id, b.id, Math.exp(-(d * d) / sig2) * TICK, home && b.placeKey === a.homeKey);
      });
    }
    // Aire compartido (aerosoles) o convivencia en el hogar: pares en el mismo lugar
    if (proximity) {
      const air = this.profile.airWeight || 0;
      for (const key in occ) {
        const list = occ[key];
        const p = this.town.places[key];
        const w = mech === 'respiratory' ? air * p.airFactor : p.type === 'house' ? HOUSE_CONTACT_WEIGHT : 0;
        if (w <= 0 || list.length < 2) continue;
        for (const a of list) for (const b of list) if (a !== b) add(a.id, b.id, w * TICK, p.type === 'house');
      }
    }
    // Tomas de agua (calibración hídrica)
    const clock = this.clockHour;
    const prev = this._prevClockCal === undefined ? clock : this._prevClockCal;
    this._prevClockCal = clock;
    if (WATER.drinks.some((h) => prev < h && clock >= h)) {
      for (const a of this.agents) this.calib.drinks[this.drinkSource(a)]++;
    }
  }

  /** Fuente de la que bebe el agente: la fuente de la plaza o el pozo si está allí; si no, la de su casa. */
  drinkSource(a) {
    if (a.placeKey === 'plaza') return 0;
    if (a.placeKey === 'wellN') return 1;
    if (a.placeKey === 'wellS') return 2;
    return a.sourceId;
  }

  // ------------------------------------------------------------------ Transmisión por proximidad
  inhaleFactor(a) { return a.uMask < this.params.maskUsageRate ? 0.6 : 1; }
  emitFactor(a) {
    let f = a.uMask < this.params.maskUsageRate ? 0.5 : 1;
    if (a.bedIdx >= 0 && a.placeKey === 'hospital') f *= 0.25; // aislamiento hospitalario / EPP
    return f;
  }

  proximityTransmission(mech) {
    const c = this.cTrans;
    const sig2 = 2 * CLOSE_SIGMA[mech] ** 2;
    const cutoff = CLOSE_CUTOFF[mech];
    const lam = new Float64Array(this.agents.length);
    const who = new Int32Array(this.agents.length).fill(-1);
    const wsum = new Float64Array(this.agents.length);
    const rng = this.rng;
    const placeEmit = {};
    const placeEmitters = {};
    const distRate = this.params.socialDistancingRate;

    for (const i of this.agents) {
      if (i.state !== STATES.I) continue;
      const e = this.emitFactor(i);
      this.forNeighbors(i.x, i.z, cutoff, (j, d) => {
        if (j.state !== STATES.S || j.id === i.id) return;
        if (i.uDist < distRate || j.uDist < distRate) d = Math.max(d, 2.0); // distanciamiento ≥ 2 m
        const k = Math.exp(-(d * d) / sig2);
        const contrib = c * e * this.inhaleFactor(j) * k * TICK;
        lam[j.id] += contrib;
        wsum[j.id] += contrib;
        if (rng() * wsum[j.id] < contrib) who[j.id] = i.id; // muestreo ponderado del contagiador
      });
      if (i.placeKey) {
        placeEmit[i.placeKey] = (placeEmit[i.placeKey] || 0) + e;
        (placeEmitters[i.placeKey] = placeEmitters[i.placeKey] || []).push(i.id);
      }
    }
    // Aire compartido (aerosoles) o convivencia en el hogar
    const air = (this.profile.airWeight || 0) * (1 - this.params.ventilation);
    for (const j of this.agents) {
      if (j.state !== STATES.S || !j.placeKey) continue;
      const E = placeEmit[j.placeKey];
      if (!E) continue;
      const p = this.town.places[j.placeKey];
      const w = mech === 'respiratory' ? air * p.airFactor : (p.type === 'house' ? HOUSE_CONTACT_WEIGHT : 0);
      if (w <= 0) continue;
      const contrib = c * w * E * this.inhaleFactor(j) * TICK;
      lam[j.id] += contrib;
      wsum[j.id] += contrib;
      if (rng() * wsum[j.id] < contrib) {
        const list = placeEmitters[j.placeKey];
        who[j.id] = list[Math.floor(rng() * list.length)];
      }
    }
    this.airLoad = placeEmit;
    for (const j of this.agents) {
      const l = lam[j.id];
      if (l <= 0) continue;
      j.lambdaNow = l;
      if (rng() < 1 - Math.exp(-l)) {
        const inf = this.agents[who[j.id]];
        const route = inf && inf.placeKey && inf.placeKey === j.placeKey && Math.hypot(inf.x - j.x, inf.z - j.z) > cutoff
          ? (mech === 'respiratory' ? 'aerosol' : 'hogar') : (mech === 'respiratory' ? 'gotículas' : 'contacto');
        this.infect(j, who[j.id], route, j.placeKey, l);
      }
    }
  }

  // ------------------------------------------------------------------ Transmisión vectorial
  mosquitoTick(calibration) {
    const rng = this.rng;
    const V = this.vector;
    const pBite = MOSQ.bite * TICK;
    for (let k = this.mosquitoes.length - 1; k >= 0; k--) {
      const m = this.mosquitoes[k];
      if (!calibration && rng() < MOSQ.death * TICK) {
        // muere y es reemplazado por un mosquito nuevo (sano) en un criadero
        if (this.mosquitoes.length <= this.mosquitoTarget()) this.mosquitoes[k] = this.newMosquito(false);
        else this.mosquitoes.splice(k, 1);
        continue;
      }
      if (!calibration && m.state === 1 && this.t >= m.eipEnd) m.state = 2;
      if (rng() >= pBite) continue;
      // intento de picadura: la persona más cercana dentro del radio de búsqueda
      let target = null, bd = MOSQ.range;
      this.forNeighbors(m.x, m.z, MOSQ.range, (h, d) => { if (d < bd && h.bedIdx < 0) { bd = d; target = h; } });
      if (calibration) { this.calib.biteTry++; if (target) this.calib.biteHit++; continue; }
      if (!target) continue;
      m.x = target.x + 0.2; m.z = target.z; m.tx = m.x; m.tz = m.z; m.biteAt = this.t;
      if (target.state === STATES.I && m.state === 0 && rng() < V.b) {
        m.state = 1; m.eipEnd = this.t + MOSQ.eip; m.src = target.id;
      } else if (m.state === 2 && target.state === STATES.S && rng() < V.b) {
        this.infect(target, m.src, 'mosquito', target.placeKey, V.b);
      }
    }
    if (!calibration) {
      const tgt = this.mosquitoTarget();
      while (this.mosquitoes.length < tgt && rng() < 0.5) this.mosquitoes.push(this.newMosquito(false));
      if (this.mosquitoes.length > tgt * 1.02) this.mosquitoes.length = Math.max(tgt, this.mosquitoes.length - 20);
    }
  }

  // ------------------------------------------------------------------ Transmisión hídrica
  waterTick(prevClock, clock) {
    const rng = this.rng;
    const decay = Math.exp(-WATER.decay * TICK);
    const shedders = [[], [], []];
    for (const a of this.agents) if (a.state === STATES.I && a.bedIdx < 0) shedders[a.sourceId].push(a.id);
    for (let k = 0; k < 3; k++) this.water[k] = this.water[k] * decay + WATER.shed * TICK * shedders[k].length;
    const crossed = WATER.drinks.some((h) => (prevClock < h && clock >= h));
    if (!crossed) return;
    const c = this.cWater * (1 - this.params.waterTreatment);
    for (const a of this.agents) {
      if (a.state !== STATES.S || a.bedIdx >= 0) continue;
      const srcId = this.drinkSource(a);
      const W = this.water[srcId];
      if (W <= 0) continue;
      const l = c * W;
      a.lambdaNow = l;
      if (rng() < 1 - Math.exp(-l)) {
        const list = shedders[srcId];
        const src = list.length ? list[Math.floor(rng() * list.length)] : -1;
        this.infect(a, src, 'agua', 'water' + srcId, l);
      }
    }
  }

  // ------------------------------------------------------------------ Vacunación, progresión, contactos
  vaccinationTick() {
    const nu = this.params.vaccinationRateDaily * this.params.vaccineEfficacy;
    if (nu <= 0) return;
    const p = 1 - Math.exp(-nu * TICK); // mismo flujo que la EDO: dV/dt = ν·ef·S
    for (const a of this.agents) if (a.state === STATES.S && this.rng() < p) this.vaccinate(a, 'campaña');
  }

  erlang(mean, k = 3) {
    let s = 0;
    for (let i = 0; i < k; i++) s += -Math.log(1 - this.rng()) * (mean / k);
    return s;
  }

  progressionTick() {
    const P = this.params;
    for (const a of this.agents) {
      if (a.state === STATES.E && this.t >= a.incEnd) this.becomeInfectious(a);
      else if (a.state === STATES.I) {
        if (this.hasSymptom('cough') && !a.lying && this.rng() < 0.35) a.coughAt = this.t;
        if (a.severe && this.t >= a.severeAt && a.bedIdx < 0 && !a.wantsBed) {
          a.wantsBed = true;
          this.requestBed(a);
        } else if (a.wantsBed && a.bedIdx < 0) this.requestBed(a);
        if (this.t >= a.infEnd) this.resolve(a);
      }
    }
  }

  requestBed(a) {
    const bed = this.beds.findIndex((b) => b.occupant < 0);
    if (bed >= 0) {
      this.beds[bed].occupant = a.id;
      a.bedIdx = bed;
      a.wantsBed = false;
      this.log(a, 'Caso grave: trasladado al hospital (cama ' + (bed + 1) + ').');
      this.emit({ type: 'hospital', agentId: a.id });
    } else if (!a.hadNoBed) {
      a.hadNoBed = true;
      this.log(a, 'Caso grave SIN cama disponible: reposo en casa (riesgo de muerte ×' + OVERLOAD_MULT + ').');
      this.emit({ type: 'nobed', agentId: a.id });
    }
  }

  releaseBed(a) {
    if (a.bedIdx >= 0) { this.beds[a.bedIdx].occupant = -1; a.bedIdx = -1; }
    a.wantsBed = false;
  }

  becomeInfectious(a) {
    const P = this.params;
    a.state = STATES.I;
    a.stateSince = this.t;
    a.infStart = this.t;
    a.infEnd = this.t + this.erlang(P.infectiousDays);
    const h = Math.max(this.disease ? (this.disease.hospitalizationRate || 0.05) : 0.05, P.fatalityRate);
    a.sevBase = h;
    a.severe = this.rng() < Math.min(1, h * this.ageWeight(a) / this.meanAgeWeight);
    a.severeAt = a.infStart + 0.3 * (a.infEnd - a.infStart);
    a.restHome = this.rng() < this.profile.restAtHome;
    a.hadNoBed = false;
    this.log(a, `Fin de la incubación → INFECTADO (contagioso). Síntomas: ${this.profile.symptomText}` +
      (a.severe ? ' Evolucionará a caso grave.' : ''));
    this.emit({ type: 'onset', agentId: a.id });
  }

  resolve(a) {
    const P = this.params;
    let pd = 0;
    if (a.severe) {
      pd = Math.min(1, P.fatalityRate / Math.max(1e-9, a.sevBase));
      if (a.bedIdx < 0 && a.hadNoBed) pd = Math.min(1, pd * OVERLOAD_MULT);
    }
    this.releaseBed(a);
    a.lying = false;
    if (this.rng() < pd) {
      a.state = STATES.D;
      a.stateSince = this.t;
      a.memorialSlot = this.memorialCount++;
      a.path = null;
      this.log(a, 'Falleció. Descanse en paz.');
      this.emit({ type: 'death', agentId: a.id, p: pd });
    } else if (this.isSIS) {
      a.state = STATES.S;
      a.stateSince = this.t;
      this.log(a, 'Se recuperó, pero SIN inmunidad (modelo SIS): vuelve a ser susceptible.');
      this.emit({ type: 'recovery', agentId: a.id, sis: true });
    } else {
      a.state = STATES.R;
      a.stateSince = this.t;
      this.log(a, 'Se recuperó y desarrolló inmunidad (RECUPERADO).');
      this.emit({ type: 'recovery', agentId: a.id });
    }
    a.severe = false;
  }

  contactsTick() {
    for (const a of this.agents) {
      if (a.state === STATES.D || a.bedIdx >= 0) continue;
      this.forNeighbors(a.x, a.z, CONTACT_DIST, (b) => { if (b.id !== a.id && b.bedIdx < 0) a.contactsToday.add(b.id); });
    }
  }

  // ------------------------------------------------------------------ Transiciones
  log(a, text) {
    a.history.push({ t: this.t, text, state: a.state });
    if (a.history.length > 40) a.history.splice(1, 1);
  }

  infect(a, infectorId, route, placeKey, lambda, isSeed = false) {
    if (a.state !== STATES.S) return false;
    a.infectedDay = this.t;
    a.infectedBy = infectorId >= 0 ? infectorId : null;
    a.infectedRoute = route;
    a.infectedPlace = placeKey;
    a.infectedLambda = lambda;
    a.secondary = a.secondary || [];
    const inf = infectorId >= 0 ? this.agents[infectorId] : null;
    if (inf) inf.secondary.push(a.id);
    this.cumulative++;
    this.newToday++;
    const place = placeKey && this.town.places[placeKey] ? this.town.places[placeKey].name
      : placeKey && placeKey.startsWith('water') ? this.town.waterSources[+placeKey.slice(5)].name : 'la calle';
    a.infectedPlaceName = place;
    const how = isSeed ? 'Caso índice (inicio del brote).'
      : route === 'manual' ? 'Contagiado manualmente por el usuario.'
        : `Contagiado por #${infectorId} vía ${route} en ${place} (λ=${lambda.toFixed(3)}, P=${((1 - Math.exp(-lambda)) * 100).toFixed(1)}%).`;
    if (this.hasE && !isSeed) {
      a.state = STATES.E;
      a.stateSince = this.t;
      a.incEnd = this.t + this.erlang(this.params.incubationDays);
      this.log(a, how + ' → EXPUESTO (incubando, aún no contagia).');
    } else {
      this.log(a, how);
      this.becomeInfectious(a);
    }
    if (inf || route === 'mosquito') {
      this.transmissions.push({ t: this.t, from: infectorId, to: a.id, route });
    }
    if (!this.calibrating) {
      // Sólo registro (no consume números aleatorios ni altera la dinámica)
      const c = this.counts || { S: 0, I: 0, N: this.agents.length };
      this.infectionLog.push({ t: this.t, x: a.x, z: a.z, route, from: infectorId, to: a.id, place: placeKey,
        fx: inf ? inf.x : a.x, fz: inf ? inf.z : a.z, S: c.S, I: c.I, N: c.N || this.agents.length });
    }
    if (!this.calibrating) this.emit({ type: isSeed ? 'seed' : 'infection', agentId: a.id, otherId: infectorId, route, place, lambda });
    return true;
  }

  vaccinate(a, how = 'manual') {
    if (a.state !== STATES.S) return false;
    a.state = STATES.V;
    a.stateSince = this.t;
    a.vaccinatedDay = this.t;
    this.log(a, `Vacunado (${how}): queda protegido.`);
    this.emit({ type: 'vaccination', agentId: a.id, how });
    return true;
  }

  // ------------------------------------------------------------------ Acciones del usuario
  manualInfect(id) {
    const a = this.agents[id];
    if (!a || (a.state !== STATES.S && a.state !== STATES.R && a.state !== STATES.V)) return false;
    a.state = STATES.S;
    const ok = this.infect(a, -1, 'manual', a.placeKey, 0);
    this.countStates();
    return ok;
  }
  manualVaccinate(id) { const ok = this.vaccinate(this.agents[id]); this.countStates(); return ok; }
  manualCure(id) {
    const a = this.agents[id];
    if (!a || (a.state !== STATES.I && a.state !== STATES.E)) return false;
    this.releaseBed(a);
    a.state = this.isSIS ? STATES.S : STATES.R;
    a.stateSince = this.t; a.lying = false; a.severe = false;
    this.log(a, 'Curado manualmente por el usuario (tratamiento).');
    this.emit({ type: 'recovery', agentId: a.id, manual: true });
    this.countStates();
    return true;
  }
  outbreakAt(x, z, count = 3) {
    const cands = this.agents.filter((a) => a.state === STATES.S)
      .map((a) => ({ a, d: Math.hypot(a.x - x, a.z - z) })).sort((p, q) => p.d - q.d).slice(0, count);
    for (const { a } of cands) this.infect(a, -1, 'manual', a.placeKey, 0);
    this.countStates();
    return cands.length;
  }
  randomOutbreak(count = 5) {
    const s = this.agents.filter((a) => a.state === STATES.S);
    let k = 0;
    while (k < count && s.length) { const a = s.splice(Math.floor(this.rng() * s.length), 1)[0]; this.infect(a, -1, 'manual', a.placeKey, 0); k++; }
    this.countStates();
    return k;
  }
  vaccinateFraction(f) {
    let k = 0;
    for (const a of this.agents) if (a.state === STATES.S && this.rng() < f) { this.vaccinate(a, 'jornada masiva'); k++; }
    this.countStates();
    return k;
  }

  // ------------------------------------------------------------------ Estadísticas
  countStates() {
    const c = { S: 0, E: 0, I: 0, R: 0, D: 0, V: 0, H: 0, waiting: 0, N: this.agents.length };
    for (const a of this.agents) {
      c[STATE_SHORT[a.state]]++;
      if (a.bedIdx >= 0) c.H++;
      if (a.state === STATES.I && a.wantsBed && a.bedIdx < 0) c.waiting++;
    }
    c.beds = this.beds ? this.beds.length : 0;
    c.cumulative = this.cumulative;
    c.newToday = this.newToday;
    this.counts = c;
    return c;
  }

  /** Rt estimado desde los agentes: (contagios últimos 7 días) / (días-persona infecciosos) × duración infecciosa. */
  estimateRt() {
    const n = this.dailyNew.length;
    if (n === 0) return null;
    const w = Math.min(7, n);
    let inf = 0, prev = 0;
    for (let i = n - w; i < n; i++) { inf += this.dailyNew[i]; prev += this.dailyPrev[i]; }
    if (prev < 4 || n < 3) return null; // muy pocos casos: estimación demasiado ruidosa
    return (inf / prev) * this.params.infectiousDays;
  }

  /** R₀ observado: promedio de contagios secundarios de los casos índice ya resueltos. */
  observedR0() {
    const seeds = this.agents.filter((a) => a.infectedRoute === 'seed' && (a.state !== STATES.I && a.state !== STATES.E));
    if (!seeds.length) return null;
    return { value: seeds.reduce((s, a) => s + a.secondary.length, 0) / seeds.length, n: seeds.length };
  }

  pushHistory() {
    const c = this.counts || this.countStates();
    const n = this.agents.length;
    const snap = { day: Math.round(this.t), x: new Float32Array(n), z: new Float32Array(n), s: new Uint8Array(n),
      water: this.water.slice(), mosq: this.mosquitoes.filter((m) => m.state === 2).map((m) => [m.x, m.z]) };
    for (let i = 0; i < n; i++) { const a = this.agents[i]; snap.x[i] = a.x; snap.z[i] = a.z; snap.s[i] = a.state; }
    this.snapshots.push(snap);
    this.history.push({
      day: Math.round(this.t), S: c.S, E: c.E, I: c.I, R: c.R, D: c.D, V: c.V, H: c.H,
      newInf: this.dailyNew.length ? this.dailyNew[this.dailyNew.length - 1] : 0,
      cumulative: this.cumulative, Rt: this.estimateRt()
    });
  }

  /** Condiciones iniciales equivalentes para resolver la EDO con la misma población que los agentes. */
  initialConditions() {
    // Si la simulación empezó sin casos (p. ej. brote introducido después), la EDO comparativa
    // arranca el primer día con casos (offset) para que ambas describan el mismo brote.
    const first = this.history.find((h) => h.I + h.E > 0) || this.history[0] || this.countStates();
    return { population: this.agents.length, initialInfected: first.I, initialExposed: first.E, initialRecovered: first.R,
      initialVaccinated: first.V || 0, offset: first.day || 0 };
  }
}
