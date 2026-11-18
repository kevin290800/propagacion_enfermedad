# 🦠 EpiDynamics 6.0 — Laboratorio Virtual de Propagación de Enfermedades
### Proyecto para **Matemáticas 4** (Ecuaciones Diferenciales Ordinarias y Sistemas Dinámicos)

---

## 📖 Descripción General

**EpiDynamics** es una plataforma web interactiva para explorar cómo se propaga una enfermedad infecciosa.
La versión 6.0 evoluciona la 5.0 (que a su vez evolucionó la 4.0, sin reemplazarla) hacia un **laboratorio virtual 3D**: una pequeña
comunidad con calles, viviendas, escuela, mercado, plaza, parque, hospital y pozos de agua, donde **cientos de
personas animadas** viven su rutina diaria mientras un motor epidemiológico decide —con reglas matemáticas— quién
se contagia, quién enferma, quién se recupera, quién necesita hospital y quién fallece.

Combina dos enfoques complementarios que **nunca se mezclan**:

1. **Enfoque macroscópico DETERMINISTA**: sistemas de EDO (SIR, SIS, SEIR, SIRD, SEIRD) resueltos con
   **Runge-Kutta de 4º orden (RK4)**. Es el mismo motor de la versión 4.0, sin cambios en sus fórmulas.
2. **Enfoque microscópico ESTOCÁSTICO**: un modelo basado en agentes donde cada persona es un individuo con
   identificador, posición, velocidad, rutina, estado epidemiológico, tiempos de incubación/infección,
   historial clínico, contactos y árbol de contagios. Usa los **mismos parámetros** (R₀, 1/σ, 1/γ, letalidad,
   vacunación, cuarentena, capacidad hospitalaria) y se calibra para que un caso índice produzca, en promedio, R₀ contagios.

La gráfica **“Agentes vs EDO”** resuelve la EDO con la misma población y las mismas condiciones iniciales que los
agentes: las **líneas** son deterministas y los **puntos** son la realización estocástica. Así el estudiante ve
dónde coinciden y por qué difieren.

**Publicado en:** https://alejostone1.github.io/Simulacion_Propagacion/

---

## ✨ Novedades de la versión 6.0

| Área | Qué cambió |
| :--- | :--- |
| 👤 Personajes | Esqueleto procedural con rodillas, codos, manos, calzado y rostro (ojos que parpadean, boca expresiva); 4 peinados, faldas, mochilas, batas de hospital; animaciones por capas: caminar/correr sin deslizar, conversar, saludar, sentarse, toser, **estornudar**, respirar con dificultad, escalofríos, debilidad, reposo y recuperación. |
| 🏙️ Escenario | Texturas procedurales, tejados a dos aguas, bordillos y pasos de cebra, fuente animada, mercado con toldos, patio escolar, hospital con ambulancia, parque con estanque, cielo y nubes, **tráfico que cede el paso a los peatones**. |
| 🎥 Cámara | Encuadres general / aéreo / calle / primer plano / seguimiento con transiciones, y **cámara de contagios** automática. |
| 🦠 Patógenos | **Modelo 3D conceptual distinto para cada uno de los 15 agentes**, ficha biológica (tipo, tamaño, genoma, estructura, órganos, vector) y animación del mecanismo de transmisión. Tarjetas visuales por categoría. |
| ✨ Contagio visible | Gotículas/aerosoles viajando entre personas, pulsos de contacto, picaduras, agua contaminada, aerosoles suspendidos en interiores — siempre a partir de contagios **reales** del motor. |
| 🗺️ Mapa 2D | Mapa de calor, densidad, rutas por mecanismo, fuentes contaminadas, estadísticas por lugar y vía, y **línea de tiempo para revisar cualquier día**. |
| 📐 Matemáticas | Cada ecuación con **tabla de variables y unidades** y **procedimiento paso a paso con números**, incluido un paso completo de RK4. Cada contagio separa el cálculo **probabilístico del agente** del **esperado de la EDO**. |
| 🎓 Aprender | Recorrido guiado de **10 etapas** con animación, fórmula, variables y pregunta de comprensión. |
| 🧭 Interfaz | Módulos (Inicio, Enfermedades, Simulación 3D, Mapa 2D, Modelos, Gráficas, EDO vs agentes, Aprender) y paneles desplegables. |

