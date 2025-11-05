# Solution au problème 404 sur les URLs Vercel Preview

## Problème identifié

L'URL `temi-crm-v3-git-main-groupe-afcg.vercel.app/dashboard` affiche "Page introuvable" car les déploiements **Preview** (branches Git) n'ont pas accès aux variables d'environnement Supabase.

## Solution

### 1. Configurer les variables d'environnement pour Preview sur Vercel

1. Allez sur https://vercel.com/groupe-afcg/temi-crm-v3-groupe-afcg
2. Cliquez sur **Settings** (onglet en haut)
3. Cliquez sur **Environment Variables** dans le menu de gauche
4. Pour chaque variable, vérifiez qu'elle est cochée pour :
   - ✅ **Production**
   - ✅ **Preview** ← IMPORTANT
   - ✅ **Development**

### Variables obligatoires à configurer

```
VITE_SUPABASE_URL=https://cgyucfxdutvjclptfsme.supabase.co
VITE_SUPABASE_ANON_KEY=<votre_clé_supabase>
```

### 2. Redéployer après configuration

Une fois les variables configurées pour Preview :

1. Allez dans **Deployments**
2. Trouvez le déploiement `temi-crm-v3-git-main-groupe-afcg`
3. Cliquez sur les **3 points** → **Redeploy**

## Explication technique

Les déploiements Preview (URLs avec `-git-*`) :
- Sont créés automatiquement pour chaque branche Git
- Ont besoin des mêmes variables d'environnement que Production
- Sans ces variables, l'app ne peut pas se connecter à Supabase → erreur 404

## Vérification

Après redéploiement, l'URL `temi-crm-v3-git-main-groupe-afcg.vercel.app` devrait :
- ✅ Afficher la page HomePage (landing)
- ✅ Permettre la connexion via `/login`
- ✅ Accéder au dashboard après connexion

## URL de production principale

L'URL principale de production reste : `temi-crm-v3.vercel.app`
