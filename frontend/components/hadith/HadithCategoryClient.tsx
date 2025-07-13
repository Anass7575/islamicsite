'use client'

import { useState, useEffect } from 'react'
import { motion } from '@/lib/motion'
import { FiAlertCircle, FiFilter } from '@/lib/icons'
import { hadithApi } from '@/services/api'
import { HadithCard } from './HadithCard'
import { HadithSearchBar } from './HadithSearchBarSimple'
import { HadithFilters } from './HadithFiltersSimple'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/services/apiClient'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface Hadith {
  id: number
  collection_id: number
  book_id: number
  hadith_number: number
  arabic_text: string
  english_text: string
  narrator_chain: string
  grade: string | null
  grade_text: string | null
  categories: string[]
  reference: string
}

interface HadithCategoryClientProps {
  collectionId: string
  collectionName: string
  categoryId: string
  categoryName: string
}

export function HadithCategoryClient({ 
  collectionId, 
  collectionName,
  categoryId,
  categoryName 
}: HadithCategoryClientProps) {
  const { isAuthenticated } = useAuth()
  const [hadiths, setHadiths] = useState<Hadith[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    grade: '',
    book: '',
  })
  const perPage = 20

  useEffect(() => {
    fetchHadiths()
  }, [collectionId, categoryId, currentPage, searchQuery, filters])

  const fetchHadiths = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
        category: categoryId,
      })
      
      if (searchQuery) {
        params.append('q', searchQuery)
      }
      
      if (filters.grade) {
        params.append('grade', filters.grade)
      }
      
      if (filters.book) {
        params.append('book_id', filters.book)
      }

      const response = await hadithApi.searchHadiths(collectionId, params.toString())
      setHadiths(response.hadiths || [])
      setTotalPages(response.pages || 1)
      setTotal(response.total || 0)
    } catch (error) {
      logger.error('Failed to fetch category hadiths', error)
      toast.error('Failed to load hadiths')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const copyHadith = async (hadith: Hadith) => {
    const textToCopy = `${hadith.arabic_text}\n\n${hadith.english_text}\n\n${hadith.narrator_chain || ''}\n\n- ${hadith.reference}`
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      toast.success('Hadith copied to clipboard')
    } catch (error) {
      logger.error('Failed to copy hadith', error)
      toast.error('Failed to copy')
    }
  }
  
  const saveBookmark = async (hadith: Hadith) => {
    if (!isAuthenticated) {
      toast.error('Please login to save bookmarks')
      return
    }
    
    try {
      await apiClient.post('/api/bookmarks', {
        type: 'hadith',
        hadith_collection: collectionId,
        hadith_number: hadith.hadith_number,
        title: `${collectionName} - Hadith ${hadith.hadith_number}`,
        description: hadith.english_text.substring(0, 100) + '...'
      })
      toast.success('Bookmark saved')
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('Bookmark already exists')
      } else {
        logger.error('Failed to save bookmark', error)
        toast.error('Failed to save bookmark')
      }
    }
  }
  
  const shareHadith = async (hadith: Hadith) => {
    const shareUrl = `https://al-hidaya.com/hadith/${collectionId}/${hadith.hadith_number}`
    const shareText = `${hadith.english_text.substring(0, 200)}... - ${hadith.reference}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${collectionName} - Hadith ${hadith.hadith_number}`,
          text: shareText,
          url: shareUrl
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard')
      } catch (error) {
        logger.error('Failed to share hadith', error)
        toast.error('Failed to share')
      }
    }
  }

  if (loading && hadiths.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-islamic-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <HadithSearchBar onSearch={handleSearch} placeholder={`Search in ${categoryName} hadiths...`} />
        
        <div className="flex justify-between items-center">
          <p className="text-gray-400">
            {total} hadiths found
          </p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-glass-light hover:bg-glass-dark rounded-lg transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            Filters
          </button>
        </div>
        
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <HadithFilters
              onFilterChange={handleFilterChange}
            />
          </motion.div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-6">
        {hadiths.map((hadith, index) => (
          <HadithCard
            key={hadith.id}
            hadith={hadith}
            index={index}
            onCopy={copyHadith}
            onBookmark={saveBookmark}
            onShare={shareHadith}
          />
        ))}
      </div>
      
      {/* No Results */}
      {hadiths.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FiAlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No hadiths found in this category.</p>
          {searchQuery && (
            <p className="text-gray-500 mt-2">
              Try a different search term or clear filters.
            </p>
          )}
        </motion.div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg bg-glass-light disabled:opacity-50 hover:bg-glass-dark transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-glass-light disabled:opacity-50 hover:bg-glass-dark transition-colors"
            >
              Previous
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-glass-light disabled:opacity-50 hover:bg-glass-dark transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg bg-glass-light disabled:opacity-50 hover:bg-glass-dark transition-colors"
            >
              Last
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}