Detalle completo: [docs/CAMBIOS_v6.md](docs/CAMBIOS_v6.md).

---

## 🚀 Cómo Ejecutar la Aplicación

### Método 1: Doble clic (recomendado, sin instalación ni Internet)
1. Abre la carpeta del proyecto.
2. Haz **doble clic en `index.html`** (o en `Abrir_Simulador.bat` en Windows).
3. Funciona en Chrome, Edge, Firefox y Safari modernos (requiere WebGL; si no está disponible se usa la vista 2D).

> Three.js va incluido localmente (`js/vendor/three.iife.min.js`), por lo que el escenario 3D funciona sin conexión.
> Sólo KaTeX (fórmulas bonitas) se carga de Internet, y tiene un respaldo en texto si no hay conexión.

### Método 2: Servidor local
```bash
npx serve .
```
o
```bash
python -m http.server 8000
```
y abre `http://localhost:8000`.

### Para desarrolladores
```bash
npm run build      # regenera js/bundle.js a partir de los módulos de js/
npm test           # prueba sin navegador del motor de agentes (15 enfermedades)
```
No hay dependencias que instalar: sólo se necesita Node.js para estos dos comandos.

---

## 🎮 Cómo usar el laboratorio

| Acción | Cómo |
| :--- | :--- |
| Iniciar / pausar | Botón **▶ Iniciar** o tecla **Espacio** |
| Avanzar un día | **+1 Día** o tecla **→** |
| Velocidad | 🐢 0.05x (≈ tiempo real, caminar natural) · 0.2x · 1x (1 día = 30 s) · 5x · 20x · 60x (1 día = 0,5 s) |
| Cámara | Botones 🏙️ general · 🛰️ aérea · 🚶 calle · 🔍 primer plano · 🎥 seguir; 🗂️ capas (incluye 📸 cámara de contagios) |
| Recorrido guiado | Módulo **🎓 Aprender** → Comenzar el recorrido |
| Revisar un día pasado | Clic en la gráfica *EDO vs agentes* o línea de tiempo del *Mapa 2D* |
| Mover la cámara | Arrastrar = girar · clic derecho / Shift = desplazar · rueda / pellizco = zoom |
| Ver la ficha de una persona | Herramienta **🔍 Seleccionar** y clic sobre ella |
| Infectar / vacunar / tratar | Herramientas **🦠 / 💉 / 💊** y clic sobre una persona |
| Brote en un lugar | **💥 Brote aquí** y clic en el suelo, o **Brote +5** al azar |
| Explicar un contagio | **🔎 Explicar el próximo contagio**: pausa la simulación en el siguiente contagio y abre la ficha |
| Seguir a una persona | Botón **🎥 Seguir** en su ficha |
| Capas visuales | Zonas de contagio · cadenas de contagio · contactos del seleccionado · techos · sombras |
| Mapa 2D | Módulo **🗺️ Mapa 2D** (mapa epidemiológico analítico del mismo motor) |
| Repetir con otro azar | **🎲 Nueva realización aleatoria** (cambia la semilla) |
| Exportar | **CSV EDO** (determinista) y **CSV Agentes** (estocástico), en archivos separados |

### Qué representa cada persona (no sólo colores)

| Estado | Apariencia y comportamiento |
| :--- | :--- |
| **S** Susceptible | Camina normal, anillo azul |
| **E** Expuesto | Icono “?” ámbar, anillo pulsante; incuba y aún no contagia |
| **I** Infectado | Icono de virus rojo, síntomas según la enfermedad: tos con nube de gotículas, cansancio (camina lento y encorvado), escalofríos (tiembla), agitación, exantema o ictericia (tono de piel), deshidratación (se sujeta el abdomen), reposo en cama |
| Grave | Cruz roja; traslado al hospital y cama con bata. Si no hay camas: reposo en casa con mayor riesgo |
| **R** Recuperado | Marca ✓ verde durante unos días, anillo verde |
| **D** Fallecido | Una vela se eleva en su lugar y aparece una lápida con flores en el **jardín memorial** (sin animaciones inapropiadas) |
| **V** Vacunado | Escudo morado |
| Aislado | Icono de casa: se queda en su vivienda |

