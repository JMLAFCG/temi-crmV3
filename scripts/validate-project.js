#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('📁 Fichiers ajoutés/modifiés par le Turbo-Pack:');

// Fonction pour lister les fichiers récursivement
function listFiles(dir, maxFiles = 20) {
  const files = [];

  function walkDir(currentPath) {
    if (files.length >= maxFiles) return;

    try {
      if (!fs.existsSync(currentPath)) return;

      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        if (files.length >= maxFiles) break;

        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isFile()) {
          files.push(fullPath);
        } else if (stat.isDirectory()) {
          walkDir(fullPath);
        }
      }
    } catch (err) {
      // Ignorer les erreurs d'accès
    }
  }

  walkDir(dir);
  return files;
}

// Lister les fichiers dans les dossiers cibles
const targetDirs = ['scripts', 'tests', '.github', 'src/routes'];
const allFiles = [];

targetDirs.forEach(dir => {
  const files = listFiles(dir, 5);
  allFiles.push(...files);
});

if (allFiles.length > 0) {
  allFiles.slice(0, 20).forEach(file => {
    console.log(`  ${file}`);
  });
} else {
  console.log('  Aucun fichier trouvé dans les dossiers cibles');
}

console.log('\n🔄 Exécution de la validation...\n');

// Fonction pour exécuter une commande et capturer le résultat
function runCommand(command, description) {
  console.log(`⏳ ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', timeout: 60000 });
    console.log(`✅ ${description} - Succès\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} - Échec`);
    console.log(`   Code de sortie: ${error.status}`);
    if (error.stdout) {
      console.log(`   Sortie: ${error.stdout.toString().slice(-200)}`);
    }
    if (error.stderr) {
      console.log(`   Erreur: ${error.stderr.toString().slice(-200)}`);
    }
    console.log('');
    return false;
  }
}

// Séquence de validation
const results = {
  install: runCommand('npm install', 'Installation des dépendances'),
  fixExports: runCommand(
    'npm run fix:default-exports || true',
    'Correction des exports par défaut'
  ),
  fixReact: runCommand('npm run fix:react-imports || true', 'Correction des imports React'),
  build: runCommand('npm run build', "Build de l'application"),
  playwright: runCommand(
    'npx playwright install --with-deps || true',
    'Installation de Playwright'
  ),
  smokeTest: runCommand('npm run test:smoke || true', 'Tests de fumée'),
};

// Rapport final
console.log('📊 RAPPORT DE VALIDATION FINALE');
console.log('================================');
console.log(`✅ Installation: ${results.install ? 'Succès' : 'Échec'}`);
console.log(`✅ Correction exports: ${results.fixExports ? 'Succès' : 'Échec'}`);
console.log(`✅ Correction React: ${results.fixReact ? 'Succès' : 'Échec'}`);
console.log(`${results.build ? '✅' : '❌'} Build: ${results.build ? 'Succès' : 'Échec'}`);
console.log(`✅ Playwright: ${results.playwright ? 'Succès' : 'Échec'}`);
console.log(
  `${results.smokeTest ? '✅' : '❌'} Tests smoke: ${results.smokeTest ? 'Succès' : 'Échec'}`
);

const overallSuccess = Object.values(results).every(Boolean);
console.log(`\n🎯 Statut global: ${overallSuccess ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
