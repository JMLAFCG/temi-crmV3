# 🚀 Guide de Déploiement sur Vercel

## Étape 1 : Créer un compte GitHub (si pas déjà fait)

1. Allez sur **https://github.com/signup**
2. Créez un compte gratuit

## Étape 2 : Créer un repository GitHub

1. Allez sur **https://github.com/new**
2. **Nom du repository** : `temi-crm`
3. **Visibilité** : Privé (recommandé pour la sécurité)
4. **Ne cochez RIEN d'autre** (pas de README, pas de .gitignore, etc.)
5. Cliquez sur **"Create repository"**

## Étape 3 : Uploader votre code sur GitHub

### Option A : Via l'interface web (le plus simple)

1. Sur la page de votre nouveau repository, cliquez sur **"uploading an existing file"**
2. Faites glisser tous les fichiers et dossiers de votre projet **SAUF** :
   - `node_modules/`
   - `dist/`
   - `.env` (important pour la sécurité !)
3. Écrivez un message de commit : "Initial commit"
4. Cliquez sur **"Commit changes"**

### Option B : Via la ligne de commande

Dans votre terminal, depuis le dossier du projet :

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/temi-crm.git
git push -u origin main
```

**Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub**

## Étape 4 : Déployer sur Vercel

1. Allez sur **https://vercel.com/signup**
2. Créez un compte (utilisez votre compte GitHub pour vous connecter)
3. Une fois connecté, cliquez sur **"Add New Project"**
4. Cliquez sur **"Continue with GitHub"**
5. Autorisez Vercel à accéder à vos repositories GitHub
6. Sélectionnez le repository **`temi-crm`**
7. Cliquez sur **"Import"**

## Étape 5 : Configurer les variables d'environnement

**AVANT de déployer**, vous DEVEZ ajouter ces variables d'environnement :

1. Dans la section **"Environment Variables"**, ajoutez :

```
VITE_SUPABASE_URL = https://cgyucfxdutvjclptfsme.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneXVjZnhkdXR2amNscHRmc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTI5NjIsImV4cCI6MjA2MzgyODk2Mn0.vM1hh8oZ3Idz2qTQCsKv793irDTEy9e8_u2o7DOq_MM
```

2. Sélectionnez **tous les environnements** (Production, Preview, Development)

## Étape 6 : Déployer

1. Vérifiez que les paramètres sont corrects :
   - **Framework Preset** : Vite
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

2. Cliquez sur **"Deploy"**

3. Attendez 2-3 minutes que le déploiement se termine

4. Votre application sera disponible sur une URL comme : `https://temi-crm.vercel.app`

## ✅ C'est fait !

Votre application est maintenant en ligne !

### Mises à jour automatiques

À chaque fois que vous faites un `git push` sur GitHub, Vercel va automatiquement redéployer votre application avec les nouvelles modifications.

## Problèmes courants

### "Page not found" sur les routes

✅ **Déjà corrigé** : Le fichier `vercel.json` est configuré pour gérer correctement les routes React Router.

### Variables d'environnement manquantes

Si vous voyez des erreurs de connexion à Supabase :
1. Allez dans **Settings > Environment Variables** sur Vercel
2. Vérifiez que les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont bien configurées
3. Redéployez l'application

### Build qui échoue

Si le build échoue :
1. Vérifiez les logs d'erreur dans l'interface Vercel
2. Assurez-vous que le projet build correctement en local avec `npm run build`
3. Vérifiez que toutes les dépendances sont dans `package.json`

## Support

Pour toute question, contactez votre administrateur système.
