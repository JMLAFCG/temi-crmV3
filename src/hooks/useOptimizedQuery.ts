import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { usePerformanceOptimizer } from '../lib/performanceOptimizer';

interface QueryOptions {
  cacheKey?: string;
  cacheTTL?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}

export const useOptimizedQuery = <T = any>(
  queryFn: () => Promise<{ data: T; error: any }>,
  dependencies: any[] = [],
  options: QueryOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cache, measurePerformance } = usePerformanceOptimizer();

  const {
    cacheKey,
    cacheTTL = 5,
    enabled = true,
    refetchOnWindowFocus = false,
  } = options;

  const executeQuery = useCallback(async () => {
    if (!enabled) return;

    // Vérifier le cache d'abord
    if (cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached) {
        setData(cached.data);
        setError(cached.error);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await measurePerformance(
        `Query: ${cacheKey || 'unnamed'}`,
        queryFn
      );

      if (result.error) {
        throw new Error(result.error.message || 'Erreur de requête');
      }

      setData(result.data);

      // Mettre en cache si configuré
      if (cacheKey) {
        cache.set(cacheKey, { data: result.data, error: null }, cacheTTL);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur requête optimisée:', err);

      // Mettre en cache l'erreur pour éviter les requêtes répétées
      if (cacheKey) {
        cache.set(cacheKey, { data: null, error: errorMessage }, 1); // Cache court pour les erreurs
      }
    } finally {
      setLoading(false);
    }
  }, [queryFn, enabled, cacheKey, cacheTTL, ...dependencies]);

  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

  // Refetch au focus de la fenêtre
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => executeQuery();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [executeQuery, refetchOnWindowFocus]);

  const refetch = useCallback(() => {
    // Invalider le cache et relancer la requête
    if (cacheKey) {
      cache.set(cacheKey, { data: null, error: null }, 0);
    }
    executeQuery();
  }, [executeQuery, cacheKey]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

// Hook spécialisé pour Supabase
export const useSupabaseQuery = <T = any>(
  table: string,
  query: (client: typeof supabase) => any,
  dependencies: any[] = [],
  options: QueryOptions = {}
) => {
  const queryFn = useCallback(async () => {
    return await query(supabase);
  }, [query]);

  return useOptimizedQuery<T>(
    queryFn,
    dependencies,
    {
      cacheKey: `supabase_${table}_${JSON.stringify(dependencies)}`,
      ...options,
    }
  );
};