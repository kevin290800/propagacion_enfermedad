/**
 * Convierte el build ES-Module oficial de Three.js (three.module.min.js, licencia MIT)
 * en un script clásico (IIFE) que expone window.THREE.
 *
 * ¿Por qué? EpiDynamics debe seguir funcionando con doble clic sobre index.html (file://),
 * donde los navegadores bloquean los <script type="module"> locales por CORS.
 * Desde r160 Three.js ya no publica build UMD, por eso hacemos esta conversión una sola vez.
 *
 * Uso:  node tools/vendor-three.js <ruta/three.module.min.js>
 * Salida: js/vendor/three.iife.min.js
 */
const fs = require('fs');
const path = require('path');

const src = process.argv[2];
if (!src) { console.error('Uso: node tools/vendor-three.js <three.module.min.js>'); process.exit(1); }
let code = fs.readFileSync(src, 'utf-8');

const idx = code.lastIndexOf('export{');
if (idx < 0) throw new Error('No se encontró la sentencia export{...} final');
const end = code.indexOf('}', idx);
const body = code.slice(idx + 7, end);
const pairs = body.split(',').map((p) => {
  const m = p.trim().match(/^([\w$]+)(?:\s+as\s+([\w$]+))?$/);
  if (!m) throw new Error('Export no reconocido: ' + p);
  return `${m[2] || m[1]}:${m[1]}`;
});
if (/\bimport\s*[{*\w]/.test(code.slice(0, 2000)) ) throw new Error('El build contiene imports; use un build autocontenido (r159-r170).');

const header = code.slice(0, code.indexOf('*/') + 2);
code = code.slice(code.indexOf('*/') + 2, idx) + code.slice(end + 1).replace(/^;/, '');
const out = `${header}\n/* Convertido a IIFE por tools/vendor-three.js para EpiDynamics (compatibilidad file://) */\n(function(){${code}\nwindow.THREE=Object.freeze({${pairs.join(',')}});})();\n`;
const outPath = path.join(__dirname, '..', 'js', 'vendor', 'three.iife.min.js');
fs.writeFileSync(outPath, out, 'utf-8');
console.log(`✅ ${outPath} (${(out.length / 1024).toFixed(0)} KB, ${pairs.length} exports)`);
