#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');

function toPascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generatePageTemplate(componentName, pageName) {
  return `import React from 'react';

interface ${componentName}Props {
  // Props interface
}

const ${componentName}: React.FC<${componentName}Props> = () => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">${pageName}</h1>
          <p className="text-gray-600">Description de la page ${pageName}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500">Contenu de la page ${pageName}</p>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

function generateRoute(routePath, componentName) {
  return `  ${toKebabCase(componentName)}: "${routePath}",`;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: npm run generate:page <page-name> [route-path]

Examples:
  npm run generate:page UserProfile
  npm run generate:page user-settings /settings/users
  npm run generate:page "Company Details" /companies/details

Options:
  page-name    : Nom de la page (sera converti en PascalCase pour le composant)
  route-path   : Chemin de la route (optionnel, généré automatiquement si omis)
`);
    process.exit(1);
  }

  const pageName = args[0];
  const componentName = toPascalCase(pageName);
  const routePath = args[1] || `/${toKebabCase(pageName)}`;
  const fileName = `${componentName}.tsx`;

  // Déterminer le dossier de destination
  let targetDir = PAGES_DIR;
  const pathParts = routePath.split('/').filter(Boolean);

  if (pathParts.length > 1) {
    // Créer les sous-dossiers si nécessaire
    const subDirs = pathParts.slice(0, -1);
    targetDir = path.join(PAGES_DIR, ...subDirs);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`📁 Dossier créé: ${path.relative(ROOT, targetDir)}`);
    }
  }

  const filePath = path.join(targetDir, fileName);

  // Vérifier si le fichier existe déjà
  if (fs.existsSync(filePath)) {
    console.error(`❌ Le fichier existe déjà: ${path.relative(ROOT, filePath)}`);
    process.exit(1);
  }

  // Générer le contenu
  const content = generatePageTemplate(componentName, pageName);

  // Écrire le fichier
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Page créée: ${path.relative(ROOT, filePath)}`);

  // Suggestions pour la suite
  console.log(`
📋 Prochaines étapes:
1. Ajouter la route dans src/routes/paths.ts:
   ${generateRoute(routePath, componentName)}

2. Ajouter la route dans src/router.tsx:
   { path: "${routePath}", element: <Suspense><${componentName} /></Suspense> }

3. Importer le composant dans router.tsx:
   const ${componentName} = lazyDefault(() => import("${path.relative(path.join(ROOT, 'src'), filePath).replace(/\\/g, '/')}"), "${path.relative(ROOT, filePath)}");

4. Ajouter au menu de navigation si nécessaire dans src/ui/navConfig.ts
`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
