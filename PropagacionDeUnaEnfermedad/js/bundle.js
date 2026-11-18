/**
 * EpiDynamics 6.0 - Bundle Autónomo (requiere js/vendor/three.iife.min.js cargado antes)
 * Matemáticas 4 - Modelado Matemático y Ecuaciones Diferenciales
 * Generado automáticamente: 2026-11-14T07:18:46.626Z
 */
(function() {
  'use strict';

  // === Inicio de js/data/diseasesData.js ===
/**
 * Catálogo de Enfermedades y Parámetros Epidemiológicos
 * Clasificadas por categoría con parámetros clínicos y matemáticos reales
 * Referencias: OMS (WHO), CDC, literatura de biomatemática y modelado epidemiológico.
 */

const DISEASE_CATEGORIES = [
  { id: 'all', name: 'Todas las Categorías', icon: '🌐' },
  { id: 'respiratory', name: 'Respiratorias / Gotículas', icon: '🫁' },
  { id: 'vector', name: 'Transmitidas por Vectores', icon: '🦟' },
  { id: 'contact', name: 'Contacto Directo / Fluidos', icon: '🩸' },
  { id: 'waterborne', name: 'Hídricas / Gastrointestinales', icon: '💧' },
  { id: 'custom', name: 'Personalizado (Sandbox)', icon: '🧪' }
];

const DISEASES = {
  // --- RESPIRATORIAS ---
  covid19_omicron: {
    id: 'covid19_omicron',
    category: 'respiratory',
    name: 'COVID-19 (Variante Ómicron)',
    pathogen: 'Virus ARN (SARS-CoV-2 - Linaje B.1.1.529)',
    transmission: 'Aerosoles y gotículas respiratorias a corta y media distancia',
    modelType: 'SEIRD',
    r0: 9.5,                 // Número reproductivo básico estimado
    incubationDays: 3.0,     // Periodo latente / incubación (1/sigma)
    infectiousDays: 6.0,     // Duración de la fase infecciosa (1/gamma)
    fatalityRate: 0.0018,    // 0.18% letalidad media (con vacunación/inmunidad previa)
    hospitalizationRate: 0.03, // 3% requiere atención hospitalaria
    description: 'Variante con extraordinaria transmisibilidad y menor periodo de incubación. Provoca rápidos picos epidémicos que pueden colapsar servicios de urgencias por volumen absoluto.',
    clinicalNotes: 'Síntomas de vías respiratorias superiores: odinofagia, rinorrea, tos, fatiga.',
    preventions: ['Mascarillas FFP2/KN95', 'Ventilación de espacios', 'Vacunación de refuerzo', 'Aislamiento de casos']
  },
  covid19_ancestral: {
    id: 'covid19_ancestral',
    category: 'respiratory',
    name: 'COVID-19 (Cepa Ancestral Wuhan)',
    pathogen: 'Virus ARN (SARS-CoV-2 original 2019-2020)',
    transmission: 'Gotículas respiratorias, aerosoles y fómites',
    modelType: 'SEIRD',
    r0: 2.8,
    incubationDays: 5.2,
    infectiousDays: 10.0,
    fatalityRate: 0.020,     // ~2.0% letalidad inicial sin tratamientos consolidados
    hospitalizationRate: 0.12, // ~12% requirió hospitalización / oxígeno
    description: 'Cepa originaria de la pandemia de 2020. Su periodo de incubación prolongado y transmisión presintomática facilitó una dispersión global antes de la detección temprana.',
    clinicalNotes: 'Neumonía bilateral, fiebre alta, disnea, pérdida de olfato/gusto (anosmia).',
    preventions: ['Confinamiento domiciliario', 'Distanciamiento de 2m', 'Higiene de manos', 'Mascarillas quirúrgicas']
  },
  sarampion: {
    id: 'sarampion',
    category: 'respiratory',
    name: 'Sarampión (Morbillivirus)',
    pathogen: 'Paramixovirus del género Morbillivirus',
    transmission: 'Vía aérea estricta por microaerosoles que perduran hasta 2 horas en suspensión',
    modelType: 'SEIR',
    r0: 15.0,                // De los más contagiosos registrados (12-18)
    incubationDays: 10.0,
    infectiousDays: 8.0,
    fatalityRate: 0.002,     // 0.2% en países desarrollados, hasta 5-10% en desnutrición
    hospitalizationRate: 0.10,
    description: 'Uno de los patógenos más contagiosos del planeta. Exige un umbral de inmunidad de rebaño superior al 93-95% para evitar brotes comunitarios.',
    clinicalNotes: 'Fiebre alta, exantema maculopapular descendente, manchas de Koplik en mucosa oral, conjuntivitis.',
    preventions: ['Vacuna triple vírica (SRP - 2 dosis)', 'Aislamiento respiratorio estricto']
  },
  influenza: {
    id: 'influenza',
    category: 'respiratory',
    name: 'Gripe Estacional (Influenza A/B)',
    pathogen: 'Virus de la Influenza A o B',
    transmission: 'Gotículas al toser o estornudar, contacto manual con secreciones',
    modelType: 'SIR',
    r0: 1.4,
    incubationDays: 2.0,
    infectiousDays: 5.0,
    fatalityRate: 0.0008,    // ~0.08%
    hospitalizationRate: 0.015,
    description: 'Infección vírica estacional recurrente. Experimenta deriva antigénica constante (mutaciones anuales en hemaglutinina y neuraminidasa).',
    clinicalNotes: 'Inicio repentino de fiebre, cefalea intensa, mialgias generalizadas, tos seca.',
    preventions: ['Vacunación anual adaptada a cepas circulantes', 'Lavado frecuente de manos', 'Etiqueta respiratoria']
  },
  varicela: {
    id: 'varicela',
    category: 'respiratory',
    name: 'Varicela (Varicela-Zóster)',
    pathogen: 'Herpesvirus humano 3 (VZV)',
    transmission: 'Aerosoles respiratorios y contacto directo con líquido de vesículas cutáneas',
    modelType: 'SEIR',
    r0: 11.0,
    incubationDays: 14.0,
    infectiousDays: 7.0,
    fatalityRate: 0.0002,
    hospitalizationRate: 0.02,
    description: 'Muy contagiosa durante la infancia. El virus permanece latente de por vida en ganglios sensitivos dorsales, pudiendo reactivarse como Herpes Zóster.',
    clinicalNotes: 'Exantema pruriginoso con lesiones pleomórficas en diferentes fases (máculas, pápulas, vesículas y costras).',
    preventions: ['Vacunación infantil sistemática', 'Evitar contacto con lesiones exudativas']
  },
  tuberculosis: {
    id: 'tuberculosis',
    category: 'respiratory',
    name: 'Tuberculosis Pulmonar',
    pathogen: 'Bacteria Mycobacterium tuberculosis (Bacilo de Koch)',
    transmission: 'Aerosoles microscópicos emitidos por personas con TB activa al hablar o toser',
    modelType: 'SEIRD',
    r0: 3.2,
    incubationDays: 30.0,    // Valor representativo para el modelo dinámico continuo
    infectiousDays: 40.0,
    fatalityRate: 0.08,      // Con acceso variable a tratamiento prolongado
    hospitalizationRate: 0.20,
    description: 'Infección bacteriana crónica. Gran parte de la población infectada desarrolla una fase de tuberculosis latente asintomática sin capacidad de transmisión.',
    clinicalNotes: 'Tos productiva persistente con hemoptisis (flema con sangre), fiebre nocturna, diaforesis y pérdida de peso.',
    preventions: ['Tratamiento antibiótico supervisado (DOTS)', 'Vacuna BCG en recién nacidos', 'Estudio de contactos']
  },

  // --- TRANSMITIDAS POR VECTORES ---
  dengue: {
    id: 'dengue',
    category: 'vector',
    name: 'Dengue Clásico / Grave',
    pathogen: 'Flavivirus (Serotipos DENV-1, DENV-2, DENV-3, DENV-4)',
    transmission: 'Picadura de mosquitos hembra infectados del género Aedes (A. aegypti y A. albopictus)',
    modelType: 'SEIR',
    r0: 2.5,
    incubationDays: 5.5,
    infectiousDays: 7.0,
    fatalityRate: 0.005,     // Puede subir al 2-5% en formas graves con fuga plasmática
    hospitalizationRate: 0.08,
    description: 'Arbovirosis urbana de rápido crecimiento global. La infección por un segundo serotipo distinto aumenta exponencialmente el riesgo de dengue hemorrágico.',
    clinicalNotes: 'Fiebre alta repentina quebrantahuesos, dolor retroocular intenso, artralgias, leucopenia.',
    preventions: ['Eliminación de criaderos de agua estancada', 'Uso de repelentes y mosquiteros', 'Control larvario']
  },
  fiebre_amarilla: {
    id: 'fiebre_amarilla',
    category: 'vector',
    name: 'Fiebre Amarilla',
    pathogen: 'Flavivirus de la fiebre amarilla',
    transmission: 'Picadura de mosquitos Aedes (ciclo urbano) y Haemagogus (ciclo selvático)',
    modelType: 'SEIRD',
    r0: 2.1,
    incubationDays: 4.5,
    infectiousDays: 6.0,
    fatalityRate: 0.15,      // ~15% de casos clínicos evolucionan a fase tóxica letal
    hospitalizationRate: 0.30,
    description: 'Enfermedad hemorrágica viral endémica en regiones tropicales de África y América Latina con fases de ictericia e insuficiencia hepatorrenal aguda.',
    clinicalNotes: 'Ictericia intensa (piel amarilla), hemorragias gingivales/gástricas (vómito negro), oliguria.',
    preventions: ['Vacuna 17D altamente eficaz (1 sola dosis para toda la vida)', 'Protección física antimosquitos']
  },
  malaria: {
    id: 'malaria',
    category: 'vector',
    name: 'Malaria / Paludismo',
    pathogen: 'Parásito protozoario Plasmodium (P. falciparum, P. vivax)',
    transmission: 'Picadura de mosquitos hembra Anopheles infectados',
    modelType: 'SIS',        // Modelo recurrente: tras recuperarse se vuelve susceptible
    r0: 4.2,
    incubationDays: 12.0,
    infectiousDays: 20.0,
    fatalityRate: 0.012,
    hospitalizationRate: 0.15,
    description: 'Enfermedad parasitaria con ciclos eritrocíticos periódicos. La inmunidad adquirida es parcial y de corta duración, permitiendo reinfecciones periódicas.',
    clinicalNotes: 'Paroxismos periódicos de escalofríos intensos seguidos de picos febriles y sudoración profusa; anemia severa.',
    preventions: ['Mosquiteros tratados con insecticida de larga duración', 'Tratamientos combinados con artemisinina', 'Quimioprofilaxis']
  },
  zika: {
    id: 'zika',
    category: 'vector',
    name: 'Virus del Zika',
    pathogen: 'Flavivirus del género Flavivirus',
    transmission: 'Picadura de Aedes aegypti, transmisión sexual y vertical maternofetal',
    modelType: 'SEIR',
    r0: 2.2,
    incubationDays: 6.0,
    infectiousDays: 8.0,
    fatalityRate: 0.0001,
    hospitalizationRate: 0.01,
    description: 'Generalmente leve o asintomático en adultos, pero con severas consecuencias teratógenas en el feto si se adquiere durante el embarazo (síndrome congénito por zika).',
    clinicalNotes: 'Exantema pruriginoso leve, febrícula, conjuntivitis no purulenta, mialgias.',
    preventions: ['Evitar picaduras de mosquito', 'Uso de preservativos en áreas con brote activo']
  },

  // --- CONTACTO DIRECTO Y FLUIDOS ---
  ebola: {
    id: 'ebola',
    category: 'contact',
    name: 'Ébola (Fiebre Hemorrágica)',
    pathogen: 'Filovirus (Ebolavirus especie Zaire)',
    transmission: 'Contacto directo con sangre, heces, vómito o fluidos de pacientes enfermos o cadáveres',
    modelType: 'SIRD',
    r0: 1.8,
    incubationDays: 8.5,
    infectiousDays: 10.0,
    fatalityRate: 0.50,      // ~50% de letalidad promedio (rango 40% a 90%)
    hospitalizationRate: 0.90,
    description: 'Infección viral aguda extremadamente grave. No se transmite por el aire en condiciones normales; requiere contacto íntimo con fluidos corporales con alta carga vírica.',
    clinicalNotes: 'Fiebre súbita, debilidad extrema, diarrea acuosa profusa, sangrado multiorgánico y choque hipovolémico.',
    preventions: ['Equipos de Protección Individual (EPI) herméticos', 'Protocolos estrictos de entierro seguro', 'Vacuna rVSV-ZEBOV']
  },
  mpox: {
    id: 'mpox',
    category: 'contact',
    name: 'Mpox (Viruela Símica)',
    pathogen: 'Orthopoxvirus (Virus de la viruela símica)',
    transmission: 'Contacto físico estrecho prolongado piel con piel, secreciones de lesiones o fómites contaminados',
    modelType: 'SEIRD',
    r0: 1.6,
    incubationDays: 9.0,
    infectiousDays: 14.0,
    fatalityRate: 0.01,      // Clado II: ~1%; Clado I: hasta 10%
    hospitalizationRate: 0.06,
    description: 'Zoonosis viral que provocó emergencia de salud pública de importancia internacional por transmisión humana mantenida mediante redes de contacto cercano.',
    clinicalNotes: 'Linfadenopatía dolorosa característica (ganglios inflamados), fiebre y lesiones cutáneas vesiculopustulosas profundas.',
    preventions: ['Vacunación dirigida de pre y posexposición (MVA-BN)', 'Aislamiento de casos y abstención de contacto']
  },
  rabia: {
    id: 'rabia',
    category: 'contact',
    name: 'Rabia Humana',
    pathogen: 'Rhabdovirus del género Lyssavirus',
    transmission: 'Inoculación de saliva infectada por mordeduras o arañazos de mamíferos (perros, murciélagos)',
    modelType: 'SIRD',
    r0: 1.1,
    incubationDays: 25.0,    // Incubación promedio 1 a 3 meses (simulable en 25 días para escala)
    infectiousDays: 7.0,
    fatalityRate: 0.999,     // Letalidad cercana al 100% una vez se presentan síntomas neurológicos
    hospitalizationRate: 1.0,
    description: 'Encefalitis vírica aguda prevenible al 100% con profilaxis posexposición oportuna, pero uniformemente letal cuando el virus alcanza el sistema nervioso central.',
    clinicalNotes: 'Hidrofobia, aerofobia, agitación psicomotriz, parálisis flácida progresiva y paro cardiorrespiratorio.',
    preventions: ['Vacunación antirrábica masiva de mascotas', 'Lavado inmediato con agua y jabón de heridas', 'Inmunoglobulina antirrábica + vacuna']
  },

  // --- HÍDRICAS Y ENTÉRICAS ---
  colera: {
    id: 'colera',
    category: 'waterborne',
    name: 'Cólera (Vibrio cholerae)',
    pathogen: 'Bacteria Vibrio cholerae (serogrupos O1 y O139)',
    transmission: 'Ingestión de agua o comida contaminada con materia fecal humana (vía fecal-oral)',
    modelType: 'SIR',
    r0: 2.7,
    incubationDays: 1.8,
    infectiousDays: 5.0,
    fatalityRate: 0.025,     // 2.5% con terapia de rehidratación oral; puede superar el 40% sin ella
    hospitalizationRate: 0.25,
    description: 'Enfermedad bacteriana gastrointestinal capaz de deshidratar letalmente a un adulto en pocas horas. Produce brotes explosivos en colapsos de saneamiento básico.',
    clinicalNotes: 'Diarrea líquida profusa característica en "agua de arroz", vómitos, calambres musculares y acidosis metabólica rápida.',
    preventions: ['Potabilización y cloración del agua', 'Saneamiento y alcantarillado', 'Vacunas orales contra el cólera (cólera OCV)']
  },

  // --- MODO PERSONALIZADO / EXPERIMENTAL ---
  custom_disease: {
    id: 'custom_disease',
    category: 'custom',
    name: 'Enfermedad Personalizada (Laboratorio)',
    pathogen: 'Patógeno Teórico / Diseñado por el Usuario',
    transmission: 'Ajustable según parámetros del experimento',
    modelType: 'SEIRD',
    r0: 3.0,
    incubationDays: 4.0,
    infectiousDays: 7.0,
    fatalityRate: 0.02,
    hospitalizationRate: 0.10,
    description: 'Configuración libre de todos los parámetros matemáticos del sistema de ecuaciones diferenciales para explorar escenarios hipotéticos, epidemias emergentes o proyectos de Mate 4.',
    clinicalNotes: 'Modifica los controles de la barra lateral para observar cómo cambian las curvas y la estabilidad del sistema.',
    preventions: ['Variables de cuarentena, vacunación y capacidad médica ajustables en tiempo real']
  }
};

  // === Fin de js/data/diseasesData.js ===

  // === Inicio de js/data/pathogens.js ===
/**
 * Fichas biológicas de los agentes infecciosos (complementan diseasesData.js sin modificarlo).
 *
 * Fuentes generales: OMS (fichas descriptivas), CDC, y textos de microbiología médica
 * (Murray, Medical Microbiology; Fields Virology). Los tamaños son órdenes de magnitud típicos.
 *
 * Las representaciones 3D de render3d/pathogenViewer.js son ILUSTRACIONES CONCEPTUALES
 * (no imágenes de microscopía): resaltan la forma y las estructuras relevantes descritas aquí.
 */
const PATHOGEN_TYPES = {
  virus: { label: 'Virus', icon: '🧬', color: '#f43f5e' },
  bacteria: { label: 'Bacteria', icon: '🦠', color: '#22c55e' },
  parasite: { label: 'Parásito (protozoo)', icon: '🔬', color: '#a855f7' },
  hypothetical: { label: 'Agente hipotético', icon: '🧪', color: '#38bdf8' }
};

const PATHOGENS = {
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

function getPathogen(id) {
  return PATHOGENS[id] || PATHOGENS.custom_disease;
}

  // === Fin de js/data/pathogens.js ===

  // === Inicio de js/models/epidemicModels.js ===
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

class EpidemicModel {
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

  // === Fin de js/models/epidemicModels.js ===

  // === Inicio de js/simulation/diseaseProfiles.js ===
/**
 * Perfiles de mecanismo de transmisión y de síntomas visibles por enfermedad.
 *
 * El catálogo clínico (diseasesData.js) NO se modifica: este archivo sólo añade
 * la información que necesita la simulación individual (agentes) para:
 *   1. Elegir el mecanismo físico de contagio correcto (no todas se contagian igual).
 *   2. Representar síntomas visibles coherentes con la enfermedad.
 */

const MECHANISMS = {
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

const DISEASE_PROFILES = {
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

function getDiseaseProfile(disease) {
  if (disease && DISEASE_PROFILES[disease.id]) return DISEASE_PROFILES[disease.id];
  const mech = (disease && CATEGORY_FALLBACK[disease.category]) || 'respiratory';
  return P(mech, mech === 'respiratory' ? 0.5 : 0, ['fever', 'fatigue'], 0.3, 'Síntomas generales.');
}

  // === Fin de js/simulation/diseaseProfiles.js ===

  // === Inicio de js/simulation/townMap.js ===
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

const WORLD = { x0: -64, x1: 64, z0: -44, z1: 44 };
const STREET_N = 18;
const STREET_S = -18;
const V_STREETS = [-36, -12, 12, 36];

const HOUSE_XS = [];
for (let x = -60; x <= 60; x += 8) HOUSE_XS.push(x);

function rect(x0, x1, z0, z1) {
  return { x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 };
}

class TownMap {
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

  // === Fin de js/simulation/townMap.js ===

  // === Inicio de js/simulation/epiEngine.js ===
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


const STATES = { S: 0, E: 1, I: 2, R: 3, D: 4, V: 5 };
const STATE_NAMES = ['Susceptible', 'Expuesto', 'Infectado', 'Recuperado', 'Fallecido', 'Vacunado'];
const STATE_SHORT = ['S', 'E', 'I', 'R', 'D', 'V'];
const STATE_COLORS = ['#38bdf8', '#fbbf24', '#ef4444', '#10b981', '#94a3b8', '#a855f7'];

const TICK = 1 / 96;          // paso epidemiológico: 15 minutos
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

class EpiEngine {
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

  // === Fin de js/simulation/epiEngine.js ===

  // === Inicio de js/components/chartRenderer.js ===
/**
 * Motor Gráfico Epidemiológico de Alto Rendimiento (HTML5 Canvas Nativo)
 * Representa curvas continuas de sistemas de Ecuaciones Diferenciales (RK4)
 * - Soporte para Retina / High-DPI
 * - Tooltip interactivo al mover el ratón o deslizar el dedo
 * - Cursor temporal sincronizado con la simulación
 * - Línea de Capacidad Hospitalaria y Marcador de Pico Epidémico
 * - Gráfico de Rt (Número Reproductivo Efectivo)
 */

class ChartRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.data = null;
    this.currentDay = 0;
    this.hoverIndex = null;
    this.activeMode = 'compartments'; // 'compartments' o 'rt'

    this.padding = { top: 35, right: 30, bottom: 45, left: 65 };

    this.colors = {
      S: '#38bdf8',  // Susceptibles
      E: '#fbbf24',  // Expuestos
      I: '#ef4444',  // Infectados
      R: '#10b981',  // Recuperados
      D: '#94a3b8',  // Fallecidos
      V: '#a855f7',  // Vacunados
      Rt: '#f43f5e', // Rt
      hospital: '#f97316' // Capacidad
    };

    this.initCanvasSize();
    this.bindEvents();
  }

  initCanvasSize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : (this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 700);
    const height = rect.height > 0 ? rect.height : 340;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);
    this.displayW = width;
    this.displayH = height;

    if (this.data) this.render();
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
    });

    const updateHover = (clientX, clientY) => {
      if (!this.data || !this.data.times || this.data.times.length === 0) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      const chartW = this.displayW - this.padding.left - this.padding.right;
      if (mouseX >= this.padding.left && mouseX <= this.displayW - this.padding.right) {
        const ratio = (mouseX - this.padding.left) / chartW;
        const index = Math.round(ratio * (this.data.times.length - 1));
        this.hoverIndex = Math.max(0, Math.min(this.data.times.length - 1, index));
      } else {
        this.hoverIndex = null;
      }
      this.render();
    };

    this.canvas.addEventListener('mousemove', (e) => updateHover(e.clientX, e.clientY));
    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIndex = null;
      this.render();
    });

    // Soporte táctil para celulares
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        updateHover(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.hoverIndex = null;
      this.render();
    });
  }

  setMode(mode) {
    this.activeMode = mode;
    this.render();
  }

  updateData(solutionData) {
    this.data = solutionData;
    this.render();
  }

  setCurrentDay(day) {
    this.currentDay = day;
    this.render();
  }

  render() {
    if (!this.data || !this.data.times) return;

    const ctx = this.ctx;
    const w = this.displayW;
    const h = this.displayH;
    const p = this.padding;

    // Limpiar canvas
    ctx.clearRect(0, 0, w, h);

    const chartW = w - p.left - p.right;
    const chartH = h - p.top - p.bottom;

    if (chartW <= 0 || chartH <= 0) return;

    if (this.activeMode === 'rt') {
      this.renderRtChart(ctx, chartW, chartH, p);
    } else {
      this.renderCompartmentChart(ctx, chartW, chartH, p);
    }
  }

  renderCompartmentChart(ctx, chartW, chartH, p) {
    const { times, S, E, I, R, D, summary } = this.data;
    const n = times.length;
    if (n === 0) return;

    const maxVal = Math.max(
      ...S,
      ...E,
      ...I,
      ...R,
      summary.hospitalBeds || 0
    ) * 1.05;

    const getX = (i) => p.left + (i / (n - 1)) * chartW;
    const getY = (val) => p.top + chartH - (val / maxVal) * chartH;

    // Cuadrícula y ejes
    this.drawGrid(ctx, chartW, chartH, p, maxVal, times[n - 1]);

    // Capacidad Hospitalaria (línea punteada)
    if (summary.hospitalBeds) {
      const yHosp = getY(summary.hospitalBeds);
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = this.colors.hospital;
      ctx.lineWidth = 1.8;
      ctx.moveTo(p.left, yHosp);
      ctx.lineTo(p.left + chartW, yHosp);
      ctx.stroke();

      // Texto de camas UCI
      ctx.fillStyle = this.colors.hospital;
      ctx.font = '11px sans-serif';
      ctx.fillText(`Capacidad Hospitalaria: ${summary.hospitalBeds.toLocaleString()}`, p.left + 8, yHosp - 5);
      ctx.restore();
    }

    // Dibujar curvas continuas
    this.drawCurve(ctx, times, S, this.colors.S, 2.5, getX, getY, 'Susceptibles (S)');
    if (E && E.length > 0 && Math.max(...E) > 0) {
      this.drawCurve(ctx, times, E, this.colors.E, 2.5, getX, getY, 'Expuestos (E)');
    }
    this.drawCurve(ctx, times, R, this.colors.R, 2.5, getX, getY, 'Recuperados (R)');
    this.drawCurve(ctx, times, D, this.colors.D, 2.0, getX, getY, 'Fallecidos (D)');
    
    // Curva de infectados con área sombreada
    this.drawAreaUnderCurve(ctx, times, I, 'rgba(239, 68, 68, 0.2)', getX, getY, chartH, p);
    this.drawCurve(ctx, times, I, this.colors.I, 3.2, getX, getY, 'Infectados (I)');

    // Marcador del Pico de Infectados
    if (summary.peakDay !== undefined && summary.peakInfected !== undefined) {
      const peakIndex = times.indexOf(summary.peakDay);
      if (peakIndex >= 0) {
        const px = getX(peakIndex);
        const py = getY(summary.peakInfected);

        ctx.save();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Etiqueta del pico
        ctx.font = 'bold 11px sans-serif';
        const labelText = `Pico: ${summary.peakInfected.toLocaleString()} (Día ${summary.peakDay})`;
        ctx.fillStyle = '#ffffff';
        const textW = ctx.measureText(labelText).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(px - textW / 2 - 6, py - 28, textW + 12, 20);
        ctx.strokeStyle = '#ef4444';
        ctx.strokeRect(px - textW / 2 - 6, py - 28, textW + 12, 20);
        ctx.fillStyle = '#ef4444';
        ctx.fillText(labelText, px - textW / 2, py - 14);
        ctx.restore();
      }
    }

    // Cursor del Día Actual en simulación
    if (this.currentDay > 0) {
      const currentDayIndex = Math.min(times.length - 1, Math.round(this.currentDay));
      const cx = getX(currentDayIndex);
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(cx, p.top);
      ctx.lineTo(cx, p.top + chartH);
      ctx.stroke();
      ctx.restore();
    }

    // Tooltip al pasar el ratón / dedo
    if (this.hoverIndex !== null) {
      this.drawTooltip(ctx, this.hoverIndex, getX, getY, p, chartW);
    }
  }

  renderRtChart(ctx, chartW, chartH, p) {
    const { times, Rt, summary } = this.data;
    const n = times.length;
    if (n === 0) return;

    const maxVal = Math.max(3.0, (summary.r0 ? parseFloat(summary.r0) : 3.0) * 1.2);
    const getX = (i) => p.left + (i / (n - 1)) * chartW;
    const getY = (val) => p.top + chartH - (val / maxVal) * chartH;

    this.drawGrid(ctx, chartW, chartH, p, maxVal, times[n - 1], 'Rt');

    // Línea de umbral crítico Rt = 1.0
    const yCritical = getY(1.0);
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(p.left, yCritical);
    ctx.lineTo(p.left + chartW, yCritical);
    ctx.stroke();

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Umbral Crítico (Rt = 1.0)', p.left + 8, yCritical - 6);
    ctx.restore();

    // Curva de Rt
    this.drawCurve(ctx, times, Rt, this.colors.Rt, 3.0, getX, getY, 'Rt');

    if (this.hoverIndex !== null) {
      const idx = this.hoverIndex;
      const day = times[idx];
      const rtVal = Rt[idx] ? Rt[idx].toFixed(2) : '0';
      const hx = getX(idx);
      const hy = getY(Rt[idx]);

      ctx.save();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Caja de tooltip
      ctx.font = '12px sans-serif';
      const text = `Día ${day}: Rt = ${rtVal} (${parseFloat(rtVal) > 1 ? 'Epidemia en expansión' : 'Epidemia contenida'})`;
      const tw = ctx.measureText(text).width;
      let tx = hx - tw / 2;
      if (tx < p.left) tx = p.left + 5;
      if (tx + tw > this.displayW - p.right) tx = this.displayW - p.right - tw - 5;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(tx - 6, hy - 32, tw + 12, 24);
      ctx.strokeStyle = '#f43f5e';
      ctx.strokeRect(tx - 6, hy - 32, tw + 12, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, tx, hy - 16);
      ctx.restore();
    }
  }

  drawGrid(ctx, chartW, chartH, p, maxY, maxDays, yFormat = 'count') {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    // Líneas horizontales (Eje Y)
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = p.top + (chartH / ySteps) * i;
      ctx.beginPath();
      ctx.moveTo(p.left, y);
      ctx.lineTo(p.left + chartW, y);
      ctx.stroke();

      const val = maxY * (1 - i / ySteps);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      const label = yFormat === 'Rt' ? val.toFixed(1) : this.formatCompactNumber(val);
      ctx.fillText(label, p.left - 8, y + 4);
    }

    // Líneas verticales (Eje X - Días)
    const xSteps = 6;
    for (let j = 0; j <= xSteps; j++) {
      const x = p.left + (chartW / xSteps) * j;
      ctx.beginPath();
      ctx.moveTo(x, p.top);
      ctx.lineTo(x, p.top + chartH);
      ctx.stroke();

      const dayVal = Math.round((maxDays / xSteps) * j);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Día ${dayVal}`, x, p.top + chartH + 18);
    }

    // Etiquetas de ejes
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.fillText('Tiempo transcurrido (Días)', p.left + chartW / 2, p.top + chartH + 36);

    ctx.save();
    ctx.translate(16, p.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yFormat === 'Rt' ? 'Número Reproductivo Efectivo (Rt)' : 'Número de Individuos', 0, 0);
    ctx.restore();

    ctx.restore();
  }

  drawCurve(ctx, times, series, color, lineWidth, getX, getY) {
    if (!series || series.length === 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (let i = 0; i < series.length; i++) {
      const x = getX(i);
      const y = getY(series[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawAreaUnderCurve(ctx, times, series, fillColor, getX, getY, chartH, p) {
    if (!series || series.length === 0) return;
    ctx.save();
    ctx.beginPath();
    const bottomY = p.top + chartH;

    for (let i = 0; i < series.length; i++) {
      const x = getX(i);
      const y = getY(series[i]);
      if (i === 0) ctx.moveTo(x, bottomY);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(getX(series.length - 1), bottomY);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.restore();
  }

  drawTooltip(ctx, index, getX, getY, p, chartW) {
    const { times, S, E, I, R, D, Rt } = this.data;
    const day = times[index];
    const sVal = Math.round(S[index]);
    const eVal = E ? Math.round(E[index]) : 0;
    const iVal = Math.round(I[index]);
    const rVal = Math.round(R[index]);
    const dVal = Math.round(D[index]);
    const rtVal = Rt && Rt[index] ? Rt[index].toFixed(2) : '-';

    const tx = getX(index);

    // Línea vertical sobre el punto inspeccionado
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.moveTo(tx, p.top);
    ctx.lineTo(tx, p.top + (this.displayH - p.top - p.bottom));
    ctx.stroke();

    // Tarjeta emergente
    const lines = [
      { text: `📅 Día ${day}`, color: '#ffffff', bold: true },
      { text: `🔵 Susceptibles: ${sVal.toLocaleString()}`, color: this.colors.S },
      ...(eVal > 0 ? [{ text: `🟡 Expuestos: ${eVal.toLocaleString()}`, color: this.colors.E }] : []),
      { text: `🔴 Infectados: ${iVal.toLocaleString()}`, color: this.colors.I },
      { text: `🟢 Recuperados: ${rVal.toLocaleString()}`, color: this.colors.R },
      { text: `⚫ Fallecidos: ${dVal.toLocaleString()}`, color: this.colors.D },
      { text: `📈 Rt: ${rtVal}`, color: '#f43f5e' }
    ];

    const cardW = 175;
    const cardH = lines.length * 18 + 12;
    let cardX = tx + 14;
    if (cardX + cardW > this.displayW - p.right) {
      cardX = tx - cardW - 14;
    }
    const cardY = p.top + 10;

    // Fondo tarjeta con efecto glassmorphism
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    // Texto
    lines.forEach((item, lIdx) => {
      ctx.font = item.bold ? 'bold 12px sans-serif' : '11px sans-serif';
      ctx.fillStyle = item.color;
      ctx.textAlign = 'left';
      ctx.fillText(item.text, cardX + 10, cardY + 18 + lIdx * 18);
    });

    ctx.restore();
  }

  formatCompactNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.round(num).toString();
  }
}

  // === Fin de js/components/chartRenderer.js ===

  // === Inicio de js/components/mathRenderer.js ===
/**
 * Módulo de Renderizado Matemático y Teoría de Modelado EDO
 * Adaptado para la materia de Matemáticas 4 (Ecuaciones Diferenciales y Modelado Matemático)
 * - Renderizado dual: KaTeX (si hay conexión) + HTML/SVG Math Engine nativo (resiliente offline)
 * - Explicación detallada de términos, deducciones analíticas y método numérico RK4
 */

class MathRenderer {
  /**
   * Intenta renderizar LaTeX con KaTeX si está disponible, o usa fallback HTML enriquecido
   */
  static renderFormula(containerEl, latexStr, fallbackHtml = '') {
    if (!containerEl) return;

    if (window.katex) {
      try {
        window.katex.render(latexStr, containerEl, {
          throwOnError: false,
          displayMode: true
        });
        return;
      } catch (err) {
        console.warn('Error KaTeX, utilizando fallback:', err);
      }
    }

    // Fallback elegante HTML con estilo matemático
    containerEl.innerHTML = fallbackHtml || `<pre class="math-fallback">${latexStr}</pre>`;
  }

  /**
   * Actualiza el panel educativo con las ecuaciones del modelo actual
   */
  static updateTheorySection(container, modelType, diseaseInfo, currentParams) {
    if (!container) return;

    const { r0, incubationDays, infectiousDays, fatalityRate, population } = currentParams;
    const sigma = incubationDays > 0 ? (1 / incubationDays).toFixed(3) : '1.0';
    const gamma = infectiousDays > 0 ? (1 / infectiousDays).toFixed(3) : '0.14';
    const mu = (fatalityRate * (1 / infectiousDays)).toFixed(4);
    const beta = (r0 * (parseFloat(gamma) + parseFloat(mu))).toFixed(3);
    const hit = r0 > 1 ? ((1 - 1 / r0) * 100).toFixed(1) : '0.0';

    let odeHtml = '';
    let odeLatex = '';

    if (modelType === 'SIR') {
      odeLatex = `\\begin{cases}
\\frac{dS}{dt} = -\\frac{\\beta S I}{N} \\\\[10pt]
\\frac{dI}{dt} = \\frac{\\beta S I}{N} - \\gamma I \\\\[10pt]
\\frac{dR}{dt} = \\gamma I
\\end{cases}`;

      odeHtml = `
        <div class="math-eq-row"><span class="math-var">dS/dt</span> = - (<span class="math-coeff">β</span> · S · I) / N</div>
        <div class="math-eq-row"><span class="math-var">dI/dt</span> = (<span class="math-coeff">β</span> · S · I) / N - <span class="math-coeff">γ</span> · I</div>
        <div class="math-eq-row"><span class="math-var">dR/dt</span> = <span class="math-coeff">γ</span> · I</div>
      `;
    } else if (modelType === 'SIS') {
      odeLatex = `\\begin{cases}
\\frac{dS}{dt} = -\\frac{\\beta S I}{N} + \\gamma I \\\\[10pt]
\\frac{dI}{dt} = \\frac{\\beta S I}{N} - \\gamma I
\\end{cases}`;

      odeHtml = `
        <div class="math-eq-row"><span class="math-var">dS/dt</span> = - (<span class="math-coeff">β</span> · S · I) / N + <span class="math-coeff">γ</span> · I</div>
        <div class="math-eq-row"><span class="math-var">dI/dt</span> = (<span class="math-coeff">β</span> · S · I) / N - <span class="math-coeff">γ</span> · I</div>
      `;
    } else if (modelType === 'SEIR') {
      odeLatex = `\\begin{cases}
\\frac{dS}{dt} = -\\frac{\\beta S I}{N} \\\\[10pt]
\\frac{dE}{dt} = \\frac{\\beta S I}{N} - \\sigma E \\\\[10pt]
\\frac{dI}{dt} = \\sigma E - \\gamma I \\\\[10pt]
\\frac{dR}{dt} = \\gamma I
\\end{cases}`;

      odeHtml = `
        <div class="math-eq-row"><span class="math-var">dS/dt</span> = - (<span class="math-coeff">β</span> · S · I) / N</div>
        <div class="math-eq-row"><span class="math-var">dE/dt</span> = (<span class="math-coeff">β</span> · S · I) / N - <span class="math-coeff">σ</span> · E</div>
        <div class="math-eq-row"><span class="math-var">dI/dt</span> = <span class="math-coeff">σ</span> · E - <span class="math-coeff">γ</span> · I</div>
        <div class="math-eq-row"><span class="math-var">dR/dt</span> = <span class="math-coeff">γ</span> · I</div>
      `;
    } else {
      // SEIRD completo
      odeLatex = `\\begin{cases}
\\frac{dS}{dt} = -\\frac{\\beta S I}{N} - \\nu S \\\\[10pt]
\\frac{dE}{dt} = \\frac{\\beta S I}{N} - \\sigma E \\\\[10pt]
\\frac{dI}{dt} = \\sigma E - (\\gamma + \\mu) I \\\\[10pt]
\\frac{dR}{dt} = \\gamma I \\\\[10pt]
\\frac{dD}{dt} = \\mu I
\\end{cases}`;

      odeHtml = `
        <div class="math-eq-row"><span class="math-var">dS/dt</span> = - (<span class="math-coeff">β</span> · S · I) / N - <span class="math-coeff">ν</span> · S</div>
        <div class="math-eq-row"><span class="math-var">dE/dt</span> = (<span class="math-coeff">β</span> · S · I) / N - <span class="math-coeff">σ</span> · E</div>
        <div class="math-eq-row"><span class="math-var">dI/dt</span> = <span class="math-coeff">σ</span> · E - (<span class="math-coeff">γ</span> + <span class="math-coeff">μ</span>) · I</div>
        <div class="math-eq-row"><span class="math-var">dR/dt</span> = <span class="math-coeff">γ</span> · I</div>
        <div class="math-eq-row"><span class="math-var">dD/dt</span> = <span class="math-coeff">μ</span> · I</div>
      `;
    }

    container.innerHTML = `
      <div class="math-card">
        <div class="math-header">
          <span class="badge-tag">Modelo: ${modelType}</span>
          <h3 class="math-title">Sistema de Ecuaciones Diferenciales Ordinarias (EDO)</h3>
          <p class="math-subtitle">${diseaseInfo.name} — Dinámica no lineal de compartimentos acoplados</p>
        </div>

        <div class="formula-box" id="ode-formula-box"></div>

        <div class="parameter-grid">
          <div class="param-card">
            <div class="param-symbol">β (Beta)</div>
            <div class="param-value">${beta} <span class="param-unit">días⁻¹</span></div>
            <div class="param-desc">Tasa de transmisión efectiva. Representa el producto del número promedio de contactos diarios por la probabilidad de transmisión en cada contacto.</div>
          </div>

          <div class="param-card">
            <div class="param-symbol">σ (Sigma)</div>
            <div class="param-value">${sigma} <span class="param-unit">días⁻¹</span></div>
            <div class="param-desc">Tasa de incubación = 1 / T_inc (${incubationDays} días). Frecuencia a la que individuos expuestos transitan a la fase infecciosa activa.</div>
          </div>

          <div class="param-card">
            <div class="param-symbol">γ (Gamma)</div>
            <div class="param-value">${gamma} <span class="param-unit">días⁻¹</span></div>
            <div class="param-desc">Tasa de recuperación = 1 / T_inf (${infectiousDays} días). Inverso de la duración del periodo en el que una persona contagia.</div>
          </div>

          <div class="param-card">
            <div class="param-symbol">μ (Mu)</div>
            <div class="param-value">${mu} <span class="param-unit">días⁻¹</span></div>
            <div class="param-desc">Tasa de mortalidad inducida. Calculada en función de la letalidad clínica (${(fatalityRate * 100).toFixed(2)}%) y la duración de la enfermedad.</div>
          </div>
        </div>

        <div class="derivation-section">
          <h4 class="derivation-title">📐 Deducción Analítica del Número Reproductivo Básico (R₀) y Umbral Epidémico</h4>
          <p class="derivation-text">
            Al inicio de una epidemia, la población es casi enteramente susceptible (\(S \\approx N\)). Analizando la derivada de los infectados:
          </p>
          <div class="formula-box-small" id="r0-derivation-box"></div>
          <p class="derivation-text">
            Por lo tanto, la enfermedad <strong>solo se propaga exponencialmente si</strong> \(R_0 > 1\). Si \(R_0 < 1\), la derivada es negativa y la epidemia se extingue espontáneamente sin causar brote masivo.
          </p>
        </div>

        <div class="derivation-section">
          <h4 class="derivation-title">🛡️ Umbral de Inmunidad de Rebaño (Herd Immunity Threshold - H_IT)</h4>
          <p class="derivation-text">
            La proporción mínima de la población (\(p_c\)) que debe ser inmune (por infección previa o vacunación efectiva) para evitar que la enfermedad se propague es:
          </p>
          <div class="formula-box-small" id="hit-formula-box"></div>
          <p class="derivation-text">
            Para <strong>${diseaseInfo.name}</strong> (\(R_0 = ${r0}\)), se requiere vacunar o inmunizar al menos al <strong>${hit}%</strong> de la población para erradicar la transmisión comunitaria sostenida.
          </p>
        </div>

        <div class="rk4-explanation">
          <h4 class="derivation-title">⚙️ Solución Numérica: Método de Runge-Kutta de 4º Orden (RK4)</h4>
          <p class="derivation-text">
            Las ecuaciones diferenciales del modelo epidémico no admiten una solución analítica en términos de funciones elementales debido al término no lineal de contacto \(\\frac{\\beta S I}{N}\). Por ello, este simulador resuelve el sistema paso a paso integrando con <strong>Runge-Kutta 4 (RK4)</strong>:
          </p>
          <div class="formula-box-small" id="rk4-formula-box"></div>
          <p class="derivation-text">
            A diferencia del método de Euler hacia adelante (que acumula un error local de orden \(O(h^2)\) y global de \(O(h)\)), el método RK4 tiene un error de truncamiento global de \(O(h^4)\), garantizando máxima estabilidad numérica sin oscilaciones espurias.
          </p>
        </div>
      </div>
    `;

    // Renderizar fórmulas con KaTeX o Fallback
    const odeBox = container.querySelector('#ode-formula-box');
    this.renderFormula(odeBox, odeLatex, odeHtml);

    const r0Box = container.querySelector('#r0-derivation-box');
    this.renderFormula(
      r0Box,
      `\\frac{dI}{dt} = I \\left( \\beta \\frac{S}{N} - \\gamma - \\mu \\right) > 0 \\iff \\frac{\\beta}{\\gamma + \\mu} > 1 \\implies R_0 = \\frac{\\beta}{\\gamma + \\mu} = ${r0}`,
      `<div class="math-eq-row">dI/dt = I · (β · S/N - γ - μ) > 0 ⟺ R₀ = β / (γ + μ) = <strong>${r0}</strong></div>`
    );

    const hitBox = container.querySelector('#hit-formula-box');
    this.renderFormula(
      hitBox,
      `H_{IT} = 1 - \\frac{1}{R_0} = 1 - \\frac{1}{${r0}} = ${(1 - 1 / r0).toFixed(4)} \\implies \\mathbf{${hit}\\%}`,
      `<div class="math-eq-row">H_IT = 1 - 1 / R₀ = 1 - 1 / ${r0} = <strong>${hit}%</strong></div>`
    );

    const rk4Box = container.querySelector('#rk4-formula-box');
    this.renderFormula(
      rk4Box,
      `\\mathbf{y}_{n+1} = \\mathbf{y}_n + \\frac{h}{6} (\\mathbf{k}_1 + 2\\mathbf{k}_2 + 2\\mathbf{k}_3 + \\mathbf{k}_4)`,
      `<div class="math-eq-row">yₙ₊₁ = yₙ + (h/6) · (k₁ + 2k₂ + 2k₃ + k₄)  [Error O(h⁴)]</div>`
    );
  }
}

  // === Fin de js/components/mathRenderer.js ===

  // === Inicio de js/components/mathExplorer.js ===
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

function tex(s, display = false) {
  if (window.katex) {
    try { return window.katex.renderToString(s, { throwOnError: false, displayMode: display }); } catch (e) { /* respaldo */ }
  }
  return `<code class="tex-fallback">${s}</code>`;
}

const VARS = {
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

class MathExplorer {
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

  // === Fin de js/components/mathExplorer.js ===

  // === Inicio de js/render3d/orbitControls.js ===
/**
 * Controles de cámara orbitales (ratón + táctil) escritos a medida.
 * Los OrbitControls oficiales de Three.js sólo se distribuyen como módulo ES,
 * que no funciona al abrir index.html con doble clic (file://).
 *
 *  - Arrastrar (clic izquierdo / 1 dedo): rotar
 *  - Clic derecho, Shift+arrastrar o 2 dedos: desplazar
 *  - Rueda / pellizcar: acercar / alejar
 *  - Un clic sin arrastrar dispara onClick(x, y)
 */
class OrbitCameraControls {
  constructor(camera, dom) {
    this.camera = camera;
    this.dom = dom;
    this.target = new THREE.Vector3(0, 0, 0);
    this.radius = 78;
    this.theta = 0.0;   // azimut
    this.phi = 0.88;    // ángulo polar (0 = cenital)
    this.minRadius = 8;
    this.maxRadius = 190;
    this.onClick = null;
    this.onUserMove = null;
    this.goal = null;   // destino animado (seguir a una persona / encuadres)
    this.bind();
    this.update();
  }

  bind() {
    const d = this.dom;
    let mode = null, sx = 0, sy = 0, lx = 0, ly = 0, moved = 0, pinch = 0;
    d.addEventListener('contextmenu', (e) => e.preventDefault());
    d.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      d.setPointerCapture(e.pointerId);
      mode = e.button === 2 || e.shiftKey ? 'pan' : 'rotate';
      sx = lx = e.clientX; sy = ly = e.clientY; moved = 0;
    });
    d.addEventListener('pointermove', (e) => {
      if (!mode || e.pointerType === 'touch') return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 4) this.drag(mode, dx, dy);
    });
    d.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') return;
      if (mode && moved <= 4 && this.onClick) this.onClick(e.clientX, e.clientY, e);
      mode = null;
    });
    d.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom(Math.exp(e.deltaY * 0.0012));
    }, { passive: false });

    // Táctil
    d.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) { mode = 'rotate'; sx = lx = e.touches[0].clientX; sy = ly = e.touches[0].clientY; moved = 0; }
      else if (e.touches.length === 2) {
        mode = 'pinch';
        pinch = this.touchDist(e);
        lx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        ly = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    }, { passive: true });
    d.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (mode === 'rotate' && e.touches.length === 1) {
        const dx = e.touches[0].clientX - lx, dy = e.touches[0].clientY - ly;
        lx = e.touches[0].clientX; ly = e.touches[0].clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        if (moved > 6) this.drag('rotate', dx, dy);
      } else if (e.touches.length === 2) {
        const dist = this.touchDist(e);
        if (pinch > 0) this.zoom(pinch / dist);
        pinch = dist;
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        this.drag('pan', cx - lx, cy - ly);
        lx = cx; ly = cy;
        moved = 99;
      }
    }, { passive: false });
    d.addEventListener('touchend', (e) => {
      if (mode === 'rotate' && moved <= 6 && this.onClick && e.changedTouches.length) {
        this.onClick(e.changedTouches[0].clientX, e.changedTouches[0].clientY, e);
      }
      if (e.touches.length === 0) mode = null;
    });
  }

  touchDist(e) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.hypot(dx, dy) || 1;
  }

  drag(mode, dx, dy) {
    this.goal = null;
    if (this.onUserMove) this.onUserMove();
    if (mode === 'rotate') {
      this.theta -= dx * 0.006;
      this.phi = Math.max(0.12, Math.min(1.45, this.phi - dy * 0.005));
    } else {
      const s = this.radius * 0.0016;
      const cos = Math.cos(this.theta), sin = Math.sin(this.theta);
      this.target.x -= (dx * cos + dy * sin) * s;
      this.target.z -= (-dx * sin + dy * cos) * s;
      this.target.x = Math.max(-80, Math.min(80, this.target.x));
      this.target.z = Math.max(-60, Math.min(60, this.target.z));
    }
    this.update();
  }

  zoom(f) {
    this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius * f));
    this.update();
  }

  /** Mueve suavemente la cámara hacia un objetivo. */
  flyTo(x, z, radius, phi, theta) {
    this.goal = { x, z, radius: radius ?? this.radius, phi: phi ?? this.phi, theta };
  }

  tick(follow) {
    if (follow) {
      this.target.x += (follow.x - this.target.x) * 0.12;
      this.target.z += (follow.z - this.target.z) * 0.12;
      this.update();
    }
    if (this.goal) {
      const g = this.goal;
      this.target.x += (g.x - this.target.x) * 0.08;
      this.target.z += (g.z - this.target.z) * 0.08;
      this.radius += (g.radius - this.radius) * 0.08;
      this.phi += (g.phi - this.phi) * 0.08;
      if (g.theta !== undefined) {
        let d = g.theta - this.theta;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        this.theta += d * 0.06;
      }
      if (Math.abs(g.radius - this.radius) < 0.2 && Math.hypot(g.x - this.target.x, g.z - this.target.z) < 0.2) this.goal = null;
      this.update();
    }
  }

  update() {
    const r = this.radius;
    const c = this.camera;
    c.position.set(
      this.target.x + r * Math.sin(this.phi) * Math.sin(this.theta),
      this.target.y + r * Math.cos(this.phi),
      this.target.z + r * Math.sin(this.phi) * Math.cos(this.theta)
    );
    c.lookAt(this.target);
  }
}

  // === Fin de js/render3d/orbitControls.js ===

  // === Inicio de js/render3d/cityRenderer.js ===
/**
 * EpiDynamics 6.0 — Escenario 3D de la comunidad.
 *
 * Todo es procedural (geometría + texturas dibujadas en <canvas>): funciona sin conexión,
 * con doble clic y sin licencias de terceros. Incluye:
 *   viviendas con tejado a dos aguas, chimeneas, ventanas con marco y jardines; aceras con bordillo,
 *   pasos de cebra; plaza con fuente animada; mercado con toldos y frutas; escuela con patio de juegos;
 *   hospital con fachada, ambulancia y sala de camas; parque con estanque, flores y árboles variados;
 *   pozos; jardín memorial; vehículos que se detienen ante peatones; cielo, nubes y ciclo día/noche.
 *
 * Optimización: las mallas estáticas se fusionan por material (pocas llamadas de dibujo).
 * El tráfico, las nubes y la fuente son ambientación: NO influyen en el motor epidemiológico.
 */

const HOUSE_COLORS = [0xf3e3c3, 0xe9c9a1, 0xd6e4dc, 0xf6e7cf, 0xe6d3c9, 0xcfdcea, 0xf2d0cf, 0xdfe8c6, 0xf0dcb0, 0xd9d0ea];
const ROOF_COLORS = [0xb4532a, 0x9a3412, 0x7c2d12, 0x475569, 0x8b5e34];
const DOOR_COLORS = [0x5b3a1e, 0x1e3a8a, 0x14532d, 0x7f1d1d, 0x3f3f46];

function canvasTex(size, draw, repeat = 1) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const x = c.getContext('2d');
  let s = 1234567;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  draw(x, size, rnd);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
const noise = (x, n, rnd, colors, count, rmax) => {
  for (let i = 0; i < count; i++) {
    x.fillStyle = colors[Math.floor(rnd() * colors.length)];
    const r = 1 + rnd() * rmax;
    x.fillRect(rnd() * n, rnd() * n, r, r);
  }
};
const lerpN = (a, b, k) => a + (b - a) * k;

function makeLabelTexture(text, opts = {}) {
  const c = document.createElement('canvas');
  const fs = opts.fontSize || 44;
  const ctx = c.getContext('2d');
  ctx.font = `700 ${fs}px system-ui, Segoe UI, sans-serif`;
  const w = Math.ceil(ctx.measureText(text).width) + 40;
  c.width = w; c.height = fs + 30;
  ctx.font = `700 ${fs}px system-ui, Segoe UI, sans-serif`;
  ctx.fillStyle = opts.bg || 'rgba(15,23,42,0.78)';
  const r = 18;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(w - r, 0); ctx.quadraticCurveTo(w, 0, w, r); ctx.lineTo(w, c.height - r);
  ctx.quadraticCurveTo(w, c.height, w - r, c.height); ctx.lineTo(r, c.height); ctx.quadraticCurveTo(0, c.height, 0, c.height - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0); ctx.fill();
  ctx.fillStyle = opts.color || '#f8fafc';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 20, c.height / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, aspect: w / c.height };
}

class CityRenderer {
  constructor(scene, town) {
    this.scene = scene;
    this.town = town;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.roofs = [];
    this.airPlanes = {};
    this.wellWater = [];
    this.matCache = new Map();
    this.labels = [];
    this.makeTextures();
    this.build();
  }

  makeTextures() {
    this.tex = {
      grass: canvasTex(256, (x, n, r) => {
        x.fillStyle = '#6f9e4c'; x.fillRect(0, 0, n, n);
        noise(x, n, r, ['#5f8f3f', '#7fb058', '#689a45', '#86b862', '#5a8a3a'], 2600, 3);
      }, 40),
      park: canvasTex(256, (x, n, r) => {
        x.fillStyle = '#5c9443'; x.fillRect(0, 0, n, n);
        noise(x, n, r, ['#4f8638', '#6aa64e', '#7cb85c', '#558c3d'], 2600, 3);
        noise(x, n, r, ['#fde68a', '#fca5a5', '#f9fafb'], 40, 2);
      }, 6),
      asphalt: canvasTex(256, (x, n, r) => {
        x.fillStyle = '#3f444c'; x.fillRect(0, 0, n, n);
        noise(x, n, r, ['#383c43', '#4a5059', '#454a52', '#33373d'], 5000, 2);
      }, 12),
      sidewalk: canvasTex(128, (x, n, r) => {
        x.fillStyle = '#c8c2b6'; x.fillRect(0, 0, n, n);
        noise(x, n, r, ['#bdb7aa', '#d2ccc0'], 600, 2);
        x.strokeStyle = '#a8a294'; x.lineWidth = 3;
        for (let i = 0; i <= n; i += n / 2) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, n); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(n, i); x.stroke(); }
      }, 1),
      paving: canvasTex(256, (x, n, r) => {
        x.fillStyle = '#d9cdb3'; x.fillRect(0, 0, n, n);
        const s = n / 8;
        for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
          x.fillStyle = (i + j) % 2 ? '#e3d8c0' : '#cfc1a3';
          x.fillRect(i * s + 1, j * s + 1, s - 2, s - 2);
        }
        noise(x, n, r, ['rgba(0,0,0,0.05)', 'rgba(255,255,255,0.08)'], 900, 3);
      }, 5),
      roof: canvasTex(128, (x, n) => {
        x.fillStyle = '#ffffff'; x.fillRect(0, 0, n, n);
        for (let y = 0; y < n; y += 16) {
          x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(0, y + 12, n, 4);
          for (let xx = (y / 16) % 2 ? 8 : 0; xx < n; xx += 16) { x.fillStyle = 'rgba(0,0,0,0.08)'; x.fillRect(xx, y, 2, 14); }
        }
      }, 2),
      plaster: canvasTex(128, (x, n, r) => {
        x.fillStyle = '#ffffff'; x.fillRect(0, 0, n, n);
        noise(x, n, r, ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.07)', 'rgba(255,255,255,0.5)'], 1400, 2);
      }, 2),
      brick: canvasTex(128, (x, n, r) => {
        x.fillStyle = '#e8dccb'; x.fillRect(0, 0, n, n);
        for (let y = 0; y < n; y += 16) for (let xx = (y / 16) % 2 ? -16 : 0; xx < n; xx += 32) {
          x.fillStyle = `rgb(${200 + r() * 30},${120 + r() * 30},${90 + r() * 20})`;
          x.fillRect(xx + 1, y + 1, 30, 14);
        }
      }, 3),
      tiles: canvasTex(128, (x, n) => {
        x.fillStyle = '#eef2f7'; x.fillRect(0, 0, n, n);
        x.strokeStyle = '#cbd5e1'; x.lineWidth = 2;
        for (let i = 0; i <= n; i += n / 4) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, n); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(n, i); x.stroke(); }
      }, 8),
      awning: canvasTex(64, (x, n) => {
        for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#bbbbbb'; x.fillRect(i * 8, 0, 8, n); }
      }, 1),
      water: canvasTex(128, (x, n, r) => {
        x.fillStyle = '#ffffff'; x.fillRect(0, 0, n, n);
        x.strokeStyle = 'rgba(0,0,0,0.08)'; x.lineWidth = 2;
        for (let i = 0; i < 30; i++) { x.beginPath(); x.arc(r() * n, r() * n, 4 + r() * 10, 0, Math.PI); x.stroke(); }
      }, 2)
    };
    this.tex.paving.repeat.set(4, 6);
  }

  /** Materiales compartidos (permiten fusionar geometría por material). */
  mat(color, opts = {}) {
    const { rough, map, ...rest } = opts;
    const key = JSON.stringify([color, rough, map ? map.uuid : null, rest]);
    if (this.matCache.has(key)) return this.matCache.get(key);
    const m = new THREE.MeshStandardMaterial({ color, roughness: rough ?? 0.85, metalness: 0, map: map || null, ...rest });
    this.matCache.set(key, m);
    return m;
  }

  box(w, h, d, color, x, y, z, opts = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), opts.material || this.mat(color, opts.matOpts));
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  cyl(rt, rb, h, color, x, y, z, opts = {}) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, opts.seg || 14), opts.material || this.mat(color, opts.matOpts));
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  plane(w, d, color, x, y, z, opts = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), opts.material || this.mat(color, opts.matOpts));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  label(text, x, y, z, scale = 3.2, opts) {
    const { tex, aspect } = makeLabelTexture(text, opts);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true }));
    s.scale.set(scale * aspect * 0.5, scale * 0.5, 1);
    s.position.set(x, y, z);
    s.renderOrder = 5;
    this.group.add(s);
    this.labels.push(s);
    return s;
  }

  build() {
    const groundTex = this.tex.grass.clone();
    groundTex.repeat.set(60, 50);
    groundTex.needsUpdate = true;
    this.plane(WORLD.x1 - WORLD.x0 + 200, WORLD.z1 - WORLD.z0 + 200, 0xffffff, 0, 0, 0, { matOpts: { map: groundTex } });
    this.buildStreets();
    this.buildPlaza();
    this.buildMarket();
    this.buildSchool();
    this.buildHospital();
    this.buildPark();
    this.buildHouses();
    this.buildWells();
    this.buildMemorial();
    this.buildTrees();
    this.buildLamps();
    this.buildAirPlanes();
    this.buildBreedingSites();
    this.buildSky();
    this.buildTraffic();
    for (const r of this.roofs) r.userData.dynamic = true;
    for (const w of this.wellWater) if (w) w.userData.dynamic = true;
    for (const k in this.airPlanes) this.airPlanes[k].userData.dynamic = true;
    this.mergeStatic();
  }

  buildStreets() {
    const asphalt = this.mat(0xffffff, { map: this.tex.asphalt, rough: 0.95 });
    const walk = this.mat(0xffffff, { map: this.tex.sidewalk, rough: 0.95 });
    const curb = this.mat(0xa8a29e, { rough: 0.9 });
    const W = WORLD.x1 - WORLD.x0 + 40;
    for (const z of [STREET_N, -STREET_N]) {
      this.plane(W, 4.6, 0, 0, 0.03, z, { material: asphalt });
      for (const s of [-1, 1]) {
        const b = this.box(W, 0.16, 1.4, 0, 0, 0.08, z + s * 3.0, { material: walk, cast: false });
        const uv = b.geometry.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * W / 1.4);
        this.box(W, 0.18, 0.12, 0, 0, 0.09, z + s * 2.3, { material: curb, cast: false });
      }
    }
    for (const x of V_STREETS) {
      this.plane(3.2, STREET_N * 2 - 6.2, 0, x, 0.03, 0, { material: asphalt });
      for (const s of [-1, 1]) this.box(0.9, 0.16, STREET_N * 2 - 6.2, 0, x + s * 2.05, 0.08, 0, { material: walk, cast: false });
    }
    const white = this.mat(0xf8fafc, { rough: 0.6 });
    const yellow = this.mat(0xfacc15, { rough: 0.6 });
    for (const z of [STREET_N, -STREET_N]) for (let x = WORLD.x0 - 10; x < WORLD.x1 + 10; x += 6) this.plane(2.4, 0.16, 0, x, 0.045, z, { material: yellow });
    const crossX = [...V_STREETS, -24, 0, 24, 50];
    for (const z of [STREET_N, -STREET_N]) for (const x of crossX) for (let k = -1.6; k <= 1.6; k += 0.8) this.plane(0.45, 4.2, 0, x + k, 0.05, z, { material: white });
  }

  buildPlaza() {
    const r = this.town.places.plaza.rect;
    this.plane(r.w + 1, r.d + 1, 0xffffff, r.cx, 0.05, r.cz, { matOpts: { map: this.tex.paving } });
    const stone = this.mat(0xe2e8f0, { map: this.tex.plaster, rough: 0.7 });
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.7, 0.7, 32), stone);
    basin.position.set(0, 0.35, 0); basin.castShadow = true; basin.receiveShadow = true;
    this.group.add(basin);
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.15, map: this.tex.water, emissive: 0x0c4a6e, emissiveIntensity: 0.25 });
    const water = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.08, 32), waterMat);
    water.position.set(0, 0.68, 0);
    this.group.add(water);
    this.wellWater[0] = water;
    const tier = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.4, 0.35, 24), stone);
    tier.position.set(0, 1.65, 0); tier.castShadow = true;
    this.group.add(tier);
    this.cyl(0.2, 0.3, 1.5, 0, 0, 1.0, 0, { material: stone });
    this.jet = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 0.9, 10), new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.7, roughness: 0.1 }));
    this.jet.position.set(0, 2.2, 0);
    this.jet.userData.dynamic = true;
    this.group.add(this.jet);
    const wood = this.mat(0x8b5a2b, { rough: 0.8 });
    const metal = this.mat(0x334155, { rough: 0.5 });
    for (const [x, z, ry] of [[-6.5, -6.5, Math.PI / 4], [6.5, -6.5, -Math.PI / 4], [-6.5, 6.5, -Math.PI / 4 + Math.PI], [6.5, 6.5, Math.PI / 4 + Math.PI], [0, -9, 0], [0, 9, Math.PI]]) {
      this.bench(x, z, ry, wood, metal);
    }
    const planter = this.mat(0x9ca3af, { rough: 0.8 });
    for (const [x, z] of [[-7.5, 0], [7.5, 0], [0, -4.5], [0, 4.5]]) {
      this.box(1.4, 0.5, 1.4, 0, x, 0.25, z, { material: planter });
      this.flowerBush(x, 0.65, z, 0.6);
    }
    this.label('Plaza central', 0, 6.5, -2);
  }

  bench(x, z, ry, wood, metal) {
    const grp = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.5), wood); seat.position.y = 0.45;
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.07), wood); back.position.set(0, 0.72, -0.22); back.rotation.x = -0.15;
    const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.45), metal); l1.position.set(-0.8, 0.22, 0);
    const l2 = l1.clone(); l2.position.x = 0.8;
    grp.add(seat, back, l1, l2);
    grp.position.set(x, 0, z); grp.rotation.y = ry;
    grp.updateMatrix();
    for (const c of [...grp.children]) {
      c.updateMatrix();
      c.matrix.premultiply(grp.matrix);
      c.matrix.decompose(c.position, c.quaternion, c.scale);
      c.castShadow = true; c.receiveShadow = true;
      this.group.add(c);
    }
  }

  flowerBush(x, y, z, r) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), this.mat(0x3f7d2c, { flatShading: true }));
    b.position.set(x, y, z); b.castShadow = true;
    this.group.add(b);
    const cols = [0xf472b6, 0xfacc15, 0xf87171, 0xffffff, 0xa78bfa];
    for (let k = 0; k < 5; k++) {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), this.mat(cols[(k + Math.abs(Math.round(x))) % cols.length]));
      const a = (k / 5) * Math.PI * 2;
      f.position.set(x + Math.cos(a) * r * 0.7, y + r * 0.55, z + Math.sin(a) * r * 0.7);
      this.group.add(f);
    }
  }

  buildMarket() {
    const r = this.town.places.market.rect;
    this.plane(r.w + 1, r.d + 1, 0xffffff, r.cx, 0.05, r.cz, { matOpts: { map: this.tex.paving } });
    const post = this.mat(0x57534e, { rough: 0.6 });
    for (let x = r.x0 + 0.5; x <= r.x1 - 0.4; x += (r.w - 1) / 3) for (const z of [r.z0 + 0.5, r.z1 - 0.5]) this.box(0.3, 4, 0.3, 0, x, 2, z, { material: post });
    const roof = this.box(r.w + 1, 0.2, r.d + 1, 0xb45309, r.cx, 4.1, r.cz, { cast: false, matOpts: { transparent: true, opacity: 0.28, depthWrite: false } });
    this.roofs.push(roof);
    const colors = [0xef4444, 0xf59e0b, 0x22c55e, 0x3b82f6, 0xa855f7, 0xec4899];
    const fruit = [0xef4444, 0xf97316, 0xfacc15, 0x84cc16, 0x7c3aed];
    const woodM = this.mat(0x92400e, { rough: 0.8 });
    let k = 0;
    for (let x = r.x0 + 3; x < r.x1 - 2; x += 5) {
      for (const z of [-10, -3, 4, 11]) {
        this.box(2.4, 0.85, 1.1, 0, x, 0.43, z, { material: woodM });
        for (const dx of [-1.1, 1.1]) this.box(0.08, 2.2, 0.08, 0, x + dx, 1.1, z - 0.5, { material: post });
        const aw = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.06, 1.7), this.mat(colors[k % colors.length], { map: this.tex.awning }));
        aw.position.set(x, 2.15, z - 0.05); aw.rotation.x = 0.18; aw.castShadow = true;
        this.group.add(aw);
        for (let q = 0; q < 6; q++) {
          const f = new THREE.Mesh(new THREE.SphereGeometry(0.1, 7, 6), this.mat(fruit[(q + k) % fruit.length], { rough: 0.5 }));
          f.position.set(x - 0.9 + (q % 3) * 0.35 + (q > 2 ? 0.9 : 0), 0.95, z - 0.2 + (q % 2) * 0.25);
          this.group.add(f);
        }
        k++;
      }
    }
    this.label('Mercado', r.cx, 6.8, r.cz);
  }

  buildSchool() {
    const r = this.town.places.school.rect;
    this.plane(r.w + 1, r.d + 1, 0xffffff, r.cx, 0.05, r.cz, { matOpts: { map: this.tex.tiles } });
    this.walls(r, 2.6, this.mat(0xffffff, { map: this.tex.brick }), 2.4);
    const woodM = this.mat(0x92400e);
    for (let x = r.x0 + 3; x < r.x1 - 2; x += 3.2) for (let z = r.z0 + 4; z < r.z1 - 9; z += 4.5) this.box(1.4, 0.75, 0.7, 0, x, 0.38, z, { material: woodM });
    this.box(5, 1.6, 0.1, 0x14532d, r.cx, 1.5, r.z0 + 0.4, { matOpts: { rough: 0.4 } });
    const red = this.mat(0xdc2626, { rough: 0.5 }), blue = this.mat(0x2563eb, { rough: 0.5 }), yel = this.mat(0xfacc15, { rough: 0.5 });
    const px = r.x0 + 5, pz = r.z1 - 5;
    for (const [dx, dz] of [[-1.2, -0.6], [1.2, -0.6], [-1.2, 0.6], [1.2, 0.6]]) this.box(0.1, 2.2, 0.1, 0, px + dx, 1.1, pz + dz, { material: blue });
    this.box(2.6, 0.1, 0.1, 0, px, 2.2, pz, { material: blue });
    this.box(0.6, 0.06, 0.3, 0, px - 0.5, 0.6, pz, { material: yel }); this.box(0.6, 0.06, 0.3, 0, px + 0.5, 0.6, pz, { material: yel });
    const slide = this.box(0.8, 0.08, 3.2, 0, r.x1 - 5, 1.0, pz, { material: red });
    slide.rotation.x = 0.55;
    this.box(0.9, 1.9, 0.9, 0, r.x1 - 5, 0.95, pz - 1.8, { material: yel });
    this.cyl(0.05, 0.06, 6, 0xd1d5db, r.x0 + 1.5, 3, r.z0 + 1.5, { matOpts: { rough: 0.3 } });
    this.box(1.6, 0.9, 0.04, 0x2563eb, r.x0 + 2.35, 5.4, r.z0 + 1.5);
    const roof = this.box(r.w + 1.2, 0.3, r.d + 1.2, 0xb45309, r.cx, 2.75, r.cz, { cast: false, matOpts: { transparent: true, opacity: 0.25, depthWrite: false } });
    this.roofs.push(roof);
    this.label('Escuela', r.cx, 6.5, r.cz);
  }

  buildHospital() {
    const r = this.town.places.hospital.rect;
    this.plane(r.w + 1, r.d + 1, 0xffffff, r.cx, 0.05, r.cz, { matOpts: { map: this.tex.tiles } });
    const white = this.mat(0xffffff, { map: this.tex.plaster, rough: 0.7 });
    this.walls(r, 1.3, white, 2.4);
    const bx = r.x1 - 2.6, bz = -11.5;
    this.box(5.2, 6.4, 8, 0, bx, 3.2, bz, { material: white });
    const glass = this.mat(0x7dd3fc, { rough: 0.15, metalness: 0.3 });
    for (const y of [1.8, 4.4]) for (const dz of [-2.5, 0, 2.5]) this.box(0.08, 1.1, 1.5, 0, bx - 2.62, y, bz + dz, { material: glass, cast: false });
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xdc2626, emissiveIntensity: 0.5 });
    this.box(0.2, 2.2, 0.7, 0, bx - 2.7, 5.4, bz + 3.2, { material: crossMat });
    this.box(0.2, 0.7, 2.2, 0, bx - 2.7, 5.4, bz + 3.2, { material: crossMat });
    this.box(3, 0.15, 3, 0xe5e7eb, bx - 3.5, 2.6, bz + 5.5);
    for (const dz of [-1.3, 1.3]) this.cyl(0.08, 0.08, 2.6, 0x94a3b8, bx - 4.8, 1.3, bz + 5.5 + dz);
    this.label('Hospital', r.cx, 8.2, r.cz);
    this.bedMesh = null;
  }

  setHospitalBeds(beds) {
    for (const k of ['bedMesh', 'ivMesh', 'pillowMesh']) if (this[k]) { this.group.remove(this[k]); this[k].geometry.dispose(); }
    const n = Math.max(1, beds.length);
    const mk = (geo, mat) => { const m = new THREE.InstancedMesh(geo, mat, n); m.count = beds.length; m.castShadow = true; m.receiveShadow = true; this.group.add(m); return m; };
    this.bedMesh = mk(new THREE.BoxGeometry(1.0, 0.5, 2.2), this.mat(0xe0f2fe));
    this.pillowMesh = mk(new THREE.BoxGeometry(0.7, 0.12, 0.35), this.mat(0xffffff));
    this.ivMesh = mk(new THREE.CylinderGeometry(0.025, 0.025, 1.8, 6), this.mat(0x94a3b8, { rough: 0.3 }));
    const mtx = new THREE.Matrix4();
    beds.forEach((b, i) => {
      mtx.makeTranslation(b.x, 0.3, b.z); this.bedMesh.setMatrixAt(i, mtx);
      mtx.makeTranslation(b.x, 0.6, b.z - 0.85); this.pillowMesh.setMatrixAt(i, mtx);
      mtx.makeTranslation(b.x + 0.75, 0.9, b.z - 0.8); this.ivMesh.setMatrixAt(i, mtx);
    });
  }

  buildPark() {
    const r = this.town.places.park.rect;
    this.plane(r.w + 1, r.d + 1, 0xffffff, r.cx, 0.04, r.cz, { matOpts: { map: this.tex.park } });
    this.plane(1.8, r.d, 0xd6c49b, -44, 0.05, 0, { matOpts: { rough: 1 } });
    const pond = new THREE.Mesh(new THREE.CircleGeometry(5, 40),
      new THREE.MeshStandardMaterial({ color: 0x2f6f73, roughness: 0.1, metalness: 0.2, map: this.tex.water, emissive: 0x0b3b3d, emissiveIntensity: 0.3 }));
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(-50, 0.07, -4);
    pond.userData.dynamic = true;
    this.group.add(pond);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(5.05, 0.18, 6, 40), this.mat(0x9ca3af));
    rim.rotation.x = Math.PI / 2; rim.position.set(-50, 0.08, -4);
    this.group.add(rim);
    const lilyM = this.mat(0x4d7c0f);
    for (let k = 0; k < 7; k++) {
      const lily = new THREE.Mesh(new THREE.CircleGeometry(0.35, 10), lilyM);
      lily.rotation.x = -Math.PI / 2;
      lily.position.set(-50 + Math.cos(k * 1.9) * 3, 0.09, -4 + Math.sin(k * 1.9) * 3);
      this.group.add(lily);
    }
    const wood = this.mat(0x8b5a2b, { rough: 0.8 }), metal = this.mat(0x334155, { rough: 0.5 });
    for (const [x, z, ry] of [[-44, -12, 0], [-56, 10, Math.PI], [-41, 6, -Math.PI / 2]]) this.bench(x, z, ry, wood, metal);
    for (const [x, z] of [[-58, -12], [-40, -13], [-58, 4], [-46, 12]]) this.flowerBush(x, 0.35, z, 0.55);
    this.label('Parque', r.cx, 6.5, r.cz + 6);
  }

  walls(r, h, mat, doorW) {
    const t = 0.3;
    for (const z of [r.z0, r.z1]) {
      const seg = (r.w - doorW) / 2;
      this.box(seg, h, t, 0, r.x0 + seg / 2, h / 2, z, { material: mat });
      this.box(seg, h, t, 0, r.x1 - seg / 2, h / 2, z, { material: mat });
    }
    for (const x of [r.x0, r.x1]) this.box(t, h, r.d, 0, x, h / 2, r.cz, { material: mat });
  }

  /** Tejado a dos aguas (prisma) con alero; la cumbrera es paralela a la calle (eje x). */
  gableGeometry(w, d, h) {
    const shape = new THREE.Shape();
    shape.moveTo(-d / 2, 0); shape.lineTo(d / 2, 0); shape.lineTo(0, h); shape.lineTo(-d / 2, 0);
    const g = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    g.translate(-w / 2, 0, 0);
    g.computeVertexNormals();
    return g;
  }

  buildHouses() {
    this.windowMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, emissive: 0xfcd34d, emissiveIntensity: 0, roughness: 0.2, metalness: 0.2 });
    const frame = this.mat(0xf8fafc, { rough: 0.5 });
    const bedMat = this.mat(0xdbeafe);
    const floor = this.mat(0xa8896b, { rough: 0.9 });
    const fence = this.mat(0xf5f5f4, { rough: 0.7 });
    const chimney = this.mat(0x9a3412, { map: this.tex.brick });
    const roofGeo = this.gableGeometry(7.2, 7.2, 2.3);
    for (const h of this.town.houses) {
      const r = h.rect;
      const mat = this.mat(HOUSE_COLORS[h.index % HOUSE_COLORS.length], { map: this.tex.plaster });
      const H = 2.7;
      const sgn = r.cz > 0 ? 1 : -1;
      const front = sgn > 0 ? r.z0 : r.z1;
      const back = sgn > 0 ? r.z1 : r.z0;
      this.box(2.3, H, 0.25, 0, r.x0 + 1.15, H / 2, front, { material: mat });
      this.box(2.3, H, 0.25, 0, r.x1 - 1.15, H / 2, front, { material: mat });
      this.box(1.4, 0.6, 0.25, 0, r.cx, H - 0.3, front, { material: mat });
      this.box(r.w, H, 0.25, 0, r.cx, H / 2, back, { material: mat });
      this.box(0.25, H, r.d, 0, r.x0, H / 2, r.cz, { material: mat });
      this.box(0.25, H, r.d, 0, r.x1, H / 2, r.cz, { material: mat });
      this.box(1.0, 2.0, 0.08, 0, r.cx, 1.0, front - sgn * 0.09, { material: this.mat(DOOR_COLORS[h.index % DOOR_COLORS.length], { rough: 0.6 }), cast: false });
      this.box(1.25, 2.15, 0.06, 0, r.cx, 1.07, front - sgn * 0.04, { material: frame, cast: false });
      for (const wx of [r.x0 + 1.3, r.x1 - 1.3]) {
        this.box(1.15, 0.95, 0.06, 0, wx, 1.6, front - sgn * 0.16, { material: frame, cast: false });
        this.box(1.0, 0.8, 0.08, 0, wx, 1.6, front - sgn * 0.17, { material: this.windowMat, cast: false });
        this.box(1.2, 0.1, 0.25, 0, wx, 1.12, front - sgn * 0.22, { material: frame, cast: false });
      }
      for (const sx of [r.x0 - 0.02, r.x1 + 0.02]) this.box(0.08, 0.8, 1.0, 0, sx, 1.6, r.cz, { material: this.windowMat, cast: false });
      this.plane(r.w - 0.3, r.d - 0.3, 0, r.cx, 0.06, r.cz, { material: floor });
      this.box(2.4, 0.45, 1.1, 0, h.bed.x - 1.0, 0.23, h.bed.z, { material: bedMat });
      if (Math.abs(front) < 22) {
        const fz = front - sgn * 1.4;
        this.box(2.2, 0.5, 0.06, 0, r.x0 + 1.1, 0.25, fz, { material: fence, cast: false });
        this.box(2.2, 0.5, 0.06, 0, r.x1 - 1.1, 0.25, fz, { material: fence, cast: false });
        if (h.index % 2 === 0) this.flowerBush(r.x0 + 1.0, 0.3, front - sgn * 0.7, 0.4);
      }
      const roof = new THREE.Mesh(roofGeo, this.mat(ROOF_COLORS[h.index % ROOF_COLORS.length], { map: this.tex.roof, rough: 0.75 }));
      roof.position.set(r.cx, H, r.cz);
      roof.castShadow = true;
      roof.userData.houseKey = h.key;
      this.group.add(roof);
      this.roofs.push(roof);
      if (h.index % 3 === 0) {
        const ch = this.box(0.5, 1.4, 0.5, 0, r.x1 - 1.2, H + 1.6, r.cz + sgn * 1.2, { material: chimney });
        ch.userData.houseKey = h.key;
        this.roofs.push(ch);
      }
    }
  }

  buildWells() {
    const stone = new THREE.MeshStandardMaterial({ color: 0x9ca3af, map: this.tex.brick, roughness: 0.9, side: THREE.DoubleSide });
    const wood = this.mat(0x78350f);
    const roofM = this.mat(0x7c2d12);
    for (const s of this.town.waterSources) {
      if (s.id === 0) continue;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.9, 20, 1, true), stone);
      ring.position.set(s.x, 0.45, s.z); ring.castShadow = true;
      this.group.add(ring);
      const water = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, map: this.tex.water, emissive: 0x0c4a6e, emissiveIntensity: 0.25 }));
      water.rotation.x = -Math.PI / 2;
      water.position.set(s.x, 0.6, s.z);
      this.group.add(water);
      this.wellWater[s.id] = water;
      for (const dx of [-0.9, 0.9]) this.box(0.12, 2.0, 0.12, 0, s.x + dx, 1.0, s.z, { material: wood });
      const r1 = this.box(2.4, 0.08, 0.9, 0, s.x, 2.2, s.z + 0.32, { material: roofM }); r1.rotation.x = 0.5;
      const r2 = this.box(2.4, 0.08, 0.9, 0, s.x, 2.2, s.z - 0.32, { material: roofM }); r2.rotation.x = -0.5;
      this.cyl(0.05, 0.05, 1.8, 0, s.x, 1.5, s.z, { material: wood }).rotation.z = Math.PI / 2;
      this.label(s.name, s.x, 3.4, s.z, 2.2);
    }
  }

  setWaterContamination(levels) {
    const clean = new THREE.Color(0x38bdf8), dirty = new THREE.Color(0x7c6f2a);
    levels.forEach((lv, i) => {
      const w = this.wellWater[i];
      if (!w) return;
      w.material.color.copy(clean).lerp(dirty, Math.min(1, lv));
      w.material.emissive.set(lv > 0.05 ? 0x3f3a10 : 0x0c4a6e);
    });
  }

  buildMemorial() {
    const r = this.town.memorial;
    this.plane(r.w, r.d, 0xffffff, r.cx, 0.05, r.cz, { matOpts: { map: this.tex.park } });
    const hedge = this.mat(0x2f5d2a, { flatShading: true });
    this.box(r.w, 0.8, 0.5, 0, r.cx, 0.4, r.z0, { material: hedge });
    this.box(r.w, 0.8, 0.5, 0, r.cx, 0.4, r.z1, { material: hedge });
    this.box(0.5, 0.8, r.d, 0, r.x0, 0.4, r.cz, { material: hedge });
    this.box(0.5, 0.8, r.d, 0, r.x1, 0.4, r.cz, { material: hedge });
    this.label('Jardín memorial', r.cx, 3.2, r.cz, 2.4, { bg: 'rgba(30,41,59,0.7)', color: '#e2e8f0' });
    const g = new THREE.CapsuleGeometry(0.25, 0.4, 4, 10).scale(1, 1, 0.35).translate(0, 0.4, 0);
    this.stones = new THREE.InstancedMesh(g, this.mat(0xd6d3d1, { rough: 0.6 }), 400);
    this.stones.count = 0;
    this.stones.castShadow = true;
    this.group.add(this.stones);
    this.flowers = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 6), this.mat(0xfde68a, { emissive: 0x854d0e, emissiveIntensity: 0.2 }), 400);
    this.flowers.count = 0;
    this.group.add(this.flowers);
  }

  setMemorialCount(n) {
    n = Math.min(400, n);
    if (n === this.stones.count) return;
    const m = new THREE.Matrix4();
    for (let i = this.stones.count; i < n; i++) {
      const p = this.town.memorialSlot(i);
      m.makeTranslation(p.x, 0.05, p.z); this.stones.setMatrixAt(i, m);
      m.makeTranslation(p.x + 0.2, 0.12, p.z + 0.25); this.flowers.setMatrixAt(i, m);
    }
    this.stones.count = n; this.flowers.count = n;
    this.stones.instanceMatrix.needsUpdate = true;
    this.flowers.instanceMatrix.needsUpdate = true;
  }

  buildTrees() {
    const round = [], pine = [];
    let s = 99;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 30; i++) {
      const x = -61 + rnd() * 21, z = -14 + rnd() * 28;
      if (Math.hypot(x + 50, z + 4) > 7 && Math.abs(x + 44) > 1.5) (rnd() < 0.35 ? pine : round).push([x, z, 0.8 + rnd() * 0.6]);
    }
    for (let x = -60; x <= 60; x += 12) for (const z of [14.6, -14.6]) if (Math.abs(x) > 12 && (x < 36 || x > 38)) round.push([x + 2, z, 0.7]);
    for (let x = -58; x <= 58; x += 16) for (const z of [41.5, -41.5]) if (!(z > 0 && x > 45)) round.push([x, z, 0.8 + rnd() * 0.4]);
    for (let k = 0; k < 46; k++) {
      const a = rnd() * Math.PI * 2, d = 85 + rnd() * 30;
      pine.push([Math.cos(a) * d * 1.1, Math.sin(a) * d * 0.75, 1 + rnd() * 0.8]);
    }
    pine.push([52, 37.5, 1.1], [60, 37.5, 1.0]);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), p = new THREE.Vector3();
    const mk = (geo, mat, list, fn) => {
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach((t, i) => { fn(t, m); im.setMatrixAt(i, m); });
      im.castShadow = true; im.receiveShadow = true;
      this.group.add(im);
    };
    const all = [...round, ...pine];
    mk(new THREE.CylinderGeometry(0.18, 0.26, 2, 7), this.mat(0x6b4423), all, ([x, z, k], mm) => mm.compose(p.set(x, k, z), q, sv.set(k, k, k)));
    mk(new THREE.IcosahedronGeometry(1.5, 1), this.mat(0x4a8a32, { flatShading: true }), round, ([x, z, k], mm) => mm.compose(p.set(x, 2.6 * k, z), q, sv.set(k * 1.15, k * 1.05, k * 1.15)));
    mk(new THREE.IcosahedronGeometry(1.0, 1), this.mat(0x5ea33d, { flatShading: true }), round, ([x, z, k], mm) => mm.compose(p.set(x + 0.5 * k, 3.3 * k, z - 0.3 * k), q, sv.set(k, k, k)));
    mk(new THREE.ConeGeometry(1.4, 3.6, 8), this.mat(0x2f6b3a, { flatShading: true }), pine, ([x, z, k], mm) => mm.compose(p.set(x, 3.2 * k, z), q, sv.set(k, k, k)));
  }

  buildLamps() {
    this.bulbMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xfde68a, emissiveIntensity: 0 });
    const pts = [];
    for (let x = -56; x <= 56; x += 14) for (const z of [STREET_N + 3.2, -STREET_N - 3.2]) pts.push([x, z]);
    const dark = this.mat(0x334155);
    const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.09, 4, 6), dark, pts.length);
    const arms = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.06, 0.8), dark, pts.length);
    const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.26, 10, 8), this.bulbMat, pts.length);
    const m = new THREE.Matrix4();
    pts.forEach(([x, z], i) => {
      const dz = z > 0 ? -0.4 : 0.4;
      m.makeTranslation(x, 2, z); poles.setMatrixAt(i, m);
      m.makeTranslation(x, 4.0, z + dz); arms.setMatrixAt(i, m);
      m.makeTranslation(x, 3.85, z + dz * 2); bulbs.setMatrixAt(i, m);
    });
    poles.castShadow = true;
    this.group.add(poles, arms, bulbs);
  }

  buildAirPlanes() {
    const g = new THREE.PlaneGeometry(1, 1);
    g.rotateX(-Math.PI / 2);
    for (const key in this.town.places) {
      const p = this.town.places[key];
      if (!p.indoor) continue;
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0, depthWrite: false }));
      m.scale.set(p.rect.w - 0.4, 1, p.rect.d - 0.4);
      m.position.set(p.rect.cx, 1.2, p.rect.cz);
      m.visible = false;
      m.renderOrder = 2;
      this.group.add(m);
      this.airPlanes[key] = m;
    }
  }

  setAirLoad(load, enabled) {
    for (const key in this.airPlanes) {
      const m = this.airPlanes[key];
      const e = enabled && load ? (load[key] || 0) : 0;
      const p = this.town.places[key];
      const o = Math.min(0.3, e * p.airFactor * 0.18);
      m.visible = o > 0.01;
      m.material.opacity = o;
    }
  }

  buildBreedingSites() {
    this.breeding = new THREE.Group();
    for (const s of this.town.breedingSites) {
      if (s.r > 3) continue;
      const m = new THREE.Mesh(new THREE.CircleGeometry(s.r, 16), new THREE.MeshStandardMaterial({ color: 0x3f5f4a, roughness: 0.2 }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(s.x, 0.08, s.z);
      this.breeding.add(m);
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.14, 8, 16), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 }));
      tire.rotation.x = Math.PI / 2; tire.position.set(s.x + s.r + 0.3, 0.14, s.z);
      this.breeding.add(tire);
    }
    this.breedingLabel = this.label('Criadero (agua estancada)', -50, 2.6, -4, 2.0, { bg: 'rgba(63,95,74,0.85)' });
    this.breedingLabel.userData.dynamic = true;
    this.breedingLabel.visible = false;
    this.breeding.visible = false;
    this.scene.add(this.breeding);
  }

  setMechanism(mech) {
    this.breeding.visible = mech === 'vector';
    this.breedingLabel.visible = mech === 'vector';
  }

  setRoofsVisible(v, exceptKey) {
    for (const r of this.roofs) r.visible = v && !(exceptKey && r.userData.houseKey === exceptKey);
  }

  setLabelsVisible(v) {
    for (const l of this.labels) if (l !== this.breedingLabel) l.visible = v;
  }

  buildSky() {
    const g = new THREE.SphereGeometry(420, 32, 16);
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    this.sky = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    this.sky.renderOrder = -1;
    this.scene.add(this.sky);
    this.clouds = new THREE.Group();
    this.cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true, transparent: true, opacity: 0.92 });
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 9; k++) {
      const c = new THREE.Group();
      for (let q = 0; q < 5; q++) {
        const b = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + rnd() * 3, 1), this.cloudMat);
        b.position.set(q * 3.5 - 7, rnd() * 1.5, rnd() * 3);
        b.scale.y = 0.55;
        c.add(b);
      }
      c.position.set(-150 + rnd() * 300, 55 + rnd() * 25, -120 + rnd() * 200);
      c.userData.speed = 1 + rnd() * 2;
      this.clouds.add(c);
    }
    this.scene.add(this.clouds);
  }

  paintSky(top, horizon) {
    const pos = this.sky.geometry.attributes.position, col = this.sky.geometry.attributes.color;
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const k = Math.max(0, Math.min(1, (pos.getY(i) / 420) * 1.6));
      c.copy(horizon).lerp(top, k);
      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  }

  buildTraffic() {
    const n = 9;
    const bodyG = new THREE.BoxGeometry(1.8, 0.7, 3.8).translate(0, 0.65, 0);
    const cabG = new THREE.BoxGeometry(1.6, 0.6, 2.0).translate(0, 1.25, -0.2);
    const wheelG = new THREE.CylinderGeometry(0.34, 0.34, 0.25, 12).rotateZ(Math.PI / 2);
    const mk = (g, mat, c) => { const m = new THREE.InstancedMesh(g, mat, c); m.castShadow = true; m.frustumCulled = false; this.scene.add(m); return m; };
    this.carBody = mk(bodyG, new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.4 }), n + 1);
    this.carCab = mk(cabG, new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.6 }), n + 1);
    this.carWheel = mk(wheelG, new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }), (n + 1) * 4);
    this.siren = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.3), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1 }));
    this.siren.visible = false;
    this.scene.add(this.siren);
    const cols = [0xdc2626, 0x2563eb, 0xf8fafc, 0x16a34a, 0xf59e0b, 0x334155, 0x7c3aed, 0x0891b2, 0xe11d48];
    this.cars = [];
    for (let i = 0; i < n; i++) {
      const dir = i % 2 ? 1 : -1;
      const street = i % 4 < 2 ? STREET_N : -STREET_N;
      this.cars.push({ x: -70 + i * 17, z: street + dir * 1.1, dir, speed: 6 + (i % 3) * 1.5, v: 0 });
      this.carBody.setColorAt(i, new THREE.Color(cols[i]));
    }
    this.amb = { x: 95, z: -STREET_N - 1.1, dir: -1, v: 0, active: false };
    this.carBody.setColorAt(n, new THREE.Color(0xffffff));
    this.carBody.instanceColor.needsUpdate = true;
    this._m = new THREE.Matrix4(); this._w = new THREE.Matrix4(); this._o = new THREE.Matrix4();
    this._q = new THREE.Quaternion(); this._e = new THREE.Euler(); this._p = new THREE.Vector3(); this._one = new THREE.Vector3(1, 1, 1);
  }

  updateTraffic(dt, engine, T) {
    if (!this.cars) return;
    const m = this._m;
    const place = (i, car) => {
      this._e.set(0, car.dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0); this._q.setFromEuler(this._e);
      m.compose(this._p.set(car.x, 0, car.z), this._q, this._one);
      this.carBody.setMatrixAt(i, m); this.carCab.setMatrixAt(i, m);
      for (let w = 0; w < 4; w++) {
        this._w.makeRotationX(car.x * 1.4 * car.dir);
        this._w.setPosition(w % 2 ? 0.85 : -0.85, 0.34, w < 2 ? 1.25 : -1.25);
        this.carWheel.setMatrixAt(i * 4 + w, this._o.multiplyMatrices(m, this._w));
      }
    };
    this.cars.forEach((car, i) => {
      let blocked = false;
      if (engine.hash) {
        engine.forNeighbors(car.x + car.dir * 3.2, car.z, 1.8, () => { blocked = true; });
        for (const o of this.cars) if (o !== car && o.z === car.z && (o.x - car.x) * car.dir > 0 && (o.x - car.x) * car.dir < 6) blocked = true;
      }
      car.v = lerpN(car.v, blocked ? 0 : car.speed, Math.min(1, dt * (blocked ? 4 : 1.2)));
      car.x += car.v * car.dir * dt;
      if (car.x > 95) car.x = -95;
      if (car.x < -95) car.x = 95;
      place(i, car);
    });
    const n = this.cars.length;
    const a = this.amb;
    const need = engine.counts && engine.counts.H > 0;
    if (need && !a.active) { a.active = true; a.x = 95; a.parked = false; }
    if (a.active) {
      if (!a.parked) {
        a.x -= 9 * dt;
        if (a.x <= 50) { a.x = 50; a.parked = true; a.parkT = T; }
      } else if (!need && T - a.parkT > 4) { a.x -= 9 * dt; if (a.x < -95) a.active = false; }
      place(n, a);
      this.siren.visible = true;
      this.siren.position.set(a.x, 1.65, a.z);
      this.siren.material.emissiveIntensity = Math.sin(T * (a.parked ? 4 : 12)) > 0.2 ? 2 : 0.2;
    } else {
      m.makeScale(0, 0, 0);
      this.carBody.setMatrixAt(n, m); this.carCab.setMatrixAt(n, m);
      for (let w = 0; w < 4; w++) this.carWheel.setMatrixAt(n * 4 + w, m);
      this.siren.visible = false;
    }
    this.carBody.instanceMatrix.needsUpdate = true;
    this.carCab.instanceMatrix.needsUpdate = true;
    this.carWheel.instanceMatrix.needsUpdate = true;
  }

  /** Animaciones ambientales: tráfico, nubes, chorro de la fuente y superficie del agua. */
  update(dt, engine, T) {
    this.updateTraffic(dt, engine, T);
    for (const c of this.clouds.children) { c.position.x += c.userData.speed * dt; if (c.position.x > 200) c.position.x = -200; }
    if (this.jet) { const k = 1 + Math.sin(T * 6) * 0.08; this.jet.scale.set(k, 1 + Math.sin(T * 3) * 0.15, k); }
    this.tex.water.offset.set(T * 0.02, T * 0.015);
  }

  mergeStatic() {
    const groups = new Map();
    const keep = [];
    for (const m of this.group.children) {
      if (!m.isMesh || m.isInstancedMesh || m.userData.dynamic || m.material.transparent) { keep.push(m); continue; }
      const key = `${m.material.uuid}|${m.castShadow}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(m);
    }
    this.group.clear();
    for (const m of keep) this.group.add(m);
    for (const list of groups.values()) {
      if (list.length === 1) { this.group.add(list[0]); continue; }
      let total = 0;
      const geos = list.map((m) => {
        m.updateMatrix();
        const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrix);
        total += g.attributes.position.count;
        return g;
      });
      const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), uv = new Float32Array(total * 2);
      let o = 0;
      for (const g of geos) {
        pos.set(g.attributes.position.array, o * 3);
        nor.set(g.attributes.normal.array, o * 3);
        if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
        o += g.attributes.position.count;
        g.dispose();
      }
      const merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      merged.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      merged.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, list[0].material);
      mesh.castShadow = list[0].castShadow;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
  }

  /** Ciclo día/noche: devuelve el factor de luz diurna (0 noche – 1 mediodía). */
  setTimeOfDay(hour, sun, hemi, scene) {
    const ang = ((hour - 6) / 12) * Math.PI;
    const elev = Math.sin(ang);
    const day = Math.max(0, Math.min(1, elev * 1.6 + 0.15));
    sun.position.set(Math.cos(ang) * 80, Math.max(10, elev * 90), 45);
    sun.intensity = 0.2 + day * 2.6;
    sun.color.setHSL(0.1, 0.65, 0.55 + day * 0.4);
    hemi.intensity = 0.35 + day * 0.8;
    const key = Math.round(hour * 12);
    if (key !== this._skyKey) {
      this._skyKey = key;
      const top = new THREE.Color(0x0a1022).lerp(new THREE.Color(0x3b82f6), day);
      const horizon = new THREE.Color(0x1e293b).lerp(new THREE.Color(0xbfe3f7), day);
      const dusk = Math.max(0, 1 - Math.abs(hour - 6.5) / 1.2) + Math.max(0, 1 - Math.abs(hour - 18.5) / 1.2);
      horizon.lerp(new THREE.Color(0xf6a26b), Math.min(1, dusk) * 0.6);
      this.paintSky(top, horizon);
      this.horizon = horizon;
      this.cloudMat.color.setScalar(0.35 + day * 0.65);
    }
    scene.background = this.horizon;
    if (scene.fog) scene.fog.color.copy(this.horizon);
    const night = 1 - day;
    this.windowMat.emissiveIntensity = night * 1.5;
    this.bulbMat.emissiveIntensity = night * 2.5;
    return day;
  }
}

  // === Fin de js/render3d/cityRenderer.js ===

  // === Inicio de js/render3d/peopleRenderer.js ===
