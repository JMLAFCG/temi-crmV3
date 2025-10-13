# Mode Démonstration TEMI-Construction CRM

## 🎯 Objectif

Le mode démonstration permet de tester rapidement toutes les fonctionnalités de l'application avec des données réalistes pour chaque rôle utilisateur.

## 🔧 Configuration

### Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
# Mode Démo (développement uniquement)
DEMO_MODE=true
VITE_DEMO_MODE=true
```

### Clé service-role Supabase

Pour les scripts de génération, ajoutez également :

```env
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_supabase
```

## 👥 Comptes de Démonstration

| Rôle               | Email                             | Mot de passe | Nom             | Accès                |
| ------------------ | --------------------------------- | ------------ | --------------- | -------------------- |
| **Administrateur** | admin.demo@afcg-courtage.com      | DemoAfcg!234 | Jean-Marc Leton | Accès complet        |
| **Gestionnaire**   | manager.demo@afcg-courtage.com    | DemoAfcg!234 | Sophie Durand   | Gestion équipes      |
| **Commercial**     | commercial.demo@afcg-courtage.com | DemoAfcg!234 | Thomas Martin   | Projets et clients   |
| **Mandataire**     | mandataire.demo@afcg-courtage.com | DemoAfcg!234 | Marie Dubois    | Portefeuille clients |
| **Client**         | client.demo@afcg-courtage.com     | DemoAfcg!234 | Pierre Lefebvre | Projets personnels   |
| **Entreprise**     | partenaire.demo@afcg-courtage.com | DemoAfcg!234 | Isabelle Moreau | Missions assignées   |
| **Apporteur**      | apporteur.demo@afcg-courtage.com  | DemoAfcg!234 | Michel Bernard  | Commissions          |

## 🚀 Commandes Disponibles

### Génération des données

```bash
# Générer les données de démonstration
npm run seed:demo

# Régénérer (supprime et recrée tout)
npm run seed:demo:reset

# Nettoyer toutes les données de démo
npm run clear:demo

# Nettoyer en gardant les comptes utilisateur
npm run clear:demo -- --keep-users
```

### Accès rapide

```bash
# Démarrer l'application
npm run dev

# Accéder au mode démo
# URL: http://localhost:5173/auth/demo
```

## 📊 Données Générées

### Utilisateurs et Rôles

- **7 comptes principaux** (un par rôle)
- **20 clients supplémentaires** (départements 27 & 76)
- **Statuts variés** : nouveau, qualifié, en cours, en attente docs, rejeté, signé

### Entreprises et Partenaires

- **12 entreprises partenaires** avec SIREN factices
- **Codes APE réalistes** du bâtiment
- **CA et effectifs** variables
- **Attestations** (certaines expirées pour tester les alertes)

### Projets et Workflow

- **10 projets par rôle** pertinent
- **Cycle complet** : brouillon → devis → négociation → approuvé → planifié → chantier → terminé → facturé → payé → annulé
- **Géolocalisation** dans les départements cibles

### Documents et Fichiers

- **30 documents** (devis, factures, attestations, RIB, CNI...)
- **Placeholders PDF/PNG** dans Storage (`demo/*`)
- **Métadonnées complètes** (taille, type MIME, dates)

### Finances et Commissions

- **10 devis et 10 factures** avec montants HT/TVA/TTC cohérents
- **États réalistes** : brouillon/envoyé/accepté/refusé/payé/en retard
- **12 commissions** (en attente/validé/payé)
- **Calculs automatiques** selon les règles TEMI

### Communication et Tâches

- **40 tâches** avec priorités et échéances
- **25 messages** entre utilisateurs
- **20 notifications** par type (info/succès/warning/erreur)

## 🔐 Sécurité et Isolation

### Marquage des Données

- Toutes les données de démo ont `is_demo = true`
- Organisation dédiée : "AFCG Démo" (slug: `afcg-demo`)
- Préfixe `DEMO_` sur les libellés

### Row Level Security (RLS)

- **Maintien de la RLS existante**
- **Politiques spécifiques** pour les données de démo
- **Isolation complète** des données de production

### Garde-fous

- **Mode démo uniquement en développement** (`VITE_DEMO_MODE=true`)
- **Routes et composants masqués** en production
- **Scripts sécurisés** avec vérifications

## 🧪 Tests et Validation

### Écrans à Tester par Rôle

Pour chaque rôle, vérifier :

1. **Dashboard** - Vue d'ensemble et statistiques
2. **Projets** - Liste, détail, création, édition
3. **Documents** - Upload, download, validation
4. **Clients/Entreprises/Apporteurs** - Selon le rôle
5. **Devis et Factures** - Workflow complet
6. **Tâches et Messages** - Communication
7. **Paramètres** - Configuration selon permissions

### États à Valider

- **Écrans vides** (nouveau compte)
- **Listes avec données** (pagination, filtres)
- **Détails avec données** (toutes les sections)
- **Actions clés** (CRUD, upload/download, changements d'état)

## 🔄 Workflow de Test Recommandé

1. **Initialiser** : `npm run seed:demo:reset`
2. **Tester chaque rôle** via `/auth/demo`
3. **Valider les fonctionnalités** critiques
4. **Nettoyer** : `npm run clear:demo`
5. **Répéter** selon les besoins

## 🚨 Points d'Attention

### Limitations

- **Données factices** : SIREN, adresses, montants générés
- **Fichiers placeholders** : PDF/images non réels
- **Emails non envoyés** : notifications simulées

### Performance

- **Génération lente** : ~2-3 minutes pour toutes les données
- **Base de données** : ~500 enregistrements créés
- **Storage** : fichiers placeholders légers

### Maintenance

- **Régénération régulière** recommandée
- **Nettoyage automatique** avant chaque génération
- **Monitoring** des erreurs de création

## 📞 Support

En cas de problème :

1. Vérifier les variables d'environnement
2. Contrôler les logs de génération
3. Tester la connexion Supabase
4. Régénérer les données : `npm run seed:demo:reset`

## 🎉 Fonctionnalités Testables

### Module IA

- **Analyse automatique** des devis PDF
- **Génération de propositions** optimisées
- **Négociation assistée** avec les entreprises

### Système de Commissions

- **Calculs automatiques** selon les règles TEMI
- **Paliers mandataires** (25% à 50%)
- **Suivi des paiements** et facturation

### Gestion Documentaire

- **Upload sécurisé** avec validation
- **Signature électronique** intégrée
- **Gestion des expirations** et alertes

### Communication

- **Messagerie interne** temps réel
- **Notifications** contextuelles
- **Historique** des interactions

---

**Mode démo TEMI-Construction CRM v1.0**  
_Données générées avec Faker.js - Environnement de test sécurisé_
