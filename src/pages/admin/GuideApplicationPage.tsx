import React, { useState } from 'react';
import {
  Book,
  ChevronDown,
  ChevronRight,
  User,
  Building,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  Euro,
  Settings,
  Brain,
  Camera,
  Upload,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Target,
  Award,
  Zap,
} from 'lucide-react';

const GuideApplicationPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(current =>
      current.includes(sectionId) ? current.filter(id => id !== sectionId) : [...current, sectionId]
    );
  };

  return (
    <div className="max-w-6xl mx-auto" data-testid="admin-guide-page">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Book className="text-primary-600 mr-3" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Guide d'Utilisation</h1>
            <p className="text-gray-600">Notice complète de l'application TEMI-Construction CRM</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Premiers pas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('getting-started')}
            className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary-50 to-secondary-50 hover:from-primary-100 hover:to-secondary-100 transition-all duration-200"
          >
            <h2 className="text-xl font-semibold text-gray-900">🚀 Premiers pas</h2>
            {expandedSections.includes('getting-started') ? (
              <ChevronDown className="text-gray-500" size={20} />
            ) : (
              <ChevronRight className="text-gray-500" size={20} />
            )}
          </button>

          {expandedSections.includes('getting-started') && (
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    🔑 Première connexion
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-blue-800">
                    <li>Accédez à l'application via l'URL fournie par votre administrateur</li>
                    <li>Saisissez votre email et mot de passe fournis</li>
                    <li>Le tableau de bord s'adapte automatiquement selon votre rôle</li>
                    <li>Explorez les différentes sections via le menu de gauche</li>
                  </ol>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">
                    📱 Interface utilisateur
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
                    <div>
                      <h4 className="font-medium mb-2">Navigation principale</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Menu latéral : accès aux différentes sections</li>
                        <li>En-tête : recherche globale et notifications</li>
                        <li>Tableau de bord : vue d'ensemble personnalisée</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Fonctionnalités communes</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Recherche : barre de recherche en haut</li>
                        <li>Filtres : boutons de filtrage sur les listes</li>
                        <li>Actions : boutons d'action sur chaque élément</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Guide par rôle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('roles-guide')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900">👥 Guide par rôle utilisateur</h2>
            {expandedSections.includes('roles-guide') ? (
              <ChevronDown className="text-gray-500" size={20} />
            ) : (
              <ChevronRight className="text-gray-500" size={20} />
            )}
          </button>

          {expandedSections.includes('roles-guide') && (
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-8">
                {/* Client */}
                <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                  <div className="flex items-center mb-4">
                    <User className="text-blue-600 mr-3" size={24} />
                    <h3 className="text-xl font-bold text-blue-900">Client</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">📋 Que puis-je faire ?</h4>
                      <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                        <li>Suivre l'avancement de mes projets en temps réel</li>
                        <li>Consulter et télécharger mes documents</li>
                        <li>Valider les propositions de travaux</li>
                        <li>Signer électroniquement les contrats</li>
                        <li>Communiquer avec mon mandataire TEMI</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">🎯 Comment démarrer ?</h4>
                      <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                        <li>Consultez votre tableau de bord pour voir l'état de vos projets</li>
                        <li>Vérifiez la section "Documents" pour les pièces à fournir</li>
                        <li>Suivez les étapes de progression de votre projet</li>
                        <li>Validez les propositions quand elles sont disponibles</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Entreprise Partenaire */}
                <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                  <div className="flex items-center mb-4">
                    <Building className="text-green-600 mr-3" size={24} />
                    <h3 className="text-xl font-bold text-green-900">Entreprise Partenaire</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">📋 Que puis-je faire ?</h4>
                      <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                        <li>Recevoir des notifications de nouveaux projets</li>
                        <li>Soumettre des devis qui seront analysés par IA</li>
                        <li>Négocier avec TEMI via l'interface automatisée</li>
                        <li>Gérer mes documents légaux (RC Pro, Kbis, etc.)</li>
                        <li>Suivre mes rétrocessions et paiements</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">🎯 Comment répondre à un projet ?</h4>
                      <ol className="list-decimal list-inside space-y-1 text-green-700 text-sm">
                        <li>Consultez les nouvelles missions dans votre tableau de bord</li>
                        <li>Acceptez la mission qui vous intéresse</li>
                        <li>Téléchargez votre devis PDF (analyse IA automatique)</li>
                        <li>Négociez si nécessaire via l'interface</li>
                        <li>Attendez la validation du client</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Apporteur d'Affaires */}
                <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                  <div className="flex items-center mb-4">
                    <Users className="text-purple-600 mr-3" size={24} />
                    <h3 className="text-xl font-bold text-purple-900">Apporteur d'Affaires</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-2">📋 Que puis-je faire ?</h4>
                      <ul className="list-disc list-inside space-y-1 text-purple-700 text-sm">
                        <li>Soumettre de nouveaux prospects</li>
                        <li>Suivre l'évolution de mes apports</li>
                        <li>Consulter mes commissions gagnées</li>
                        <li>Voir l'historique de mes performances</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-2">🎯 Comment soumettre un prospect ?</h4>
                      <ol className="list-decimal list-inside space-y-1 text-purple-700 text-sm">
                        <li>Cliquez sur "Soumettre un apport" dans votre tableau de bord</li>
                        <li>Remplissez les informations du prospect</li>
                        <li>Décrivez le projet et estimez le budget</li>
                        <li>Soumettez et suivez l'évolution</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Mandataire */}
                <div className="border border-orange-200 rounded-lg p-6 bg-orange-50">
                  <div className="flex items-center mb-4">
                    <Target className="text-orange-600 mr-3" size={24} />
                    <h3 className="text-xl font-bold text-orange-900">Mandataire</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-orange-800 mb-2">📋 Que puis-je faire ?</h4>
                      <ul className="list-disc list-inside space-y-1 text-orange-700 text-sm">
                        <li>Gérer mon portefeuille de clients</li>
                        <li>Créer et suivre des projets</li>
                        <li>Sélectionner les meilleures entreprises</li>
                        <li>Valider les propositions IA</li>
                        <li>Suivre mes commissions par paliers</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-800 mb-2">🎯 Comment créer un projet ?</h4>
                      <ol className="list-decimal list-inside space-y-1 text-orange-700 text-sm">
                        <li>Allez dans "Projets" → "Nouveau Projet"</li>
                        <li>Suivez le wizard en 10 étapes</li>
                        <li>Sélectionnez ou créez le client</li>
                        <li>Définissez la localisation et les activités</li>
                        <li>Le système sélectionne automatiquement les entreprises</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Administrateur */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center mb-4">
                    <Settings className="text-gray-600 mr-3" size={24} />
                    <h3 className="text-xl font-bold text-gray-900">Administrateur</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">📋 Que puis-je faire ?</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                        <li>Gérer tous les utilisateurs et leurs rôles</li>
                        <li>Superviser le module IA et les négociations</li>
                        <li>Configurer les paramètres de facturation</li>
                        <li>Consulter les logs d'audit</li>
                        <li>Gérer les intégrations externes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fonctionnalités principales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('features')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900">⚡ Fonctionnalités principales</h2>
            {expandedSections.includes('features') ? (
              <ChevronDown className="text-gray-500" size={20} />
            ) : (
              <ChevronRight className="text-gray-500" size={20} />
            )}
          </button>

          {expandedSections.includes('features') && (
            <div className="p-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gestion des projets */}
                <div className="border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FileText className="text-blue-600 mr-2" size={20} />
                    <h4 className="font-semibold text-blue-900">Gestion des Projets</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• <strong>Wizard de création :</strong> 10 étapes guidées</li>
                    <li>• <strong>Sélection d'activités :</strong> Codes FFSA normalisés</li>
                    <li>• <strong>Géolocalisation :</strong> Adresses françaises validées</li>
                    <li>• <strong>Photos :</strong> Capture directe ou upload</li>
                    <li>• <strong>Matching automatique :</strong> Sélection d'entreprises par IA</li>
                  </ul>
                </div>

                {/* Module IA */}
                <div className="border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Brain className="text-purple-600 mr-2" size={20} />
                    <h4 className="font-semibold text-purple-900">Module IA</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>• <strong>Analyse automatique :</strong> Extraction des données PDF</li>
                    <li>• <strong>Comparaison intelligente :</strong> Plusieurs devis analysés</li>
                    <li>• <strong>Proposition optimisée :</strong> Meilleure offre par lot</li>
                    <li>• <strong>Négociation assistée :</strong> Interface de négociation</li>
                    <li>• <strong>Validation :</strong> Contrôle qualité avant client</li>
                  </ul>
                </div>

                {/* Gestion documentaire */}
                <div className="border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Upload className="text-green-600 mr-2" size={20} />
                    <h4 className="font-semibold text-green-900">Documents</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• <strong>Upload sécurisé :</strong> Glisser-déposer ou parcourir</li>
                    <li>• <strong>Validation :</strong> Vérification puis validation admin</li>
                    <li>• <strong>Signature électronique :</strong> Signature tactile intégrée</li>
                    <li>• <strong>Alertes d'expiration :</strong> Notifications automatiques</li>
                    <li>• <strong>Téléchargement :</strong> Accès permanent aux documents</li>
                  </ul>
                </div>

                {/* Communication */}
                <div className="border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <MessageSquare className="text-yellow-600 mr-2" size={20} />
                    <h4 className="font-semibold text-yellow-900">Communication</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li>• <strong>Messagerie interne :</strong> Chat entre utilisateurs</li>
                    <li>• <strong>Notifications :</strong> Alertes en temps réel</li>
                    <li>• <strong>Emails automatiques :</strong> Notifications importantes</li>
                    <li>• <strong>Historique :</strong> Toutes les conversations sauvées</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tutoriels étape par étape */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('tutorials')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900">📚 Tutoriels étape par étape</h2>
            {expandedSections.includes('tutorials') ? (
              <ChevronDown className="text-gray-500" size={20} />
            ) : (
              <ChevronRight className="text-gray-500" size={20} />
            )}
          </button>

          {expandedSections.includes('tutorials') && (
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-8">
                {/* Créer un projet */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    🏗️ Comment créer un projet (Mandataire/Commercial)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">Accéder à la création</h4>
                        <p className="text-sm text-blue-700">
                          Menu "Projets" → Bouton "Nouveau Projet" → Le wizard s'ouvre
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">Sélectionner le client</h4>
                        <p className="text-sm text-blue-700">
                          Choisir un client existant ou cliquer "Nouveau client" pour en créer un
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">Définir l'équipe</h4>
                        <p className="text-sm text-blue-700">
                          Sélectionner le mandataire et optionnellement un apporteur d'affaires
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">Localisation</h4>
                        <p className="text-sm text-blue-700">
                          Saisir l'adresse complète - la validation automatique propose les villes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        5
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">Activités FFSA</h4>
                        <p className="text-sm text-blue-700">
                          Sélectionner les corps de métiers dans les accordéons (construction, services intellectuels, services additionnels)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        6
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">Budget et planning</h4>
                        <p className="text-sm text-blue-700">
                          Estimer les coûts matériaux/main d'œuvre et définir les dates souhaitées
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        7
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">Photos et documents</h4>
                        <p className="text-sm text-blue-700">
                          Prendre des photos avec la caméra ou importer des fichiers existants
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        8
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">Sélection d'entreprises</h4>
                        <p className="text-sm text-blue-700">
                          L'IA propose automatiquement les entreprises les plus adaptées - sélectionner celles à notifier
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        9
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800">Signature du mandat</h4>
                        <p className="text-sm text-blue-700">
                          Faire signer le mandat de recherche au client avec la signature électronique
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload et analyse de devis */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4">
                    🧠 Comment utiliser l'IA pour les devis
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-800">Upload du devis (Entreprise)</h4>
                        <p className="text-sm text-purple-700">
                          Dans l'espace entreprise, cliquer "Soumettre devis IA" et sélectionner le PDF
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-800">Analyse automatique</h4>
                        <p className="text-sm text-purple-700">
                          L'IA extrait automatiquement : montants, lots, délais, TVA
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-800">Validation et correction</h4>
                        <p className="text-sm text-purple-700">
                          L'administrateur peut corriger les données extraites si nécessaire
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-800">Proposition globale</h4>
                        <p className="text-sm text-purple-700">
                          Quand plusieurs devis sont analysés, l'IA génère une proposition optimisée
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gestion des documents */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">
                    📄 Comment gérer les documents
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">Upload</h4>
                        <p className="text-sm text-green-700">
                          Glisser-déposer ou cliquer "Parcourir" - Formats acceptés : PDF, JPG, PNG
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">Vérification</h4>
                        <p className="text-sm text-green-700">
                          Le document passe en "En attente de vérification" puis "Vérifié"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">Validation administrative</h4>
                        <p className="text-sm text-green-700">
                          Un administrateur valide définitivement le document
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Conseils et bonnes pratiques */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('tips')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900">💡 Conseils et bonnes pratiques</h2>
            {expandedSections.includes('tips') ? (
              <ChevronDown className="text-gray-500" size={20} />
            ) : (
              <ChevronRight className="text-gray-500" size={20} />
            )}
          </button>

          {expandedSections.includes('tips') && (
            <div className="p-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">✅ Bonnes pratiques</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="text-green-600 mr-2 mt-1" size={16} />
                      <div>
                        <p className="font-medium text-gray-900">Photos de qualité</p>
                        <p className="text-sm text-gray-600">
                          Prenez des photos nettes et bien éclairées pour faciliter l'analyse
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-600 mr-2 mt-1" size={16} />
                      <div>
                        <p className="font-medium text-gray-900">Descriptions détaillées</p>
                        <p className="text-sm text-gray-600">
                          Plus vous donnez d'informations, meilleur sera le matching d'entreprises
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-600 mr-2 mt-1" size={16} />
                      <div>
                        <p className="font-medium text-gray-900">Documents à jour</p>
                        <p className="text-sm text-gray-600">
                          Vérifiez régulièrement les dates d'expiration de vos documents
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-600 mr-2 mt-1" size={16} />
                      <div>
                        <p className="font-medium text-gray-900">Réactivité</p>
                        <p className="text-sm text-gray-600">
                          Répondez rapidement aux notifications pour maintenir un bon taux de conversion
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">⚠️ À éviter</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <AlertTriangle className="text-red-600 mr-2 mt-1" size={16} />
                      <div>
                        <p className="font-medium text-gray-900">Documents illisibles</p>
                        <p className="text-sm text-gray-600">
                          Évitez les scans flous ou les photos de mauvaise qualité
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="text-red-600 mr-2 mt-1" size={16} />
                      <div>
                        <p className="font-medium text-gray-900">Informations incomplètes</p>
                        <p className="text-sm text-gray-600">
                          Ne pas remplir tous les champs peut retarder le traitement
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="text-red-600 mr-2 mt-1" size={16} />
                      <div>
                        <p className="font-medium text-gray-900">Formats non supportés</p>
                        <p className="text-sm text-gray-600">
                          Utilisez uniquement PDF, JPG, PNG pour les documents
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('faq')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900">❓ Questions fréquentes</h2>
            {expandedSections.includes('faq') ? (
              <ChevronDown className="text-gray-500" size={20} />
            ) : (
              <ChevronRight className="text-gray-500" size={20} />
            )}
          </button>

          {expandedSections.includes('faq') && (
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Comment modifier un projet après création ?
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Allez dans "Projets", cliquez sur le projet concerné, puis "Modifier". Certaines
                    modifications peuvent nécessiter une validation administrative.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Que faire si l'IA n'analyse pas correctement mon devis ?
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Contactez votre administrateur qui peut corriger manuellement les données
                    extraites via l'interface de gestion IA.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Comment suivre mes commissions d'apporteur ?
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Dans votre tableau de bord apporteur, consultez la section "Mes commissions".
                    Les commissions sont dues dès signature du devis + versement de l'accompte.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Quand mes documents expirent-ils ?
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Vous recevrez des notifications automatiques 30 jours avant expiration. Vérifiez
                    aussi la section "Documents" de votre profil.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Que faire en cas de problème technique ?
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Contactez votre administrateur TEMI ou utilisez la messagerie interne pour
                    signaler le problème. Précisez l'action que vous tentiez d'effectuer.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Raccourcis clavier */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => toggleSection('shortcuts')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900">⌨️ Raccourcis et astuces</h2>
            {expandedSections.includes('shortcuts') ? (
              <ChevronDown className="text-gray-500" size={20} />
            ) : (
              <ChevronRight className="text-gray-500" size={20} />
            )}
          </button>

          {expandedSections.includes('shortcuts') && (
            <div className="p-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Raccourcis utiles</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Recherche globale</span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                        Ctrl + K
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Nouveau projet</span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                        Ctrl + N
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Enregistrer</span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                        Ctrl + S
                      </kbd>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Astuces d'efficacité</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Utilisez les filtres pour trouver rapidement vos données</li>
                    <li>• Marquez vos projets prioritaires avec des étiquettes</li>
                    <li>• Configurez vos notifications pour rester informé</li>
                    <li>• Utilisez la recherche globale pour naviguer rapidement</li>
                    <li>• Consultez régulièrement votre tableau de bord</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Support et contact */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📞 Support et assistance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🆘 Besoin d'aide ?</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center">
                  <MessageSquare className="text-primary-600 mr-2" size={16} />
                  <span className="text-sm">Messagerie interne : contactez votre administrateur</span>
                </p>
                <p className="flex items-center">
                  <FileText className="text-primary-600 mr-2" size={16} />
                  <span className="text-sm">Documentation : consultez ce guide</span>
                </p>
                <p className="flex items-center">
                  <Settings className="text-primary-600 mr-2" size={16} />
                  <span className="text-sm">Paramètres : personnalisez votre expérience</span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">📧 Contact TEMI</h3>
              <div className="space-y-2 text-gray-700 text-sm">
                <p>Email : support@temi-construction.fr</p>
                <p>Téléphone : 01 23 45 67 89</p>
                <p>Horaires : Lun-Ven 9h-18h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideApplicationPage;
