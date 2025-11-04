# 🚨 URGENCE CRITIQUE : RLS Bloque L'Authentification

## PROBLÈME IDENTIFIÉ

**RLS est activé sur la table `auth.users` SANS aucune policy.**

Cela empêche Supabase Auth de fonctionner et cause l'erreur :
```
500 Internal Server Error
"Database error querying schema"
```

## CAUSE

Une de nos migrations a activé RLS sur `auth.users`, ce qui est **INTERDIT**.
La table `auth.users` est une table système Supabase qui ne doit **JAMAIS** avoir RLS.

## SOLUTION IMMÉDIATE

### Via le Dashboard Supabase (RECOMMANDÉ)

1. **Aller sur** : https://supabase.com/dashboard/project/xtndycygxnrkpkunmhde

2. **Table Editor** → Sélectionner le schéma `auth` → Table `users`

3. **Cliquer sur les 3 points** en haut à droite → **Edit Table**

4. **Décocher "Enable Row Level Security (RLS)"**

5. **Sauvegarder**

### Via SQL Editor (Alternative)

1. Aller sur : https://supabase.com/dashboard/project/xtndycygxnrkpkunmhde/sql/new

2. Exécuter cette requête :

```sql
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
```

3. Cliquer sur "Run"

## VÉRIFICATION

Après avoir désactivé RLS, tester immédiatement :

1. Recharger la page : https://temi-crm-v3.vercel.app
2. Tenter de se connecter avec : jml@afcg-courtage.com
3. L'erreur 500 devrait disparaître

## PRÉVENTION

**RÈGLE ABSOLUE** : NE JAMAIS activer RLS sur les tables du schéma `auth.*`

Tables Supabase à ne JAMAIS modifier :
- ❌ `auth.users`
- ❌ `auth.sessions`
- ❌ `auth.refresh_tokens`
- ❌ `auth.identities`

Ces tables sont gérées par Supabase et protégées par le système d'authentification.

## MIGRATION PROBLÉMATIQUE

Rechercher et supprimer toute migration contenant :

```sql
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
```

Migrations à vérifier :
- `20251104080305_fix_auth_schema_dangerous_policies.sql`
- Toute migration mentionnant `auth.users`

## APRÈS LE FIX

Une fois RLS désactivé sur `auth.users` :
1. Le login fonctionnera immédiatement
2. Redéployer n'est PAS nécessaire
3. L'erreur disparaîtra instantanément
