'use client'

import { motion } from '@/lib/motion'
import Link from 'next/link'
import { IslamicPatterns, Bismillah } from '@/components/ui/IslamicPatterns'
import { FiBookOpen, FiCalendar, FiHeart } from '@/lib/icons'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96">
          <IslamicPatterns.GeometricPattern />
        </div>
        <div className="absolute bottom-0 right-0 w-96 h-96 transform rotate-45">
          <IslamicPatterns.StarPattern />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
          <IslamicPatterns.ArabesquePattern />
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-deep/5 via-transparent to-gold-soft/5" />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Bismillah */}
          <Bismillah className="mb-12" />

          {/* Main heading */}
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-gradient block mb-4">Al-Hidaya</span>
            <span className="text-2xl md:text-3xl lg:text-4xl text-[var(--text-secondary)] font-normal">
              Your Path to Islamic Knowledge
            </span>
          </motion.h1>

          {/* Arabic subtitle */}
          <motion.p 
            className="arabic-display text-gold-soft text-3xl md:text-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            الهداية - طريقك إلى المعرفة الإسلامية
          </motion.p>

          {/* Description */}
          <motion.p 
            className="text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Immerse yourself in the beauty of Islamic teachings through authentic sources, 
            beautiful recitations, and a community dedicated to spiritual growth.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link href="/quran" className="btn btn-primary hover-float group">
              <FiBookOpen className="mr-2 group-hover:animate-breathe" />
              Explore Quran
            </Link>
            <Link href="/prayer-times" className="btn btn-secondary hover-float group">
              <FiCalendar className="mr-2 group-hover:animate-breathe" />
              Prayer Times
            </Link>
            <Link href="/hadith" className="btn btn-outline hover-float group">
              <FiHeart className="mr-2 group-hover:animate-breathe" />
              Hadith Collection
            </Link>
          </motion.div>

        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-deep/10 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold-soft/10 rounded-full blur-3xl"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-emerald-deep/30 rounded-full p-1">
          <div className="w-1 h-3 bg-emerald-deep/50 rounded-full mx-auto animate-bounce" />
        </div>
      </motion.div>
    </section>
  )
}