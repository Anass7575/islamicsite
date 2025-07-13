// Resilient Hadith API with fallback and retry logic
import { hadithCache } from './hadith-cache'
import { logger } from './logger'
import apiClient from '@/services/apiClient'
import toast from 'react-hot-toast'

// Fallback data for when API is completely down
const FALLBACK_COLLECTIONS = [
  {
    collection_id: 'bukhari',
    name: 'Sahih al-Bukhari',
    arabic_name: 'صحيح البخاري',
    author: 'Imam Muhammad ibn Ismail al-Bukhari',
    author_arabic: 'الإمام محمد بن إسماعيل البخاري',
    description: 'The most authentic book after the Quran',
    total_hadiths: 7563,
    books: 97,
    authenticity: 'sahih'
  },
  {
    collection_id: 'muslim',
    name: 'Sahih Muslim',
    arabic_name: 'صحيح مسلم',
    author: 'Imam Muslim ibn al-Hajjaj',
    author_arabic: 'الإمام مسلم بن الحجاج',
    description: 'One of the most authentic hadith collections',
    total_hadiths: 7500,
    books: 56,
    authenticity: 'sahih'
  },
  {
    collection_id: 'abudawud',
    name: 'Sunan Abu Dawud',
    arabic_name: 'سنن أبي داود',
    author: 'Imam Abu Dawud as-Sijistani',
    author_arabic: 'الإمام أبو داود السجستاني',
    description: 'A collection focused on legal hadiths',
    total_hadiths: 5274,
    books: 43,
    authenticity: 'mixed'
  },
  {
    collection_id: 'tirmidhi',
    name: "Jami' at-Tirmidhi",
    arabic_name: 'جامع الترمذي',
    author: 'Imam Muhammad ibn Isa at-Tirmidhi',
    author_arabic: 'الإمام محمد بن عيسى الترمذي',
    description: 'Known for its commentary on hadith authenticity',
    total_hadiths: 3956,
    books: 49,
    authenticity: 'mixed'
  },
  {
    collection_id: 'nasai',
    name: "Sunan an-Nasa'i",
    arabic_name: 'سنن النسائي',
    author: "Imam Ahmad ibn Shu'ayb an-Nasa'i",
    author_arabic: 'الإمام أحمد بن شعيب النسائي',
    description: 'Known for its attention to defects in narrations',
    total_hadiths: 5761,
    books: 51,
    authenticity: 'mixed'
  },
  {
    collection_id: 'ibnmajah',
    name: 'Sunan Ibn Majah',
    arabic_name: 'سنن ابن ماجه',
    author: 'Imam Muhammad ibn Yazid Ibn Majah',
    author_arabic: 'الإمام محمد بن يزيد بن ماجه',
    description: 'The sixth canonical hadith collection',
    total_hadiths: 4341,
    books: 37,
    authenticity: 'mixed'
  }
]

interface ApiState {
  isOnline: boolean
  lastCheck: number
  consecutiveFailures: number
}

class ResilientHadithAPI {
  private apiState: ApiState = {
    isOnline: true,
    lastCheck: Date.now(),
    consecutiveFailures: 0
  }
  
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAYS = [1000, 2000, 4000] // Exponential backoff
  private readonly API_CHECK_INTERVAL = 30000 // 30 seconds
  
  constructor() {
    // Check API health periodically only on client side
    if (typeof window !== 'undefined') {
      setInterval(() => this.checkApiHealth(), this.API_CHECK_INTERVAL)
    }
  }
  
