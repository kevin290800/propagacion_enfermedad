// Prueba sin navegador del motor de agentes: calibración, conservación de la población y comparación con la EDO.
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);
const { EpiEngine } = await imp('js/simulation/epiEngine.js');
const { DISEASES } = await imp('js/data/diseasesData.js');
const { EpidemicModel } = await imp('js/models/epidemicModels.js');

const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(DISEASES);
let fail = 0;
for (const id of ids) {
  const d = DISEASES[id];
  const e = new EpiEngine();
  e.setDisease(d);
  e.setParams({ modelType: d.modelType, r0: d.r0, incubationDays: d.incubationDays, infectiousDays: d.infectiousDays,
    fatalityRate: d.fatalityRate, hospitalCapacityRate: d.hospitalizationRate || 0.05 });
  const t0 = Date.now();
  e.reset({ population: 300, initialInfected: 12, seed: +(process.env.SEED||7) });
  const tCal = Date.now() - t0;
  const days = Math.min(180, Math.max(60, Math.round((d.incubationDays + d.infectiousDays) * 10)));
  const t1 = Date.now();
  for (let k = 0; k < days * 4; k++) e.advance(0.25);
  const tRun = Date.now() - t1;
  const c = e.countStates();
  const total = c.S + c.E + c.I + c.R + c.D + c.V;
  if (total !== 300) { fail++; console.log('❌ población no conservada', id, total); }
  // v6: instantáneas diarias y registro de contagios coherentes con el motor
  if (e.snapshots.length !== e.history.length) { fail++; console.log('❌ instantáneas != historial', id, e.snapshots.length, e.history.length); }
  if (e.infectionLog.length !== e.cumulative) { fail++; console.log('❌ registro de contagios != acumulados', id, e.infectionLog.length, e.cumulative); }
  const lastSnap = e.snapshots[e.snapshots.length - 1];
  const hs = e.history[e.history.length - 1];
  const cS = Array.from(lastSnap.s).filter((x) => x === 0).length;
  if (cS !== hs.S) { fail++; console.log('❌ instantánea no coincide con el historial', id); }
  // reproducibilidad: misma semilla ⇒ misma epidemia
  if (id === ids[0]) {
    const e2 = new EpiEngine(); e2.setDisease(d); e2.setParams({ ...e.params });
    e2.reset({ population: 300, initialInfected: 12, seed: +(process.env.SEED || 7) });
    for (let k = 0; k < days * 4; k++) e2.advance(0.25);
    if (e2.cumulative !== e.cumulative || e2.countStates().D !== c.D) { fail++; console.log('❌ no reproducible con la misma semilla'); }
    else console.log('✅ reproducible: misma semilla ⇒ mismos resultados');
  }
  const ode = EpidemicModel.solve({ modelType: d.modelType, r0: d.r0, incubationDays: d.incubationDays, infectiousDays: d.infectiousDays,
    fatalityRate: d.fatalityRate, hospitalCapacityRate: d.hospitalizationRate || 0.05, ...e.initialConditions(), days });
  const odeAttack = (ode.summary.totalInfectedCumulative / 300 * 100).toFixed(0);
  const r0o = e.observedR0();
  console.log(`${id.padEnd(18)} ${e.mechanism.padEnd(11)} k̄=${e.kMean.toFixed(2).padStart(6)} cal=${tCal}ms run=${tRun}ms días=${days} ` +
    `infecciones acum.=${(e.cumulative / 300 * 100).toFixed(0)}% EDO=${odeAttack}% D=${c.D} R0obs=${r0o ? r0o.value.toFixed(2) : "-"} reach=${e.r0Reachable} (R0=${d.r0})` +
    (e.mechanism === 'vector' ? ` mosq=${e.mosquitoes.length} b=${e.vector.b.toFixed(2)} f=${e.biteSuccess.toFixed(2)}` : ''));
}
console.log(fail ? `❌ ${fail} verificación(es) fallaron` : `✅ Todas las verificaciones pasaron (${ids.length} enfermedades)`);
process.exit(fail ? 1 : 0);
