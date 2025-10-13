import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const EXTS = new Set(['.tsx', '.ts', '.jsx', '.js']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : EXTS.has(path.extname(p)) ? [p] : [];
  });
}

// capture: default (React or * as React) + named { ... }
const RE_IMPORT = /^\s*import\s+([^;]+?)\s+from\s+['"]react['"]\s*;?\s*$/gm;

function mergeReactImports(src) {
  let m,
    blocks = [];
  while ((m = RE_IMPORT.exec(src)) !== null) blocks.push(m);

  if (blocks.length <= 1) return src; // rien à fusionner

  let hasDefault = false; // import React from 'react' | import * as React
  const named = new Set();

  for (const b of blocks) {
    const code = b[0];
    // default or namespace?
    if (/import\s+(?:\*\s+as\s+React|React)(\s*,\s*\{[^}]*\})?\s+from\s+['"]react['"]/.test(code)) {
      hasDefault = true;
      const mNamed = code.match(/\{([^}]*)\}/);
      if (mNamed && mNamed[1]) {
        mNamed[1]
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .forEach(s => named.add(s));
      }
      continue;
    }
    // named-only
    const mNamedOnly = code.match(/import\s+\{([^}]*)\}\s+from\s+['"]react['"]/);
    if (mNamedOnly && mNamedOnly[1]) {
      mNamedOnly[1]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .forEach(s => named.add(s));
    }
  }

  // supprimer tous les imports react
  src = src.replace(RE_IMPORT, '').replace(/^\s*\n+/g, '');

  // reconstituer proprement
  const namedList = Array.from(named).filter(n => n && n !== 'React');
  let header = '';
  if (hasDefault && namedList.length)
    header = `import React, { ${namedList.join(', ')} } from "react";\n`;
  else if (hasDefault) header = `import React from "react";\n`;
  else if (namedList.length) header = `import { ${namedList.join(', ')} } from "react";\n`;
  else header = `import React from "react";\n`;

  return header + '\n' + src.trimStart();
}

const files = walk(SRC);
const changed = [];
for (const f of files) {
  const code = fs.readFileSync(f, 'utf8');
  const out = mergeReactImports(code);
  if (out !== code) {
    fs.writeFileSync(f, out, 'utf8');
    changed.push(path.relative(ROOT, f));
  }
}

const report = changed.length
  ? 'React import merged in:\n' + changed.join('\n')
  : 'No merges needed.';
console.log(report);
fs.writeFileSync(path.join(ROOT, 'merge-react-imports.report.txt'), report, 'utf8');
