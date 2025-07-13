'use client'

import dynamic from 'next/dynamic'
import { ComponentType, ReactNode } from 'react'
import { motion } from 'framer-motion'

// Loading component with Islamic pattern
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px] relative">
    <div className="absolute inset-0 bg-gradient-to-br from-islamic-800/20 to-islamic-900/20 rounded-xl" />
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="w-16 h-16"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d="M50 10 L61 35 L90 35 L68 52 L79 77 L50 60 L21 77 L32 52 L10 35 L39 35 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-islamic-500"
        />
      </svg>
    </motion.div>
  </div>
)

// Create lazy loaded component with custom loading
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  return dynamic(importFunc, {
    loading: () => fallback ? <>{fallback}</> : <LoadingFallback />,
    ssr: true
  })
}

// TODO: Implement these feature components
/*
// Pre-built lazy components for common features
export const LazyQuranReader = createLazyComponent(
  () => import('../features/QuranReader')
)

export const LazyHadithExplorer = createLazyComponent(
  () => import('../features/HadithExplorer')
)

export const LazyPrayerTimes = createLazyComponent(
  () => import('../features/PrayerTimes')
)

export const LazyQiblaCompass = createLazyComponent(
  () => import('../features/QiblaCompass')
)

export const LazyZakatCalculator = createLazyComponent(
  () => import('../features/ZakatCalculator')
)

export const LazyIslamicCalendar = createLazyComponent(
  () => import('../features/IslamicCalendar')
)

// Lazy load heavy third-party libraries
export const LazyMapComponent = createLazyComponent(
  () => import('../features/MapComponent').then(mod => ({ default: mod.MapComponent }))
)

export const LazyChartComponent = createLazyComponent(
  () => import('../features/ChartComponent').then(mod => ({ default: mod.ChartComponent }))
)

// Utility to preload components
export const preloadComponent = (componentName: string) => {
  switch (componentName) {
    case 'QuranReader':
      import('../features/QuranReader')
      break
    case 'HadithExplorer':
      import('../features/HadithExplorer')
      break
    case 'PrayerTimes':
      import('../features/PrayerTimes')
      break
    // Add more cases as needed
  }
}

// Route-based code splitting configuration
export const routeComponents = {
  '/quran': LazyQuranReader,
  '/hadith': LazyHadithExplorer,
  '/prayer-times': LazyPrayerTimes,
  '/qibla': LazyQiblaCompass,
  '/zakat': LazyZakatCalculator,
  '/calendar': LazyIslamicCalendar,
}
*/