import { Link } from 'react-router-dom';
import { Building2, Users, FileText, BarChart3 } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo size="sm" />
              <span className="text-xl font-bold text-gray-900">TEMI CRM</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Gérez vos projets de construction
            <span className="block text-blue-600 mt-2">en toute simplicité</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Une solution complète pour gérer vos clients, entreprises, projets et commissions dans
            le secteur de la construction.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Commencer gratuitement
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg"
            >
              Se connecter
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion des clients</h3>
            <p className="text-gray-600">
              Centralisez toutes les informations de vos clients et suivez leur parcours.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Entreprises partenaires</h3>
            <p className="text-gray-600">
              Gérez votre réseau d'entreprises et facilitez la collaboration.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Suivi de projets</h3>
            <p className="text-gray-600">
              Suivez vos projets de A à Z avec des outils intuitifs et performants.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Commissions</h3>
            <p className="text-gray-600">
              Automatisez le calcul et le suivi de vos commissions en temps réel.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez les professionnels qui font confiance à TEMI CRM
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg"
          >
            Créer mon compte
          </Link>
        </div>
      </main>

      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} TEMI CRM. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
