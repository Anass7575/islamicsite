'use client'

import { useState, useEffect } from 'react'
import { motion } from '@/lib/motion'
import { FiBook, FiShare2, FiCopy, FiBookmark, FiRefreshCw } from '@/lib/icons'
import { hadithApi } from '@/services/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/services/apiClient'

interface Hadith {
  id: number
  collection_id: number
  hadith_number: number
  arabic_text: string
  english_text: string
  narrator_chain: string
  grade: string
  grade_text: string
  reference: string
}

export function DailyHadithWidget() {
  const { isAuthenticated } = useAuth()
  const [hadith, setHadith] = useState<Hadith | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDailyHadith()
  }, [])

  const fetchDailyHadith = async () => {
    try {
      const response = await hadithApi.getDailyHadith()
      setHadith(response)
    } catch (error) {
      logger.error('Failed to fetch daily hadith', error)
    } finally {
      setLoading(false)
    }
  }

  const copyHadith = async () => {
    if (!hadith) return
    
    const textToCopy = `${hadith.arabic_text}\n\n${hadith.english_text}\n\n${hadith.narrator_chain}\n\n- ${hadith.reference}`
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      toast.success('Hadith copied to clipboard')
    } catch (error) {
      logger.error('Failed to copy hadith', error)
      toast.error('Failed to copy')
    }
  }

  const saveBookmark = async () => {
    if (!isAuthenticated || !hadith) {
      toast.error('Please login to save bookmarks')
      return
    }
    
    setSaving(true)
    try {
      await apiClient.post('/api/bookmarks', {
        type: 'hadith',
        hadith_collection: hadith.collection_id,
        hadith_number: hadith.hadith_number,
        title: `Daily Hadith - ${hadith.reference}`,
        description: hadith.english_text.substring(0, 200) + '...'
      })
      toast.success('Hadith saved to bookmarks')
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('Already in bookmarks')
      } else {
        logger.error('Failed to save bookmark', error)
        toast.error('Failed to save bookmark')
      }
    } finally {
      setSaving(false)
    }
  }

  const shareHadith = async () => {
    if (!hadith) return
    
    const shareText = `${hadith.english_text.substring(0, 200)}... - ${hadith.reference}`
    const shareUrl = window.location.origin
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hadith of the Day',
          text: shareText,
          url: shareUrl
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
        toast.success('Share text copied to clipboard')
      } catch (error) {
        logger.error('Failed to share hadith', error)
        toast.error('Failed to share')
      }
    }
  }

  return loading ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-8 animate-pulse"
    >
      <div className="h-6 bg-glass-light rounded w-1/3 mb-4"></div>
      <div className="h-32 bg-glass-light rounded mb-4"></div>
      <div className="h-24 bg-glass-light rounded"></div>
    </motion.div>
  ) : !hadith ? null : (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card overflow-hidden group"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-islamic-600 to-islamic-500 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <FiBook className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Hadith of the Day</h3>
              <p className="text-white/80 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={fetchDailyHadith}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title="Refresh"
            >
              <FiRefreshCw className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Arabic Text */}
        <div className="mb-6">
          <div className="text-2xl md:text-3xl font-arabic text-gold-400 leading-loose text-right" dir="rtl">
            {hadith.arabic_text}
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent"></div>
          <div className="text-gold-400">✦</div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent"></div>
        </div>

        {/* English Text */}
        <div className="mb-6">
          <p className="text-lg text-gray-300 leading-relaxed">
            {hadith.english_text}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>
            <span className="font-semibold">{hadith.narrator_chain}</span>
          </div>
          <div className="text-right">
            <span className="text-islamic-400">{hadith.reference}</span>
            {hadith.grade && (
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                hadith.grade === 'sahih' 
                  ? 'bg-islamic-500/20 text-islamic-400' 
                  : 'bg-gold-500/20 text-gold-400'
              }`}>
                {hadith.grade_text}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-glass-light">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyHadith}
              className="p-3 rounded-lg bg-glass-light hover:bg-glass-dark transition-colors group"
              title="Copy"
            >
              <FiCopy className="w-5 h-5 group-hover:text-islamic-400 transition-colors" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveBookmark}
              disabled={saving}
              className="p-3 rounded-lg bg-glass-light hover:bg-glass-dark transition-colors group"
              title="Save to bookmarks"
            >
              <FiBookmark className="w-5 h-5 group-hover:text-islamic-400 transition-colors" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareHadith}
              className="p-3 rounded-lg bg-glass-light hover:bg-glass-dark transition-colors group"
              title="Share"
            >
              <FiShare2 className="w-5 h-5 group-hover:text-islamic-400 transition-colors" />
            </motion.button>
          </div>
          
          <Link href="/hadith">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-islamic-500 hover:bg-islamic-600 text-white rounded-lg font-semibold transition-colors"
            >
              Explore More Hadiths
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}