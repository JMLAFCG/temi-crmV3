# Fix - Pourcentages réels dans le Dashboard

**Problème résolu:** Les pourcentages affichés dans le dashboard étaient codés en dur et ne correspondaient pas aux données réelles.

## 🐛 Problème identifié

Les cartes statistiques du dashboard affichaient des pourcentages fixes :
- Projets Actifs : `+12%` (codé en dur)
- Clients Actifs : `+5%` (codé en dur)
- Entreprises Partenaires : `+8%` (codé en dur)
- Chiffre d'Affaires : `+15%` (codé en dur)

Ces valeurs ne changeaient jamais et ne reflétaient pas l'évolution réelle des données.

## ✅ Solution implémentée

### 1. Calcul des données mensuelles

**Avant:**
```typescript
const [counts, setCounts] = useState({ projets: 0, clients: 0, entreprises: 0, ca: 0 });

// Récupération uniquement du total
const { count: projets } = await supabase
  .from('projects')
  .select('*', { count: 'exact', head: true });
```

**Après:**
```typescript
const [counts, setCounts] = useState({ projets: 0, clients: 0, entreprises: 0, ca: 0 });
const [changes, setChanges] = useState({ projets: 0, clients: 0, entreprises: 0, ca: 0 });

// Calcul des périodes
const now = new Date();
const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

// Récupération des données ce mois-ci ET le mois dernier
const [
  { count: projetsTotal },
  { count: projetsThisMonth },
  { count: projetsLastMonth },
  // ... (idem pour clients et entreprises)
] = await Promise.all([
  supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_demo', false),
  supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_demo', false).gte('created_at', firstDayThisMonth),
  supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_demo', false).gte('created_at', firstDayLastMonth).lte('created_at', lastDayLastMonth),
]);
```

### 2. Fonction de calcul du pourcentage de changement

```typescript
const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

setChanges({
  projets: calculateChange(projetsThisMonth ?? 0, projetsLastMonth ?? 0),
  clients: calculateChange(clientsThisMonth ?? 0, clientsLastMonth ?? 0),
  entreprises: calculateChange(entreprisesThisMonth ?? 0, entreprisesLastMonth ?? 0),
  ca: 0,
});
```

### 3. Affichage dynamique des pourcentages

**Avant:**
```typescript
{
  title: 'Projets Actifs',
  value: counts.projets,
  change: '+12%',  // ❌ Codé en dur
  positive: true,  // ❌ Toujours positif
}
```

**Après:**
```typescript
{
  title: 'Projets Actifs',
  value: loadingStats ? '—' : counts.projets,
  change: loadingStats
    ? ''
    : changes.projets === 0
      ? ''
      : `${changes.projets > 0 ? '+' : ''}${changes.projets}%`,  // ✅ Calculé dynamiquement
  positive: changes.projets >= 0,  // ✅ Basé sur la valeur réelle
}
```

## 📊 Logique de calcul

### Formule du pourcentage

```
Changement % = ((Ce mois - Mois dernier) / Mois dernier) × 100
```

### Cas particuliers

1. **Mois dernier = 0, Ce mois > 0** → `+100%`
2. **Mois dernier = 0, Ce mois = 0** → `0%` (pas affiché)
3. **Diminution** → Pourcentage négatif (ex: `-25%`)
4. **Pas de changement** → Pas de badge affiché

### Périodes comparées

- **Ce mois** : Du 1er du mois courant à aujourd'hui
- **Mois dernier** : Du 1er au dernier jour du mois précédent

### Exemples

| Mois dernier | Ce mois | Résultat |
|--------------|---------|----------|
| 10 projets | 12 projets | `+20%` |
| 10 clients | 8 clients | `-20%` |
| 0 entreprises | 5 entreprises | `+100%` |
| 15 projets | 15 projets | Pas de badge |

## 🎨 Affichage visuel

- **Positif** (`+X%`) : Badge vert avec flèche vers le haut
- **Négatif** (`-X%`) : Badge rouge avec flèche vers le bas
- **Zéro** : Pas de badge affiché
- **Chargement** : Badge vide jusqu'à la fin du fetch

## 🔍 Requêtes Supabase

### Structure des requêtes

Pour chaque métrique (projets, clients, entreprises), on effectue 3 requêtes :

1. **Total** : Compte total dans la table
2. **Ce mois** : Créations depuis le 1er du mois courant
3. **Mois dernier** : Créations du mois précédent complet

### Filtres appliqués

- **Projets** : `.eq('is_demo', false)` pour exclure les données de démo
- **Clients/Entreprises** : Pas de filtre particulier (pas de colonne `is_demo`)

### Performance

- Utilisation de `count: 'exact', head: true` pour compter sans récupérer les données
- Requêtes en parallèle avec `Promise.all()` pour optimiser le temps de chargement
- Total de 9 requêtes exécutées en parallèle

## 📝 Fichiers modifiés

- ✅ `src/pages/dashboard/DashboardPage.tsx`

## 🚀 Prochaines améliorations possibles

1. **Calcul du CA réel** : Intégrer les données de facturation/paiements
2. **Graphique mensuel** : Remplacer les barres mock par des données réelles
3. **Commissions** : Calculer les commissions réelles des mandataires
4. **Cache** : Mettre en cache les statistiques pour réduire les requêtes
5. **Période personnalisable** : Permettre de choisir la période de comparaison

## ✅ Résultat

- ✅ Pourcentages basés sur les vraies données
- ✅ Affichage positif/négatif correct
- ✅ Pas de pourcentage si pas de changement
- ✅ Gestion du cas "0 → X" (affiche +100%)
- ✅ Build réussi
- ✅ Type checking OK

**Date du fix:** 28 octobre 2025
**Status:** ✅ Résolu et testé
