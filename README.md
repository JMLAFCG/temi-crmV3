# TEMI-Construction CRM

Application de gestion de la relation client pour TEMI-Construction, spécialisée dans la mise en relation entre clients et entreprises du bâtiment.

## 🚀 Démarrage rapide

```bash
# Configuration complète en une commande
npm run setup

# Développement avec validation
npm run dev:full

# Ou développement simple
npm run dev
```

## 🚀 Installation rapide

### 1. Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase (pour la base de données)

### 2. Configuration

```bash
# Cloner le projet
git clone <repository-url>
cd temi-construction-crm

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
```

### 3. Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Récupérez votre URL et clé anonyme dans Settings > API
3. Mettez à jour le fichier `.env` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

### 4. Initialisation de la base de données

Les migrations SQL sont dans `supabase/migrations/`. Exécutez-les dans l'ordre chronologique via l'interface Supabase ou le CLI.

### 5. Démarrage

```bash
# Développement
npm run dev

# Build de production
npm run build

# Aperçu de production
npm run preview
```

## 🛠️ Outils de développement

### Génération de code

```bash
# Générer une nouvelle page
npm run generate:page UserProfile
npm run generate:page "Company Settings" /companies/settings

# Générer un composant
npm run generate:component UserCard
npm run generate:component UserForm form
npm run generate:component ConfirmModal modal ui
```

### Validation et tests

```bash
# Validation complète (types + lint + tests)
npm run validate

# Tests de fumée rapides
npm run test:smoke

# Correction automatique des exports
npm run fix:default-exports

# Formatage du code
npm run format
```

### Build et déploiement

```bash
# Build avec validation complète
npm run build:ci

# Build de développement
npm run build

# Preview local
npm run preview
```

## 🧪 Tests

### Vérification des fonctionnalités

```bash
# Tester l'audit log
curl -H "Authorization: Bearer YOUR_ANON_KEY" \
     "YOUR_SUPABASE_URL/rest/v1/audit_log_v?select=*&order=at.desc&limit=10"

# Tester la page des commissions
# Naviguer vers http://localhost:5173/commissions

# Tester le guide application
# Naviguer vers http://localhost:5173/admin/guide
```

### Tests E2E avec Playwright

```bash
# Installer Playwright
npx playwright install

# Lancer les tests
npm run test:e2e
```

### Vérification des liens

```bash
# Vérifier qu'il n'y a pas de liens morts
npm run build
```

Le script `check-dead-links.js` s'exécute automatiquement au build et échoue si des liens hardcodés sont détectés.

## 🏗️ Architecture

### Structure des dossiers

```
src/
├── components/          # Composants réutilisables
├── pages/              # Pages de l'application
├── routes/             # Configuration des routes
├── store/              # État global (Zustand)
├── utils/              # Utilitaires
├── config/             # Configuration
├── ui/                 # Composants UI de base
└── types/              # Types TypeScript
```

### Système de routage

- **Centralisé** : toutes les routes dans `src/routes/paths.ts`
- **Sécurisé** : composant `SafeLink` qui refuse les routes inconnues
- **Protégé** : `RouteGuard` basé sur les rôles utilisateur
- **Testé** : Playwright vérifie toutes les routes

### Gestion des erreurs

- **ErrorBoundary** : capture les erreurs React
- **Page 404** : pour les routes inexistantes
- **Validation** : configuration environnement avec Zod

## 👥 Rôles utilisateur

- **Client** : accès aux projets personnels
- **Entreprise partenaire** : gestion des missions assignées
- **Apporteur d'affaires** : suivi des commissions
- **Mandataire** : gestion de portefeuille clients
- **Commercial** : gestion des projets et clients
- **Manager** : supervision équipes
- **Admin** : accès complet

## 🔧 Configuration avancée

### Variables d'environnement

Voir `.env.example` pour la liste complète des variables disponibles.

### Services tiers

- **Supabase** : base de données et authentification
- **Google Maps** : géolocalisation (optionnel)
- **Stripe** : paiements (optionnel)
- **Sentry** : monitoring d'erreurs (optionnel)

## 📝 Développement

### Ajout d'une nouvelle route

1. Ajouter la route dans `src/routes/paths.ts`
2. Créer la page correspondante
3. Ajouter la route dans `src/router.tsx`
4. Mettre à jour la navigation si nécessaire

### Composants de navigation

Utilisez toujours `SafeLink` au lieu de `Link` :

```tsx
import SafeLink from '../ui/SafeLink';

// ✅ Correct
<SafeLink route="dashboard">Tableau de bord</SafeLink>

// ❌ Éviter
<Link to="/dashboard">Tableau de bord</Link>
```

### Scripts utiles

```bash
# Vérification des liens
node scripts/check-dead-links.js

# Tests E2E
npm run test:e2e

# Lint
npm run lint
```

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

Le build inclut automatiquement la vérification des liens morts.

### Variables d'environnement de production

Assurez-vous de configurer toutes les variables nécessaires :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ENVIRONMENT=production`

## 🆘 Dépannage

### Erreurs courantes

1. **"Route inconnue"** : vérifiez que la route existe dans `paths.ts`
2. **"Configuration invalide"** : vérifiez votre fichier `.env`
3. **"Accès refusé"** : vérifiez les permissions utilisateur

### Support

Pour toute question technique, consultez :

- Les logs de la console navigateur
- Les erreurs Supabase dans l'onglet Network
- Les tests Playwright pour reproduire les problèmes

## 📄 Licence

Propriétaire - AFCG/TEMI Construction