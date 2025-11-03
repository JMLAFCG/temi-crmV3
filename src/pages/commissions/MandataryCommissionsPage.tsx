import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  Award,
  Calendar,
  Euro,
  BarChart,
  Users,
  ArrowUp,
  ArrowDown,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import {
  MANDATARY_COMMISSION_TIERS,
  calculateMandataryCommission,
  calculateAnnualProduction,
  getOptimalTierProjection,
  simulateProjectImpact,
  MandataryCommissionTier,
} from '../../utils/mandataryCommissions';

interface MandataryStats {
  mandataryId: string;
  mandataryName: string;
  currentYear: number;
  monthsElapsed: number;
  annualProduction: number;
  monthlyAverage: number;
  projectedAnnualProduction: number;
  currentTier: MandataryCommissionTier;
  projectedTier: MandataryCommissionTier;
  totalCommissionsEarned: number;
  pendingCommissions: number;
  projectsCount: number;
  conversionRate: number;
}

interface ProjectCommission {
  id: string;
  projectTitle: string;
  clientName: string;
  projectAmount: number;
  temiCommission: number;
  mandataryCommission: number;
  commissionRate: number;
  status: 'pending' | 'invoiced' | 'paid';
  quoteSignedDate: string;
  createdAt: string;
}

const TierProgressCard: React.FC<{
  stats: MandataryStats;
  onSimulateProject: (amount: number) => void;
}> = ({ stats, onSimulateProject }) => {
  const [simulationAmount, setSimulationAmount] = useState(50000);

  const progressPercentage = stats.currentTier.maxAmount
    ? (stats.projectedAnnualProduction / stats.currentTier.maxAmount) * 100
    : 100;

  const nextTier = MANDATARY_COMMISSION_TIERS.find(
    tier => tier.minAmount > stats.currentTier.minAmount
  );

  const amountToNextTier = nextTier
    ? Math.max(0, nextTier.minAmount - stats.projectedAnnualProduction)
    : 0;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-900">Palier de commission actuel</h3>
        <div className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full">
          <Award size={16} className="mr-1" />
          <span className="font-bold">{stats.currentTier.commissionRate}%</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-800">Production annuelle projetée</span>
            <span className="text-sm font-bold text-blue-900">
              {stats.projectedAnnualProduction.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              })}
            </span>
          </div>

          {stats.currentTier.maxAmount && (
            <>
              <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-blue-700">
                <span>{stats.currentTier.minAmount.toLocaleString()}€</span>
                <span>{stats.currentTier.maxAmount.toLocaleString()}€</span>
              </div>
            </>
          )}
        </div>

        {nextTier && amountToNextTier > 0 && (
          <div className="bg-white/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                Pour atteindre {nextTier.commissionRate}%
              </span>
              <span className="text-sm font-bold text-green-600">
                +{nextTier.commissionRate - stats.currentTier.commissionRate}%
              </span>
            </div>
            <p className="text-sm text-blue-700">
              Il vous manque{' '}
              <strong>
                {amountToNextTier.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </strong>
            </p>
          </div>
        )}

        <div className="bg-white/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Simulateur d'impact</h4>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={simulationAmount}
              onChange={e => setSimulationAmount(Number(e.target.value))}
              className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-sm"
              placeholder="Montant du projet"
            />
            <Button variant="outline" size="sm" onClick={() => onSimulateProject(simulationAmount)}>
              Simuler
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommissionBreakdownCard: React.FC<{
  projectAmount: number;
  tier: MandataryCommissionTier;
}> = ({ projectAmount, tier }) => {
  const temiCommission = projectAmount * 0.12; // 12% TEMI
  const mandataryCommission = temiCommission * (tier.commissionRate / 100);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Répartition commission</h4>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Montant devis</span>
          <span className="font-medium text-gray-900">
            {projectAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Commission TEMI (12%)</span>
          <span className="font-medium text-blue-600">
            {temiCommission.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-200 pt-2">
          <span className="text-sm font-medium text-gray-900">
            Votre commission ({tier.commissionRate}%)
          </span>
          <span className="font-bold text-green-600">
            {mandataryCommission.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>
    </div>
  );
};

const TierComparisonTable: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Paliers de commission mandataires</h3>
        <p className="text-sm text-gray-600">Basé sur la production annuelle (devis signés)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Production Annuelle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Objectif Mensuel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Commission TTC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Exemple sur 100k€
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MANDATARY_COMMISSION_TIERS.map((tier, index) => {
              const exampleCommission = 100000 * 0.12 * (tier.commissionRate / 100);

              return (
                <tr key={tier.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tier.minAmount.toLocaleString()}€ -{' '}
                    {tier.maxAmount ? tier.maxAmount.toLocaleString() + '€' : '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {tier.monthlyMin.toLocaleString()}€ -{' '}
                    {tier.monthlyMax ? tier.monthlyMax.toLocaleString() + '€' : '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tier.commissionRate >= 40
                          ? 'bg-green-100 text-green-800'
                          : tier.commissionRate >= 30
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {tier.commissionRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {exampleCommission.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const MandataryCommissionsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedMandatary, setSelectedMandatary] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Vérification des permissions
  const canViewAllMandataries = user && ['admin', 'manager'].includes(user.role);
  const isMandatary = user?.role === 'mandatary';

  const mandataryStats: MandataryStats[] = [];

  const currentMandataryStats = mandataryStats.find(m => m.mandataryId === selectedMandatary) || null;

  const handleSimulateProject = (amount: number) => {
    const result = simulateProjectImpact(
      currentMandataryStats.annualProduction,
      currentMandataryStats.monthsElapsed,
      amount
    );
    setSimulationResult(result);
  };

  const projectCommissions: ProjectCommission[] = [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isMandatary ? 'Mes Commissions Mandataire' : 'Commissions Mandataires'}
          </h1>
          <p className="text-gray-600">
            Système de rémunération par paliers basé sur la production annuelle
          </p>
        </div>
      </div>

      {/* Sélecteur de mandataire (admin/manager uniquement) */}
      {canViewAllMandataries && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un mandataire
          </label>
          <select
            value={selectedMandatary}
            onChange={e => setSelectedMandatary(e.target.value)}
            className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            {mandataryStats.map(mandatary => (
              <option key={mandatary.mandataryId} value={mandatary.mandataryId}>
                {mandatary.mandataryName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Production annuelle</p>
              <p className="text-2xl font-bold">
                {currentMandataryStats.annualProduction.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </p>
              <p className="text-green-200 text-xs">
                Projection:{' '}
                {currentMandataryStats.projectedAnnualProduction.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </p>
            </div>
            <TrendingUp className="text-green-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Taux de commission</p>
              <p className="text-2xl font-bold">
                {currentMandataryStats.currentTier.commissionRate}%
              </p>
              {currentMandataryStats.projectedTier.commissionRate >
                currentMandataryStats.currentTier.commissionRate && (
                <p className="text-blue-200 text-xs">
                  Projection: {currentMandataryStats.projectedTier.commissionRate}%
                </p>
              )}
            </div>
            <Award className="text-blue-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Commissions gagnées</p>
              <p className="text-2xl font-bold">
                {currentMandataryStats.totalCommissionsEarned.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </p>
              <p className="text-purple-200 text-xs">
                En attente:{' '}
                {currentMandataryStats.pendingCommissions.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </p>
            </div>
            <Euro className="text-purple-200" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Projets conclus</p>
              <p className="text-2xl font-bold">{currentMandataryStats.projectsCount}</p>
              <p className="text-orange-200 text-xs">
                Taux conversion: {currentMandataryStats.conversionRate}%
              </p>
            </div>
            <Target className="text-orange-200" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progression et simulation */}
        <div className="lg:col-span-1">
          <TierProgressCard
            stats={currentMandataryStats}
            onSimulateProject={handleSimulateProject}
          />

          {simulationResult && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Résultat simulation</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nouvelle projection</span>
                  <span className="font-medium text-gray-900">
                    {simulationResult.newProjectedProduction.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nouveau taux</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">
                      {simulationResult.newTierRate}%
                    </span>
                    {simulationResult.tierUpgrade && (
                      <ArrowUp className="ml-1 text-green-500" size={16} />
                    )}
                  </div>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-sm font-medium text-gray-900">Gain commission annuel</span>
                  <span className="font-bold text-green-600">
                    +
                    {simulationResult.commissionIncrease.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Détail des commissions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Détail des commissions</h3>
              <p className="text-sm text-gray-600">
                Commissions basées sur les devis signés (production annuelle)
              </p>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                {mockProjectCommissions.map(commission => (
                  <div key={commission.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{commission.projectTitle}</h4>
                        <p className="text-sm text-gray-600">Client: {commission.clientName}</p>
                        <p className="text-sm text-gray-500">
                          Devis signé le{' '}
                          {new Date(commission.quoteSignedDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          commission.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : commission.status === 'invoiced'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {commission.status === 'paid'
                          ? 'Payée'
                          : commission.status === 'invoiced'
                            ? 'Facturée'
                            : 'En attente'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Montant devis</p>
                        <p className="font-medium text-gray-900">
                          {commission.projectAmount.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Commission TEMI (12%)</p>
                        <p className="font-medium text-blue-600">
                          {commission.temiCommission.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">
                          Votre commission ({commission.commissionRate}%)
                        </p>
                        <p className="font-bold text-green-600">
                          {commission.mandataryCommission.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des paliers */}
      <div className="mt-8">
        <TierComparisonTable />
      </div>

      {/* Explication du système */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              💡 Fonctionnement du système de rémunération mandataires
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                • <strong>Base de calcul :</strong> Production annuelle (somme des devis signés dans
                l'année)
              </p>
              <p>
                • <strong>Déclenchement :</strong> Commission due dès réception du devis signé par
                TEMI
              </p>
              <p>
                • <strong>Paliers progressifs :</strong> Plus la production annuelle augmente, plus
                le % de commission augmente
              </p>
              <p>
                • <strong>Calcul :</strong> % mandataire × Commission TEMI (12% du devis)
              </p>
              <p>
                • <strong>Exemple :</strong> Devis 100k€ → Commission TEMI 12k€ → Mandataire 30% =
                3.6k€
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandataryCommissionsPage;
