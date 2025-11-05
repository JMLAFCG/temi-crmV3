# 🚨 URGENCE : "Invalid API key" sur Vercel Preview

## Date: 2025-11-05

## 🔴 Problème Actuel

- ✅ **Production** (temi-crm-v3.vercel.app) : Fonctionne parfaitement
- ❌ **Preview** (deployments de branches) : **"Invalid API key"**

**Cause** : Les variables d'environnement ne sont PAS configurées pour l'environnement Preview.

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

### Étape 5 : Redéployer le Preview

Après avoir configuré les variables :

**Option A : Redéployer le Preview existant**
1. Allez dans l'onglet **Deployments**
2. Trouvez votre déploiement Preview (celui qui affiche "Invalid API key")
3. Cliquez sur les **3 points** à droite
4. Cliquez sur **Redeploy**
5. Attendez la fin du déploiement (environ 2-3 minutes)

**Option B : Pousser un nouveau commit**
```bash
git commit --allow-empty -m "trigger: test preview with env vars"
git push
```

## Vérification

Après le redéploiement :

1. Ouvrir le Preview (URL qui commence par `temi-crm-v3-xxx.vercel.app`)
2. Essayer de vous connecter avec vos identifiants
3. ✅ La connexion devrait fonctionner
4. ❌ Plus d'erreur "Invalid API key"

## 🔍 Si Ça Ne Marche Toujours Pas

### Vérifier que les variables sont bien là
1. Vercel → Settings → Environment Variables
2. Pour chaque variable, cliquer sur "Edit"
3. Vérifier que **Preview** est coché ✅

### Vérifier les valeurs
D'après vos screenshots, les bonnes valeurs sont :
- `VITE_SUPABASE_URL` = `https://cgyucfxdutvjclptfsme.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneXVjZnhkdXR2amNscHRmc21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MjE1NzQsImV4cCI6MjA0NjM5NzU3NH0.xXGfJN0CU8b6pGRsEj0RKJPo_hDZy2mJRN5hQOppgbw`

### Vider le cache de build
1. Vercel → Settings → General
2. Scroll vers le bas
3. **Clear Build Cache**
4. Redéployer

### Vérifier les logs
1. Vercel → Deployments → votre Preview
2. **View Build Logs**
3. Chercher "VITE_SUPABASE"
4. Vérifier que les variables sont définies

## URLs à Tester

Après configuration :

- ✅ Production : `temi-crm-v3.vercel.app`
- ✅ Preview Main : `temi-crm-v3-git-main-groupe-afcg.vercel.app`
- ✅ Autres branches : `temi-crm-v3-azza7q4ga-groupe-afcg.vercel.app`

## 💡 Explication Technique

### Pourquoi ça marche en Production mais pas en Preview ?

Vercel sépare les variables d'environnement par **environnement** :

```
┌─────────────────────────────────────────┐
│ PRODUCTION (main branch)                │
│ ✅ Variables configurées                │
│ ✅ Connexion fonctionne                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ PREVIEW (autres branches)               │
│ ❌ Variables NON configurées            │
│ ❌ "Invalid API key"                    │
└─────────────────────────────────────────┘
```

Lorsque vous ne cochez **que** Production, les Preview n'ont **aucune variable**.

### Ce qui se passe sans variables :

```typescript
// Dans votre code
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// En Production : ✅
supabaseUrl = "https://cgyucfxdutvjclptfsme.supabase.co"
supabaseKey = "eyJhbG..."

// En Preview (sans config) : ❌
supabaseUrl = undefined
supabaseKey = undefined

// Résultat : "Invalid API key"
```

## 📋 CHECKLIST DE RÉSOLUTION

- [ ] Aller dans Vercel → Settings → Environment Variables
- [ ] Modifier `VITE_SUPABASE_URL` → Cocher **Preview**
- [ ] Modifier `VITE_SUPABASE_ANON_KEY` → Cocher **Preview**
- [ ] Sauvegarder les modifications
- [ ] Redéployer le Preview
- [ ] Tester la connexion sur le Preview
- [ ] ✅ Connexion réussie!

## ⚠️ IMPORTANT

### À faire MAINTENANT
✅ Configurer les variables pour **Preview** aussi

### À NE PAS faire
❌ Ne jamais hardcoder les credentials dans le code
❌ Ne jamais commiter le fichier `.env` sur GitHub
❌ Ne pas oublier de cocher Preview pour les nouvelles variables

### Bonne pratique
Quand vous ajoutez une variable d'environnement sur Vercel :
- **TOUJOURS** cocher les 3 cases (Production, Preview, Development)
- Sauf si la variable est spécifique à un environnement

---

**Temps estimé** : 5 minutes
**Impact** : Bloque les tests sur Preview
**Statut après correction** : ✅ Preview fonctionnel
