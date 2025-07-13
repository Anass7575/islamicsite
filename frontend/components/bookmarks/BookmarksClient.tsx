'use client'

import { useState, useEffect } from 'react'
import { motion } from '@/lib/motion'
import { FiBookmark, FiTrash2, FiExternalLink, FiBook } from '@/lib/icons'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/services/apiClient'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Bookmark {
  id: number
  type: string
  title: string
  description: string | null
  url: string | null
  hadith_collection: string | null
  hadith_number: number | null
  created_at: string
}

export function BookmarksClient() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'hadith' | 'quran' | 'other'>('all')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/bookmarks')
      return
    }

    fetchBookmarks()
  }, [isAuthenticated, router])

  const fetchBookmarks = async () => {
    try {
      const response = await apiClient.get('/api/bookmarks')
      setBookmarks(response.data || [])
    } catch (error) {
      logger.error('Failed to fetch bookmarks', error)
      toast.error('Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }

  const deleteBookmark = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) {
      return
    }

    try {
      await apiClient.delete(`/api/bookmarks/${id}`)
      setBookmarks(bookmarks.filter(b => b.id !== id))
      toast.success('Bookmark deleted')
    } catch (error) {
      logger.error('Failed to delete bookmark', error)
      toast.error('Failed to delete bookmark')
    }
  }

  const getBookmarkLink = (bookmark: Bookmark) => {
    if (bookmark.hadith_collection && bookmark.hadith_number) {
      // Map collection to slug
      const collectionSlugs: { [key: string]: string } = {
        'bukhari': 'sahih-bukhari',
        'muslim': 'sahih-muslim',
        'abudawud': 'sunan-abu-dawud',
        'tirmidhi': 'jami-at-tirmidhi',
        'nasai': 'sunan-an-nasai',
        'ibnmajah': 'sunan-ibn-majah'
      }
      const slug = collectionSlugs[bookmark.hadith_collection] || bookmark.hadith_collection
      return `/hadith/${slug}#hadith-${bookmark.hadith_number}`
    }
    return bookmark.url || '#'
  }

  const filteredBookmarks = bookmarks.filter(bookmark => {
    if (filter === 'all') return true
    if (filter === 'hadith') return bookmark.type === 'hadith'
    if (filter === 'quran') return bookmark.type === 'quran'
    return bookmark.type !== 'hadith' && bookmark.type !== 'quran'
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-islamic-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'all'
              ? 'bg-islamic-500 text-white'
              : 'glass-card hover:bg-glass-light'
          }`}
        >
          All ({bookmarks.length})
        </button>
        <button
          onClick={() => setFilter('hadith')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'hadith'
              ? 'bg-islamic-500 text-white'
              : 'glass-card hover:bg-glass-light'
          }`}
        >
          Hadiths ({bookmarks.filter(b => b.type === 'hadith').length})
        </button>
        <button
          onClick={() => setFilter('quran')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'quran'
              ? 'bg-islamic-500 text-white'
              : 'glass-card hover:bg-glass-light'
          }`}
        >
          Quran ({bookmarks.filter(b => b.type === 'quran').length})
        </button>
        <button
          onClick={() => setFilter('other')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'other'
              ? 'bg-islamic-500 text-white'
              : 'glass-card hover:bg-glass-light'
          }`}
        >
          Other ({bookmarks.filter(b => b.type !== 'hadith' && b.type !== 'quran').length})
        </button>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark, index) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass-card p-6 group hover:scale-105 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-islamic-500/20 text-islamic-400">
                    {bookmark.type === 'hadith' ? (
                      <FiBook className="w-5 h-5" />
                    ) : (
                      <FiBookmark className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-sm text-gray-400 capitalize">
                    {bookmark.type}
                  </span>
                </div>
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/20 text-red-400"
                  title="Delete bookmark"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              <Link href={getBookmarkLink(bookmark)}>
                <h3 className="font-bold mb-2 hover:text-gradient transition-all cursor-pointer">
                  {bookmark.title}
                </h3>
              </Link>

              {bookmark.description && (
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {bookmark.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(bookmark.created_at).toLocaleDateString()}
                </span>
                <Link
                  href={getBookmarkLink(bookmark)}
                  className="text-islamic-400 hover:text-islamic-300 transition-colors"
                >
                  <FiExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiBookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">
            {filter === 'all' 
              ? "You haven't saved any bookmarks yet"
              : `No ${filter} bookmarks found`}
          </p>
          <Link
            href="/hadith"
            className="text-islamic-400 hover:text-islamic-300 transition-colors"
          >
            Browse Hadith Collections →
          </Link>
        </div>
      )}
    </>
  )
}