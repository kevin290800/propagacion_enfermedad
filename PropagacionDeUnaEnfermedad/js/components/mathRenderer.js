/**
 * Módulo de Renderizado Matemático y Teoría de Modelado EDO
 * Adaptado para la materia de Matemáticas 4 (Ecuaciones Diferenciales y Modelado Matemático)
 * - Renderizado dual: KaTeX (si hay conexión) + HTML/SVG Math Engine nativo (resiliente offline)
 * - Explicación detallada de términos, deducciones analíticas y método numérico RK4
 */

export class MathRenderer {
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
