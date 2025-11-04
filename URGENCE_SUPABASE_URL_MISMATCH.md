# 🚨 PROBLÈME CRITIQUE : URL SUPABASE INCORRECTE

## Problème identifié

L'URL Supabase utilisée par l'application **NE CORRESPOND PAS** à la base de données réelle.

### URLs détectées

1. **Dans la console du navigateur (erreur 500)** :
   ```
   https://xtndycygxnrkokumnhde.supabase.co
   ```

2. **Dans le fichier .env local** :
   ```
   https://xtndycygxnrkpkunmhde.supabase.co
   ```

**Notez la différence** : `okumnhde` vs `pkunmhde` !

## Impact

- Le test de connexion réussit (200) car l'endpoint `/auth/v1/health` existe
- MAIS le login échoue (500) car **ce n'est pas le bon projet Supabase**
- L'application essaie de se connecter à un projet Supabase qui n'a pas les mêmes utilisateurs

## Solution URGENTE

### Étape 1 : Trouver la VRAIE URL Supabase

1. Connectez-vous à https://supabase.com/dashboard
2. Sélectionnez votre projet TEMI Construction
3. Allez dans **Settings** > **API**
4. Copiez l'URL du projet (Project URL)
5. Copiez aussi la clé `anon` (public)

### Étape 2 : Mettre à jour les variables d'environnement

**Sur Vercel** :
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Settings > Environment Variables
4. Modifiez :
   - `VITE_SUPABASE_URL` : collez la VRAIE URL
   - `VITE_SUPABASE_ANON_KEY` : collez la VRAIE clé
5. **Cochez les 3 environnements** : Production, Preview, Development
6. Redéployez l'application

**Dans votre .env local** :
1. Ouvrez `/tmp/cc-agent/59333745/project/.env`
2. Remplacez par les VRAIES valeurs de Supabase

### Étape 3 : Vérifier

Après mise à jour :
1. Rechargez l'application
2. Cliquez sur "Tester connexion Supabase"
3. Vérifiez que l'URL dans la console correspond à votre projet

## Pourquoi ce problème ?

Il y a probablement **deux projets Supabase** :
- Un ancien/test : `xtndycygxnrkpkunmhde`
- Le vrai projet : `xtndycygxnrkokumnhde` (celui utilisé en prod)

Ou l'inverse. Il faut identifier lequel contient les vrais utilisateurs.

## Test rapide

Pour savoir quelle URL est la bonne, testez dans votre navigateur :

1. URL 1 : https://xtndycygxnrkokumnhde.supabase.co/auth/v1/health
2. URL 2 : https://xtndycygxnrkpkunmhde.supabase.co/auth/v1/health

Celle qui retourne 200 ET qui correspond à votre projet dans le dashboard Supabase est la bonne.
