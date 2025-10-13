#!/usr/bin/env node

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

function validateFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(ROOT, file);

  const issues = [];

  // Vérifier l'export par défaut
  const defaultExports = [...content.matchAll(/export\s+default\s+/g)];
  if (defaultExports.length === 0) {
    issues.push('❌ Aucun export par défaut');
  } else if (defaultExports.length > 1) {
    issues.push(`❌ ${defaultExports.length} exports par défaut (doit être exactement 1)`);
  }

  // Vérifier les imports React dupliqués
  const reactImports = [...content.matchAll(/^\s*import\s+.*from\s+['"]react['"]/gm)];
  if (reactImports.length > 2) {
    issues.push(`⚠️ ${reactImports.length} imports React (possibles doublons)`);
  }

  // Vérifier les blocs auto-générés
  if (content.includes('AUTO-GENERATED DEFAULT EXPORT')) {
    issues.push('⚠️ Contient des blocs auto-générés');
  }

  return { file: relativePath, issues };
}

function main() {
  console.log('🔍 Validation des exports et imports...\n');

  const files = walk(PAGES_DIR);
  const results = files.map(validateFile);

  const filesWithIssues = results.filter(r => r.issues.length > 0);
  const cleanFiles = results.filter(r => r.issues.length === 0);

  if (cleanFiles.length > 0) {
    console.log(`✅ ${cleanFiles.length} fichiers valides:`);
    cleanFiles.forEach(r => console.log(`   ${r.file}`));
    console.log('');
  }

  if (filesWithIssues.length > 0) {
    console.log(`❌ ${filesWithIssues.length} fichiers avec des problèmes:\n`);
    filesWithIssues.forEach(result => {
      console.log(`📄 ${result.file}`);
      result.issues.forEach(issue => console.log(`   ${issue}`));
      console.log('');
    });

    console.log('💡 Pour corriger automatiquement:');
    console.log('   npm run fix:default-exports');
    console.log('');

    process.exit(1);
  }

  console.log('🎉 Tous les fichiers sont valides!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
