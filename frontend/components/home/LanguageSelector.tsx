'use client'

import { motion } from '@/lib/motion'
import { useState } from 'react'

const languages = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
]

export function LanguageSelector() {
  const [selectedLang, setSelectedLang] = useState('en')
  const [showAll, setShowAll] = useState(false)

  const displayedLanguages = showAll ? languages : languages.slice(0, 8)

  return (
    <div className="text-center">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {displayedLanguages.map((lang, index) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => setSelectedLang(lang.code)}
            className={`glass-card p-4 hover:scale-105 transition-all duration-300 ${
              selectedLang === lang.code ? 'ring-2 ring-islamic-400' : ''
            }`}
          >
            <span className="text-3xl mb-2 block">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
          </motion.button>
        ))}
      </div>
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        onClick={() => setShowAll(!showAll)}
        className="mt-8 text-islamic-400 hover:text-islamic-300 transition-colors font-medium"
      >
        {showAll ? 'Show Less' : 'View All 193 Languages →'}
      </motion.button>
    </div>
  )
}