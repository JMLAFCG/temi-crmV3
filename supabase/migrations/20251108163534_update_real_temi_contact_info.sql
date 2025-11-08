/*
  # Mise à jour coordonnées réelles TEMI CONSTRUCTION
  
  Coordonnées correctes:
  - Email: contact@temi-construction.com
  - Téléphone: 0235771890
  - Adresse: 17 rue du Moulin Potel 27400 Acquigny
  - Site web: www.temi-construction.com
*/

-- Mise à jour avec les vraies coordonnées
UPDATE app_settings SET value = '"TEMI CONSTRUCTION"'::jsonb WHERE key = 'company_name';
UPDATE app_settings SET value = '"VOTRE SOLUTION TRAVAUX"'::jsonb WHERE key = 'company_tagline';
UPDATE app_settings SET value = '"contact@temi-construction.com"'::jsonb WHERE key = 'email';
UPDATE app_settings SET value = '"0235771890"'::jsonb WHERE key = 'phone';
UPDATE app_settings SET value = '"17 rue du Moulin Potel, 27400 Acquigny"'::jsonb WHERE key = 'address';
UPDATE app_settings SET value = '"www.temi-construction.com"'::jsonb WHERE key = 'website';

-- Nettoyer les doublons
DELETE FROM app_settings WHERE key IN ('company_email', 'company_phone', 'company_address', 'company_website');
