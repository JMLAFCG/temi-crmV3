# Solution: Connexion locale impossible

## 🔴 Problème
Impossible de se connecter en local (Bolt) mais ça fonctionne en ligne (Vercel).

## 🔍 Cause
Le token Supabase dans `.env` local est **expiré depuis le 26 septembre 2025**.

```
Expiration: 26 septembre 2025
Date actuelle: 5 novembre 2025
Statut: ❌ EXPIRÉ
```

## ✅ Solution

### Étape 1: Récupérer vos vraies credentials Supabase

1. Allez sur votre dashboard Vercel: https://vercel.com/jmlafcgs-projects
2. Sélectionnez votre projet `temi-crmv3`
3. Allez dans **Settings** → **Environment Variables**
4. Copiez les valeurs de:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Étape 2: Mettre à jour le fichier `.env` local

Remplacez le contenu du fichier `.env` par:

```env
VITE_SUPABASE_URL=<votre_url_depuis_vercel>
VITE_SUPABASE_ANON_KEY=<votre_clé_depuis_vercel>
```

### Étape 3: Redémarrer le serveur de dev

```bash
# Arrêter le serveur (Ctrl+C)
# Relancer
npm run dev
```

## 🔐 Alternative: Récupérer depuis Supabase directement

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez:
   - **URL**: Votre URL de projet
   - **anon public**: Votre clé anonyme (anon key)

## ⚠️ Important

Les credentials Vercel et Supabase doivent être **identiques**. Si vous changez quelque chose dans Supabase, pensez à mettre à jour Vercel aussi.

## 📝 Note

En production (Vercel), vos variables d'environnement sont correctes et valides, c'est pourquoi l'application fonctionne en ligne.
