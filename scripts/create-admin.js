import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🔧 Création du compte admin...\n');

  const email = 'jml@afcg-courtage.com';
  const password = 'TEMI123+';

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: 'Jean-Marc',
        last_name: 'Leduc'
      }
    });

    if (authError) {
      console.error('❌ Erreur lors de la création du compte auth:', authError.message);
      process.exit(1);
    }

    console.log('✅ Compte auth créé avec succès');
    console.log('📧 Email:', email);
    console.log('🆔 ID:', authData.user.id);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: 'Jean-Marc',
        last_name: 'Leduc',
        role: 'admin'
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Erreur lors de la création dans la table users:', userError.message);
      console.log('⚠️  Le compte auth existe mais pas dans la table users');
      process.exit(1);
    }

    console.log('✅ Compte admin créé dans la table users');
    console.log('\n🎉 Compte admin créé avec succès!\n');
    console.log('📋 Informations de connexion:');
    console.log('   Email:', email);
    console.log('   Mot de passe: TEMI123+');
    console.log('   Rôle: admin');
    console.log('\n🔗 Vous pouvez maintenant vous connecter à l\'application');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    process.exit(1);
  }
}

createAdminUser();