---

## 🧬 Mecanismos de transmisión (no todas las enfermedades se contagian igual)

| Mecanismo | Enfermedades | Cómo se simula |
| :--- | :--- | :--- |
| 🫁 **Respiratorio** | COVID-19, sarampión, gripe, varicela, tuberculosis | Gotículas por cercanía (kernel gaussiano, < 3 m) + **aerosoles** en espacios cerrados compartidos (casas, escuela, mercado). Las zonas cerradas se tiñen de rojo según la carga de aerosoles. |
| 🤝 **Contacto directo** | Ébola, mpox, rabia | Sólo contactos físicos muy cercanos (< 1,5 m) y convivencia/cuidado en el hogar. Sin transmisión por aire. |
| 🦟 **Vectorial** | Dengue, fiebre amarilla, malaria, zika | **Mosquitos** como agentes (sanos, incubando, infecciosos). Pican a la persona más cercana; el humano infectado contagia al mosquito, que tras el periodo extrínseco de incubación (6 días) contagia a otras personas. **No hay contagio persona a persona.** Criaderos de agua estancada visibles. |
| 💧 **Hídrico** | Cólera | Los infectados contaminan la fuente de agua de su casa (pozo norte, pozo sur o fuente de la plaza). Quien bebe de una fuente contaminada se expone. El color del agua indica el nivel de contaminación. |

---

## 📐 Del individuo a la ecuación: el modelo de agentes

**Probabilidad de contagio.** En cada paso de 15 minutos, cada susceptible acumula una “dosis”
$$\lambda_j = c\,\Delta t \sum_{i\in I} m_i\, m_j\, K(d_{ij}) \;+\; c\,\Delta t\, w_{\text{aire}}\, f_{\text{lugar}} \sum_{i \in I,\ \text{mismo lugar}} m_i$$
y se contagia con probabilidad $P = 1 - e^{-\lambda_j}$, donde $K(d)=e^{-d^2/2s^2}$ es el kernel de distancia,
$m$ los factores de mascarilla y $f_{\text{lugar}}$ el factor de aire compartido (mayor en espacios pequeños).

**Calibración con R₀.** Antes de cada simulación se ejecutan 2 días de rutina **sin enfermedad** y se mide la exposición
diaria $e_{ij}$ entre cada pareja de personas. Luego se resuelve (bisección) la constante $c$ tal que
$$R_0 = \frac{1}{n}\sum_i \sum_j \mathbb{E}_T\!\left[1 - e^{-c\, e_{ij}\, T}\right],$$
es decir, un caso índice contagia en promedio exactamente R₀ personas. Usar $1-e^{-x}$ (y no la exposición lineal)
tiene en cuenta que a la misma persona no se la contagia dos veces (saturación en el hogar). Incluye que una parte de los
casos guarda reposo en casa y que los graves dejan de circular al ser hospitalizados.

**Vectores (Ross–Macdonald).** $R_0 = \dfrac{m\,a^2\,b_{hm}\,b_{mh}\,e^{-g n}}{g\,(\gamma+\mu)}$, con $m$ mosquitos por persona,
$a$ picaduras/día (corregida por la fracción de picaduras exitosas medida en la calibración), $g$ mortalidad del mosquito y
$n$ periodo extrínseco. Se despeja $b$.

**Agua (tipo Codeço).** $\dfrac{dW}{dt} = \xi\, I - \delta W$, $P_{\text{toma}} = 1-e^{-cW}$ y $R_0 = \dfrac{c\,\xi\,\mathbb{E}[D]}{\delta(\gamma+\mu)}$,
donde $\mathbb{E}[D]$ son las tomas diarias en la fuente de un infectado (medidas en la calibración).

**Transiciones individuales** (equivalentes a los términos de la EDO):

