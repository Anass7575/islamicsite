'use client'

import { motion } from '@/lib/motion'
import { useInView } from 'react-intersection-observer'
import { useState, useEffect, memo } from 'react'

const stats = [
  { label: 'Active Users', value: 1000, suffix: '+' },
  { label: 'Quran Translations', value: 177, suffix: '' },
  { label: 'Hadith Narrations', value: 16562, suffix: '' },
  { label: 'Languages Supported', value: 177, suffix: '' },
]

const AnimatedCounter = memo(({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true })

  useEffect(() => {
    if (inView) {
      let startTime: number
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
        setCount(Math.floor(progress * end))
        if (progress < 1) {
          window.requestAnimationFrame(step)
        }
      }
      window.requestAnimationFrame(step)
    }
  }, [end, duration, inView])

  return <span ref={ref}>{count.toLocaleString()}</span>
})

AnimatedCounter.displayName = 'AnimatedCounter'

export function StatsSection() {
  return (
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
            Trusted by <span className="text-gradient">Millions</span> Worldwide
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join our growing community of Muslims using Al-Hidaya daily
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8 text-center"
            >
              <p className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                <AnimatedCounter end={stat.value} />
                {stat.suffix}
              </p>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}