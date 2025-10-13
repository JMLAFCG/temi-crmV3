// Optimisations de performance pour l'application
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private imageCache = new Map<string, string>();

  private constructor() {
    this.initializeOptimizations();
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private initializeOptimizations(): void {
    // Précharger les ressources critiques
    this.preloadCriticalResources();
    
    // Optimiser les images
    this.setupImageOptimization();
    
    // Nettoyer le cache périodiquement
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000); // 5 minutes
  }

  // Cache intelligent avec TTL
  public setCache(key: string, data: any, ttlMinutes = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  public getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Préchargement des ressources critiques
  private preloadCriticalResources(): void {
    const criticalRoutes = [
      '/dashboard',
      '/projects',
      '/clients',
      '/companies',
    ];

    // Précharger les chunks des routes critiques
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }

  // Optimisation des images
  private setupImageOptimization(): void {
    // Observer pour lazy loading des images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Observer toutes les images avec data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Compression d'images côté client
  public compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculer les nouvelles dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir en blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Nettoyage du cache
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Debounce pour les recherches
  public debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle pour les événements fréquents
  public throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Métriques de performance
  public measurePerformance(name: string, fn: () => Promise<any>): Promise<any> {
    const start = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - start;
      console.log(`⚡ Performance ${name}: ${duration.toFixed(2)}ms`);
      
      // Envoyer les métriques si configuré
      if (import.meta.env.VITE_SENTRY_DSN) {
        // Sentry.addBreadcrumb({
        //   message: `Performance: ${name}`,
        //   data: { duration },
        //   level: 'info',
        // });
      }
    });
  }

  // Optimisation des requêtes Supabase
  public optimizeSupabaseQuery(query: any, cacheKey?: string, ttlMinutes = 5): Promise<any> {
    if (cacheKey) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return Promise.resolve(cached);
      }
    }

    return this.measurePerformance(`Supabase Query: ${cacheKey || 'unknown'}`, async () => {
      const result = await query;
      
      if (cacheKey && result.data) {
        this.setCache(cacheKey, result, ttlMinutes);
      }
      
      return result;
    });
  }
}

// Instance singleton
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Hook pour utiliser les optimisations
export const usePerformanceOptimizer = () => {
  return {
    cache: {
      set: (key: string, data: any, ttl?: number) => performanceOptimizer.setCache(key, data, ttl),
      get: (key: string) => performanceOptimizer.getCache(key),
    },
    debounce: performanceOptimizer.debounce.bind(performanceOptimizer),
    throttle: performanceOptimizer.throttle.bind(performanceOptimizer),
    compressImage: performanceOptimizer.compressImage.bind(performanceOptimizer),
    measurePerformance: performanceOptimizer.measurePerformance.bind(performanceOptimizer),
    optimizeQuery: performanceOptimizer.optimizeSupabaseQuery.bind(performanceOptimizer),
  };
};