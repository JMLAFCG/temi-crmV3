import React, { useState } from 'react';
import {
  Plus,
  Filter,
  Search,
  ChevronDown,
  FileText,
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface DocumentProps {
  id: string;
  name: string;
  type: string;
  size: string;
  project: string;
  uploadedBy: string;
  uploadDate: string;
}

const DocumentRow: React.FC<DocumentProps> = ({
  id,
  name,
  type,
  size,
  project,
  uploadedBy,
  uploadDate,
}) => {
  const getTypeIcon = (docType: string) => {
    switch (docType) {
      case 'PDF':
        return <FileText size={20} className="text-red-500" />;
      case 'DOCX':
        return <FileText size={20} className="text-blue-500" />;
      case 'XLSX':
        return <FileText size={20} className="text-green-500" />;
      case 'JPG':
      case 'PNG':
        return <FileText size={20} className="text-purple-500" />;
      default:
        return <FileText size={20} className="text-gray-500" />;
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getTypeIcon(type)}
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{name}</div>
            <div className="text-sm text-gray-500">
              {type} • {size}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{project}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <User size={16} className="text-gray-400 mr-2" />
          <div className="text-sm text-gray-900">{uploadedBy}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Calendar size={16} className="text-gray-400 mr-2" />
          <div className="text-sm text-gray-500">{uploadDate}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button className="text-blue-600 hover:text-blue-900">
            <Eye size={18} />
          </button>
          <button className="text-green-600 hover:text-green-900">
            <Download size={18} />
          </button>
          <button className="text-red-600 hover:text-red-900">
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};
const DocumentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Mock data - in a real app, this would come from an API
  const documents: DocumentProps[] = [
    {
      id: '1',
      name: 'Plan_Maison_Dupont.pdf',
      type: 'PDF',
      size: '2.4 MB',
      project: 'Extension Maison Dupont',
      uploadedBy: 'Thomas Durand',
      uploadDate: '10/05/2025',
    },
    {
      id: '2',
      name: 'Devis_Electricite.xlsx',
      type: 'XLSX',
      size: '1.2 MB',
      project: 'Rénovation Cuisine Moderne',
      uploadedBy: 'Sophie Martin',
      uploadDate: '08/05/2025',
    },
    {
      id: '3',
      name: 'Contrat_Client_Martin.docx',
      type: 'DOCX',
      size: '850 KB',
      project: 'Extension Maison Dupont',
      uploadedBy: 'Thomas Durand',
      uploadDate: '05/05/2025',
    },
    {
      id: '4',
      name: 'Photos_Avant_Travaux.jpg',
      type: 'JPG',
      size: '3.5 MB',
      project: 'Rénovation Salle de Bain',
      uploadedBy: 'Jean Petit',
      uploadDate: '01/05/2025',
    },
    {
      id: '5',
      name: 'Planning_Travaux.xlsx',
      type: 'XLSX',
      size: '980 KB',
      project: 'Construction Immeuble',
      uploadedBy: 'Marie Dubois',
      uploadDate: '28/04/2025',
    },
    {
      id: '6',
      name: 'Facture_Plomberie.pdf',
      type: 'PDF',
      size: '1.1 MB',
      project: 'Rénovation Salle de Bain',
      uploadedBy: 'Jean Petit',
      uploadDate: '25/04/2025',
    },
    {
      id: '7',
      name: 'Autorisation_Travaux.pdf',
      type: 'PDF',
      size: '1.8 MB',
      project: 'Extension Maison Dupont',
      uploadedBy: 'Thomas Durand',
      uploadDate: '20/04/2025',
    },
    {
      id: '8',
      name: 'Plans_Techniques.pdf',
      type: 'PDF',
      size: '4.2 MB',
      project: 'Construction Immeuble',
      uploadedBy: 'Marie Dubois',
      uploadDate: '15/04/2025',
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Gérez tous vos documents et fichiers</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="primary" leftIcon={<Plus size={16} />}>
            Ajouter Document
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher documents..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
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

          {filterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de fichier
                </label>
                <div className="space-y-2">
                  {['PDF', 'DOCX', 'XLSX', 'JPG/PNG'].map(type => (
                    <div key={type} className="flex items-center">
                      <input
                        id={`type-${type}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`type-${type}`} className="ml-2 text-sm text-gray-700">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'ajout</label>
                <div className="space-y-2">
                  {["Aujourd'hui", 'Cette semaine', 'Ce mois', 'Plus ancien'].map(date => (
                    <div key={date} className="flex items-center">
                      <input
                        id={`date-${date}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`date-${date}`} className="ml-2 text-sm text-gray-700">
                        {date}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="sm">
                  Appliquer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Document
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Projet
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ajouté par
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map(document => (
                <DocumentRow key={document.id} {...document} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
