import { useState, useEffect } from 'react'
import { hadithApi } from '@/services/api'
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
  arabic_narrator_chain: string
  grade: string | null
  grade_text: string | null
  categories: string[]
  reference: string
  created_at: string
  updated_at: string | null
}

export function useHadithCollection(collectionId: string, perPage: number = 20) {
  const [hadiths, setHadiths] = useState<Hadith[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchHadiths = async () => {
      setLoading(true)
      try {
        const data = await hadithApi.getHadithsPaginated(collectionId, currentPage, perPage)
        setHadiths(data.hadiths || [])
        setTotalPages(data.pages || 1)
        setTotal(data.total || 0)
      } catch (error) {
        logger.error('Error fetching hadiths', error)
        toast.error('Failed to load hadiths')
        setHadiths([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchHadiths()
  }, [collectionId, currentPage, perPage])

  return {
    hadiths,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    total
  }
}