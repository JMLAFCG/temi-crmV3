import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const EXTS = new Set(['.tsx', '.ts', '.jsx', '.js']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) out.push(...walk(p));
    else if (EXTS.has(path.extname(p))) out.push(p);
  }
  return out;
}

function unique(arr) {
  return [...new Set(arr)];
}

function normalizeReactImports(code) {
  // Collect all imports from "react"
  const reactImportRE = /^\s*import\s+([^;]+)\s+from\s+['"]react['"]\s*;?\s*$/gm;
  let m,
    lines = [];
  while ((m = reactImportRE.exec(code)) !== null) {
    lines.push(m[0]);
  }
  if (lines.length <= 1) return code; // nothing to dedupe

  // Gather default/namespace + named specifiers
  let hasDefaultOrNamespace = false;
  const named = [];
  for (const l of lines) {
    // default + named: React, { useState, useEffect as UE }
    const mDefault = l.match(
      /import\s+(?:\*\s+as\s+React|React)(?:\s*,\s*\{([^}]+)\})?\s+from\s+['"]react['"]/
    );
    if (mDefault) {
      hasDefaultOrNamespace = true;
      if (mDefault[1])
        named.push(
          ...mDefault[1]
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        );
      continue;
    }
    // named-only: { useState, useMemo as UM }
    const mNamed = l.match(/import\s+\{([^}]+)\}\s+from\s+['"]react['"]/);
    if (mNamed)
      named.push(
        ...mNamed[1]
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      );
  }
  const namedUnique = unique(named).filter(Boolean);

  // Remove all existing react imports
  code = code.replace(reactImportRE, '').replace(/^\s*\n+/g, '');

  // Re-inject normalized imports at top
  let header = '';
  if (hasDefaultOrNamespace) header += `import React from "react";\n`;
  if (namedUnique.length) header += `import { ${namedUnique.join(', ')} } from "react";\n`;
  if (!header) header = `import React from "react";\n`; // ensure default if JSX likely used elsewhere

  return header + '\n' + code.trimStart();
}

function stripAutoPlaceholderBlocks(code) {
  // remove blocks previously appended by auto placeholder
  return code.replace(
    /\n?\/\*\s*AUTO-GENERATED DEFAULT EXPORT[\s\S]*?export\s+default\s+__AutoDefault_[A-Za-z0-9_]+\s*;\s*\n?/g,
    '\n'
  );
}

function ensureSingleDefaultExport(file) {
  let src = fs.readFileSync(file, 'utf8');
  const original = src;

  // 0) Quick skip for re-export barrels (e.g. "export * from './X'")
  if (/^\s*export\s+\*\s+from\s+['"].+['"]\s*;?\s*$/m.test(src)) return false;

  // 1) Remove auto placeholder blocks if any
  src = stripAutoPlaceholderBlocks(src);

  // 2) Normalize react imports (dedupe React default import and gather named)
  src = normalizeReactImports(src);

  // 3) If there are multiple default exports, remove duplicates keeping first non-placeholder
  const defaultMatches = [...src.matchAll(/export\s+default\s+/g)];
  if (defaultMatches.length > 1) {
    let firstIdx = defaultMatches[0].index || 0;
    let before = src.slice(0, firstIdx + 'export default '.length);
    let after = src.slice(firstIdx + 'export default '.length);
    // Remove subsequent default exports
    after = after.replace(/[\s\S]*?export\s+default\s+/g, m =>
      m.replace(/export\s+default\s+/g, '// removed duplicate default ')
    );
    src = before + after;
  }

  // 4) If no default export, convert common patterns and add one at EOF
  if (!/export\s+default\s+/m.test(src)) {
    // Transform "export const Name = …" -> "const Name = …"
    src = src.replace(
      /^\s*export\s+const\s+([A-Za-z0-9_]+)\s*:\s*React\.FC\s*=\s*\(/m,
      'const $1: React.FC = ('
    );
    src = src.replace(/^\s*export\s+const\s+([A-Za-z0-9_]+)\s*=\s*\(/m, 'const $1 = (');
    // Transform "export function Name(" -> "function Name("
    src = src.replace(/^\s*export\s+function\s+([A-Za-z0-9_]+)\s*\(/m, 'function $1(');

    // Choose component name: prefer a name matching file base
    const base = path.basename(file, path.extname(file));
    const candidates = [...src.matchAll(/^\s*(?:const|function)\s+([A-Za-z0-9_]+)\b/gm)].map(
      m => m[1]
    );
    let name = candidates.find(n => n.toLowerCase() === base.toLowerCase()) || candidates[0];

    if (!name) {
      // Last resort: create minimal component and default export
      name = base.replace(/[^A-Za-z0-9_]/g, '_') || 'Page';
      src += `

import React from "react";
const ${name}: React.FC = () => (<div style={{padding:24}}>${base}</div>);
`;
    }
    src = src.replace(/\s*$/, `\n\nexport default ${name};\n`);
  }

  if (src !== original) {
    fs.writeFileSync(file, src.replace(/\s+$/, '') + '\n', 'utf8');
    return true;
  }
  return false;
}

const files = walk(PAGES_DIR);
const changed = [];
for (const f of files) {
  try {
    if (ensureSingleDefaultExport(f)) changed.push(path.relative(ROOT, f));
  } catch (e) {
    console.error('Erreur sur', f, '=>', e.message);
  }
}

const report = changed.length ? 'Patched files:\n' + changed.join('\n') : 'No changes needed.';
console.log(report);
fs.writeFileSync(path.join(ROOT, 'fix-default-exports.report.txt'), report, 'utf8');
