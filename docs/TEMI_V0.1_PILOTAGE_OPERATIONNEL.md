# TEMI V0.1 — Pilotage opérationnel exploitable

## Objectif

Livrer une version utilisable quotidiennement pour piloter les clients, les dossiers, la production et la gestion sans recherche inutile.

## Principe UX fondateur

- La situation se comprend immédiatement par des indicateurs, tableaux, graphiques, couleurs et niveaux d’avancement.
- Les explications détaillées apparaissent uniquement pendant une action, un choix, un arbitrage ou face à un risque.
- Aucun paragraphe explicatif sur les écrans de consultation.
- Chaque écran doit permettre de comprendre la situation en moins de 5 secondes.

## Périmètre de la V0.1

### 1. Accueil opérationnel

L’accueil affiche uniquement :

- urgences ;
- actions du jour ;
- dossiers actifs ;
- chiffre d’affaires potentiel ;
- documents attendus ;
- signatures attendues ;
- rendez-vous du jour ;
- actions prioritaires classées.

Chaque indicateur est cliquable et ouvre directement la liste filtrée correspondante.

### 2. Synthèse client

La synthèse client doit afficher sans navigation supplémentaire :

- identité et coordonnées essentielles ;
- société ou sociétés liées ;
- statut de la relation ;
- situation actuelle ;
- nombre de dossiers actifs, en attente, bloqués et terminés ;
- prochaine action ;
- prochain rendez-vous ;
- documents manquants ;
- encours et potentiel commercial ;
- tableau des dossiers du client ;
- historique récent.

Le tableau des dossiers contient au minimum :

| Dossier | Activité | Statut | Avancement | Blocage | Prochaine action | Responsable | Échéance |
|---|---|---|---:|---|---|---|---|

Un clic sur la ligne ouvre le dossier.

### 3. Dossier de production

Le dossier affiche :

- client et contexte ;
- activité ;
- statut ;
- avancement global ;
- étape actuelle ;
- étapes terminées et restantes ;
- pièces reçues et manquantes ;
- intervenants ;
- décisions prises ;
- prochaines actions ;
- échéances ;
- montant, chiffre d’affaires ou commission attendue ;
- risques et blocages.

### 4. Aide aux choix

L’aide contextuelle apparaît uniquement lorsqu’une action nécessite un choix.

Pour chaque option, elle affiche :

- intitulé ;
- avantages ;
- inconvénients ;
- risques ;
- délai ;
- coût ou impact financier ;
- conséquence opérationnelle ;
- recommandation éventuelle et justification ;
- bouton de validation.

Aucune action importante ne doit être validée sans afficher ses conséquences.

### 5. Tableaux exploitables

Les listes principales doivent être des tableaux filtrables et triables.

Colonnes minimales des dossiers :

| Client | Dossier | Activité | Statut | Avancement | Priorité | Prochaine action | Échéance | Responsable | Potentiel |
|---|---|---|---|---:|---|---|---|---|---:|

Filtres rapides :

- mes dossiers ;
- urgents ;
- bloqués ;
- en attente client ;
- en attente partenaire ;
- à relancer ;
- à signer ;
- à facturer ;
- terminés.

### 6. Indicateurs et graphiques

Les graphiques doivent répondre à une question métier immédiate :

- répartition des dossiers par statut ;
- volume et potentiel par activité ;
- chiffre d’affaires signé, attendu et encaissé ;
- évolution mensuelle ;
- taux de transformation ;
- temps moyen par étape ;
- dossiers bloqués par motif ;
- performance par responsable.

Les graphiques sont cliquables et ouvrent les données sources filtrées.

## Priorisation des actions

La priorité d’une action est calculée à partir de :

- urgence ;
- échéance ;
- risque ;
- valeur financière ;
- impact client ;
- temps estimé ;
- dépendance avec d’autres actions ;
- statut de blocage.

La V0.1 peut utiliser une formule simple et transparente. L’IA avancée n’est pas nécessaire pour la première version.

## Données réelles uniquement

- Aucun chiffre de démonstration sur les écrans de production.
- Une donnée indisponible doit afficher `—`, jamais une valeur inventée.
- Les indicateurs doivent être calculés depuis Supabase.
- Les erreurs de chargement doivent être visibles et actionnables.

## Ordre de développement

1. Corriger et simplifier le tableau de bord principal.
2. Construire la synthèse client.
3. Construire la liste des dossiers exploitable.
4. Construire la vue dossier de production.
5. Ajouter les actions contextuelles et leurs choix.
6. Ajouter les graphiques de pilotage.
7. Tester les rôles admin, manager, commercial et mandataire.
8. Tester l’utilisation mobile.

## Critères d’acceptation

La V0.1 est exploitable lorsque Jean-Marc peut :

- ouvrir TEMI et identifier immédiatement les urgences ;
- rechercher un client ;
- voir sa situation actuelle ;
- accéder à tous ses dossiers ;
- connaître la prochaine action de chaque dossier ;
- ouvrir un dossier et comprendre son avancement ;
- effectuer ou déclencher une action ;
- comprendre les conséquences lorsqu’un choix est nécessaire ;
- suivre le potentiel financier sans chiffre fictif ;
- utiliser les fonctions principales depuis un iPhone.

## Hors périmètre immédiat

- chatbot généraliste ;
- moteur prédictif avancé ;
- refonte complète de tous les modules ;
- automatisations complexes ;
- personnalisation graphique poussée ;
- fonctions non nécessaires à la production quotidienne.
