import { supabase } from '../lib/supabase';
import { Project } from '../types';

interface MatchingCriteria {
  activities: string[];
  intellectualServices: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    postalCode: string;
  };
  timeline: {
    startDate: string;
    endDate: string;
    estimatedDuration: number;
  };
  budget: {
    total: number;
    materials: number;
    labor: number;
  };
}

interface MatchedCompany {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  activities: string[];
  territory: {
    center: { lat: number; lng: number };
    radius: number;
  };
  availability: {
    working_hours: any;
    blocked_dates: string[];
    calendar: any[];
  };
  verification_status: string;
  average_rating: number;
  success_rate: number;
  response_rate: number;
  matching_score: number;
  // Scores détaillés
  activityScore: number;
  locationScore: number;
  availabilityScore: number;
  reliabilityScore: number;
  distance: number;
  canHandleAllActivities: boolean;
  missingActivities: string[];
  estimatedResponseTime: number;
}

export const findMatchingCompanies = async (
  project: Project,
  criteria: MatchingCriteria
): Promise<MatchedCompany[]> => {
  try {
    console.log("🔍 Recherche d'entreprises avec les critères:", criteria);

    // Récupérer toutes les entreprises actives et vérifiées
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'active')
      .eq('verification_status', 'verified');

    if (error) {
      console.error('Erreur lors de la récupération des entreprises:', error);
      throw error;
    }

    if (!companies || companies.length === 0) {
      console.warn('Aucune entreprise trouvée');
      return [];
    }

    console.log(`📊 ${companies.length} entreprises trouvées, analyse en cours...`);

    // Analyser et scorer chaque entreprise
    const matchedCompanies: MatchedCompany[] = [];

    for (const company of companies) {
      try {
        const matchResult = await analyzeCompanyMatch(company, criteria);
        if (matchResult) {
          matchedCompanies.push(matchResult);
        }
      } catch (error) {
        console.warn(`Erreur lors de l'analyse de l'entreprise ${company.name}:`, error);
        continue;
      }
    }

    // Trier par score de matching décroissant
    const sortedCompanies = matchedCompanies.sort((a, b) => {
      // Prioriser les entreprises qui peuvent gérer toutes les activités
      if (a.canHandleAllActivities && !b.canHandleAllActivities) return -1;
      if (!a.canHandleAllActivities && b.canHandleAllActivities) return 1;

      // Puis par score de matching
      if (Math.abs(a.matching_score - b.matching_score) > 0.05) {
        return b.matching_score - a.matching_score;
      }

      // En cas d'égalité, prioriser par note moyenne
      if (Math.abs(a.average_rating - b.average_rating) > 0.1) {
        return b.average_rating - a.average_rating;
      }

      // Puis par taux de succès
      return b.success_rate - a.success_rate;
    });

    console.log(`✅ ${sortedCompanies.length} entreprises correspondent aux critères`);

    return sortedCompanies;
  } catch (error) {
    console.error("Erreur lors de la recherche d'entreprises:", error);
    throw error;
  }
};

