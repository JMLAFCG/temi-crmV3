import React, { useState } from 'react';

import {
  Calendar,
  FileText,
  MapPin,
  Bell,
  CheckCircle,
  AlertTriangle,
  Euro,
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  Award,
  MessageSquare,
  Download,
  Eye,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { TerritoryMap } from '../../components/companies/TerritoryMap';
const PartnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState<'contractor' | 'provider'>('contractor');

  // Mock data - à remplacer par les données réelles
  const company = {
    name: 'Électricité Moderne',
    status: 'verified',
    isBusinessProvider: true, // Cette entreprise est aussi apporteur d'affaires
    documentsStatus: {
      kbis: 'valid',
      insurance: 'expiring',
      urssaf: 'valid',
      decennial: 'valid',
    },
    territory: {
      center: { lat: 48.8566, lng: 2.3522 },
      radius: 50,
    },
    activities: ['Électricité', 'Domotique'],
    // Statistiques entreprise
    projectsCount: 12,
    activeProjects: 3,
    completedProjects: 9,
    // Statistiques apporteur
    providedProjectsCount: 8,
    totalCommissions: 15600,
    pendingCommissions: 2400,
    commissionRate: 10,
  };

  const contractorProjects = [
    {
      id: '1',
      title: 'Rénovation électrique Dupont',
      status: 'in_progress',
      amount: 12000,
      progress: 65,
    },
    {
      id: '2',
      title: 'Installation domotique Martin',
      status: 'pending',
      amount: 8500,
      progress: 0,
    },
    { id: '3', title: 'Mise aux normes Bureau', status: 'completed', amount: 15000, progress: 100 },
  ];

  const providedProjects = [
    {
      id: '4',
      title: 'Extension maison Petit',
      status: 'in_progress',
      commission: 850,
      expectedCommission: 1200,
    },
    {
      id: '5',
      title: 'Rénovation appartement Moreau',
      status: 'completed',
      commission: 650,
      expectedCommission: 650,
    },
    {
      id: '6',
      title: 'Construction garage Lefebvre',
      status: 'pending',
      commission: 0,
      expectedCommission: 900,
    },
  ];

  const quotes = [
    {
      id: '1',
      projectTitle: 'Rénovation cuisine moderne',
      clientName: 'Sophie Bernard',
      amount: 18500,
      status: 'pending',
      submittedAt: '2025-01-15',
    },
    {
      id: '2',
      projectTitle: 'Installation VMC double flux',
      clientName: 'Pierre Durand',
      amount: 4200,
      status: 'accepted',
      submittedAt: '2025-01-10',
    },
  ];

  const documents = [
    {
      id: '1',
      name: 'Devis_Renovation_Dupont.pdf',
      type: 'quote',
      status: 'signed',
      date: '2025-01-15',
    },
    {
      id: '2',
      name: 'Facture_Installation_Martin.pdf',
      type: 'invoice',
      status: 'paid',
      date: '2025-01-12',
    },
    {
      id: '3',
      name: 'Contrat_Mise_aux_normes.pdf',
      type: 'contract',
      status: 'pending',
      date: '2025-01-08',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête avec sélection du rôle */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <div className="flex items-center mt-2 space-x-4">
              {company.status === 'verified' ? (
                <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                  <CheckCircle size={16} className="mr-1" />
                  <span className="text-sm font-medium">Entreprise vérifiée</span>
                </div>
              ) : (
                <div className="flex items-center text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
                  <AlertTriangle size={16} className="mr-1" />
                  <span className="text-sm font-medium">En attente de vérification</span>
                </div>
              )}

              {company.isBusinessProvider && (
                <div className="flex items-center text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  <Users size={16} className="mr-1" />
                  <span className="text-sm font-medium">Apporteur d'affaires</span>
                </div>
              )}
            </div>
          </div>
          <Button variant="primary" leftIcon={<Bell size={16} />}>
            Activer les notifications
          </Button>
        </div>

        {/* Sélecteur de rôle */}
        {company.isBusinessProvider && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Espace de travail</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveSection('contractor')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === 'contractor'
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Briefcase size={16} className="mr-2" />
                Entreprise du bâtiment
                <span className="ml-2 px-2 py-1 text-xs bg-white rounded-full">
                  {company.activeProjects} projets
                </span>
              </button>

              <button
                onClick={() => setActiveSection('provider')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === 'provider'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users size={16} className="mr-2" />
                Apporteur d'affaires
                <span className="ml-2 px-2 py-1 text-xs bg-white rounded-full">
                  {company.providedProjectsCount} projets
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques selon le rôle */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {activeSection === 'contractor' ? (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Projets en cours</h3>
                <span className="text-2xl font-bold text-primary-600">
                  {company.activeProjects}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">
                  {company.projectsCount} projets au total
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Devis en attente</h3>
                <span className="text-2xl font-bold text-orange-600">5</span>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">À traiter</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">CA ce mois</h3>
                <span className="text-2xl font-bold text-green-600">45k€</span>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">+12% vs mois dernier</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Note moyenne</h3>
                <span className="text-2xl font-bold text-yellow-600">4.8</span>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Sur 24 avis clients</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Projets apportés</h3>
                <span className="text-2xl font-bold text-blue-600">
                  {company.providedProjectsCount}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Ce mois</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Commissions totales</h3>
                <span className="text-2xl font-bold text-green-600">
                  {company.totalCommissions}€
                </span>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Depuis le début</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">En attente</h3>
                <span className="text-2xl font-bold text-orange-600">
                  {company.pendingCommissions}€
                </span>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">À recevoir</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Taux commission</h3>
                <span className="text-2xl font-bold text-purple-600">
                  {company.commissionRate}%
                </span>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500">De notre commission</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation selon le rôle */}
      <div className="bg-white rounded-xl shadow-sm mb-8">
        <nav className="flex space-x-4 p-4">
          {activeSection === 'contractor' ? (
            <>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Vue d'ensemble
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'projects'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('projects')}
              >
                Mes projets
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'quotes'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('quotes')}
              >
                Devis & Factures
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'documents'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('documents')}
              >
                Documents
              </button>
            </>
          ) : (
            <>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Vue d'ensemble
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'provided_projects'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('provided_projects')}
              >
                Projets apportés
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'commissions'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('commissions')}
              >
                Commissions
              </button>
            </>
          )}

          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'territory'
                ? activeSection === 'contractor'
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-blue-50 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('territory')}
          >
            Zone d'intervention
          </button>
        </nav>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* ESPACE ENTREPRISE DU BÂTIMENT */}
        {activeSection === 'contractor' && (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Activités</h3>
                  <div className="flex flex-wrap gap-2">
                    {company.activities.map(activity => (
                      <span
                        key={activity}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Projets en cours</h3>
                  <div className="space-y-4">
                    {contractorProjects
                      .filter(p => p.status === 'in_progress')
                      .map(project => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">{project.title}</h4>
                            <p className="text-sm text-gray-500">
                              Montant: {project.amount.toLocaleString()}€
                            </p>
                            <div className="mt-2">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-600">Progression</span>
                                <span className="text-xs font-medium text-gray-900">
                                  {project.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Voir les détails
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Mes projets</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Tous
                    </Button>
                    <Button variant="outline" size="sm">
                      En cours
                    </Button>
                    <Button variant="outline" size="sm">
                      Terminés
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {contractorProjects.map(project => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                          <p className="text-sm text-gray-500">
                            Montant: {project.amount.toLocaleString()}€
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : project.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {project.status === 'completed'
                            ? 'Terminé'
                            : project.status === 'in_progress'
                              ? 'En cours'
                              : 'En attente'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                          <Button variant="outline" size="sm">
                            <MessageSquare size={16} className="mr-1" />
                            Messages
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText size={16} className="mr-1" />
                            Documents
                          </Button>
                        </div>
                        <Button variant="primary" size="sm">
                          Gérer le projet
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'quotes' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Devis et factures</h3>
                  <Button variant="primary" leftIcon={<FileText size={16} />}>
                    Nouveau devis
                  </Button>
                </div>

                <div className="space-y-4">
                  {quotes.map(quote => (
                    <div key={quote.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">{quote.projectTitle}</h4>
                          <p className="text-sm text-gray-500">Client: {quote.clientName}</p>
                          <p className="text-sm text-gray-500">
                            Soumis le {new Date(quote.submittedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {quote.amount.toLocaleString()}€
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              quote.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : quote.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {quote.status === 'accepted'
                              ? 'Accepté'
                              : quote.status === 'rejected'
                                ? 'Refusé'
                                : 'En attente'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye size={16} className="mr-1" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download size={16} className="mr-1" />
                          Télécharger
                        </Button>
                        {quote.status === 'pending' && (
                          <Button variant="primary" size="sm">
                            Modifier
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Documents d'entreprise</h3>
                  <Button variant="primary" leftIcon={<FileText size={16} />}>
                    Ajouter un document
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FileText className="text-gray-400 mr-2" size={20} />
                        <h4 className="font-medium text-gray-900">K-bis</h4>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        À jour
                      </span>
                    </div>
                    <Button variant="outline" fullWidth>
                      Mettre à jour
                    </Button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FileText className="text-gray-400 mr-2" size={20} />
                        <h4 className="font-medium text-gray-900">Assurance décennale</h4>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Expire bientôt
                      </span>
                    </div>
                    <Button variant="primary" fullWidth>
                      Renouveler
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-4">Documents de projets</h4>
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <FileText className="text-gray-400 mr-3" size={20} />
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-500">
                              {doc.type === 'quote'
                                ? 'Devis'
                                : doc.type === 'invoice'
                                  ? 'Facture'
                                  : 'Contrat'}{' '}
                              -{new Date(doc.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              doc.status === 'signed' || doc.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {doc.status === 'signed'
                              ? 'Signé'
                              : doc.status === 'paid'
                                ? 'Payé'
                                : 'En attente'}
                          </span>
                          <Button variant="outline" size="sm">
                            <Download size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ESPACE APPORTEUR D'AFFAIRES */}
        {activeSection === 'provider' && (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-blue-900 mb-2">Performance ce mois</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Projets apportés:</span>
                        <span className="font-semibold text-blue-900">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Commissions générées:</span>
                        <span className="font-semibold text-blue-900">2,400€</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Taux de conversion:</span>
                        <span className="font-semibold text-blue-900">75%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                    <h4 className="text-lg font-medium text-green-900 mb-2">Commissions</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-green-700">Total perçu:</span>
                        <span className="font-semibold text-green-900">
                          {company.totalCommissions.toLocaleString()}€
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">En attente:</span>
                        <span className="font-semibold text-green-900">
                          {company.pendingCommissions.toLocaleString()}€
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Prochain paiement:</span>
                        <span className="font-semibold text-green-900">15/02</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Projets récents apportés
                  </h3>
                  <div className="space-y-4">
                    {providedProjects.slice(0, 3).map(project => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{project.title}</h4>
                          <p className="text-sm text-gray-500">
                            Commission: {project.commission}€ / {project.expectedCommission}€
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : project.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {project.status === 'completed'
                            ? 'Terminé'
                            : project.status === 'in_progress'
                              ? 'En cours'
                              : 'En attente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'provided_projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Projets que j'ai apportés</h3>
                  <div className="text-sm text-gray-500">
                    {providedProjects.length} projets • {company.totalCommissions.toLocaleString()}€
                    de commissions
                  </div>
                </div>

                <div className="space-y-4">
                  {providedProjects.map(project => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              Commission perçue:{' '}
                              <span className="font-medium text-green-600">
                                {project.commission}€
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Commission attendue:{' '}
                              <span className="font-medium text-blue-600">
                                {project.expectedCommission}€
                              </span>
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : project.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {project.status === 'completed'
                            ? 'Terminé'
                            : project.status === 'in_progress'
                              ? 'En cours'
                              : 'En attente'}
                        </span>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare size={16} className="mr-1" />
                          Suivre le projet
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText size={16} className="mr-1" />
                          Documents
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'commissions' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-500">Total des commissions</h4>
                      <Euro className="text-green-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {company.totalCommissions.toLocaleString()}€
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-500">En attente</h4>
                      <Clock className="text-orange-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {company.pendingCommissions.toLocaleString()}€
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-500">Taux de commission</h4>
                      <TrendingUp className="text-blue-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {company.commissionRate}%
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Historique des paiements
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-4">
                      {[
                        {
                          date: '2025-01-15',
                          amount: 1200,
                          project: 'Extension maison Petit',
                          status: 'paid',
                          quoteStatus: 'signed',
                          downPaymentStatus: 'confirmed',
                        },
                        {
                          date: '2024-12-15',
                          amount: 850,
                          project: 'Rénovation appartement Moreau',
                          status: 'paid',
                          quoteStatus: 'signed',
                          downPaymentStatus: 'confirmed',
                        },
                        {
                          date: '2024-11-15',
                          amount: 950,
                          project: 'Construction garage Lefebvre',
                          status: 'pending',
                          quoteStatus: 'signed',
                          downPaymentStatus: 'pending',
                        },
                      ].map((payment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{payment.project}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(payment.date).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.quoteStatus === 'signed'
                                ? '✅ Devis signé'
                                : '📤 Devis envoyé'}{' '}
                              •
                              {payment.downPaymentStatus === 'confirmed'
                                ? '💰 Accompte reçu'
                                : '⏳ En attente accompte'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{payment.amount}€</p>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                payment.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : payment.downPaymentStatus !== 'received'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {payment.status === 'paid'
                                ? 'Payé'
                                : payment.downPaymentStatus !== 'received'
                                  ? 'Accompte non versé'
                                  : 'Prêt à facturer'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ZONE D'INTERVENTION (COMMUNE AUX DEUX RÔLES) */}
        {activeTab === 'territory' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Zone d'intervention</h3>
            <TerritoryMap
              address={{
                street: '123 Rue de Paris',
                city: 'Paris',
                postalCode: '75001',
                coordinates: { lat: 48.8566, lng: 2.3522 },
              }}
              territory={company.territory}
              onTerritoryChange={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerDashboard;
