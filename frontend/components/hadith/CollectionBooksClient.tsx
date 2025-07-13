'use client'

import { useState, useEffect } from 'react'
import { motion } from '@/lib/motion'
import { FiBook, FiChevronRight } from '@/lib/icons'
import { hadithApi } from '@/services/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface HadithBook {
  id: number
  collection_id: number
  book_number: number
  name: string
  arabic_name: string | null
  hadith_count: number
}

interface CollectionBooksClientProps {
  collectionId: string
  collectionName: string
  slug: string
}

export default function CollectionBooksClient({ collectionId, collectionName, slug }: CollectionBooksClientProps) {
  const [books, setBooks] = useState<HadithBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await hadithApi.getCollectionBooks(collectionId)
        setBooks(data || [])
      } catch (error) {
        logger.error('Failed to fetch books', error)
        toast.error('Failed to load books')
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [collectionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-islamic-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map((book, index) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Link href={`/hadith/${slug}/book/${book.book_number}`}>
            <div className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-islamic-500/20 text-islamic-400 group-hover:bg-islamic-500 group-hover:text-white transition-all">
                    <FiBook className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Book {book.book_number}</span>
                  </div>
                </div>
                <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-islamic-400 transition-colors" />
              </div>
              
              <h3 className="text-lg font-bold mb-1 group-hover:text-gradient transition-all">
                {book.name}
              </h3>
              
              {book.arabic_name && (
                <p className="text-xl font-arabic text-gold-400 mb-3">
                  {book.arabic_name}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {book.hadith_count || 'Loading...'} hadiths
                </span>
                <span className="text-islamic-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  View →
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

export { CollectionBooksClient }