/*
  # Suppression de TOUTES les données d'exemple
  
  Conservation uniquement:
  - Utilisateur réel: Jean-Marc Leton (jml@afcg-courtage.com)
  - Configuration société: TEMI CONSTRUCTION
  - Company réelle: GROUPE AFCG
  
  Suppression:
  - Tous les clients d'exemple (martin.dupont, sophie.martin, pierre.leroy)
  - Tous les projets d'exemple
  - Toutes les commissions d'exemple
  - Tous les messages d'exemple
  - Toutes les notifications d'exemple
  - Tous les documents d'exemple
*/

-- ========================================
-- 1. Supprimer les commissions d'exemple
-- ========================================

DELETE FROM commissions;

-- ========================================
-- 2. Supprimer les projets d'exemple
-- ========================================

DELETE FROM projects;

-- ========================================
-- 3. Supprimer les clients d'exemple
-- ========================================

DELETE FROM clients WHERE email LIKE '%@example.com';
DELETE FROM clients WHERE email NOT LIKE '%@afcg-courtage.com';

-- ========================================
-- 4. Supprimer les messages d'exemple
-- ========================================

DELETE FROM messages WHERE sender_id != (SELECT id FROM users WHERE email = 'jml@afcg-courtage.com');
DELETE FROM messages WHERE recipient_id != (SELECT id FROM users WHERE email = 'jml@afcg-courtage.com');

-- ========================================
-- 5. Supprimer les notifications d'exemple
-- ========================================

DELETE FROM notifications WHERE user_id != (SELECT id FROM users WHERE email = 'jml@afcg-courtage.com');

-- ========================================
-- 6. Supprimer les documents d'exemple
-- ========================================

DELETE FROM documents;

-- ========================================
-- 7. Supprimer les business providers d'exemple
-- ========================================

DELETE FROM business_providers WHERE user_id != (SELECT id FROM users WHERE email = 'jml@afcg-courtage.com');

-- ========================================
-- 8. Supprimer les quotes et invoices d'exemple
-- ========================================

DELETE FROM quotes;
DELETE FROM invoices;

-- ========================================
-- 9. Supprimer les tasks d'exemple
-- ========================================

DELETE FROM tasks;

-- ========================================
-- 10. Supprimer les audit logs d'exemple (optionnel, à garder pour traçabilité)
-- ========================================

-- On garde les audit logs pour la traçabilité
-- DELETE FROM audit_logs;

-- ========================================
-- 11. Supprimer les utilisateurs demo
-- ========================================

DELETE FROM users WHERE is_demo = true;

-- ========================================
-- 12. Supprimer les companies d'exemple (sauf GROUPE AFCG)
-- ========================================

DELETE FROM companies WHERE name != 'GROUPE AFCG';

-- ========================================
-- 13. Nettoyer les registration requests d'exemple
-- ========================================

DELETE FROM registration_requests WHERE email LIKE '%@example.com';

-- ========================================
-- Résumé des données conservées:
-- - 1 utilisateur: Jean-Marc Leton (admin)
-- - 1 company: GROUPE AFCG
-- - Configuration société: TEMI CONSTRUCTION
-- - Audit logs (pour traçabilité)
-- ========================================
