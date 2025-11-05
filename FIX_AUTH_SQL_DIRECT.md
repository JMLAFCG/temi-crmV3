# Fix Auth RLS - SQL Editor

## Étape 1 : Ouvrir SQL Editor

Dans le menu de gauche du Dashboard Supabase, cliquer sur :
**📊 SQL Editor**

## Étape 2 : Créer une nouvelle query

Cliquer sur **"New query"**

## Étape 3 : Exécuter cette commande

Copier-coller cette commande SQL :

```sql
-- Vérifier si RLS est activé sur auth.users
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'auth' AND tablename = 'users';
```

Cliquer sur **"Run"** ou appuyer sur **Ctrl+Enter**

### Résultat attendu

Si le résultat montre `rowsecurity: true`, alors c'est le problème !

## Étape 4 : Désactiver RLS

Exécuter cette commande :

```sql
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
```

### ⚠️ Si vous obtenez une erreur "permission denied"

Cela signifie que votre compte n'a pas les droits sur le schéma `auth`.

**Solution alternative** : Contacter le support Supabase ou le propriétaire du projet pour :
1. Vérifier les permissions de votre compte
2. Demander la désactivation de RLS sur `auth.users`

## Étape 5 : Vérifier que c'est corrigé

Ré-exécuter la première commande :

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'auth' AND tablename = 'users';
```

Le résultat devrait maintenant montrer `rowsecurity: false`

## Étape 6 : Tester le login

1. Recharger https://temi-crm-v3.vercel.app
2. Se connecter avec : jml@afcg-courtage.com
3. Le login devrait fonctionner immédiatement

## Alternative : Utiliser l'API Supabase Management

Si SQL Editor ne fonctionne pas, vous pouvez utiliser l'API :

https://supabase.com/dashboard/project/xtndycygxnrkpkunmhde/settings/api

Et exécuter via curl ou Postman la commande de désactivation RLS.

## Remarque importante

Le schéma `auth` est un schéma système Supabase. Il est normal qu'il ne soit pas visible dans le Table Editor pour éviter les modifications accidentelles.

C'est pour ça qu'il faut passer par SQL Editor.