| Transición | EDO | Agente |
| :--- | :--- | :--- |
| S → E (o I) | $\beta S I / N$ | $P = 1-e^{-\lambda}$ por paso |
| E → I | $\sigma E$ | duración de incubación ~ Erlang(3) con media $1/\sigma$ |
| I → R | $\gamma I$ | duración infecciosa ~ Erlang(3) con media $1/\gamma$ |
| I → D | $\mu I,\ \mu=\text{CFR}\cdot\gamma$ | sólo casos graves, con prob. CFR/h (h = tasa de hospitalización); ×2,5 si no hay cama (mismo multiplicador que la EDO) |
| S → V | $\nu\cdot \text{ef}\cdot S$ | prob. $1-e^{-\nu\,\text{ef}\,\Delta t}$ por paso |
| I → S (SIS) | $\gamma I$ vuelve a S | sin inmunidad |

**Rₜ de los agentes.** $\hat R_t = \dfrac{\text{contagios en 7 días}}{\text{días-persona infecciosos en 7 días}} \times T_{inf}$.
**R₀ observado**: promedio de contagios secundarios de los casos índice ya resueltos.

### ¿Por qué los agentes no dan exactamente la curva de la EDO?
- La EDO describe una población infinita y **perfectamente mezclada**; los agentes viven en hogares y lugares concretos.
  El contagio se agota primero dentro de cada familia, por lo que el pico suele ser **menor y más tardío** (muy visible en
  enfermedades de contacto directo, cuyo R₀ es bajo y muy “familiar”).
- **Azar**: con pocos casos iniciales un brote puede extinguirse aunque R₀ > 1 (pulsa “Nueva realización aleatoria”).
- **Duraciones Erlang** (más realistas) en vez de exponenciales.
- **Intervenciones exclusivas del modelo de agentes**: mascarillas, distanciamiento, aislamiento de sintomáticos,
  ventilación, control vectorial y potabilización no tienen término en la EDO (están marcadas como “estocástico”).
- Población pequeña (100–800 personas) frente a 100 000 en la gráfica principal de la EDO.

---

## 🗂️ Catálogo de Enfermedades Incluidas

El simulador cuenta con **15 patologías reales calibradas** con datos de la OMS (WHO) y CDC, organizadas en categorías:

| Categoría | Enfermedad | Modelo EDO | $R_0$ | Incubación | Periodo Infeccioso | Letalidad (CFR) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Respiratorias / Aerosoles** | COVID-19 (Ómicron) | SEIRD | **9.5** | 3.0 días | 6.0 días | 0.18% |
| | COVID-19 (Cepa Ancestral) | SEIRD | **2.8** | 5.2 días | 10.0 días | 2.00% |
| | Sarampión (*Morbillivirus*) | SEIR | **15.0** | 10.0 días | 8.0 días | 0.20% |
| | Gripe Estacional (*Influenza*) | SIR | **1.4** | 2.0 días | 5.0 días | 0.08% |
| | Varicela | SEIR | **11.0** | 14.0 días | 7.0 días | 0.01% |
| | Tuberculosis Pulmonar | SEIRD | **3.2** | 30.0 días | 40.0 días | 8.00% |
| **Transmitidas por Vectores** | Dengue Clásico / Grave | SEIR | **2.5** | 5.5 días | 7.0 días | 0.50% |
| | Fiebre Amarilla | SEIRD | **2.1** | 4.5 días | 6.0 días | 15.00% |
| | Malaria / Paludismo | SIS | **4.2** | 12.0 días | 20.0 días | 1.20% |
| | Virus del Zika | SEIR | **2.2** | 6.0 días | 8.0 días | 0.01% |
| **Contacto Directo / Fluidos** | Ébola (Fiebre Hemorrágica) | SIRD | **1.8** | 8.5 días | 10.0 días | 50.00% |
| | Mpox (Viruela Símica) | SEIRD | **1.6** | 9.0 días | 14.0 días | 1.00% |
| | Rabia Humana | SIRD | **1.1** | 25.0 días | 7.0 días | 99.90% |
| **Hídricas / Digestivas** | Cólera (*Vibrio cholerae*) | SIR | **2.7** | 1.8 días | 5.0 días | 2.50% |
| **Sandbox Experimental** | Personalizada (Laboratorio) | SEIRD | Ajustable | Ajustable | Ajustable | Ajustable |