/**
 * EpiDynamics 6.0 — Personajes humanos estilizados con esqueleto procedural.
 *
 * Cada persona tiene una jerarquía de articulaciones (pelvis → columna → cuello → cabeza,
 * hombros → codos → manos, caderas → rodillas → tobillos → calzado) y un rostro (ojos con
 * parpadeo, nariz y boca expresiva). Cada pieza es UN InstancedMesh para toda la población.
 *
 * Animación: sistema de capas con pesos suavizados (sin saltos):
 *   locomoción (caminar / correr, fase ligada a la distancia recorrida → sin deslizamiento),
 *   sentarse (silla o suelo), conversar, saludar, toser, estornudar, respirar con dificultad,
 *   escalofríos, sujetarse el abdomen, debilidad, reposo en cama y recuperación progresiva.
 *   Cada persona tiene "personalidad": ritmo, amplitud y postura propios.
 *
 * IMPORTANTE: el renderer sólo LEE el motor. Ninguna animación cambia el resultado matemático.
 */

const TOPS = [0x2563eb, 0x0f766e, 0x7c3aed, 0xd97706, 0xdb2777, 0x16a34a, 0xdc2626, 0x0891b2, 0x4f46e5, 0xea580c,
  0x65a30d, 0x9333ea, 0x0284c7, 0xe11d48, 0xf59e0b, 0x334155];
