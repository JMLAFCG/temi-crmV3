import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Calendar, User, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface AuditLogEntry {
  id: string;
  at: string;
  user_name: string;
  user_email: string;
  action: string;
  entity: string;
  entity_id: string;
  before?: any;
  after?: any;
}

const AuditPage: React.FC = () => {
  const { user } = useAuthStore();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  // Vérification des permissions
  const canViewAudit = user && ['admin', 'manager'].includes(user.role);

  useEffect(() => {
    if (canViewAudit) {
      fetchAuditLogs();
    }
  }, [canViewAudit]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from audit_log_v view
      let { data, error } = await supabase
        .from('audit_log_v')
        .select('*')
        .order('at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn('Audit log view not available, using mock data:', error);
        // Use mock data if audit_log_v doesn't exist yet
        const mockAuditLogs: AuditLogEntry[] = [
          {
            id: '1',
            at: new Date().toISOString(),
            user_name: 'Jean-Marc Leton',
            user_email: 'admin@temi-construction.fr',
            action: 'INSERT',
            entity: 'projects',
            entity_id: 'project-1',
            after: { title: 'Nouveau projet', status: 'draft' }
          },
          {
            id: '2',
            at: new Date(Date.now() - 3600000).toISOString(),
            user_name: 'Sophie Martin',
            user_email: 'sophie@temi-construction.fr',
            action: 'UPDATE',
            entity: 'users',
            entity_id: 'user-1',
            before: { status: 'inactive' },
            after: { status: 'active' }
          }
        ];
        setAuditLogs(mockAuditLogs);
      } else {
        setAuditLogs(data || []);
      }
    } catch (error) {
      console.error('Erreur chargement audit:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (!canViewAudit) {
    return (
      <div className="text-center py-12" data-testid="audit-page">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-medium text-red-800 mb-2">Accès restreint</h2>
          <p className="text-red-700">Seuls les administrateurs et managers peuvent consulter l'audit.</p>
        </div>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(log => {
    if (searchQuery && !log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.entity.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (entityFilter !== 'all' && log.entity !== entityFilter) {
      return false;
    }
    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false;
    }
    return true;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'users':
        return <User size={16} />;
      case 'projects':
        return <FileText size={16} />;
      case 'invoices':
        return <FileText size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div data-testid="audit-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal d'audit</h1>
          <p className="text-gray-600">Historique des actions sur la plateforme</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher dans l'audit..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={entityFilter}
          onChange={e => setEntityFilter(e.target.value)}
          className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">Toutes les entités</option>
          <option value="users">Utilisateurs</option>
          <option value="projects">Projets</option>
          <option value="invoices">Factures</option>
          <option value="payments">Paiements</option>
        </select>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">Toutes les actions</option>
          <option value="INSERT">Création</option>
          <option value="UPDATE">Modification</option>
          <option value="DELETE">Suppression</option>
        </select>
      </div>

      {/* Liste des logs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entité
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">
                        {new Date(log.at).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {new Date(log.at).toLocaleTimeString('fr-FR')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.user_name}</div>
                    <div className="text-xs text-gray-500">{log.user_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getEntityIcon(log.entity)}
                      <span className="ml-2 text-sm text-gray-900">{log.entity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye size={14} />}
                      onClick={() => setSelectedEntry(log)}
                    >
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal détails */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de l'audit</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <p className="text-sm text-gray-900">{selectedEntry.action}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Entité</label>
                  <p className="text-sm text-gray-900">{selectedEntry.entity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Utilisateur</label>
                  <p className="text-sm text-gray-900">{selectedEntry.user_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedEntry.at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              {selectedEntry.before && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Avant</label>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedEntry.before, null, 2)}
                  </pre>
                </div>
              )}

              {selectedEntry.after && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Après</label>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedEntry.after, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setSelectedEntry(null)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditPage;