---

## 📐 Fundamento Matemático del modelo determinista (Mate 4)

### 1. Sistema General de Ecuaciones Diferenciales (SEIRD con Vacunación)
$$\begin{aligned}
\frac{dS}{dt} &= -\frac{\beta S I}{N} - \nu S + \xi R \\[6pt]
\frac{dE}{dt} &= \frac{\beta S I}{N} - \sigma E \\[6pt]
\frac{dI}{dt} &= \sigma E - (\gamma + \mu) I \\[6pt]
\frac{dR}{dt} &= \gamma I - \xi R \\[6pt]
\frac{dD}{dt} &= \mu I \\[6pt]
\frac{dV}{dt} &= \nu S
\end{aligned}$$

Donde:
- $N = S + E + I + R + D + V$ es la población total.
- $\beta$: Tasa de transmisión de contacto efectivo.
- $\sigma = \frac{1}{T_{inc}}$: Tasa de incubación (transición de latente a sintomático/contagioso).
- $\gamma = \frac{1}{T_{inf}}$: Tasa de recuperación (remoción infecciosa).
- $\mu$: Tasa de mortalidad inducida por la enfermedad.
- $\nu$: Tasa de vacunación diaria de susceptibles.
- $\xi$: Tasa de pérdida de inmunidad (si se evalúa pérdida temporal de anticuerpos).

---

### 2. Deducción del Número Reproductivo Básico ($R_0$) y Umbral Epidémico
El brote solo se expande si el número de infectados crece en el tiempo:
$$\frac{dI}{dt} > 0$$

Sustituyendo $\frac{dI}{dt} = \sigma E - (\gamma + \mu) I$, en el modelo SIR clásico con $S \approx N$:
$$\frac{dI}{dt} = I \left( \beta \frac{S}{N} - (\gamma + \mu) \right) \approx I \left( \beta - (\gamma + \mu) \right) > 0$$

Dividiendo entre $(\gamma + \mu)$:
$$R_0 = \frac{\beta}{\gamma + \mu} > 1$$

- Si $R_0 > 1$: Existe un **punto de equilibrio endémico / epidémico** inestable al inicio; la enfermedad se expande exponencialmente provocando una ola epidémica.
- Si $R_0 < 1$: El **punto de equilibrio libre de enfermedad** ($DFE$) es asintóticamente estable; los casos disminuyen monótonamente hasta extinguirse.

---

### 3. Umbral de Inmunidad de Rebaño ($H_{IT}$)
Para frenar la propagación de una enfermedad comunitaria sin necesidad de confinamientos eternos, la proporción mínima de la población con inmunidad esterilizante ($p_c$) debe satisfacer:
$$R_t = R_0 (1 - p_c) \le 1 \implies H_{IT} = 1 - \frac{1}{R_0}$$

*Ejemplo: Para el Sarampión ($R_0 = 15$), $H_{IT} = 1 - \frac{1}{15} \approx 93.3\%$. Se requiere que al menos el 93.3% de la población esté vacunada para erradicar brotes.*

---

### 4. Integrador Numérico: Runge-Kutta de 4to Orden (RK4)
Debido al término acoplado no lineal de contacto bilineal $-\frac{\beta S I}{N}$, el sistema no posee solución elemental cerrada. El simulador evalúa cuatro derivadas intermedias por cada paso de tiempo $h = \Delta t$:

$$\begin{aligned}
\mathbf{k}_1 &= f(t_n, \mathbf{y}_n) \\
\mathbf{k}_2 &= f\left(t_n + \frac{h}{2}, \mathbf{y}_n + \frac{h}{2} \mathbf{k}_1\right) \\
\mathbf{k}_3 &= f\left(t_n + \frac{h}{2}, \mathbf{y}_n + \frac{h}{2} \mathbf{k}_2\right) \\
\mathbf{k}_4 &= f\left(t_n + h, \mathbf{y}_n + h \mathbf{k}_3\right) \\
\mathbf{y}_{n+1} &= \mathbf{y}_n + \frac{h}{6} (\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4)
\end{aligned}$$

