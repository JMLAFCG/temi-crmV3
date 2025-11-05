# 🚀 Guide: Pousser sur GitHub et Déployer sur Vercel

## ✅ Commit Créé !

Votre commit est prêt avec **306 fichiers** :
- Commit ID: `6e6c923`
- Message: "feat: Fix app settings save + verify HomePage in build"

---

## Étape 1: Créer un Repository sur GitHub

### 1.1 Aller sur GitHub
1. Ouvrez votre navigateur et allez sur https://github.com
2. Connectez-vous à votre compte

### 1.2 Créer un nouveau repository
1. Cliquez sur le bouton **"+"** en haut à droite
2. Sélectionnez **"New repository"**

### 1.3 Configurer le repository
- **Repository name**: `temi-crm-v3` (ou le nom de votre choix)
- **Description**: "TEMI Construction CRM - Application de gestion"
- **Visibilité**:
  - ✅ **Private** (recommandé pour un projet professionnel)
  - ⚠️ **Public** (seulement si vous voulez que tout le monde voie le code)
- **NE PAS cocher** : "Initialize with README" (on a déjà notre code)
- Cliquez sur **"Create repository"**

---

## Étape 2: Connecter votre Projet Local à GitHub

GitHub va vous montrer des instructions. Utilisez celles-ci dans votre terminal :

### Option A: Si vous avez Git installé localement

```bash
# Vérifier que vous êtes dans le bon dossier
pwd
# Devrait afficher: /tmp/cc-agent/59333745/project

# Ajouter le remote GitHub (remplacer USERNAME et REPO)
git remote add origin https://github.com/USERNAME/temi-crm-v3.git

# Vérifier que c'est bien ajouté
git remote -v

# Pousser le code sur GitHub
git push -u origin main
```

**Note**: GitHub va vous demander vos identifiants :
- Username: votre nom d'utilisateur GitHub
- Password: **utilisez un Personal Access Token**, pas votre mot de passe
  - Pour créer un token: https://github.com/settings/tokens
  - Cochez: `repo` (Full control of private repositories)

### Option B: Si vous avez GitHub Desktop

1. Ouvrez GitHub Desktop
2. File → Add Local Repository
3. Sélectionnez le dossier `/tmp/cc-agent/59333745/project`
4. Publish repository

---

## Étape 3: Vérifier sur GitHub

1. Rafraîchissez la page de votre repository sur GitHub
2. Vous devriez voir tous vos fichiers
3. Vérifiez que le fichier `.env` n'est **PAS** présent (c'est normal, il est dans .gitignore)

---

## Étape 4: Connecter à Vercel

### 4.1 Aller sur Vercel
1. Ouvrez https://vercel.com
2. Connectez-vous avec votre compte GitHub

### 4.2 Importer le projet
1. Cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez votre repository `temi-crm-v3`
3. Cliquez sur **"Import"**

### 4.3 Configurer le projet

**Framework Preset**: Vite ✅ (devrait être détecté automatiquement)

**Build Command**:
```
npm run build
```

**Output Directory**:
```
dist
```

**Install Command**:
```
npm install
```

### 4.4 Variables d'environnement

**⚠️ TRÈS IMPORTANT** : Ajoutez vos variables d'environnement Supabase

Cliquez sur **"Environment Variables"** et ajoutez :

```
VITE_SUPABASE_URL=https://cgyucfxdutvjclptfsme.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon_ici
```

**Où trouver ces valeurs ?**
- Elles sont dans votre fichier `.env` local
- OU sur votre dashboard Supabase → Settings → API

**Important**:
- ✅ Cochez **"Production"**, **"Preview"**, ET **"Development"**
- Ces variables doivent être disponibles pour tous les environnements

### 4.5 Déployer
1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes que le build se termine
3. 🎉 Votre site est en ligne !

---

## Étape 5: Vérifier le Déploiement

### 5.1 Tester l'URL de Production
Vercel va vous donner une URL comme :
```
https://temi-crm-v3.vercel.app
```

### 5.2 Tests à Effectuer

#### Test 1: Page d'Accueil
1. Allez sur l'URL
2. ✅ Vérifiez que vous voyez "Bienvenue sur TEMI"
3. ✅ Vérifiez les 3 cartes (Mandataires, Apporteurs, Entreprises)
4. ✅ Cliquez sur "Connexion" → doit aller sur `/login`

#### Test 2: Connexion
1. Allez sur `/login`
2. Connectez-vous avec vos identifiants admin
3. ✅ Devrait vous rediriger vers le dashboard

#### Test 3: Paramètres (NOUVEAU)
1. Menu → Admin → Paramètres
2. Modifiez le nom de l'entreprise
3. Cliquez sur "Enregistrer les paramètres"
4. ✅ Message vert "✓ Paramètres enregistrés avec succès"
5. Rafraîchissez (F5)
6. ✅ La modification est conservée

---

## 🔧 Configuration des Domaines (Optionnel)

### Domaine Personnalisé

Si vous avez un domaine (ex: `app.temi-construction.fr`) :

1. Sur Vercel → Settings → Domains
2. Cliquez sur **"Add"**
3. Entrez votre domaine
4. Suivez les instructions DNS
5. Attendez la propagation (~5-30 min)

---

## 🔄 Workflow de Mise à Jour

Pour les prochaines modifications :

### 1. Modifier le Code Localement
```bash
# Faire vos modifications
# ...

# Vérifier le build
npm run build
```

### 2. Commiter et Pousser
```bash
# Ajouter les fichiers modifiés
git add .

# Créer un commit
git commit -m "Description de la modification"

# Pousser sur GitHub
git push
```

### 3. Déploiement Automatique
- Vercel détecte automatiquement le push
- Un nouveau build démarre
- Une URL de preview est créée
- Si tout est OK, promouvoir en production

---

## 🚨 Dépannage

### Erreur: "Build Failed"
1. Vérifiez les logs dans Vercel
2. Vérifiez que les variables d'environnement sont configurées
3. Testez le build localement : `npm run build`

### Erreur: "Failed to fetch from Supabase"
1. Vérifiez que `VITE_SUPABASE_URL` est correct
2. Vérifiez que `VITE_SUPABASE_ANON_KEY` est correct
3. Vérifiez sur Supabase Dashboard → Settings → API

### Page Blanche après Déploiement
1. Vérifiez que `dist` est bien le Output Directory
2. Vérifiez dans les logs que le build s'est terminé sans erreur
3. Vérifiez la console du navigateur (F12) pour les erreurs

### Variables d'Environnement Non Reconnues
1. Sur Vercel → Settings → Environment Variables
2. Vérifiez que les variables commencent bien par `VITE_`
3. Vérifiez que toutes les environnements sont cochés
4. **Redéployez** après avoir ajouté les variables

---

## 📝 Checklist Complète

- [ ] Repository GitHub créé
- [ ] Code poussé sur GitHub (commit 6e6c923)
- [ ] Projet importé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi
- [ ] Page d'accueil fonctionne
- [ ] Connexion fonctionne
- [ ] Enregistrement des paramètres fonctionne
- [ ] Dashboard affiche les données

---

## 🎯 Résultat Final

Vous aurez :
- ✅ Code source versionné sur GitHub
- ✅ Application en production sur Vercel
- ✅ Déploiements automatiques à chaque push
- ✅ URLs de preview pour chaque commit
- ✅ HTTPS automatique
- ✅ CDN global pour performance maximale

---

**Besoin d'aide ?**
- Documentation Vercel: https://vercel.com/docs
- Documentation GitHub: https://docs.github.com
- Fichier `DEPLOIEMENT_VERCEL_FIX.md` pour plus de détails
