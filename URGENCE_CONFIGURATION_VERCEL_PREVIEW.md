# 🚨 URGENCE : Configuration Variables Vercel Preview

## Problème Actuel

Les URLs de déploiement Preview Vercel affichent une mauvaise page car **les variables d'environnement ne sont PAS configurées pour l'environnement Preview**.

## Solution Immédiate (5 minutes)

### Étape 1 : Accéder aux Settings Vercel

1. Allez sur : https://vercel.com
2. Connectez-vous avec votre compte
3. Sélectionnez le projet **temi-crm-v3**
4. Cliquez sur l'onglet **Settings** (en haut)
5. Dans le menu de gauche, cliquez sur **Environment Variables**

### Étape 2 : Vérifier les Variables Existantes

Vous devriez voir ces variables :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Étape 3 : Activer Preview pour CHAQUE Variable

Pour CHAQUE variable listée ci-dessus :

1. Cliquez sur les **3 points** à droite de la variable
2. Cliquez sur **Edit**
3. Vous verrez 3 cases à cocher :
   - ✅ **Production** (déjà coché)
   - ❌ **Preview** (PAS coché - **C'EST LE PROBLÈME**)
   - ❌ **Development** (optionnel)

4. **COCHEZ la case "Preview"** ← CRITIQUE
5. Cliquez sur **Save**

### Étape 4 : Répéter pour Toutes les Variables

Faites cela pour :
- ✅ `VITE_SUPABASE_URL` → Cocher Preview
- ✅ `VITE_SUPABASE_ANON_KEY` → Cocher Preview

### Étape 5 : Redéployer

Après avoir configuré les variables :

1. Allez dans l'onglet **Deployments**
2. Trouvez le déploiement le plus récent de la branche `main`
3. Cliquez sur les **3 points** à droite
4. Cliquez sur **Redeploy**
5. Attendez la fin du déploiement (environ 2-3 minutes)

## Vérification

Après le redéploiement :

1. Allez sur l'URL : `temi-crm-v3-git-main-groupe-afcg.vercel.app`
2. Vous devriez voir : **"Bienvenue sur TEMI"** avec le design noir et rouge
3. Le bouton "Connexion" devrait fonctionner
4. Plus de page 404 ou de page générique

## Si Ça Ne Marche Toujours Pas

Si après avoir suivi ces étapes le problème persiste :

1. Vérifiez que les valeurs des variables sont correctes :
   - `VITE_SUPABASE_URL` = `https://cgyucfxdutvjclptfsme.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = votre clé (commence par `eyJ...`)

2. Videz le cache de votre navigateur (Ctrl+Shift+R ou Cmd+Shift+R)

3. Attendez 1-2 minutes que Vercel propage les changements

## URLs à Tester

Après configuration :

- ✅ Production : `temi-crm-v3.vercel.app`
- ✅ Preview Main : `temi-crm-v3-git-main-groupe-afcg.vercel.app`
- ✅ Autres branches : `temi-crm-v3-azza7q4ga-groupe-afcg.vercel.app`

## Pourquoi Ce Problème ?

Par défaut, Vercel n'active les variables d'environnement **QUE pour Production**. Les déploiements Preview (branches Git) n'ont pas accès aux variables, donc l'application ne peut pas se connecter à Supabase et affiche une page d'erreur ou une page par défaut.

## Note Importante

Ce problème affecte **UNIQUEMENT les déploiements Preview** (URLs avec `-git-` dans le nom). L'URL de production principale (`temi-crm-v3.vercel.app`) devrait déjà fonctionner correctement.
