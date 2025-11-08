/*
  # Peuplement données - Status corrects
  
  Status commissions: pending, validated, paid, cancelled
*/

DELETE FROM commissions;
DELETE FROM projects;
DELETE FROM clients WHERE email LIKE '%@example.com';
DELETE FROM companies WHERE name = 'GROUPE AFCG';

INSERT INTO app_settings (key, value, description) VALUES
('company_name', '"TEMI CONSTRUCTION"'::jsonb, 'Nom'),
('company_tagline', '"VOTRE SOLUTION TRAVAUX"'::jsonb, 'Slogan'),
('email', '"contact@temi-construction.fr"'::jsonb, 'Email'),
('phone', '"+33 1 23 45 67 89"'::jsonb, 'Tel'),
('address', '"Paris France"'::jsonb, 'Adresse'),
('website', '"https://temi-construction.fr"'::jsonb, 'Site')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO companies (name, siret, email, phone, website, logo_url, address, territories)
VALUES (
  'GROUPE AFCG',
  '12345678901234',
  'contact@afcg-courtage.com',
  '+33123456789',
  'https://afcg-courtage.com',
  '/groupe-afcg-white-logo.png',
  '{"city": "Paris"}'::jsonb,
  '["Île-de-France"]'::jsonb
);

DO $$
DECLARE
  jml uuid;
  c1 uuid; c2 uuid; c3 uuid;
  p1 uuid; p2 uuid; p3 uuid;
BEGIN
  SELECT id INTO jml FROM users WHERE email = 'jml@afcg-courtage.com';
  
  INSERT INTO clients (user_id, first_name, last_name, email, phone, company_name, address)
  VALUES (jml, 'Martin', 'Dupont', 'martin.dupont@example.com', '0612345678', 'Dupont SARL', '123 Rue République Paris')
  RETURNING id INTO c1;
  
  INSERT INTO clients (user_id, first_name, last_name, email, phone, company_name, address)
  VALUES (jml, 'Sophie', 'Martin', 'sophie.martin@example.com', '0698765432', 'Martin Associés', '45 Avenue Champs Paris')
  RETURNING id INTO c2;
  
  INSERT INTO clients (user_id, first_name, last_name, email, phone, company_name, address)
  VALUES (jml, 'Pierre', 'Leroy', 'pierre.leroy@example.com', '0611223344', 'Entreprises Leroy', '78 Bd Haussmann Paris')
  RETURNING id INTO c3;
  
  INSERT INTO projects (title, description, status, client_id, agent_id, location, surface, budget, timeline)
  VALUES ('Rénovation Cuisine Moderne', 'Rénovation complète cuisine appartement', 'in_progress', c1, jml, '123 Rue République Paris', 25, 25000, '3 mois')
  RETURNING id INTO p1;
  
  INSERT INTO projects (title, description, status, client_id, agent_id, location, surface, budget, timeline)
  VALUES ('Extension Maison', 'Extension maison avec véranda', 'in_progress', c2, jml, '45 Avenue Champs Paris', 40, 45000, '6 mois')
  RETURNING id INTO p2;
  
  INSERT INTO projects (title, description, status, client_id, agent_id, location, surface, budget, timeline)
  VALUES ('Immeuble Bureaux', 'Construction immeuble 5 étages', 'pending', c3, jml, '78 Bd Haussmann Paris', 1200, 850000, '18 mois')
  RETURNING id INTO p3;
  
  INSERT INTO commissions (project_id, amount, rate, status, paid_date)
  VALUES
    (p1, 3000, 12.0, 'paid', '2025-01-30'),
    (p2, 900, 12.0, 'pending', NULL),
    (p3, 144, 12.0, 'pending', NULL);
  
END $$;
