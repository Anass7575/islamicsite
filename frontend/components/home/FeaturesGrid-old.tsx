'use client'

import { motion } from '@/lib/motion'
import { FiBook, FiCompass, FiCalendar, FiDollarSign, FiMessageCircle, FiMapPin } from '@/lib/icons'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, memo } from 'react'

export const FeaturesGrid = memo(() => {
  const { t } = useTranslation('common')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const features = [
    {
      icon: FiBook,
      titleKey: 'features.quran.title',
      descriptionKey: 'features.quran.description',
      href: '/quran',
      ornament: '۞',
    },
    {
      icon: FiBook,
      titleKey: 'features.hadith.title',
      descriptionKey: 'features.hadith.description',
      href: '/hadith',
      ornament: '❦',
    },
    {
      icon: FiCompass,
      titleKey: 'features.qibla.title',
      descriptionKey: 'features.qibla.description',
      href: '/qibla',
      ornament: '◈',
    },
    {
      icon: FiCalendar,
      titleKey: 'features.calendar.title',
      descriptionKey: 'features.calendar.description',
      href: '/calendar',
      ornament: '◆',
    },
    {
      icon: FiDollarSign,
      titleKey: 'features.zakat.title',
      descriptionKey: 'features.zakat.description',
      href: '/zakat',
      ornament: '✦',
    },
    {
      icon: FiMessageCircle,
      titleKey: 'features.aiChat.title',
      descriptionKey: 'features.aiChat.description',
      href: '/chat',
      ornament: '✧',
    },
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.a
          key={feature.href}
          href={feature.href}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="manuscript-card p-8 group hover:scale-[1.03] transition-all duration-500 relative illuminated-corner"
        >
          {/* Ornamental decoration */}
          <div className="absolute top-4 right-4 text-4xl text-gold opacity-30 group-hover:opacity-50 transition-opacity">
            {feature.ornament}
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="w-16 h-16 rounded-sm bg-gradient-to-br from-gold to-burnt-sienna flex items-center justify-center mb-6 shadow-md relative"
          >
            <feature.icon className="w-8 h-8 text-cream" />
            {/* Golden glow effect */}
            <div className="absolute inset-0 rounded-sm bg-gold opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
          </motion.div>
          
          <h3 className="text-2xl font-calligraphy font-bold mb-3 text-ink-900 group-hover:text-ink-700 transition-all">
            {mounted ? t(feature.titleKey) : 'Loading...'}
          </h3>
          
          <p className="text-ink-600 group-hover:text-ink-700 font-manuscript text-lg leading-relaxed transition-colors">
            {mounted ? t(feature.descriptionKey) : 'Loading...'}
          </p>
          
          {/* Subtle ink stroke animation on hover */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
        </motion.a>
      ))}
    </div>
  )
})

FeaturesGrid.displayName = 'FeaturesGrid'