'use client'

import { useCallback } from 'react'
import { motion } from '@/lib/motion'
import { FiAlertCircle } from '@/lib/icons'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/services/apiClient'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'
import { useHadithCollection } from '@/hooks/useHadithCollection'
import { useHadithFilter } from '@/hooks/useHadithFilter'
import { HadithSearchBar } from './HadithSearchBar'
import { HadithFilters } from './HadithFilters'
import { HadithCard } from './HadithCard'
import { ExportHadithButton } from './ExportHadithButton'

interface Hadith {
  id: number
  collection_id: number
  book_id: number
  hadith_number: number
  arabic_text: string
  english_text: string
  narrator_chain: string
  arabic_narrator_chain: string
  grade: string | null
  grade_text: string | null
  categories: string[]
  reference: string
  created_at: string
  updated_at: string | null
}

interface HadithCollectionClientProps {
  collectionId: string
  collectionName: string
  slug: string
}

export function HadithCollectionClient({ collectionId, collectionName, slug }: HadithCollectionClientProps) {
  const { isAuthenticated } = useAuth()
  
  // Use custom hooks
  const { hadiths, loading, currentPage, setCurrentPage, totalPages, total } = useHadithCollection(collectionId)
  const {
    searchQuery,
    setSearchQuery,
    selectedGrade,
    setSelectedGrade,
    showFilters,
    setShowFilters,
    filteredHadiths,
    clearFilters,
    hasActiveFilters
  } = useHadithFilter(hadiths)
  
  const copyHadith = useCallback(async (hadith: Hadith) => {
    const textToCopy = `${hadith.arabic_text}\n\n${hadith.english_text}\n\n${hadith.narrator_chain || ''}\n\n- ${hadith.reference}`
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      toast.success('Hadith copied to clipboard')
    } catch (error) {
      logger.error('Failed to copy hadith', error)
      toast.error('Failed to copy')
    }
  }, [])
  
  const saveBookmark = useCallback(async (hadith: Hadith) => {
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
  }, [isAuthenticated, collectionId, collectionName])
  
  const shareHadith = useCallback(async (hadith: Hadith) => {
    const shareUrl = `https://al-hidaya.com/hadith/${slug}/${hadith.hadith_number}`
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
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard')
      } catch (error) {
        logger.error('Failed to share hadith', error)
        toast.error('Failed to share')
      }
    }
  }, [collectionName, slug])
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="h-4 bg-glass-light rounded mb-4 w-1/4"></div>
            <div className="h-24 bg-glass-light rounded mb-4"></div>
            <div className="h-20 bg-glass-light rounded"></div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <>
      {/* Search Bar */}
      <HadithSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />
      
      {/* Filters */}
      {showFilters && (
        <HadithFilters
          selectedGrade={selectedGrade}
          onGradeChange={setSelectedGrade}
        />
      )}
      
      {/* Results Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-400">
          {hasActiveFilters ? (
            <>Showing {filteredHadiths.length} of {total} hadiths</>
          ) : (
            <>Total: {total} hadiths</>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-4 text-islamic-400 hover:text-islamic-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
        <ExportHadithButton 
          collectionId={collectionId}
          limit={100}
        />
      </div>
      
      {/* Hadiths List */}
      <div className="space-y-6">
        {filteredHadiths.map((hadith, index) => (
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
      {filteredHadiths.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FiAlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No hadiths found matching your filters.</p>
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
              title="First page"
            >
              <span className="hidden sm:inline">First</span>
              <span className="sm:hidden">««</span>
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-glass-light disabled:opacity-50 hover:bg-glass-dark transition-colors"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">«</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Page numbers */}
            {currentPage > 2 && (
              <>
                <button 
                  onClick={() => setCurrentPage(1)} 
                  className="w-10 h-10 rounded-lg hover:bg-glass-light transition-colors"
                >
                  1
                </button>
                {currentPage > 3 && <span className="px-2">...</span>}
              </>
            )}
            
            {/* Current page and neighbors */}
            {[currentPage - 1, currentPage, currentPage + 1]
              .filter(page => page > 0 && page <= totalPages)
              .map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg transition-colors ${
                    page === currentPage 
                      ? 'bg-islamic-500 text-white' 
                      : 'hover:bg-glass-light'
                  }`}
                >
                  {page}
                </button>
              ))
            }
            
            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && <span className="px-2">...</span>}
                <button 
                  onClick={() => setCurrentPage(totalPages)} 
                  className="w-10 h-10 rounded-lg hover:bg-glass-light transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-glass-light disabled:opacity-50 hover:bg-glass-dark transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">»</span>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg bg-glass-light disabled:opacity-50 hover:bg-glass-dark transition-colors"
              title="Last page"
            >
              <span className="hidden sm:inline">Last</span>
              <span className="sm:hidden">»»</span>
            </button>
          </div>
        </motion.div>
      )}
    </>
  )
}