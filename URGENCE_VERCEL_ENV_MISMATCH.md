# 🚨 URGENCE : Erreur 500 Auth - URL Supabase incorrecte sur Vercel

## Problème identifié

L'URL Supabase configurée sur **Vercel** est **INCORRECTE** :

- ❌ **Sur Vercel** : `https://xtndycvgxurkpkunmhde.supabase.co` (inexistante)
- ✅ **Dans .env local** : `https://xtndycygxnrkpkunmhde.supabase.co` (valide)

**Différence** : `vg` vs `yg` dans l'URL

## Solution IMMÉDIATE

### 1. Accéder aux variables d'environnement Vercel

1. Aller sur https://vercel.com/votre-projet/settings/environment-variables
2. Ou via le dashboard Vercel → Projet TEMI CRM → Settings → Environment Variables

### 2. Corriger VITE_SUPABASE_URL

**Supprimer l'ancienne valeur et ajouter la bonne :**

```
VITE_SUPABASE_URL=https://xtndycygxnrkpkunmhde.supabase.co
```

**ATTENTION** : Bien utiliser `xtndycygxnrkpkunmhde` (avec `yg`, pas `vg`)

### 3. Appliquer aux environnements

Cocher les cases :
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

### 4. Redéployer

Après avoir sauvegardé :
```bash
# Option 1 : Redéploiement via interface Vercel
Deployments → ... → Redeploy

# Option 2 : Push un commit (déclenchera auto le déploiement)
git commit --allow-empty -m "fix: trigger redeploy after env fix"
git push
```

### 5. Vérification

Après redéploiement, aller sur https://temi-crm-v3.vercel.app et :
1. Ouvrir la console (F12)
2. Chercher le message : `✅ Supabase configuré: https://xtndycygxnrkpkunmhde.supabase.co`
3. Tester le login

## Vérification de toutes les variables

Pendant que vous y êtes, vérifiez que **toutes** ces variables sont correctes sur Vercel :

```env
VITE_SUPABASE_URL=https://xtndycygxnrkpkunmhde.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0bmR5Y3lneG5ya3BrdW5taGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDkwMzksImV4cCI6MjA3NzIyNTAzOX0.toQSD50SSkK31tszyynyGL9L5qwoopXji3FAv4etZIs
```

## Pourquoi cette erreur ?

L'erreur 500 lors du login vient du fait que Vercel essaie de contacter un serveur Supabase qui **n'existe pas** :
- Le serveur `xtndycvgxurkpkunmhde.supabase.co` n'existe pas (erreur DNS)
- Donc Supabase Auth retourne 500 Internal Server Error
- Donc l'application affiche "Database error querying schema"

## Test rapide

Pour vérifier l'URL actuelle sur Vercel sans redéployer :
1. Ouvrir https://temi-crm-v3.vercel.app
2. F12 → Console
3. Chercher le log `Supabase configuré avec l'URL:`
4. Vérifier que c'est bien `xtndycygxnrkpkunmhde` (avec `yg`)
