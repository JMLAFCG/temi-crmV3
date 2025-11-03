# 🔧 Instructions pour vider le cache PWA

Le problème vient du **Service Worker PWA** qui met en cache toute l'application.

## ✅ Solution 1 - Désinstaller la PWA (RECOMMANDÉ)

Si vous avez installé l'application comme PWA :

1. **Chrome/Edge** :
   - Paramètres → Applications → Gérer les applications
   - Trouver "TEMI-Construction CRM"
   - Cliquer sur "Désinstaller"
   - Recharger la page dans le navigateur normal

2. **Safari iOS** :
   - Appui long sur l'icône de l'app
   - "Supprimer l'app"

## ✅ Solution 2 - Vider le cache du Service Worker

1. Ouvrir les **DevTools** (F12)
2. Aller dans l'onglet **Application**
3. Dans le menu de gauche :
   - **Service Workers** → Cliquer sur "Unregister"
   - **Cache Storage** → Supprimer tous les caches
   - **Local Storage** → Supprimer si nécessaire
4. Fermer complètement le navigateur
5. Rouvrir et recharger avec **Ctrl+Shift+R** (Windows) ou **Cmd+Shift+R** (Mac)

## ✅ Solution 3 - Mode navigation privée

Ouvrir l'application dans une fenêtre de **navigation privée** pour tester sans cache.

## 🔄 Changements effectués

1. ✅ Version du cache PWA changée : `v2-20251103`
2. ✅ Pastilles de notification supprimées
3. ✅ Graphique des revenus vidé
4. ✅ Pourcentage +12.5% remplacé par "—"
5. ✅ Meta tags anti-cache ajoutés

## 📱 Après le rechargement

Vous devriez voir :
- **0 Clients Actifs** (au lieu de 4)
- **Pas de pastilles** sur les icônes notification/message
- **Graphique vide** dans "Revenus Mensuels"
- **"—"** au lieu de "+12.5%"
