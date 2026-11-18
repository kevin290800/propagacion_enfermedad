# Arquitectura de EpiDynamics 5.0

## 1. Auditoría de la versión 4.0 (punto de partida)

| Pieza | Estado encontrado | Decisión |
| :--- | :--- | :--- |
| `epidemicModels.js` | EDO SIR/SIS/SEIR/SIRD/SEIRD, RK4 con `dt = 0.1`, cuarentena, vacunación, saturación hospitalaria, R₀/Rₜ/HIT | **Se conserva sin cambios.** |
| `diseasesData.js` | 15 enfermedades con parámetros clínicos | **Se conserva sin cambios.** Los datos de simulación individual se añaden aparte (`diseaseProfiles.js`). |
| `chartRenderer.js`, `mathRenderer.js` | Gráfica de curvas y teoría con KaTeX | **Se conservan sin cambios.** |
| `agentSimulation.js` | Partículas 2D que rebotan; contagio por radio heurístico (`radio = 12 + 2,2·R₀` px, `p = 0,25 + R₀/20`) **no calibrado** con β ni con R₀; mismo mecanismo para todas las enfermedades; los clics curaban sin lógica clínica | **Se reemplaza** por un motor de agentes con fundamento epidemiológico. Todas sus funciones (vista 2D, clic para infectar/curar, brote local, brote +5, vacunar 25 %, radios de contagio, alerta hospitalaria, mascarillas, distanciamiento) siguen disponibles. El archivo original queda en el historial de git (commit inicial). |
| `app.js` | Orquestador | Se adapta: mismo flujo (categorías, selector, sliders, pestañas, CSV, tema), conectado al nuevo laboratorio. |
| `build.js` | Concatena módulos ES en un IIFE para abrir con doble clic | Se mantiene el enfoque y se amplía la lista de archivos. |

Detalle de un problema de la 4.0 corregido: el KPI “Infectados activos” mezclaba el conteo de 300 partículas escalado a
100 000 habitantes con los KPI de la EDO. En 5.0 cada indicador dice explícitamente si es **EDO** (determinista) o
**Agentes** (estocástico).

## 2. Investigación tecnológica y elección

| Opción | Rendimiento con cientos de personas | Integración en este proyecto | Calidad visual | Complejidad |
| :--- | :--- | :--- | :--- | :--- |
| **Three.js** | Excelente con `InstancedMesh` (una llamada de dibujo por parte del cuerpo para toda la población) | Librería pura, sin framework; se puede incluir como script clásico → funciona con doble clic (`file://`) | Alta (PBR, sombras, niebla, luz día/noche) | Media |
| Babylon.js | Excelente (thin instances) | Similar, pero ~4× más pesado y con su propio ecosistema de inspector/GUI | Alta | Media |
| React Three Fiber | Igual que Three.js | **Requiere React + bundler (Vite/Webpack)**: obligaría a reescribir la app vanilla y perder el doble clic | Alta | Alta |
| PixiJS / Phaser (2D) | Muy bueno con sprites | Sencillo | Media; no cumple la preferencia 3D | Baja |
| GLTF/GLB con esqueletos (+ Mixamo) | Cada personaje con `SkinnedMesh` + `AnimationMixer` es una llamada de dibujo y un cálculo de huesos: con 300–800 personas cae el rendimiento; instanciar mallas con esqueleto requiere técnicas avanzadas (texturas de animación horneadas) | **`GLTFLoader` usa `fetch`, que los navegadores bloquean en `file://`** → rompería el modo doble clic | Muy alta | Alta |

**Mixamo**: sus personajes y animaciones son gratuitos y pueden usarse en proyectos, pero sólo integrados en una obra
(no redistribuibles como recursos sueltos) y requieren cuenta de Adobe para descargarse. Para un repositorio público y
un ZIP que se reparte entre estudiantes, eso complica la redistribución y obliga a servir el proyecto por HTTP.

### Decisión
**Three.js r169 + personajes humanos procedurales instanciados.**
- Cada parte del cuerpo (piernas, torso, brazos, cabeza, cabello, mascarilla) es **un solo `InstancedMesh`** para toda la
  población. Las animaciones (caminar, toser, encorvarse por cansancio, temblar por escalofríos, sujetarse el abdomen,
  reposo en cama) se calculan componiendo matrices por instancia: **~10 llamadas de dibujo para 800 personas**.