  private async checkApiHealth() {
    try {
      await apiClient.get('/api/hadith/collections')
      this.apiState = {
        isOnline: true,
        lastCheck: Date.now(),
        consecutiveFailures: 0
      }
    } catch {
      this.apiState.consecutiveFailures++
      if (this.apiState.consecutiveFailures >= 3) {
        this.apiState.isOnline = false
      }
    }
  }
  
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0) {
        const delay = this.RETRY_DELAYS[this.MAX_RETRIES - retries] || 5000
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.retryWithBackoff(fn, retries - 1)
      }
      throw error
    }
  }
  
  private handleApiError(error: any, useCache = true) {
    logger.error('Hadith API error:', error)
    this.apiState.consecutiveFailures++
    
    if (this.apiState.consecutiveFailures >= 3) {
      this.apiState.isOnline = false
      // Only show toast on client side
      if (useCache && typeof window !== 'undefined') {
        toast.error(
          'Service temporarily unavailable. Showing cached content.',
          { duration: 5000 }
        )
      }
    }
  }
  
  async getCollections() {
    // Check cache first
    const cached = await hadithCache.getCollections()
    if (cached && (!this.apiState.isOnline || Date.now() - this.apiState.lastCheck < 5000)) {
      return cached
    }
    
    try {
      const response = await this.retryWithBackoff(
        () => apiClient.get('/api/hadith/collections')
      )
      
      const collections = response.data
      await hadithCache.setCollections(collections)
      
      this.apiState = {
        isOnline: true,
        lastCheck: Date.now(),
        consecutiveFailures: 0
      }
      
      return collections
    } catch (error) {
      this.handleApiError(error)
      
      // Return cached data if available
      if (cached) {
        return cached
      }
      
      // Return fallback data
      toast.info('Using offline data. Some features may be limited.', { duration: 5000 })
      return FALLBACK_COLLECTIONS
    }
  }
  
  async getCollection(collectionId: string) {
    const cached = await hadithCache.getCollection(collectionId)
    if (cached && !this.apiState.isOnline) {
      return cached
    }
    
    try {
      const response = await this.retryWithBackoff(
        () => apiClient.get(`/api/hadith/collections/${collectionId}`)
      )
      
      const collection = response.data
      await hadithCache.setCollection(collectionId, collection)
      
      return collection
    } catch (error) {
      this.handleApiError(error)
      
      if (cached) {
        return cached
      }
      
      // Return fallback data
      const fallback = FALLBACK_COLLECTIONS.find(c => c.collection_id === collectionId)
      if (fallback) {
        return fallback
      }
      
      throw error
    }
  }
  
  async getBooks(collectionId: string) {
    const cached = await hadithCache.getBooks(collectionId)
    if (cached && !this.apiState.isOnline) {
      return cached
    }
    
    try {
      const response = await this.retryWithBackoff(
        () => apiClient.get(`/api/hadith/collections/${collectionId}/books`)
      )
      
      const books = response.data
      await hadithCache.setBooks(collectionId, books)
      
      return books
    } catch (error) {
      this.handleApiError(error)
      
      if (cached) {
        return cached
      }
      
      // Generate placeholder books
      const collection = FALLBACK_COLLECTIONS.find(c => c.collection_id === collectionId)
      if (collection) {
        return Array.from({ length: Math.min(collection.books, 10) }, (_, i) => ({
          id: i + 1,
          book_number: i + 1,
          name: `Book ${i + 1}`,
          arabic_name: `كتاب ${i + 1}`,
          hadith_count: Math.floor(collection.total_hadiths / collection.books)
        }))
      }
      
      throw error
    }
  }
  
  async getHadiths(collectionId: string, bookNumber?: number, page = 1, perPage = 20) {
    const cached = await hadithCache.getHadiths(collectionId, bookNumber, page)
    if (cached && !this.apiState.isOnline) {
      return cached
    }
    
    try {
      const url = bookNumber
        ? `/api/hadith/collections/${collectionId}/books/${bookNumber}/hadiths`
        : `/api/hadith/collections/${collectionId}/hadiths/paginated`
      
      const response = await this.retryWithBackoff(
        () => apiClient.get(url, {
          params: { page, per_page: perPage }
        })
      )
      
      const data = response.data
      await hadithCache.setHadiths(collectionId, data, bookNumber, page)
      
      return data
    } catch (error) {
      this.handleApiError(error)
      
      if (cached) {
        return cached
      }
      
      // Return empty results with message
      return {
        hadiths: [],
        total: 0,
        page,
        per_page: perPage,
        message: 'Unable to load hadiths. Please check your connection and try again.'
      }
    }
  }
  
  async searchHadith(query: string) {
    if (!this.apiState.isOnline) {
      toast.error('Search is not available offline', { duration: 3000 })
      return []
    }
    
    try {
      const response = await this.retryWithBackoff(
        () => apiClient.get('/api/hadith/search', {
          params: { query }
        })
      )
      
      return response.data
    } catch (error) {
      this.handleApiError(error, false)
      toast.error('Search service is temporarily unavailable', { duration: 3000 })
      return []
    }
  }
  
  async getDailyHadith() {
    const today = new Date().toISOString().split('T')[0]
    const cached = await hadithCache.getDailyHadith(today)
    
    if (cached) {
      return cached
    }
    
    try {
      const response = await this.retryWithBackoff(
        () => apiClient.get('/api/hadith/daily')
      )
      
      const hadith = response.data
      await hadithCache.setDailyHadith(today, hadith)
      
      return hadith
    } catch (error) {
      this.handleApiError(error)
      
      // Return a fallback daily hadith
      return {
        id: 1,
        collection_id: 'bukhari',
        hadith_number: 1,
        arabic_text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
        english_text: 'Actions are judged by intentions, and every person will get what they intended.',
        narrator_chain: 'Umar ibn al-Khattab',
        grade: 'sahih',
        grade_text: 'Authentic',
        reference: 'Sahih al-Bukhari 1'
      }
    }
  }
  
  // Get API status
  getApiStatus() {
    return {
      ...this.apiState,
      timeSinceLastCheck: Date.now() - this.apiState.lastCheck
    }
  }
  
  // Force API check
  async forceApiCheck() {
    await this.checkApiHealth()
    return this.getApiStatus()
  }
}

export const resilientHadithApi = new ResilientHadithAPI()