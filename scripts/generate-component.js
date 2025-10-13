#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');

function toPascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function generateComponentTemplate(componentName, componentType) {
  const templates = {
    basic: `import React from 'react';

interface ${componentName}Props {
  // Props interface
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  // Destructure props here
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">${componentName}</h2>
      <p className="text-gray-600">Composant ${componentName}</p>
    </div>
  );
};

export default ${componentName};
`,

    form: `import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ${componentName}Data {
  // Form data interface
}

interface ${componentName}Props {
  onSubmit: (data: ${componentName}Data) => void;
  onCancel: () => void;
  initialData?: Partial<${componentName}Data>;
  isLoading?: boolean;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<${componentName}Data>({
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Exemple"
          {...register('example', { required: 'Ce champ est requis' })}
          error={errors.example?.message}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          Enregistrer
        </Button>
      </div>
    </form>
  );
};

export default ${componentName};
`,

    modal: `import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface ${componentName}Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          {children}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`,

    list: `import React, { useState } from 'react';
import { Plus, Search, Filter, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';

interface ${componentName}Item {
  id: string;
  name: string;
  // Add other properties
}

interface ${componentName}Props {
  items: ${componentName}Item[];
  onItemClick?: (item: ${componentName}Item) => void;
  onCreateNew?: () => void;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  items,
  onItemClick,
  onCreateNew
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">${componentName}</h2>
          <p className="text-gray-600">Gérez vos éléments</p>
        </div>
        {onCreateNew && (
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={onCreateNew}
          >
            Nouveau
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative">
          <Button
            variant="outline"
            leftIcon={<Filter size={16} />}
            rightIcon={<ChevronDown size={16} />}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filtrer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onItemClick?.(item)}
          >
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`,
  };

  return templates[componentType] || templates.basic;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage: npm run generate:component <component-name> [type] [directory]

Types:
  basic  : Composant de base (défaut)
  form   : Formulaire avec react-hook-form
  modal  : Modal avec overlay
  list   : Liste avec recherche et filtres

Examples:
  npm run generate:component UserCard
  npm run generate:component UserForm form
  npm run generate:component ConfirmModal modal ui
  npm run generate:component ProjectList list projects

Options:
  component-name : Nom du composant (sera converti en PascalCase)
  type          : Type de template (basic, form, modal, list)
  directory     : Sous-dossier dans src/components (optionnel)
`);
    process.exit(1);
  }

  const componentName = toPascalCase(args[0]);
  const componentType = args[1] || 'basic';
  const subDirectory = args[2] || '';

  // Déterminer le dossier de destination
  let targetDir = COMPONENTS_DIR;
  if (subDirectory) {
    targetDir = path.join(COMPONENTS_DIR, subDirectory);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`📁 Dossier créé: ${path.relative(ROOT, targetDir)}`);
    }
  }

  const fileName = `${componentName}.tsx`;
  const filePath = path.join(targetDir, fileName);

  // Vérifier si le fichier existe déjà
  if (fs.existsSync(filePath)) {
    console.error(`❌ Le composant existe déjà: ${path.relative(ROOT, filePath)}`);
    process.exit(1);
  }

  // Générer le contenu
  const content = generateComponentTemplate(componentName, componentType);

  // Écrire le fichier
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Composant créé: ${path.relative(ROOT, filePath)}`);

  // Suggestions pour la suite
  console.log(`
📋 Composant ${componentName} créé avec succès!

💡 Suggestions:
1. Importer dans votre page:
   import { ${componentName} } from '../components/${subDirectory ? subDirectory + '/' : ''}${componentName}';

2. Utiliser le composant:
   <${componentName} />

3. Personnaliser l'interface ${componentName}Props selon vos besoins
`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
