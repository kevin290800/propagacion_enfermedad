/**
 * Catálogo de Enfermedades y Parámetros Epidemiológicos
 * Clasificadas por categoría con parámetros clínicos y matemáticos reales
 * Referencias: OMS (WHO), CDC, literatura de biomatemática y modelado epidemiológico.
 */

export const DISEASE_CATEGORIES = [
  { id: 'all', name: 'Todas las Categorías', icon: '🌐' },
  { id: 'respiratory', name: 'Respiratorias / Gotículas', icon: '🫁' },
  { id: 'vector', name: 'Transmitidas por Vectores', icon: '🦟' },
  { id: 'contact', name: 'Contacto Directo / Fluidos', icon: '🩸' },
  { id: 'waterborne', name: 'Hídricas / Gastrointestinales', icon: '💧' },
  { id: 'custom', name: 'Personalizado (Sandbox)', icon: '🧪' }
];

export const DISEASES = {
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
