import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { company_id, project_id, type } = await req.json();

    // Récupérer les informations de l'entreprise et du projet
    const { data: company } = await supabaseClient
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .single();

    const { data: project } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .single();

    if (!company || !project) {
      throw new Error('Company or project not found');
    }

    // Construire le contenu de l'email
    const emailContent = `
      Bonjour ${company.name},

      Un nouveau projet correspondant à vos critères vient d'être publié :

      ${project.title}
      ${project.description}

      Localisation : ${project.location.address}
      Budget estimé : ${project.budget.total}€

      Pour plus d'informations et pour proposer vos services, connectez-vous à votre espace partenaire.

      Cordialement,
      L'équipe TEMI-Construction
    `;

    // Envoyer l'email (à implémenter avec un service d'envoi d'email)
    // Pour l'exemple, on simule l'envoi
    console.log('Sending email:', emailContent);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
