import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Edit, Trash2, Tag, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
const CompanyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuthStore();

  // Charger les données réelles depuis Supabase
  const company = null; // À remplacer par useCompanyStore ou requête Supabase

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Entreprise non trouvée</p>
        <Button variant="outline" onClick={() => navigate('/companies')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux entreprises
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <span className="ml-3 px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                  Partenaire actif
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                {company.type} • SIRET: {company.siret}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                leftIcon={<Edit size={16} />}
                onClick={() => setIsEditing(true)}
                disabled={company.category === 'service_provider' && user?.role !== 'admin'}
              >
                Modifier
              </Button>
              <Button
                variant="danger"
                leftIcon={<Trash2 size={16} />}
                disabled={company.category === 'service_provider' && user?.role !== 'admin'}
              >
                Supprimer
              </Button>
            </div>

            {company.category === 'service_provider' && user?.role !== 'admin' && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  <strong>Accès restreint :</strong> Seuls les administrateurs peuvent modifier les
                  fournisseurs de services.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
                <div className="space-y-3">
                  <p className="flex items-center text-gray-600">
                    <Mail size={18} className="text-gray-400 mr-2" />
                    {company.email}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <Phone size={18} className="text-gray-400 mr-2" />
                    {company.phone}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <MapPin size={18} className="text-gray-400 mr-2" />
                    {company.address}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Activités</h2>
                <div className="flex flex-wrap gap-2">
                  {company.activities.map((activity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag size={14} className="mr-1" />
                      {activity}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Équipe</h2>
                <div className="space-y-3">
                  {company.team.map((member, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {member.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Projets en cours</h2>
                <div className="space-y-3">
                  {company.projects.map(project => (
                    <div
                      key={project.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-500">
                            Démarré le {new Date().toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {project.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
                <div className="space-y-3">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-gray-500 text-sm">Aucun document disponible</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Projets complétés</p>
                    <p className="text-2xl font-semibold text-gray-900">24</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Taux de satisfaction</p>
                    <p className="text-2xl font-semibold text-gray-900">98%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Chiffre d'affaires</p>
                    <p className="text-2xl font-semibold text-gray-900">156k€</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Délai moyen</p>
                    <p className="text-2xl font-semibold text-gray-900">12j</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CompanyDetailsPage;
