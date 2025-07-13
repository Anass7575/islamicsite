'use client'

import { useState } from 'react'
import { motion } from '@/lib/motion'
import { FiCalendar, FiChevronLeft, FiChevronRight } from '@/lib/icons'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns'
import { toHijri } from 'hijri-converter'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhul Qa\'dah', 'Dhul Hijjah'
  ]
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startingDayOfWeek = getDay(monthStart)
  
  const hijriDate = toHijri(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())
  
  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  
  const isHolyDay = (day: Date) => {
    const hijri = toHijri(day.getFullYear(), day.getMonth() + 1, day.getDate())
    const holyDays = [
      { month: 1, day: 10 }, // Ashura
      { month: 3, day: 12 }, // Mawlid
      { month: 7, day: 27 }, // Isra Miraj
      { month: 9, day: 27 }, // Laylat al-Qadr
      { month: 10, day: 1 }, // Eid al-Fitr
      { month: 12, day: 10 }, // Eid al-Adha
    ]
    
    return holyDays.some(hd => hd.month === hijri.hm && hd.day === hijri.hd)
  }
  
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">Islamic Calendar</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Track Islamic dates and important events
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-8"
        >
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={previousMonth}
              className="p-3 rounded-full hover:bg-glass-light transition-colors"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <p className="text-islamic-400">
                {islamicMonths[hijriDate.hm - 1]} {hijriDate.hy}
              </p>
            </div>
            
            <button
              onClick={nextMonth}
              className="p-3 rounded-full hover:bg-glass-light transition-colors"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={`text-center text-sm font-semibold py-2 ${
                day === 'Fri' ? 'text-islamic-400' : 'text-gray-400'
              }`}>
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array(startingDayOfWeek).fill(null).map((_, index) => (
              <div key={`empty-${index}`} className="h-24"></div>
            ))}
            
            {days.map(day => {
              const hijri = toHijri(day.getFullYear(), day.getMonth() + 1, day.getDate())
              const isFriday = getDay(day) === 5
              const holy = isHolyDay(day)
              
              return (
                <motion.div
                  key={day.toString()}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`glass-card p-3 h-24 cursor-pointer transition-all ${
                    isToday(day) ? 'ring-2 ring-gold-400' : ''
                  } ${holy ? 'bg-gradient-to-br from-islamic-600/20 to-gold-600/20' : ''}`}
                >
                  <div className="flex flex-col h-full">
                    <div className={`text-lg font-semibold ${
                      isFriday ? 'text-islamic-400' : ''
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {hijri.hd}
                    </div>
                    {holy && (
                      <div className="text-xs text-gold-400 mt-auto">
                        Event
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}