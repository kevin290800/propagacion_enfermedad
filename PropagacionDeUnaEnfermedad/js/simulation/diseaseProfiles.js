/**
 * Perfiles de mecanismo de transmisión y de síntomas visibles por enfermedad.
 *
 * El catálogo clínico (diseasesData.js) NO se modifica: este archivo sólo añade
 * la información que necesita la simulación individual (agentes) para:
 *   1. Elegir el mecanismo físico de contagio correcto (no todas se contagian igual).
 *   2. Representar síntomas visibles coherentes con la enfermedad.
 */

export const MECHANISMS = {
  respiratory: {
    id: 'respiratory',
    name: 'Respiratoria (gotículas + aerosoles)',
    icon: '🫁',
    summary:
      'El contagio ocurre por cercanía (gotículas a < 2–3 m) y por compartir aire en espacios cerrados (aerosoles). ' +
      'Cada infeccioso emite; cada susceptible cercano acumula una "dosis" λ y se infecta con probabilidad 1 − e^(−λ).'
  },
  contact: {
    id: 'contact',
    name: 'Contacto directo / fluidos',
    icon: '🤝',
    summary:
      'Sólo transmiten los contactos físicos muy cercanos (< 1,5 m) y la convivencia/cuidado dentro del hogar. ' +
      'No hay transmisión por aire compartido: por eso estas epidemias crecen más lento y en "racimos" familiares.'
  },
  vector: {
    id: 'vector',
    name: 'Vectorial (mosquitos)',
    icon: '🦟',
    summary:
      'Las personas NO se contagian entre sí. Un mosquito sano pica a un infectado, incuba el patógeno (periodo extrínseco) ' +
      'y luego infecta a otras personas al picarlas. Modelo de Ross–Macdonald: R₀ = m·a²·b_hm·b_mh·e^(−g·n) / (g·(γ+μ)).'
  },
  water: {
    id: 'water',
    name: 'Hídrica (agua contaminada)',
    icon: '💧',
    summary:
      'Los infectados contaminan la fuente de agua de su hogar (pozo o fuente). Quien bebe de una fuente contaminada ' +
      'se expone con probabilidad 1 − e^(−c·W). Modelo de reservorio ambiental tipo Codeço: dW/dt = ξ·I − δ·W.'
  }
};

// Síntomas visuales disponibles:
//  cough       → tos (animación + nube de gotículas)
//  fatigue     → camina lento y encorvado
//  fever       → icono de termómetro, piel enrojecida
//  rash        → exantema (piel con tono rojizo moteado)
//  jaundice    → ictericia (piel amarillenta)
//  chills      → escalofríos (temblor)
//  agitation   → agitación psicomotriz (movimiento errático)
//  diarrhea    → deshidratación (encorvado, se sujeta el abdomen)
//  restAtHome  → probabilidad de que un caso leve guarde reposo en cama en casa
const P = (mechanism, airWeight, symptoms, restAtHome, symptomText) => ({
  mechanism,
  airWeight,
  symptoms,
  restAtHome,
  symptomText
});

export const DISEASE_PROFILES = {
  covid19_omicron: P('respiratory', 0.7, ['cough', 'fatigue', 'fever'], 0.25,
    'Tos, fatiga y fiebre leve. Los casos graves se trasladan al hospital.'),
  covid19_ancestral: P('respiratory', 0.45, ['cough', 'fever', 'fatigue'], 0.35,
    'Fiebre, tos seca y disnea; mayor proporción de casos graves (neumonía).'),
  sarampion: P('respiratory', 1.0, ['fever', 'rash', 'cough'], 0.5,
    'Fiebre alta, exantema rojizo y tos. Altamente transmisible por aerosoles.'),
  influenza: P('respiratory', 0.25, ['cough', 'fever', 'fatigue'], 0.4,
    'Inicio súbito de fiebre, tos y dolores musculares (reposo en cama).'),
  varicela: P('respiratory', 0.7, ['rash', 'fever'], 0.45,
    'Exantema vesicular pruriginoso y febrícula.'),
  tuberculosis: P('respiratory', 0.9, ['cough', 'fatigue'], 0.15,
    'Tos persistente, cansancio y pérdida de peso. Contagio en espacios cerrados prolongados.'),
  dengue: P('vector', 0, ['fever', 'fatigue', 'rash'], 0.6,
    'Fiebre "quebrantahuesos": dolor muscular intenso, reposo en cama.'),
  fiebre_amarilla: P('vector', 0, ['fever', 'jaundice', 'fatigue'], 0.6,
    'Fiebre e ictericia (piel amarilla). Alta proporción de casos graves.'),
  malaria: P('vector', 0, ['chills', 'fever', 'fatigue'], 0.5,
    'Paroxismos de escalofríos (temblor) seguidos de fiebre. Modelo SIS: sin inmunidad duradera.'),
  zika: P('vector', 0, ['rash', 'fever'], 0.2,
    'Exantema leve y febrícula; la mayoría de los casos son leves.'),
  ebola: P('contact', 0, ['fever', 'fatigue', 'diarrhea'], 0.7,
    'Debilidad extrema, fiebre y pérdida de fluidos. Contagio por contacto con fluidos (cuidadores, familia).'),
  mpox: P('contact', 0, ['rash', 'fever'], 0.3,
    'Lesiones cutáneas y ganglios inflamados. Contagio por contacto piel con piel prolongado.'),
  rabia: P('contact', 0, ['agitation', 'fever'], 0.1,
    'Agitación psicomotriz y movimientos erráticos. (Simplificación: en la realidad la rabia humana casi siempre proviene de mordeduras de animales).'),
  colera: P('water', 0, ['diarrhea', 'fatigue'], 0.55,
    'Diarrea profusa y deshidratación (encorvado, débil). Contagio por beber agua contaminada.'),
  custom_disease: P('respiratory', 0.5, ['cough', 'fever', 'fatigue'], 0.3,
    'Enfermedad experimental con síntomas respiratorios genéricos.')
};

const CATEGORY_FALLBACK = {
  respiratory: 'respiratory',
  vector: 'vector',
  contact: 'contact',
  waterborne: 'water',
  custom: 'respiratory'
};

export function getDiseaseProfile(disease) {
  if (disease && DISEASE_PROFILES[disease.id]) return DISEASE_PROFILES[disease.id];
  const mech = (disease && CATEGORY_FALLBACK[disease.category]) || 'respiratory';
  return P(mech, mech === 'respiratory' ? 0.5 : 0, ['fever', 'fatigue'], 0.3, 'Síntomas generales.');
}
