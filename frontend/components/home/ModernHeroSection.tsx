'use client'

import { motion, useScroll, useTransform } from '@/lib/motion'
import { useState, useEffect } from 'react'
import { FiArrowRight, FiPlay, FiBook, FiClock, FiCompass } from '@/lib/icons'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'

const features = [
  { icon: FiBook, label: 'Quran & Hadith', count: '50,000+' },
  { icon: FiClock, label: 'Prayer Times', count: 'Accurate' },
  { icon: FiCompass, label: 'Qibla Direction', count: 'Live' },
]

export function ModernHeroSection() {
  const { t } = useTranslation('common')
  const [mounted, setMounted] = useState(false)
  const { scrollY } = useScroll()
  
  // Parallax effect
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating Geometric Shapes */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-20 left-10 w-32 h-32 opacity-5"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="currentColor" />
        </svg>
      </motion.div>
      
      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-20 right-10 w-40 h-40 opacity-5"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="50" cy="50" r="15" fill="currentColor" />
        </svg>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-10 max-w-5xl mx-auto text-center"
      >
        {/* Minimalist Arabic Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-arabic text-accent-gold mb-2">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h2>
          <p className="text-primary-500 text-sm">
            In the name of Allah, the Most Gracious, the Most Merciful
          </p>
        </motion.div>

        {/* Main Heading - Clean Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6"
        >
          <span className="block text-primary-900 mb-2">
            {mounted ? t('hero.welcome') : 'Welcome to'}
          </span>
          <span className="text-gradient-gold relative inline-block">
            Al-Hidaya
            <motion.span
              className="absolute -top-2 -right-2 w-4 h-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 24 24" className="w-full h-full text-accent-gold">
                <path fill="currentColor" d="M12,2L14.4,9.6L22,12L14.4,14.4L12,22L9.6,14.4L2,12L9.6,9.6L12,2Z" />
              </svg>
            </motion.span>
          </span>
        </motion.h1>

        {/* Subtitle - Concise */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-primary-500 mb-12 max-w-2xl mx-auto"
        >
          {mounted ? t('hero.subtitle') : 'Your complete Islamic companion for daily spiritual guidance'}
        </motion.p>

        {/* CTA Buttons - Minimal Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link href="/quran" className="btn btn-primary group">
            <span className="flex items-center gap-2">
              {mounted ? t('hero.cta.explore') : 'Explore Quran'}
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
          
          <button className="btn btn-secondary flex items-center gap-3">
            <FiPlay className="w-5 h-5" />
            <span>{mounted ? t('hero.cta.demo') : 'Watch Demo'}</span>
          </button>
        </motion.div>

        {/* Feature Cards - Minimalist Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="card text-center hover-lift cursor-pointer group"
            >
              <feature.icon className="w-8 h-8 mx-auto mb-4 text-accent-green group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-lg mb-1">{feature.label}</h3>
              <p className="text-primary-500 text-sm">{feature.count}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator - Subtle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-primary-300 rounded-full p-1"
          >
            <motion.div 
              className="w-1 h-2 bg-primary-500 rounded-full mx-auto"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}