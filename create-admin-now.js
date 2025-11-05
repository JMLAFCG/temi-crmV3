const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cgyucfxdutvjclptfsme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneXVjZnhkdXR2amNscHRmc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTI5NjIsImV4cCI6MjA2MzgyODk2Mn0.vM1hh8oZ3Idz2qTQCsKv793irDTEy9e8_u2o7DOq_MM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log('🔧 Création du compte admin...');
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'jml@afcg-courtage.com',
    password: 'TEMI123+',
    options: {
      data: {
        first_name: 'Jean-Marc',
        last_name: 'Leduc',
      }
    }
  });

  if (authError) {
    console.error('❌ Erreur auth:', authError.message);
    
    console.log('\n✅ Le compte existe probablement déjà. Vérifions...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'jml@afcg-courtage.com')
      .single();
    
    if (existingUser) {
      console.log('✅ Utilisateur trouvé:', existingUser);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('email', 'jml@afcg-courtage.com');
      
      if (updateError) {
        console.error('❌ Erreur mise à jour rôle:', updateError.message);
      } else {
        console.log('✅ Rôle mis à jour en admin');
      }
    }
    return;
  }

  console.log('✅ Compte créé dans auth.users:', authData);

  if (authData?.user?.id) {
    const { error: insertError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: 'jml@afcg-courtage.com',
        first_name: 'Jean-Marc',
        last_name: 'Leduc',
        role: 'admin',
      });

    if (insertError) {
      console.error('❌ Erreur insertion users:', insertError.message);
    } else {
      console.log('✅ Utilisateur admin créé avec succès!');
    }
  }
}

createAdmin().catch(console.error);
