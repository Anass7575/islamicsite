'use client'

import { useState, useEffect } from 'react'
import { motion } from '@/lib/motion'
import { FiCalendar, FiClock, FiStar } from '@/lib/icons'
import { format } from 'date-fns'
import { toHijri } from 'hijri-converter'

export function IslamicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hijriDate, setHijriDate] = useState<any | null>(null)

  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhul Qa\'dah', 'Dhul Hijjah'
  ]

  const islamicEvents = {
    '1-1': 'Islamic New Year',
    '1-10': 'Day of Ashura',
    '3-12': 'Mawlid al-Nabi (Birth of Prophet Muhammad)',
    '7-27': 'Isra and Mi\'raj',
    '8-15': 'Laylat al-Bara\'at',
    '9-1': 'First day of Ramadan',
    '9-21': 'Laylat al-Qadr (possible)',
    '9-23': 'Laylat al-Qadr (possible)',
    '9-25': 'Laylat al-Qadr (possible)',
    '9-27': 'Laylat al-Qadr (possible)',
    '9-29': 'Laylat al-Qadr (possible)',
    '10-1': 'Eid al-Fitr',
    '12-9': 'Day of Arafah',
    '12-10': 'Eid al-Adha',
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentDate(now)
      
      const hijri = toHijri(now.getFullYear(), now.getMonth() + 1, now.getDate())
      setHijriDate(hijri)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getUpcomingEvents = () => {
    if (!hijriDate) return []
    
    const events: Array<{date: string; event: string; daysLeft: number; isImportant: boolean}> = []
    const currentMonth = hijriDate.hm
    const currentDay = hijriDate.hd
    
    // Check events in current and next months
    for (let month = currentMonth; month <= currentMonth + 2; month++) {
      const checkMonth = month > 12 ? month - 12 : month
      
      Object.entries(islamicEvents).forEach(([dateKey, eventName]) => {
        const [eventMonth, eventDay] = dateKey.split('-').map(Number)
        
        if (eventMonth === checkMonth) {
          let daysUntil = 0
          
          if (eventMonth === currentMonth && eventDay > currentDay) {
            daysUntil = eventDay - currentDay
          } else if (eventMonth > currentMonth) {
            // Approximate days until event in future month
            daysUntil = (30 - currentDay) + eventDay + ((eventMonth - currentMonth - 1) * 30)
          }
          
          if (daysUntil > 0 && daysUntil <= 90) {
            events.push({
              date: `${islamicMonths[eventMonth - 1]} ${eventDay}`,
              event: eventName,
              daysLeft: daysUntil,
              isImportant: eventName.includes('Eid') || eventName.includes('Ramadan')
            })
          }
        }
      })
    }
    
    return events.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3)
  }

  const getTodayEvent = () => {
    if (!hijriDate) return null
    const key = `${hijriDate.hm}-${hijriDate.hd}`
    return islamicEvents[key as keyof typeof islamicEvents] || null
  }

  const isJumuah = () => {
    return currentDate.getDay() === 5 // Friday
  }

  if (!hijriDate) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card p-8 animate-pulse">
          <div className="h-32 bg-glass-light rounded"></div>
        </div>
        <div className="glass-card p-8 animate-pulse">
          <div className="h-32 bg-glass-light rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-8"
      >
        <div className="flex items-center mb-6">
          <FiCalendar className="w-8 h-8 text-islamic-400 mr-3" />
          <h3 className="text-2xl font-bold">Today's Date</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm">Gregorian</p>
            <p className="text-xl font-semibold">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Hijri</p>
            <p className="text-xl font-semibold text-islamic-400">
              {hijriDate.hd} {islamicMonths[hijriDate.hm - 1]} {hijriDate.hy}
            </p>
          </div>
          <div className="pt-4 border-t border-glass-border">
            <p className="text-gray-400 text-sm mb-2">Today's Significance</p>
            {getTodayEvent() ? (
              <div className="flex items-center gap-2">
                <FiStar className="w-5 h-5 text-gold-400" />
                <p className="text-lg font-semibold text-gold-400">{getTodayEvent()}</p>
              </div>
            ) : isJumuah() ? (
              <div className="flex items-center gap-2">
                <FiStar className="w-5 h-5 text-islamic-400" />
                <p className="text-lg font-semibold text-islamic-400">Jumu'ah (Friday Prayer)</p>
              </div>
            ) : (
              <p className="text-lg">Regular Day</p>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-8"
      >
        <div className="flex items-center mb-6">
          <FiClock className="w-8 h-8 text-gold-400 mr-3" />
          <h3 className="text-2xl font-bold">Upcoming Events</h3>
        </div>
        
        <div className="space-y-4">
          {getUpcomingEvents().map((event, index) => (
            <motion.div
              key={event.event}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`p-4 rounded-xl transition-all duration-300 ${
                event.isImportant 
                  ? 'bg-gradient-to-r from-islamic-600/20 to-gold-600/20 hover:from-islamic-600/30 hover:to-gold-600/30' 
                  : 'bg-glass-light hover:bg-glass-medium'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className={`font-semibold text-lg ${event.isImportant ? 'text-gold-400' : ''}`}>
                    {event.event}
                  </p>
                  <p className="text-gray-400 text-sm">{event.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${event.isImportant ? 'text-gold-400' : 'text-islamic-400'}`}>
                    {event.daysLeft}
                  </p>
                  <p className="text-gray-400 text-sm">days</p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {getUpcomingEvents().length === 0 && (
            <p className="text-gray-400 text-center py-8">No major events in the next 90 days</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}