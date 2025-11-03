# 🚨 URGENCE - CORRECTION VERCEL (2 minutes)

## LE PROBLÈME

Votre app Vercel se connecte au **MAUVAIS projet Supabase** !

- ❌ Ancien projet hardcodé : `cgyucfxdutvjclptfsme`
- ✅ VOTRE projet : `xtndycygxnrkpkunmhde`

**C'est pour ça que** :
- Les 4 clients sont dans l'ancien projet
- Vos nouvelles données ne sont PAS sauvegardées

## LA SOLUTION (2 ÉTAPES)

### ÉTAPE 1 : Ajouter les variables dans Vercel

1. https://vercel.com/dashboard → Votre projet
2. **Settings** → **Environment Variables**
3. Cliquez **Add New Variable** et ajoutez :

```
VITE_SUPABASE_URL
https://xtndycygxnrkpkunmhde.supabase.co
☑️ Production ☑️ Preview ☑️ Development
```

```
VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0bmR5Y3lneG5ya3BrdW5taGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDkwMzksImV4cCI6MjA3NzIyNTAzOX0.toQSD50SSkK31tszyynyGL9L5qwoopXji3FAv4etZIs
☑️ Production ☑️ Preview ☑️ Development
```

```
VITE_MOCK_DATA
false
☑️ Production ☑️ Preview ☑️ Development
```

4. Cliquez **Save** pour chaque variable

### ÉTAPE 2 : Redéployer

1. Onglet **Deployments**
2. Dernier déploiement → **⋮** (3 points) → **Redeploy**
3. Cochez **Use existing Build Cache**
4. **Redeploy**

## ✅ APRÈS LE REDÉPLOIEMENT (3 minutes)

1. Videz le cache navigateur : **Ctrl + Shift + R**
2. Dashboard affichera **0 clients** (votre vraie base vide)
3. Créez un client → Il sera SAUVEGARDÉ dans votre base !

## 🔍 VÉRIFICATION RAPIDE

Ouvrez la console (F12) et vérifiez :
```
Supabase configuré avec l'URL: https://xtndycygxnrkpkunmhde.supabase.co
```

Si vous voyez cette URL, **c'est bon !** ✅

---

**Plus d'infos** : Voir `CONFIGURATION_VERCEL_VARIABLES.md`
