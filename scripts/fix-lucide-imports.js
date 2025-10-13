import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '..', 'src');

console.log('🔧 Correction des imports lucide-react...');

// Fonction pour convertir kebab-case en PascalCase
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
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

// Corriger les imports lucide-react
function fixLucideImports() {
  const files = walkDirectory(
    SRC_DIR,
    filePath => filePath.endsWith('.tsx') || filePath.endsWith('.ts')
  );

  let totalFixed = 0;
  const fixedFiles = [];

  for (const file of files) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let hasChanges = false;

      // Pattern pour détecter les imports profonds lucide-react
      const deepImportPattern =
        /import\s+(\w+)\s+from\s+['"`]lucide-react\/dist\/esm\/icons\/([^'"`]+)['"`]/g;
      const iconImportPattern = /import\s+(\w+)\s+from\s+['"`]lucide-react\/icons\/([^'"`]+)['"`]/g;

      // Collecter tous les imports à corriger
      const importsToFix = [];
      let match;

      // Détecter imports profonds
      while ((match = deepImportPattern.exec(content)) !== null) {
        const [fullMatch, importName, iconPath] = match;
        const iconName = iconPath.replace(/\.js$/, '').replace(/\.ts$/, '');
        const pascalIconName = toPascalCase(iconName);
        importsToFix.push({
          original: fullMatch,
          importName,
          iconName: pascalIconName,
        });
      }

      // Détecter imports depuis /icons/
      while ((match = iconImportPattern.exec(content)) !== null) {
        const [fullMatch, importName, iconPath] = match;
        const iconName = iconPath.replace(/\.js$/, '').replace(/\.ts$/, '');
        const pascalIconName = toPascalCase(iconName);
        importsToFix.push({
          original: fullMatch,
          importName,
          iconName: pascalIconName,
        });
      }

      if (importsToFix.length > 0) {
        // Grouper les imports par nom d'icône
        const iconGroups = {};
        importsToFix.forEach(({ original, importName, iconName }) => {
          if (!iconGroups[iconName]) {
            iconGroups[iconName] = [];
          }
          iconGroups[iconName].push({ original, importName });
        });

        // Remplacer les imports
        Object.entries(iconGroups).forEach(([iconName, imports]) => {
          imports.forEach(({ original, importName }) => {
            if (importName === iconName) {
              // Import direct
              content = content.replace(original, `import { ${iconName} } from 'lucide-react'`);
            } else {
              // Import avec alias
              content = content.replace(
                original,
                `import { ${iconName} as ${importName} } from 'lucide-react'`
              );
            }
          });
        });

        hasChanges = true;
      }

      // Vérifier s'il y a déjà un import lucide-react existant
      const existingImportMatch = content.match(
        /import\s+{([^}]+)}\s+from\s+['"`]lucide-react['"`]/
      );
      if (existingImportMatch && importsToFix.length > 0) {
        // Fusionner avec l'import existant
        const existingIcons = existingImportMatch[1].split(',').map(s => s.trim());
        const newIcons = Object.keys(iconGroups);
        const allIcons = [...new Set([...existingIcons, ...newIcons])].sort();

        content = content.replace(
          existingImportMatch[0],
          `import { ${allIcons.join(', ')} } from 'lucide-react'`
        );
      } else if (importsToFix.length > 0 && !existingImportMatch) {
        // Ajouter un nouvel import groupé
        const newIcons = Object.keys(iconGroups).sort();
        const importStatement = `import { ${newIcons.join(', ')} } from 'lucide-react';\n`;

        // Insérer après les autres imports
        const importLines = content.split('\n');
        let insertIndex = 0;
        for (let i = 0; i < importLines.length; i++) {
          if (importLines[i].startsWith('import ')) {
            insertIndex = i + 1;
          } else if (importLines[i].trim() === '' && insertIndex > 0) {
            break;
          }
        }

        importLines.splice(insertIndex, 0, importStatement);
        content = importLines.join('\n');
      }

      if (hasChanges) {
        fs.writeFileSync(file, content, 'utf8');
        totalFixed++;
        fixedFiles.push(path.relative(process.cwd(), file));
      }
    } catch (error) {
      console.warn(`⚠️ Impossible de traiter ${file}:`, error.message);
    }
  }

  return { totalFixed, fixedFiles };
}

// Exécution
const { totalFixed, fixedFiles } = fixLucideImports();

console.log(`✅ ${totalFixed} fichiers corrigés`);
if (fixedFiles.length > 0) {
  console.log('📁 Fichiers modifiés:');
  fixedFiles.forEach(file => console.log(`   - ${file}`));
}

console.log('🎉 Correction des imports lucide-react terminée!');
