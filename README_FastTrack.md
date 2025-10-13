# TEMI-Construction CRM - Setup FastTrack

## 🚀 Installation Express (5 minutes)

### Prérequis
- Node.js 20+
- Compte Supabase
- Serveur SMTP (optionnel pour emails)

### Setup Rapide

```bash
# 1. Cloner et installer
git clone <repository-url>
cd temi-construction-crm
npm install

# 2. Configuration environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# 3. Base de données
# Exécuter les migrations dans l'ordre dans Supabase Dashboard

# 4. Démarrage
npm run dev
```

## 📋 Configuration .env

```env
# OBLIGATOIRE - Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# OBLIGATOIRE - SMTP pour emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
SMTP_FROM=noreply@votre-domaine.com

# OPTIONNEL
VITE_SENTRY_DSN=https://...@sentry.io/...
```

## 🗄️ Migrations SQL (ordre d'exécution)

1. `invoicing_system.sql` - Système de facturation complet

## 🧪 Tests et Validation

```bash
# Tests complets
npm run validate

# Tests E2E
npm run test:e2e

# Build production
npm run build
```

## 📊 Fonctionnalités Clés

### ✅ Implémenté
- **Facturation automatique** : Génération PDF, numérotation, emails
- **Commissions par paliers** : Calcul automatique mandataires/apporteurs
- **Audit trail complet** : Traçabilité de toutes les actions
- **IA devis** : Analyse automatique + négociation
- **Notifications email** : Templates MJML + SMTP
- **Performance** : Lazy loading, cache, métriques

### 🎯 Flux Métier

1. **Projet signé** → Facture TEMI (12% TTC)
2. **Paiement reçu** → Commissions déclenchées
3. **Mandataire** : 25-50% selon production annuelle
4. **Apporteur** : 10% de la commission TEMI
5. **Notifications** : Email automatique à chaque étape

## 🔧 Scripts Utiles

```bash
# Développement
npm run dev              # Serveur de développement
npm run dev:full         # Avec validation complète

# Tests
npm run test:smoke       # Tests rapides
npm run test:e2e         # Tests E2E complets

# Production
npm run build            # Build optimisé
npm run preview          # Aperçu production

# Maintenance
npm run fix:default-exports  # Corriger les exports
npm run validate            # Validation complète
npm run check:routes        # Vérifier les routes
npm run check:lazy          # Vérifier les imports lazy
```

## 🛣️ Système de Routes Centralisé

### Ajouter une nouvelle route

1. **Ajouter dans `src/routes/paths.ts`**
```typescript
export const paths = {
  // ...
  newPage: '/new-page',
  newPageDetails: '/new-page/:id',
};
```

2. **Utiliser SafeLink dans les composants**
```tsx
import SafeLink from '../components/common/SafeLink';

// Route statique
<SafeLink route="newPage">Nouvelle page</SafeLink>

// Route avec paramètres
<SafeLink route="newPageDetails" params={{ id: '123' }}>
  Détails
</SafeLink>
```

3. **Navigation programmatique**
```tsx
import { useNavigate } from 'react-router-dom';
import { safeNavigate } from '../lib/safeNavigate';

const navigate = useNavigate();
safeNavigate(navigate, 'newPage');
safeNavigate(navigate, 'newPageDetails', { id: '123' });
```

### Ajouter une nouvelle page admin avec lazy loading

1. **Créer le fichier avec export default**
```tsx
// src/pages/admin/NewAdminPage.tsx
import React from 'react';

const NewAdminPage: React.FC = () => {
  return (
    <div data-testid="new-admin-page">
      <h1>Nouvelle page admin</h1>
    </div>
  );
};

export default NewAdminPage;
```

2. **Ajouter la route dans paths.ts**
```typescript
export const paths = {
  // ...
  newAdminPage: '/admin/new-page',
};
```

3. **Ajouter l'import lazy dans router.tsx**
```tsx
const NewAdminPage = lazyDefault(
  () => import('./pages/admin/NewAdminPage'),
  'src/pages/admin/NewAdminPage.tsx'
);
```

4. **Vérifier avec les outils**
```bash
npm run check:lazy  # Vérifie que le fichier existe et a un export default
npm run build       # Vérifie que tout fonctionne
```

### Règles pour les pages lazy-loaded

1. **Toujours inclure un export default**
```tsx
// ✅ Correct
const MyPage: React.FC = () => { /* ... */ };
export default MyPage;

// ❌ Éviter (causera une erreur de build)
export const MyPage: React.FC = () => { /* ... */ };
```

2. **Utiliser data-testid pour les tests**
```tsx
return (
  <div data-testid="my-page">
    <h1>Ma Page</h1>
  </div>
);
```

3. **Vérifier avant de commit**
```bash
npm run check:lazy    # Valide tous les imports lazy
npm run test:e2e      # Tests E2E complets
npm run build         # Build final
```

### Règles ESLint

Le linter interdit automatiquement :
- `<Link to="/hardcoded">` → Utiliser `<SafeLink route="routeKey">`
- `navigate('/hardcoded')` → Utiliser `safeNavigate(navigate, 'routeKey')`

### Tests de santé des liens

```bash
# Vérifier tous les liens
npm run test:smoke

# Rapport détaillé dans playwright-report/
```

## 🚀 FastTrack Development Guide

### 📋 Adding New Lazy-Loaded Pages

When adding new pages with lazy loading, follow these steps to avoid import failures:

1. **Create the page component** with proper default export:
   ```tsx
   // src/pages/example/ExamplePage.tsx
   import React from 'react';
   
   const ExamplePage: React.FC = () => {
     return (
       <div data-testid="example-page">
         <h1>Example Page</h1>
       </div>
     );
   };
   
   export default ExamplePage; // ← REQUIRED for lazy loading
   ```

2. **Add route to paths.ts**:
   ```tsx
   // src/routes/paths.ts
   export const paths = {
     // ...
     example: '/example',
   };
   ```

3. **Add lazy route to router**:
   ```tsx
   // src/router.tsx
   {
     path: paths.example,
     element: <Guard allowedRoles={['admin']} component={lazy(() => import('./pages/example/ExamplePage'))} />,
   }
   ```

4. **Verify with health check**:
   ```bash
   npm run check:lazy
   ```

5. **Add E2E test**:
   ```tsx
   // tests/e2e/example.spec.ts
   test('should load example page', async ({ page }) => {
     await page.goto('/demo-login');
     await page.click('[data-testid="demo-admin"]');
     await page.click('a[href="/example"]');
     await expect(page.locator('[data-testid="example-page"]')).toBeVisible();
   });
   ```

**⚠️ Common Pitfalls:**
- Missing default export (only named exports)
- Wrong import path in router
- File doesn't exist at expected location
- Duplicate React imports causing build failures

### 🎯 Quick Commands

## 🎭 Mode Démo

```bash
# Générer données de test
npm run seed:demo

# Accès rapide
# URL: /auth/demo
# Comptes: admin.demo@afcg-courtage.com / DemoAfcg!234
```

## 🚨 Points d'Attention

- **RLS activée** : Sécurité au niveau base de données
- **Audit automatique** : Toutes les actions tracées
- **Emails requis** : Configuration SMTP obligatoire
- **Pas de paiement en ligne** : Virements bancaires uniquement
- **Performance** : Images compressées, lazy loading

## 📞 Support

- **Logs** : Console navigateur + Sentry (si configuré)
- **Audit** : `/audit` pour traçabilité
- **Tests** : Playwright pour validation
- **Métriques** : `/src/lib/metrics.ts`

---

**TEMI-Construction CRM v1.0** - Prêt pour production 🚀