# ✅ CRÉER L'UTILISATEUR jml@afcg-courtage.com

## 🚨 PROBLÈME
Vous ne pouvez pas accéder aux pages (Clients, Projets, etc.) car votre utilisateur **n'existe pas dans la base de données**, même si vous arrivez à vous "connecter".

## ✅ SOLUTION EN 3 ÉTAPES

### ÉTAPE 1: Créer l'utilisateur dans Supabase Auth

1. Allez sur: **https://supabase.com/dashboard/project/xwttzzwyfytjmsvrlicb**
2. Cliquez sur **"Authentication"** (icône cadenas dans le menu gauche)
3. Cliquez sur **"Users"**
4. Cliquez sur **"Add user"** en haut à droite
5. Sélectionnez **"Create new user"**
6. Remplissez:
   - **Email:** `jml@afcg-courtage.com`
   - **Password:** (choisissez un mot de passe sécurisé, minimum 6 caractères)
   - **☑️ Cochez "Auto Confirm User"** (IMPORTANT!)

7. Dans **"User Metadata"**, ajoutez ce JSON:
   ```json
   {
     "first_name": "Jean-Marc",
     "last_name": "Leton",
     "role": "admin"
   }
   ```

8. Cliquez **"Create user"**

9. **NOTEZ L'ID** de l'utilisateur créé (vous le verrez dans la liste)

---

### ÉTAPE 2: Synchroniser avec public.users

1. Dans le même Dashboard Supabase, cliquez sur **"SQL Editor"** (icône de base de données)
2. Cliquez sur **"New query"**
3. Copiez et exécutez ce SQL:

```sql
-- Synchroniser l'utilisateur jml@afcg-courtage.com
INSERT INTO public.users (
  id,
  auth_user_id,
  email,
  first_name,
  last_name,
  role,
  phone,
  is_demo,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'Jean-Marc'),
  COALESCE(au.raw_user_meta_data->>'last_name', 'Leton'),
  'admin',
  '+33 6 00 00 00 00',
  false,
  au.created_at,
  NOW()
FROM auth.users au
WHERE au.email = 'jml@afcg-courtage.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Vérifier que tout est OK
SELECT id, email, first_name, last_name, role
FROM public.users
WHERE email = 'jml@afcg-courtage.com';
```

4. Vous devriez voir l'utilisateur avec le rôle **'admin'**

---

### ÉTAPE 3: Nettoyer app_settings (optionnel)

Si vous voulez des paramètres vides pour les remplir vous-même:

```sql
DELETE FROM app_settings;

INSERT INTO app_settings (id, key, value, description, updated_at)
VALUES
  (gen_random_uuid(), 'company_name', '""'::jsonb, 'Nom de l''entreprise', NOW()),
  (gen_random_uuid(), 'company_website', '""'::jsonb, 'Site web', NOW()),
  (gen_random_uuid(), 'company_email', '""'::jsonb, 'Email de contact', NOW()),
  (gen_random_uuid(), 'company_phone', '""'::jsonb, 'Téléphone', NOW()),
  (gen_random_uuid(), 'company_address', '""'::jsonb, 'Adresse', NOW()),
  (gen_random_uuid(), 'default_commission_rate', '10'::jsonb, 'Taux de commission par défaut (%)', NOW()),
  (gen_random_uuid(), 'default_tax_rate', '20'::jsonb, 'Taux de TVA par défaut (%)', NOW());
```

---

### ÉTAPE 4: Se connecter

1. **Déconnectez-vous** de l'application (si connecté)
2. **Videz le cache** du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
3. **Reconnectez-vous** avec:
   - Email: `jml@afcg-courtage.com`
   - Password: (celui que vous avez défini)

4. ✅ **Vous aurez accès à TOUTES les pages!**

---

## 📊 VÉRIFICATIONS

Après connexion, vous devriez pouvoir accéder à:
- ✅ **Dashboard** (tableau de bord)
- ✅ **Clients** (liste vide, prête pour vos données)
- ✅ **Projets** (liste vide, prête pour vos données)
- ✅ **Entreprises** (liste vide, prête pour vos données)
- ✅ **Apporteurs** (liste vide, prête pour vos données)
- ✅ **Administration > Général** (paramètres à remplir)
- ✅ **Administration > Utilisateurs** (vous y verrez votre compte)

---

## ❓ POURQUOI CE PROBLÈME?

L'application nécessite que l'utilisateur existe dans **2 tables**:
1. `auth.users` (authentification Supabase)
2. `public.users` (données de l'application)

Si vous n'existez que dans `auth.users`, vous pouvez vous "connecter" mais pas accéder aux pages protégées qui vérifient le rôle dans `public.users`.

---

## 🆘 SI ÇA NE FONCTIONNE TOUJOURS PAS

Envoyez-moi le résultat de cette requête SQL:

```sql
SELECT 'auth.users' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'public.users', COUNT(*) FROM public.users;
```

Et aussi:
```sql
SELECT id, email, role FROM public.users WHERE email = 'jml@afcg-courtage.com';
```
