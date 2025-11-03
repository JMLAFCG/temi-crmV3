import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Briefcase, Shield, FileCheck, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export default function HomePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Demande d\'adhésion:', formData);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Logo size="sm" />
              <div>
                <span className="text-2xl font-bold text-black">TEMI</span>
                <p className="text-xs text-gray-600">Groupe AFCG</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-[#C00000] transition-colors font-medium px-4 py-2"
              >
                Connexion réseau
              </Link>
              <a
                href="#rejoindre"
                className="bg-[#C00000] text-white px-6 py-2.5 rounded-lg hover:bg-[#A00000] transition-colors font-semibold"
              >
                Rejoindre le réseau
              </a>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6 px-4 py-2 bg-[#C00000]/20 border border-[#C00000] rounded-full">
              <span className="text-[#C00000] font-semibold text-sm">Plateforme Informatique Interne - Groupe AFCG</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Bienvenue sur <span className="text-[#C00000]">TEMI</span>
            </h1>
            <p className="text-2xl md:text-3xl font-light text-gray-300 mb-4">
              La plateforme de travail digitale du Groupe AFCG
            </p>
            <p className="text-xl text-gray-400 mb-12">
              Courtage en Travaux • Conseil • Financement
            </p>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-10 inline-block">
              <p className="text-lg text-white/90">
                L'outil professionnel <span className="font-semibold text-[#C00000]">exclusif</span> pour nos salariés,<br />mandataires, apporteurs d'affaires et entreprises partenaires
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="#rejoindre"
                className="bg-[#C00000] text-white px-10 py-4 rounded-lg hover:bg-[#A00000] transition-all font-semibold text-lg shadow-lg hover:shadow-xl inline-flex items-center justify-center"
              >
                Demander à rejoindre le réseau
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <a
                href="#pourquoi"
                className="bg-white text-black px-10 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
              >
                En savoir plus
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="pourquoi" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Notre Plateforme Informatique
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              TEMI est l'outil de travail quotidien développé par TEMI-Construction pour digitaliser et optimiser toutes les opérations du groupe AFCG
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-100 hover:border-[#C00000] transition-all">
              <div className="w-16 h-16 bg-[#C00000]/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-[#C00000]" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Système informatique sécurisé</h3>
              <p className="text-gray-600 leading-relaxed">
                Infrastructure professionnelle accessible uniquement aux collaborateurs et partenaires validés du groupe
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-100 hover:border-[#C00000] transition-all">
              <div className="w-16 h-16 bg-[#C00000]/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-[#C00000]" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Travail collaboratif</h3>
              <p className="text-gray-600 leading-relaxed">
                Centralisation de toutes les données clients, projets et documents pour une efficacité maximale
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-100 hover:border-[#C00000] transition-all">
              <div className="w-16 h-16 bg-[#C00000]/10 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-[#C00000]" />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Gestion automatisée</h3>
              <p className="text-gray-600 leading-relaxed">
                Calcul et suivi automatique des commissions, rémunérations et performances de chaque acteur
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Qui utilise TEMI ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              L'outil de travail au quotidien de tous les acteurs du groupe TEMI-Construction
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border-2 border-gray-200 hover:border-[#C00000] transition-all hover:shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C00000]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-[#C00000] rounded-xl flex items-center justify-center mb-6">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Mandataires</h3>
                <p className="text-lg font-semibold text-[#C00000] mb-4">Courtage travaux</p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#C00000] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Accès CRM complet</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#C00000] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Gestion de portefeuille clients</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#C00000] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Suivi des dossiers et commissions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#C00000] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Outils de calcul et simulation</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border-2 border-gray-200 hover:border-[#C00000] transition-all hover:shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C00000]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-[#C00000] rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Apporteurs</h3>
                <p className="text-lg font-semibold text-[#C00000] mb-4">D'affaires</p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#C00000] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Interface simplifiée</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#C00000] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Suivi des prospects apportés</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#C00000] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Calcul automatique des rétrocessions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#C00000] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Tableau de bord dédié</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border-2 border-gray-200 hover:border-[#C00000] transition-all hover:shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C00000]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-[#C00000] rounded-xl flex items-center justify-center mb-6">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Entreprises</h3>
                <p className="text-lg font-semibold text-[#C00000] mb-4">Partenaires artisans</p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#C00000] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Réception des demandes de devis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#C00000] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Gestion documentaire centralisée</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#C00000] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Suivi des chantiers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-[#C00000] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Communication client facilitée</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Fonctionnalités de la plateforme
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Tous les outils nécessaires pour gérer efficacement votre activité au sein du groupe
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-[#C00000] rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">CRM Intégré</h3>
              <p className="text-gray-400">
                Système complet de gestion clients et prospects adapté au métier du courtage en travaux
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-[#C00000] rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Suivi des commissions</h3>
              <p className="text-gray-400">
                Transparence totale sur vos rémunérations et historique détaillé
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-[#C00000] rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Gestion documentaire</h3>
              <p className="text-gray-400">
                Stockage sécurisé et partage simplifié de tous vos documents
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-[#C00000] rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Outils de calcul</h3>
              <p className="text-gray-400">
                Simulateurs et outils d'analyse pour vos projets de construction
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-[#C00000] rounded-lg flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Support Technique</h3>
              <p className="text-gray-400">
                Assistance technique et formation continue assurées par les équipes TEMI-Construction
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-[#C00000] rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Espace Client</h3>
              <p className="text-gray-400">
                Interface dédiée pour vos clients leur permettant de suivre leurs dossiers en temps réel
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border-2 border-[#C00000] rounded-2xl p-12">
            <div className="text-center mb-12">
              <div className="inline-block mb-6 px-6 py-3 bg-[#C00000]/10 border border-[#C00000] rounded-full">
                <span className="text-[#C00000] font-bold text-sm uppercase tracking-wide">Usage exclusif</span>
              </div>
              <h2 className="text-4xl font-bold text-black mb-6">
                Outil Interne Non Commercial
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                TEMI <span className="font-bold text-black">n'est pas un produit commercial</span>. C'est la plateforme informatique propriétaire développée par <span className="font-bold text-[#C00000]">TEMI-Construction</span> pour ses salariés, mandataires et partenaires professionnels.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <p className="text-center text-gray-700 text-lg">
                L'accès à TEMI est strictement réservé aux membres de l'organisation : salariés de TEMI-Construction, mandataires en courtage travaux, apporteurs d'affaires et entreprises partenaires sous contrat.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="rejoindre" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Rejoindre TEMI-Construction
            </h2>
            <p className="text-xl text-gray-600">
              Le processus pour devenir partenaire et accéder à la plateforme
            </p>
          </div>

          <div className="space-y-8 mb-16">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[#C00000] text-white rounded-xl flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-black mb-2">Candidature</h3>
                <p className="text-gray-600 text-lg">
                  Remplissez le formulaire ci-dessous pour manifester votre intérêt à rejoindre le groupe TEMI-Construction
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[#C00000] text-white rounded-xl flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-black mb-2">Étude du dossier</h3>
                <p className="text-gray-600 text-lg">
                  Nos équipes RH et commerciales étudient votre candidature et vérifient votre adéquation avec nos critères
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-16 h-16 bg-[#C00000] text-white rounded-xl flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-black mb-2">Intégration</h3>
                <p className="text-gray-600 text-lg">
                  Après validation : signature du contrat de collaboration, formation et création de votre compte sur TEMI
                </p>
              </div>
            </div>
          </div>

          {!submitted ? (
            <div className="bg-gradient-to-br from-gray-50 to-white p-10 rounded-2xl border-2 border-gray-200 shadow-xl">
              <h3 className="text-2xl font-bold text-black mb-8 text-center">
                Formulaire de candidature
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#C00000] focus:outline-none transition-colors"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#C00000] focus:outline-none transition-colors"
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#C00000] focus:outline-none transition-colors"
                    placeholder="jean.dupont@entreprise.fr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Entreprise / Société *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#C00000] focus:outline-none transition-colors"
                    placeholder="Nom de votre société"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profil *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#C00000] focus:outline-none transition-colors"
                  >
                    <option value="">Sélectionnez votre profil</option>
                    <option value="mandataire">Mandataire en courtage travaux</option>
                    <option value="apporteur">Apporteur d'affaires</option>
                    <option value="entreprise">Entreprise partenaire (artisan)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C00000] text-white px-8 py-4 rounded-lg hover:bg-[#A00000] transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  Envoyer ma demande
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-50 to-white p-10 rounded-2xl border-2 border-green-500 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-black mb-4">
                Demande envoyée avec succès !
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Nos équipes vont étudier votre profil et vous contacter sous 48h.
              </p>
              <p className="text-gray-500">
                Un email de confirmation vous a été envoyé à <span className="font-semibold">{formData.email}</span>
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-black text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo size="sm" />
                <div>
                  <span className="text-xl font-bold">TEMI</span>
                  <p className="text-xs text-gray-400">Groupe AFCG</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                La plateforme informatique de TEMI-Construction - Courtage en travaux
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#C00000]">À propos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>TEMI-Construction (Groupe AFCG)</li>
                <li>Plateforme interne professionnelle</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-[#C00000]">Accès</h4>
              <Link
                to="/login"
                className="inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                Connexion réseau TEMI
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} TEMI-Construction - Groupe AFCG. Tous droits réservés.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Système informatique interne - Non commercialisé
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
