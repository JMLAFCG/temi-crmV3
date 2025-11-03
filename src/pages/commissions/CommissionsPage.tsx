import React, { useState, useEffect } from 'react';
import {
  Euro,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  Users,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useCommissionStore } from '../../store/commissionStore';

interface CommissionCardProps {
  id: string;
  projectTitle: string;
  clientName: string;
  providerName: string;
  providerType: 'business_provider' | 'partner_company';
  projectAmount: number;
  commissionRate: number;
  commissionAmount: number;
  mandataryCommissionAmount: number;
  temiCommissionAmount: number;
  status: 'pending' | 'invoiced' | 'paid' | 'cancelled';
  projectStatus: 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled';
  quoteStatus: 'draft' | 'sent' | 'signed' | 'rejected';
  downPaymentStatus: 'pending' | 'received' | 'confirmed';
  invoiceDate?: string;
  paymentDate?: string;
  dueDate?: string;
  quoteSignedDate?: string;
  downPaymentDate?: string;
  downPaymentConfirmedDate?: string;
  createdAt: string;
}

const CommissionCard: React.FC<CommissionCardProps> = ({
  id,
  projectTitle,
  clientName,
  providerName,
  providerType,
  projectAmount,
  commissionRate,
  commissionAmount,
  mandataryCommissionAmount,
  temiCommissionAmount,
  status,
  projectStatus,
  quoteStatus,
  downPaymentStatus,
  invoiceDate,
  paymentDate,
  dueDate,
  quoteSignedDate,
  downPaymentDate,
  downPaymentConfirmedDate,
  createdAt,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'invoiced':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'invoiced':
        return 'Facturée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getProjectStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      case 'pending':
        return 'En attente';
      case 'draft':
        return 'Brouillon';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const canBePaid = projectStatus === 'completed' && status === 'invoiced';
  const isCommissionDue = quoteStatus === 'signed' && downPaymentStatus === 'received';
  const isOverdue = status === 'invoiced' && dueDate && new Date(dueDate) < new Date();
  const canGenerateInvoice = isCommissionDue && status === 'pending';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{projectTitle}</h3>
          <p className="text-sm text-gray-600">Client: {clientName}</p>
          <p className="text-sm text-gray-600">
            {providerType === 'business_provider' ? 'Apporteur' : 'Entreprise partenaire'}:{' '}
            {providerName}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
          >
            {getStatusLabel(status)}
          </span>
          <p className="text-sm text-gray-500 mt-1">
            Projet: {getProjectStatusLabel(projectStatus)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Montant devis</p>
          <p className="text-sm font-semibold text-gray-900">
            {projectAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Commission totale (12%)</p>
          <p className="text-sm font-semibold text-blue-900">
            {(projectAmount * 0.12).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Commission mandataire</p>
          <p className="text-sm font-semibold text-gray-900">
            {mandataryCommissionAmount.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Commission apporteur</p>
          <p className="text-sm font-semibold text-gray-900">
            {commissionAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500">Commission TEMI (net après TVA)</p>
          <p className="text-sm font-semibold text-gray-900">
            {(temiCommissionAmount - projectAmount * 0.12 * 0.2).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </p>
          <p className="text-xs text-gray-400">
            Brut:{' '}
            {temiCommissionAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </div>

      {/* TVA à régler */}
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-red-800">TVA à régler (20%)</p>
            <p className="text-xs text-red-600">Sur la commission totale perçue</p>
          </div>
          <p className="text-lg font-bold text-red-900">
            {(projectAmount * 0.12 * 0.2).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </p>
        </div>
      </div>

      {/* Dates importantes */}
      <div className="space-y-2 mb-4">
        {quoteSignedDate && (
          <p className="text-sm text-green-600">
            <CheckCircle size={14} className="inline mr-1" />
            Devis signé le {new Date(quoteSignedDate).toLocaleDateString('fr-FR')}
          </p>
        )}
        {downPaymentDate && (
          <p className="text-sm text-green-600">
            <CheckCircle size={14} className="inline mr-1" />
            Accompte reçu le {new Date(downPaymentDate).toLocaleDateString('fr-FR')}
          </p>
        )}
        {invoiceDate && (
          <p className="text-sm text-gray-600">
            <Calendar size={14} className="inline mr-1" />
            Facture de mise en relation envoyée le{' '}
            {new Date(invoiceDate).toLocaleDateString('fr-FR')}
          </p>
        )}
        {paymentDate && (
          <p className="text-sm text-green-600">
            <CheckCircle size={14} className="inline mr-1" />
            Facture de mise en relation payée le {new Date(paymentDate).toLocaleDateString('fr-FR')}
          </p>
        )}
        {dueDate && status === 'invoiced' && (
          <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Clock size={14} className="inline mr-1" />
            Échéance facture mise en relation: {new Date(dueDate).toLocaleDateString('fr-FR')}
            {isOverdue && ' (En retard)'}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" leftIcon={<Eye size={16} />}>
            Détails
          </Button>
          {(status === 'invoiced' || status === 'paid') && (
            <Button variant="outline" size="sm" leftIcon={<Download size={16} />}>
              Facture
            </Button>
          )}
        </div>

        {canGenerateInvoice && (
          <Button variant="primary" size="sm">
            Facturer la mise en relation
          </Button>
        )}

        {status === 'invoiced' && (
          <Button variant="primary" size="sm">
            Confirmer le paiement
          </Button>
        )}
      </div>

      {/* Alertes */}
      {!isCommissionDue && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <AlertTriangle size={14} className="inline mr-1" />
            Mise en relation non facturable -{' '}
            {quoteStatus !== 'signed'
              ? 'Devis non signé par le client'
              : 'Accompte non reçu de la part du client'}
          </p>
        </div>
      )}

      {isOverdue && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <AlertTriangle size={14} className="inline mr-1" />
            Facture de mise en relation en retard
          </p>
        </div>
      )}
    </div>
  );
};
const CommissionsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { commissions, loading, fetchCommissions, updateCommissionStatus } = useCommissionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  // Vérification des permissions
  const canManageCommissions = user && ['admin', 'manager'].includes(user.role);
  const isProvider = user && ['business_provider', 'partner_company'].includes(user.role);

  if (!canManageCommissions && !isProvider) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-medium text-red-800 mb-2">Accès restreint</h2>
          <p className="text-red-700">Vous n'avez pas accès à la gestion des commissions.</p>
        </div>
      </div>
    );
  }

  const allCommissions: CommissionCardProps[] = [];

  const filteredCommissions = allCommissions.filter(commission => {
    // Si c'est un apporteur, ne montrer que ses commissions
    if (isProvider) {
      return (
        commission.providerName === user?.firstName + ' ' + user?.lastName ||
        commission.providerName === user?.email
      ); // Adapter selon la structure des données
    }

    // Filtres de recherche
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (
        !commission.projectTitle.toLowerCase().includes(searchLower) &&
        !commission.clientName.toLowerCase().includes(searchLower) &&
        !commission.providerName.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Filtre par statut
    if (statusFilter !== 'all' && commission.status !== statusFilter) {
      return false;
    }

    // Filtre par type d'apporteur
    if (providerFilter !== 'all' && commission.providerType !== providerFilter) {
      return false;
    }

    return true;
  });

  // Calculs des totaux
  const totalCommissions = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const paidCommissions = filteredCommissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  const pendingCommissions = filteredCommissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  const overdueCommissions = filteredCommissions
    .filter(c => c.status === 'invoiced' && c.dueDate && new Date(c.dueDate) < new Date())
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  const viewTitle = isProvider ? 'Mes Commissions' : 'Gestion des Commissions';
  const viewDescription = isProvider
    ? 'Suivi de vos commissions d\'apporteur d\'affaires'
    : 'Gestion des commissions apporteurs et mandataires';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{viewTitle}</h1>
          <p className="text-gray-600">{viewDescription}</p>
        </div>
        {canManageCommissions && (
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline" leftIcon={<Download size={16} />}>
              Exporter
            </Button>
            <Button variant="primary" leftIcon={<FileText size={16} />}>
              Générer factures
            </Button>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total commissions</p>
              <p className="text-2xl font-bold">
                {totalCommissions.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            <Euro className="text-blue-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Commissions payées</p>
              <p className="text-2xl font-bold">
                {paidCommissions.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            <CheckCircle className="text-green-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">En attente</p>
              <p className="text-2xl font-bold">
                {pendingCommissions.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            <Clock className="text-yellow-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">En retard</p>
              <p className="text-2xl font-bold">
                {overdueCommissions.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            <AlertTriangle className="text-red-200" size={32} />
          </div>
        </div>
      </div>

      {/* Filtres */}
      {!isProvider && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher projets, clients, apporteurs..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="invoiced">Facturées</option>
              <option value="paid">Payées</option>
              <option value="cancelled">Annulées</option>
            </select>

            <select
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
              className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">Tous les apporteurs</option>
              <option value="business_provider">Apporteurs individuels</option>
              <option value="partner_company">Entreprises partenaires</option>
            </select>
          </div>
        </div>
      )}

      {/* Règles de commission */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          📋 Processus de commissionnement TEMI
        </h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            • <strong>1.</strong> Entreprise envoie devis au client via TEMI
          </p>
          <p>
            • <strong>2.</strong> Client signe le devis et verse l'accompte à l'entreprise
          </p>
          <p>
            • <strong>3.</strong> TEMI récupère le devis signé (mandataire peut récupérer le chèque)
          </p>
          <p>
            • <strong>4.</strong> TEMI transmet le devis signé à l'entreprise partenaire
          </p>
          <p>
            • <strong>5.</strong> TEMI facture sa commission de mise en relation (12% TTC)
          </p>
          <p>
            • <strong>6.</strong> Commission apporteur : 10% de notre commission (soit 1.2% du
            devis)
          </p>
        </div>
      </div>

      {/* Liste des commissions */}
      <div className="space-y-6">
        {filteredCommissions.length === 0 ? (
          <div className="text-center py-12">
            <Euro size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isProvider ? 'Aucune commission' : 'Aucune commission trouvée'}
            </h3>
            <p className="text-gray-500">
              {isProvider
                ? "Vous n'avez pas encore de commissions d'apporteur d'affaires."
                : 'Aucune commission ne correspond à vos critères de recherche.'}
            </p>
          </div>
        ) : (
          filteredCommissions.map(commission => (
            <CommissionCard key={commission.id} {...commission} />
          ))
        )}
      </div>

      {/* Résumé mensuel */}
      {canManageCommissions && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Résumé mensuel</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Janvier 2025</p>
              <p className="text-xl font-bold text-gray-900">2,450€</p>
              <p className="text-sm text-green-600">+15% vs décembre</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Février 2025</p>
              <p className="text-xl font-bold text-gray-900">1,890€</p>
              <p className="text-sm text-red-600">-23% vs janvier</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Prévision mars</p>
              <p className="text-xl font-bold text-gray-900">3,200€</p>
              <p className="text-sm text-green-600">+69% vs février</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Ensure default export
export default CommissionsPage;