const analyzeCompanyMatch = async (
  company: any,
  criteria: MatchingCriteria
): Promise<MatchedCompany | null> => {
  try {
    // 1. Vérifier la zone de couverture géographique
    const distance = calculateDistance(
      criteria.location.lat,
      criteria.location.lng,
      company.territory?.center?.lat || 0,
      company.territory?.center?.lng || 0
    );

    const maxDistance = company.territory?.radius || 50;
    if (distance > maxDistance) {
      console.log(`❌ ${company.name}: Hors zone (${Math.round(distance)}km > ${maxDistance}km)`);
      return null;
    }

    // 2. Vérifier les activités
    const allRequiredActivities = [...criteria.activities, ...criteria.intellectualServices];
    const companyActivities = company.activities || [];

    const matchingActivities = allRequiredActivities.filter(activity =>
      companyActivities.includes(activity)
    );

    if (matchingActivities.length === 0) {
      console.log(`❌ ${company.name}: Aucune activité correspondante`);
      return null;
    }

    // 3. Vérifier la disponibilité
    const isAvailable = await checkAvailability(company, criteria.timeline);
    if (!isAvailable) {
      console.log(`❌ ${company.name}: Non disponible sur la période`);
      return null;
    }

    // 4. Calculer les scores détaillés
    const activityScore = calculateActivityScore(allRequiredActivities, companyActivities);
    const locationScore = calculateLocationScore(distance, maxDistance);
    const availabilityScore = await calculateAvailabilityScore(company, criteria.timeline);
    const reliabilityScore = calculateReliabilityScore(company);

    // 5. Score de matching global (pondéré)
    const matching_score =
      activityScore * 0.35 + // 35% - Activités (le plus important)
      locationScore * 0.25 + // 25% - Proximité géographique
      reliabilityScore * 0.25 + // 25% - Fiabilité (notes, taux de succès)
      availabilityScore * 0.15; // 15% - Disponibilité

    // Seuil minimum de matching
    if (matching_score < 0.3) {
      console.log(`❌ ${company.name}: Score trop faible (${Math.round(matching_score * 100)}%)`);
      return null;
    }

    const canHandleAllActivities = matchingActivities.length === allRequiredActivities.length;
    const missingActivities = allRequiredActivities.filter(
      activity => !companyActivities.includes(activity)
    );

    console.log(
      `✅ ${company.name}: Score ${Math.round(matching_score * 100)}% (${Math.round(distance)}km)`
    );

    return {
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone || '',
      address: company.address || '',
      activities: companyActivities,
      territory: company.territory || { center: { lat: 0, lng: 0 }, radius: 50 },
      availability: company.availability || { working_hours: {}, blocked_dates: [], calendar: [] },
      verification_status: company.verification_status,
      average_rating: company.average_rating || 0,
      success_rate: company.success_rate || 0,
      response_rate: company.response_rate || 0,
      matching_score,
      activityScore,
      locationScore,
      availabilityScore,
      reliabilityScore,
      distance,
      canHandleAllActivities,
      missingActivities,
      estimatedResponseTime: calculateEstimatedResponseTime(company),
    };
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${company.name}:`, error);
    return null;
  }
};

const calculateActivityScore = (
  requiredActivities: string[],
  companyActivities: string[]
): number => {
  if (requiredActivities.length === 0) return 1;

  const matchingCount = requiredActivities.filter(activity =>
    companyActivities.includes(activity)
  ).length;

  const baseScore = matchingCount / requiredActivities.length;

  // Bonus si l'entreprise peut tout faire
  const completenessBonus = matchingCount === requiredActivities.length ? 0.2 : 0;

  return Math.min(baseScore + completenessBonus, 1);
};

const calculateLocationScore = (distance: number, maxRadius: number): number => {
  if (distance > maxRadius) return 0;

  // Score décroissant avec la distance
  const baseScore = 1 - distance / maxRadius;

  // Bonus pour les entreprises très proches (< 10km)
  const proximityBonus = distance < 10 ? 0.1 : 0;

  return Math.min(baseScore + proximityBonus, 1);
};

const calculateAvailabilityScore = async (company: any, timeline: any): Promise<number> => {
  try {
    const availability = company.availability || {};
    const blockedDates = availability.blocked_dates || [];
    const workingHours = availability.working_hours || {};

    // Vérifier les jours ouvrés
    const workingDaysCount = Object.keys(workingHours).length;
    const workingDaysScore = Math.min(workingDaysCount / 5, 1); // Max 5 jours/semaine

    // Vérifier les conflits de dates
    const projectStart = new Date(timeline.startDate);
    const projectEnd = new Date(timeline.endDate);

    const hasConflicts = blockedDates.some((blockedDate: string) => {
      const blocked = new Date(blockedDate);
      return blocked >= projectStart && blocked <= projectEnd;
    });

    const conflictScore = hasConflicts ? 0.5 : 1; // Pénalité si conflit

    // Score basé sur la charge de travail actuelle (à implémenter avec les projets en cours)
    const workloadScore = 0.8; // Placeholder

    return workingDaysScore * 0.4 + conflictScore * 0.4 + workloadScore * 0.2;
  } catch (error) {
    console.warn('Erreur calcul disponibilité:', error);
    return 0.5; // Score neutre en cas d'erreur
  }
};

const calculateReliabilityScore = (company: any): number => {
  const rating = company.average_rating || 0;
  const successRate = company.success_rate || 0;
  const responseRate = company.response_rate || 0;

  // Normaliser les notes (sur 5) vers 0-1
  const ratingScore = Math.min(rating / 5, 1);
  const successScore = successRate / 100;
  const responseScore = responseRate / 100;

  // Pondération : note client (50%), taux de succès (30%), réactivité (20%)
  return ratingScore * 0.5 + successScore * 0.3 + responseScore * 0.2;
};

const calculateEstimatedResponseTime = (company: any): number => {
  // Basé sur le taux de réponse et l'historique
  const responseRate = company.response_rate || 50;

  if (responseRate > 90) return 2; // 2 heures
  if (responseRate > 70) return 6; // 6 heures
  if (responseRate > 50) return 24; // 1 jour
  return 48; // 2 jours
};

const checkAvailability = async (company: any, timeline: any): Promise<boolean> => {
  try {
    const availability = company.availability;
    if (!availability) return true; // Pas de contraintes = disponible

    const blockedDates = availability.blocked_dates || [];
    const projectStart = new Date(timeline.startDate);
    const projectEnd = new Date(timeline.endDate);

    // Vérifier s'il y a des dates bloquées pendant la période du projet
    const hasBlockedDates = blockedDates.some((date: string) => {
      const blocked = new Date(date);
      return blocked >= projectStart && blocked <= projectEnd;
    });

    if (hasBlockedDates) {
      return false;
    }

    // Vérifier la charge de travail (nombre de projets en cours)
    const { data: activeProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('status', 'in_progress')
      .contains('selected_companies', [company.id]);

    const currentWorkload = activeProjects?.length || 0;
    const maxConcurrentProjects = 5; // Limite arbitraire

    return currentWorkload < maxConcurrentProjects;
  } catch (error) {
    console.warn('Erreur vérification disponibilité:', error);
    return true; // En cas d'erreur, considérer comme disponible
  }
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

export const notifyMatchingCompanies = async (
  companies: MatchedCompany[],
  project: Project
): Promise<void> => {
  try {
    console.log(
      `📧 Notification de ${companies.length} entreprises pour le projet ${project.title}`
    );

    // Créer les notifications dans la base de données
    const notifications = companies.map(company => ({
      company_id: company.id,
      project_id: project.id,
      type: 'new_project_match',
      title: 'Nouveau projet correspondant à vos critères',
      content: `Un nouveau projet "${project.title}" correspond à vos activités dans ${project.location.city}. Score de matching: ${Math.round(company.matching_score * 100)}%`,
      matching_score: company.matching_score,
      created_at: new Date().toISOString(),
    }));

    const { error: notificationError } = await supabase.from('notifications').insert(notifications);

    if (notificationError) {
      console.warn('Erreur création notifications:', notificationError);
    }

    // Envoyer les emails via Edge Function
    for (const company of companies.slice(0, 10)) {
      // Limiter à 10 pour éviter le spam
      try {
        await sendEmailNotification(company, project);
      } catch (emailError) {
        console.warn(`Erreur envoi email à ${company.name}:`, emailError);
      }
    }

    console.log('✅ Notifications envoyées avec succès');
  } catch (error) {
    console.error("Erreur lors de l'envoi des notifications:", error);
    throw error;
  }
};

const sendEmailNotification = async (company: MatchedCompany, project: Project): Promise<void> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          company_id: company.id,
          project_id: project.id,
          type: 'email',
          matching_score: company.matching_score,
          distance: company.distance,
          missing_activities: company.missingActivities,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Erreur envoi email:', error);
    // Ne pas faire échouer le processus pour un problème d'email
  }
};

// Fonction utilitaire pour obtenir des entreprises de démonstration
export const getMockMatchingCompanies = (criteria: MatchingCriteria): MatchedCompany[] => {
  const mockCompanies: MatchedCompany[] = [
    {
      id: 'mock-company-1',
      name: 'Électricité Moderne',
      email: 'contact@electricite-moderne.fr',
      phone: '01 23 45 67 89',
      address: '25 Rue des Artisans, 75011 Paris',
      activities: ['5.1', '5.4'], // Plomberie, Électricité
      territory: { center: { lat: 48.8566, lng: 2.3522 }, radius: 50 },
      availability: { working_hours: {}, blocked_dates: [], calendar: [] },
      verification_status: 'verified',
      average_rating: 4.8,
      success_rate: 95,
      response_rate: 98,
      matching_score: 0.92,
      activityScore: 0.95,
      locationScore: 0.88,
      availabilityScore: 0.9,
      reliabilityScore: 0.95,
      distance: 12,
      canHandleAllActivities: true,
      missingActivities: [],
      estimatedResponseTime: 2,
    },
    {
      id: 'mock-company-2',
      name: 'Maçonnerie Dupont',
      email: 'contact@maconnerie-dupont.fr',
      phone: '01 34 56 78 90',
      address: '15 Avenue de la République, 94200 Ivry-sur-Seine',
      activities: ['2.2', '3.1'], // Maçonnerie, Couverture
      territory: { center: { lat: 48.8138, lng: 2.3848 }, radius: 40 },
      availability: { working_hours: {}, blocked_dates: [], calendar: [] },
      verification_status: 'verified',
      average_rating: 4.5,
      success_rate: 88,
      response_rate: 85,
      matching_score: 0.78,
      activityScore: 0.75,
      locationScore: 0.82,
      availabilityScore: 0.85,
      reliabilityScore: 0.72,
      distance: 18,
      canHandleAllActivities: false,
      missingActivities: ['5.1'],
      estimatedResponseTime: 6,
    },
    {
      id: 'mock-company-3',
      name: 'Menuiserie Bois & Cie',
      email: 'contact@menuiserie-bois.fr',
      phone: '01 45 67 89 01',
      address: '8 Rue du Faubourg, 92100 Boulogne-Billancourt',
      activities: ['4.1', '4.2'], // Menuiseries, Plâtrerie
      territory: { center: { lat: 48.837, lng: 2.24 }, radius: 35 },
      availability: { working_hours: {}, blocked_dates: [], calendar: [] },
      verification_status: 'verified',
      average_rating: 4.3,
      success_rate: 82,
      response_rate: 75,
      matching_score: 0.65,
      activityScore: 0.6,
      locationScore: 0.75,
      availabilityScore: 0.7,
      reliabilityScore: 0.65,
      distance: 25,
      canHandleAllActivities: false,
      missingActivities: ['5.1', '5.4'],
      estimatedResponseTime: 24,
    },
  ];

  // Filtrer selon les activités demandées
  return mockCompanies.filter(company => {
    const allRequired = [...criteria.activities, ...criteria.intellectualServices];
    const hasMatchingActivity = allRequired.some(activity => company.activities.includes(activity));
    return hasMatchingActivity;
  });
};
