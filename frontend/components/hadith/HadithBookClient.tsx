'use client'

import { useState, useEffect } from 'react'
import { motion } from '@/lib/motion'
import { FiBook, FiAlertCircle, FiChevronLeft, FiChevronRight } from '@/lib/icons'
import { hadithApi } from '@/services/api'
import { HadithCard } from './HadithCard'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/services/apiClient'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'
import { ExportHadithButton } from './ExportHadithButton'
import Link from 'next/link'

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

interface HadithBookClientProps {
  collectionId: string
  collectionName: string
  collectionArabicName: string
  slug: string
  bookNumber: number
}

export function HadithBookClient({ 
  collectionId, 
  collectionName, 
  collectionArabicName,
  slug, 
  bookNumber 
}: HadithBookClientProps) {
  const { isAuthenticated } = useAuth()
  const [hadiths, setHadiths] = useState<Hadith[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [bookInfo, setBookInfo] = useState<any>(null)
  const [allBooks, setAllBooks] = useState<any[]>([])
  const [currentBookIndex, setCurrentBookIndex] = useState(-1)
  const perPage = 20

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Get all books info
        const books = await hadithApi.getCollectionBooks(collectionId)
        setAllBooks(books)
        
        // Find current book
        const bookIndex = books.findIndex((b: any) => b.book_number === bookNumber)
        setCurrentBookIndex(bookIndex)
        
        if (bookIndex !== -1) {
          setBookInfo(books[bookIndex])
        }

        // Get hadiths
        const data = await hadithApi.getBookHadiths(collectionId, bookNumber, currentPage, perPage)
        setHadiths(data.hadiths || [])
        setTotalPages(data.pages || 1)
        setTotal(data.total || 0)
      } catch (error) {
        logger.error('Failed to fetch book data', error)
        toast.error('Failed to load hadiths')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collectionId, bookNumber, currentPage])

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
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-islamic-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {bookInfo ? (
            <span className="text-gradient">{bookInfo.name}</span>
          ) : (
            <span className="text-gradient">Book {bookNumber}</span>
          )}
        </h1>
        {bookInfo?.arabic_name && (
          <h2 className="text-2xl font-arabic text-gold-400 mb-4">
            {bookInfo.arabic_name}
          </h2>
        )}
        <p className="text-gray-400">
          {collectionName} • {collectionArabicName}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {total} hadiths in this book • Book {bookNumber} of {allBooks.length}
        </p>
      </div>

      {/* Book Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {currentBookIndex > 0 && (
            <Link 
              href={`/hadith/${slug}/book/${allBooks[currentBookIndex - 1].book_number}`}
              className="flex items-center gap-2 px-4 py-2 bg-glass-light hover:bg-glass-dark rounded-lg transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous Book</span>
              <span className="sm:hidden">Previous</span>
            </Link>
          )}
        </div>
        
        <Link 
          href={`/hadith/${slug}/books`}
          className="px-4 py-2 bg-glass-light hover:bg-glass-dark rounded-lg transition-colors"
        >
          <FiBook className="w-4 h-4 inline mr-2" />
          All Books
        </Link>
        
        <div className="flex items-center gap-2">
          {currentBookIndex < allBooks.length - 1 && currentBookIndex !== -1 && (
            <Link 
              href={`/hadith/${slug}/book/${allBooks[currentBookIndex + 1].book_number}`}
              className="flex items-center gap-2 px-4 py-2 bg-glass-light hover:bg-glass-dark rounded-lg transition-colors"
            >
              <span className="hidden sm:inline">Next Book</span>
              <span className="sm:hidden">Next</span>
              <FiChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end mb-6">
        <ExportHadithButton 
          collectionId={collectionId}
          limit={total || 100}
        />
      </div>

      {/* Hadiths List */}
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
      {hadiths.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FiAlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No hadiths found in this book.</p>
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
    </>
  )
}