'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from '@/lib/motion'
import { FiSearch } from '@/lib/icons'
import { surahsData } from '@/data/surahs'
import { useDebounce } from '@/hooks/useDebounce'

export function QuranPageClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'meccan' | 'medinan'>('all')
  const [mounted, setMounted] = useState(false)
  
  // Debounce search query to avoid filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredSurahs = useMemo(() => {
    return surahsData.filter(surah => {
      const matchesSearch = 
        surah.name.includes(debouncedSearchQuery) ||
        surah.englishName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        surah.englishNameTranslation.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        surah.number.toString().includes(debouncedSearchQuery)
      
      const matchesType = 
        filterType === 'all' || 
        (filterType === 'meccan' && surah.revelationType === 'Meccan') ||
        (filterType === 'medinan' && surah.revelationType === 'Medinan')
      
      return matchesSearch && matchesType
    })
  }, [debouncedSearchQuery, filterType])

  // Update visibility of surah cards based on filter
  useEffect(() => {
    if (mounted) {
      const surahsGrid = document.getElementById('surahs-grid')
      if (surahsGrid) {
        const surahCards = surahsGrid.children
        const filteredNumbers = new Set(filteredSurahs.map(s => s.number))

        Array.from(surahCards).forEach((card) => {
          const link = card as HTMLAnchorElement
          const surahNumber = parseInt(link.href.split('/').pop() || '0')
          
          if (searchQuery || filterType !== 'all') {
            if (filteredNumbers.has(surahNumber)) {
              link.style.display = 'block'
            } else {
              link.style.display = 'none'
            }
          } else {
            link.style.display = 'block'
          }
        })
      }
    }
  }, [filteredSurahs, debouncedSearchQuery, filterType, mounted])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-card p-6 mb-8"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search surah by name, number or translation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-glass-light border border-glass-border focus:border-islamic-400 focus:outline-none transition-colors"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filterType === 'all' 
                ? 'bg-islamic-500 text-white' 
                : 'glass-card hover:bg-glass-light'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('meccan')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filterType === 'meccan' 
                ? 'bg-islamic-500 text-white' 
                : 'glass-card hover:bg-glass-light'
            }`}
          >
            Meccan
          </button>
          <button
            onClick={() => setFilterType('medinan')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              filterType === 'medinan' 
                ? 'bg-islamic-500 text-white' 
                : 'glass-card hover:bg-glass-light'
            }`}
          >
            Medinan
          </button>
        </div>
      </div>
      
      {mounted && filteredSurahs.length === 0 && (searchQuery || filterType !== 'all') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 mt-4"
        >
          <p className="text-gray-400 text-lg">No surahs found matching your search.</p>
        </motion.div>
      )}
    </motion.div>
  )
}