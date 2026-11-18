/**
 * Fichas biológicas de los agentes infecciosos (complementan diseasesData.js sin modificarlo).
 *
 * Fuentes generales: OMS (fichas descriptivas), CDC, y textos de microbiología médica
 * (Murray, Medical Microbiology; Fields Virology). Los tamaños son órdenes de magnitud típicos.
 *
 * Las representaciones 3D de render3d/pathogenViewer.js son ILUSTRACIONES CONCEPTUALES
 * (no imágenes de microscopía): resaltan la forma y las estructuras relevantes descritas aquí.
 */
export const PATHOGEN_TYPES = {
  virus: { label: 'Virus', icon: '🧬', color: '#f43f5e' },
  bacteria: { label: 'Bacteria', icon: '🦠', color: '#22c55e' },
  parasite: { label: 'Parásito (protozoo)', icon: '🔬', color: '#a855f7' },
  hypothetical: { label: 'Agente hipotético', icon: '🧪', color: '#38bdf8' }
};

export const PATHOGENS = {
  covid19_omicron: {
    model: 'corona', color: 0xe11d48, accent: 0xfbbf24,
    agent: 'SARS-CoV-2 (variante Ómicron)', type: 'virus',
    taxonomy: 'Coronaviridae · Betacoronavirus',
    genome: 'ARN monocatenario de sentido positivo (~30 000 nucleótidos)',
    size: '≈ 60–140 nm de diámetro',
    structure: [
      'Envoltura lipídica tomada de la célula infectada.',
      'Proteína espiga (S) en forma de maza: se une al receptor ACE2 de las células respiratorias.',
      'Ómicron acumula muchas mutaciones en la espiga, lo que favorece el escape inmunitario y su transmisibilidad.'
    ],
    organs: 'Vías respiratorias superiores (nariz, garganta); con menor frecuencia, pulmones.',
    transmissionVisual: 'aerosol'
  },
  covid19_ancestral: {
    model: 'corona', color: 0xdc2626, accent: 0xf97316,
    agent: 'SARS-CoV-2 (linaje original 2019)', type: 'virus',
    taxonomy: 'Coronaviridae · Betacoronavirus',
    genome: 'ARN monocatenario de sentido positivo (~30 000 nucleótidos)',
    size: '≈ 60–140 nm de diámetro',
    structure: [
      'Envoltura lipídica con proteínas S (espiga), M (membrana) y E (envoltura).',
      'La espiga S reconoce el receptor ACE2 presente en células del tracto respiratorio.',
      'La nucleocápside (proteína N + ARN) se encuentra en el interior.'
    ],
    organs: 'Sistema respiratorio (puede causar neumonía); afectación sistémica en casos graves.',
    transmissionVisual: 'aerosol'
  },
  sarampion: {
    model: 'paramyxo', color: 0xf97316, accent: 0xfde047,
    agent: 'Virus del sarampión', type: 'virus',
    taxonomy: 'Paramyxoviridae · Morbillivirus',
    genome: 'ARN monocatenario de sentido negativo (~16 000 nucleótidos)',
    size: '≈ 100–300 nm, forma pleomórfica (variable)',
    structure: [
      'Envoltura con dos glicoproteínas: H (hemaglutinina, adhesión) y F (fusión).',
      'Forma irregular: las partículas no son esferas perfectas.',
      'Muy estable en microaerosoles: permanece suspendido en el aire hasta ~2 horas.'
    ],
    organs: 'Vías respiratorias, ganglios linfáticos y piel (exantema); puede deprimir el sistema inmune.',
    transmissionVisual: 'aerosol'
  },
  influenza: {
    model: 'influenza', color: 0x2563eb, accent: 0x22d3ee,
    agent: 'Virus de la influenza A / B', type: 'virus',
    taxonomy: 'Orthomyxoviridae · Alphainfluenzavirus / Betainfluenzavirus',
    genome: 'ARN monocatenario de sentido negativo, segmentado (8 segmentos)',
    size: '≈ 80–120 nm',
    structure: [
      'Envoltura con dos tipos de espículas: hemaglutinina (HA, adhesión) y neuraminidasa (NA, liberación).',
      'Los subtipos (p. ej., H1N1, H3N2) se nombran según HA y NA.',
      'El genoma segmentado permite el reordenamiento entre cepas.'
    ],
    organs: 'Tracto respiratorio superior e inferior.',
    transmissionVisual: 'droplets'
  },
  varicela: {
    model: 'herpes', color: 0x8b5cf6, accent: 0xf472b6,
    agent: 'Virus varicela-zóster (VZV, herpesvirus humano 3)', type: 'virus',
    taxonomy: 'Herpesviridae · Varicellovirus',
    genome: 'ADN bicatenario (~125 000 pares de bases)',
    size: '≈ 150–200 nm (cápside ≈ 100 nm)',
    structure: [
      'Cápside icosaédrica que protege el ADN.',
      'Tegumento proteico entre la cápside y la envoltura.',
      'Envoltura lipídica con glicoproteínas. Tras la infección queda latente en ganglios nerviosos (puede reactivarse como herpes zóster).'
    ],
    organs: 'Vías respiratorias (entrada), piel (vesículas) y ganglios nerviosos (latencia).',
    transmissionVisual: 'aerosol'
  },
  tuberculosis: {
    model: 'bacillus', color: 0xd97706, accent: 0xfef3c7,
    agent: 'Mycobacterium tuberculosis', type: 'bacteria',
    taxonomy: 'Bacteria · Mycobacteriaceae',
    genome: 'Cromosoma circular de ADN (~4,4 millones de pares de bases)',
    size: 'Bacilo de ≈ 2–4 µm de largo × 0,2–0,5 µm de ancho',
    structure: [
      'Pared celular rica en ácidos micólicos (cerosa): resiste la tinción convencional (bacilo ácido-alcohol resistente).',
      'Crecimiento muy lento (se divide cada ~18–24 h).',
      'Puede agruparse en "cordones" y sobrevivir dentro de macrófagos.'
    ],
    organs: 'Principalmente pulmones; puede diseminarse a ganglios, huesos, riñones y meninges.',
    transmissionVisual: 'aerosol'
  },
  dengue: {
    model: 'flavi', color: 0x0d9488, accent: 0x5eead4,
    agent: 'Virus del dengue (DENV-1 a DENV-4)', type: 'virus',
    taxonomy: 'Flaviviridae · Orthoflavivirus',
    genome: 'ARN monocatenario de sentido positivo (~11 000 nucleótidos)',
    size: '≈ 50 nm',
    structure: [
      'Partícula pequeña con envoltura y simetría icosaédrica.',
      'La superficie está cubierta por la proteína E dispuesta en dímeros planos.',
      'Cuatro serotipos: una segunda infección por otro serotipo aumenta el riesgo de dengue grave.'
    ],
    organs: 'Sangre (viremia), sistema inmune, endotelio vascular; dolor muscular y articular.',
    vector: 'Mosquito Aedes aegypti (y Aedes albopictus); pica de día.',
    transmissionVisual: 'mosquito'
  },
  fiebre_amarilla: {
    model: 'flavi', color: 0xca8a04, accent: 0xfde047,
    agent: 'Virus de la fiebre amarilla', type: 'virus',
    taxonomy: 'Flaviviridae · Orthoflavivirus',
    genome: 'ARN monocatenario de sentido positivo (~11 000 nucleótidos)',
    size: '≈ 40–60 nm',
    structure: [
      'Flavivirus envuelto con proteína E en la superficie.',
      'Tiene tropismo por el hígado: el daño hepático produce ictericia (piel amarilla), de ahí su nombre.',
      'Existe una vacuna de dosis única muy eficaz.'
    ],
    organs: 'Hígado (ictericia), riñones y sistema de coagulación.',
    vector: 'Mosquitos Aedes (ciclo urbano) y Haemagogus/Sabethes (ciclo selvático).',
    transmissionVisual: 'mosquito'
  },
  malaria: {
    model: 'plasmodium', color: 0x9333ea, accent: 0xef4444,
    agent: 'Plasmodium spp. (P. falciparum, P. vivax, …)', type: 'parasite',
    taxonomy: 'Protozoo · Apicomplexa · Plasmodiidae',
    genome: 'Organismo eucariota con núcleo (14 cromosomas en P. falciparum)',
    size: 'Esporozoíto ≈ 10–15 µm; merozoíto ≈ 1–2 µm; eritrocito humano ≈ 7–8 µm',
    structure: [
      'NO es un virus ni una bacteria: es un parásito unicelular con ciclo de vida complejo.',
      'El mosquito inyecta esporozoítos que viajan al hígado; después invaden los glóbulos rojos.',
      'Los ciclos de ruptura de glóbulos rojos producen los paroxismos de fiebre y escalofríos.'
    ],
    organs: 'Hígado (fase inicial) y glóbulos rojos (anemia); en casos graves, cerebro y riñones.',
    vector: 'Mosquito hembra Anopheles; pica principalmente de noche.',
    transmissionVisual: 'mosquito'
  },
  zika: {
    model: 'flavi', color: 0xdb2777, accent: 0xf9a8d4,
    agent: 'Virus del Zika', type: 'virus',
    taxonomy: 'Flaviviridae · Orthoflavivirus',
    genome: 'ARN monocatenario de sentido positivo (~10 800 nucleótidos)',
    size: '≈ 40–50 nm',
    structure: [
      'Flavivirus envuelto, estructuralmente muy parecido al dengue.',
      'Además de por mosquitos, puede transmitirse por vía sexual y de madre a feto.',
      'La infección en el embarazo se asocia con microcefalia congénita.'
    ],
    organs: 'Piel (exantema), ojos (conjuntivitis), sistema nervioso fetal.',
    vector: 'Mosquito Aedes aegypti.',
    transmissionVisual: 'mosquito'
  },
  ebola: {
    model: 'filo', color: 0xb91c1c, accent: 0xfca5a5,
    agent: 'Virus del Ébola (orthoebolavirus zairense)', type: 'virus',
    taxonomy: 'Filoviridae · Orthoebolavirus',
    genome: 'ARN monocatenario de sentido negativo (~19 000 nucleótidos)',
    size: 'Filamento de ≈ 80 nm de diámetro y hasta ~1 000 nm (o más) de largo',
    structure: [
      'Forma filamentosa característica, a menudo curvada en "U", "6" o "cayado".',
      'Envoltura con una única glicoproteína (GP) que media la entrada en la célula.',
      'Se transmite por contacto directo con sangre y fluidos corporales de enfermos o fallecidos.'
    ],
    organs: 'Hígado, sistema inmune, endotelio vascular (hemorragias) y sistema digestivo.',
    transmissionVisual: 'contact'
  },
  mpox: {
    model: 'pox', color: 0xa16207, accent: 0xfacc15,
    agent: 'Virus de la viruela símica (mpox)', type: 'virus',
    taxonomy: 'Poxviridae · Orthopoxvirus',
    genome: 'ADN bicatenario (~197 000 pares de bases)',
    size: 'Forma de ladrillo de ≈ 200 × 250 nm (de los virus animales más grandes)',
    structure: [
      'Partícula con forma de ladrillo redondeado y superficie de túbulos.',
      'Núcleo central con el ADN y cuerpos laterales.',
      'Se replica en el citoplasma de la célula (no en el núcleo).'
    ],
    organs: 'Piel y mucosas (lesiones vesiculopustulosas), ganglios linfáticos.',
    transmissionVisual: 'contact'
  },
  rabia: {
    model: 'rhabdo', color: 0x475569, accent: 0xcbd5e1,
    agent: 'Virus de la rabia', type: 'virus',
    taxonomy: 'Rhabdoviridae · Lyssavirus',
    genome: 'ARN monocatenario de sentido negativo (~12 000 nucleótidos)',
    size: 'Forma de bala de ≈ 75 × 180 nm',
    structure: [
      'Forma de bala característica: un extremo redondeado y el otro plano.',
      'Envoltura con glicoproteína G que se une a receptores de neuronas.',
      'Viaja por los nervios hasta el sistema nervioso central (por eso la incubación es larga y variable).'
    ],
    organs: 'Sistema nervioso central (encefalitis).',
    note: 'En la realidad la transmisión casi siempre es por mordedura de animales (perros, murciélagos); la simulación usa un modelo simplificado de contacto.',
    transmissionVisual: 'contact'
  },
  colera: {
    model: 'vibrio', color: 0x16a34a, accent: 0x86efac,
    agent: 'Vibrio cholerae (serogrupos O1 y O139)', type: 'bacteria',
    taxonomy: 'Bacteria gramnegativa · Vibrionaceae',
    genome: 'Dos cromosomas circulares de ADN (~4 millones de pares de bases)',
    size: 'Bacilo curvo ("coma") de ≈ 1,5–3 µm de largo',
    structure: [
      'Forma de coma con un único flagelo polar que le da gran movilidad.',
      'Coloniza el intestino delgado y produce la toxina colérica.',
      'La toxina provoca la salida masiva de agua y sales: diarrea "agua de arroz" y deshidratación rápida.'
    ],
    organs: 'Intestino delgado; las complicaciones derivan de la deshidratación.',
    transmissionVisual: 'water'
  },
  custom_disease: {
    model: 'generic', color: 0x0284c7, accent: 0x7dd3fc,
    agent: 'Patógeno experimental (hipotético)', type: 'hypothetical',
    taxonomy: 'Modelo didáctico',
    genome: '—',
    size: '—',
    structure: [
      'Agente ficticio para experimentar con los parámetros del modelo.',
      'Su representación es genérica y no corresponde a ningún organismo real.'
    ],
    organs: 'Definido por el usuario (por defecto, respiratorio).',
    transmissionVisual: 'aerosol'
  }
};

export function getPathogen(id) {
  return PATHOGENS[id] || PATHOGENS.custom_disease;
}
