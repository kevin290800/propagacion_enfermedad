# Registro de cambios: EpiDynamics 4.0 → 5.0

## Archivos nuevos
| Archivo | Propósito |
| :--- | :--- |
| `js/simulation/epiEngine.js` | Motor de agentes estocástico: rutinas, movimiento por calles, 4 mecanismos de transmisión, calibración con R₀, progresión clínica, hospital, vacunación, historial, árbol de contagios, Rₜ de agentes. |
| `js/simulation/townMap.js` | Mapa de la comunidad (64 lugares), fuentes de agua, criaderos, camas, memorial y rutas peatonales. |
| `js/simulation/diseaseProfiles.js` | Mecanismo de transmisión y síntomas visibles de cada una de las 15 enfermedades. |
| `js/render3d/lab3d.js` | Renderer WebGL, cámara, luces, ciclo día/noche, selección por clic. |
| `js/render3d/cityRenderer.js` | Escenario 3D procedural con geometría estática fusionada. |
| `js/render3d/peopleRenderer.js` | Personas animadas instanciadas, iconos de estado, anillos, zonas de contagio, gotículas, mosquitos, cadenas de contagio y contactos. |
| `js/render3d/orbitControls.js` | Cámara orbital (ratón y táctil). |
| `js/render2d/planView.js` | Vista 2D en planta del mismo motor (conserva la experiencia 2D original). |
| `js/components/labController.js` | Bucle de animación, HUD, herramientas de puntero, ficha epidemiológica individual. |
| `js/components/didacticPanel.js` | Eventos explicados matemáticamente y tarjetas de conceptos. |
| `js/components/comparisonChart.js` | Agentes (puntos) vs EDO (líneas) con la misma población. |
| `js/vendor/three.iife.min.js` + `LICENSE-three.txt` | Three.js r169 (MIT) como script clásico. |
| `css/lab.css` | Estilos del laboratorio. |
| `tools/vendor-three.js`, `tools/test-engine.mjs` | Conversión de Three.js y prueba del motor. |
| `package.json` | Scripts `build` y `test` (sin dependencias). |
| `docs/ARQUITECTURA.md`, `docs/CAMBIOS.md` | Documentación. |

## Archivos modificados
| Archivo | Cambio |
| :--- | :--- |
| `index.html` | Nuevo laboratorio 3D como elemento principal; barra de herramientas, capas visuales, HUD, ficha, leyenda con iconos, gráfica comparativa, panel didáctico; sliders de población de agentes, casos iniciales, capacidad hospitalaria, aislamiento, ventilación, control vectorial y potabilización; velocidades 0,2x–60x; dos exportaciones CSV separadas. Se conservan todos los controles anteriores. |
| `js/app.js` | Conecta los parámetros a la EDO (sin cambios en sus fórmulas) y al motor de agentes; las mascarillas y el distanciamiento se aplican en vivo sin reiniciar; KPI etiquetados como EDO o Agentes; Rₜ de la EDO del día actual; atajos de teclado. |
| `build.js` | Lista de módulos ampliada. |
| `README.md` | Documentación actualizada (se conserva la sección matemática original). |

## Archivos eliminados
| Archivo | Motivo |
| :--- | :--- |
| `js/simulation/agentSimulation.js` | Sustituido por `epiEngine.js` + `planView.js`, que conservan todas sus funciones con fundamento epidemiológico. Disponible en el commit inicial del repositorio. |

## Archivos SIN cambios (garantía de los modelos matemáticos)
`js/models/epidemicModels.js`, `js/data/diseasesData.js`, `js/components/chartRenderer.js`,
`js/components/mathRenderer.js`, `css/styles.css` (las reglas nuevas están en `lab.css`).
