# 🎨 Guide d'Utilisation du Système de Thème

## 📝 Vue d'Ensemble

Le système de thème supporte 3 modes:
- ☀️ **Clair**: Force le thème clair
- 🌙 **Sombre**: Force le thème sombre  
- 🖥️ **Automatique**: Suit les préférences du système

---

## 🔧 Utilisation du Hook

### **Import:**
```typescript
import { useTheme } from '../hooks/useTheme';
```

### **Dans un Composant:**
```typescript
const MyComponent = () => {
  const { theme, setTheme, currentTheme } = useTheme();

  return (
    <div>
      {/* Affiche: 'light', 'dark', ou 'system' */}
      <p>Préférence: {theme}</p>
      
      {/* Affiche toujours: 'light' ou 'dark' */}
      <p>Thème actuel: {currentTheme}</p>

      {/* Changer le thème */}
      <button onClick={() => setTheme('light')}>☀️ Clair</button>
      <button onClick={() => setTheme('dark')}>🌙 Sombre</button>
      <button onClick={() => setTheme('system')}>🖥️ Auto</button>
    </div>
  );
};
```

---

## 🎨 Styling avec Tailwind

### **Couleurs de Base:**
```tsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-white">
    Texte qui s'adapte
  </p>
</div>
```

### **Bordures:**
```tsx
<div className="border border-gray-200 dark:border-gray-700">
  Contenu avec bordure adaptative
</div>
```

### **Ombres:**
```tsx
<div className="shadow-md dark:shadow-2xl dark:shadow-gray-900/50">
  Card avec ombre adaptative
</div>
```

### **Backgrounds Complexes:**
```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600 
                dark:from-blue-900 dark:to-purple-900">
  Gradient adaptatif
</div>
```

---

## 📋 Exemples Complets

### **Card Adaptative:**
```tsx
const Card = ({ title, content }) => (
  <div className="
    bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700
    rounded-lg shadow-md dark:shadow-xl 
    p-6
  ">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300">
      {content}
    </p>
  </div>
);
```

### **Button avec Thème:**
```tsx
const ThemedButton = ({ children, onClick }) => (
  <button 
    onClick={onClick}
    className="
      px-4 py-2 rounded-lg
      bg-primary-600 dark:bg-primary-700
      text-white
      hover:bg-primary-700 dark:hover:bg-primary-600
      transition-colors
    "
  >
    {children}
  </button>
);
```

### **Input Adaptatif:**
```tsx
const ThemedInput = ({ ...props }) => (
  <input
    {...props}
    className="
      w-full px-4 py-2 rounded-lg
      bg-white dark:bg-gray-800
      border border-gray-300 dark:border-gray-600
      text-gray-900 dark:text-white
      placeholder-gray-400 dark:placeholder-gray-500
      focus:ring-2 focus:ring-primary-500
      focus:border-primary-500
    "
  />
);
```

---

## 🎯 Bonnes Pratiques

### **1. Toujours penser au contraste:**
```tsx
✅ BON:
<p className="text-gray-900 dark:text-white">Texte</p>

❌ MAUVAIS:
<p className="text-gray-400 dark:text-gray-500">Peu lisible</p>
```

### **2. Tester les deux modes:**
```bash
# Chrome DevTools > Rendering > Emulate CSS media feature
prefers-color-scheme: dark
```

### **3. Utiliser des variables CSS si nécessaire:**
```css
:root {
  --bg-primary: white;
  --text-primary: #1f2937;
}

.dark {
  --bg-primary: #1f2937;
  --text-primary: white;
}
```

### **4. États interactifs:**
```tsx
<button className="
  bg-white dark:bg-gray-800
  hover:bg-gray-100 dark:hover:bg-gray-700
  active:bg-gray-200 dark:active:bg-gray-600
  focus:ring-2 focus:ring-primary-500
">
  Button
</button>
```

---

## 🔍 Debugging

### **Vérifier le thème actuel:**
```javascript
// Dans la console
localStorage.getItem('theme')  // 'light', 'dark', ou 'system'
document.documentElement.classList.contains('dark')  // true/false
```

### **Forcer un thème:**
```javascript
// Mode clair
document.documentElement.classList.remove('dark');

// Mode sombre
document.documentElement.classList.add('dark');
```

### **Préférences système:**
```javascript
window.matchMedia('(prefers-color-scheme: dark)').matches
// true = système en mode sombre
// false = système en mode clair
```

---

## 📱 Responsive + Dark Mode

```tsx
<div className="
  bg-white dark:bg-gray-900
  md:bg-gray-50 md:dark:bg-gray-800
  lg:bg-gray-100 lg:dark:bg-gray-700
">
  Responsive ET adaptatif!
</div>
```

---

## ✅ Checklist Composant

Quand vous créez un nouveau composant:

- [ ] Backgrounds: `bg-white dark:bg-gray-800`
- [ ] Texte: `text-gray-900 dark:text-white`
- [ ] Bordures: `border-gray-200 dark:border-gray-700`
- [ ] Ombres: `shadow-md dark:shadow-xl`
- [ ] Hover: `hover:bg-gray-100 dark:hover:bg-gray-700`
- [ ] Placeholders: `placeholder-gray-400 dark:placeholder-gray-500`
- [ ] Icons: `text-gray-500 dark:text-gray-400`

---

## 🚀 Résultat

Avec ce système:
- ✅ Support complet du mode sombre
- ✅ Synchronisation avec le système
- ✅ Persistance des préférences
- ✅ Transition fluide entre les modes
- ✅ API simple et intuitive

**Profitez du dark mode!** 🌙
