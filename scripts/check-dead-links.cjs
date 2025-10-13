#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '..', 'src');
const ROUTES_FILE = path.resolve(__dirname, '..', 'src', 'routes', 'paths.ts');

console.log('🔍 Vérification des liens morts...');

// Lire les routes définies
function getDefinedRoutes() {
  try {
    const routesContent = fs.readFileSync(ROUTES_FILE, 'utf8');
    const routeMatches = routesContent.match(/(\w+):\s*["']([^"']+)["']/g) || [];
    return routeMatches
      .map(match => {
        const [, , path] = match.match(/(\w+):\s*["']([^"']+)["']/) || [];
        return path;
      })
      .filter(Boolean);
  } catch (error) {
    console.error('❌ Impossible de lire le fichier des routes:', error.message);
    return [];
  }
}

// Parcourir récursivement les fichiers
function walkDirectory(dir, filterFn) {
  const files = fs.readdirSync(dir);
  let results = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(walkDirectory(filePath, filterFn));
    } else if (filterFn(filePath)) {
      results.push(filePath);
    }
  }

  return results;
}

// Vérifier les liens hardcodés
function checkHardcodedLinks() {
  const files = walkDirectory(
    SRC_DIR,
    filePath => filePath.endsWith('.tsx') || filePath.endsWith('.ts')
  );

  const offenders = [];
  const hardLinkPattern = /to\s*=\s*["'`](\/[^"'`]+)["'`]/g;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const matches = [...content.matchAll(hardLinkPattern)];

      if (matches.length > 0) {
        const hardLinks = matches.map(match => match[1]);
        offenders.push({
          file: path.relative(process.cwd(), file),
          hardLinks,
        });
      }
    } catch (error) {
      console.warn(`⚠️ Impossible de lire ${file}:`, error.message);
    }
  }

  return offenders;
}

// Vérifier les imports de SafeLink
function checkSafeLinkUsage() {
  const files = walkDirectory(
    SRC_DIR,
    filePath => filePath.endsWith('.tsx') || filePath.endsWith('.ts')
  );

  let safeLinkImports = 0;
  let linkImports = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');

      if (content.includes("from 'react-router-dom'") && content.includes('Link')) {
        linkImports++;
      }

      if (content.includes('SafeLink') || content.includes('./ui/SafeLink')) {
        safeLinkImports++;
      }
    } catch (error) {
      // Ignorer les erreurs de lecture
    }
  }

  return { safeLinkImports, linkImports };
}

// Exécution principale
function main() {
  const definedRoutes = getDefinedRoutes();
  console.log(`📋 ${definedRoutes.length} routes définies dans paths.ts`);

  const hardcodedLinks = checkHardcodedLinks();
  const { safeLinkImports, linkImports } = checkSafeLinkUsage();

  console.log(`📊 Statistiques:`);
  console.log(`   - Imports SafeLink: ${safeLinkImports}`);
  console.log(`   - Imports Link classiques: ${linkImports}`);

  if (hardcodedLinks.length > 0) {
    console.error('\n❌ Liens hardcodés détectés (utiliser <SafeLink route="..."/> à la place):');
    hardcodedLinks.forEach(({ file, hardLinks }) => {
      console.error(`   ${file}:`);
      hardLinks.forEach(link => console.error(`     - to="${link}"`));
    });
    console.error(
      '\n💡 Remplacez par <SafeLink route="routeKey" /> en utilisant les clés de src/routes/paths.ts\n'
    );
    process.exit(1);
  }

  console.log('✅ Aucun lien hardcodé détecté.');

  if (linkImports > safeLinkImports) {
    console.warn(
      `⚠️ ${linkImports - safeLinkImports} fichiers utilisent encore Link au lieu de SafeLink`
    );
  }

  console.log('🎉 Vérification des liens terminée avec succès!');
}

if (require.main === module) {
  main();
}
