export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';

export interface PriorityInput {
  dueAt?: string | null;
  potentialValue?: number | null;
  riskValue?: number | null;
  estimatedMinutes?: number | null;
  customerImpact?: number | null;
  groupImpact?: number | null;
  isBlocked?: boolean;
}

export interface PriorityResult {
  score: number;
  priority: TaskPriority;
  reasons: string[];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const calculatePriority = (input: PriorityInput): PriorityResult => {
  const reasons: string[] = [];
  let score = 0;

  if (input.dueAt) {
    const hours = (new Date(input.dueAt).getTime() - Date.now()) / 3_600_000;
    if (hours < 0) {
      score += 40;
      reasons.push('Échéance dépassée');
    } else if (hours <= 24) {
      score += 32;
      reasons.push('Échéance dans moins de 24 h');
    } else if (hours <= 72) {
      score += 22;
      reasons.push('Échéance proche');
    } else if (hours <= 168) {
      score += 12;
    }
  }

  const potential = Math.max(0, Number(input.potentialValue || 0));
  const risk = Math.max(0, Number(input.riskValue || 0));
  const duration = Math.max(0, Number(input.estimatedMinutes || 0));
  const customerImpact = clamp(Number(input.customerImpact || 0), 0, 100);
  const groupImpact = clamp(Number(input.groupImpact || 0), 0, 100);

  score += clamp(potential / 2500, 0, 20);
  score += clamp(risk / 2500, 0, 20);
  score += customerImpact * 0.12;
  score += groupImpact * 0.08;

  if (potential >= 10_000) reasons.push('Potentiel financier élevé');
  if (risk >= 10_000) reasons.push('Montant exposé élevé');
  if (customerImpact >= 70) reasons.push('Impact client important');
  if (groupImpact >= 70) reasons.push('Impact Groupe important');

  if (duration > 0 && duration <= 15) {
    score += 8;
    reasons.push('Action rapide');
  } else if (duration >= 120) {
    score -= 5;
  }

  if (input.isBlocked) {
    score += 18;
    reasons.push('Dossier bloqué');
  }

  const normalized = Math.round(clamp(score, 0, 100) * 100) / 100;
  const priority: TaskPriority =
    normalized >= 75 ? 'critical' : normalized >= 50 ? 'high' : normalized >= 25 ? 'normal' : 'low';

  return { score: normalized, priority, reasons };
};
