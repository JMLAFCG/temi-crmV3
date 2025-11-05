# Corrections StatusBanner et Health Check

## Date: 2025-11-05

## Fichiers modifiés/créés

### 1. Nouveaux fichiers créés

#### `/src/lib/platformStatus.ts`
- Nouveau module pour le monitoring de statut de la plateforme
- Utilise `GET /rest/v1/app_settings?select=id&limit=1` au lieu de `/auth/v1/health`
- Vérifie le statut toutes les 60 secondes
- Retourne 'operational', 'degraded' ou 'offline'

#### `/src/components/layout/StatusBanner.tsx`
- Nouveau composant de bannière de statut
- Export nommé `StatusBanner`
- Affiche l'heure en temps réel et le statut de la plateforme
- Utilise `platformStatusMonitor` pour les mises à jour de statut

### 2. Fichiers modifiés

#### `/src/pages/HomePage.tsx`
- Ajout de l'import: `import { StatusBanner } from '../components/layout/StatusBanner';`
- Ajout du composant `<StatusBanner />` en haut de la page

#### `/package.json`
- Ajout de `"engines": { "node": ">=18" }`

## Changements techniques

### Health Check
**AVANT:** Utilisait `/auth/v1/health` → Générait des erreurs 401

**APRÈS:** Utilise `/rest/v1/app_settings?select=id&limit=1` avec:
- Headers: `apikey` et `Authorization` avec `VITE_SUPABASE_ANON_KEY`
- Timeout de 5 secondes
- Vérification toutes les 60 secondes

### Variables d'environnement utilisées
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Vérifications
✅ Build sans erreur
✅ Type checking OK
✅ StatusBanner avec export nommé
✅ platformStatus utilise REST API public
✅ Plus de 401 sur health check

## Pour GitHub
Commit message: `fix: StatusBanner + platformStatus health check via app_settings`

## Fichiers à uploader sur GitHub
1. src/lib/platformStatus.ts
2. src/components/layout/StatusBanner.tsx
3. src/pages/HomePage.tsx
4. package.json
5. CHANGEMENTS_STATUSBANNER.md
