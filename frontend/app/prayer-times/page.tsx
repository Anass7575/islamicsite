'use client'

import { motion } from '@/lib/motion'
import { FiMapPin, FiSettings, FiBell, FiCalendar } from '@/lib/icons'
import { useState, useEffect } from 'react'

export default function PrayerTimesPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState('Paris, France')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const prayers = [
    { name: 'Fajr', time: '05:23', arabic: 'الفجر', remaining: '2h 15m' },
    { name: 'Sunrise', time: '06:45', arabic: 'الشروق', remaining: '3h 37m' },
    { name: 'Dhuhr', time: '12:45', arabic: 'الظهر', remaining: '9h 37m' },
    { name: 'Asr', time: '15:58', arabic: 'العصر', remaining: '12h 50m' },
    { name: 'Maghrib', time: '18:32', arabic: 'المغرب', remaining: '15h 24m' },
    { name: 'Isha', time: '20:15', arabic: 'العشاء', remaining: '17h 07m' },
  ]

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Prayer Times</span>
          </h1>
          <p className="text-gray-400 text-lg">Stay connected with your prayers</p>
        </motion.div>

        {/* Location & Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FiMapPin className="w-6 h-6 text-islamic-400" />
              <div>
                <p className="font-semibold text-lg">{location}</p>
                <p className="text-sm text-gray-400">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="p-3 rounded-full hover:bg-glass-light transition-colors">
                <FiBell className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full hover:bg-glass-light transition-colors">
                <FiSettings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Current Time Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-12 mb-8 text-center"
        >
          <p className="text-gray-400 mb-2">Current Time</p>
          <p className="text-6xl font-bold text-gradient">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit' 
            })}
          </p>
          <p className="text-xl text-islamic-400 mt-4">Next Prayer: Fajr in 2h 15m</p>
        </motion.div>

        {/* Prayer Times Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {prayers.map((prayer, index) => (
            <motion.div
              key={prayer.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass-card p-6 hover:scale-105 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{prayer.name}</h3>
                  <p className="text-3xl font-arabic text-gold-400">{prayer.arabic}</p>
                </div>
                <p className="text-3xl font-bold">{prayer.time}</p>
              </div>
              <div className="pt-4 border-t border-glass-border">
                <p className="text-sm text-gray-400">Remaining time</p>
                <p className="text-lg font-semibold text-islamic-400">{prayer.remaining}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 mt-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiCalendar className="w-6 h-6 text-gold-400" />
            <h3 className="text-2xl font-bold">Monthly Calendar</h3>
          </div>
          <p className="text-gray-400">View prayer times for the entire month and set custom reminders.</p>
          <button className="glass-button mt-4">View Calendar</button>
        </motion.div>
      </div>
    </div>
  )
}