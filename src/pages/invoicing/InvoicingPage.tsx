import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Euro,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { 
  createInvoice, 
  issueInvoice, 
  markInvoiceAsPaid, 
  generateInvoicePDF,
  type Invoice,
  type InvoiceData 
} from '../../lib/invoicing';
import { supabase } from '../../lib/supabase';

interface InvoiceFormData {
  projectId: string;
  counterpartyType: 'partner_company' | 'client';
  counterpartyId: string;
  amountHT: number;
  tvaRate: number;
  dueDate: string;
  notes: string;
}

const InvoiceCard: React.FC<{
  invoice: Invoice;
  onStatusChange: (id: string, status: string) => void;
  onMarkPaid: (id: string) => void;
}> = ({ invoice, onStatusChange, onMarkPaid }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'issued':
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={16} />;
      case 'overdue':
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{invoice.number}</h3>
          <p className="text-sm text-gray-600">
            Montant: {invoice.amountTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
          {invoice.dueDate && (
            <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
              Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
              {isOverdue && ' (En retard)'}
            </p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
          {getStatusIcon(invoice.status)}
          <span className="ml-2 capitalize">{invoice.status}</span>
        </span>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" leftIcon={<Eye size={16} />}>
            Détails
          </Button>
          {invoice.pdfUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              leftIcon={<Download size={16} />}
              onClick={() => window.open(invoice.pdfUrl, '_blank')}
            >
              PDF
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          {invoice.status === 'draft' && (
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => onStatusChange(invoice.id, 'issued')}
            >
              Émettre
            </Button>
          )}
          {(invoice.status === 'issued' || invoice.status === 'sent') && (
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => onMarkPaid(invoice.id)}
            >
              Marquer payée
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const InvoicingPage: React.FC = () => {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paidAt: new Date().toISOString().split('T')[0],
    bankReference: '',
    notes: ''
  });

  // Vérification des permissions
  const canManageInvoices = user && ['admin', 'manager', 'comptable'].includes(user.role);

  useEffect(() => {
    if (canManageInvoices) {
      fetchInvoices();
    }
  }, [canManageInvoices]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const adaptedInvoices: Invoice[] = (data || []).map(item => ({
        id: item.id,
        number: item.number,
        status: item.status,
        amountHT: item.amount_ht,
        tvaRate: item.tva_rate,
        amountTTC: item.amount_ttc,
        dueDate: item.due_date,
        issuedAt: item.issued_at,
        paidAt: item.paid_at,
        bankReference: item.bank_reference,
        pdfUrl: item.pdf_url,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setInvoices(adaptedInvoices);
    } catch (error) {
      console.error('Erreur chargement factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (formData: InvoiceFormData) => {
    try {
      const invoiceData: InvoiceData = {
        projectId: formData.projectId,
        counterpartyType: formData.counterpartyType,
        counterpartyId: formData.counterpartyId,
        amountHT: formData.amountHT,
        tvaRate: formData.tvaRate,
        dueDate: new Date(formData.dueDate),
        notes: formData.notes
      };

      await createInvoice(invoiceData);
      await fetchInvoices();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Erreur création facture:', error);
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      if (newStatus === 'issued') {
        await issueInvoice(invoiceId);
      } else {
        await supabase
          .from('invoices')
          .update({ status: newStatus })
          .eq('id', invoiceId);
      }
      await fetchInvoices();
    } catch (error) {
      console.error('Erreur changement statut:', error);
    }
  };

  const handleMarkPaid = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
      setSelectedInvoiceId(invoiceId);
      setPaymentData(prev => ({ ...prev, amount: invoice.amountTTC }));
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!selectedInvoiceId) return;

    try {
      await markInvoiceAsPaid(selectedInvoiceId, {
        amount: paymentData.amount,
        paidAt: new Date(paymentData.paidAt),
        bankReference: paymentData.bankReference,
        notes: paymentData.notes
      });

      setShowPaymentModal(false);
      setSelectedInvoiceId(null);
      await fetchInvoices();
    } catch (error) {
      console.error('Erreur enregistrement paiement:', error);
    }
  };

  if (!canManageInvoices) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-medium text-red-800 mb-2">Accès restreint</h2>
          <p className="text-red-700">Vous n'avez pas accès à la gestion des factures.</p>
        </div>
      </div>
    );
  }

  const filteredInvoices = invoices.filter(invoice => {
    if (searchQuery && !invoice.number.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && invoice.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amountTTC, 0);
  const paidAmount = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amountTTC, 0);
  const overdueAmount = filteredInvoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amountTTC, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
          <p className="text-gray-600">Gestion des factures et paiements</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setShowCreateForm(true)}
        >
          Nouvelle facture
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total facturé</p>
              <p className="text-2xl font-bold">
                {totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            <Euro className="text-blue-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Encaissé</p>
              <p className="text-2xl font-bold">
                {paidAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            <CheckCircle className="text-green-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">En retard</p>
              <p className="text-2xl font-bold">
                {overdueAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            <AlertTriangle className="text-red-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Factures</p>
              <p className="text-2xl font-bold">{filteredInvoices.length}</p>
            </div>
            <FileText className="text-purple-200" size={32} />
          </div>
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
            placeholder="Rechercher une facture..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="issued">Émise</option>
          <option value="sent">Envoyée</option>
          <option value="paid">Payée</option>
          <option value="overdue">En retard</option>
        </select>
      </div>

      {/* Liste des factures */}
      <div className="space-y-6">
        {filteredInvoices.map(invoice => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            onStatusChange={handleStatusChange}
            onMarkPaid={handleMarkPaid}
          />
        ))}
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Enregistrer un paiement</h3>
            
            <div className="space-y-4">
              <Input
                label="Montant reçu (€)"
                type="number"
                value={paymentData.amount}
                onChange={e => setPaymentData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              />
              
              <Input
                label="Date de paiement"
                type="date"
                value={paymentData.paidAt}
                onChange={e => setPaymentData(prev => ({ ...prev, paidAt: e.target.value }))}
              />
              
              <Input
                label="Référence bancaire"
                value={paymentData.bankReference}
                onChange={e => setPaymentData(prev => ({ ...prev, bankReference: e.target.value }))}
                placeholder="Référence du virement"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Justificatif de paiement
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handlePaymentSubmit}
              >
                Enregistrer le paiement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicingPage;
