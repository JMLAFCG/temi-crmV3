import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate Supabase configuration
const isValidConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder');

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
  console.warn(
    'Configuration Supabase invalide. Vérifiez votre fichier .env avec une URL et une clé anon Supabase valides.'
  );
} else {
  console.log("Supabase configuré avec l'URL:", supabaseUrl);
}

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
    }

    return { data, error };
  } catch (networkError) {
    console.error('Erreur réseau lors de la connexion:', networkError);
    return {
      data: null,
      error: {
        message:
          'Erreur de connexion. Vérifiez votre connexion internet et la configuration Supabase.',
      },
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
      console.error('[mapSupabaseUserToAppUser] ERROR fetching user data:', error);
      throw new Error(`Database error querying schema: ${error.message}`);
    }

    if (userData) {
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

    console.warn('[mapSupabaseUserToAppUser] No user data found, using metadata fallback');
  } catch (err: any) {
    console.error('[mapSupabaseUserToAppUser] Exception caught:', err);
    throw err;
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
