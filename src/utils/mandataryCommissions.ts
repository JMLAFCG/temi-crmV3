// Système de calcul des commissions mandataires basé sur la production annuelle

export interface MandataryCommissionTier {
  id: string;
  minAmount: number;
  maxAmount: number | null;
  monthlyMin: number;
  monthlyMax: number | null;
  commissionRate: number; // Pourcentage de la commission TEMI
}

export const MANDATARY_COMMISSION_TIERS: MandataryCommissionTier[] = [
  {
    id: 'tier1',
    minAmount: 0,
    maxAmount: 100000,
    monthlyMin: 0,
    monthlyMax: 8333,
    commissionRate: 25, // 25% de la commission TEMI
  },
  {
    id: 'tier2',
    minAmount: 100001,
    maxAmount: 250000,
    monthlyMin: 8334,
    monthlyMax: 20833,
    commissionRate: 30, // 30% de la commission TEMI
  },
  {
    id: 'tier3',
    minAmount: 250001,
    maxAmount: 500000,
    monthlyMin: 20834,
    monthlyMax: 41667,
    commissionRate: 35, // 35% de la commission TEMI
  },
  {
    id: 'tier4',
    minAmount: 500001,
    maxAmount: 1000000,
    monthlyMin: 41668,
    monthlyMax: 83333,
    commissionRate: 40, // 40% de la commission TEMI
  },
  {
    id: 'tier5',
    minAmount: 1000001,
    maxAmount: 2000000,
    monthlyMin: 83334,
    monthlyMax: 166667,
    commissionRate: 45, // 45% de la commission TEMI
  },
  {
    id: 'tier6',
    minAmount: 2000001,
    maxAmount: null,
    monthlyMin: 166668,
    monthlyMax: null,
    commissionRate: 50, // 50% de la commission TEMI
  },
];

export interface MandataryCommissionCalculation {
  mandataryId: string;
  year: number;
  month: number;
  annualProduction: number;
  monthlyProduction: number;
  currentTier: MandataryCommissionTier;
  commissionRate: number;
  temiCommission: number; // Commission TEMI (12% du devis)
  mandataryCommission: number; // Commission du mandataire
  projectedAnnualCommission: number;
  isProjectionBased: boolean; // Si basé sur projection ou réel
}

/**
 * Calcule le palier de commission d'un mandataire selon sa production annuelle
 */
export const getMandataryTier = (annualProduction: number): MandataryCommissionTier => {
  for (const tier of MANDATARY_COMMISSION_TIERS) {
    if (
      annualProduction >= tier.minAmount &&
      (tier.maxAmount === null || annualProduction <= tier.maxAmount)
    ) {
      return tier;
    }
  }
  // Par défaut, retourner le premier palier
  return MANDATARY_COMMISSION_TIERS[0];
};

/**
 * Calcule la commission d'un mandataire pour un projet donné
 */
export const calculateMandataryCommission = (
  mandataryId: string,
  projectAmount: number,
  annualProduction: number,
  temiCommissionRate: number = 12 // 12% par défaut
): MandataryCommissionCalculation => {
  const currentTier = getMandataryTier(annualProduction);
  const temiCommission = projectAmount * (temiCommissionRate / 100);
  const mandataryCommission = temiCommission * (currentTier.commissionRate / 100);

  return {
    mandataryId,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    annualProduction,
    monthlyProduction: annualProduction / 12,
    currentTier,
    commissionRate: currentTier.commissionRate,
    temiCommission,
    mandataryCommission,
    projectedAnnualCommission: 0, // À calculer selon les projets en cours
    isProjectionBased: false,
  };
};

/**
 * Calcule la production annuelle d'un mandataire
 */
export const calculateAnnualProduction = (
  mandataryId: string,
  year: number,
  projects: Array<{
    agent_id: string;
    amount: number;
    status: string;
    quote_status: string;
    created_at: string;
  }>
): number => {
  return projects
    .filter(
      project =>
        project.agent_id === mandataryId &&
        project.quote_status === 'signed' &&
        new Date(project.created_at).getFullYear() === year
    )
    .reduce((total, project) => total + project.amount, 0);
};

/**
 * Projette la production annuelle basée sur les mois écoulés
 */
export const projectAnnualProduction = (
  currentProduction: number,
  monthsElapsed: number
): number => {
  if (monthsElapsed === 0) return 0;
  return (currentProduction / monthsElapsed) * 12;
};

/**
 * Calcule le palier optimal pour un mandataire (projection)
 */
export const getOptimalTierProjection = (
  currentProduction: number,
  monthsElapsed: number
): {
  currentTier: MandataryCommissionTier;
  projectedTier: MandataryCommissionTier;
  projectedProduction: number;
  canReachNextTier: boolean;
  amountNeededForNextTier: number;
} => {
  const projectedProduction = projectAnnualProduction(currentProduction, monthsElapsed);
  const currentTier = getMandataryTier(currentProduction);
  const projectedTier = getMandataryTier(projectedProduction);

  // Trouver le palier suivant
  const currentTierIndex = MANDATARY_COMMISSION_TIERS.findIndex(t => t.id === currentTier.id);
  const nextTier = MANDATARY_COMMISSION_TIERS[currentTierIndex + 1];

  const canReachNextTier = nextTier && projectedProduction >= nextTier.minAmount;
  const amountNeededForNextTier = nextTier
    ? Math.max(0, nextTier.minAmount - projectedProduction)
    : 0;

  return {
    currentTier,
    projectedTier,
    projectedProduction,
    canReachNextTier,
    amountNeededForNextTier,
  };
};

/**
 * Simule l'impact d'un nouveau projet sur la commission annuelle
 */
export const simulateProjectImpact = (
  currentProduction: number,
  monthsElapsed: number,
  newProjectAmount: number
): {
  newProjectedProduction: number;
  currentTierRate: number;
  newTierRate: number;
  commissionIncrease: number;
  tierUpgrade: boolean;
} => {
  const currentProjection = projectAnnualProduction(currentProduction, monthsElapsed);
  const newProjectedProduction = currentProjection + newProjectAmount;

  const currentTier = getMandataryTier(currentProjection);
  const newTier = getMandataryTier(newProjectedProduction);

  const tierUpgrade = newTier.commissionRate > currentTier.commissionRate;

  // Calculer l'augmentation de commission sur la production totale
  const currentTotalCommission = currentProjection * 0.12 * (currentTier.commissionRate / 100);
  const newTotalCommission = newProjectedProduction * 0.12 * (newTier.commissionRate / 100);
  const commissionIncrease = newTotalCommission - currentTotalCommission;

  return {
    newProjectedProduction,
    currentTierRate: currentTier.commissionRate,
    newTierRate: newTier.commissionRate,
    commissionIncrease,
    tierUpgrade,
  };
};
