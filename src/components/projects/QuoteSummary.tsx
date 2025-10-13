import React from 'react';
import { FileText, Building2, Euro } from 'lucide-react';

interface Quote {
  companyId: string;
  companyName: string;
  companyLogo?: {
    url: string;
    alt: string;
  };
  amount: number;
  lots: string[];
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
}

interface QuoteSummaryProps {
  projectTitle: string;
  quotes: Quote[];
  onQuoteSelect?: (quoteId: string) => void;
}

export const QuoteSummary: React.FC<QuoteSummaryProps> = ({
  projectTitle,
  quotes,
  onQuoteSelect,
}) => {
  const totalAmount = quotes.reduce((sum, quote) => sum + quote.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Récapitulatif des devis - {projectTitle}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {quotes.length} entreprise{quotes.length > 1 ? 's' : ''} sélectionnée
          {quotes.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {quotes.map(quote => (
          <div
            key={quote.companyId}
            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onQuoteSelect?.(quote.companyId)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {quote.companyLogo ? (
                  <img
                    src={quote.companyLogo.url}
                    alt={quote.companyLogo.alt}
                    className="w-12 h-12 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{quote.companyName}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <FileText size={16} className="mr-1" />
                    Devis n°{quote.companyId.slice(0, 8)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {quote.amount.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(quote.submittedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Lots concernés</h4>
              <div className="flex flex-wrap gap-2">
                {quote.lots.map(lot => (
                  <span
                    key={lot}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {lot}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Total du projet</p>
            <p className="text-xs text-gray-500">Tous lots confondus</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {totalAmount.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              })}
            </p>
            <p className="text-xs text-gray-500">TTC</p>
          </div>
        </div>
      </div>
    </div>
  );
};
