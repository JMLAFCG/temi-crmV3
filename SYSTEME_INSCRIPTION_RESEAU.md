# 🎯 Système d'Inscription au Réseau - Guide Complet

## 📋 Vue d'ensemble

Un système complet de gestion des demandes d'inscription a été mis en place pour permettre aux personnes souhaitant rejoindre votre réseau de postuler en ligne, et à votre équipe de gérer ces demandes facilement.

---

## ✅ Fonctionnalités Implémentées

### 1. **Formulaire Public d'Inscription**
**URL:** `/join-network`

**Accessible depuis:**
- Page de connexion → Bouton "Rejoindre le réseau"
- URL directe: `https://votre-domaine.com/join-network`

**Types de profils disponibles:**
- 🤝 **Mandataire** - Prospecte pour le réseau
- 💼 **Apporteur d'affaires** - Apporte des opportunités commerciales
- 🏢 **Entreprise partenaire** - Entreprise souhaitant rejoindre le réseau

**Informations collectées:**
- Prénom, Nom, Email (requis)
- Téléphone (optionnel)
- Nom d'entreprise et SIRET (pour les entreprises partenaires)
- Message de motivation

---

### 2. **Page Administration des Demandes**
**Navigation:** `Administration > Demandes d'inscription`

**Fonctionnalités:**

#### 📊 **Vue d'ensemble**
- Compteur de demandes en attente (badge jaune)
- Filtres: Toutes / En attente / Approuvées / Rejetées
- Vue détaillée de chaque demande avec toutes les informations

#### ✅ **Approuver une demande**
- Option: Créer automatiquement le compte utilisateur ✓
- Si l'option est cochée:
  - Création du compte avec le rôle demandé
  - Pour les entreprises partenaires: création automatique de la fiche entreprise
  - Enregistrement de l'utilisateur qui a approuvé
  - Date d'approbation enregistrée

#### ❌ **Rejeter une demande**
- Obligation de fournir une raison
- Raison conservée dans l'historique
- Enregistrement de qui a rejeté et quand

---

### 3. **Base de Données**

**Nouvelle table: `registration_requests`**

```sql
CREATE TABLE registration_requests (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  company_name text,
  siret text,
  requested_role text NOT NULL, -- mandataire, apporteur, partner_company
  motivation text,
  status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Sécurité RLS:**
- ✅ Tout le monde peut créer une demande (formulaire public)
- ✅ Seuls les admins/managers peuvent voir et gérer les demandes
- ✅ Historique complet de qui a traité chaque demande

---

## 🚀 Utilisation

### Pour les Candidats

1. **Accéder au formulaire**
   - Aller sur `https://votre-domaine.com/join-network`
   - Ou cliquer sur "Rejoindre le réseau" depuis la page de connexion

2. **Remplir le formulaire**
   - Choisir son type de profil
   - Renseigner ses coordonnées
   - Expliquer sa motivation

3. **Confirmation**
   - Message de confirmation affiché
   - La demande est envoyée à votre équipe

---

### Pour les Administrateurs

#### **Accéder aux demandes**
```
Connexion → Administration → Demandes d'inscription
```

#### **Traiter une demande en attente**

**Option 1: Approuver avec création de compte**
1. Vérifier les informations du candidat
2. ✓ Cocher "Créer le compte utilisateur"
3. Cliquer sur "Approuver"
4. **Résultat:**
   - Compte créé automatiquement
   - Rôle attribué selon la demande
   - Pour les entreprises: fiche entreprise créée
   - Le candidat peut se connecter

**Option 2: Approuver sans création de compte**
1. Vérifier les informations
2. ✗ Décocher "Créer le compte utilisateur"
3. Cliquer sur "Approuver"
4. **Résultat:**
   - Demande marquée comme approuvée
   - Vous devrez créer le compte manuellement plus tard

**Option 3: Rejeter**
1. Cliquer sur "Rejeter"
2. Indiquer la raison du rejet
3. Confirmer
4. **Résultat:**
   - Demande marquée comme rejetée
   - Raison conservée dans l'historique

