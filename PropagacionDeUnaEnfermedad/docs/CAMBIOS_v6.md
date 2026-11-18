# Registro de cambios: EpiDynamics 5.0 → 6.0

**Punto de partida verificado:** el código local, el repositorio `main` (commit `d720058`) y la página publicada en
GitHub Pages eran idénticos (se comparó el `bundle.js` publicado con el local, sin diferencias salvo finales de línea).
Todo el trabajo parte de esa versión; no se sobrescribió ninguna funcionalidad reciente.

## 1. Personajes (render3d/peopleRenderer.js — reescrito)
| Antes (5.0) | Ahora (6.0) |
| :--- | :--- |
| 7 piezas rígidas (cajas): piernas y brazos de una sola pieza, cabeza esférica sin rostro | Esqueleto procedural de 14 piezas + accesorios: pelvis, torso torneado (LatheGeometry), cuello, cabeza, **ojos con parpadeo**, nariz, **boca expresiva**, muslos y espinillas con **rodillas**, brazos y antebrazos con **codos**, **manos** y **calzado** |
| Un tipo de cabello | 4 peinados (corto, largo, moño, gorra) + canas en personas mayores; faldas/vestidos; mochilas en niños; bata blanca para el personal del hospital; bata celeste para pacientes |
| Animación de caminar única | Sistema de capas con pesos suavizados: caminar / correr (fase ligada a la distancia → sin deslizamiento), giro suave, detenerse, mirar alrededor, **conversar** (gestos y mirada al interlocutor), **saludar**, **sentarse** (silla en escuela/casa, suelo en el parque), toser (mano a la boca), **estornudar** (cabeza atrás → adelante, nube mayor), **respiración dificultosa** (pecho), debilidad, escalofríos, agitación, abdomen, reposo en cama, recuperación progresiva |
| Todos igual | Personalidad por persona: ritmo, amplitud del braceo, postura, estatura y complexión |

Rendimiento: cada pieza sigue siendo un único `InstancedMesh` para toda la población (≈ 25 llamadas de dibujo para todas las personas).

## 2. Escenario (render3d/cityRenderer.js — reescrito)
- **Texturas procedurales** dibujadas en canvas (césped, asfalto, baldosas, adoquines de plaza, tejas, ladrillo, revoque, agua): sin descargas.
- Viviendas con **tejado a dos aguas**, chimeneas, marcos de ventana, alféizares, puertas con marco, cercas y flores.
- Aceras con **bordillo**, **pasos de cebra**, línea amarilla central.
- Plaza con fuente escalonada y **chorro animado**, bancas, jardineras con flores.
- Mercado con **toldos a rayas** y frutas; escuela con **pizarra, columpio, tobogán y mástil**; hospital con **edificio de 2 plantas**, ventanas, cruz luminosa, marquesina de urgencias, camas con almohada y **soporte de suero**.
- Parque con estanque (bordes, nenúfares), sendero, flores, árboles redondos y **pinos**; bosque perimetral.
- **Cielo con degradado** y **nubes** que se desplazan; amaneceres/atardeceres; ventanas y farolas encendidas de noche.
- **Tráfico ambiental**: 9 automóviles que **se detienen ante los peatones**; **ambulancia con sirena** que llega al hospital cuando hay pacientes.
- Tone mapping ACES Filmic. Geometría estática fusionada por material (incluye UV para texturas).

> El tráfico, las nubes y la fuente son ambientación pura: no modifican el motor epidemiológico.

## 3. Cámara cinematográfica (lab3d.js, orbitControls.js)
- Encuadres con transición animada: **vista general, aérea, a pie de calle, primer plano** (síntomas) y **seguimiento**.
- **Cámara de contagios** (capa activable): enfoca automáticamente cada nuevo contagio real con un breve ralentí.
- Botón 🔎 *Explicar el próximo contagio* (pausa + tarjeta explicativa).

## 4. Patógenos (nuevo)
- `js/data/pathogens.js`: ficha biológica de los 15 agentes (clasificación, taxonomía, genoma, tamaño, estructura, órganos, vector).
- `js/render3d/pathogenViewer.js`: **modelos 3D conceptuales distintos para cada agente** (coronavirus con espigas en maza, paramixovirus pleomórfico con H y F, influenza con HA/NA, herpesvirus con cápside icosaédrica, bacilo tuberculoso en cordones, flavivirus con proteína E, *Plasmodium* + glóbulo rojo, filovirus filamentoso, poxvirus en ladrillo, rabdovirus en bala, *Vibrio* en coma con flagelo). Se indica siempre «Ilustración conceptual (no es una imagen de microscopía)».
- `js/components/transmissionDiagram.js`: animación del mecanismo (aerosoles, gotículas, contacto, ciclo mosquito–humano, pozo contaminado).
- `js/components/diseaseGallery.js`: **tarjetas visuales** por categoría con miniatura 3D, tipo de patógeno, mecanismo, R₀, incubación, periodo infeccioso, letalidad y modelo; **ficha animada** al seleccionar.

