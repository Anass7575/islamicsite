'use client'

import { motion } from '@/lib/motion'
import { useState, useEffect } from 'react'
import { FiArrowRight, FiPlay } from '@/lib/icons'
import { useTranslation } from 'react-i18next'

const islamicGreetings = [
  { text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Most Gracious, the Most Merciful' },
  { text: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ', translation: 'Peace be upon you and the mercy and blessings of Allah' },
  { text: 'أَهْلًا وَسَهْلًا', translation: 'Welcome' },
]

export function HeroSection() {
  const { t } = useTranslation('common')
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % islamicGreetings.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Parchment texture overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-48 h-48 islamic-ornament"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 islamic-ornament rotate-180"></div>
        <div className="absolute top-1/3 right-20 w-36 h-36 islamic-ornament rotate-90"></div>
        <div className="absolute bottom-1/3 left-20 w-36 h-36 islamic-ornament -rotate-90"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Arabic Greeting with Calligraphic Style */}
        <motion.div
          key={greetingIndex}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-arabic text-gold mb-4 drop-shadow-lg animate-ink-flow">
            {islamicGreetings[greetingIndex].text}
          </h2>
          <p className="text-ink-600 font-manuscript text-xl">
            {islamicGreetings[greetingIndex].translation}
          </p>
        </motion.div>

        {/* Main Heading with Manuscript Style */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-calligraphy font-bold mb-8 text-ink-900"
        >
          <span className="block mb-2">{mounted ? t('hero.welcome') : 'Welcome to'}</span>
          <span className="text-gold drop-shadow-md inline-block relative">
            {mounted ? t('app.name') : 'Al-Hidaya'}
            <motion.span
              className="absolute -top-6 -right-8 text-3xl text-gold"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              ✦
            </motion.span>
          </span>
        </motion.h1>

        {/* Subtitle with Elegant Typography */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-ink-700 font-manuscript mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          {mounted ? t('hero.subtitle') : 'Your spiritual journey starts here'}{' '}
          {mounted ? t('hero.features') : 'with Quran, Hadith, Prayer Times, and more'}
        </motion.p>

        {/* Ornamental Divider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="ornamental-divider"
        />

        {/* CTA Buttons with Calligraphic Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <button className="calligraphy-button group">
            <span className="flex items-center gap-2">
              {mounted ? t('hero.cta.start') : 'Get Started'}
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-4 rounded-sm bg-cream/90 backdrop-blur-sm border-2 border-gold/50 hover:border-gold text-ink-700 font-manuscript font-semibold transition-all duration-300 group shadow-sm hover:shadow-md"
          >
            <FiPlay className="w-5 h-5 text-gold group-hover:text-burnt-sienna transition-colors" />
            <span>{mounted ? t('hero.cta.demo') : 'Watch Demo'}</span>
          </motion.button>
        </motion.div>

        {/* Feature Pills with Manuscript Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex flex-wrap gap-4 justify-center"
        >
          {['Quran with 50+ Translations', 'Accurate Prayer Times', '40,000+ Hadith', 'Live Qibla Compass'].map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="manuscript-card px-6 py-3 rounded-sm text-sm hover:scale-105 transition-transform cursor-pointer relative"
            >
              <span className="text-ink-700 font-manuscript">{feature}</span>
              <span className="absolute -top-2 -right-2 text-gold text-xs">◈</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator with Quill Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gold text-3xl animate-quill-write"
          >
            ◆
          </motion.div>
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-ink-600 text-sm font-manuscript mt-2"
          >
            Scroll
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}