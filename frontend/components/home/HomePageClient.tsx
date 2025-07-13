'use client'

import { motion } from '@/lib/motion'
import dynamic from 'next/dynamic'
import { QuranVerse } from './QuranVerse'

// Import components directly without lazy loading for now
import { PrayerTimesWidget } from './PrayerTimesWidget'
import { LanguageSelector } from './LanguageSelector'
import { TestimonialsSection } from './TestimonialsSection'

// Fix IslamicCalendar import
const IslamicCalendar = dynamic(
  () => import('./IslamicCalendar').then((mod) => mod.IslamicCalendar || mod.default),
  {
    loading: () => <div className="skeleton h-64 w-full rounded-2xl" />,
    ssr: false
  }
)

export function HomePageClient() {
  return (
    <>
      {/* Quick Access Prayer Times */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Never Miss a Prayer</span>
            </h2>
            <p className="text-gray-600 font-medium text-lg max-w-2xl mx-auto">
              Accurate prayer times for your location with beautiful adhan notifications
            </p>
          </motion.div>
          <PrayerTimesWidget />
        </div>
      </section>

      {/* Daily Verse Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <QuranVerse />
          </motion.div>
        </div>
      </section>

      {/* Islamic Calendar */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <IslamicCalendar />
          </motion.div>
        </div>
      </section>

      {/* Language Support */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Available in <span className="text-gradient">177 Languages</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Making Islamic knowledge accessible to everyone, everywhere
            </p>
            <LanguageSelector />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />
    </>
  )
}