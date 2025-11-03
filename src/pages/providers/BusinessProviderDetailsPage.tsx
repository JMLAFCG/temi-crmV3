import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Euro,
  FileText,
  BarChart,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
const BusinessProviderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const provider = null;

  if (!provider) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Apporteur non trouvé</p>
        <Button variant="outline" onClick={() => navigate('/providers')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/providers')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour aux apporteurs
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">{provider.name}</h1>
                <span
                  className={`ml-3 px-3 py-1 text-sm font-medium rounded-full ${
                    provider.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {provider.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <p className="text-gray-600 mt-1">Taux de commission : {provider.commission_rate}%</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                leftIcon={<Edit size={16} />}
                onClick={() => setIsEditing(true)}
              >
                Modifier
              </Button>
              <Button variant="danger" leftIcon={<Trash2 size={16} />}>
                Supprimer
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations de contact
                </h2>
                <div className="space-y-3">
                  <p className="flex items-center text-gray-600">
                    <Mail size={18} className="text-gray-400 mr-2" />
                    {provider.email}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <Phone size={18} className="text-gray-400 mr-2" />
                    {provider.phone}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <MapPin size={18} className="text-gray-400 mr-2" />
                    {provider.address}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Projets apportés</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {provider.projects_count}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Commissions totales</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {provider.total_commissions}€
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">En attente</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {provider.pending_commissions}€
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Taux de conversion</p>
                    <p className="text-2xl font-semibold text-gray-900">85%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Projets en cours</h2>
                <div className="space-y-3">
                  {provider.projects.map(project => (
                    <div
                      key={project.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-500">
                            Commission estimée : {project.commission}€
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
                <h4 className="text-lg font-medium text-gray-900 mb-4">Historique des paiements</h4>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Règle de paiement :</strong> Les commissions sont dues dès signature
                      du devis + versement de l'accompte à l\'entreprise.
                    </p>
                  </div>
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
                        className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200"
                      >
                        <div>
                          <div>
                            <p className="font-medium text-gray-900">{payment.project}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(payment.date).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-xs text-gray-500">
                              Devis: {payment.quoteStatus === 'signed' ? '✅ Signé' : '📤 Envoyé'} •
                              Accompte:{' '}
                              {payment.downPaymentStatus === 'confirmed'
                                ? '✅ Reçu'
                                : '⏳ En attente'}
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
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText size={20} className="text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium text-gray-900">Contrat de partenariat</p>
                        <p className="text-sm text-gray-500">Signé le 15/01/2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance mensuelle</h2>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="h-64 flex items-end space-x-2">
                {[35, 45, 30, 25, 40, 50, 60, 45, 50, 55, 70, 65].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full ${i === 11 ? 'bg-primary-600' : 'bg-primary-200'} rounded-t`}
                      style={{ height: `${height * 2}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">
                      {
                        [
                          'Jan',
                          'Fév',
                          'Mar',
                          'Avr',
                          'Mai',
                          'Juin',
                          'Juil',
                          'Août',
                          'Sep',
                          'Oct',
                          'Nov',
                          'Déc',
                        ][i]
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProviderDetailsPage;