- La variedad se logra con colores por instancia (ropa, piel, cabello), estatura (niños, adultos, mayores) y bata de hospital.
- Sin descargas de modelos: funciona **sin conexión y con doble clic**, y **no hay licencias de terceros** para personajes.
- Three.js ≥ r160 sólo se publica como módulo ES; `tools/vendor-three.js` lo convierte una sola vez en un script clásico
  (`js/vendor/three.iife.min.js`) que expone `window.THREE`.
- Los `OrbitControls` oficiales sólo existen como módulo, así que se escribió `orbitControls.js` (ratón + táctil).

Si en el futuro se quisiera usar modelos GLB con esqueleto, la separación motor/vista permite sustituir sólo
`peopleRenderer.js` (sirviendo el proyecto por HTTP).

## 3. Diseño

```
          ┌──────────────── app.js (UI existente: categorías, sliders, pestañas, CSV) ───────────────┐
          │                                                                                          │
  EpidemicModel.solve() ──► ChartRenderer (EDO N=100 000)                                            │
          │                                                                                          │
          └─► EDO con N = nº de agentes ──► ComparisonChart (líneas = EDO, puntos = agentes)        │
                                                                                                     │
  LabController (bucle requestAnimationFrame) ◄──────────── parámetros compartidos ─────────────────┘
     │   advance(dt × velocidad)
     ▼
  EpiEngine  (lógica pura, sin gráficos; ticks fijos de 15 min ⇒ resultados independientes de la velocidad)
     │  agentes · mosquitos · reservorios de agua · camas · historial · eventos
     ├──► Lab3D ─► CityRenderer (escenario, día/noche, aire contaminado, pozos, memorial)
     │          └► PeopleRenderer (personas, iconos, anillos, zonas, gotículas, mosquitos, cadenas)
     ├──► PlanView (2D)
     ├──► HUD + ficha individual
     └──► DidacticPanel (cada evento → su término de la EDO)
```

- **Separación motor/visual**: `epiEngine.js` no conoce Three.js y se prueba en Node (`npm test`).
- **Determinismo reproducible**: generador pseudoaleatorio con semilla (mulberry32). Misma semilla ⇒ misma epidemia.
- **Paso temporal**: el movimiento es continuo; la epidemiología avanza en ticks fijos de 15 minutos. Avanzar a 0,2x o a
  60x produce exactamente la misma dinámica.
- **Búsqueda de vecinos**: rejilla espacial de 3 m (O(N) por tick).
- **Rutinas**: niños a la escuela, adultos a su trabajo (mercado, escuela, hospital, plaza, parque o casa), mayores al mercado
  y al parque; fines de semana distintos; un miembro de cada hogar va al pozo cada día. La cuarentena, el distanciamiento,
  el aislamiento y la enfermedad (reposo, hospital) modifican las rutinas.

## 4. Rendimiento medido

| Escenario | Resultado |
| :--- | :--- |
| 300 personas, sombras activas | ~59 fps (Chrome, portátil con GPU integrada) |
| 800 personas a 60x | ~17 fps; motor ≈ 3 ms/fotograma, actualización de personas ≈ 4,5 ms |
| Escenario estático | ~750 mallas fusionadas por material ⇒ render de 35 ms → 11 ms |
| Calibración al reiniciar | 0,1–0,8 s según población y enfermedad |
| 180 días sin gráficos (Node) | 1–4 s por enfermedad |

Optimizaciones: `InstancedMesh` para personas, árboles, farolas, camas, lápidas, mosquitos y gotículas; geometría estática
fusionada; las personas dejan de proyectar sombra con más de 500 habitantes; `devicePixelRatio` limitado a 1,75; el HUD y
la ficha se actualizan a 5 Hz; los cálculos de calibración se hacen con arreglos planos (`Float64Array`).

## 5. Pruebas realizadas
- `npm test`: 15 enfermedades, 300 personas, hasta 180 días: población conservada (S+E+I+R+D+V = N), R₀ observado de los
  casos índice comparado con el R₀ objetivo, tasa de ataque frente a la EDO con la misma N.