## 5. Transmisión visible
- Efectos generados **sólo a partir de contagios reales** del motor: chorro de gotículas o aerosoles entre infector e infectado, pulsos de contacto, destello de picadura, gota y onda al beber agua contaminada.
- **Aerosoles suspendidos en interiores** proporcionales a la emisión calculada; con ventilación se renuevan.
- Mosquitos con alas y colores por estado (sano, incubando, infeccioso).
- **Tarjeta de contagio** con el cálculo separado: probabilidad individual del agente vs valor esperado de la EDO.

## 6. Mapa epidemiológico 2D (render2d/planView.js — reescrito)
Mapa de calor de contagios, personas por estado, densidad de infectados, rutas de transmisión por mecanismo, contactos,
vectores, fuentes contaminadas (con W), etiquetas, escala de 10 m, leyenda, tooltip al pasar el ratón y **línea de tiempo**
para revisar cualquier día pasado (instantáneas diarias del motor). Panel con conteos, **contagios por lugar** y **por vía**.

## 7. Pedagogía
- `js/components/mathExplorer.js` (módulo *Modelos*): cada ecuación del modelo activo, renderizada con KaTeX, con **tabla de variables
  (símbolo · significado · unidad)**, idea intuitiva y **procedimiento paso a paso con los números** de la solución RK4 en el día
  elegido; también R₀/Rₜ/HIT y **un paso completo de RK4 calculado en vivo** (k₁…k₄).
- `js/components/learnTour.js`: modo **«Aprender la epidemia»**, 10 etapas sobre la simulación real, cada una con animación, explicación
  breve, fórmula, variables, **pregunta de comprensión con retroalimentación**, Repetir / Continuar.
- Panel de eventos: cada contagio muestra por separado el resultado **probabilístico del agente** y el **esperado de la EDO**;
  explicación automática del **pico epidémico**.

## 8. Interfaz
Navegación por módulos (Inicio, Enfermedades, Simulación 3D, Mapa 2D, Modelos, Gráficas, EDO vs agentes, Aprender), barra de
contexto con la enfermedad activa y la reproducción, parámetros agrupados en **paneles desplegables** con ayudas, capas visuales en un
menú, portada con mosaico de patógenos, diseño responsivo (móvil: paneles inferiores).

## 9. Gráficas
- Comparativa agentes vs EDO: ejes con unidades, leyenda (línea = EDO, punto = agentes), **marcadores de pico** de ambos modelos,
  interpretación automática, **clic en un día → revisar la ciudad ese día en el mapa 2D**. Si el brote empieza después del día 0, la EDO
  comparativa se alinea con el primer caso.
- Gráfica RK4 original sin cambios + **interpretación automática** (pico, cruce de Rₜ = 1, saturación hospitalaria, tamaño final).

## 10. Motor y modelos
- `epiEngine.js`: añade `infectionLog` (registro espacial de cada contagio) y `snapshots` (estado diario de la ciudad). Son sólo
  registros: **no consumen números aleatorios ni alteran la dinámica** (los resultados de `npm test` son idénticos a la 5.0).
- `epidemicModels.js` — **corrección justificada**: el modelo **SIRD** compartía el sistema de SEIRD (tenía un compartimento E activo).
  Ahora SIRD no tiene etapa latente, como indica su nombre y como ya hacía el modelo de agentes. Afecta a Ébola y Rabia
  (en la EDO con N = 300, el tamaño final de Rabia pasa de 31 % a 46 % porque desaparece el retraso de 25 días). Las ecuaciones
  de S, I, R y D no cambiaron.
- Los 15 valores epidemiológicos del catálogo **no se modificaron**.

## Archivos
Nuevos: `js/data/pathogens.js`, `js/render3d/pathogenViewer.js`, `js/components/{mathExplorer,learnTour,diseaseGallery,transmissionDiagram}.js`, `docs/CAMBIOS_v6.md`.
Reescritos: `index.html`, `css/lab.css`, `js/app.js`, `js/render3d/{peopleRenderer,cityRenderer}.js`, `js/render2d/planView.js`, `js/components/{labController,comparisonChart}.js`.
Modificados: `js/render3d/{lab3d,orbitControls}.js`, `js/components/didacticPanel.js`, `js/simulation/epiEngine.js`, `js/models/epidemicModels.js` (SIRD), `build.js`, `tools/test-engine.mjs`, `README.md`.
Sin cambios: `js/data/diseasesData.js`, `js/components/{chartRenderer,mathRenderer}.js`, `css/styles.css`, `js/vendor/*`.
