# Fix Écran Blanc - Diagnostic et Solution

## Problème
Écran blanc dans le preview après les modifications du StatusBanner.

## Cause Identifiée
1. Cache du navigateur/service worker
2. Image manquante dans StatusBanner (`/GROUPE AFCG White logo.png`)
3. Module React corrompu dans node_modules

## Solutions Appliquées

### 1. Nettoyage complet
```bash
rm -rf node_modules package-lock.json .vite
npm cache clean --force
npm install --legacy-peer-deps
```

### 2. Correction StatusBanner
**Avant:** Référence à une image manquante
```tsx
<img src="/GROUPE AFCG White logo.png" alt="Groupe AFCG" className="h-5 object-contain" />
```

**Après:** Utilise du texte
```tsx
<span className="text-white font-bold">Groupe AFCG</span>
```

### 3. Désactivation temporaire du Service Worker
Commenté le code PWA dans `src/main.tsx` pour éviter les problèmes de cache.

## Pour tester localement

1. **Vider le cache du navigateur:**
   - Chrome: Ctrl+Shift+Del → Tout effacer
   - Firefox: Ctrl+Shift+Del → Tout effacer
   - Safari: Cmd+Option+E

2. **Désactiver le Service Worker:**
   - Chrome DevTools → Application → Service Workers → Unregister
   - Firefox DevTools → Application → Service Workers → Unregister

3. **Hard Refresh:**
   - Chrome: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
   - Firefox: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)

4. **Relancer le dev server:**
```bash
npm run dev
```

## Vérifications Build
✅ Type checking OK
✅ Build sans erreur
✅ Tous les imports corrects
✅ StatusBanner ne dépend plus d'images manquantes

## Si le problème persiste

### En navigation privée
Testez en mode navigation privée pour éviter tout cache.

### Console du navigateur
Ouvrez la console (F12) et vérifiez les erreurs.

### Vider tous les caches
```bash
# Dans le projet
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Fichiers modifiés
1. `src/components/layout/StatusBanner.tsx` - Suppression de l'image
2. `src/main.tsx` - Désactivation du service worker
3. Réinstallation propre des dépendances