---

## 📊 Workflow Complet

### Scénario: Nouveau Mandataire

```
1. Jean Dupont visite votre site
   ↓
2. Clique sur "Rejoindre le réseau"
   ↓
3. Remplit le formulaire (type: Mandataire)
   ↓
4. Soumet sa demande
   ↓
5. Badge "1 en attente" apparaît dans votre admin
   ↓
6. Vous examinez la demande
   ↓
7. Vous approuvez avec création de compte
   ↓
8. Compte créé automatiquement avec le rôle "mandataire"
   ↓
9. Jean peut maintenant se connecter et travailler
```

---

## 🔒 Sécurité

### **Données publiques (formulaire)**
- ✅ Aucune authentification requise pour postuler
- ✅ Protection contre les doublons (email unique)
- ✅ Validation des données côté client et serveur

### **Données administrateur**
- ✅ Accessible uniquement aux admins et managers
- ✅ RLS Supabase strict
- ✅ Traçabilité complète (qui a fait quoi, quand)
- ✅ Historique permanent des décisions

---

## 📈 Statistiques et Suivi

**Dans la page administration:**
- Nombre total de demandes
- Nombre de demandes en attente (badge)
- Nombre de demandes approuvées
- Nombre de demandes rejetées
- Détails de chaque traitement (qui, quand, pourquoi)

---

## 💡 Cas d'Usage

### **1. Intégrer un nouveau mandataire**
```
Demande reçue → Vérifier → Approuver avec compte → Mandataire actif
```

### **2. Valider une entreprise partenaire**
```
Demande reçue → Vérifier SIRET → Approuver avec compte
→ Compte utilisateur + Fiche entreprise créés automatiquement
```

### **3. Gérer un refus**
```
Demande reçue → Informations incomplètes → Rejeter avec raison
→ Historique conservé pour référence
```

---

## 🎨 Interface Utilisateur

### **Formulaire Public**
- Design moderne et professionnel
- Sélection de profil intuitive avec descriptions
- Validation en temps réel
- Message de confirmation clair

### **Page Administration**
- Liste complète avec filtres
- Cartes détaillées pour chaque demande
- Actions claires et rapides
- Indicateurs visuels (badges de statut)

---

## 🔧 Maintenance

### **Vérifier les demandes en attente**
```
Administration > Demandes d'inscription
→ Filtre "En attente"
```

### **Consulter l'historique**
```
Administration > Demandes d'inscription
→ Filtres "Approuvées" ou "Rejetées"
```

### **Audit trail complet**
- Chaque action est tracée
- Qui a approuvé/rejeté
- Quand l'action a été effectuée
- Raison fournie en cas de rejet

---

## ✅ Checklist de Déploiement

- [x] Table `registration_requests` créée dans Supabase
- [x] Politiques RLS configurées
- [x] Formulaire public accessible
- [x] Page administration fonctionnelle
- [x] Création automatique de comptes
- [x] Gestion des rejets avec raisons
- [x] Traçabilité complète
- [x] Build réussi

---

## 🎯 Prochaines Étapes Possibles

**Améliorations futures (optionnelles):**
- 📧 Envoi d'emails automatiques aux candidats
- 🔔 Notifications push pour les nouvelles demandes
- 📊 Tableau de bord statistiques des inscriptions
- 🤖 Validation automatique selon critères
- 📱 Formulaire optimisé mobile

---

## 🚀 Déploiement

```bash
# 1. Commit des changements
git add .
git commit -m "Système complet de gestion des inscriptions au réseau"

# 2. Push vers production
git push origin main

# 3. Vérifier le déploiement
# - Tester le formulaire: /join-network
# - Vérifier l'admin: Administration > Demandes d'inscription
```

---

## 📞 Support

**Le système est maintenant opérationnel et prêt à l'emploi!**

Toutes les données sont stockées dans Supabase et aucune perte de données n'est possible.
