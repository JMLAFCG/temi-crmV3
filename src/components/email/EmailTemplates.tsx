import React from 'react';

export interface EmailTemplateData {
  firstName?: string;
  lastName?: string;
  projectTitle?: string;
  amount?: number;
  dueDate?: string;
  invoiceNumber?: string;
  companyName?: string;
  documentName?: string;
  expiryDate?: string;
  loginUrl?: string;
  paymentDate?: string;
  bankReference?: string;
}

export const EmailTemplates = {
  // Template de bienvenue
  welcome: (data: EmailTemplateData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenue sur TEMI-Construction</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #DC2626, #1F2937); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TEMI-Construction</div>
          <h1>Bienvenue sur notre plateforme !</h1>
        </div>
        <div class="content">
          <p>Bonjour ${data.firstName || 'Utilisateur'},</p>
          <p>Votre compte a été créé avec succès sur la plateforme TEMI-Construction.</p>
          <p>Vous pouvez maintenant accéder à votre espace personnalisé et commencer à utiliser nos services.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl || '#'}" class="button">Accéder à mon espace</a>
          </p>
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          <p>Cordialement,<br>L'équipe TEMI-Construction</p>
        </div>
        <div class="footer">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            © 2025 TEMI-Construction. Tous droits réservés.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Template document expirant
  documentExpiring: (data: EmailTemplateData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document expirant - TEMI-Construction</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F59E0B, #DC2626); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Document expirant bientôt</h1>
        </div>
        <div class="content">
          <p>Bonjour ${data.firstName || 'Utilisateur'},</p>
          <div class="alert">
            <strong>Attention :</strong> Votre document "${data.documentName}" expire le ${data.expiryDate}.
          </div>
          <p>Pour éviter toute interruption de service, merci de renouveler ce document rapidement.</p>
          <p>Vous pouvez télécharger le nouveau document directement depuis votre espace.</p>
          <p>Cordialement,<br>L'équipe TEMI-Construction</p>
        </div>
        <div class="footer">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            © 2025 TEMI-Construction. Tous droits réservés.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Template commission déclenchée
  commissionTriggered: (data: EmailTemplateData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Commission déclenchée - TEMI-Construction</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .highlight { background: #dcfce7; border: 1px solid #22c55e; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .amount { font-size: 24px; font-weight: bold; color: #16a34a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Commission déclenchée !</h1>
        </div>
        <div class="content">
          <p>Bonjour ${data.firstName || 'Utilisateur'},</p>
          <p>Excellente nouvelle ! Une commission a été déclenchée pour le projet "${data.projectTitle}".</p>
          <div class="highlight">
            <p>Montant de votre commission :</p>
            <div class="amount">${data.amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
          </div>
          <p>Le paiement sera effectué le ${data.paymentDate}.</p>
          <p>Vous pouvez consulter le détail dans votre espace personnel.</p>
          <p>Merci pour votre collaboration !</p>
          <p>Cordialement,<br>L'équipe TEMI-Construction</p>
        </div>
        <div class="footer">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            © 2025 TEMI-Construction. Tous droits réservés.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Template facture émise
  invoiceIssued: (data: EmailTemplateData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Facture émise - TEMI-Construction</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #DC2626, #1F2937); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .invoice-details { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Facture émise</h1>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Votre facture TEMI-Construction a été émise.</p>
          <div class="invoice-details">
            <h3>Détails de la facture :</h3>
            <p><strong>Numéro :</strong> ${data.invoiceNumber}</p>
            <p><strong>Montant :</strong> ${data.amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
            <p><strong>Échéance :</strong> ${data.dueDate}</p>
          </div>
          <p style="text-align: center; margin: 30px 0;">
            <a href="#" class="button">Télécharger la facture</a>
          </p>
          <p>Merci de procéder au règlement avant l'échéance.</p>
          <p>Cordialement,<br>L'équipe TEMI-Construction</p>
        </div>
        <div class="footer">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            © 2025 TEMI-Construction. Tous droits réservés.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Template paiement reçu
  paymentReceived: (data: EmailTemplateData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Paiement reçu - TEMI-Construction</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22C55E, #16A34A); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .payment-details { background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Paiement reçu</h1>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Nous avons bien reçu votre paiement.</p>
          <div class="payment-details">
            <h3>Détails du paiement :</h3>
            <p><strong>Facture :</strong> ${data.invoiceNumber}</p>
            <p><strong>Montant :</strong> ${data.amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
            <p><strong>Référence :</strong> ${data.bankReference}</p>
          </div>
          <p>Merci pour votre confiance.</p>
          <p>Cordialement,<br>L'équipe TEMI-Construction</p>
        </div>
        <div class="footer">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            © 2025 TEMI-Construction. Tous droits réservés.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
};

export default EmailTemplates;