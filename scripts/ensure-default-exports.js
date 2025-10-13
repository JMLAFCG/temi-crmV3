// scripts/ensure-default-exports.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const PAGES = path.join(ROOT, 'src', 'pages');

const exts = ['.tsx', '.ts', '.jsx', '.js'];
const patched = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files = files.concat(walk(p));
    else if (exts.includes(path.extname(p))) files.push(p);
  }
  return files;
}

function hasDefaultExport(code) {
  // assez robuste pour notre besoin
  return /export\s+default\s+/m.test(code);
}

function ensureDefaultExport(file) {
  const code = fs.readFileSync(file, 'utf8');
  if (hasDefaultExport(code)) return false;

  // Nom lisible pour le placeholder
  const rel = path.relative(ROOT, file);
  const base = path.basename(file, path.extname(file));
  const compName = base.replace(/[^a-zA-Z0-9]/g, '_') || 'Page';

  const placeholder = `

/* AUTO-GENERATED DEFAULT EXPORT (safe placeholder)
   Ce composant est ajouté car aucun \`export default\` n'a été trouvé dans ${rel}.
   Remplace-le par ton composant principal si nécessaire. */
import React from "react";
const __AutoDefault_${compName} = () => (
  <div style={{padding:24}}>
    <h1>${base}</h1>
    <p>Page en cours de construction (placeholder auto).</p>
  </div>
);
export default __AutoDefault_${compName};
`;

  fs.appendFileSync(file, placeholder, 'utf8');
  patched.push(rel);
  return true;
}

const files = walk(PAGES);
for (const f of files) {
  try {
    ensureDefaultExport(f);
  } catch (e) {
    console.error('Erreur en traitant', f, e.message);
  }
}

if (patched.length) {
  console.log('Default export ajouté dans :');
  for (const p of patched) console.log(' -', p);
} else {
  console.log('Tous les fichiers sous src/pages/** ont déjà un export default.');
}

// Sauvegarde un rapport
fs.writeFileSync(
  path.join(ROOT, 'ensure-default-exports.log'),
  patched.length ? 'Patched:\n' + patched.join('\n') : 'No patch\n',
  'utf8'
);