- Navegador (Chrome): carga sin errores de consola; cada enfermedad 30 días sin errores; selección por clic en 3D; vacunar,
  infectar y tratar desde la ficha; fallecimientos que aparecen en el memorial; cambio 3D/2D; todas las pestañas; vista móvil
  375 px sin desbordamiento horizontal.

---

# Versión 6.0 — decisiones técnicas

## Auditoría previa
Se verificó que el código local, la rama `main` del repositorio y el sitio publicado en GitHub Pages eran la misma versión
(5.0, commit `d720058`): el `bundle.js` publicado coincide byte a byte con el local (salvo finales de línea).

## Personajes: ¿por qué seguir con geometría procedural?
| Opción | Ventajas | Desventajas | Modo offline / doble clic | Rendimiento (300–800 personas) |
| :--- | :--- | :--- | :--- | :--- |
| **Esqueleto procedural instanciado (elegida)** | Sin descargas ni licencias, variedad infinita por parámetros, animación ligada al motor (sin deslizamiento), 1 llamada de dibujo por pieza | Estética estilizada (no fotorrealista) | ✅ Funciona con `file://` | ✅ ~25 llamadas de dibujo para toda la población |
| GLB con esqueleto (p. ej. Mixamo) | Personajes y animaciones de alta fidelidad | `GLTFLoader` usa `fetch` → falla con doble clic; licencia de Mixamo no permite redistribuir los archivos sueltos; un `SkinnedMesh` + `AnimationMixer` por persona | ❌ Requiere servidor | ❌ 300–800 mallas con esqueleto; habría que hornear animaciones en texturas |
| React Three Fiber | Ecosistema declarativo | Requiere React + empaquetador; reescritura total | ❌ | Igual que Three.js |

Mejoras de calidad sin cambiar de tecnología: jerarquía de articulaciones (14 piezas + accesorios), rostro, capas de animación con
pesos suavizados exponencialmente (`w ← w + (objetivo − w)(1 − e^{−kΔt})`), fase de marcha ligada a la distancia recorrida,
personalidad por persona, tone mapping ACES, texturas procedurales, cielo con degradado y fusión de geometría estática.

## Patógenos
Modelos procedurales (esferas con espigas distribuidas en espiral de Fibonacci, `LatheGeometry`, `TubeGeometry`, icosaedros) en un
segundo `WebGLRenderer` dedicado al visor; el mismo visor genera las miniaturas de las tarjetas (`toDataURL`). Cada modelo se presenta
como **ilustración conceptual** y las fichas indican tamaño real y estructura descrita en la literatura.

## Pedagogía y separación determinista/estocástica
- El explorador de ecuaciones calcula sus pasos con la **solución RK4** (determinista). El paso RK4 de ejemplo usa las mismas derivadas
  que `epidemicModels.js` (sin el ajuste por saturación hospitalaria, lo que se indica en pantalla).
- La tarjeta de contagio y el panel de eventos muestran en cajas distintas la **probabilidad individual del agente** (P = 1 − e^{−λ})
  y el **valor esperado de la EDO** (β·S·I/N·Δt).
- El recorrido guiado sólo controla cámara y velocidad: los contagios que muestra son los del motor.

## Rendimiento medido (Chrome, GPU integrada, panel de 1440 × 900)
| Escenario | Resultado |
| :--- | :--- |
| 300 personas, sombras | ~38 fps · ~190 llamadas de dibujo · ~0,9 M triángulos (incluye pasada de sombras) |
| 800 personas, 60x | ~33 fps (las personas dejan de proyectar sombra con > 500) |
| Actualización de personas (esqueleto completo) | ≈ 6 ms por fotograma para 300 personas |
| Motor epidemiológico | Sin cambios respecto a 5.0 (mismos resultados con la misma semilla) |

## Pruebas v6
- `npm test`: 15 enfermedades; conservación de la población; coherencia entre instantáneas diarias, historial y registro de contagios;
  **reproducibilidad** (misma semilla ⇒ mismos resultados).
- Navegador: las 15 enfermedades cargadas y simuladas sin errores de consola en los módulos 3D y 2D; recorrido «Aprender la epidemia»
  completo (10 etapas) sin errores; clic en personas, cámaras, capas, mapa con línea de tiempo, explorador de ecuaciones (valores
  verificados a mano), ficha del patógeno; vista móvil (375 px) sin desbordamiento horizontal en ningún módulo.
