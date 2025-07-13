'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from '@/lib/motion'
import { FiGlobe, FiSearch, FiCheck, FiChevronDown } from '@/lib/icons'
import { supportedLanguages, changeLanguage } from '@/lib/i18n'

const popularLanguages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' }
]

export function LanguageSelector() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredLanguages = supportedLanguages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentLanguage = supportedLanguages.find(lang => lang.code === i18n.language) || supportedLanguages[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Removed autofocus to avoid confusion

  const handleLanguageChange = async (langCode: string) => {
    try {
      // Use the changeLanguage helper from i18n
      await changeLanguage(langCode)
      
      
      setIsOpen(false)
      setSearchTerm('')
    } catch (error) {
      console.error('Error changing language:', error)
    }
  }

  // Show placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 
                   border border-white/10 hover:border-white/20 transition-all group"
        aria-label="Select language"
      >
        <FiGlobe className="h-5 w-5 text-white" />
        <span className="text-sm font-medium text-white">Language</span>
        <FiChevronDown className="h-4 w-4 text-white" />
      </button>
    )
  }

  return (
    <>
      {/* Dark overlay when dropdown is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg 
                     border transition-all group
                     ${isOpen 
                       ? 'bg-white/20 border-white/30 text-white' 
                       : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'}`}
          aria-label="Select language"
          title="Changer de langue"
        >
          <span className="text-xl">{currentLanguage.flag}</span>
          <span className="text-sm font-medium text-white">{currentLanguage.name}</span>
          <FiChevronDown className={`h-4 w-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 z-[9999]"
            >
              <div className="bg-white text-black rounded-xl shadow-2xl border-2 border-gray-300 overflow-hidden">
                {/* Popular Languages - Direct Selection */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 font-semibold">
                    Langues populaires
                  </p>
                  <div className="space-y-1">
                    {popularLanguages.map((lang) => {
                      const langData = supportedLanguages.find(l => l.code === lang.code) || lang
                      const isSelected = i18n.language === lang.code
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                   transition-all duration-200 text-left group
                                   ${isSelected 
                                     ? 'bg-emerald-500 text-white' 
                                     : 'hover:bg-emerald-100 text-gray-800 hover:translate-x-1'}`}
                        >
                          <span className="text-2xl">{langData.flag}</span>
                          <span className="font-medium">
                            {langData.name}
                          </span>
                          {isSelected && (
                            <FiCheck className="text-white h-5 w-5 ml-auto" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Search Bar - Optional */}
                <div className="px-4 py-3 bg-white border-b border-gray-200">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Rechercher parmi 193 langues..."
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg
                               focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200
                               text-black placeholder-gray-500 text-sm"
                    />
                  </div>
                </div>

                {/* All Languages - Scrollable List */}
                <div className="max-h-60 overflow-y-auto px-2 py-2 bg-white">
                  {searchTerm && (
                    <p className="text-xs text-gray-600 uppercase tracking-wider px-2 pb-2">
                      Résultats de recherche
                    </p>
                  )}
                  {filteredLanguages.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Aucune langue trouvée</p>
                  ) : (
                    filteredLanguages.map((lang) => {
                      const isSelected = i18n.language === lang.code
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full px-3 py-2.5 flex items-center gap-3 rounded-lg
                                   transition-all duration-200 text-left group
                                   ${isSelected 
                                     ? 'bg-emerald-500 text-white' 
                                     : 'hover:bg-gray-100 text-gray-800'}`}
                        >
                          <span className="text-xl">{lang.flag}</span>
                          <div className="flex-1 text-left">
                            <p className="font-medium">
                              {lang.name}
                            </p>
                          </div>
                          {isSelected && (
                            <FiCheck className="text-white h-5 w-5" />
                          )}
                        </button>
                      )
                    })
                  )}
                </div>

                {/* Language Count */}
                <div className="p-3 border-t border-gray-200 bg-gray-50 text-center text-gray-600 text-sm">
                  {filteredLanguages.length} sur {supportedLanguages.length} langues
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}