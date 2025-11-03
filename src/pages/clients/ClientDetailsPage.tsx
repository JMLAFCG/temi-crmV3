import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Mail, Phone, MapPin, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useClientStore } from '../../store/clientStore';
import { ClientForm } from '../../components/clients/ClientForm';
const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, fetchClients, updateClient, deleteClient } = useClientStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Trouver le client par ID ou créer un client mock pour la démo
  let client = clients.find(c => c.id === id);

  // Pas de données mock - uniquement les données réelles de Supabase

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client non trouvé</p>
        <Button variant="outline" onClick={() => navigate('/clients')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    );
  }

  const handleUpdate = async (data: any) => {
    setLoading(true);
    try {
      await updateClient(client.id, data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteClient(client.id);
      navigate('/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour aux détails
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier le client</h1>

          <ClientForm
            initialData={{
              user_first_name: client.user.first_name,
              user_last_name: client.user.last_name,
              user_email: client.user.email,
              phone: client.phone,
              company_name: client.company_name,
              siret: client.siret,
              address: client.address,
              notes: client.notes,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Retour à la liste
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {client.user.first_name} {client.user.last_name}
              </h1>
              {client.company_name && <p className="text-gray-600 mt-1">{client.company_name}</p>}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                leftIcon={<Edit size={16} />}
                onClick={() => setIsEditing(true)}
              >
                Modifier
              </Button>
              <Button
                variant="primary"
                leftIcon={<Eye size={16} />}
                onClick={() => {
                  // Naviguer vers la page de visualisation du dashboard utilisateur
                  navigate(`/users/${client.user.id}/dashboard`);
                }}
              >
                Voir son espace
              </Button>
              <Button
                variant="danger"
                leftIcon={<Trash2 size={16} />}
                onClick={handleDelete}
                isLoading={loading}
              >
                Supprimer
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500">Contact</h2>
                <div className="mt-2 space-y-2">
                  <p className="flex items-center text-gray-900">
                    <Mail size={18} className="text-gray-400 mr-2" />
                    {client.user.email}
                  </p>
                  {client.phone && (
                    <p className="flex items-center text-gray-900">
                      <Phone size={18} className="text-gray-400 mr-2" />
                      {client.phone}
                    </p>
                  )}
                </div>
              </div>

              {client.company_name && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Entreprise</h2>
                  <div className="mt-2 space-y-2">
                    <p className="flex items-center text-gray-900">
                      <Building size={18} className="text-gray-400 mr-2" />
                      {client.company_name}
                    </p>
                    {client.siret && <p className="text-gray-600 ml-6">SIRET : {client.siret}</p>}
                  </div>
                </div>
              )}

              {client.address && Object.keys(client.address).length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Adresse</h2>
                  <div className="mt-2">
                    <p className="flex items-start text-gray-900">
                      <MapPin size={18} className="text-gray-400 mr-2 mt-1" />
                      <span>
                        {client.address.street}
                        <br />
                        {client.address.postal_code} {client.address.city}
                        {client.address.country && (
                          <>
                            <br />
                            {client.address.country}
                          </>
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-2">Projets</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">Aucun projet en cours</p>
              </div>
            </div>
          </div>

          {client.notes && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Notes</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 whitespace-pre-wrap">{client.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsPage;