const BOTTOMS = [0x1e293b, 0x334155, 0x1e3a8a, 0x3f3f46, 0x57534e, 0x172554, 0x7c2d12, 0x14532d];
const SKINS = [0xffdbac, 0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0x6b4226, 0xf5d0b5, 0xd9a066];
const HAIRS = [0x1c1917, 0x3f2a1d, 0x6b4423, 0xa16207, 0x7c2d12, 0x111827, 0xd6a75c, 0x4b3621];
const SHOES = [0x111827, 0x7c2d12, 0xf8fafc, 0x1e40af, 0x52525b, 0x991b1b];
const RING_COLORS = [0x38bdf8, 0xfbbf24, 0xef4444, 0x10b981, 0x94a3b8, 0xa855f7];
const GOWN = 0xbfe3f5, COAT = 0xf8fafc;

function drawIcon(type) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const circle = (fill, stroke = '#ffffff') => {
    x.beginPath(); x.arc(64, 64, 54, 0, Math.PI * 2);
    x.fillStyle = fill; x.fill(); x.lineWidth = 8; x.strokeStyle = stroke; x.stroke();
  };
  x.lineCap = 'round'; x.lineJoin = 'round';
  if (type === 'E') {
    circle('#f59e0b');
    x.fillStyle = '#fff'; x.font = '900 78px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('?', 64, 70);
  } else if (type === 'I') {
    circle('#dc2626');
    x.strokeStyle = '#fff'; x.lineWidth = 7;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      x.beginPath(); x.moveTo(64 + Math.cos(a) * 20, 64 + Math.sin(a) * 20); x.lineTo(64 + Math.cos(a) * 36, 64 + Math.sin(a) * 36); x.stroke();
      x.beginPath(); x.arc(64 + Math.cos(a) * 38, 64 + Math.sin(a) * 38, 5, 0, Math.PI * 2); x.fillStyle = '#fff'; x.fill();
    }
    x.beginPath(); x.arc(64, 64, 20, 0, Math.PI * 2); x.fillStyle = '#fff'; x.fill();
  } else if (type === 'H') {
    circle('#ffffff', '#dc2626');
    x.fillStyle = '#dc2626'; x.fillRect(52, 28, 24, 72); x.fillRect(28, 52, 72, 24);
  } else if (type === 'R') {
    circle('#059669');
    x.strokeStyle = '#fff'; x.lineWidth = 14;
    x.beginPath(); x.moveTo(38, 66); x.lineTo(56, 84); x.lineTo(92, 44); x.stroke();
  } else if (type === 'V') {
    circle('#7c3aed');
    x.fillStyle = '#fff';
    x.beginPath(); x.moveTo(64, 26); x.lineTo(94, 38); x.quadraticCurveTo(94, 84, 64, 102); x.quadraticCurveTo(34, 84, 34, 38); x.closePath(); x.fill();
    x.strokeStyle = '#7c3aed'; x.lineWidth = 9;
    x.beginPath(); x.moveTo(50, 64); x.lineTo(61, 75); x.lineTo(80, 52); x.stroke();
  } else if (type === 'D') {
    x.beginPath(); x.arc(64, 64, 54, 0, Math.PI * 2); x.fillStyle = 'rgba(30,41,59,0.85)'; x.fill();
    x.fillStyle = '#f8fafc'; x.fillRect(52, 58, 24, 42);
    x.beginPath(); x.ellipse(64, 44, 9, 15, 0, 0, Math.PI * 2); x.fillStyle = '#fbbf24'; x.fill();
    x.beginPath(); x.ellipse(64, 47, 4, 8, 0, 0, Math.PI * 2); x.fillStyle = '#fff7ed'; x.fill();
  } else if (type === 'Q') {
    circle('#0ea5e9');
    x.fillStyle = '#fff';
    x.beginPath(); x.moveTo(64, 30); x.lineTo(98, 60); x.lineTo(30, 60); x.closePath(); x.fill();
    x.fillRect(40, 58, 48, 38);
    x.fillStyle = '#0ea5e9'; x.fillRect(57, 72, 14, 24);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function radialTexture(rgb) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, `rgba(${rgb},0.55)`);
  g.addColorStop(0.7, `rgba(${rgb},0.2)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const hash = (i, k) => {
  let h = (i * 374761393 + k * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const lerp = (a, b, k) => a + (b - a) * k;
const angleDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };

const PARTS = ['shoe', 'lowerLeg', 'upperLeg', 'pelvis', 'torso', 'neck', 'head', 'nose', 'eye', 'mouth',
  'hairCap', 'upperArm', 'forearm', 'hand'];
const PAIRED = { shoe: 2, lowerLeg: 2, upperLeg: 2, eye: 2, upperArm: 2, forearm: 2, hand: 2 };

class PeopleRenderer {
  constructor(scene) {
    this.scene = scene;
    this.capacity = 0;
    this.meshes = null;
    this.zero = new THREE.Matrix4().makeScale(0, 0, 0);
    this.color = new THREE.Color();
    this.iconTypes = ['E', 'I', 'H', 'R', 'V', 'D', 'Q'];
    this.iconTex = {};
    for (const t of this.iconTypes) this.iconTex[t] = drawIcon(t);
    this.effects = [];
    this.puffs = [];
    this.fx = [];
    this.seenTransmissions = new WeakSet();
    this.selectedId = -1;
    this.M = {};
    for (const k of ['root', 'pelvis', 'spine', 'head', 'hipL', 'hipR', 'kneeL', 'kneeR',
      'shL', 'shR', 'elL', 'elR', 'out', 'loc']) this.M[k] = new THREE.Matrix4();
    this.E = new THREE.Euler();
    this.Q = new THREE.Quaternion();
    this.V = new THREE.Vector3();
    this.ONE = new THREE.Vector3(1, 1, 1);
    this.SV = new THREE.Vector3();
    this.iconPos = new THREE.Vector3();
    this.iconScale = new THREE.Vector3();
    this.iconMat = new THREE.Matrix4();
    this.buildShared();
  }

  buildShared() {
    const S = this.scene;
    const limb = (r, L) => new THREE.CapsuleGeometry(r, Math.max(0.01, L - 2 * r), 3, 7).translate(0, -L / 2, 0);
    const torsoProfile = [
      [0.0, 0.0], [0.135, 0.0], [0.15, 0.06], [0.145, 0.18], [0.16, 0.3], [0.185, 0.42], [0.18, 0.48], [0.12, 0.535], [0.0, 0.545]
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const torso = new THREE.LatheGeometry(torsoProfile, 12).scale(1, 1, 0.66);
    torso.computeVertexNormals();
    this.geo = {
      shoe: new THREE.CapsuleGeometry(0.052, 0.13, 2, 6).rotateX(Math.PI / 2).scale(1, 0.62, 1).translate(0, 0, 0.035),
      lowerLeg: limb(0.058, 0.44),
      upperLeg: limb(0.074, 0.45),
      pelvis: new THREE.CapsuleGeometry(0.14, 0.05, 3, 9).scale(1, 0.8, 0.7),
      torso,
      neck: new THREE.CylinderGeometry(0.048, 0.055, 0.1, 7, 1, true).translate(0, 0.05, 0),
      head: new THREE.SphereGeometry(0.135, 14, 10).scale(0.95, 1.05, 1),
      nose: new THREE.SphereGeometry(0.022, 5, 4),
      eye: new THREE.SphereGeometry(0.019, 5, 4),
      mouth: new THREE.BoxGeometry(0.055, 0.014, 0.012),
      hairCap: new THREE.SphereGeometry(0.145, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.56).translate(0, 0.012, -0.012),
      upperArm: limb(0.054, 0.29),
      forearm: limb(0.047, 0.27),
      hand: new THREE.SphereGeometry(0.047, 6, 5).scale(0.85, 1.05, 0.7),
      skirt: new THREE.CylinderGeometry(0.15, 0.27, 0.4, 12, 1, true).translate(0, -0.18, 0),
      hairLong: new THREE.CapsuleGeometry(0.11, 0.18, 3, 8).scale(1.15, 1, 0.55).translate(0, -0.08, -0.085),
      hairBun: new THREE.SphereGeometry(0.06, 7, 5),
      mask: new THREE.SphereGeometry(0.142, 14, 8, Math.PI * 0.2, Math.PI * 0.6, Math.PI * 0.5, Math.PI * 0.28),
      backpack: new THREE.BoxGeometry(0.26, 0.3, 0.12),
      stool: new THREE.CylinderGeometry(0.17, 0.15, 0.45, 8).translate(0, 0.225, 0),
      cap: new THREE.CylinderGeometry(0.15, 0.15, 0.06, 10),
      ring: new THREE.RingGeometry(0.36, 0.5, 28).rotateX(-Math.PI / 2),
      zone: new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2),
      icon: new THREE.PlaneGeometry(0.62, 0.62),
      mosq: this.mosquitoGeometry(),
      puff: new THREE.SphereGeometry(0.25, 8, 6),
      droplet: new THREE.SphereGeometry(0.06, 6, 5),
      pulse: new THREE.RingGeometry(0.75, 0.9, 32).rotateX(-Math.PI / 2),
      aerosol: new THREE.SphereGeometry(0.07, 6, 5)
    };
    const std = (o = {}) => new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0, ...o });
    this.mats = {
      body: std(),
      face: new THREE.MeshStandardMaterial({ color: 0x1f1410, roughness: 0.3 }),
      mouth: new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.6 }),
      mask: std({ color: 0xe0f2fe, roughness: 0.9, side: THREE.DoubleSide }),
      stool: std({ color: 0x92400e }),
      ring: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85, depthWrite: false }),
      zone: new THREE.MeshBasicMaterial({ map: radialTexture('239,68,68'), transparent: true, depthWrite: false }),
      mosq: new THREE.MeshStandardMaterial({ roughness: 0.5, side: THREE.DoubleSide }),
      puff: new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.38, depthWrite: false }),
      droplet: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85, depthWrite: false }),
      pulse: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }),
      aerosol: new THREE.MeshBasicMaterial({ color: 0xfca5a5, transparent: true, opacity: 0.45, depthWrite: false }),
      sel: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false })
    };
    this.selRing = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32).rotateX(-Math.PI / 2), this.mats.sel);
    this.selRing.visible = false;
    this.selRing.renderOrder = 4;
    S.add(this.selRing);

    this.lineGeo = new THREE.BufferGeometry();
    this.linePos = new Float32Array(6 * 3000);
    this.lineCol = new Float32Array(6 * 3000);
    this.lineGeo.setAttribute('position', new THREE.BufferAttribute(this.linePos, 3));
    this.lineGeo.setAttribute('color', new THREE.BufferAttribute(this.lineCol, 3));
    this.lines = new THREE.LineSegments(this.lineGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }));
    this.lines.frustumCulled = false;
    this.lines.renderOrder = 6;
    S.add(this.lines);

    const pool = (geo, mat, n, order = 5) => {
      const m = new THREE.InstancedMesh(geo, mat, n);
      m.count = 0; m.frustumCulled = false; m.renderOrder = order;
      S.add(m);
      return m;
    };
    this.puffMesh = pool(this.geo.puff, this.mats.puff, 300);
    this.mosqMesh = pool(this.geo.mosq, this.mats.mosq, 3200, 1);
    this.dropMesh = pool(this.geo.droplet, this.mats.droplet, 900, 6);
    this.pulseMesh = pool(this.geo.pulse, this.mats.pulse, 200, 6);
    this.aeroMesh = pool(this.geo.aerosol, this.mats.aerosol, 900, 2);
  }

  mosquitoGeometry() {
    const parts = [
      new THREE.CapsuleGeometry(0.018, 0.09, 3, 6).rotateX(Math.PI / 2),
      new THREE.PlaneGeometry(0.09, 0.03).rotateX(-Math.PI / 2).rotateY(0.5).translate(0.045, 0.012, -0.005),
      new THREE.PlaneGeometry(0.09, 0.03).rotateX(-Math.PI / 2).rotateY(-0.5).translate(-0.045, 0.012, -0.005),
      new THREE.BoxGeometry(0.11, 0.004, 0.004).translate(0, -0.02, 0.01)
    ].map((g) => g.toNonIndexed());
    let n = 0;
    for (const g of parts) n += g.attributes.position.count;
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
    let o = 0;
    for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    return merged;
  }

  allocate(n, shadows) {
    if (this.meshes) for (const k in this.meshes) { this.scene.remove(this.meshes[k]); this.meshes[k].dispose(); }
    if (this.icons) for (const k in this.icons) { this.scene.remove(this.icons[k]); this.icons[k].dispose(); }
    this.capacity = n;
    const mk = (geo, material, count, shadow = true, colored = true) => {
      const m = new THREE.InstancedMesh(geo, material, Math.max(1, count));
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.castShadow = shadow && shadows;
      m.frustumCulled = false;
      if (colored) m.setColorAt(0, this.color.set(0xffffff));
      this.scene.add(m);
      return m;
    };
    this.meshes = {};
    for (const p of PARTS) {
      const mat = p === 'eye' ? this.mats.face : p === 'mouth' ? this.mats.mouth : this.mats.body;
      const small = ['eye', 'mouth', 'nose'].includes(p);
      this.meshes[p] = mk(this.geo[p], mat, n * (PAIRED[p] || 1), !small, !['eye', 'mouth'].includes(p));
    }
    this.meshes.skirt = mk(this.geo.skirt, new THREE.MeshStandardMaterial({ roughness: 0.7, side: THREE.DoubleSide }), n);
    this.meshes.hairLong = mk(this.geo.hairLong, this.mats.body, n);
    this.meshes.hairBun = mk(this.geo.hairBun, this.mats.body, n);
    this.meshes.cap = mk(this.geo.cap, this.mats.body, n);
    this.meshes.mask = mk(this.geo.mask, this.mats.mask, n, false, false);
    this.meshes.backpack = mk(this.geo.backpack, this.mats.body, n);
    this.meshes.stool = mk(this.geo.stool, this.mats.stool, n, true, false);
    this.meshes.ring = mk(this.geo.ring, this.mats.ring, n, false);
    this.meshes.zone = mk(this.geo.zone, this.mats.zone, n, false, false);
    this.meshes.ring.renderOrder = 3;
    this.meshes.zone.renderOrder = 1;
    this.icons = {};
    for (const t of this.iconTypes) {
      const m = mk(this.geo.icon, new THREE.MeshBasicMaterial({ map: this.iconTex[t], transparent: true, depthWrite: false }), n, false, false);
      m.renderOrder = 7;
      this.icons[t] = m;
    }
    this.look = [];
    this.anim = [];
    for (let i = 0; i < n; i++) {
      const r = (k) => hash(i, k);
      const hs = r(2);
      this.look.push({
        top: TOPS[Math.floor(r(3) * TOPS.length)],
        bottom: BOTTOMS[Math.floor(r(4) * BOTTOMS.length)],
        skirtColor: TOPS[Math.floor(r(5) * TOPS.length)],
        skin: SKINS[Math.floor(r(6) * SKINS.length)],
        hair: HAIRS[Math.floor(r(7) * HAIRS.length)],
        shoe: SHOES[Math.floor(r(8) * SHOES.length)],
        capColor: TOPS[Math.floor(r(9) * TOPS.length)],
        dress: r(1) < 0.3,
        hairStyle: hs < 0.4 ? 'long' : hs < 0.52 ? 'bun' : hs < 0.6 ? 'cap' : 'short',
        height: 0.93 + r(10) * 0.14,
        build: 0.92 + r(11) * 0.18
      });
      this.anim.push({
        phase: r(12) * 6.28, visYaw: 0, init: false, prevWalk: 0,
        wWalk: 0, wRun: 0, wSit: 0, wGround: 0, wTalk: 0, wWave: 0, wLean: 0, wAbd: 0, wBreath: 0,
        cough: 0, sneeze: 0, lastCough: -1, blink: r(13) * 5, waveT: 0, wasTalking: false,
        gait: 0.85 + r(14) * 0.3, swing: 0.75 + r(15) * 0.5, posture: (r(16) - 0.5) * 0.08,
        idleSeed: r(17) * 100, lastKey: '', deathShown: false
      });
    }
  }

  setShadows(on) {
    if (!this.meshes) return;
    for (const k of PARTS) if (!['eye', 'mouth', 'nose'].includes(k)) this.meshes[k].castShadow = on;
  }

  refreshColors(a, i, engine) {
    const ill = a.state === STATES.I;
    const recovering = a.state === STATES.R && engine.t - a.stateSince < 2;
    const staff = a.occupation === 'hospital' && a.role === 'adult';
    const key = `${a.state}|${a.bedIdx >= 0}|${recovering}`;
    if (this.anim[i].lastKey === key) return false;
    this.anim[i].lastKey = key;
    const L = this.look[i], M = this.meshes, c = this.color, sym = engine.profile.symptoms;
    c.set(L.skin);
    if (ill) {
      if (sym.includes('jaundice')) c.lerp(new THREE.Color(0xe5d33b), 0.55);
      else if (sym.includes('rash')) c.lerp(new THREE.Color(0xd9534f), 0.38);
      else c.lerp(new THREE.Color(0xf3b0a8), 0.22);
    }
    for (const p of ['head', 'neck', 'nose']) M[p].setColorAt(i, c);
    M.hand.setColorAt(i * 2, c); M.hand.setColorAt(i * 2 + 1, c);
    const gown = a.bedIdx >= 0;
    const top = gown ? GOWN : staff ? COAT : L.top;
    c.set(top);
    M.torso.setColorAt(i, c);
    M.upperArm.setColorAt(i * 2, c); M.upperArm.setColorAt(i * 2 + 1, c);
    M.forearm.setColorAt(i * 2, c); M.forearm.setColorAt(i * 2 + 1, c);
    c.set(gown ? GOWN : L.dress ? L.skin : L.bottom);
    M.upperLeg.setColorAt(i * 2, c); M.upperLeg.setColorAt(i * 2 + 1, c);
    M.lowerLeg.setColorAt(i * 2, c); M.lowerLeg.setColorAt(i * 2 + 1, c);
    M.pelvis.setColorAt(i, c.set(gown ? GOWN : L.dress ? L.skirtColor : L.bottom));
    M.skirt.setColorAt(i, c.set(L.skirtColor));
    c.set(a.role === 'elder' ? 0xd4d4d4 : L.hair);
    M.hairCap.setColorAt(i, c); M.hairLong.setColorAt(i, c); M.hairBun.setColorAt(i, c);
    M.cap.setColorAt(i, c.set(L.capColor));
    M.shoe.setColorAt(i * 2, c.set(L.shoe)); M.shoe.setColorAt(i * 2 + 1, c);
    M.backpack.setColorAt(i, c.set(L.skirtColor));
    M.ring.setColorAt(i, c.set(RING_COLORS[a.state]));
    return true;
  }

  joint(out, parent, tx, ty, tz, rx = 0, ry = 0, rz = 0) {
    this.E.set(rx, ry, rz, 'YXZ');
    this.Q.setFromEuler(this.E);
    this.M.loc.compose(this.V.set(tx, ty, tz), this.Q, this.ONE);
    return out.multiplyMatrices(parent, this.M.loc);
  }

  /** Coloca una pieza (índice idx) relativa a una articulación. */
  put(mesh, idx, parent, tx, ty, tz, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    this.E.set(rx, ry, rz, 'YXZ');
    this.Q.setFromEuler(this.E);
    this.M.loc.compose(this.V.set(tx, ty, tz), this.Q, this.SV.set(sx, sy, sz));
    mesh.setMatrixAt(idx, this.M.out.multiplyMatrices(parent, this.M.loc));
  }

  update(engine, opts) {
    const agents = engine.agents;
    if (!this.meshes || this.capacity !== agents.length) this.allocate(agents.length, opts.shadows && agents.length <= 500);
    const M = this.meshes, MX = this.M;
    const sym = engine.profile.symptoms;
    const mech = engine.mechanism;
    const T = opts.timeReal;
    const dt = Math.min(0.1, Math.max(0.001, opts.dtReal || 0.016));
    const k5 = 1 - Math.exp(-dt * 5), k9 = 1 - Math.exp(-dt * 9);
    const camQ = opts.camera.quaternion;
    const iconCount = {};
    for (const t of this.iconTypes) iconCount[t] = 0;
    let colorsChanged = false;
    const cnt = { skirt: 0, hairLong: 0, hairBun: 0, cap: 0, mask: 0, backpack: 0, stool: 0, zone: 0 };
    const zoneR = mech === 'contact' ? 1.5 : 3.0;
    const coughs = sym.includes('cough');
    const { iconPos, iconScale, iconMat } = this;
    const masked = engine.params.maskUsageRate;
    const vis = opts.lod !== 'far';

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const an = this.anim[i];
      const L = this.look[i];
      if (this.refreshColors(a, i, engine)) colorsChanged = true;
      if (a.state === STATES.D) {
        this.hideAgent(i);
        if (!an.deathShown) {
          an.deathShown = true;
          if (T - (opts.startReal || 0) > 0.5) this.effects.push({ x: a.x, z: a.z, t0: T });
        }
        continue;
      }
      an.deathShown = false;
      const ill = a.state === STATES.I;
      const severe = ill && a.severe && engine.t >= a.severeAt;
      const recovering = a.state === STATES.R && engine.t - a.stateSince < 2;
      const scale = (a.role === 'child' ? 0.66 : a.role === 'elder' ? 0.93 : 1.0) * L.height;
      if (!an.init) { an.init = true; an.visYaw = a.yaw; an.prevWalk = a.walkDist; }

      // ---------------- locomoción: fase ligada a la distancia → los pies no patinan
      const dw = Math.max(0, a.walkDist - an.prevWalk);
      an.prevWalk = a.walkDist;
      const speedReal = dw / dt;
      const moving = a.moving && dw > 1e-5 && !a.lying;
      const running = moving && speedReal > 3.2;
      an.wWalk = lerp(an.wWalk, moving ? 1 : 0, k9);
      an.wRun = lerp(an.wRun, running ? 1 : 0, k5);
      const stride = (running ? 2.0 : 1.25) * scale;
      const maxRate = (running ? 3.2 : 2.2) * 2 * Math.PI * an.gait;
      if (moving) an.phase += Math.min((dw / stride) * 2 * Math.PI, maxRate * dt);
      let targetYaw = a.yaw;

      // ---------------- comportamiento en reposo (sólo visual)
      const place = a.placeKey ? engine.town.places[a.placeKey] : null;
      const idle = !moving && !a.lying && !a.traveling;
      let sitChair = false, sitGround = false, talking = false;
      if (idle && place) {
        if ((place.type === 'school' && a.role === 'child') || severe || (place.type === 'house' && hash(i, Math.floor(engine.t * 6)) < 0.45)) sitChair = true;
        else if (place.type === 'park' && hash(i, Math.floor(engine.t * 4) + 7) < 0.5) sitGround = true;
        else if (vis && engine.hash && place.type !== 'well') {
          let best = null, bd = 1.8;
          engine.forNeighbors(a.x, a.z, 1.8, (b, d) => { if (b !== a && d < bd && !b.moving && !b.lying) { bd = d; best = b; } });
          if (best) { talking = true; targetYaw = Math.atan2(best.x - a.x, best.z - a.z); }
        }
      }
      if (talking && !an.wasTalking && hash(i, Math.floor(engine.t * 20)) < 0.5) an.waveT = 1.2; // saludo
      an.wasTalking = talking;
      an.waveT = Math.max(0, an.waveT - dt);
      an.visYaw += angleDiff(an.visYaw, targetYaw) * (1 - Math.exp(-dt * (moving ? 10 : 4)));
      an.wSit = lerp(an.wSit, sitChair ? 1 : 0, k5);
      an.wGround = lerp(an.wGround, sitGround ? 1 : 0, k5);
      an.wTalk = lerp(an.wTalk, talking ? 1 : 0, k5);
      an.wWave = lerp(an.wWave, an.waveT > 0 ? 1 : 0, k9);
      const weak = (ill && (sym.includes('fatigue') || sym.includes('diarrhea'))) || severe;
      an.wLean = lerp(an.wLean, weak ? 1 : recovering ? 0.4 : 0, k5 * 0.6);
      an.wAbd = lerp(an.wAbd, ill && sym.includes('diarrhea') ? 1 : 0, k5);
      an.wBreath = lerp(an.wBreath, severe ? 1 : 0, k5);
      if (coughs && ill && a.coughAt !== an.lastCough) {
        if (an.lastCough >= 0 && !a.lying) {
          const isSneeze = hash(i, Math.floor(a.coughAt * 1000)) < 0.3;
          if (isSneeze) an.sneeze = 1; else an.cough = 1;
          this.spawnPuff(a, an.visYaw, a.uMask < masked, isSneeze);
        }
        an.lastCough = a.coughAt;
      }
      an.cough = Math.max(0, an.cough - dt * 1.5);
      an.sneeze = Math.max(0, an.sneeze - dt * 1.8);

      // ---------------- pose final por capas
      const ph = an.phase;
      const walkAmp = (0.42 + 0.35 * an.wRun) * (weak ? 0.6 : 1);
      const sL = Math.sin(ph), sR = Math.sin(ph + Math.PI);
      const W = an.wWalk;
      let hipL = -sL * walkAmp * W, hipR = -sR * walkAmp * W;
      let kneeL = (0.08 + Math.max(0, Math.sin(ph + 1.9)) * (0.75 + 0.5 * an.wRun)) * W;
      let kneeR = (0.08 + Math.max(0, Math.sin(ph + 1.9 + Math.PI)) * (0.75 + 0.5 * an.wRun)) * W;
      const armA = walkAmp * 0.9 * an.swing * W;
      let shL = sL * armA, shR = sR * armA;
      let elL = -0.25 - 0.45 * an.wRun * W - (weak ? 0.2 : 0), elR = elL;
      let shZL = 0.07, shZR = -0.07;
      const bob = Math.abs(Math.cos(ph)) * (0.025 + 0.04 * an.wRun) * W;
      let lean = an.posture + 0.12 * an.wRun * W + 0.32 * an.wLean + (a.role === 'elder' ? 0.12 : 0);
      let headP = -0.05 * an.wLean, headY = 0, twist = Math.sin(ph) * 0.08 * W;
      let drop = 0;
      const breathRate = an.wBreath > 0.5 ? 4.2 : 1.3;
      const breath = Math.sin(T * breathRate + an.idleSeed) * (0.012 + 0.035 * an.wBreath);
      if (!moving && !talking) headY += Math.sin(T * 0.35 + an.idleSeed) * 0.25; // mirar alrededor
      if (an.wSit > 0.01) {
        const w = an.wSit;
        hipL = lerp(hipL, -1.5, w); hipR = lerp(hipR, -1.5, w);
        kneeL = lerp(kneeL, 1.5, w); kneeR = lerp(kneeR, 1.5, w);
        drop += 0.45 * w;
        shL = lerp(shL, -0.35, w); shR = lerp(shR, -0.35, w);
        elL = lerp(elL, -0.9, w); elR = lerp(elR, -0.9, w);
      }
      if (an.wGround > 0.01) {
        const w = an.wGround;
        hipL = lerp(hipL, -1.45, w); hipR = lerp(hipR, -1.35, w);
        kneeL = lerp(kneeL, 0.15, w); kneeR = lerp(kneeR, 0.5, w);
        drop += 0.8 * w;
        shL = lerp(shL, 0.35, w); shR = lerp(shR, 0.35, w);
        shZL = lerp(shZL, 0.3, w); shZR = lerp(shZR, -0.3, w);
        lean = lerp(lean, -0.12, w);
      }
      if (an.wTalk > 0.01) {
        const w = an.wTalk, g = T * 2.3 + an.idleSeed;
        shR = lerp(shR, -0.45 + Math.sin(g) * 0.25, w);
        elR = lerp(elR, -1.1 + Math.sin(g * 1.7) * 0.35, w);
        shL = lerp(shL, -0.15 + Math.sin(g * 0.8 + 1) * 0.12, w * 0.6);
        headP += Math.sin(g * 1.3) * 0.08 * w;
        headY = lerp(headY, Math.sin(g * 0.5) * 0.15, w);
      }
      if (an.wWave > 0.01) {
        const w = an.wWave;
        shZR = lerp(shZR, -2.6, w);
        shR = lerp(shR, 0, w);
        elR = lerp(elR, -0.3 + Math.sin(T * 12) * 0.35, w);
      }
      if (an.wAbd > 0.01) {
        const w = an.wAbd;
        shL = lerp(shL, -0.55, w); shR = lerp(shR, -0.55, w);
        elL = lerp(elL, -1.35, w); elR = lerp(elR, -1.35, w);
        shZL = lerp(shZL, -0.25, w); shZR = lerp(shZR, 0.25, w);
        lean += 0.15 * w;
      }
      if (an.cough > 0) {
        const c = Math.sin(an.cough * Math.PI);
        const g = Math.min(1, an.cough * 2);
        shR = lerp(shR, -1.25, g); elR = lerp(elR, -2.0, g); shZR = lerp(shZR, 0.35, g);
        lean += 0.35 * c; headP += 0.25 * c;
      }
      if (an.sneeze > 0) {
        const s = an.sneeze;
        const back = s > 0.6 ? (1 - s) / 0.4 : 0;
        const fwd = s <= 0.6 ? Math.sin((s / 0.6) * Math.PI) : 0;
        headP += -0.35 * back + 0.55 * fwd;
        lean += 0.4 * fwd - 0.1 * back;
        shR = lerp(shR, -1.3, 0.8); elR = lerp(elR, -2.0, 0.8);
      }
      let jitter = 0;
      if (ill && sym.includes('chills')) jitter = Math.sin(T * 55 + i) * 0.03;
      if (ill && sym.includes('agitation')) { headY += Math.sin(T * 8 + i) * 0.45; twist += Math.sin(T * 6.5 + i) * 0.12; }
      an.blink -= dt;
      if (an.blink < -0.12) an.blink = 2 + hash(i, Math.floor(T)) * 4;
      const eyeOpen = an.blink < 0 || a.lying ? 0.12 : 1;

      // ---------------- matriz raíz
      const root = MX.root;
      if (a.lying) {
        const bedTop = a.bedIdx >= 0 ? 0.55 : 0.45;
        const yaw = a.bedIdx >= 0 ? 0 : Math.PI / 2;
        this.E.set(0, yaw, 0, 'YXZ'); this.Q.setFromEuler(this.E);
        root.compose(this.V.set(a.x + jitter, bedTop + 0.13 * scale, a.z), this.Q, this.SV.set(scale, scale, scale));
        this.joint(MX.out, root, 0, 0, 0.9, -Math.PI / 2, 0, 0);
        root.copy(MX.out);
        hipL = hipR = kneeL = kneeR = 0; shL = shR = 0.05; elL = elR = -0.15; shZL = 0.12; shZR = -0.12;
        lean = 0; headP = -0.15 + breath * 2; headY = Math.sin(T * 0.4 + i) * 0.2; drop = 0; twist = 0;
      } else {
        this.E.set(0, an.visYaw, 0, 'YXZ'); this.Q.setFromEuler(this.E);
        root.compose(this.V.set(a.x + jitter, 0, a.z), this.Q, this.SV.set(scale * L.build, scale, scale * L.build));
      }
      const pelvisY = 0.93 + (a.lying ? 0 : bob) - drop;
      this.joint(MX.pelvis, root, 0, pelvisY, 0, 0, twist * 0.5, 0);
      M.pelvis.setMatrixAt(i, MX.pelvis);
      this.joint(MX.hipL, MX.pelvis, 0.095, -0.02, 0, hipL, 0, 0.02);
      this.joint(MX.hipR, MX.pelvis, -0.095, -0.02, 0, hipR, 0, -0.02);
      M.upperLeg.setMatrixAt(i * 2, MX.hipL); M.upperLeg.setMatrixAt(i * 2 + 1, MX.hipR);
      this.joint(MX.kneeL, MX.hipL, 0, -0.45, 0, kneeL);
      this.joint(MX.kneeR, MX.hipR, 0, -0.45, 0, kneeR);
      M.lowerLeg.setMatrixAt(i * 2, MX.kneeL); M.lowerLeg.setMatrixAt(i * 2 + 1, MX.kneeR);
      const ground = an.wGround > 0.5 ? -1.2 : 0;
      this.put(M.shoe, i * 2, MX.kneeL, 0, -0.45, 0, -(hipL + kneeL) * 0.8 * (1 - an.wSit) + ground);
      this.put(M.shoe, i * 2 + 1, MX.kneeR, 0, -0.45, 0, -(hipR + kneeR) * 0.8 * (1 - an.wSit) + ground);
      if (L.dress && a.bedIdx < 0) this.put(M.skirt, cnt.skirt++, MX.pelvis, 0, 0.04, 0, 0, 0, 0, 1, 1 - an.wSit * 0.4 - an.wGround * 0.5, 1 + an.wSit * 0.5);
      this.joint(MX.spine, MX.pelvis, 0, 0.04, 0, lean, -twist, 0);
      const chest = 1 + breath;
      this.put(M.torso, i, MX.spine, 0, 0, 0, 0, 0, 0, chest, 1, chest);
      if (a.role === 'child' && !a.lying) this.put(M.backpack, cnt.backpack++, MX.spine, 0, 0.3, -0.16);
      M.neck.setMatrixAt(i, this.joint(MX.out, MX.spine, 0, 0.52, 0));
      this.joint(MX.head, MX.spine, 0, 0.6, 0.01, headP, headY, 0);
      this.put(M.head, i, MX.head, 0, 0.11, 0);
      this.put(M.nose, i, MX.head, 0, 0.09, 0.132);
      this.put(M.eye, i * 2, MX.head, 0.048, 0.135, 0.118, 0, 0, 0, 1, eyeOpen, 1);
      this.put(M.eye, i * 2 + 1, MX.head, -0.048, 0.135, 0.118, 0, 0, 0, 1, eyeOpen, 1);
      const mouthOpen = an.cough > 0 || an.sneeze > 0.1 ? 3.2 : an.wTalk > 0.5 ? 1 + Math.abs(Math.sin(T * 9 + i)) * 1.6 : 1;
      this.put(M.mouth, i, MX.head, 0, 0.045, 0.128, 0, 0, 0, ill || severe ? 0.7 : 1, mouthOpen, 1);
      if (L.hairStyle === 'cap' && a.role !== 'elder' && !a.lying) {
        this.put(M.hairCap, i, MX.head, 0, 0.11, 0, 0, 0, 0, 1, 0.9, 1);
        this.put(M.cap, cnt.cap++, MX.head, 0, 0.215, 0.0, -0.08);
      } else {
        this.put(M.hairCap, i, MX.head, 0, 0.11, 0);
        if (L.hairStyle === 'long' && a.role !== 'elder') this.put(M.hairLong, cnt.hairLong++, MX.head, 0, 0.11, 0);
        if (L.hairStyle === 'bun' || (a.role === 'elder' && L.hairStyle === 'long')) this.put(M.hairBun, cnt.hairBun++, MX.head, 0, 0.25, -0.08);
      }
      if (a.uMask < masked) this.put(M.mask, cnt.mask++, MX.head, 0, 0.1, 0.0);
      this.joint(MX.shL, MX.spine, 0.2, 0.47, 0, shL, 0, shZL);
      this.joint(MX.shR, MX.spine, -0.2, 0.47, 0, shR, 0, shZR);
      M.upperArm.setMatrixAt(i * 2, MX.shL); M.upperArm.setMatrixAt(i * 2 + 1, MX.shR);
      this.joint(MX.elL, MX.shL, 0, -0.29, 0, elL);
      this.joint(MX.elR, MX.shR, 0, -0.29, 0, elR);
      M.forearm.setMatrixAt(i * 2, MX.elL); M.forearm.setMatrixAt(i * 2 + 1, MX.elR);
      this.put(M.hand, i * 2, MX.elL, 0, -0.29, 0);
      this.put(M.hand, i * 2 + 1, MX.elR, 0, -0.29, 0);
      if (an.wSit > 0.6 && !a.lying) {
        this.E.set(0, an.visYaw, 0, 'YXZ'); this.Q.setFromEuler(this.E);
        MX.out.compose(this.V.set(a.x - Math.sin(an.visYaw) * 0.05, 0, a.z - Math.cos(an.visYaw) * 0.05), this.Q, this.SV.set(scale, scale, scale));
        M.stool.setMatrixAt(cnt.stool++, MX.out);
      }
      const pulse = a.state === STATES.E || ill ? 1 + Math.sin(T * 5 + i) * 0.12 : 1;
      MX.out.makeScale(pulse, 1, pulse);
      MX.out.setPosition(a.x, a.lying ? 0.62 : 0.07, a.z);
      M.ring.setMatrixAt(i, MX.out);
      if (opts.showZones && ill && (mech === 'respiratory' || mech === 'contact')) {
        const zr = zoneR * (1 + Math.sin(T * 3 + i) * 0.05);
        MX.out.makeScale(zr, 1, zr); MX.out.setPosition(a.x, 0.09, a.z);
        M.zone.setMatrixAt(cnt.zone++, MX.out);
      }
      let icon = null;
      if (a.bedIdx >= 0 || severe) icon = 'H';
      else if (ill) icon = 'I';
      else if (a.state === STATES.E) icon = 'E';
      else if (a.state === STATES.R && engine.t - a.stateSince < 3) icon = 'R';
      else if (a.state === STATES.V) icon = 'V';
      if (ill && icon === 'I' && a.uIso < engine.params.isolationRate && !a.lying) icon = 'Q';
      if (icon && opts.showIcons !== false) {
        const b2 = Math.sin(T * 2.2 + i) * 0.06;
        if (a.lying) iconPos.set(a.x, 1.5 + b2, a.z);
        else iconPos.set(a.x, (2.1 - drop) * scale + 0.2 + b2, a.z);
        const s = icon === 'V' || icon === 'R' ? 0.8 : 1;
        iconMat.compose(iconPos, camQ, iconScale.set(s, s, s));
        this.icons[icon].setMatrixAt(iconCount[icon]++, iconMat);
      }
    }
    this.effects = this.effects.filter((e) => T - e.t0 < 4);
    for (const e of this.effects) {
      const k = (T - e.t0) / 4;
      iconPos.set(e.x, 1.4 + k * 1.5, e.z);
      const s = 1.2 * (1 - k * 0.6);
      iconMat.compose(iconPos, camQ, iconScale.set(s, s, s));
      this.icons.D.setMatrixAt(iconCount.D++, iconMat);
    }
    for (const k in cnt) M[k].count = cnt[k];
    for (const t of this.iconTypes) { this.icons[t].count = iconCount[t]; this.icons[t].instanceMatrix.needsUpdate = true; }
    for (const k in M) M[k].instanceMatrix.needsUpdate = true;
    if (colorsChanged) for (const k in M) if (M[k].instanceColor) M[k].instanceColor.needsUpdate = true;

    this.updatePuffs(dt);
    this.updateMosquitoes(engine, T);
    this.updateTransmissionFx(engine, opts, T);
    this.updateAerosols(engine, opts, T);
    this.updateSelection(engine, T);
    this.updateLines(engine, opts);
  }

  hideAgent(i) {
    const M = this.meshes, z = this.zero;
    for (const p of ['pelvis', 'torso', 'neck', 'head', 'nose', 'mouth', 'hairCap', 'ring']) M[p].setMatrixAt(i, z);
    for (const p of ['shoe', 'lowerLeg', 'upperLeg', 'eye', 'upperArm', 'forearm', 'hand']) { M[p].setMatrixAt(i * 2, z); M[p].setMatrixAt(i * 2 + 1, z); }
  }

  spawnPuff(a, yaw, masked, sneeze) {
    const n = masked ? 2 : sneeze ? 12 : 6;
    const dirx = Math.sin(yaw), dirz = Math.cos(yaw);
    const v = masked ? 0.3 : sneeze ? 2.0 : 1.1;
    for (let k = 0; k < n && this.puffs.length < 290; k++) {
      this.puffs.push({
        x: a.x + dirx * 0.3, y: 1.5, z: a.z + dirz * 0.3,
        vx: dirx * v + (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.3) * 0.3, vz: dirz * v + (Math.random() - 0.5) * 0.6,
        age: 0, life: masked ? 0.6 : sneeze ? 1.6 : 1.3
      });
    }
  }

  updatePuffs(dt) {
    const m = this.M.out;
    let n = 0;
    this.puffs = this.puffs.filter((p) => (p.age += dt) < p.life);
    for (const p of this.puffs) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      p.vx *= 0.97; p.vz *= 0.97;
      const k = p.age / p.life;
      const s = (0.25 + k * 1.3) * (k > 0.7 ? (1 - k) / 0.3 : 1);
      m.makeScale(s, s, s); m.setPosition(p.x, p.y, p.z);
      this.puffMesh.setMatrixAt(n++, m);
    }
    this.puffMesh.count = n;
    this.puffMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Efectos de transmisión: se generan SÓLO a partir de contagios reales del motor
   * (engine.transmissions). Respiratorio: chorro de gotículas o aerosoles; contacto: pulsos entre
   * ambas personas; mosquito: destello de picadura; agua: gota y onda en quien bebió.
   */
  updateTransmissionFx(engine, opts, T) {
    const A = engine.agents;
    for (const tr of engine.transmissions) {
      if (this.seenTransmissions.has(tr)) continue;
      this.seenTransmissions.add(tr);
      if (engine.t - tr.t > 0.05 || opts.showFx === false) continue;
      this.fx.push({ tr, t0: T, life: tr.route === 'mosquito' || tr.route === 'agua' ? 1.6 : 2.2 });
    }
    this.fx = this.fx.filter((f) => T - f.t0 < f.life);
    const dm = this.dropMesh, pm = this.pulseMesh, m = this.M.out, c = this.color;
    let nd = 0, np = 0;
    const pulse = (x, z, k, col, y = 0.12, big = 1) => {
      if (np >= 200) return;
      const s = (0.4 + k * 1.6) * big;
      m.makeScale(s, 1, s); m.setPosition(x, y, z);
      pm.setMatrixAt(np, m); pm.setColorAt(np, c.set(col).multiplyScalar(1 - k * 0.7)); np++;
    };
    const drop = (x, y, z, s, col) => {
      if (nd >= 900) return;
      m.makeScale(s, s, s); m.setPosition(x, y, z);
      dm.setMatrixAt(nd, m); dm.setColorAt(nd, c.set(col)); nd++;
    };
    for (const f of this.fx) {
      const k = (T - f.t0) / f.life;
      const b = A[f.tr.to];
      if (!b) continue;
      const a = A[f.tr.from];
      const route = f.tr.route;
      if ((route === 'gotículas' || route === 'aerosol') && a) {
        const N = route === 'aerosol' ? 10 : 16;
        for (let q = 0; q < N; q++) {
          const u = (k * 1.4 + q / N) % 1;
          const jx = Math.sin(q * 12.9 + f.t0) * 0.25, jz = Math.cos(q * 7.3 + f.t0) * 0.25;
          const arcH = route === 'aerosol' ? 0.9 : 0.35;
          drop(lerp(a.x, b.x, u) + jx * Math.sin(u * Math.PI), 1.55 + Math.sin(u * Math.PI) * arcH, lerp(a.z, b.z, u) + jz * Math.sin(u * Math.PI),
            route === 'aerosol' ? 0.8 : 1.1, route === 'aerosol' ? 0xfca5a5 : 0xbae6fd);
        }
        pulse(b.x, b.z, k, 0xf59e0b);
      } else if ((route === 'contacto' || route === 'hogar') && a) {
        pulse(a.x, a.z, k, 0xf97316);
        pulse(b.x, b.z, (k + 0.3) % 1, 0xf97316);
        for (let q = 0; q < 6; q++) { const u = (k * 2 + q / 6) % 1; drop(lerp(a.x, b.x, u), 1.1, lerp(a.z, b.z, u), 0.8, 0xfb923c); }
      } else if (route === 'mosquito') {
        pulse(b.x, b.z, k, 0xdc2626, 0.12, 1.2);
        pulse(b.x, b.z, (k + 0.5) % 1, 0xdc2626, 1.4, 0.4);
      } else if (route === 'agua') {
        pulse(b.x, b.z, k, 0x0ea5e9, 0.12, 1.1);
        for (let q = 0; q < 5; q++) drop(b.x + Math.sin(q * 2) * 0.2, 1.6 - ((k * 2 + q * 0.2) % 1) * 1.4, b.z + Math.cos(q * 2) * 0.2, 1.3, 0x38bdf8);
      } else {
        pulse(b.x, b.z, k, 0xf59e0b);
      }
    }
    dm.count = nd; pm.count = np;
    dm.instanceMatrix.needsUpdate = true; pm.instanceMatrix.needsUpdate = true;
    if (dm.instanceColor) dm.instanceColor.needsUpdate = true;
    if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
  }

  /** Aerosoles suspendidos en interiores, proporcionales a la emisión real calculada por el motor. */
  updateAerosols(engine, opts, T) {
    const mesh = this.aeroMesh;
    if (!opts.showAerosols || engine.mechanism !== 'respiratory' || !engine.airLoad) { mesh.count = 0; return; }
    const vent = engine.params.ventilation;
    const m = this.M.out;
    let n = 0, pi = 0;
    for (const key in engine.airLoad) {
      const p = engine.town.places[key];
      pi++;
      if (!p || !p.indoor) continue;
      const load = engine.airLoad[key] * p.airFactor * (engine.profile.airWeight || 0) * (1 - vent);
      const count = Math.min(60, Math.round(load * 14));
      const r = p.rect;
      for (let k = 0; k < count && n < 900; k++) {
        const s1 = hash(pi, k), s2 = hash(pi, k + 99), s3 = hash(pi, k + 199);
        const flow = vent > 0 ? (T * (0.05 + vent * 0.3) + s2) % 1 : s2; // con ventilación el aire se renueva
        const x = r.x0 + 0.4 + (r.w - 0.8) * ((s1 + Math.sin(T * 0.3 + k) * 0.03 + 1) % 1);
        const z = r.z0 + 0.4 + (r.d - 0.8) * flow;
        const y = 0.6 + s3 * 1.8 + Math.sin(T * 0.8 + k) * 0.1;
        m.makeTranslation(x, y, z);
        mesh.setMatrixAt(n++, m);
      }
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
  }

  updateMosquitoes(engine, T) {
    const ms = engine.mosquitoes;
    const mesh = this.mosqMesh;
    const n = Math.min(ms.length, 3200);
    const m = this.M.out, c = this.color;
    for (let i = 0; i < n; i++) {
      const q = ms[i];
      const biting = engine.t - q.biteAt < 0.02;
      const y = biting ? 1.3 : q.y + Math.sin(T * 6 + q.phase) * 0.25;
      const s = biting ? 4.5 : 3.2;
      this.E.set(Math.sin(T * 30 + q.phase) * 0.1, q.phase + T * 1.5, 0, 'YXZ'); this.Q.setFromEuler(this.E);
      m.compose(this.V.set(q.x + Math.sin(T * 9 + q.phase) * 0.15, y, q.z + Math.cos(T * 7 + q.phase) * 0.15), this.Q, this.SV.set(s, s, s));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(q.state === 2 ? 0xdc2626 : q.state === 1 ? 0xf59e0b : 0x27272a));
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }

  updateSelection(engine, T) {
    const a = engine.agents[this.selectedId];
    if (!a || a.state === STATES.D) { this.selRing.visible = false; return; }
    this.selRing.visible = true;
    const s = 1 + Math.sin(T * 4) * 0.1;
    this.selRing.scale.set(s, 1, s);
    this.selRing.position.set(a.x, a.lying ? 0.66 : 0.1, a.z);
  }

  updateLines(engine, opts) {
    const P = this.linePos, C = this.lineCol;
    let n = 0;
    const max = this.linePos.length / 6;
    const push = (x1, y1, z1, x2, y2, z2, r, g, b) => {
      if (n >= max) return;
      const o = n * 6;
      P[o] = x1; P[o + 1] = y1; P[o + 2] = z1; P[o + 3] = x2; P[o + 4] = y2; P[o + 5] = z2;
      C[o] = r; C[o + 1] = g; C[o + 2] = b; C[o + 3] = r; C[o + 4] = g; C[o + 5] = b;
      n++;
    };
    const A = engine.agents;
    const hy = (a) => (a.lying ? 0.9 : 1.7);
    const arc = (a, b, r, g, bl, k = 1) => {
      const segs = 8;
      const d = Math.hypot(b.x - a.x, b.z - a.z);
      let px = a.x, py = hy(a), pz = a.z;
      for (let s = 1; s <= segs; s++) {
        const t = s / segs;
        const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
        const y = hy(a) + (hy(b) - hy(a)) * t + Math.sin(t * Math.PI) * Math.min(4, 0.6 + d * 0.25);
        push(px, py, pz, x, y, z, r * k, g * k, bl * k);
        px = x; py = y; pz = z;
      }
    };
    if (opts.showChains) {
      for (const tr of engine.transmissions) {
        const a = A[tr.from], b = A[tr.to];
        if (!a || !b) continue;
        const k = Math.max(0.25, 1 - (engine.t - tr.t) / 1.5);
        if (tr.route === 'mosquito') arc(a, b, 0.86, 0.15, 0.15, k);
        else arc(a, b, 0.98, 0.75, 0.15, k);
      }
    }
    const sel = A[this.selectedId];
    if (sel && sel.state !== STATES.D) {
      if (sel.infectedBy !== null && A[sel.infectedBy]) arc(A[sel.infectedBy], sel, 0.75, 0.45, 1.0);
      for (const id of sel.secondary) if (A[id]) arc(sel, A[id], 1.0, 0.45, 0.2);
      if (opts.showContacts && engine.hash) {
        engine.forNeighbors(sel.x, sel.z, 2.0, (b) => {
          if (b.id !== sel.id) push(sel.x, hy(sel) - 0.4, sel.z, b.x, hy(b) - 0.4, b.z, 0.2, 0.85, 0.95);
        });
      }
    }
    this.lineGeo.setDrawRange(0, n * 2);
    this.lineGeo.attributes.position.needsUpdate = true;
    this.lineGeo.attributes.color.needsUpdate = true;
  }

  pick(engine, camera, ndcX, ndcY, aspect) {
    const v = new THREE.Vector3();
    let best = -1, bd = 0.0035;
    for (const a of engine.agents) {
      if (a.state === STATES.D) continue;
      v.set(a.x, a.lying ? 0.7 : 1.0, a.z).project(camera);
      if (v.z > 1) continue;
      const dx = (v.x - ndcX) * aspect, dy = v.y - ndcY;
      const d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = a.id; }
    }
    return best;
  }
}

  // === Fin de js/render3d/peopleRenderer.js ===

  // === Inicio de js/render3d/lab3d.js ===
/**
 * Orquestador de la vista 3D: renderer WebGL, cámara, luces, escenario y población.
 * Sólo LEE el estado del motor epidemiológico (separación motor ↔ visualización).
 */

class Lab3D {
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    this.ok = false;
    this.opts = { showZones: true, showChains: true, showContacts: true, showFx: true, showAerosols: true, showIcons: true, roofs: true, shadows: true, follow: false };
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch (e) {
      console.warn('WebGL no disponible, se usará la vista 2D.', e);
      return;
    }
    this.ok = true;
    const r = this.renderer;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.domElement.className = 'lab3d-canvas';
    container.appendChild(r.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x9fd3f0, 160, 380);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.3, 900);
    this.controls = new OrbitCameraControls(this.camera, r.domElement);

    this.hemi = new THREE.HemisphereLight(0xdbeafe, 0x4d6b3a, 0.9);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = -75; sc.right = 75; sc.top = 60; sc.bottom = -60; sc.near = 1; sc.far = 260;
    this.sun.shadow.bias = -0.0005;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    this.city = new CityRenderer(this.scene, engine.town);
    this.people = new PeopleRenderer(this.scene);
    this.lastBedCount = -1;
    this.startReal = performance.now() / 1000;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe(container);
  }

  resize() {
    if (!this.ok) return;
    const w = this.container.clientWidth || 600;
    const h = this.container.clientHeight || 400;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setShadows(on) {
    this.opts.shadows = on;
    this.renderer.shadowMap.enabled = on;
    this.sun.castShadow = on;
    this.people.setShadows(on);
    this.scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  }

  /**
   * Cámara cinematográfica: encuadres predefinidos con transición animada.
   *  overview: vista general · aerial: cenital para analizar la propagación ·
   *  street: a pie de calle · close: primer plano de una persona (síntomas).
   */
  setCameraMode(mode, target) {
    const c = this.controls;
    this.opts.follow = false;
    if (mode === 'overview') c.flyTo(0, 0, 80, 0.9, 0);
    else if (mode === 'aerial') c.flyTo(0, 0, 125, 0.12, 0);
    else if (mode === 'street') c.flyTo(0, 4, 24, 1.28, 0.6);
    else if (mode === 'close' && target) {
      // dentro de un edificio se mira desde arriba (por encima de las paredes)
      const indoor = target.placeKey && /^(house|school|hospital)/.test(target.placeKey);
      if (indoor || target.lying) c.flyTo(target.x, target.z, 9, 0.62, (target.yaw || 0));
      else c.flyTo(target.x, target.z, 7, 1.18, (target.yaw || 0));
    }
    else if (mode === 'event' && target) c.flyTo(target.x, target.z, 15, target.placeKey && /^house/.test(target.placeKey) ? 0.7 : 1.0);
    else if (mode === 'follow' && target) { this.opts.follow = true; c.flyTo(target.x, target.z, 14, 1.05); }
  }

  onEngineReset() {
    this.city.setMechanism(this.engine.mechanism);
    this.lastBedCount = -1;
    this.startReal = performance.now() / 1000;
    this.people.effects = [];
  }

  pick(clientX, clientY) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    return this.people.pick(this.engine, this.camera, x, y, rect.width / rect.height);
  }

  /** Punto del suelo bajo el cursor (para brotes en un lugar). */
  groundPoint(clientX, clientY) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const p = new THREE.Vector3();
    return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p) ? p : null;
  }

  render(dtReal, selectedId) {
    if (!this.ok) return;
    const e = this.engine;
    if (e.beds && e.beds.length !== this.lastBedCount) {
      this.city.setHospitalBeds(e.beds);
      this.lastBedCount = e.beds.length;
    }
    const sel = e.agents[selectedId];
    this.controls.tick(this.opts.follow && sel ? sel : null);
    this.city.setTimeOfDay(e.clockHour, this.sun, this.hemi, this.scene);
    this.city.update(dtReal, e, performance.now() / 1000);
    this.city.setLabelsVisible(this.opts.labels !== false);
    this.city.setRoofsVisible(this.opts.roofs, sel ? sel.homeKey : null);
    this.city.setMemorialCount(e.memorialCount || 0);
    if (e.mechanism === 'water') {
      this.city.setWaterContamination(e.water.map((w) => w / (w + 5)));
    } else this.city.setWaterContamination([0, 0, 0]);
    this.city.setAirLoad(e.mechanism === 'respiratory' ? e.airLoad : null, this.opts.showZones);
    this.people.selectedId = selectedId;
    this.people.update(e, {
      ...this.opts,
      camera: this.camera,
      dtReal,
      timeReal: performance.now() / 1000,
      startReal: this.startReal
    });
    this.renderer.render(this.scene, this.camera);
  }
}

  // === Fin de js/render3d/lab3d.js ===

  // === Inicio de js/render3d/pathogenViewer.js ===
/**
 * Visor 3D de patógenos (ilustraciones conceptuales, NO imágenes de microscopía).
 *
 * Cada agente tiene una forma propia basada en su morfología conocida:
 *   coronavirus (espigas en maza) · paramixovirus pleomórfico (H y F) · influenza (HA + NA) ·
 *   herpesvirus (cápside icosaédrica dentro de la envoltura) · bacilo tuberculoso (pared cerosa, cordones) ·
 *   flavivirus (pequeño, superficie icosaédrica de proteína E) · Plasmodium (esporozoíto + glóbulo rojo) ·
 *   filovirus (filamento curvado) · poxvirus (ladrillo) · rabdovirus (bala) · Vibrio (coma + flagelo polar).
 *
 * También genera miniaturas para las tarjetas de enfermedades.
 */

const fib = (n) => {
  const pts = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    pts.push(new THREE.Vector3(Math.cos(g * i) * r, y, Math.sin(g * i) * r));
  }
  return pts;
};

function std(color, o = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05, ...o });
}

/** Coloca "n" copias de una geometría orientadas hacia fuera sobre una esfera de radio r. */
function spikes(group, geo, mat, r, dirs, scaleFn) {
  const im = new THREE.InstancedMesh(geo, mat, dirs.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), s = new THREE.Vector3();
  dirs.forEach((d, i) => {
    q.setFromUnitVectors(up, d);
    const k = scaleFn ? scaleFn(i) : 1;
    m.compose(d.clone().multiplyScalar(r), q, s.set(k, k, k));
    im.setMatrixAt(i, m);
  });
  group.add(im);
  return im;
}

function bumpySphere(r, detail, amp, seed = 1) {
  const g = new THREE.IcosahedronGeometry(r, detail);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = Math.sin(v.x * 3.1 + seed) * Math.cos(v.y * 2.7 + seed * 2) * Math.sin(v.z * 3.3 + seed * 3);
    v.multiplyScalar(1 + n * amp);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

function buildPathogen(id) {
  const P = getPathogen(id);
  const g = new THREE.Group();
  const main = std(P.color), acc = std(P.accent, { roughness: 0.35 });
  switch (P.model) {
    case 'corona': {
      g.add(new THREE.Mesh(bumpySphere(1, 4, 0.03), main));
      const stalk = new THREE.CylinderGeometry(0.03, 0.05, 0.32, 6).translate(0, 0.16, 0);
      const head = new THREE.SphereGeometry(0.11, 10, 8).scale(1, 0.75, 1).translate(0, 0.36, 0);
      const dirs = fib(70);
      spikes(g, stalk, acc, 0.98, dirs);
      spikes(g, head, acc, 0.98, dirs);
      spikes(g, new THREE.SphereGeometry(0.05, 6, 5), std(0xfef3c7), 1.0, fib(40).map((d) => d.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.3)));
      break;
    }
    case 'paramyxo': {
      const body = new THREE.Mesh(bumpySphere(1, 4, 0.18, 2.3), main);
      body.scale.set(1.15, 0.9, 1);
      g.add(body);
      const dirs = fib(140);
      const rod = new THREE.CylinderGeometry(0.025, 0.025, 0.2, 5).translate(0, 0.1, 0);
      const imH = spikes(g, rod, acc, 0.95, dirs.filter((_, i) => i % 2 === 0));
      const imF = spikes(g, rod, std(0xfffbeb), 0.95, dirs.filter((_, i) => i % 2 === 1), () => 0.8);
      imH.scale.copy(body.scale); imF.scale.copy(body.scale);
      break;
    }
    case 'influenza': {
      g.add(new THREE.Mesh(bumpySphere(1, 4, 0.04, 5), main));
      const dirs = fib(160);
      const ha = new THREE.CylinderGeometry(0.03, 0.04, 0.3, 6).translate(0, 0.15, 0);
      const naStalk = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 5).translate(0, 0.125, 0);
      const naHead = new THREE.BoxGeometry(0.11, 0.06, 0.11).translate(0, 0.27, 0);
      const haDirs = dirs.filter((_, i) => i % 5 !== 0), naDirs = dirs.filter((_, i) => i % 5 === 0);
      spikes(g, ha, acc, 0.98, haDirs);
      spikes(g, naStalk, std(0xfef08a), 0.98, naDirs);
      spikes(g, naHead, std(0xfef08a), 0.98, naDirs);
      break;
    }
    case 'herpes': {
      const env = new THREE.Mesh(bumpySphere(1.1, 4, 0.05, 7), std(P.color, { transparent: true, opacity: 0.35, depthWrite: false }));
      g.add(env);
      const teg = new THREE.Mesh(new THREE.SphereGeometry(0.82, 24, 16), std(0xfbcfe8, { transparent: true, opacity: 0.25, depthWrite: false }));
      g.add(teg);
      const cap = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), std(P.accent, { flatShading: true, roughness: 0.3 }));
      g.add(cap);
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.61, 0)), new THREE.LineBasicMaterial({ color: 0xffffff })));
      spikes(g, new THREE.CylinderGeometry(0.02, 0.03, 0.18, 5).translate(0, 0.09, 0), std(0xede9fe), 1.08, fib(90));
      break;
    }
    case 'bacillus': {
      const rod = new THREE.CapsuleGeometry(0.28, 1.9, 8, 16);
      const wax = std(P.color, { roughness: 0.9 });
      for (const [x, y, z, rz, rx] of [[0, 0, 0, 0.25, 0], [0.5, 0.25, 0.2, 0.45, 0.3], [-0.45, -0.2, -0.15, 0.05, -0.2]]) {
        const m = new THREE.Mesh(rod, wax);
        m.position.set(x, y, z); m.rotation.set(rx, 0, rz);
        g.add(m);
      }
      spikes(g, new THREE.SphereGeometry(0.035, 5, 4), std(P.accent), 0.3, fib(60), () => 1);
      break;
    }
    case 'flavi': {
      const body = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), std(P.color, { flatShading: true, roughness: 0.35 }));
      g.add(body);
      // dímeros de proteína E: placas planas en "espina de pescado" sobre la superficie
      const plate = new THREE.BoxGeometry(0.34, 0.05, 0.1);
      const dirs = fib(90);
      const im = new THREE.InstancedMesh(plate, std(P.accent, { roughness: 0.4 }), dirs.length);
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
      dirs.forEach((d, i) => {
        q.setFromUnitVectors(up, d);
        q2.setFromAxisAngle(up, (i % 3) * (Math.PI / 3));
        q.multiply(q2);
        m.compose(d.clone().multiplyScalar(1.0), q, new THREE.Vector3(1, 1, 1));
        im.setMatrixAt(i, m);
      });
      g.add(im);
      break;
    }
    case 'plasmodium': {
      // glóbulo rojo bicóncavo (perfil por revolución) con un trofozoíto en "anillo" dentro
      const pts = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const r = 1.4 * t;
        const h = 0.18 + 0.32 * Math.pow(t, 2) * (1 - Math.pow(t, 6));
        pts.push(new THREE.Vector2(r, h));
      }
      pts.push(new THREE.Vector2(1.42, 0));
      const top = new THREE.LatheGeometry(pts, 40);
      const rbcMat = std(0xdc2626, { roughness: 0.55, side: THREE.DoubleSide });
      const a = new THREE.Mesh(top, rbcMat);
      const b = new THREE.Mesh(top, rbcMat); b.scale.y = -1;
      const rbc = new THREE.Group(); rbc.add(a, b);
      rbc.rotation.x = 1.0;
      rbc.position.set(-0.4, -0.2, 0);
      g.add(rbc);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 10, 30), std(P.color));
      ring.position.set(0.25, 0.35, 0); rbc.add(ring);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), std(0x581c87)); dot.position.set(0.5, 0.36, 0.05); rbc.add(dot);
      // esporozoíto: cuerpo alargado y curvo
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.4, 0.9, 0.4), new THREE.Vector3(1.0, 1.3, 0.2), new THREE.Vector3(1.6, 1.2, -0.1), new THREE.Vector3(2.0, 0.7, -0.2)]);
      const spz = new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.09, 10), std(P.accent === 0xef4444 ? 0xc084fc : P.accent));
      g.add(spz);
      break;
    }
    case 'filo': {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.2, -1.2, 0), new THREE.Vector3(-1.4, 0.4, 0.2), new THREE.Vector3(-0.2, 1.0, 0), new THREE.Vector3(0.9, 0.7, -0.2),
        new THREE.Vector3(1.3, -0.2, 0), new THREE.Vector3(0.9, -0.9, 0.2), new THREE.Vector3(0.2, -0.7, 0.1)
      ]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.2, 14), main));
      const pts = curve.getSpacedPoints(160);
      const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 5, 4), acc, pts.length * 3);
      const m = new THREE.Matrix4();
      let k = 0;
      pts.forEach((p, i) => { for (let j = 0; j < 3; j++) { const a = j * 2.1 + i; m.makeTranslation(p.x + Math.cos(a) * 0.22, p.y + Math.sin(a) * 0.22, p.z + Math.sin(a + 1) * 0.22); im.setMatrixAt(k++, m); } });
      g.add(im);
      g.scale.setScalar(0.75);
      break;
    }
    case 'pox': {
      const box = new THREE.BoxGeometry(1.6, 2.0, 1.0, 10, 12, 6);
      const p = box.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) { // redondear el "ladrillo"
        v.fromBufferAttribute(p, i);
        const n = v.clone().normalize();
        v.lerp(n.multiplyScalar(v.length()), 0.35);
        p.setXYZ(i, v.x, v.y, v.z);
      }
      box.computeVertexNormals();
      g.add(new THREE.Mesh(box, std(P.color, { roughness: 0.6 })));
      for (let k = -4; k <= 4; k++) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.03, 6, 30, Math.PI), acc);
        t.position.set(0, k * 0.2, 0); t.rotation.set(Math.PI / 2, 0, (k % 2) * 0.4);
        t.scale.set(0.95, 0.62, 1);
        g.add(t);
      }
      break;
    }
    case 'rhabdo': {
      const body = new THREE.Group();
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.6, 24, 1, true), std(P.color, { side: THREE.DoubleSide }));
      const capTop = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(P.color));
      capTop.position.y = 0.8;
      const flat = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), std(P.color));
      flat.rotation.x = Math.PI / 2; flat.position.y = -0.8;
      body.add(cyl, capTop, flat);
      const dirs = [];
      for (let i = 0; i < 18; i++) for (let j = 0; j < 9; j++) {
        const a = (i / 18) * Math.PI * 2;
        dirs.push({ p: new THREE.Vector3(Math.cos(a) * 0.55, -0.7 + j * 0.18, Math.sin(a) * 0.55), d: new THREE.Vector3(Math.cos(a), 0, Math.sin(a)) });
      }
      const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.025, 0.03, 0.16, 5).translate(0, 0.08, 0), acc, dirs.length);
      const m = new THREE.Matrix4(), q = new THREE.Quaternion();
      dirs.forEach((o, i) => { q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), o.d); m.compose(o.p, q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, m); });
      body.add(im);
      body.rotation.z = 0.6;
      g.add(body);
      break;
    }
    case 'vibrio': {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-1.0, -0.3, 0), new THREE.Vector3(-0.3, 0.25, 0), new THREE.Vector3(0.5, 0.3, 0), new THREE.Vector3(1.0, -0.1, 0)]);
      const body = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.32, 16), main);
      g.add(body);
      for (const end of [curve.getPoint(0), curve.getPoint(1)]) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), main); c.position.copy(end); g.add(c);
      }
      // flagelo polar ondulante (se anima en tick)
      const fl = [];
      for (let i = 0; i <= 40; i++) fl.push(new THREE.Vector3(1.0 + i * 0.06, -0.1 + Math.sin(i * 0.5) * 0.15, Math.cos(i * 0.5) * 0.1));
      const flag = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(fl), 60, 0.025, 6), acc);
      flag.userData.flagellum = true;
      g.add(flag);
      g.position.x = -0.4;
      break;
    }
    default: {
      g.add(new THREE.Mesh(bumpySphere(1, 3, 0.06, 9), main));
      spikes(g, new THREE.ConeGeometry(0.06, 0.25, 6).translate(0, 0.12, 0), acc, 0.98, fib(60));
    }
  }
  return g;
}

class PathogenViewer {
  constructor(container) {
    this.container = container;
    this.ok = false;
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    } catch (e) { return; }
    this.ok = true;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.domElement.className = 'pathogen-canvas';
    if (container) container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 0.6, 6.2);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(new THREE.HemisphereLight(0xe0f2fe, 0x1e1b4b, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 4, 5); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x67e8f9, 1.8); rim.position.set(-4, -1, -3); this.scene.add(rim);
    this.current = null;
    this.drag = null;
    this.rotY = 0; this.rotX = 0.2;
    if (container) {
      container.addEventListener('pointerdown', (e) => { this.drag = { x: e.clientX, y: e.clientY }; container.setPointerCapture(e.pointerId); });
      container.addEventListener('pointermove', (e) => {
        if (!this.drag) return;
        this.rotY += (e.clientX - this.drag.x) * 0.01; this.rotX += (e.clientY - this.drag.y) * 0.01;
        this.drag = { x: e.clientX, y: e.clientY };
      });
      container.addEventListener('pointerup', () => { this.drag = null; });
      if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe(container);
    }
    this.loop = this.loop.bind(this);
  }

  resize() {
    if (!this.container) return;
    const w = this.container.clientWidth || 300, h = this.container.clientHeight || 300;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  show(id) {
    if (!this.ok) return;
    if (this.current) { this.scene.remove(this.current); this.dispose(this.current); }
    this.current = buildPathogen(id);
    this.scene.add(this.current);
    this.resize();
    if (!this.running) { this.running = true; requestAnimationFrame(this.loop); }
  }

  dispose(obj) {
    obj.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
  }

  loop(t) {
    if (!this.running) return;
    const visible = this.container && this.container.offsetParent !== null;
    if (visible && this.current) {
      if (!this.drag) this.rotY += 0.006;
      this.current.rotation.set(this.rotX, this.rotY, 0);
      this.current.traverse((o) => {
        if (o.userData.flagellum) o.rotation.x = Math.sin(t * 0.008) * 0.3;
      });
      this.current.scale.setScalar(1 + Math.sin(t * 0.0015) * 0.015);
      this.renderer.render(this.scene, this.camera);
    }
    requestAnimationFrame(this.loop);
  }

  /** Miniaturas (dataURL) de todos los patógenos para las tarjetas. */
  thumbnails(ids, w = 220, h = 160) {
    if (!this.ok) return {};
    const out = {};
    const prevSize = new THREE.Vector2();
    this.renderer.getSize(prevSize);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    for (const id of ids) {
      const g = buildPathogen(id);
      g.rotation.set(0.35, 0.6, 0);
      this.scene.add(g);
      this.renderer.render(this.scene, this.camera);
      out[id] = this.renderer.domElement.toDataURL('image/png');
      this.scene.remove(g);
      this.dispose(g);
    }
    this.resize();
    return out;
  }
}

  // === Fin de js/render3d/pathogenViewer.js ===

  // === Inicio de js/render2d/planView.js ===
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

const ROUTE_COLORS = {
  'gotículas': '#7dd3fc', aerosol: '#f87171', contacto: '#fb923c', hogar: '#fdba74',
  mosquito: '#ef4444', agua: '#38bdf8', manual: '#e2e8f0', seed: '#facc15'
};

class PlanView {
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

  // === Fin de js/render2d/planView.js ===

  // === Inicio de js/components/transmissionDiagram.js ===
/**
 * Animación 2D (Canvas) del mecanismo de transmisión de la enfermedad seleccionada:
 *  aerosol / droplets · contacto · mosquito (ciclo humano → mosquito → humano) · agua (pozo contaminado).
 * Es un esquema didáctico: el contagio REAL lo decide el motor epidemiológico.
 */
class TransmissionDiagram {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.kind = 'aerosol';
    this.t0 = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  set(kind) { this.kind = kind; this.t0 = performance.now(); }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.canvas.getBoundingClientRect();
    if (!r.width) return false;
    if (this.canvas.width !== Math.round(r.width * dpr)) {
      this.canvas.width = Math.round(r.width * dpr);
      this.canvas.height = Math.round(r.height * dpr);
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = r.width; this.h = r.height;
    return true;
  }

  person(x, y, color, label, s = 1, sick = false) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.fillStyle = color;
    c.beginPath(); c.arc(0, -34, 11, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.roundRect(-12, -21, 24, 32, 9); c.fill();
    c.fillRect(-10, 9, 8, 22); c.fillRect(2, 9, 8, 22);
    if (sick) { c.fillStyle = '#fff'; c.font = '700 12px system-ui'; c.textAlign = 'center'; c.fillText('🤒', 0, -52); }
    c.restore();
    if (label) {
      c.fillStyle = '#cbd5e1'; c.font = '600 11px system-ui, sans-serif'; c.textAlign = 'center';
      c.fillText(label, x, y + 48 * s);
    }
  }

  caption(text, y) {
    const c = this.ctx;
    c.fillStyle = '#e2e8f0'; c.font = '600 12px system-ui, sans-serif'; c.textAlign = 'center';
    c.fillText(text, this.w / 2, y);
  }

  loop(now) {
    requestAnimationFrame(this.loop);
    if (this.canvas.offsetParent === null || !this.resize()) return;
    const c = this.ctx, W = this.w, H = this.h;
    const t = ((now - this.t0) / 1000) % 6;
    c.clearRect(0, 0, W, H);
    const yb = H * 0.68;
    const A = { x: W * 0.2, y: yb }, B = { x: W * 0.8, y: yb };
    const k = this.kind;
    if (k === 'aerosol' || k === 'droplets') {
      const turned = t > 4;
      this.person(A.x, A.y, '#ef4444', 'Infectado (I)', 1, true);
      this.person(B.x, B.y, turned ? '#f59e0b' : '#38bdf8', turned ? 'Expuesto (E)' : 'Susceptible (S)');
      if (k === 'aerosol') {
        c.strokeStyle = 'rgba(148,163,184,0.5)'; c.setLineDash([5, 5]);
        c.strokeRect(W * 0.08, H * 0.12, W * 0.84, H * 0.72); c.setLineDash([]);
        c.fillStyle = '#94a3b8'; c.font = '11px system-ui'; c.textAlign = 'left';
        c.fillText('Espacio cerrado: el aire compartido acumula aerosoles', W * 0.1, H * 0.1);
      }
      const n = k === 'aerosol' ? 40 : 18;
      for (let i = 0; i < n; i++) {
        const u = ((t / 4) + i / n) % 1;
        if (t > 4.2) break;
        const spread = k === 'aerosol' ? 0.35 : 0.12;
        const x = A.x + 16 + (B.x - A.x - 30) * u;
        const y = A.y - 36 + Math.sin(u * Math.PI + i) * H * spread * u - (k === 'aerosol' ? Math.sin(i) * 12 * u : 0);
        c.fillStyle = k === 'aerosol' ? `rgba(252,165,165,${0.8 - u * 0.4})` : `rgba(186,230,253,${0.9 - u * 0.5})`;
        c.beginPath(); c.arc(x, y, k === 'aerosol' ? 2.2 : 3.5, 0, Math.PI * 2); c.fill();
      }
      this.caption(k === 'aerosol' ? 'Tos / respiración → aerosoles suspendidos → inhalación' : 'Tos o estornudo → gotículas (< 2 m) → mucosas', 18);
    } else if (k === 'contact') {
      const close = Math.min(1, t / 2);
      const ax = A.x + (W * 0.22) * close, bx = B.x - (W * 0.22) * close;
      const turned = t > 4;
      this.person(ax, A.y, '#ef4444', 'Infectado', 1, true);
      this.person(bx, B.y, turned ? '#f59e0b' : '#38bdf8', turned ? 'Expuesto' : 'Susceptible');
      if (t > 2 && t < 4.5) {
        const r = 10 + ((t - 2) * 20) % 30;
        c.strokeStyle = `rgba(249,115,22,${1 - r / 40})`; c.lineWidth = 3;
        c.beginPath(); c.arc((ax + bx) / 2, A.y - 10, r, 0, Math.PI * 2); c.stroke();
      }
      this.caption('Contacto directo con piel, sangre o fluidos (cuidado de enfermos, convivencia)', 18);
    } else if (k === 'mosquito') {
      const C = { x: W * 0.5, y: H * 0.32 };
      const turned = t > 5;
      this.person(A.x, A.y, '#ef4444', 'Humano infectado', 0.9, true);
      this.person(B.x, B.y, turned ? '#f59e0b' : '#38bdf8', turned ? 'Expuesto' : 'Humano sano', 0.9);
      // ciclo: 0-1.5 pica a A, 1.5-3.5 incubación extrínseca, 3.5-5 pica a B
      let mx, my, infected = t > 1.5;
      if (t < 1.5) { const u = t / 1.5; mx = C.x + (A.x - C.x) * u; my = C.y + (A.y - 50 - C.y) * u; }
      else if (t < 3.5) { const u = (t - 1.5) / 2; mx = C.x + Math.cos(u * 6.28) * 30; my = C.y + Math.sin(u * 6.28) * 14; }
      else { const u = Math.min(1, (t - 3.5) / 1.5); mx = C.x + (B.x - C.x) * u; my = C.y + (B.y - 50 - C.y) * u; }
      c.fillStyle = infected ? '#dc2626' : '#27272a';
      c.beginPath(); c.ellipse(mx, my, 9, 4, 0.3, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(226,232,240,0.7)';
      c.beginPath(); c.ellipse(mx - 2, my - 7, 7, 3, -0.6 + Math.sin(now * 0.05) * 0.4, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(mx + 3, my - 7, 7, 3, 0.6 - Math.sin(now * 0.05) * 0.4, 0, Math.PI * 2); c.fill();
      if (t > 1.5 && t < 3.5) { c.fillStyle = '#fcd34d'; c.font = '600 11px system-ui'; c.textAlign = 'center'; c.fillText('Incubación en el mosquito (periodo extrínseco)', C.x, C.y + 34); }
      this.caption('Humano → mosquito → humano: no hay contagio directo entre personas', 18);
    } else if (k === 'water') {
      const Wl = { x: W * 0.5, y: yb + 10 };
      const lv = Math.min(1, Math.max(0, (t - 1) / 2));
      c.fillStyle = '#78716c'; c.beginPath(); c.roundRect(Wl.x - 34, Wl.y - 24, 68, 34, 6); c.fill();
      c.fillStyle = `rgb(${56 + 70 * lv},${189 - 60 * lv},${248 - 190 * lv})`;
      c.beginPath(); c.ellipse(Wl.x, Wl.y - 24, 30, 8, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#cbd5e1'; c.font = '600 11px system-ui'; c.textAlign = 'center'; c.fillText('Pozo / fuente', Wl.x, Wl.y + 28);
      const turned = t > 4.8;
      this.person(A.x, A.y, '#ef4444', 'Infectado contamina', 0.9, true);
      this.person(B.x, B.y, turned ? '#f59e0b' : '#38bdf8', turned ? 'Expuesto' : 'Bebe agua', 0.9);
      if (t > 0.3 && t < 2.5) {
        for (let i = 0; i < 8; i++) {
          const u = ((t - 0.3) / 2.2 + i / 8) % 1;
          c.fillStyle = 'rgba(132,204,22,0.85)';
          c.beginPath(); c.arc(A.x + 20 + (Wl.x - A.x - 30) * u, A.y - 10 + Math.sin(u * 3.14) * -20, 3, 0, Math.PI * 2); c.fill();
        }
      }
      if (t > 3 && t < 4.8) {
        const u = (t - 3) / 1.8;
        c.fillStyle = 'rgba(56,189,248,0.9)';
        c.beginPath(); c.arc(Wl.x + 20 + (B.x - Wl.x - 30) * u, Wl.y - 30 - Math.sin(u * 3.14) * 30, 5, 0, Math.PI * 2); c.fill();
      }
      this.caption('Heces de infectados → agua contaminada (W) → quien bebe se expone', 18);
    }
  }
}

  // === Fin de js/components/transmissionDiagram.js ===

  // === Inicio de js/components/didacticPanel.js ===
/**
 * Panel didáctico: traduce cada evento individual (contagio, fin de incubación,
 * recuperación, fallecimiento, vacunación…) a su significado matemático en el
 * sistema de EDO, y presenta tarjetas de conceptos (R₀, SIR/SEIR/SEIRD,
 * contactos y transmisión, estocástico vs determinista).
 */

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
function contagionMath(ev, engine) {
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

function explainEvent(ev, engine) {
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

class DidacticPanel {
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

  // === Fin de js/components/didacticPanel.js ===

  // === Inicio de js/components/comparisonChart.js ===
/**
 * Gráfica comparativa: simulación de agentes (ESTOCÁSTICA, puntos) frente a la solución RK4
 * de la EDO (DETERMINISTA, líneas) con la MISMA población N y las mismas condiciones iniciales.
 * Incluye título de ejes con unidades, leyenda, marcadores de pico y selección de un día
 * (clic) para revisar la ciudad en ese momento en el mapa 2D.
 */
const COLORS = { S: '#38bdf8', E: '#fbbf24', I: '#ef4444', R: '#10b981', D: '#94a3b8', V: '#a855f7' };
const NAMES = { S: 'Susceptibles', E: 'Expuestos', I: 'Infectados', R: 'Recuperados', D: 'Fallecidos', V: 'Vacunados' };

class ComparisonChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ode = null;
    this.history = [];
    this.N = 1;
    this.day = 0;
    this.series = ['S', 'E', 'I', 'R', 'D', 'V'];
    this.hover = null;
    this.onDayClick = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('mousemove', (e) => { const r = canvas.getBoundingClientRect(); this.hover = e.clientX - r.left; this.render(); });
    canvas.addEventListener('mouseleave', () => { this.hover = null; this.render(); });
    canvas.addEventListener('click', (e) => {
      const r = canvas.getBoundingClientRect();
      const d = this.dayAt(e.clientX - r.left);
      if (d !== null && this.onDayClick) this.onDayClick(d);
    });
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.canvas.getBoundingClientRect();
    this.w = r.width || 600;
    this.h = r.height || 300;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.render();
  }

  setData(ode, history, N, day, offset = 0) {
    this.offset = offset;
    this.ode = ode;
    this.history = history;
    this.N = Math.max(1, N);
    this.day = day;
    this.render();
  }

  get pad() { return { l: 56, r: 14, t: 34, b: 42 }; }
  get maxDay() { return Math.max(30, this.ode ? this.ode.times[this.ode.times.length - 1] + (this.offset || 0) : 30); }
  dayAt(px) {
    const p = this.pad, W = this.w - p.l - p.r;
    const d = Math.round(((px - p.l) / W) * this.maxDay);
    return d >= 0 && d <= this.maxDay ? d : null;
  }

  render() {
    const c = this.ctx;
    if (!c || !this.w) return;
    const light = document.body.classList.contains('light-theme');
    const ink = light ? '#334155' : '#94a3b8';
    c.clearRect(0, 0, this.w, this.h);
    const p = this.pad;
    const W = this.w - p.l - p.r, H = this.h - p.t - p.b;
    if (W <= 0 || H <= 0) return;
    const maxDay = this.maxDay;
    const X = (d) => p.l + (d / maxDay) * W;
    const Y = (v) => p.t + H - (v / this.N) * H;
    c.strokeStyle = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
    c.fillStyle = ink;
    c.font = '11px system-ui, sans-serif';
    c.lineWidth = 1;
    for (let k = 0; k <= 4; k++) {
      const y = p.t + (H * k) / 4;
      c.beginPath(); c.moveTo(p.l, y); c.lineTo(p.l + W, y); c.stroke();
      c.textAlign = 'right';
      c.fillText(`${Math.round(this.N * (1 - k / 4))}`, p.l - 6, y + 4);
    }
    c.textAlign = 'center';
    for (let d = 0; d <= maxDay; d += maxDay > 120 ? 30 : 15) c.fillText(`${d}`, X(d), p.t + H + 15);
    c.font = '600 11px system-ui, sans-serif';
    c.fillText('Tiempo t (días)', p.l + W / 2, this.h - 6);
    c.save(); c.translate(13, p.t + H / 2); c.rotate(-Math.PI / 2); c.fillText(`Personas (N = ${this.N})`, 0, 0); c.restore();

    const has = (k) => (this.ode && this.ode[k] && Math.max(...this.ode[k]) >= this.N * 0.004) || this.history.some((h) => h[k] > 0);
    const shown = this.series.filter(has);
    // EDO: líneas continuas
    if (this.ode) {
      for (const k of shown) {
        const arr = this.ode[k];
        if (!arr) continue;
        c.strokeStyle = COLORS[k]; c.lineWidth = 2.2; c.globalAlpha = 0.85;
        c.beginPath();
        const o = this.offset || 0;
        this.ode.times.forEach((t, i) => (i ? c.lineTo(X(t + o), Y(arr[i])) : c.moveTo(X(t + o), Y(arr[i]))));
        c.stroke();
      }
      c.globalAlpha = 1;
    }
    // Agentes: puntos
    for (const k of shown) {
      c.fillStyle = COLORS[k];
      c.strokeStyle = light ? '#0f172a' : '#0b1020';
      for (const h of this.history) {
        if (h[k] === undefined) continue;
        c.beginPath(); c.arc(X(h.day), Y(h[k]), 3, 0, Math.PI * 2); c.fill(); c.lineWidth = 0.8; c.stroke();
      }
    }
    // marcadores de pico de I
    const mark = (x, y, label, col, dash) => {
      c.strokeStyle = col; c.setLineDash(dash ? [3, 3] : []); c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x, p.t + H); c.stroke(); c.setLineDash([]);
      c.fillStyle = col; c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill();
      c.font = '600 10px system-ui'; c.textAlign = 'left';
      c.fillText(label, Math.min(x + 7, this.w - 120), y - 6);
    };
    if (this.ode) {
      const s = this.ode.summary;
      const o = this.offset || 0;
      mark(X(s.peakDay + o), Y(s.peakInfected), `Pico EDO: ${s.peakInfected} (día ${s.peakDay + o})`, '#fca5a5', true);
    }
    let pa = null;
    for (const h of this.history) if (!pa || h.I > pa.I) pa = h;
    if (pa && pa.I > 0) mark(X(pa.day), Y(pa.I), `Pico agentes: ${pa.I} (día ${pa.day})`, '#f87171', false);
    // día actual
    c.strokeStyle = '#f43f5e'; c.setLineDash([4, 4]);
    c.beginPath(); c.moveTo(X(this.day), p.t); c.lineTo(X(this.day), p.t + H); c.stroke();
    c.setLineDash([]);
    // leyenda
    c.font = '11px system-ui'; c.textAlign = 'left';
    let lx = p.l;
    c.fillStyle = ink; c.fillText('Líneas = EDO (determinista) · Puntos = agentes (estocástico)', lx, 14);
    lx = p.l;
    for (const k of shown) {
      c.fillStyle = COLORS[k];
      c.fillRect(lx, 21, 14, 3);
      c.beginPath(); c.arc(lx + 7, 22.5, 2.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = ink; c.fillText(NAMES[k], lx + 18, 27);
      lx += c.measureText(NAMES[k]).width + 32;
    }
    // lectura bajo el cursor
    if (this.hover !== null && this.ode) {
      const d = this.dayAt(this.hover);
      if (d !== null) {
        const hi = this.history.find((h) => h.day === d);
        const oi = this.ode.times.indexOf(d - (this.offset || 0));
        c.strokeStyle = light ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
        c.beginPath(); c.moveTo(X(d), p.t); c.lineTo(X(d), p.t + H); c.stroke();
        const lines = [`Día ${d}`];
        if (oi >= 0) lines.push(`EDO: I=${this.ode.I[oi].toFixed(1)}  R=${this.ode.R[oi].toFixed(1)}  S=${this.ode.S[oi].toFixed(0)}`);
        if (hi) lines.push(`Agentes: I=${hi.I}  R=${hi.R}  S=${hi.S}`);
        lines.push(hi ? 'Clic: ver la ciudad ese día (mapa 2D)' : '');
        const bx = Math.min(X(d) + 8, this.w - 230);
        c.fillStyle = light ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.94)';
        c.fillRect(bx, p.t + 4, 222, lines.length * 15 + 8);
        c.fillStyle = light ? '#0f172a' : '#f8fafc';
        lines.forEach((t, i) => c.fillText(t, bx + 6, p.t + 18 + i * 15));
      }
    }
  }
}

  // === Fin de js/components/comparisonChart.js ===

  // === Inicio de js/components/diseaseGallery.js ===
/**
 * Selector visual de enfermedades (tarjetas por categoría) y ficha animada del patógeno.
 * Los parámetros epidemiológicos se leen del catálogo original (diseasesData.js) sin cambios.
 */

const GALLERY_GROUPS = [
  { id: 'resp', title: 'Virus y bacterias respiratorias', icon: '🫁', ids: ['covid19_omicron', 'covid19_ancestral', 'sarampion', 'influenza', 'varicela', 'tuberculosis'] },
  { id: 'water', title: 'Bacterias y enfermedades hídricas', icon: '💧', ids: ['colera'] },
  { id: 'vector', title: 'Transmitidas por vectores', icon: '🦟', ids: ['dengue', 'fiebre_amarilla', 'malaria', 'zika'] },
  { id: 'contact', title: 'Contacto directo / fluidos', icon: '🤝', ids: ['ebola', 'mpox', 'rabia'] },
  { id: 'lab', title: 'Laboratorio experimental', icon: '🧪', ids: ['custom_disease'] }
];

class DiseaseGallery {
  constructor(container, { onSelect, thumbs }) {
    this.container = container;
    this.onSelect = onSelect;
    this.thumbs = thumbs || {};
    this.filter = 'all';
    container.addEventListener('click', (e) => {
      const card = e.target.closest('[data-disease]');
      if (card) this.onSelect(card.dataset.disease);
      const chip = e.target.closest('[data-gfilter]');
      if (chip) { this.filter = chip.dataset.gfilter; this.render(this.current); }
    });
  }

  setThumbs(t) { this.thumbs = t; this.render(this.current); }

  render(currentId) {
    this.current = currentId;
    const chips = [{ id: 'all', title: 'Todas', icon: '🌐' }, ...GALLERY_GROUPS].map((g) =>
      `<button class="g-chip ${this.filter === g.id ? 'active' : ''}" data-gfilter="${g.id}">${g.icon} ${g.title}</button>`).join('');
    const groups = GALLERY_GROUPS.filter((g) => this.filter === 'all' || g.id === this.filter).map((g) => `
      <section class="g-group">
        <h3>${g.icon} ${g.title}</h3>
        <div class="g-grid">${g.ids.map((id) => this.card(id)).join('')}</div>
      </section>`).join('');
    this.container.innerHTML = `<div class="g-chips">${chips}</div>${groups}`;
  }

  card(id) {
    const d = DISEASES[id];
    const pg = getPathogen(id);
    const type = PATHOGEN_TYPES[pg.type];
    const mech = MECHANISMS[getDiseaseProfile(d).mechanism];
    const img = this.thumbs[id] ? `<img src="${this.thumbs[id]}" alt="Ilustración conceptual de ${pg.agent}">` : `<div class="g-ph">${type.icon}</div>`;
    return `
      <button class="g-card ${id === this.current ? 'selected' : ''}" data-disease="${id}" title="Ver ficha y simular ${d.name}">
        <div class="g-img" style="--accent:${type.color}">${img}<span class="g-type" style="background:${type.color}">${type.icon} ${type.label}</span></div>
        <div class="g-body">
          <div class="g-name">${d.name}</div>
          <div class="g-agent">${pg.agent}</div>
          <div class="g-mech">${mech.icon} ${mech.name}</div>
          <div class="g-stats">
            <span title="Número reproductivo básico"><b>${d.r0}</b>R₀</span>
            <span title="Periodo de incubación"><b>${d.incubationDays}d</b>Incub.</span>
            <span title="Periodo infeccioso"><b>${d.infectiousDays}d</b>Infecc.</span>
            <span title="Letalidad (CFR)"><b>${(d.fatalityRate * 100).toFixed(d.fatalityRate < 0.01 ? 2 : 1)}%</b>Letal.</span>
          </div>
          <div class="g-model"><span class="badge-tag">${d.modelType}</span></div>
        </div>
      </button>`;
  }
}

/** Ficha/introducción animada del patógeno (modal). */
class PathogenModal {
  constructor(root, viewer, diagram, { onSimulate, onLearn }) {
    this.root = root;
    this.viewer = viewer;
    this.diagram = diagram;
    root.addEventListener('click', (e) => {
      if (e.target === root || e.target.closest('[data-pm="close"]')) this.close();
      if (e.target.closest('[data-pm="simulate"]')) { this.close(); onSimulate(this.id); }
      if (e.target.closest('[data-pm="learn"]')) { this.close(); onLearn(this.id); }
    });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
  }

  open(id) {
    this.id = id;
    const d = DISEASES[id];
    const pg = getPathogen(id);
    const type = PATHOGEN_TYPES[pg.type];
    const prof = getDiseaseProfile(d);
    const mech = MECHANISMS[prof.mechanism];
    const info = this.root.querySelector('.pm-info');
    const beta = d.r0 * (1 / d.infectiousDays) * (1 + d.fatalityRate);
    info.innerHTML = `
      <div class="pm-kicker" style="color:${type.color}">${type.icon} ${type.label} · ${pg.taxonomy}</div>
      <h2>${d.name}</h2>
      <div class="pm-agent">Agente: <b>${pg.agent}</b></div>
      <div class="pm-facts">
        <div><span>Tamaño</span><b>${pg.size}</b></div>
        <div><span>Genoma</span><b>${pg.genome}</b></div>
        <div><span>Incubación</span><b>${d.incubationDays} días</b></div>
        <div><span>Periodo infeccioso</span><b>${d.infectiousDays} días</b></div>
        <div><span>R₀</span><b>${d.r0}</b></div>
        <div><span>Letalidad</span><b>${(d.fatalityRate * 100).toFixed(2)} %</b></div>
        <div><span>Modelo</span><b>${d.modelType}</b></div>
        <div><span>Órganos / sistemas</span><b>${pg.organs}</b></div>
      </div>
      <h4>🔬 Estructura</h4>
      <ul>${pg.structure.map((s) => `<li>${s}</li>`).join('')}</ul>
      <h4>${mech.icon} Transmisión: ${mech.name}</h4>
      <p>${d.transmission}.${pg.vector ? ` <b>Vector:</b> ${pg.vector}` : ''}</p>
      <h4>🩺 Síntomas principales</h4>
      <p>${d.clinicalNotes}</p>
      ${pg.note ? `<p class="pm-note">ℹ️ ${pg.note}</p>` : ''}
      <h4>📐 Parámetros del modelo</h4>
      <div class="pm-tex">${tex(`\\beta = R_0(\\gamma+\\mu) = ${d.r0}\\left(\\tfrac{1}{${d.infectiousDays}} + ${(d.fatalityRate / d.infectiousDays).toFixed(5)}\\right) \\approx ${beta.toFixed(3)}\\ \\text{día}^{-1}`)}</div>`;
    this.root.querySelector('.pm-viewer-caption').textContent = `Ilustración conceptual (no es una imagen de microscopía) · ${pg.size}`;
    this.root.classList.add('open');
    this.root.querySelector('.pm-card').classList.remove('anim'); void this.root.offsetWidth;
    this.root.querySelector('.pm-card').classList.add('anim');
    this.viewer && this.viewer.show(id);
    this.diagram && this.diagram.set(pg.transmissionVisual);
  }

  close() { this.root.classList.remove('open'); }
}

  // === Fin de js/components/diseaseGallery.js ===

  // === Inicio de js/components/labController.js ===
/**
 * Controlador del laboratorio virtual (v6): une el motor de agentes con la vista 3D,
 * el mapa 2D analítico, el HUD, la ficha individual, la cámara cinematográfica,
 * la "cámara de contagios" y el panel didáctico. Contiene el único bucle de animación.
 */

const DAYS_PER_SECOND_1X = 1 / 30; // a 1x, un día simulado dura 30 s reales

const ROLE = { child: 'Niño/a', adult: 'Adulto/a', elder: 'Persona mayor' };
const PLACE_ICON = { house: '🏠', school: '🏫', plaza: '⛲', market: '🛒', hospital: '🏥', park: '🌳', well: '🪣' };
const STATE_ICON = ['🙂', '❓', '🤒', '💚', '🕯️', '🛡️'];
const ROUTE_NAME = { 'gotículas': 'Gotículas', aerosol: 'Aerosoles', contacto: 'Contacto directo', hogar: 'Convivencia en el hogar', mosquito: 'Picadura de mosquito', agua: 'Agua contaminada', manual: 'Usuario', seed: 'Caso índice' };

class LabController {
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

  // === Fin de js/components/labController.js ===

  // === Inicio de js/components/learnTour.js ===
/**
 * Modo "APRENDER LA EPIDEMIA": recorrido guiado de 10 etapas sobre la simulación REAL.
 * Cada etapa: acción en la ciudad (cámara, velocidad, brote) · explicación breve · fórmula ·
 * variables · pregunta de comprensión · botones Repetir / Continuar.
 * Lo que se ve son eventos reales del motor: el recorrido sólo controla la cámara y el tiempo.
 */

const f = (x, d = 2) => Number(x).toLocaleString('es-CO', { maximumFractionDigits: d });

class LearnTour {
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

  // === Fin de js/components/learnTour.js ===

  // === Inicio de js/app.js ===
/**
 * Controlador principal — EpiDynamics 6.0
 * Mate 4 - Modelado Matemático y Ecuaciones Diferenciales
 *
 *   - Modelo DETERMINISTA: EDO (SIR, SIS, SEIR, SIRD, SEIRD) con RK4 (epidemicModels.js).
 *   - Modelo ESTOCÁSTICO: agentes 3D (simulation/epiEngine.js + render3d/).
 *   Ambos comparten parámetros; sus resultados se muestran SIEMPRE por separado.
 *
 * Interfaz por módulos: Inicio · Enfermedades · Simulación 3D · Mapa 2D · Modelos ·
 * Gráficas · EDO vs agentes · Aprender.
 */


const MODULES = ['home', 'diseases', 'sim', 'map', 'models', 'charts', 'compare', 'learn'];

class App {
  constructor() {
    this.currentCategory = 'all';
    this.currentDiseaseId = 'covid19_ancestral';
    this.currentDisease = DISEASES[this.currentDiseaseId];
    this.params = {
      modelType: this.currentDisease.modelType,
      population: 100000,
      initialInfected: 10,
      initialExposed: 20,
      initialRecovered: 0,
      r0: this.currentDisease.r0,
      incubationDays: this.currentDisease.incubationDays,
      infectiousDays: this.currentDisease.infectiousDays,
      fatalityRate: this.currentDisease.fatalityRate,
      hospitalCapacityRate: this.currentDisease.hospitalizationRate || 0.05,
      days: 120,
      dt: 0.1,
      quarantineStartDay: 999,
      quarantineEfficacy: 0.6,
      vaccinationRateDaily: 0.0,
      vaccineEfficacy: 0.85,
      socialDistancingRate: 0.0,
      maskUsageRate: 0.0,
      isolationRate: 0.0,
      ventilation: 0.0,
      vectorControl: 0.0,
      waterTreatment: 0.0
    };
    this.agentConfig = { population: 300, initialInfected: 6, seed: 2024 };
    this.odeSolution = null;
    this.agentOde = null;
    this.thumbs = {};
    this.speed = 1.0;
    this.module = 'home';
  }

  init() {
    this.cacheDOM();
    this.initComponents();
    this.renderCategoryPills();
    this.populateDiseaseDropdown();
    this.bindEvents();
    this.loadDisease(this.currentDiseaseId);
    this.renderComparisonTable();
    const fromHash = (location.hash || '').replace('#', '');
    this.navigate(MODULES.includes(fromHash) ? fromHash : 'home');
    // miniaturas 3D de los patógenos (después del primer pintado)
    setTimeout(() => this.makeThumbnails(), 50);
  }

  cacheDOM() {
    const $ = (id) => document.getElementById(id);
    this.dom = {
      categoryPills: $('category-pills'), diseaseSelect: $('disease-select'), diseaseBadge: $('disease-badge'),
      diseasePathogen: $('disease-pathogen'), diseaseTransmission: $('disease-transmission'),
      ctxThumb: $('ctx-thumb'), ctxName: $('ctx-name'),
      chartCanvas: $('chart-canvas'), compareCanvas: $('compare-canvas'), compareSummary: $('compare-summary'), odeInsight: $('ode-insight'),
      kpiDay: $('kpi-day'), kpiActiveInfected: $('kpi-active-infected'), kpiActiveInfected2: $('kpi-active-infected-2'), kpiActiveSub: $('kpi-active-sub'),
      kpiPeak: $('kpi-peak'), kpiTotalDeaths: $('kpi-total-deaths'), kpiRt: $('kpi-rt'), kpiRtStatus: $('kpi-rt-status'),
      kpiHospitalStatus: $('kpi-hospital-status'), kpiHospitalBar: $('kpi-hospital-bar'),
      btnPlayPause: $('btn-play-pause'), btnStepDay: $('btn-step-day'), btnReset: $('btn-reset'), btnNewSeed: $('btn-new-seed'),
      speedButtons: document.querySelectorAll('.btn-speed'), btnExportCsv: $('btn-export-csv'), btnExportAgents: $('btn-export-agents'),
      btnTriggerOutbreak: $('btn-trigger-outbreak'), btnVaccinateCluster: $('btn-vaccinate-cluster'),
      btnChartCompartments: $('btn-chart-compartments'), btnChartRt: $('btn-chart-rt'),
      sliderR0: $('slider-r0'), valR0: $('val-r0'), sliderIncubation: $('slider-incubation'), valIncubation: $('val-incubation'),
      sliderInfectious: $('slider-infectious'), valInfectious: $('val-infectious'), sliderFatality: $('slider-fatality'), valFatality: $('val-fatality'),
      sliderHospital: $('slider-hospital'), valHospital: $('val-hospital'), sliderAgents: $('slider-agents'), valAgents: $('val-agents'),
      sliderSeeds: $('slider-seeds'), valSeeds: $('val-seeds'), checkQuarantine: $('check-quarantine'),
      sliderQuarantineDay: $('slider-quarantine-day'), valQuarantineDay: $('val-quarantine-day'),
      sliderQuarantineEfficacy: $('slider-quarantine-efficacy'), valQuarantineEfficacy: $('val-quarantine-efficacy'),
      sliderVaccination: $('slider-vaccination'), valVaccination: $('val-vaccination'),
      sliderSocialDistancing: $('slider-social-distancing'), valSocialDistancing: $('val-social-distancing'),
      sliderMasks: $('slider-masks'), valMasks: $('val-masks'), sliderIsolation: $('slider-isolation'), valIsolation: $('val-isolation'),
      sliderVentilation: $('slider-ventilation'), valVentilation: $('val-ventilation'), sliderVector: $('slider-vector'), valVector: $('val-vector'),
      sliderWater: $('slider-water'), valWater: $('val-water'),
      mathContainer: $('math-container'), compareContainer: $('compare-table-body'), clinicalContainer: $('clinical-info-container'),
      selectModelType: $('select-model-type')
    };
  }

  initComponents() {
    if (this.dom.chartCanvas) this.chart = new ChartRenderer(this.dom.chartCanvas);
    if (this.dom.compareCanvas) {
      this.compareChart = new ComparisonChart(this.dom.compareCanvas);
      this.compareChart.onDayClick = (d) => { this.lab.showDayOnMap(d); this.navigate('map'); this.lab.toast(`🗺️ Revisando la ciudad el día ${d}`); };
    }
    this.lab = new LabController({
      onStats: (engine) => this.onLabStats(engine),
      onDay: (engine) => this.onLabDay(engine),
      onRunState: (running) => this.updatePlayPauseUI(running),
      onNavigate: (m) => this.navigate(m)
    });
    this.mathExplorer = new MathExplorer(document.getElementById('math-explorer'));
    this.viewer = new PathogenViewer(document.getElementById('pm-viewer'));
    this.diagram = new TransmissionDiagram(document.getElementById('pm-diagram'));
    this.modal = new PathogenModal(document.getElementById('pathogen-modal'), this.viewer, this.diagram, {
      onSimulate: () => { this.navigate('sim'); this.lab.play(); },
      onLearn: () => { this.navigate('learn'); this.tour.start(); }
    });
    this.gallery = new DiseaseGallery(document.getElementById('gallery'), {
      onSelect: (id) => { this.loadDisease(id); this.modal.open(id); }
    });
    this.tour = new LearnTour(document.getElementById('tour-panel'), { app: this, lab: this.lab });
  }

  makeThumbnails() {
    if (!this.viewer.ok) return;
    this.thumbs = this.viewer.thumbnails(Object.keys(DISEASES));
    this.gallery.setThumbs(this.thumbs);
    this.updateHeaderInfo();
    const mosaic = document.getElementById('hero-mosaic');
    if (mosaic) {
      mosaic.innerHTML = Object.keys(DISEASES).filter((id) => id !== 'custom_disease').map((id, i) =>
        `<button class="hm-cell" style="animation-delay:${i * 60}ms" data-hm="${id}" title="${DISEASES[id].name}"><img src="${this.thumbs[id]}" alt="${getPathogen(id).agent}"><span>${DISEASES[id].name.split('(')[0]}</span></button>`).join('');
      mosaic.querySelectorAll('[data-hm]').forEach((b) => b.addEventListener('click', () => { this.loadDisease(b.dataset.hm); this.modal.open(b.dataset.hm); }));
    }
  }

  /** Navegación entre módulos. */
  navigate(mod) {
    if (!MODULES.includes(mod)) mod = 'home';
    this.module = mod;
    document.querySelectorAll('[data-module-panel]').forEach((s) => s.classList.toggle('active', s.dataset.modulePanel === mod));
    document.querySelectorAll('[data-module]').forEach((b) => b.classList.toggle('active', b.dataset.module === mod));
    document.body.dataset.module = mod;
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    if (history.replaceState) history.replaceState(null, '', `#${mod}`);
    if (mod === 'models') this.mathExplorer.update(this.params, this.odeSolution, this.currentDisease.name);
    if (mod === 'diseases') { this.gallery.render(this.currentDiseaseId); this.updateClinicalSection(); }
    if (mod === 'models') this.updateMathSection();
    setTimeout(() => {
      this.lab.resize();
      if (this.chart) this.chart.initCanvasSize();
      if (this.compareChart) this.compareChart.resize();
      if (mod === 'compare') this.updateComparison(this.lab.engine);
    }, 40);
  }

  agentParams() {
    const p = this.params;
    return {
      modelType: p.modelType, r0: p.r0, incubationDays: p.incubationDays, infectiousDays: p.infectiousDays,
      fatalityRate: p.fatalityRate, hospitalCapacityRate: p.hospitalCapacityRate,
      vaccinationRateDaily: p.vaccinationRateDaily, vaccineEfficacy: p.vaccineEfficacy,
      quarantineStartDay: p.quarantineStartDay, quarantineEfficacy: p.quarantineEfficacy,
      socialDistancingRate: p.socialDistancingRate, maskUsageRate: p.maskUsageRate,
      isolationRate: p.isolationRate, ventilation: p.ventilation, vectorControl: p.vectorControl, waterTreatment: p.waterTreatment
    };
  }

  renderCategoryPills() {
    if (!this.dom.categoryPills) return;
    this.dom.categoryPills.innerHTML = '';
    DISEASE_CATEGORIES.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = `category-pill ${cat.id === this.currentCategory ? 'active' : ''}`;
      btn.innerHTML = `<span class="cat-icon">${cat.icon}</span> <span>${cat.name}</span>`;
      btn.dataset.category = cat.id;
      btn.addEventListener('click', () => this.setCategory(cat.id));
      this.dom.categoryPills.appendChild(btn);
    });
  }

  setCategory(categoryId) {
    this.currentCategory = categoryId;
    document.querySelectorAll('.category-pill').forEach((p) => p.classList.toggle('active', p.dataset.category === categoryId));
    this.populateDiseaseDropdown();
    const available = Object.values(DISEASES).filter((d) => (categoryId === 'all' ? true : d.category === categoryId));
    if (available.length > 0) this.loadDisease(available[0].id);
  }

  populateDiseaseDropdown() {
    if (!this.dom.diseaseSelect) return;
    this.dom.diseaseSelect.innerHTML = '';
    Object.values(DISEASES).filter((d) => (this.currentCategory === 'all' ? true : d.category === this.currentCategory)).forEach((disease) => {
      const opt = document.createElement('option');
      opt.value = disease.id;
      opt.textContent = `${disease.name} (R₀: ${disease.r0}, Modelo ${disease.modelType})`;
      if (disease.id === this.currentDiseaseId) opt.selected = true;
      this.dom.diseaseSelect.appendChild(opt);
    });
  }

  loadDisease(diseaseId) {
    const disease = DISEASES[diseaseId];
    if (!disease) return;
    this.currentDiseaseId = diseaseId;
    this.currentDisease = disease;
    if (this.dom.diseaseSelect) this.dom.diseaseSelect.value = diseaseId;
    this.params.modelType = disease.modelType;
    this.params.r0 = disease.r0;
    this.params.incubationDays = disease.incubationDays;
    this.params.infectiousDays = disease.infectiousDays;
    this.params.fatalityRate = disease.fatalityRate;
    this.params.hospitalCapacityRate = disease.hospitalizationRate || 0.05;
    this.syncSlidersFromParams();
    this.updateHeaderInfo();
    this.solveODE();
    this.resetSimulation();
    this.updateMathSection();
    this.updateClinicalSection();
    if (this.gallery) this.gallery.render(diseaseId);
  }

  syncSlidersFromParams() {
    const d = this.dom, p = this.params;
    if (d.sliderR0) { d.sliderR0.value = p.r0; d.valR0.textContent = parseFloat(p.r0).toFixed(1); }
    if (d.sliderIncubation) { d.sliderIncubation.value = p.incubationDays; d.valIncubation.textContent = `${p.incubationDays} d`; }
    if (d.sliderInfectious) { d.sliderInfectious.value = p.infectiousDays; d.valInfectious.textContent = `${p.infectiousDays} d`; }
    if (d.sliderFatality) { d.sliderFatality.value = (p.fatalityRate * 100).toFixed(2); d.valFatality.textContent = `${(p.fatalityRate * 100).toFixed(2)}%`; }
    if (d.sliderHospital) { d.sliderHospital.value = (p.hospitalCapacityRate * 100).toFixed(1); d.valHospital.textContent = `${(p.hospitalCapacityRate * 100).toFixed(1)}%`; }
    if (d.selectModelType) d.selectModelType.value = p.modelType;
  }

  updateHeaderInfo() {
    const d = this.currentDisease;
    if (this.dom.diseaseBadge) this.dom.diseaseBadge.textContent = `${this.params.modelType} · R₀ ${this.params.r0}`;
    if (this.dom.diseasePathogen) this.dom.diseasePathogen.textContent = d.pathogen;
    if (this.dom.diseaseTransmission) this.dom.diseaseTransmission.textContent = d.transmission;
    if (this.dom.ctxName) this.dom.ctxName.textContent = d.name;
    if (this.dom.ctxThumb && this.thumbs[this.currentDiseaseId]) this.dom.ctxThumb.src = this.thumbs[this.currentDiseaseId];
  }

  solveODE() {
    this.odeSolution = EpidemicModel.solve(this.params);
    if (this.chart) this.chart.updateData(this.odeSolution);
    this.updateKPIsFromODE();
    this.updateOdeInsight();
    this.solveAgentODE();
    if (this.module === 'models' && this.mathExplorer) this.mathExplorer.update(this.params, this.odeSolution, this.currentDisease.name);
  }

  /** EDO con la MISMA población y condiciones iniciales que los agentes (sólo para comparar). */
  solveAgentODE() {
    if (!this.lab || !this.lab.engine.agents.length) return;
    const { offset, initialVaccinated, ...ic } = this.lab.engine.initialConditions();
    this.agentOdeOffset = offset;
    this.agentOde = EpidemicModel.solve({ ...this.params, ...ic, days: Math.max(this.params.days, 150) });
    this.updateComparison(this.lab.engine);
  }

  resetSimulation() {
    if (!this.lab) return;
    this.lab.configure(this.currentDisease, this.agentParams());
    this.lab.reset({ ...this.agentConfig });
    this.solveAgentODE();
    if (this.chart) this.chart.setCurrentDay(0);
    this.updateHeaderInfo();
  }

  updatePlayPauseUI(isRunning) {
    if (!this.dom.btnPlayPause) return;
    this.dom.btnPlayPause.classList.toggle('btn-pause-active', isRunning);
    this.dom.btnPlayPause.innerHTML = isRunning ? `<span>⏸️</span> Pausar` : `<span>▶️</span> Iniciar`;
  }

  onLabStats(engine) {
    const c = engine.counts;
    const day = Math.floor(engine.t);
    if (this.chart && this.chart.currentDay !== day && this.module === 'charts') this.chart.setCurrentDay(day);
    if (this.dom.kpiDay) this.dom.kpiDay.textContent = `${day}`;
    if (this.dom.kpiActiveInfected) this.dom.kpiActiveInfected.textContent = `${c.I}`;
    if (this.dom.kpiActiveInfected2) this.dom.kpiActiveInfected2.textContent = `${c.I}`;
    if (this.dom.kpiActiveSub) this.dom.kpiActiveSub.textContent = `de ${c.N} agentes · ${c.E} expuestos`;
    const usage = c.beds ? Math.round((c.H / c.beds) * 100) : 0;
    if (this.dom.kpiHospitalStatus) {
      this.dom.kpiHospitalStatus.textContent = `${c.H}/${c.beds} camas`;
      this.dom.kpiHospitalStatus.className = c.waiting ? 'kpi-value status-text-danger' : 'kpi-value status-text-normal';
    }
    if (this.dom.kpiHospitalBar) {
      this.dom.kpiHospitalBar.style.width = `${Math.min(100, usage)}%`;
      this.dom.kpiHospitalBar.style.backgroundColor = c.waiting ? '#ef4444' : usage > 80 ? '#f59e0b' : '#10b981';
    }
    if (this.odeSolution && this.dom.kpiRt) {
      const idx = Math.min(this.odeSolution.Rt.length - 1, day);
      const rt = this.odeSolution.Rt[idx];
      this.dom.kpiRt.textContent = rt.toFixed(2);
      const expanding = rt > 1;
      this.dom.kpiRtStatus.textContent = expanding ? '🔥 Brote en expansión (Rₜ > 1)' : '🛡️ Brote bajo control (Rₜ < 1)';
      this.dom.kpiRtStatus.className = expanding ? 'rt-badge rt-expanding' : 'rt-badge rt-controlled';
    }
  }

  onLabDay(engine) {
    // brote introducido después del día 0: recalcular la EDO comparativa desde el primer caso
    if (this.agentOde && this.agentOde.summary.peakInfected === 0 && engine.cumulative > 0) this.solveAgentODE();
    if (this.module === 'compare') this.updateComparison(engine);
  }

  updateComparison(engine) {
    if (!this.compareChart || !this.agentOde) return;
    this.compareChart.setData(this.agentOde, engine.history, engine.agents.length, engine.t, this.agentOdeOffset || 0);
    if (!this.dom.compareSummary) return;
    const h = engine.history;
    let peakA = 0, peakDayA = 0;
    for (const x of h) if (x.I > peakA) { peakA = x.I; peakDayA = x.day; }
    const s = this.agentOde.summary;
    const last = h[h.length - 1] || {};
    const odeIdx = Math.min(this.agentOde.times.length - 1, Math.floor(engine.t) - (this.agentOdeOffset || 0));
    const att = (engine.cumulative / Math.max(1, engine.agents.length)) * 100;
    const diffPeak = peakA && s.peakInfected ? ((peakA - s.peakInfected) / s.peakInfected) * 100 : null;
    this.dom.compareSummary.innerHTML = `
      <div><span class="cmp-tag cmp-ode">EDO · determinista</span> pico I = <b>${s.peakInfected}</b> el día <b>${s.peakDay + (this.agentOdeOffset || 0)}</b> · ataque final ${s.attackRate}% · hoy I = ${this.agentOde.I[Math.max(0, odeIdx)].toFixed(1)}</div>
      <div><span class="cmp-tag cmp-abm">Agentes · estocástico</span> pico I = <b>${peakA}</b> el día <b>${peakDayA}</b> (hasta ahora) · infectados acumulados ${att.toFixed(1)}% · hoy I = ${last.I ?? '—'}</div>
      ${diffPeak !== null && engine.t > s.peakDay + (this.agentOdeOffset || 0) + 5 ? `<div class="cmp-interp">📝 Interpretación: el pico de los agentes fue ${Math.abs(diffPeak).toFixed(0)} % ${diffPeak < 0 ? 'menor' : 'mayor'} que el de la EDO y ocurrió ${Math.abs(peakDayA - s.peakDay - (this.agentOdeOffset || 0))} días ${peakDayA > s.peakDay + (this.agentOdeOffset || 0) ? 'después' : 'antes'}. ${diffPeak < 0 ? 'Es típico: el contagio se agota primero dentro de cada hogar y el azar frena los primeros días.' : 'El azar produjo una realización más intensa que el promedio.'}</div>` : ''}`;
  }

  updateKPIsFromODE() {
    if (!this.odeSolution || !this.odeSolution.summary) return;
    const s = this.odeSolution.summary;
    if (this.dom.kpiPeak) this.dom.kpiPeak.textContent = `${s.peakInfected.toLocaleString()} (día ${s.peakDay})`;
    if (this.dom.kpiTotalDeaths) this.dom.kpiTotalDeaths.textContent = s.totalDeaths.toLocaleString();
  }

  /** Interpretación automática de la curva determinista. */
  updateOdeInsight() {
    const el = this.dom.odeInsight;
    if (!el || !this.odeSolution) return;
    const o = this.odeSolution, s = o.summary;
    const cross = o.Rt.findIndex((r) => r < 1);
    const sat = s.saturationDay;
    const hasE = this.params.modelType.includes('E');
    el.innerHTML = `
      <div class="ins-grid">
        <div><b>🏔️ Pico</b><p>Máximo de I(t): <b>${s.peakInfected.toLocaleString()}</b> personas el <b>día ${s.peakDay}</b>. En ese instante dI/dt = 0.</p></div>
        <div><b>📉 Rₜ cruza 1</b><p>${cross >= 0 ? `El día <b>${o.times[cross]}</b> Rₜ = R₀·S/N baja de 1: desde ahí cada caso produce menos de un caso nuevo.` : 'Rₜ no baja de 1 en el horizonte simulado.'}</p></div>
        <div><b>🏥 Hospital</b><p>${sat !== null ? `La capacidad (${s.hospitalBeds.toLocaleString()} camas) se supera el <b>día ${sat}</b>: el modelo aumenta la letalidad (colapso).` : 'La capacidad hospitalaria no se supera.'}</p></div>
        <div><b>🎯 Tamaño final</b><p>Se infecta el <b>${s.attackRate}%</b> de la población; la inmunidad de rebaño requiere ${s.herdImmunityThreshold}%.</p></div>
      </div>
      <p class="ins-note">Cómo leer la gráfica: <b>S</b> (azul) sólo decrece; <b>${hasE ? 'E (ámbar) precede a I' : 'I (rojo)'}</b> sube, alcanza su máximo y baja; <b>R</b> y <b>D</b> acumulan a quienes salen de I. El eje vertical son personas; el horizontal, días. La línea discontinua roja marca el día actual de la simulación.</p>`;
  }

  updateMathSection() {
    if (this.dom.mathContainer) MathRenderer.updateTheorySection(this.dom.mathContainer, this.params.modelType, this.currentDisease, this.params);
  }

  updateClinicalSection() {
    if (!this.dom.clinicalContainer) return;
    const d = this.currentDisease;
    const pg = getPathogen(this.currentDiseaseId);
    const preventionsList = (d.preventions || []).map((p) => `<li class="prevention-item">🛡️ ${p}</li>`).join('');
    const prof = this.lab ? this.lab.engine.profile : null;
    this.dom.clinicalContainer.innerHTML = `
      <div class="clinical-card">
        <h3 class="clinical-title">🩺 Ficha médica y epidemiológica: ${d.name}</h3>
        <div class="clinical-grid">
          <div class="clinical-field"><span class="field-label">Agente etiológico:</span><span class="field-value">${d.pathogen}</span></div>
          <div class="clinical-field"><span class="field-label">Vía de transmisión:</span><span class="field-value">${d.transmission}</span></div>
          <div class="clinical-field"><span class="field-label">Periodo de incubación:</span><span class="field-value">${d.incubationDays} días (fase latente)</span></div>
          <div class="clinical-field"><span class="field-label">Periodo infeccioso:</span><span class="field-value">${d.infectiousDays} días</span></div>
          <div class="clinical-field"><span class="field-label">Letalidad (CFR):</span><span class="field-value">${(d.fatalityRate * 100).toFixed(2)}%</span></div>
          <div class="clinical-field"><span class="field-label">Hospitalización:</span><span class="field-value">${((d.hospitalizationRate || 0.05) * 100).toFixed(1)}%</span></div>
          <div class="clinical-field"><span class="field-label">Órganos afectados:</span><span class="field-value">${pg.organs}</span></div>
        </div>
        <div class="clinical-notes-box"><h4>Manifestaciones clínicas y síntomas:</h4><p>${d.clinicalNotes || 'Consulte los protocolos médicos pertinentes.'}</p></div>
        ${prof ? `<div class="clinical-notes-box"><h4>Representación en el laboratorio 3D:</h4><p>${prof.symptomText}</p></div>` : ''}
        <div class="preventions-box"><h4>Medidas de prevención e intervenciones comunitarias:</h4><ul class="prevention-list">${preventionsList}</ul></div>
        <button class="btn-sim" id="btn-open-pathogen">🔬 Ver el patógeno en 3D</button>
      </div>`;
    document.getElementById('btn-open-pathogen')?.addEventListener('click', () => this.modal.open(this.currentDiseaseId));
  }

  renderComparisonTable() {
    if (!this.dom.compareContainer) return;
    this.dom.compareContainer.innerHTML = '';
    Object.values(DISEASES).filter((d) => d.id !== 'custom_disease').forEach((dis) => {
      const hit = dis.r0 > 1 ? ((1 - 1 / dis.r0) * 100).toFixed(1) : 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-semibold text-white">${dis.name}</td>
        <td><span class="badge-cat">${dis.category}</span></td>
        <td><span class="badge-tag">${dis.modelType}</span></td>
        <td><span class="r0-val font-bold text-rose-400">${dis.r0}</span></td>
        <td>${dis.incubationDays} d</td>
        <td>${dis.infectiousDays} d</td>
        <td class="text-amber-300 font-semibold">${(dis.fatalityRate * 100).toFixed(2)}%</td>
        <td class="text-emerald-400 font-semibold">${hit}%</td>
        <td><button class="btn-select-compare" data-id="${dis.id}">Simular</button></td>`;
      this.dom.compareContainer.appendChild(tr);
    });
    this.dom.compareContainer.querySelectorAll('.btn-select-compare').forEach((btn) => {
      btn.addEventListener('click', (e) => { this.loadDisease(e.target.dataset.id); this.navigate('sim'); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    });
  }

  /** Compatibilidad con la versión anterior (pestañas). */
  switchTab(tab) {
    this.navigate({ both: 'sim', simulation: 'sim', chart: 'charts', math: 'models', compare: 'diseases', clinical: 'diseases' }[tab] || tab);
  }

  bindEvents() {
    const d = this.dom;
    document.querySelectorAll('[data-module]').forEach((b) => b.addEventListener('click', () => this.navigate(b.dataset.module)));
    document.querySelectorAll('[data-module-go]').forEach((b) => b.addEventListener('click', () => this.navigate(b.dataset.moduleGo)));
    document.querySelectorAll('[data-drawer-toggle]').forEach((b) => b.addEventListener('click', () => {
      document.querySelector('.sim-layout').classList.toggle('drawer-closed');
      setTimeout(() => this.lab.resize(), 260);
    }));
    if (window.innerWidth < 1100) document.querySelector('.sim-layout').classList.add('drawer-closed');
    document.getElementById('btn-start-tour')?.addEventListener('click', () => this.tour.start());

    if (d.diseaseSelect) d.diseaseSelect.addEventListener('change', (e) => this.loadDisease(e.target.value));
    if (d.selectModelType) {
      d.selectModelType.addEventListener('change', (e) => {
        this.params.modelType = e.target.value;
        this.updateHeaderInfo();
        this.solveODE();
        this.resetSimulation();
        this.updateMathSection();
      });
    }
    if (d.btnPlayPause) d.btnPlayPause.addEventListener('click', () => {
      if (!['sim', 'map'].includes(this.module) && !this.lab.isRunning) this.navigate('sim');
      this.lab.toggle();
    });
    if (d.btnStepDay) d.btnStepDay.addEventListener('click', () => this.lab.stepDay());
    if (d.btnReset) d.btnReset.addEventListener('click', () => this.resetSimulation());
    if (d.btnNewSeed) d.btnNewSeed.addEventListener('click', () => {
      this.agentConfig.seed = Math.floor(Math.random() * 1e6);
      this.resetSimulation();
      this.lab.toast(`🎲 Nueva semilla aleatoria: ${this.agentConfig.seed} (otra realización estocástica)`);
    });
    d.speedButtons.forEach((btn) => btn.addEventListener('click', () => {
      d.speedButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      this.speed = parseFloat(btn.dataset.speed);
      this.lab.setSpeed(this.speed);
    }));
    if (d.btnChartCompartments && d.btnChartRt) {
      d.btnChartCompartments.addEventListener('click', () => { d.btnChartCompartments.classList.add('active'); d.btnChartRt.classList.remove('active'); if (this.chart) this.chart.setMode('compartments'); });
      d.btnChartRt.addEventListener('click', () => { d.btnChartRt.classList.add('active'); d.btnChartCompartments.classList.remove('active'); if (this.chart) this.chart.setMode('rt'); });
    }

    let agentTimer = null;
    const pushAgentParams = () => {
      clearTimeout(agentTimer);
      agentTimer = setTimeout(() => { this.lab.setParams(this.agentParams()); this.solveAgentODE(); this.updateHeaderInfo(); }, 120);
    };
    const attachSlider = (slider, valDisplay, paramKey, formatFn, callback, odeAffected = true) => {
      if (!slider) return;
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.params[paramKey] = val;
        if (valDisplay) valDisplay.textContent = formatFn ? formatFn(val) : val;
        if (callback) callback(val);
        if (odeAffected) this.solveODE();
        pushAgentParams();
      });
    };
    attachSlider(d.sliderR0, d.valR0, 'r0', (v) => v.toFixed(1), () => this.updateMathSection());
    attachSlider(d.sliderIncubation, d.valIncubation, 'incubationDays', (v) => `${v} d`, () => this.updateMathSection());
    attachSlider(d.sliderInfectious, d.valInfectious, 'infectiousDays', (v) => `${v} d`, () => this.updateMathSection());
    attachSlider(d.sliderFatality, d.valFatality, 'fatalityRate', (v) => `${v.toFixed(2)}%`, (v) => { this.params.fatalityRate = v / 100; this.updateMathSection(); });
    attachSlider(d.sliderHospital, d.valHospital, 'hospitalCapacityRate', (v) => `${v.toFixed(1)}%`, (v) => { this.params.hospitalCapacityRate = v / 100; });
    if (d.checkQuarantine) {
      d.checkQuarantine.addEventListener('change', (e) => {
        this.params.quarantineStartDay = e.target.checked ? parseFloat(d.sliderQuarantineDay.value) : 999;
        this.solveODE();
        pushAgentParams();
      });
    }
    attachSlider(d.sliderQuarantineDay, d.valQuarantineDay, 'quarantineStartDay', (v) => `Día ${v}`, (v) => { this.params.quarantineStartDay = d.checkQuarantine && d.checkQuarantine.checked ? v : 999; });
    attachSlider(d.sliderQuarantineEfficacy, d.valQuarantineEfficacy, 'quarantineEfficacy', (v) => `${Math.round(v * 100)}%`);
    attachSlider(d.sliderVaccination, d.valVaccination, 'vaccinationRateDaily', (v) => `${v}% / día`, (v) => { this.params.vaccinationRateDaily = v / 100; });
    const pct = (v) => `${Math.round(v)}%`;
    attachSlider(d.sliderSocialDistancing, d.valSocialDistancing, 'socialDistancingRate', pct, (v) => { this.params.socialDistancingRate = v / 100; }, false);
    attachSlider(d.sliderMasks, d.valMasks, 'maskUsageRate', pct, (v) => { this.params.maskUsageRate = v / 100; }, false);
    attachSlider(d.sliderIsolation, d.valIsolation, 'isolationRate', pct, (v) => { this.params.isolationRate = v / 100; }, false);
    attachSlider(d.sliderVentilation, d.valVentilation, 'ventilation', pct, (v) => { this.params.ventilation = v / 100; }, false);
    attachSlider(d.sliderVector, d.valVector, 'vectorControl', pct, (v) => { this.params.vectorControl = v / 100; }, false);
    attachSlider(d.sliderWater, d.valWater, 'waterTreatment', pct, (v) => { this.params.waterTreatment = v / 100; }, false);
    const attachAgentSlider = (slider, val, key, fmt) => {
      if (!slider) return;
      slider.addEventListener('input', (e) => { val.textContent = fmt(+e.target.value); });
      slider.addEventListener('change', (e) => {
        this.agentConfig[key] = +e.target.value;
        this.resetSimulation();
        this.lab.toast(`👥 Simulación reiniciada con ${this.agentConfig.population} personas y ${this.agentConfig.initialInfected} caso(s) inicial(es)`);
      });
    };
    attachAgentSlider(d.sliderAgents, d.valAgents, 'population', (v) => `${v} personas`);
    attachAgentSlider(d.sliderSeeds, d.valSeeds, 'initialInfected', (v) => `${v}`);
    if (d.btnTriggerOutbreak) d.btnTriggerOutbreak.addEventListener('click', () => this.lab.randomOutbreak(5));
    if (d.btnVaccinateCluster) d.btnVaccinateCluster.addEventListener('click', () => this.lab.vaccinateFraction(0.25));
    if (d.btnExportCsv) d.btnExportCsv.addEventListener('click', () => this.exportSimulationToCSV());
    if (d.btnExportAgents) d.btnExportAgents.addEventListener('click', () => this.exportAgentsToCSV());
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        themeBtn.textContent = document.body.classList.contains('light-theme') ? '🌙' : '☀️';
        if (this.chart) this.chart.render();
        if (this.compareChart) this.compareChart.render();
      });
    }
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); this.lab.toggle(); }
      if (e.code === 'ArrowRight') this.lab.stepDay();
    });
  }

  exportSimulationToCSV() {
    if (!this.odeSolution || !this.odeSolution.times) return;
    const { times, S, E, I, R, D, Rt, newDaily } = this.odeSolution;
    let csv = 'Dia,Susceptibles,Expuestos,Infectados_Activos,Recuperados,Fallecidos,Rt_Efectivo,Nuevos_Casos_Diarios\n';
    for (let i = 0; i < times.length; i++) {
      csv += [times[i], Math.round(S[i]), Math.round(E[i] || 0), Math.round(I[i]), Math.round(R[i]), Math.round(D[i]),
        Rt[i] ? Rt[i].toFixed(3) : '', Math.round(newDaily[i] || 0)].join(',') + '\n';
    }
    this.download(csv, `simulacion_${this.currentDiseaseId}_EDO_mate4.csv`);
  }

  exportAgentsToCSV() {
    const h = this.lab.engine.history;
    let csv = `# Simulacion de agentes (estocastica) - ${this.currentDisease.name} - N=${this.lab.engine.agents.length} - semilla=${this.agentConfig.seed}\n`;
    csv += 'Dia,Susceptibles,Expuestos,Infectados,Recuperados,Fallecidos,Vacunados,Hospitalizados,Nuevos_Contagios,Contagios_Acumulados,Rt_agentes\n';
    for (const x of h) csv += [x.day, x.S, x.E, x.I, x.R, x.D, x.V, x.H, x.newInf, x.cumulative, x.Rt === null ? '' : x.Rt.toFixed(3)].join(',') + '\n';
    this.download(csv, `simulacion_${this.currentDiseaseId}_agentes_mate4.csv`);
  }

  download(text, name) {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  window.epiApp = app; // acceso para depuración desde la consola
});

  // === Fin de js/app.js ===

})();
