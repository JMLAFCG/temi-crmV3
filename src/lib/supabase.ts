import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Sanitize URL for logging (hide path and query params)
function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return 'invalid-url';
  }
}

// Validate Supabase configuration
const isValidConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder') &&
  supabaseUrl.includes('.supabase.co');

// ENV Diagnostics (dev console only)
if (import.meta.env.DEV || import.meta.env.MODE !== 'production') {
  console.group('🔧 Supabase ENV Diagnostics');
  console.log('URL Supabase (sanitized):', supabaseUrl ? sanitizeUrl(supabaseUrl) : '❌ ABSENT');
  console.log('Clé Anon:', supabaseAnonKey ? '✅ Présente' : '❌ ABSENTE');
  console.log('Origin actuel:', window.location.origin);
  console.log('Mode:', import.meta.env.MODE);
  console.groupEnd();
}

// Self-test des endpoints Supabase
async function testSupabaseEndpoints() {
  if (!supabaseUrl) {
    console.warn('⚠️ Self-test impossible: URL Supabase manquante');
    return;
  }

  try {
    const healthUrl = `${supabaseUrl}/auth/v1/health`;
    const settingsUrl = `${supabaseUrl}/auth/v1/settings`;

    const [healthResponse, settingsResponse] = await Promise.allSettled([
      fetch(healthUrl, { method: 'GET' }),
      fetch(settingsUrl, { method: 'GET' })
    ]);

    if (import.meta.env.DEV || import.meta.env.MODE !== 'production') {
      console.group('🏥 Supabase Self-Test');

      if (healthResponse.status === 'fulfilled') {
        const status = healthResponse.value.status;
        console.log(`Health endpoint (${healthUrl}):`, status >= 200 && status < 300 ? '✅' : '❌', `HTTP ${status}`);
        if (status >= 400) {
          console.warn(`⚠️ Health check failed with status ${status}`);
        }
      } else {
        console.error('❌ Health endpoint unreachable:', healthResponse.reason);
      }

      if (settingsResponse.status === 'fulfilled') {
        const status = settingsResponse.value.status;
        console.log(`Settings endpoint (${settingsUrl}):`, status >= 200 && status < 300 ? '✅' : '❌', `HTTP ${status}`);
        if (status >= 400) {
          console.warn(`⚠️ Settings check failed with status ${status}`);
        }
      } else {
        console.error('❌ Settings endpoint unreachable:', settingsResponse.reason);
      }

      console.groupEnd();
    }
  } catch (error) {
    console.error('❌ Erreur lors du self-test Supabase:', error);
  }
}

// Run self-test on startup
if (isValidConfig) {
  testSupabaseEndpoints();
}

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Check configuration and log appropriate messages
if (!isValidConfig) {
  console.error(
    '❌ Configuration Supabase invalide. Vérifiez votre fichier .env avec une URL et une clé anon Supabase valides.'
  );
  if (!supabaseUrl) {
    console.error('  → VITE_SUPABASE_URL est manquante ou vide');
  } else if (!supabaseUrl.includes('.supabase.co')) {
    console.error('  → VITE_SUPABASE_URL ne semble pas être une URL Supabase valide');
  }
  if (!supabaseAnonKey) {
    console.error('  → VITE_SUPABASE_ANON_KEY est manquante ou vide');
  }
} else {
  console.log('✅ Supabase configuré:', sanitizeUrl(supabaseUrl));
}

// Export config state
export const supabaseConfigState = {
  isValid: isValidConfig,
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  url: supabaseUrl,
};

export async function signIn(email: string, password: string) {
  if (!isValidConfig) {
    return {
      data: null,
      error: {
        message: "Configuration Supabase invalide. Vérifiez vos variables d'environnement.",
      },
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Erreur de connexion Supabase:', error);

      // Detect 500 errors from auth endpoint
      if (error.message?.includes('500') || (error as any).status === 500) {
        console.error('\n❌ ERREUR 500 DÉTECTÉE');
        console.error('Endpoint appelé:', `${supabaseUrl}/auth/v1/token?grant_type=password`);
        console.error('Cause probable: Configuration Supabase invalide côté client (URL/clé)');
        console.error('Solution: Vérifier les variables d\'environnement Vercel (Production & Preview)');

        return {
          data: null,
          error: {
            message: 'Erreur d\'authentification (500) — Configuration Supabase invalide côté client. Vérifiez les variables d\'environnement Vercel (Production & Preview).',
            status: 500,
          } as any,
        };
      }
    }

    return { data, error };
  } catch (networkError: any) {
    console.error('Erreur réseau lors de la connexion:', networkError);

    // Check if it's a 500 error
    if (networkError?.status === 500 || networkError?.message?.includes('500')) {
      console.error('\n❌ ERREUR 500 DÉTECTÉE (catch block)');
      console.error('Endpoint appelé:', `${supabaseUrl}/auth/v1/token?grant_type=password`);
      console.error('Cause probable: Configuration Supabase invalide');

      return {
        data: null,
        error: {
          message: 'Erreur d\'authentification (500) — Configuration Supabase invalide. Vérifiez les variables d\'environnement Vercel.',
          status: 500,
        } as any,
      };
    }

    return {
      data: null,
      error: {
        message:
          'Erreur de connexion. Vérifiez votre connexion internet et la configuration Supabase.',
      } as any,
    };
  }
}

export async function signUp(email: string, password: string) {
  if (!isValidConfig) {
    return {
      data: null,
      error: {
        message: "Configuration Supabase invalide. Vérifiez vos variables d'environnement.",
      },
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { data, error };
  } catch (networkError) {
    console.error("Erreur réseau lors de l'inscription:", networkError);
    return {
      data: null,
      error: {
        message:
          'Erreur de connexion. Vérifiez votre connexion internet et la configuration Supabase.',
      },
    };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (networkError) {
    console.error('Erreur réseau lors de la déconnexion:', networkError);
    return { error: { message: 'Erreur lors de la déconnexion' } };
  }
}

export async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user;
  } catch (networkError) {
    console.error("Erreur réseau lors de la récupération de l'utilisateur:", networkError);
    return null;
  }
}

// Helper function to map Supabase user to app User interface
export async function mapSupabaseUserToAppUser(supabaseUser: any) {
  if (!supabaseUser) {
    throw new Error('Aucun utilisateur fourni pour le mapping');
  }

  console.log('[mapSupabaseUserToAppUser] Starting mapping for user:', supabaseUser.id);

  try {
    console.log('[mapSupabaseUserToAppUser] Querying users table...');
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    console.log('[mapSupabaseUserToAppUser] Query result:', { userData, error });

    if (error) {
      console.warn('[mapSupabaseUserToAppUser] ERROR fetching user data (using fallback):', error);
    } else if (userData) {
      console.log('[mapSupabaseUserToAppUser] User data found in users table');
      return {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        role: userData.role || 'client',
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      };
    }

    console.warn('[mapSupabaseUserToAppUser] Using metadata fallback');
  } catch (err: any) {
    console.warn('[mapSupabaseUserToAppUser] Exception caught (using fallback):', err);
  }

  const firstName = supabaseUser.user_metadata?.first_name ||
                    supabaseUser.user_metadata?.firstName ||
                    supabaseUser.email?.split('@')[0] || '';

  const lastName = supabaseUser.user_metadata?.last_name ||
                   supabaseUser.user_metadata?.lastName || '';

  const role = supabaseUser.user_metadata?.role ||
               supabaseUser.app_metadata?.role ||
               'client';

  console.log('[mapSupabaseUserToAppUser] Returning fallback user data');
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    firstName,
    lastName,
    role,
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
  };
}
