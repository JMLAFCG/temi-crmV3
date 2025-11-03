import React, { useEffect, useState } from 'react';
import { Plus, Mail, Phone, User, Filter, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useProspectStore, type Prospect } from '../../store/prospectStore';
import { EmailDialog } from '../../components/prospection/EmailDialog';
import { CallDialog } from '../../components/prospection/CallDialog';

const ProspectionPage: React.FC = () => {
  const { prospects, loading, fetchProspects } = useProspectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const filteredProspects = prospects.filter(p => {
    const matchesSearch =
      !searchQuery ||
      p.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contact_first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contact_last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      new: { bg: 'bg-gray-100', text: 'text-gray-800' },
      contacted: { bg: 'bg-blue-100', text: 'text-blue-800' },
      qualified: { bg: 'bg-green-100', text: 'text-green-800' },
      converted: { bg: 'bg-red-100', text: 'text-red-800' },
      lost: { bg: 'bg-gray-300', text: 'text-gray-600' },
    };

    const config = styles[status] || styles.new;

    const labels: Record<string, string> = {
      new: 'Nouveau',
      contacted: 'Contacté',
      qualified: 'Qualifié',
      converted: 'Converti',
      lost: 'Perdu',
    };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {labels[status] || status}
      </span>
    );
  };

  const handleEmail = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setShowEmailDialog(true);
  };

  const handleCall = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setShowCallDialog(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prospection</h1>
              <p className="text-gray-600">
                Gérez vos prospects et actions de prospection
              </p>
            </div>
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={() => {
                /* TODO: Ouvrir modal création prospect */
              }}
            >
              Nouveau prospect
            </Button>
          </div>

          {/* Filtres */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un prospect..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="new">Nouveaux</option>
              <option value="contacted">Contactés</option>
              <option value="qualified">Qualifiés</option>
              <option value="converted">Convertis</option>
              <option value="lost">Perdus</option>
            </select>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['new', 'contacted', 'qualified', 'converted', 'lost'].map(status => (
            <div key={status} className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-600 capitalize">{status}</p>
              <p className="text-2xl font-bold text-gray-900">
                {prospects.filter(p => p.status === status).length}
              </p>
            </div>
          ))}
        </div>

        {/* Liste des prospects */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dernier contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProspects.map(prospect => (
                  <tr key={prospect.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {prospect.contact_first_name} {prospect.contact_last_name}
                        </p>
                        <p className="text-sm text-gray-500">{prospect.email}</p>
                        <p className="text-sm text-gray-500">{prospect.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{prospect.company_name || '-'}</p>
                      {prospect.industry && (
                        <p className="text-xs text-gray-500">{prospect.industry}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(prospect.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {prospect.last_contact_date
                          ? new Date(prospect.last_contact_date).toLocaleDateString()
                          : 'Jamais'}
                      </p>
                      {prospect.next_action_date && (
                        <p className="text-xs text-red-600">
                          Prochain: {new Date(prospect.next_action_date).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEmail(prospect)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          title="Envoyer un email"
                        >
                          <Mail size={18} />
                        </button>
                        <button
                          onClick={() => handleCall(prospect)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          title="Appeler"
                        >
                          <Phone size={18} />
                        </button>
                        <button
                          onClick={() => {
                            /* TODO: Ouvrir fiche prospect */
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          title="Voir détails"
                        >
                          <User size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProspects.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">Aucun prospect trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialogues */}
      {showEmailDialog && selectedProspect && (
        <EmailDialog
          prospect={selectedProspect}
          onClose={() => {
            setShowEmailDialog(false);
            setSelectedProspect(null);
          }}
          onSent={() => {
            setShowEmailDialog(false);
            setSelectedProspect(null);
            fetchProspects();
          }}
        />
      )}

      {showCallDialog && selectedProspect && (
        <CallDialog
          prospect={selectedProspect}
          onClose={() => {
            setShowCallDialog(false);
            setSelectedProspect(null);
          }}
          onSaved={() => {
            setShowCallDialog(false);
            setSelectedProspect(null);
            fetchProspects();
          }}
        />
      )}
    </div>
  );
};

export default ProspectionPage;
