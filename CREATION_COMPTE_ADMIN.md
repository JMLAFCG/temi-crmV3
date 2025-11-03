# Création du compte administrateur

## Compte à créer

- **Email** : `jml@afcg-courtage.com`
- **Mot de passe** : `TEMI123+`
- **Rôle** : admin
- **Nom** : Jean-Marc Leduc

## Méthode 1 : Via l'application (RECOMMANDÉE)

1. Ouvrez votre navigateur et allez sur l'application TEMI
2. Cliquez sur "S'inscrire" ou allez sur `/register`
3. Remplissez le formulaire avec :
   - Prénom : Jean-Marc
   - Nom : Leduc
   - Email : jml@afcg-courtage.com
   - Mot de passe : TEMI123+
   - Confirmer le mot de passe : TEMI123+
4. Cochez "J'accepte les conditions"
5. Cliquez sur "Créer mon compte"

**Note** : Le compte sera créé avec le rôle "client" par défaut. Il faudra ensuite le changer en "admin".

## Méthode 2 : Via le Dashboard Supabase (PLUS RAPIDE)

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet TEMI
3. Cliquez sur "Authentication" dans le menu de gauche
4. Cliquez sur "Users"
5. Cliquez sur "Add user" (ou "Invite user")
6. Remplissez :
   - Email : jml@afcg-courtage.com
   - Password : TEMI123+
   - Auto confirm : Oui (cochez)
7. Cliquez sur "Create user"

Ensuite, mettez à jour le rôle :

```sql
-- Exécutez cette requête dans le SQL Editor de Supabase
UPDATE users
SET role = 'admin',
    first_name = 'Jean-Marc',
    last_name = 'Leduc'
WHERE email = 'jml@afcg-courtage.com';
```

## Méthode 3 : Via SQL (Si vous avez la clé service_role)

Ajoutez cette clé dans votre fichier `.env` :

```
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

Puis exécutez :

```bash
node scripts/create-admin.js
```

## Vérification

Pour vérifier que le compte est bien créé :

```sql
SELECT
  u.id,
  u.email,
  u.role,
  u.first_name,
  u.last_name,
  au.email_confirmed_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'jml@afcg-courtage.com';
```

## État actuel

✅ Une entrée a été créée dans la table `users` avec l'ID : `e925f96c-4a14-4876-8ecc-7dd811d6c984`

⚠️ Le compte n'existe pas encore dans `auth.users` (nécessaire pour la connexion)

**Action requise** : Utilisez la Méthode 1 ou 2 ci-dessus pour créer le compte dans auth.users.

## Après la création

Une fois le compte créé via Méthode 1 ou 2, assurez-vous que le rôle est bien "admin" :

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'jml@afcg-courtage.com';
```

## Connexion

Après création, vous pourrez vous connecter sur :
- URL : Votre application TEMI
- Email : jml@afcg-courtage.com
- Mot de passe : TEMI123+
