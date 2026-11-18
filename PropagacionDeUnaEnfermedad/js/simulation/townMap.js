/**
 * Mapa de la comunidad simulada (unidades: metros).
 *
 *   z = +44 ┌──────────── viviendas (2 filas) ──────────── memorial ┐
 *   z = +18 ├──────────────── calle norte ────────────────────────────┤
 *           │ Parque │ Escuela │  Plaza  │ Mercado │   Hospital        │
 *   z = −18 ├──────────────── calle sur ──────────────────────────────┤
 *   z = −44 └──────────── viviendas (2 filas) ─────────────────────────┘
 *
 * Se modela una retícula de calles: las personas caminan por las calles (no a través
 * de los edificios) usando rutas Manhattan sencillas. Este módulo es lógica pura
 * (sin Three.js) y lo comparten el motor epidemiológico, la vista 3D y la vista 2D.
 */

export const WORLD = { x0: -64, x1: 64, z0: -44, z1: 44 };
export const STREET_N = 18;
export const STREET_S = -18;
export const V_STREETS = [-36, -12, 12, 36];

const HOUSE_XS = [];
for (let x = -60; x <= 60; x += 8) HOUSE_XS.push(x);

function rect(x0, x1, z0, z1) {
  return { x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 };
}

export class TownMap {
  constructor() {
    this.places = {};
    this.houses = [];
    this.waterSources = [];
    this.memorial = rect(47, 63, 30.5, 43);
    this.build();
  }

  addPlace(p) {
    this.places[p.key] = p;
    return p;
  }

  build() {
    // ----- Zonas centrales (accesibles desde las calles norte y sur) -----
    const mid = (key, type, name, x0, x1, opts = {}) =>
      this.addPlace({
        key, type, name,
        rect: rect(x0, x1, -15.5, 15.5),
        sides: ['N', 'S'],
        indoor: !!opts.indoor,
        airFactor: opts.airFactor || 0,
        ...opts
      });

    mid('park', 'park', 'Parque', -62, -38.5, { airFactor: 0 });
    mid('school', 'school', 'Escuela', -33.5, -14.5, { indoor: true, airFactor: 0.07 });
    mid('plaza', 'plaza', 'Plaza central', -9.5, 9.5, { airFactor: 0 });
    mid('market', 'market', 'Mercado', 14.5, 33.5, { indoor: true, airFactor: 0.05 });
    mid('hospital', 'hospital', 'Hospital', 38.5, 62, { indoor: true, airFactor: 0.03 });

    // ----- Viviendas -----
    let hid = 0;
    const addHouse = (x, side, row) => {
      const sgn = side === 'N' ? 1 : -1;
      const cz = sgn * (row === 1 ? 24 : 34);
      // Las casas de la esquina noreste se reservan para el jardín memorial
      if (side === 'N' && row === 2 && x >= 52) return;
      const r = rect(x - 3, x + 3, cz - 3, cz + 3);
      const doorZ = sgn * (row === 1 ? 21 : 31);
      // Ruta desde la puerta hasta la calle (las de 2ª fila usan el pasaje entre casas)
      const exit = row === 1
        ? [{ x, z: doorZ }, { x, z: sgn * STREET_N }]
        : [{ x, z: doorZ }, { x: x + 4 * (x >= 60 ? -1 : 1), z: sgn * 29 }, { x: x + 4 * (x >= 60 ? -1 : 1), z: sgn * STREET_N }];
      const h = this.addPlace({
        key: 'house' + hid,
        type: 'house',
        name: 'Casa ' + (hid + 1),
        index: hid,
        rect: r,
        sides: [side],
        indoor: true,
        airFactor: 1.0,
        exitPath: exit,
        bed: { x: x + 1.6, z: cz + sgn * 1.4 },
        sourceId: 0
      });
      this.houses.push(h);
      hid++;
    };
    for (const side of ['N', 'S']) for (const row of [1, 2]) for (const x of HOUSE_XS) addHouse(x, side, row);

    // ----- Fuentes de agua -----
    this.waterSources = [
      { id: 0, name: 'Fuente de la plaza', x: 0, z: 0, placeKey: 'plaza' },
      { id: 1, name: 'Pozo norte', x: -24, z: 29, placeKey: 'wellN' },
      { id: 2, name: 'Pozo sur', x: 24, z: -29, placeKey: 'wellS' }
    ];
    this.addPlace({
      key: 'wellN', type: 'well', name: 'Pozo norte', rect: rect(-25.2, -22.8, 28, 30), sides: ['N'],
      indoor: false, airFactor: 0, exitPath: [{ x: -24, z: 28.2 }, { x: -24, z: STREET_N }]
    });
    this.addPlace({
      key: 'wellS', type: 'well', name: 'Pozo sur', rect: rect(22.8, 25.2, -30, -28), sides: ['S'],
      indoor: false, airFactor: 0, exitPath: [{ x: 24, z: -28.2 }, { x: 24, z: STREET_S }]
    });
    for (const h of this.houses) {
      let best = 0, bd = Infinity;
      for (const s of this.waterSources) {
        const d = Math.hypot(s.x - h.rect.cx, s.z - h.rect.cz);
        if (d < bd) { bd = d; best = s.id; }
      }
      h.sourceId = best;
    }

    // ----- Criaderos de mosquitos (agua estancada) -----
    this.breedingSites = [
      { x: -50, z: -4, r: 5 },   // estanque del parque
      { x: -44, z: 9, r: 1.2 },
      { x: 30, z: 29, r: 1.0 },  // recipientes en patios
      { x: -40, z: -30, r: 1.0 },
      { x: 6, z: -40, r: 1.0 },
      { x: 46, z: -40, r: 1.0 }
    ];
  }

