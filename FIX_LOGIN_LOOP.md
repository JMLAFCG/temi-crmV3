# Fix - Boucle de redirection sur l'écran de connexion

**Problème résolu:** L'écran de connexion "sautait" continuellement à cause d'une boucle de re-render.

## 🐛 Causes identifiées

1. **Double appel de `checkAuth()`** :
   - `App.tsx` appelait `checkAuth()` au démarrage
   - `AppLayout.tsx` rappelait `checkAuth()` à chaque render
   - Créait une boucle infinie

2. **État d'authentification incomplet** :
   - Le store n'avait qu'un état `user` et `isLoading`
   - Manquait un flag `isAuthenticated` stable
   - Les composants se basaient sur `user` qui changeait fréquemment

3. **`isLoading` initialisé à `false`** :
   - Au démarrage, `isLoading = false` alors qu'on n'a pas encore vérifié l'auth
   - Causait des redirections prématurées vers `/login`

## ✅ Corrections apportées

### 1. Ajout d'un flag `isAuthenticated` stable

**Fichier:** `src/store/authStore.ts`

```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;  // ⬅️ NOUVEAU
  // ...
}

// État initial
{
  user: null,
  isLoading: true,  // ⬅️ Changé de false à true
  isAuthenticated: false,
  error: null,
}
```

### 2. Mise à jour de `isAuthenticated` dans toutes les actions

- `login()` : set `isAuthenticated: true` en cas de succès
- `register()` : set `isAuthenticated: true` en cas de succès
- `logout()` : set `isAuthenticated: false`
- `checkAuth()` : set `isAuthenticated` selon le résultat

### 3. Suppression de l'appel dupliqué à `checkAuth()`

**Fichier:** `src/components/layout/AppLayout.tsx`

**AVANT:**
```typescript
useEffect(() => {
  checkAuth();  // ❌ Appel redondant
}, [checkAuth]);
```

**APRÈS:**
```typescript
// ✅ Supprimé - checkAuth() est déjà appelé dans App.tsx
```

### 4. Utilisation de `isAuthenticated` au lieu de `user`

**Fichier:** `src/pages/auth/LoginPage.tsx`

**AVANT:**
```typescript
const { user, isLoading } = useAuthStore();

useEffect(() => {
  if (user && !isLoading) {  // ❌ user change souvent
    navigate('/dashboard');
  }
}, [user, isLoading, navigate]);
```

**APRÈS:**
```typescript
const { isAuthenticated, isLoading } = useAuthStore();

useEffect(() => {
  if (isAuthenticated && !isLoading) {  // ✅ Flag stable
    navigate('/dashboard');
  }
}, [isAuthenticated, isLoading, navigate]);
```

### 5. Ajout d'un écran de chargement

**Fichier:** `src/pages/auth/LoginPage.tsx`

```typescript
if (isLoading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );
}
```

Empêche l'affichage du formulaire de connexion pendant la vérification initiale de l'auth.

## 🎯 Résultat

- ✅ Plus de boucle de redirection
- ✅ Écran de chargement fluide au démarrage
- ✅ Connexion/Déconnexion fonctionnelles
- ✅ Redirections correctes selon l'état d'authentification
- ✅ Type checking passé
- ✅ Build réussi

## 🔍 Pour déboguer à l'avenir

Si le problème revient, vérifier :

1. **Nombre d'appels à `checkAuth()`** : Doit être appelé UNE SEULE FOIS au démarrage dans `App.tsx`
2. **État `isLoading`** : Doit être `true` au démarrage, puis passer à `false` après vérification
3. **Redirections** : Utiliser `isAuthenticated` plutôt que `user` pour les conditions
4. **useEffect** : Vérifier les dépendances pour éviter les re-renders infinis

## 📝 Fichiers modifiés

- ✅ `src/store/authStore.ts`
- ✅ `src/pages/auth/LoginPage.tsx`
- ✅ `src/components/layout/AppLayout.tsx`

**Date du fix:** 28 octobre 2025
**Status:** ✅ Résolu et testé
