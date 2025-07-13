'use client'

import { useState, useEffect } from 'react'
import { motion } from '@/lib/motion'
import { FiSearch, FiFilter, FiGrid, FiList } from '@/lib/icons'
import { hadithCategories } from '@/data/hadithCollections'
import Link from 'next/link'
import { hadithApi } from '@/services/api'
import { useDebounce } from '@/hooks/useDebounce'
import { logger } from '@/lib/logger'

export function HadithPageClient() {
  const [activeTab, setActiveTab] = useState<'collections' | 'categories' | 'search'>('collections')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Search hadiths when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.length > 2) {
      searchHadiths(debouncedSearchQuery)
    } else {
      setSearchResults([])
    }
  }, [debouncedSearchQuery])

  const searchHadiths = async (query: string) => {
    try {
      setSearchLoading(true)
      const response = await hadithApi.searchHadith(query)
      setSearchResults(Array.isArray(response) ? response : [])
    } catch (err) {
      logger.error('Search failed', err)
    } finally {
      setSearchLoading(false)
    }
  }

  // Hide/show collections based on active tab
  useEffect(() => {
    if (mounted) {
      const collectionsGrid = document.getElementById('collections-grid')
      if (collectionsGrid) {
        if (activeTab === 'collections') {
          collectionsGrid.style.display = 'grid'
        } else {
          collectionsGrid.style.display = 'none'
        }
      }
    }
  }, [activeTab, mounted])

  return (
    <>
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass-card p-6 mb-8"
      >
        <div className="flex items-center gap-4">
          <FiSearch className="w-6 h-6 text-gray-400" />
          <input
            type="text"
            placeholder="Search hadith by keyword, narrator, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
            onFocus={() => setActiveTab('search')}
          />
          <button className="p-2 rounded-lg hover:bg-glass-light transition-colors">
            <FiFilter className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'collections' 
                ? 'bg-islamic-500 text-white' 
                : 'glass-card hover:bg-glass-light'
            }`}
          >
            Collections
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'categories' 
                ? 'bg-islamic-500 text-white' 
                : 'glass-card hover:bg-glass-light'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'search' 
                ? 'bg-islamic-500 text-white' 
                : 'glass-card hover:bg-glass-light'
            }`}
          >
            Search Results
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-glass-light' : 'hover:bg-glass-light'
            }`}
          >
            <FiGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-glass-light' : 'hover:bg-glass-light'
            }`}
          >
            <FiList className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {hadithCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={`/hadith/category/${category.id}`}>
                <div className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer text-center group">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-bold mb-1 group-hover:text-gradient transition-all">
                    {category.name}
                  </h3>
                  <p className="text-lg font-arabic text-gold-400 mb-2">
                    {category.arabicName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {category.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Search Results */}
      {activeTab === 'search' && searchQuery && (
        <div className="space-y-4">
          <p className="text-gray-400 mb-4">
            Showing results for "<span className="text-white">{searchQuery}</span>"
            {searchResults.length > 0 && <span className="ml-2">({searchResults.length} results)</span>}
          </p>
          
          {/* Search Loading */}
          {searchLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-islamic-400 mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Searching...</p>
            </div>
          )}
          
          {/* Search Results */}
          {!searchLoading && searchResults.length > 0 && searchResults.map((hadith, index) => (
            <motion.div
              key={hadith.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-card hadith-card hover:bg-glass-light transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  {hadith.grade && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      hadith.grade === 'sahih' 
                        ? 'bg-islamic-500/20 text-islamic-400' 
                        : hadith.grade === 'hasan'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gold-500/20 text-gold-400'
                    }`}>
                      {hadith.grade_text || hadith.grade}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-400">{hadith.reference}</span>
              </div>
              
              <div className="hadith-content">
                {hadith.arabic_text && (
                  <div className="hadith-arabic-section">
                    <div className="arabic-text" dir="rtl">
                      <div dangerouslySetInnerHTML={{ __html: hadith.arabic_text }} />
                    </div>
                  </div>
                )}
                
                {(hadith.arabic_text && hadith.english_text) && (
                  <hr className="hadith-separator" />
                )}
                
                {hadith.english_text && (
                  <div className="hadith-english-section">
                    <div className="text-lg leading-relaxed text-gray-300">
                      <div dangerouslySetInnerHTML={{ __html: hadith.english_text }} />
                    </div>
                  </div>
                )}
              </div>
              
              {hadith.narrator_chain && (
                <p className="text-sm text-gray-400 mt-4">
                  {hadith.narrator_chain}
                </p>
              )}
            </motion.div>
          ))}
          
          {/* No Results */}
          {!searchLoading && searchResults.length === 0 && searchQuery.length > 2 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No hadiths found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'search' && !searchQuery && (
        <div className="text-center py-12">
          <FiSearch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Enter keywords to search through hadith collections</p>
        </div>
      )}
    </>
  )
}