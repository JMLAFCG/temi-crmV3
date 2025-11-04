# Instructions pour vérifier auth.users

## Étapes à suivre dans le Dashboard Supabase

### 1. Changer le schéma vers "auth"

En haut à gauche dans le Table Editor, vous voyez actuellement :
```
schema: public
```

**Cliquer sur "public"** et sélectionner **"auth"** dans le menu déroulant.

### 2. Trouver la table "users" dans le schéma auth

Une fois dans le schéma `auth`, chercher et cliquer sur la table **"users"**.

⚠️ ATTENTION : C'est différent de `public.users` !

### 3. Modifier la table auth.users

1. Cliquer sur les **3 points (•••)** ou le bouton **"Edit table"**
2. Vérifier si la case **"Enable Row Level Security (RLS)"** est cochée
3. Si elle est **COCHÉE** → **LA DÉCOCHER**
4. Cliquer sur **"Save"**

### 4. Alternative via SQL Editor

Si vous ne trouvez pas la table dans l'interface :

1. Aller dans **SQL Editor** (menu de gauche)
2. Créer une nouvelle query
3. Exécuter cette commande :

```sql
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
```

4. Cliquer sur **"Run"**

### 5. Vérification

Pour vérifier que RLS est bien désactivé, exécuter dans SQL Editor :

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'auth' AND tablename = 'users';
```

Le résultat devrait montrer `rowsecurity: false`

### 6. Test final

Une fois modifié :
1. Recharger la page : https://temi-crm-v3.vercel.app
2. Tester le login avec : jml@afcg-courtage.com
3. L'erreur 500 devrait disparaître immédiatement

## Pourquoi c'est important ?

La table `auth.users` est une **table système Supabase** qui gère l'authentification.

Si RLS est activé dessus sans policies, **personne ne peut s'authentifier** car Supabase Auth lui-même ne peut pas lire la table.

C'est pour ça qu'on obtient l'erreur :
```
500 Internal Server Error
"Database error querying schema"
```
