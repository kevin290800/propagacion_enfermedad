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

import { DISEASE_CATEGORIES, DISEASES } from './data/diseasesData.js';
import { EpidemicModel } from './models/epidemicModels.js';
import { ChartRenderer } from './components/chartRenderer.js';
import { MathRenderer } from './components/mathRenderer.js';
import { LabController } from './components/labController.js';
import { ComparisonChart } from './components/comparisonChart.js';
import { MathExplorer } from './components/mathExplorer.js';
import { LearnTour } from './components/learnTour.js';
import { DiseaseGallery, PathogenModal } from './components/diseaseGallery.js';
import { PathogenViewer } from './render3d/pathogenViewer.js';
import { TransmissionDiagram } from './components/transmissionDiagram.js';
import { getPathogen } from './data/pathogens.js';

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
