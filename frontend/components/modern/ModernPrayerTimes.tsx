'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiLocationMarker, HiClock } from 'react-icons/hi'

interface PrayerTime {
  name: string
  time: string
  isNext?: boolean
  isPassed?: boolean
}

export function ModernPrayerTimes() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState('Loading...')
  
  // Mock prayer times - replace with actual API
  const prayerTimes: PrayerTime[] = [
    { name: 'Fajr', time: '05:23', isPassed: true },
    { name: 'Dhuhr', time: '12:45', isPassed: true },
    { name: 'Asr', time: '15:58', isNext: true },
    { name: 'Maghrib', time: '18:34' },
    { name: 'Isha', time: '20:15' },
  ]

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    setLocation('New York, USA') // Mock location
    return () => clearInterval(timer)
  }, [])

  const nextPrayer = prayerTimes.find(p => p.isNext)
  const timeToNext = nextPrayer ? '1h 23m' : '--' // Mock calculation

  return (
    <div className="w-full max-w-4xl mx-auto">
      <ModernCard hover={false} className="overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Prayer Times
            </h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <HiLocationMarker className="w-4 h-4 mr-1" />
              {location}
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Next Prayer Highlight */}
        {nextPrayer && (
          <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-primary-600 dark:text-primary-400 mb-1">
                  Next Prayer
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {nextPrayer.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {nextPrayer.time}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  in {timeToNext}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prayer Times Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {prayerTimes.map((prayer, index) => (
            <motion.div
              key={prayer.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-4 rounded-lg text-center transition-all
                ${prayer.isNext 
                  ? 'bg-primary-500 text-white shadow-lg scale-105' 
                  : prayer.isPassed
                  ? 'bg-gray-100 dark:bg-gray-800 opacity-60'
                  : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <div className={`text-sm font-medium mb-1 ${
                prayer.isNext ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {prayer.name}
              </div>
              <div className={`text-lg font-bold ${
                prayer.isNext ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                {prayer.time}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Day Progress</span>
            <span>65%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600"
            />
          </div>
        </div>
      </ModernCard>
    </div>
  )
}

// Compact Prayer Widget for Hero Section
export function PrayerTimesMini() {
  const nextPrayer = { name: 'Asr', time: '15:58', timeLeft: '1h 23m' }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="inline-flex items-center space-x-3 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-full shadow-lg"
    >
      <HiClock className="w-5 h-5 text-primary-500" />
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600 dark:text-gray-400">Next:</span>
        <span className="font-semibold text-gray-900 dark:text-white">{nextPrayer.name}</span>
        <span className="text-primary-600 dark:text-primary-400 font-medium">{nextPrayer.time}</span>
      </div>
    </motion.div>
  )
}

// Import the ModernCard component
function ModernCard({ children, hover = true, className = '' }: { 
  children: React.ReactNode
  hover?: boolean 
  className?: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4 } : {}}
      className={`card ${className}`}
    >
      {children}
    </motion.div>
  )
}