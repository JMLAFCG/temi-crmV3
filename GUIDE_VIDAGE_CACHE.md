# 🚨 GUIDE DE DÉPANNAGE - CACHE PWA

## Le problème : Anciennes données affichées

Vous voyez encore :
- ❌ **4 Clients Actifs** au lieu de 0
- ❌ **Pastille sur l'icône message**
- ❌ **Graphique avec données**

**Cause** : Le Service Worker PWA met en cache toute l'application.

---

## ✅ SOLUTION AUTOMATIQUE (Recommandée)

**L'application se nettoie maintenant AUTOMATIQUEMENT !**

### Étapes :

1. **Fermez COMPLÈTEMENT le navigateur** (tous les onglets)
   - Windows : Fermer toutes les fenêtres Chrome/Edge
   - Mac : `Cmd + Q` pour quitter vraiment
   - Mobile : Swiper l'app depuis le gestionnaire de tâches

2. **Rouvrez le navigateur**

3. **Rechargez la page avec :**
   - Windows/Linux : `Ctrl + Shift + R`
   - Mac : `Cmd + Shift + R`

4. **Ouvrez la console (F12)** - Vous devriez voir :
   ```
   🔄 Mise à jour du Service Worker...
   🗑️ Suppression cache: temi-construction-v1
   ✅ Service Worker enregistré (version 2)
   🔴 VERSION 2 - CACHE VIDÉ
   ```

Si vous ne voyez PAS ces messages, le cache est toujours actif.

---

## 🔧 SOLUTION MANUELLE (Si l'automatique ne marche pas)

### Chrome/Edge :

1. Appuyez sur **F12** (DevTools)
2. Onglet **Application** (à droite)
3. Menu de gauche :
   
   **Service Workers** :
   - Cliquez sur **"Unregister"** à côté de chaque SW
   - Cochez **"Update on reload"**
   
   **Cache Storage** :
   - Clic droit sur chaque cache
   - **"Delete"**
   
   **Local Storage** :
   - Clic droit → **"Clear"**

4. Fermez DevTools
5. **Ctrl + Shift + R**

### Firefox :

1. **F12** → Onglet **"Stockage"**
2. Clic droit sur **"Service Workers"** → Supprimer
3. Clic droit sur **"Cache"** → Tout effacer
4. **Ctrl + Shift + R**

### Safari (Mac/iOS) :

1. **Safari → Préférences → Avancées**
2. Cocher **"Afficher le menu Développement"**
3. **Développement → Vider les caches**
4. **Cmd + R**

---

## 📱 MOBILE

### Android (Chrome) :

1. **Paramètres** → Apps → Chrome
2. **Stockage** → Effacer le cache
3. Rouvrir l'app

### iOS (Safari) :

1. **Réglages** → Safari
2. **Effacer historique et données**
3. Confirmer

---

## 🧪 TEST RAPIDE : Mode Navigation Privée

Pour tester immédiatement sans vider le cache :

- **Chrome/Edge** : `Ctrl + Shift + N`
- **Firefox** : `Ctrl + Shift + P`
- **Safari** : `Cmd + Shift + N`

Ouvrez l'application dans la fenêtre privée. Vous devriez voir les bonnes valeurs.

---

## ✅ Résultat Attendu

Après le vidage du cache, vous devriez voir :

| Élément | Avant (cache) | Après (correct) |
|---------|---------------|-----------------|
| Clients Actifs | 4 | **0** |
| Pastille message | 🟠 Visible | **Aucune** |
| Graphique revenus | Données colorées | **Barres vides** |
| Pourcentage | +12.5% | **"—"** |
| Console | Pas de logs | **Messages de version 2** |

---

## 🆘 SI RIEN NE MARCHE

1. Vérifiez la console (F12) :
   - Cherchez : `VERSION 2 - CACHE VIDÉ`
   - Si vous le voyez → Le code est à jour, mais le rendu est en cache
   - Si vous ne le voyez pas → Le navigateur charge l'ancienne version

2. **Solution radicale** :
   ```
   Chrome → chrome://settings/content/all
   Recherchez votre domaine
   Supprimez TOUTES les données du site
   ```

3. **Si c'est une PWA installée** :
   - Désinstallez l'application
   - Videz le cache navigateur
   - Réinstallez

---

## 📝 Changements Techniques Effectués

1. ✅ Service Worker se désinstalle automatiquement
2. ✅ Cache vidé automatiquement au chargement
3. ✅ Version du cache : v1 → v2-20251103
4. ✅ Pastilles notifications supprimées
5. ✅ Logs de débogage ajoutés
6. ✅ Meta tags anti-cache HTTP
