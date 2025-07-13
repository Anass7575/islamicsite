'use client'

import { motion } from '@/lib/motion'
import { format } from 'date-fns'
import { IslamicPatterns } from '@/components/ui/IslamicPatterns'
import { FiSunrise, FiSun, FiCloudRain, FiSunset, FiMoon, FiAlertCircle } from '@/lib/icons'

interface PrayerCardProps {
  name: string
  arabicName: string
  time: string
  isActive?: boolean
  isNext?: boolean
  icon?: React.ReactNode
  index: number
}

const prayerIcons = {
  Fajr: <FiSunrise className="w-6 h-6" />,
  Dhuhr: <FiSun className="w-6 h-6" />,
  Asr: <FiCloudRain className="w-6 h-6" />,
  Maghrib: <FiSunset className="w-6 h-6" />,
  Isha: <FiMoon className="w-6 h-6" />,
}

export function PrayerCard({ 
  name, 
  arabicName, 
  time, 
  isActive = false, 
  isNext = false,
  icon,
  index 
}: PrayerCardProps) {
  const displayIcon = icon || prayerIcons[name as keyof typeof prayerIcons] || <FiAlertCircle className="w-6 h-6" />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={`
        prayer-card relative overflow-hidden group
        ${isActive ? 'active shadow-emerald' : ''}
        ${isNext ? 'border-emerald-deep/50' : ''}
      `}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <IslamicPatterns.GeometricPattern />
      </div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-light to-emerald-deep"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div 
            className={`
              p-3 rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-white/20 text-white' 
                : 'bg-emerald-deep/10 text-emerald-deep group-hover:bg-emerald-deep/20'
              }
            `}
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            {displayIcon}
          </motion.div>
          
          <div>
            <h3 className={`font-semibold text-lg ${isActive ? 'text-white' : ''}`}>
              {name}
            </h3>
            <p className={`arabic text-2xl ${isActive ? 'text-white/90' : 'text-gold-soft'}`}>
              {arabicName}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={`prayer-time ${isActive ? 'text-white' : 'text-emerald-deep'}`}>
            {time}
          </p>
          {isNext && !isActive && (
            <motion.p 
              className="text-sm text-gold-soft mt-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Next Prayer
            </motion.p>
          )}
        </div>
      </div>

      {/* Hover effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
        whileHover={{ translateX: 0 }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  )
}

// Prayer times container with decorative frame
export function PrayerTimesContainer({ children }: { children: React.ReactNode }) {
  return (
    <IslamicPatterns.DecorativeFrame>
      <div className="space-y-4">
        {children}
      </div>
    </IslamicPatterns.DecorativeFrame>
  )
}