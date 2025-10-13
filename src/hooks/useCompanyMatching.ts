import { useState } from 'react';
import {
  findMatchingCompanies,
  notifyMatchingCompanies,
  getMockMatchingCompanies,
} from '../utils/companyMatching';
import { Project, Company } from '../types';

export const useCompanyMatching = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchCompanies = async (project: Project) => {
    setLoading(true);
    setError(null);

    try {
      const matchingCriteria = {
        activities: [...(project.activities || []), ...(project.intellectual_services || [])],
        intellectualServices: project.intellectual_services || [],
        location: {
          lat: project.location.coordinates?.lat || 0,
          lng: project.location.coordinates?.lng || 0,
          address: project.location.address || '',
          city: project.location.city || '',
          postalCode: project.location.postalCode || '',
        },
        timeline: {
          startDate: project.timeline.startDate,
          endDate: project.timeline.endDate,
          estimatedDuration: project.timeline.estimatedDuration || 30,
        },
        budget: {
          total: project.budget.total,
          materials: project.budget.materials || 0,
          labor: project.budget.labor || 0,
        },
      };

      let matchedCompanies;
      try {
        matchedCompanies = await findMatchingCompanies(project, matchingCriteria);
      } catch (supabaseError) {
        console.warn('Erreur Supabase, utilisation des données mock:', supabaseError);
        matchedCompanies = getMockMatchingCompanies(matchingCriteria);
      }

      // Notifier les entreprises correspondantes
      try {
        await notifyMatchingCompanies(matchedCompanies, project);
      } catch (notificationError) {
        console.warn('Erreur lors de la notification:', notificationError);
      }

      return matchedCompanies;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    matchCompanies,
    loading,
    error,
  };
};