  /** Camas del hospital, distribuidas en una sala sin techo para que sean visibles. */
  getHospitalBeds(count) {
    const beds = [];
    const cols = 6;
    for (let i = 0; i < count; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      beds.push({ x: 41.5 + c * 3.4, z: -12.5 + r * 2.7 });
    }
    return beds;
  }

  memorialSlot(i) {
    const cols = 13;
    const c = i % cols;
    const r = Math.floor(i / cols);
    return { x: this.memorial.x0 + 1 + c * 1.15, z: this.memorial.z0 + 1.2 + (r % 10) * 1.15 };
  }

  /** Punto aleatorio dentro de un lugar (para deambular). */
  randomPointIn(place, rng, inset = 1.0) {
    const r = place.rect;
    if (place.type === 'hospital') {
      // personal y visitantes deambulan por el pasillo, no sobre las camas
      return { x: 39.5 + rng() * 1.5, z: r.z0 + inset + rng() * (r.d - 2 * inset) };
    }
    if (place.type === 'plaza') {
      // evitar la fuente central
      for (let k = 0; k < 6; k++) {
        const x = r.x0 + inset + rng() * (r.w - 2 * inset);
        const z = r.z0 + inset + rng() * (r.d - 2 * inset);
        if (x * x + z * z > 9) return { x, z };
      }
    }
    if (place.type === 'park') {
      for (let k = 0; k < 6; k++) {
        const x = r.x0 + inset + rng() * (r.w - 2 * inset);
        const z = r.z0 + inset + rng() * (r.d - 2 * inset);
        if (Math.hypot(x + 50, z + 4) > 6) return { x, z };
      }
    }
    return {
      x: r.x0 + inset + rng() * Math.max(0.1, r.w - 2 * inset),
      z: r.z0 + inset + rng() * Math.max(0.1, r.d - 2 * inset)
    };
  }

  placeAt(x, z) {
    for (const k in this.places) {
      const r = this.places[k].rect;
      if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return this.places[k];
    }
    return null;
  }

  /** Puntos desde el interior de un lugar hasta su calle. */
  exitPoints(place, side) {
    if (place.exitPath) return place.exitPath.slice();
    const r = place.rect;
    const sgn = side === 'N' ? 1 : -1;
    const edge = sgn > 0 ? r.z1 : r.z0;
    return [{ x: r.cx, z: edge }, { x: r.cx, z: sgn * STREET_N }];
  }

  /**
   * Ruta peatonal entre dos lugares siguiendo la retícula de calles.
   * lane: desplazamiento lateral (carril) del peatón para que no caminen en fila india.
   */
  route(fromPlace, toPlace, target, lane = 0) {
    const pts = [];
    if (fromPlace && toPlace && fromPlace.key === toPlace.key) {
      pts.push(target);
      return pts;
    }
    const sidesA = fromPlace ? fromPlace.sides : ['N', 'S'];
    const sidesB = toPlace.sides;
    const common = sidesA.filter((s) => sidesB.includes(s));
    const offset = (p, side) => ({ x: p.x, z: p.z + (Math.abs(Math.abs(p.z) - STREET_N) < 0.01 ? (side === 'N' ? lane : -lane) : 0) });

    if (common.length > 0) {
      // Preferir el lado cuya calle esté más cerca del origen
      let side = common[0];
      if (common.length > 1 && fromPlace) side = fromPlace.rect.cz >= 0 ? 'N' : 'S';
      if (common.length > 1 && !fromPlace) side = target.z >= 0 ? 'N' : 'S';
      const a = fromPlace ? this.exitPoints(fromPlace, side) : [];
      const b = this.exitPoints(toPlace, side).reverse();
      for (const p of a) pts.push(offset(p, side));
      for (const p of b) pts.push(offset(p, side));
    } else {
      const sa = sidesA[0];
      const sb = sidesB[0];
      const ax = fromPlace ? fromPlace.rect.cx : 0;
      const bx = toPlace.rect.cx;
      const midX = (ax + bx) / 2;
      let vx = V_STREETS[0];
      for (const v of V_STREETS) if (Math.abs(v - midX) < Math.abs(vx - midX)) vx = v;
      const a = fromPlace ? this.exitPoints(fromPlace, sa) : [];
      for (const p of a) pts.push(offset(p, sa));
      pts.push({ x: vx + lane, z: (sa === 'N' ? 1 : -1) * (STREET_N + lane) });
      pts.push({ x: vx + lane, z: (sb === 'N' ? 1 : -1) * (STREET_N + lane) });
      const b = this.exitPoints(toPlace, sb).reverse();
      for (const p of b) pts.push(offset(p, sb));
    }
    pts.push(target);
    return pts;
  }
}
