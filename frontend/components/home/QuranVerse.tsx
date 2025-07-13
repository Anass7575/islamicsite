'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { motion } from '@/lib/motion'
import { FiBookOpen, FiHeart, FiShare2, FiCopy, FiRefreshCw } from '@/lib/icons'
import { axios } from '@/lib/fetch'
import { useAuth } from '@/hooks/useAuth'
import apiClient from '@/services/apiClient'
import toast from 'react-hot-toast'

interface Verse {
  arabic: string
  translation: string
  reference: string
  transliteration: string
  surahName: string
  surahNameArabic: string
  numberInSurah: number
}

// Memoized verse display component
const VerseDisplay = memo(({ verse }: { verse: Verse }) => {
  return (
    <>
      <motion.div
        key={verse.arabic}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl md:text-5xl font-arabic text-gold-400 mb-6 leading-relaxed">
          {verse.arabic}
        </h2>
      </motion.div>
      
      <motion.p
        key={verse.translation}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg md:text-xl text-gray-300 mb-4 italic"
      >
        "{verse.translation}"
      </motion.p>
      
      <motion.p
        key={verse.transliteration}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-gray-400 mb-6"
      >
        {verse.transliteration}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-8"
      >
        <p className="text-islamic-400 font-semibold">
          {verse.reference}
        </p>
        <p className="text-gold-500 font-arabic text-lg mt-1">
          {verse.surahNameArabic}
        </p>
      </motion.div>
    </>
  )
})

VerseDisplay.displayName = 'VerseDisplay'

export function QuranVerse() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [verse, setVerse] = useState<Verse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [copied, setCopied] = useState(false)
  const [verseNumber, setVerseNumber] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchRandomVerse = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true)
    } else {
      setLoading(true)
    }
    
    setIsFavorite(false)
    
    try {
      // Generate random verse (Quran has 6236 verses)
      const randomVerse = Math.floor(Math.random() * 6236) + 1
      setVerseNumber(randomVerse)
      
      // Fetch all data in parallel
      const [arabicResponse, englishResponse, transliterationResponse] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/ayah/${randomVerse}`),
        axios.get(`https://api.alquran.cloud/v1/ayah/${randomVerse}/en.sahih`),
        axios.get(`https://api.alquran.cloud/v1/ayah/${randomVerse}/en.transliteration`)
      ])
      
      const arabicData = arabicResponse.data.data
      const englishData = englishResponse.data.data
      const transliterationData = transliterationResponse.data.data
      
      setVerse({
        arabic: arabicData.text,
        translation: englishData.text,
        reference: `Surah ${arabicData.surah.englishName} ${arabicData.surah.number}:${arabicData.numberInSurah}`,
        transliteration: transliterationData.text,
        surahName: arabicData.surah.englishName,
        surahNameArabic: arabicData.surah.name,
        numberInSurah: arabicData.numberInSurah,
      })
      
      // Check if verse is favorited (if authenticated)
      if (isAuthenticated) {
        try {
          const favResponse = await apiClient.get('/api/favorites/verses')
          const isFav = favResponse.data.some(
            (fav: any) => fav.verse_number === randomVerse
          )
          setIsFavorite(isFav)
        } catch (error) {
          console.error('Error checking favorites:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching verse:', error)
      toast.error('Failed to load verse')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [isAuthenticated])

  // Fetch initial verse only
  useEffect(() => {
    fetchRandomVerse()
  }, []) // Remove fetchRandomVerse from dependencies to prevent re-fetching

  const handleCopy = useCallback(async () => {
    if (!verse) return
    
    const textToCopy = `${verse.arabic}\n\n"${verse.translation}"\n\n${verse.reference}`
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      toast.success('Verse copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy verse')
    }
  }, [verse])

  const handleShare = useCallback(async () => {
    if (!verse) return
    
    const shareData = {
      title: 'Quranic Verse',
      text: `${verse.arabic}\n\n"${verse.translation}"\n\n${verse.reference}`,
    }
    
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        handleCopy()
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }, [verse, handleCopy])

  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites')
      return
    }
    
    if (!verse || verseNumber === null) return
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const favResponse = await apiClient.get('/api/favorites/verses')
        const favToDelete = favResponse.data.find(
          (fav: any) => fav.verse_number === verseNumber
        )
        if (favToDelete) {
          await apiClient.delete(`/api/favorites/verses/${favToDelete.id}`)
          setIsFavorite(false)
          toast.success('Removed from favorites')
        }
      } else {
        // Add to favorites
        const arabicData = await axios.get(
          `https://api.alquran.cloud/v1/ayah/${verseNumber}`
        )
        const surahData = arabicData.data.data.surah
        
        await apiClient.post('/api/favorites/verses', {
          verse_number: verseNumber,
          surah_number: surahData.number,
          surah_name: verse.surahName,
          surah_name_arabic: verse.surahNameArabic,
          verse_arabic: verse.arabic,
          verse_translation: verse.translation,
          verse_transliteration: verse.transliteration,
        })
        setIsFavorite(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error managing favorite:', error)
      toast.error('Failed to update favorites')
    }
  }, [isAuthenticated, isFavorite, verse, verseNumber])

  if (loading || !verse) {
    return (
      <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-glass-light rounded mb-6 max-w-md mx-auto"></div>
          <div className="h-20 bg-glass-light rounded mb-4"></div>
          <div className="h-16 bg-glass-light rounded max-w-lg mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-islamic-600/10 to-gold-600/10" />
      
      <div className="relative z-10">
        <div className="flex justify-center items-center gap-4 mb-6">
          <FiBookOpen className="w-12 h-12 text-gold-400" />
          <button
            onClick={() => fetchRandomVerse(true)}
            disabled={isRefreshing}
            className={`p-2 rounded-full hover:bg-glass-light transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh verse"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        <VerseDisplay verse={verse} />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-center gap-4"
        >
          <button 
            onClick={toggleFavorite}
            className={`p-3 rounded-full transition-all duration-300 ${
              isFavorite ? 'bg-islamic-500/20 text-islamic-400' : 'hover:bg-glass-light'
            }`}
            title={isAuthenticated ? (isFavorite ? 'Remove from favorites' : 'Add to favorites') : 'Login to save'}
          >
            <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={handleCopy}
            className={`p-3 rounded-full transition-all duration-300 ${
              copied ? 'bg-islamic-500/20 text-islamic-400' : 'hover:bg-glass-light'
            }`}
            title="Copy verse"
          >
            <FiCopy className="w-5 h-5" />
          </button>
          <button 
            onClick={handleShare}
            className="p-3 rounded-full hover:bg-glass-light transition-colors"
            title="Share verse"
          >
            <FiShare2 className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}