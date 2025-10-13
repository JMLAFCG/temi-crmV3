import React, { useState } from 'react';
import { Euro, Users, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
const BillingSettingsPage: React.FC = () => {
  const [commissionSettings, setCommissionSettings] = useState({
    baseCommissionRate: 12, // Taux de commission de base (12% TTC)
    businessProviderRate: 10, // Taux pour les apporteurs (10% de notre commission)
    mandataryTiers: [
      // Paliers basés sur la production annuelle
      { id: '1', minAmount: 0, maxAmount: 100000, rate: 25 },
      { id: '2', minAmount: 100001, maxAmount: 250000, rate: 30 },
      { id: '3', minAmount: 250001, maxAmount: 500000, rate: 35 },
      { id: '4', minAmount: 500001, maxAmount: 1000000, rate: 40 },
      { id: '5', minAmount: 1000001, maxAmount: 2000000, rate: 45 },
      { id: '6', minAmount: 2000001, maxAmount: null, rate: 50 },
    ],
    paymentDay: 15, // Jour de paiement mensuel
  });

  const [showNewTier, setShowNewTier] = useState(false);
  const [newTier, setNewTier] = useState({
    minAmount: 0,
    maxAmount: null as number | null,
    rate: 0,
  });

  const handleAddTier = () => {
    if (!newTier.minAmount || !newTier.rate) return;

    setCommissionSettings(prev => ({
      ...prev,
      mandataryTiers: [
        ...prev.mandataryTiers,
        {
          id: crypto.randomUUID(),
          minAmount: newTier.minAmount,
          maxAmount: newTier.maxAmount,
          rate: newTier.rate,
        },
      ].sort((a, b) => a.minAmount - b.minAmount),
    }));

    setNewTier({ minAmount: 0, maxAmount: null, rate: 0 });
    setShowNewTier(false);
  };

  const handleDeleteTier = (tierId: string) => {
    setCommissionSettings(prev => ({
      ...prev,
      mandataryTiers: prev.mandataryTiers.filter(tier => tier.id !== tierId),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Statistiques de facturation */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Aperçu de la facturation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Euro className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Ce mois</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">45 600€</p>
              <p className="text-sm text-gray-500">Chiffre d'affaires</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Actifs</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">12</p>
              <p className="text-sm text-gray-500">Apporteurs & Mandataires</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">En attente</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">5 470€</p>
              <p className="text-sm text-gray-500">Commissions à payer</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm text-gray-500">Prochain</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">15/06</p>
              <p className="text-sm text-gray-500">Paiement commissions</p>
            </div>
          </div>
        </div>

        {/* Commission de base */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Commission de base</h2>

          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Modèle économique TEMI</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                • <strong>Service :</strong> Mise en relation qualifiée entre clients et entreprises
              </p>
              <p>
                • <strong>Déclenchement :</strong> Devis signé retourné à TEMI + Accompte versé à
                l'entreprise
              </p>
              <p>
                • <strong>Commission :</strong> 12% TTC du montant du devis signé
              </p>
              <p>
                • <strong>Facturation :</strong> TEMI facture dès retransmission du devis signé à
                l'entreprise
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <Input
              label="Taux de commission TTC"
              type="number"
              value={commissionSettings.baseCommissionRate}
              onChange={e =>
                setCommissionSettings(prev => ({
                  ...prev,
                  baseCommissionRate: Number(e.target.value),
                }))
              }
              disabled
            />
            <p className="mt-2 text-sm text-gray-500">
              Notre commission est fixée à 12% TTC du montant du devis signé
            </p>
          </div>
        </div>

        {/* Commission apporteurs d'affaires */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Commission apporteurs d'affaires
          </h2>

          <div className="max-w-md">
            <Input
              label="Taux de commission TTC"
              type="number"
              value={commissionSettings.businessProviderRate}
              onChange={e =>
                setCommissionSettings(prev => ({
                  ...prev,
                  businessProviderRate: Number(e.target.value),
                }))
              }
              disabled
            />
            <p className="mt-2 text-sm text-gray-500">
              Les apporteurs d'affaires reçoivent 10% TTC de notre commission (dès signature +
              accompte)
            </p>
          </div>
        </div>

        {/* Commission mandataires */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Commission mandataires</h2>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Les mandataires sont rémunérés selon un système de paliers basé sur leur chiffre
              d'affaires mensuel
            </p>

            <div className="space-y-3">
              {commissionSettings.mandataryTiers.map(tier => (
                <div
                  key={tier.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">
                      {tier.minAmount.toLocaleString()}€ -{' '}
                      {tier.maxAmount ? tier.maxAmount.toLocaleString() + '€' : '∞'}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {tier.rate}% de la commission
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteTier(tier.id)}>
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>

            {showNewTier ? (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Nouveau palier</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Production annuelle min"
                    type="number"
                    value={newTier.minAmount}
                    onChange={e => setNewTier({ ...newTier, minAmount: Number(e.target.value) })}
                  />
                  <Input
                    label="Production annuelle max"
                    type="number"
                    value={newTier.maxAmount || ''}
                    onChange={e =>
                      setNewTier({
                        ...newTier,
                        maxAmount: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="Illimité"
                  />
                  <Input
                    label="% Commission TEMI"
                    type="number"
                    value={newTier.rate}
                    onChange={e => setNewTier({ ...newTier, rate: Number(e.target.value) })}
                  />
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowNewTier(false)}>
                    Annuler
                  </Button>
                  <Button variant="primary" onClick={handleAddTier}>
                    Ajouter
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowNewTier(true)}>
                Ajouter un palier
              </Button>
            )}
          </div>
        </div>

        {/* Paramètres de paiement */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Paramètres de paiement</h2>

          <div className="max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jour de paiement mensuel
              </label>
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={commissionSettings.paymentDay}
                onChange={e =>
                  setCommissionSettings(prev => ({
                    ...prev,
                    paymentDay: Number(e.target.value),
                  }))
                }
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Les commissions seront payées automatiquement à cette date chaque mois
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="primary">Enregistrer les modifications</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSettingsPage;
