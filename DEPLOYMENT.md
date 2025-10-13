# Guide de Déploiement - TEMI Construction CRM

## ✅ État Actuel

**Version**: 1.0.0
**Build Status**: ✅ Compilé avec succès
**Database**: ✅ Prêt (RLS activé, indexes optimisés)
**Edge Functions**: ✅ Déployées (3/3)

---

## 🚀 Prérequis de Déploiement

### 1. Configuration Supabase ✅

**Déjà configuré:**
- ✅ Base de données PostgreSQL avec RLS
- ✅ 3 Edge Functions déployées
- ✅ Storage pour documents
- ✅ Authentification activée
- ✅ Tables avec indexes de performance
- ✅ Système d'audit automatique

**Variables d'environnement Supabase:**
```bash
VITE_SUPABASE_URL=https://[votre-projet].supabase.co
VITE_SUPABASE_ANON_KEY=[votre-clé-anon]
```

### 2. Configuration Email 🔴 **REQUIS**

**Service SMTP nécessaire pour:**
- Notifications aux utilisateurs
- Emails de confirmation
- Alertes de projet
- Notifications de commission

**Configuration recommandée:**
- **SendGrid** (gratuit jusqu'à 100 emails/jour)
- **Mailgun** (gratuit jusqu'à 5000 emails/mois)
- **Amazon SES** (très économique)

**Variables à configurer:**
```bash
SMTP_HOST=smtp.votrefournisseur.com
SMTP_PORT=587
SMTP_USER=votre_utilisateur
SMTP_PASS=votre_mot_de_passe
SMTP_FROM=noreply@votre-domaine.com
```

### 3. Hébergement Frontend

**Options recommandées:**
- **Vercel** (recommandé, gratuit pour ce projet)
- **Netlify** (alternative gratuite)
- **Cloudflare Pages**

---

## 📝 Checklist de Déploiement

### Étape 1: Préparer l'environnement

- [x] ✅ Build de production réussi
- [x] ✅ Base de données configurée
- [x] ✅ RLS activée sur toutes les tables
- [x] ✅ Edge Functions déployées
- [ ] 🔴 Configuration SMTP
- [ ] 🟡 Variables d'environnement production

### Étape 2: Configuration Production

1. **Copier le fichier de configuration:**
   ```bash
   cp .env.production.example .env.production
   ```

2. **Remplir les variables obligatoires:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

3. **Désactiver le mode développement:**
   ```bash
   VITE_ENVIRONMENT=production
   VITE_DEBUG=false
   VITE_MOCK_DATA=false
   ```

### Étape 3: Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

**Configurer les variables d'environnement dans Vercel:**
1. Aller dans Project Settings > Environment Variables
2. Ajouter toutes les variables de `.env.production`
3. Redéployer: `vercel --prod`

### Étape 4: Tests Post-Déploiement

- [ ] Tester la connexion utilisateur
- [ ] Créer un projet test
- [ ] Vérifier les notifications email
- [ ] Tester l'upload de documents
- [ ] Vérifier le module IA
- [ ] Tester le système de commissions

---

## 🔧 Configuration Avancée

### Monitoring (Optionnel mais Recommandé)

**Sentry pour le suivi des erreurs:**
```bash
VITE_SENTRY_DSN=https://votre-dsn@sentry.io/projet
```

**Google Analytics (optionnel):**
Ajouter dans `index.html`

### Performance

**Déjà optimisé:**
- ✅ Lazy loading des routes
- ✅ Code splitting automatique
- ✅ Compression des assets
- ✅ PWA activée
- ✅ Service Worker configuré

### Sécurité

**Déjà sécurisé:**
- ✅ RLS sur toutes les tables
- ✅ Authentification Supabase
- ✅ CORS configuré sur Edge Functions
- ✅ Validation des données côté serveur

---

## 📊 Base de Données - Optimisations Appliquées

### Indexes Créés
- ✅ Index sur `projects` (client_id, agent_id, status, created_at)
- ✅ Index sur `companies` (siret, status, type)
- ✅ Index sur `messages` (recipient_id, is_read)
- ✅ Index sur `commissions` (project_id, provider_id, status)
- ✅ Index composite pour les requêtes fréquentes

### Triggers Automatiques
- ✅ Création automatique des commissions à la validation
- ✅ Mise à jour des stats des apporteurs
- ✅ Calcul des paliers de commission mandataires
- ✅ Audit trail automatique

### Fonctions PostgreSQL
- ✅ `calculate_temi_commission()` - 12% TTC
- ✅ `calculate_provider_commission()` - 10% de TEMI
- ✅ `calculate_mandatary_commission()` - Paliers 25-50%

---

## 🎯 Post-Déploiement

### Configuration Initiale

1. **Créer le premier utilisateur admin:**
   ```sql
   INSERT INTO users (email, first_name, last_name, role)
   VALUES ('admin@temi-construction.com', 'Admin', 'TEMI', 'admin');
   ```

2. **Configurer les rôles:**
   Les 7 rôles sont déjà créés en base:
   - admin
   - manager
   - commercial
   - mandatary
   - client
   - partner_company
   - business_provider

3. **Tester le module IA:**
   - Uploader un PDF de devis
   - Vérifier l'extraction des données
   - Valider la génération de proposition

### Maintenance

**Backups automatiques Supabase:**
- Quotidiens (7 jours de rétention)
- Configurer des backups supplémentaires si nécessaire

**Monitoring:**
- Vérifier les logs Supabase quotidiennement
- Surveiller les erreurs dans Sentry
- Monitorer l'utilisation des Edge Functions

---

## 🚨 Troubleshooting

### Erreur de connexion Supabase
```bash
# Vérifier les variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Emails non envoyés
1. Vérifier la configuration SMTP dans Supabase Dashboard
2. Tester manuellement l'Edge Function `send-email`
3. Vérifier les logs dans Functions > Logs

### Module IA ne fonctionne pas
1. Vérifier que l'Edge Function `ai-quote-processor` est déployée
2. Tester avec un PDF simple
3. Vérifier les logs de la fonction

### Performance lente
1. Vérifier que les indexes sont bien créés
2. Analyser les requêtes lentes dans Supabase
3. Activer le cache Vercel

---

## 📞 Support

**Documentation:**
- README.md - Guide général
- GUIDE_APPLICATION.md - Guide utilisateur
- ANALYSE_PROJET_COMPLET.md - Analyse technique

**Ressources:**
- Supabase Dashboard: https://app.supabase.com
- Vercel Dashboard: https://vercel.com/dashboard
- Documentation Supabase: https://supabase.com/docs

---

## ✨ Fonctionnalités Prêtes

### Core Features (100%)
- ✅ Authentification multi-rôles
- ✅ Gestion clients/entreprises/projets
- ✅ Module IA d'analyse de devis
- ✅ Système de commissions automatisé
- ✅ Matching intelligent d'entreprises
- ✅ Upload et gestion de documents
- ✅ Signature électronique
- ✅ Notifications en temps réel
- ✅ Dashboards par rôle
- ✅ Système d'audit complet

### En Attente de Configuration
- 🔴 Emails SMTP (configuration requise)
- 🟡 Tests E2E (données de test requises)
- 🟡 Monitoring Sentry (optionnel)
- 🟡 Google Maps (optionnel)
- 🟡 Stripe (phase 2)

---

**Date de dernière mise à jour:** 11 octobre 2025
**Version du build:** 1.0.0
**Prêt pour production:** ✅ OUI (après config SMTP)
