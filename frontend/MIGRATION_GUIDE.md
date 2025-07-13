# Al-Hidaya Frontend Migration Guide

## 🎨 Design System Modernization Plan

### Phase 1: Foundation (Semaine 1)
1. **Remplacer le CSS global**
   - Basculer de `globals.css` vers `modern-globals.css`
   - Mettre à jour `tailwind.config.js` pour les nouvelles couleurs
   - Tester le mode sombre

2. **Optimiser les performances**
   - Implémenter le lazy loading systématique
   - Réduire les animations complexes
   - Utiliser `will-change` avec parcimonie

### Phase 2: Composants Core (Semaine 2)
1. **Navigation**
   - Remplacer `Navigation.tsx` par `ModernNavigation.tsx`
   - Ajouter les transitions fluides
   - Améliorer l'accessibilité

2. **Hero Section**
   - Migrer vers `ModernHeroSection.tsx`
   - Simplifier les animations
   - Optimiser pour mobile

3. **Cards et Conteneurs**
   - Utiliser les nouvelles classes `.card`
   - Implémenter `IslamicPattern` de manière subtile
   - Réduire les ombres et effets

### Phase 3: Fonctionnalités (Semaine 3)
1. **Hadith Cards**
   - Migrer vers `ModernHadithCard.tsx`
   - Améliorer la lisibilité
   - Optimiser les interactions

2. **Prayer Widget**
   - Implémenter `ModernPrayerWidget.tsx`
   - Ajouter les animations de compte à rebours
   - Améliorer la géolocalisation

### Phase 4: Polish (Semaine 4)
1. **Micro-interactions**
   - Ajouter des feedbacks visuels subtils
   - Implémenter les états de chargement élégants
   - Optimiser les transitions

2. **Accessibilité**
   - Ajouter les attributs ARIA
   - Tester avec lecteur d'écran
   - Améliorer le contraste

## 🚀 Optimisations Performances

### 1. Bundle Size
```javascript
// Avant
import { motion } from 'framer-motion' // 150KB

// Après
import { motion } from '@/lib/motion' // Tree-shaken, ~40KB
```

### 2. Images
```javascript
// Utiliser next/image avec optimization
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

### 3. Fonts
```javascript
// Précharger les fonts critiques
<link
  rel="preload"
  href="/fonts/Amiri-Regular.ttf"
  as="font"
  type="font/ttf"
  crossorigin
/>
```

### 4. Code Splitting
```javascript
// Lazy load des composants non-critiques
const HadithFilters = dynamic(
  () => import('@/components/hadith/HadithFilters'),
  { ssr: false }
)
```

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Touch Targets
- Minimum 44x44px pour les boutons
- Espacement de 8px minimum entre éléments cliquables

## 🎯 Métriques de Succès

### Performance
- [ ] Lighthouse Score > 95
- [ ] FCP < 1.5s
- [ ] TTI < 3.5s
- [ ] CLS < 0.1

### Accessibilité
- [ ] Score WAVE: 0 erreurs
- [ ] Support clavier complet
- [ ] Contraste WCAG AAA

### UX
- [ ] Taux de rebond < 30%
- [ ] Temps moyen > 5min
- [ ] Pages/session > 3

## 🛠 Outils Recommandés

### Development
- Chrome DevTools Performance
- React DevTools Profiler
- Bundle Analyzer

### Testing
- Jest + React Testing Library
- Cypress pour E2E
- Storybook pour composants

### Monitoring
- Sentry pour les erreurs
- Google Analytics 4
- Hotjar pour heatmaps

## 📚 Ressources

- [Material Design 3](https://m3.material.io/)
- [Islamic Geometric Patterns](https://www.vam.ac.uk/articles/islamic-geometric-design)
- [Web.dev Performance](https://web.dev/performance/)
- [A11y Project](https://www.a11yproject.com/)