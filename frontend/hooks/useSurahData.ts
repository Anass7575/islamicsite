import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/services/apiClient'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface Ayah {
  number: number
  text: string
  numberInSurah: number
  audio: string
}

interface SurahData {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  ayahs: Ayah[]
}

interface TranslationData {
  ayahs: Array<{
    number: number
    text: string
    numberInSurah: number
  }>
}

export function useSurahData(surahNumber: number) {
  const router = useRouter()
  const [surahData, setSurahData] = useState<SurahData | null>(null)
  const [translationData, setTranslationData] = useState<TranslationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSurahData = async () => {
      if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
        router.push('/quran')
        return
      }
      
      setLoading(true)
      try {
        console.log(`Fetching surah ${surahNumber}...`)
        
        // Fetch Arabic text and audio
        // Use external Quran API that works
        const arabicResponse = await fetch(
          `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNumber}`
        ).then(res => res.json())
        console.log('Arabic response:', arabicResponse)
        
        // Fetch French translation
        const translationResponse = await fetch(
          `https://api.quran.com/api/v4/quran/translations/136?chapter_number=${surahNumber}`
        ).then(res => res.json())
        console.log('Translation response:', translationResponse)
        
        // Format data for component
        setSurahData(arabicResponse.verses || [])
        setTranslationData(translationResponse.translations || [])
      } catch (error) {
        console.error('Surah fetch error:', error)
        logger.error('Error fetching surah', error)
        toast.error('Failed to load surah')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSurahData()
  }, [surahNumber, router])

  return { surahData, translationData, loading }
}