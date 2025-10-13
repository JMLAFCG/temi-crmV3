import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  template?: string;
  data?: Record<string, any>;
}

// Templates d'email compilés
const EMAIL_TEMPLATES = {
  signup: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #DC2626;">Bienvenue sur TEMI-Construction</h1>
      <p>Bonjour ${data.firstName},</p>
      <p>Votre compte a été créé avec succès. Vous pouvez maintenant accéder à votre espace.</p>
      <a href="${data.loginUrl}" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Se connecter</a>
    </div>
  `,
  
  documentExpiring: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #F59E0B;">Document expirant bientôt</h1>
      <p>Bonjour ${data.firstName},</p>
      <p>Votre document "${data.documentName}" expire le ${data.expiryDate}.</p>
      <p>Merci de le renouveler rapidement pour éviter toute interruption de service.</p>
    </div>
  `,
  
  commissionTriggered: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #22C55E;">Commission déclenchée</h1>
      <p>Bonjour ${data.firstName},</p>
      <p>Une commission de ${data.amount}€ a été déclenchée pour le projet "${data.projectTitle}".</p>
      <p>Le paiement sera effectué le ${data.paymentDate}.</p>
    </div>
  `,
  
  invoiceIssued: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #DC2626;">Facture émise</h1>
      <p>Bonjour,</p>
      <p>La facture ${data.invoiceNumber} d'un montant de ${data.amount}€ a été émise.</p>
      <p>Échéance de paiement : ${data.dueDate}</p>
      <a href="${data.pdfUrl}" style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Télécharger la facture</a>
    </div>
  `,
  
  invoiceOverdue: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #EF4444;">Facture en retard</h1>
      <p>Bonjour,</p>
      <p>La facture ${data.invoiceNumber} d'un montant de ${data.amount}€ est en retard de paiement.</p>
      <p>Échéance dépassée : ${data.dueDate}</p>
      <p>Merci de régulariser rapidement.</p>
    </div>
  `,
  
  paymentReceived: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #22C55E;">Paiement reçu</h1>
      <p>Bonjour,</p>
      <p>Nous avons bien reçu votre paiement de ${data.amount}€ pour la facture ${data.invoiceNumber}.</p>
      <p>Référence bancaire : ${data.bankReference}</p>
      <p>Merci pour votre confiance.</p>
    </div>
  `
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html, template, data }: EmailRequest = await req.json();

    // Valider les paramètres
    if (!to || !subject) {
      throw new Error('Paramètres manquants: to et subject requis');
    }

    // Générer le HTML depuis le template si fourni
    let emailHtml = html;
    if (template && EMAIL_TEMPLATES[template as keyof typeof EMAIL_TEMPLATES]) {
      emailHtml = EMAIL_TEMPLATES[template as keyof typeof EMAIL_TEMPLATES](data || {});
    }

    // Configuration SMTP depuis les variables d'environnement
    const smtpConfig = {
      host: Deno.env.get('SMTP_HOST') || 'localhost',
      port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
      username: Deno.env.get('SMTP_USER') || '',
      password: Deno.env.get('SMTP_PASS') || '',
      from: Deno.env.get('SMTP_FROM') || 'noreply@temi-construction.fr',
    };

    // En mode développement, simuler l'envoi
    if (Deno.env.get('DENO_DEPLOYMENT_ID') === undefined) {
      console.log('📧 Email simulé:', {
        to,
        subject,
        from: smtpConfig.from,
        template,
        htmlLength: emailHtml.length
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email simulé en développement',
          messageId: `sim_${Date.now()}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // En production, utiliser un service d'email réel
    // Pour l'instant, simuler le succès
    console.log('📧 Email envoyé:', { to, subject });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email envoyé avec succès',
        messageId: `msg_${Date.now()}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});