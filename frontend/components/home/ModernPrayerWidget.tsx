'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from '@/lib/motion'
import { FiSunrise, FiSun, FiCloudSnow, FiSunset, FiMoon, FiMapPin, FiRefreshCw } from '@/lib/icons'
import { axios } from '@/lib/fetch'
import { logger } from '@/lib/logger'
import { useTranslation } from 'react-i18next'

interface PrayerTime {
  name: string
  time: string
  icon: any
  arabic: string
}

// Individual Prayer Card Component
const PrayerTimeCard = memo(({ 
  prayer, 
  isNext, 
  isActive,
  index 
}: { 
  prayer: PrayerTime
  isNext: boolean
  isActive: boolean
  index: number 
}) => {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={`prayer-card ${isNext ? 'prayer-card-active' : ''} ${
        isActive ? 'ring-2 ring-accent-green ring-opacity-50' : ''
      }`}
    >
      {/* Prayer Icon */}
      <div className={`mb-4 ${isNext ? 'text-accent-green' : 'text-primary-500'}`}>
        <prayer.icon className="w-10 h-10 mx-auto" />
      </div>
      
      {/* Prayer Name */}
      <h3 className={`font-semibold text-lg mb-1 ${
        isNext ? 'text-accent-green' : 'text-primary-900'
      }`}>
        {prayer.name}
      </h3>
      
      {/* Arabic Name */}
      <p className="text-accent-gold font-arabic text-xl mb-2" dir="rtl">
        {prayer.arabic}
      </p>
      
      {/* Prayer Time */}
      <p className={`text-2xl font-bold ${
        isNext ? 'text-accent-green' : 'text-primary-700'
      }`}>
        {prayer.time}
      </p>
      
      {/* Active Indicator */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2"
        >
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-green"></span>
          </span>
        </motion.div>
      )}
      
      {/* Next Prayer Badge */}
      {isNext && !isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 bg-accent-green text-white text-xs px-2 py-1 rounded-full"
        >
          Next
        </motion.div>
      )}
    </motion.div>
  )
})

PrayerTimeCard.displayName = 'PrayerTimeCard'

// Countdown Timer Component
const NextPrayerCountdown = ({ nextPrayer, nextPrayerTime }: { 
  nextPrayer: string
  nextPrayerTime: string 
}) => {
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const [hours, minutes] = nextPrayerTime.split(':').map(Number)
      const prayerDate = new Date()
      prayerDate.setHours(hours, minutes, 0, 0)
      
      if (prayerDate < now) {
        prayerDate.setDate(prayerDate.getDate() + 1)
      }
      
      const diff = prayerDate.getTime() - now.getTime()
      const hoursRemaining = Math.floor(diff / (1000 * 60 * 60))
      const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeRemaining(`${hoursRemaining}h ${minutesRemaining}m`)
    }

    calculateTimeRemaining()
    const timer = setInterval(calculateTimeRemaining, 60000)
    
    return () => clearInterval(timer)
  }, [nextPrayerTime])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-3 px-4 bg-accent-green bg-opacity-10 rounded-xl"
    >
      <p className="text-sm text-primary-500">Time until {nextPrayer}</p>
      <p className="text-lg font-bold text-accent-green">{timeRemaining}</p>
    </motion.div>
  )
}

export function ModernPrayerWidget() {
  const { t } = useTranslation('prayer')
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([])
  const [location, setLocation] = useState<string>('Loading...')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [nextPrayerIndex, setNextPrayerIndex] = useState<number>(-1)
  const [activePrayerIndex, setActivePrayerIndex] = useState<number>(-1)

  const prayerIcons = {
    Fajr: { icon: FiSunrise, arabic: 'الفجر' },
    Dhuhr: { icon: FiSun, arabic: 'الظهر' },
    Asr: { icon: FiCloudSnow, arabic: 'العصر' },
    Maghrib: { icon: FiSunset, arabic: 'المغرب' },
    Isha: { icon: FiMoon, arabic: 'العشاء' },
  }

  const updatePrayerTimes = useCallback((timings: any) => {
    const prayers: PrayerTime[] = Object.entries(timings)
      .filter(([name]) => ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(name))
      .map(([name, time]) => ({
        name,
        time: time as string,
        icon: prayerIcons[name as keyof typeof prayerIcons].icon,
        arabic: prayerIcons[name as keyof typeof prayerIcons].arabic,
      }))
    
    setPrayerTimes(prayers)
    
    // Calculate next and active prayer
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    let nextIdx = -1
    let activeIdx = -1
    let minDiff = Infinity
    
    prayers.forEach((prayer, index) => {
      const [hours, minutes] = prayer.time.split(':').map(Number)
      const prayerMinutes = hours * 60 + minutes
      const diff = prayerMinutes - currentMinutes
      
      if (diff > 0 && diff < minDiff) {
        minDiff = diff
        nextIdx = index
      }
      
      // Check if this prayer is currently active (within last hour)
      if (diff <= 0 && diff > -60) {
        activeIdx = index
      }
    })
    
    // If no next prayer today, next is Fajr
    if (nextIdx === -1) nextIdx = 0
    
    setNextPrayerIndex(nextIdx)
    setActivePrayerIndex(activeIdx)
    setLoading(false)
    setError(false)
  }, [])

  const fetchPrayerTimes = useCallback(async (latitude?: number, longitude?: number) => {
    try {
      setLoading(true)
      let url = 'https://api.aladhan.com/v1/timingsByCity?city=Paris&country=France&method=2'
      
      if (latitude && longitude) {
        url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
      }
      
      const response = await axios.get(url)
      const timings = response.data.data.timings
      const meta = response.data.data.meta
      
      setLocation(latitude && longitude ? meta.timezone : 'Paris, France')
      updatePrayerTimes(timings)
    } catch (error) {
      logger.error('Error fetching prayer times:', error)
      setError(true)
      setLoading(false)
    }
  }, [updatePrayerTimes])

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          fetchPrayerTimes(latitude, longitude)
        },
        () => {
          fetchPrayerTimes() // Fallback to Paris
        },
        { timeout: 5000 }
      )
    } else {
      fetchPrayerTimes() // Fallback to Paris
    }
  }, [fetchPrayerTimes])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-primary-100 bg-opacity-50 rounded animate-pulse" />
          <div className="h-6 w-24 bg-primary-100 bg-opacity-50 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-primary-100 bg-opacity-50" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-primary-500 mb-4">Unable to load prayer times</p>
        <button 
          onClick={() => fetchPrayerTimes()}
          className="btn btn-secondary inline-flex items-center gap-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary-500">
          <FiMapPin className="w-5 h-5" />
          <span className="font-medium">{location}</span>
        </div>
        <button
          onClick={() => fetchPrayerTimes()}
          className="p-2 rounded-lg hover:bg-primary-100 hover:bg-opacity-10 transition-colors"
          title="Refresh prayer times"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {/* Next Prayer Countdown */}
      {nextPrayerIndex !== -1 && (
        <NextPrayerCountdown 
          nextPrayer={prayerTimes[nextPrayerIndex].name}
          nextPrayerTime={prayerTimes[nextPrayerIndex].time}
        />
      )}
      
      {/* Prayer Times Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {prayerTimes.map((prayer, index) => (
          <PrayerTimeCard
            key={prayer.name}
            prayer={prayer}
            isNext={index === nextPrayerIndex && activePrayerIndex === -1}
            isActive={index === activePrayerIndex}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}