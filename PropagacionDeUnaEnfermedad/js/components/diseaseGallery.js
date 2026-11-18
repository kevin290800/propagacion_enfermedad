/**
 * Selector visual de enfermedades (tarjetas por categoría) y ficha animada del patógeno.
 * Los parámetros epidemiológicos se leen del catálogo original (diseasesData.js) sin cambios.
 */
import { DISEASES } from '../data/diseasesData.js';
import { getPathogen, PATHOGEN_TYPES } from '../data/pathogens.js';
import { getDiseaseProfile, MECHANISMS } from '../simulation/diseaseProfiles.js';
import { tex } from './mathExplorer.js';

export const GALLERY_GROUPS = [
  { id: 'resp', title: 'Virus y bacterias respiratorias', icon: '🫁', ids: ['covid19_omicron', 'covid19_ancestral', 'sarampion', 'influenza', 'varicela', 'tuberculosis'] },
  { id: 'water', title: 'Bacterias y enfermedades hídricas', icon: '💧', ids: ['colera'] },
  { id: 'vector', title: 'Transmitidas por vectores', icon: '🦟', ids: ['dengue', 'fiebre_amarilla', 'malaria', 'zika'] },
  { id: 'contact', title: 'Contacto directo / fluidos', icon: '🤝', ids: ['ebola', 'mpox', 'rabia'] },
  { id: 'lab', title: 'Laboratorio experimental', icon: '🧪', ids: ['custom_disease'] }
];

export class DiseaseGallery {
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
export class PathogenModal {
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
