import { z } from 'zod';

const EnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('URL Supabase invalide'),
  VITE_SUPABASE_ANON_KEY: z.string().min(20, 'Clé anonyme Supabase invalide'),
  VITE_APP_NAME: z.string().default('TEMI-Construction CRM'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_API_BASE_URL: z.string().url().optional(),
  VITE_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_GOOGLE_MAPS_API_KEY: z.string().optional(),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let env: Env;

try {
  env = EnvSchema.parse(import.meta.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Configuration environnement invalide:');
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });

    // En développement, utiliser des valeurs par défaut
    if (import.meta.env.DEV) {
      console.warn('⚠️ Utilisation des valeurs par défaut en développement');
      env = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
        VITE_APP_NAME: 'TEMI-Construction CRM',
        VITE_APP_VERSION: '1.0.0',
        VITE_ENVIRONMENT: 'development',
      };
    } else {
      throw new Error('Configuration environnement requise en production');
    }
  } else {
    throw error;
  }
}

export { env };

// Helper pour vérifier si la configuration est valide
export const isConfigValid = (): boolean => {
  try {
    EnvSchema.parse(import.meta.env);
    return true;
  } catch {
    return false;
  }
};

// Helper pour obtenir l'URL de base de l'API
export const getApiBaseUrl = (): string => {
  return env.VITE_API_BASE_URL || `${env.VITE_SUPABASE_URL}/rest/v1`;
};