**Ventaja matemática**: Error local de truncamiento $O(h^5)$ y error global $O(h^4)$, lo cual garantiza trayectorias continuas estables, suaves y libres del comportamiento oscilatorio inestable del método de Euler hacia adelante.

---

---

## 📁 Estructura del Código Fuente

```text
PropagacionDeUnaEnfermedad/
├── index.html                    # Interfaz (laboratorio 3D + gráficas + didáctica)
├── Abrir_Simulador.bat           # Acceso directo en Windows
├── build.js                      # Genera js/bundle.js (funciona con doble clic, sin CORS)
├── package.json                  # Scripts: npm run build / npm test (sin dependencias)
├── css/
│   ├── styles.css                # Estilos originales (tema oscuro/claro, móvil)
│   └── lab.css                   # Estilos del laboratorio 3D, HUD, ficha y didáctica
├── js/
│   ├── app.js                    # Orquestador principal
│   ├── bundle.js                 # Archivo compilado (generado)
│   ├── vendor/three.iife.min.js  # Three.js r169 (MIT) como script clásico
│   ├── data/diseasesData.js      # Catálogo de 15 enfermedades (sin cambios)
│   ├── data/pathogens.js         # Fichas biológicas de los 15 agentes (v6)
│   ├── models/epidemicModels.js  # EDO + RK4 (sin cambios)
│   ├── simulation/
│   │   ├── epiEngine.js          # Motor de agentes estocástico (lógica pura, sin gráficos)
│   │   ├── townMap.js            # Mapa de la comunidad y rutas peatonales
│   │   └── diseaseProfiles.js    # Mecanismo de transmisión y síntomas visibles por enfermedad
│   ├── render3d/
│   │   ├── lab3d.js              # Renderer, cámara, luces, día/noche
│   │   ├── cityRenderer.js       # Escenario procedural (geometría estática fusionada)
│   │   ├── peopleRenderer.js     # Personas animadas con InstancedMesh, iconos, mosquitos, cadenas
│   │   ├── orbitControls.js      # Cámara orbital ratón/táctil
│   │   └── pathogenViewer.js     # Patógenos 3D conceptuales y miniaturas (v6)
│   ├── render2d/planView.js      # Mapa epidemiológico 2D analítico (v6)
│   └── components/
│       ├── chartRenderer.js      # Gráfica EDO (sin cambios)
│       ├── mathRenderer.js       # Teoría y fórmulas (sin cambios)
│       ├── comparisonChart.js    # Agentes (puntos) vs EDO (líneas) con la misma N
│       ├── didacticPanel.js      # Eventos explicados matemáticamente + conceptos
│       ├── labController.js      # Bucle de animación, HUD, cámara, tarjeta de contagio y ficha individual
│       ├── mathExplorer.js       # Ecuaciones con variables, unidades y procedimientos (v6)
│       ├── learnTour.js          # Modo «Aprender la epidemia» (v6)
│       ├── diseaseGallery.js     # Tarjetas de enfermedades y ficha del patógeno (v6)
│       └── transmissionDiagram.js# Animación del mecanismo de transmisión (v6)
├── tools/
│   ├── vendor-three.js           # Convierte three.module.min.js → script clásico
│   └── test-engine.mjs           # Prueba del motor sin navegador
└── docs/
    ├── ARQUITECTURA.md           # Diseño, decisiones técnicas e investigación de librerías
    └── CAMBIOS.md                # Registro de modificaciones 4.0 → 5.0
```

Más detalles en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) y [docs/CAMBIOS.md](docs/CAMBIOS.md).

## ⚖️ Licencias de recursos
- **Three.js r169** — licencia MIT (copia en `js/vendor/LICENSE-three.txt`).
- **KaTeX** (CDN, opcional) — licencia MIT.
- **Personajes, edificios, iconos y texturas**: generados por código en este proyecto (sin modelos ni imágenes de terceros),
  por lo que no hay restricciones de licencia adicionales.

---
*Desarrollado para la asignatura de Matemáticas 4 · Modelado Matemático y Ecuaciones Diferenciales.*
