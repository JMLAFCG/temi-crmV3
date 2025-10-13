// scripts/clean-react-duplicates.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES = path.join(ROOT, 'src', 'pages');
const EXTS = ['.tsx', '.jsx', '.ts', '.js'];

const isPageFile = f => EXTS.includes(path.extname(f));
const read = f => fs.readFileSync(f, 'utf8');
const write = (f, s) => fs.writeFileSync(f, s.replace(/\s+$/, '') + '\n', 'utf8');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : isPageFile(p) ? [p] : [];
  });
}

const files = walk(PAGES);
const changed = [];

for (const file of files) {
  let src = read(file);
  let orig = src;

  // 1) Marqueur placeholder ?
  const hasAuto = /AUTO-GENERATED DEFAULT EXPORT|__AutoDefault_/m.test(src);

  // 2) Dédupliquer imports React
  //   - garde un seul import React (default OU namespace), supprime le reste
  //   - normalise en: import React from "react";
  //   - place-le en tête (après éventuels commentaires shebang/pragma)
  const imports = [];
  src = src.replace(/^\s*import\s+(\*\s+as\s+React|React)\s+from\s+['"]react['"];\s*$/gm, m => {
    imports.push(m);
    return '';
  });
  if (imports.length > 0) {
    // s'il existe déjà un import React d'un autre style (rare), on l'écrase
    src = src.replace(/^\s*import\s+(\*\s+as\s+React|React)\s+from\s+['"]react['"];\s*$/gm, '');
    // insérer au tout début (après éventuels commentaires licence)
    const firstCodeIdx = 0;
    src = `import React from "react";\n` + src.trimStart();
  } else {
    // si aucun import React ET que le fichier utilise JSX (heuristique simple), ajoute-le
    if (/<[A-Za-z]/.test(src) && !/\/\*\s*@jsxRuntime\s*:\s*automatic\s*\*\//.test(src)) {
      src = `import React from "react";\n` + src.trimStart();
    }
  }

  // 3) S'il y a plusieurs export default, supprimer les placeholders et ne garder qu'un seul
  const defaultCount = (src.match(/export\s+default\s+/g) || []).length;
  if (defaultCount > 1) {
    // enlever tout bloc placeholder auto
    src = src.replace(
      /\n?\/\*\s*AUTO-GENERATED DEFAULT EXPORT[\s\S]*?export\s+default\s+__AutoDefault_[A-Za-z0-9_]+\s*;\s*\n?/g,
      '\n'
    );
  }

  // 4) Encore plusieurs export default ? garde le premier, supprime les suivants (sécurise)
  if ((src.match(/export\s+default\s+/g) || []).length > 1) {
    let seen = false;
    src = src.replace(/export\s+default\s+/g, m => {
      if (seen) return '// REMOVED_DUPLICATE_' + m;
      seen = true;
      return m;
    });
  }

  if (src !== orig) {
    write(file, src);
    changed.push(path.relative(ROOT, file));
  }
}

const report = changed.length ? 'Changed files:\n' + changed.join('\n') : 'No changes needed.';
console.log(report);
fs.writeFileSync(path.join(ROOT, 'clean-react-duplicates.log'), report, 'utf8');
