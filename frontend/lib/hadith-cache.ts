// Hadith cache system with IndexedDB and localStorage fallback
import { logger } from '@/lib/logger'

interface CachedData<T> {
  data: T
  timestamp: number
  ttl: number
}

class HadithCache {
  private dbName = 'al-hidaya-hadith-cache'
  private version = 1
  private db: IDBDatabase | null = null
  private isIndexedDBAvailable = false
  
  constructor() {
    this.initIndexedDB()
  }
  
  private async initIndexedDB() {
    try {
      if ('indexedDB' in window) {
        const request = indexedDB.open(this.dbName, this.version)
        
        request.onerror = () => {
          logger.error('IndexedDB error:', request.error)
          this.isIndexedDBAvailable = false
        }
        
        request.onsuccess = () => {
          this.db = request.result
          this.isIndexedDBAvailable = true
          logger.info('IndexedDB initialized')
        }
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          
          // Create object stores
          if (!db.objectStoreNames.contains('collections')) {
            db.createObjectStore('collections', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('hadiths')) {
            const hadithStore = db.createObjectStore('hadiths', { keyPath: 'id' })
            hadithStore.createIndex('collection', 'collection_id', { unique: false })
            hadithStore.createIndex('book', ['collection_id', 'book_number'], { unique: false })
          }
          if (!db.objectStoreNames.contains('books')) {
            const bookStore = db.createObjectStore('books', { keyPath: 'id' })
            bookStore.createIndex('collection', 'collection_id', { unique: false })
          }
          if (!db.objectStoreNames.contains('daily')) {
            db.createObjectStore('daily', { keyPath: 'date' })
          }
        }
      }
    } catch (error) {
      logger.error('Failed to initialize IndexedDB:', error)
      this.isIndexedDBAvailable = false
    }
  }
  
  // Generic cache methods
  async get<T>(storeName: string, key: string): Promise<T | null> {
    // Try IndexedDB first
    if (this.isIndexedDBAvailable && this.db) {
      try {
        const transaction = this.db.transaction([storeName], 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.get(key)
        
        return new Promise((resolve) => {
          request.onsuccess = () => {
            const result = request.result as CachedData<T>
            if (result && Date.now() - result.timestamp < result.ttl) {
              resolve(result.data)
            } else {
              resolve(null)
            }
          }
          request.onerror = () => resolve(null)
        })
      } catch (error) {
        logger.error('IndexedDB get error:', error)
      }
    }
    
    // Fallback to localStorage
    try {
      const cached = localStorage.getItem(`hadith-${storeName}-${key}`)
      if (cached) {
        const parsed = JSON.parse(cached) as CachedData<T>
        if (Date.now() - parsed.timestamp < parsed.ttl) {
          return parsed.data
        }
        localStorage.removeItem(`hadith-${storeName}-${key}`)
      }
    } catch (error) {
      logger.error('localStorage get error:', error)
    }
    
    return null
  }
  
  async set<T>(storeName: string, key: string, data: T, ttl = 3600000): Promise<void> {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
      ttl
    }
    
    // Try IndexedDB first
    if (this.isIndexedDBAvailable && this.db) {
      try {
        const transaction = this.db.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        store.put({ id: key, ...cacheData })
        return
      } catch (error) {
        logger.error('IndexedDB set error:', error)
      }
    }
    
    // Fallback to localStorage
    try {
      localStorage.setItem(`hadith-${storeName}-${key}`, JSON.stringify(cacheData))
      
      // Clean up old entries if storage is getting full
      if (localStorage.length > 100) {
        this.cleanupLocalStorage()
      }
    } catch (error) {
      logger.error('localStorage set error:', error)
      // If quota exceeded, clear some old data
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanupLocalStorage()
        try {
          localStorage.setItem(`hadith-${storeName}-${key}`, JSON.stringify(cacheData))
        } catch {
          // Give up
        }
      }
    }
  }
  
  private cleanupLocalStorage() {
    const hadithKeys = Object.keys(localStorage).filter(k => k.startsWith('hadith-'))
    const items = hadithKeys.map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        return { key, timestamp: data.timestamp || 0 }
      } catch {
        return { key, timestamp: 0 }
      }
    })
    
    // Sort by timestamp and remove oldest 25%
    items.sort((a, b) => a.timestamp - b.timestamp)
    const toRemove = Math.floor(items.length / 4)
    items.slice(0, toRemove).forEach(item => localStorage.removeItem(item.key))
  }
  
  // Specific hadith cache methods
  async getCollections() {
    return this.get<any[]>('collections', 'all')
  }
  
  async setCollections(collections: any[]) {
    return this.set('collections', 'all', collections, 7 * 24 * 3600000) // 7 days
  }
  
  async getCollection(collectionId: string) {
    return this.get<any>('collections', collectionId)
  }
  
  async setCollection(collectionId: string, collection: any) {
    return this.set('collections', collectionId, collection, 7 * 24 * 3600000)
  }
  
  async getBooks(collectionId: string) {
    return this.get<any[]>('books', collectionId)
  }
  
  async setBooks(collectionId: string, books: any[]) {
    return this.set('books', collectionId, books, 7 * 24 * 3600000)
  }
  
  async getHadiths(collectionId: string, bookNumber?: number, page = 1) {
    const key = bookNumber 
      ? `${collectionId}-${bookNumber}-${page}`
      : `${collectionId}-${page}`
    return this.get<any>('hadiths', key)
  }
  
  async setHadiths(collectionId: string, data: any, bookNumber?: number, page = 1) {
    const key = bookNumber 
      ? `${collectionId}-${bookNumber}-${page}`
      : `${collectionId}-${page}`
    return this.set('hadiths', key, data, 3600000) // 1 hour
  }
  
  async getDailyHadith(date: string) {
    return this.get<any>('daily', date)
  }
  
  async setDailyHadith(date: string, hadith: any) {
    return this.set('daily', date, hadith, 24 * 3600000) // 24 hours
  }
  
  // Clear all cache
  async clearAll() {
    if (this.isIndexedDBAvailable && this.db) {
      const storeNames = ['collections', 'hadiths', 'books', 'daily']
      for (const storeName of storeNames) {
        try {
          const transaction = this.db.transaction([storeName], 'readwrite')
          const store = transaction.objectStore(storeName)
          store.clear()
        } catch (error) {
          logger.error(`Failed to clear ${storeName}:`, error)
        }
      }
    }
    
    // Clear localStorage
    const hadithKeys = Object.keys(localStorage).filter(k => k.startsWith('hadith-'))
    hadithKeys.forEach(key => localStorage.removeItem(key))
  }
}

export const hadithCache = new HadithCache()