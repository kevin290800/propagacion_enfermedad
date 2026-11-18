/**
 * Generador de Bundle Autónomo para el Simulador
 * Une todos los módulos en js/bundle.js para permitir que funcione directamente
 * tanto abriendo index.html con doble clic en Windows (file://) como en servidor web (http://)
 */

const fs = require('fs');
const path = require('path');

const files = [
  'js/data/diseasesData.js',
  'js/data/pathogens.js',
  'js/models/epidemicModels.js',
  'js/simulation/diseaseProfiles.js',
  'js/simulation/townMap.js',
  'js/simulation/epiEngine.js',
  'js/components/chartRenderer.js',
  'js/components/mathRenderer.js',
  'js/components/mathExplorer.js',
  'js/render3d/orbitControls.js',
  'js/render3d/cityRenderer.js',
  'js/render3d/peopleRenderer.js',
  'js/render3d/lab3d.js',
  'js/render3d/pathogenViewer.js',
  'js/render2d/planView.js',
  'js/components/transmissionDiagram.js',
  'js/components/didacticPanel.js',
  'js/components/comparisonChart.js',
  'js/components/diseaseGallery.js',
  'js/components/labController.js',
  'js/components/learnTour.js',
  'js/app.js'
];

let bundleContent = `/**
 * EpiDynamics 6.0 - Bundle Autónomo (requiere js/vendor/three.iife.min.js cargado antes)
 * Matemáticas 4 - Modelado Matemático y Ecuaciones Diferenciales
 * Generado automáticamente: ${new Date().toISOString()}
 */
(function() {
  'use strict';
\n`;

files.forEach((file) => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Remover imports y exports de ES6
  content = content.replace(/^import\s+.*?from\s+['"].*?['"];?\r?\n/gm, '');
  content = content.replace(/^export\s+(const|let|var|class|function)\s+/gm, '$1 ');
  content = content.replace(/^export\s+default\s+/gm, '');
  content = content.replace(/^export\s*\{[^}]*\};?\r?\n/gm, '');

  bundleContent += `  // === Inicio de ${file} ===\n`;
  bundleContent += content;
  bundleContent += `\n  // === Fin de ${file} ===\n\n`;
});

bundleContent += `})();\n`;

fs.writeFileSync(path.join(__dirname, 'js/bundle.js'), bundleContent, 'utf-8');
console.log('✅ Bundle generado exitosamente en js/bundle.js (' + (bundleContent.length / 1024).toFixed(1) + ' KB)');
