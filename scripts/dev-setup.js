#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');

function runCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    execSync(command, {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    });
    console.log(`✅ ${description} terminé\n`);
  } catch (error) {
    console.error(`❌ Erreur lors de ${description.toLowerCase()}`);
    throw error;
  }
}

function checkFile(filePath, description) {
  const fullPath = path.join(ROOT, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`❌ ${description} manquant: ${filePath}`);
    return false;
  }
}

async function main() {
  console.log("🚀 Configuration de l'environnement de développement\n");

  // Vérifier les fichiers de configuration
  console.log('📋 Vérification des fichiers de configuration:');
  const configFiles = [
    ['.prettierrc', 'Configuration Prettier'],
    ['playwright.config.ts', 'Configuration Playwright'],
    ['tsconfig.json', 'Configuration TypeScript'],
    ['tailwind.config.js', 'Configuration Tailwind'],
    ['vite.config.ts', 'Configuration Vite'],
  ];

  configFiles.forEach(([file, desc]) => checkFile(file, desc));
  console.log('');

  // Installation des dépendances
  runCommand('npm install', 'Installation des dépendances');

  // Installation de Playwright
  runCommand('npx playwright install --with-deps', 'Installation des navigateurs Playwright');

  // Correction des exports
  runCommand('npm run fix:default-exports', 'Correction des exports par défaut');

  // Validation TypeScript
  runCommand('npm run check:types', 'Vérification TypeScript');

  // Linting
  runCommand('npm run check:lint', 'Vérification ESLint');

  // Tests des routes
  runCommand('npm run test:routes', 'Tests des routes');

  // Build de test
  runCommand('npm run build', 'Build de production');

  console.log('🎉 Configuration terminée avec succès!');
  console.log('\n📋 Commandes disponibles:');
  console.log('   npm run dev          - Démarrer le serveur de développement');
  console.log('   npm run dev:full     - Validation complète + dev');
  console.log('   npm run validate     - Validation complète (types + lint + tests)');
  console.log('   npm run generate:page <name> - Générer une nouvelle page');
  console.log('   npm run generate:component <name> - Générer un nouveau composant');
  console.log('   npm run test:smoke   - Tests de fumée rapides');
  console.log('   npm run build:ci     - Build pour CI/CD');
}

main().catch(error => {
  console.error('\n💥 Erreur lors de la configuration:', error.message);
  process.exit(1);
});
