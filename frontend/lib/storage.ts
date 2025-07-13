/**
 * Centralized storage management with type safety and error handling
 */

import { logger } from './logger'

type StorageType = 'local' | 'session'

interface StorageOptions {
  expires?: number // Expiration time in milliseconds
  encrypt?: boolean // Whether to encrypt the data (for sensitive info)
}

interface StorageItem<T> {
  value: T
  expires?: number
  created: number
}

class StorageManager {
  private prefix: string = 'al-hidaya:'
  
  /**
   * Set an item in storage with optional expiration
   */
  set<T>(
    key: string, 
    value: T, 
    options: StorageOptions = {},
    type: StorageType = 'local'
  ): boolean {
    try {
      const storage = this.getStorage(type)
      if (!storage) return false

      const item: StorageItem<T> = {
        value,
        created: Date.now(),
        expires: options.expires ? Date.now() + options.expires : undefined
      }

      const serialized = JSON.stringify(item)
      const finalValue = options.encrypt ? this.encrypt(serialized) : serialized
      
      storage.setItem(this.prefix + key, finalValue)
      
      logger.debug('Storage: Item set', { key, type, hasExpiration: !!options.expires })
      return true
    } catch (error) {
      logger.error('Storage: Failed to set item', error, { key, type })
      return false
    }
  }

  /**
   * Get an item from storage
   */
  get<T>(
    key: string, 
    defaultValue?: T,
    type: StorageType = 'local',
    decrypt?: boolean
  ): T | undefined {
    try {
      const storage = this.getStorage(type)
      if (!storage) return defaultValue

      const rawValue = storage.getItem(this.prefix + key)
      if (!rawValue) return defaultValue

      const serialized = decrypt ? this.decrypt(rawValue) : rawValue
      const item: StorageItem<T> = JSON.parse(serialized)

      // Check expiration
      if (item.expires && Date.now() > item.expires) {
        this.remove(key, type)
        logger.debug('Storage: Item expired', { key, type })
        return defaultValue
      }

      return item.value
    } catch (error) {
      logger.error('Storage: Failed to get item', error, { key, type })
      return defaultValue
    }
  }

  /**
   * Remove an item from storage
   */
  remove(key: string, type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type)
      if (!storage) return false

      storage.removeItem(this.prefix + key)
      logger.debug('Storage: Item removed', { key, type })
      return true
    } catch (error) {
      logger.error('Storage: Failed to remove item', error, { key, type })
      return false
    }
  }

  /**
   * Clear all items with the app prefix
   */
  clear(type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type)
      if (!storage) return false

      const keys = this.getAllKeys(type)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          storage.removeItem(key)
        }
      })

      logger.info('Storage: Cleared all items', { type, count: keys.length })
      return true
    } catch (error) {
      logger.error('Storage: Failed to clear items', error, { type })
      return false
    }
  }

  /**
   * Get all keys from storage
   */
  getAllKeys(type: StorageType = 'local'): string[] {
    try {
      const storage = this.getStorage(type)
      if (!storage) return []

      const keys: string[] = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keys.push(key)
        }
      }
      return keys
    } catch (error) {
      logger.error('Storage: Failed to get keys', error, { type })
      return []
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable(type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type)
      if (!storage) return false

      const testKey = `${this.prefix}test`
      storage.setItem(testKey, 'test')
      storage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get storage size in bytes
   */
  getSize(type: StorageType = 'local'): number {
    try {
      const storage = this.getStorage(type)
      if (!storage) return 0

      let size = 0
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key && key.startsWith(this.prefix)) {
          const value = storage.getItem(key)
          if (value) {
            size += key.length + value.length
          }
        }
      }
      return size
    } catch (error) {
      logger.error('Storage: Failed to calculate size', error, { type })
      return 0
    }
  }

  /**
   * Clean expired items
   */
  cleanExpired(type: StorageType = 'local'): number {
    let cleaned = 0
    const keys = this.getAllKeys(type)
    
    keys.forEach(key => {
      const cleanKey = key.replace(this.prefix, '')
      const item = this.get(cleanKey, undefined, type)
      if (item === undefined) {
        cleaned++
      }
    })

    logger.info('Storage: Cleaned expired items', { type, count: cleaned })
    return cleaned
  }

  private getStorage(type: StorageType): Storage | null {
    if (typeof window === 'undefined') return null
    return type === 'local' ? window.localStorage : window.sessionStorage
  }

  // Simple encryption/decryption (for demo - use proper encryption in production)
  private encrypt(value: string): string {
    return btoa(value)
  }

  private decrypt(value: string): string {
    return atob(value)
  }
}

// Create singleton instance
export const storage = new StorageManager()

// Typed storage keys
export const StorageKeys = {
  USER_PREFERENCES: 'user:preferences',
  AUTH_TOKEN: 'auth:token',
  REFRESH_TOKEN: 'auth:refresh',
  LANGUAGE: 'settings:language',
  THEME: 'settings:theme',
  LAST_SURAH: 'quran:lastSurah',
  BOOKMARKS: 'user:bookmarks',
  PRAYER_SETTINGS: 'prayer:settings',
  LOCATION: 'user:location',
  FONT_SIZE: 'settings:fontSize',
  RECITER: 'quran:reciter',
  TRANSLATION: 'quran:translation',
  NOTIFICATIONS: 'settings:notifications',
  OFFLINE_QUEUE: 'sync:queue'
} as const

// Type-safe storage functions
export const userPreferences = {
  get: () => storage.get<UserPreferences>(StorageKeys.USER_PREFERENCES),
  set: (prefs: UserPreferences) => storage.set(StorageKeys.USER_PREFERENCES, prefs),
  remove: () => storage.remove(StorageKeys.USER_PREFERENCES)
}

export const authTokens = {
  getAccess: () => storage.get<string>(StorageKeys.AUTH_TOKEN, undefined, 'local', true),
  setAccess: (token: string) => storage.set(StorageKeys.AUTH_TOKEN, token, { encrypt: true }),
  getRefresh: () => storage.get<string>(StorageKeys.REFRESH_TOKEN, undefined, 'local', true),
  setRefresh: (token: string) => storage.set(StorageKeys.REFRESH_TOKEN, token, { encrypt: true }),
  clear: () => {
    storage.remove(StorageKeys.AUTH_TOKEN)
    storage.remove(StorageKeys.REFRESH_TOKEN)
  }
}

export const appSettings = {
  getLanguage: () => storage.get<string>(StorageKeys.LANGUAGE, 'en'),
  setLanguage: (lang: string) => storage.set(StorageKeys.LANGUAGE, lang),
  
  getTheme: () => storage.get<'light' | 'dark'>(StorageKeys.THEME, 'light'),
  setTheme: (theme: 'light' | 'dark') => storage.set(StorageKeys.THEME, theme),
  
  getFontSize: () => storage.get<number>(StorageKeys.FONT_SIZE, 16),
  setFontSize: (size: number) => storage.set(StorageKeys.FONT_SIZE, size)
}

// Types
interface UserPreferences {
  language: string
  theme: 'light' | 'dark'
  fontSize: number
  notifications: boolean
  autoPlay: boolean
  reciter: string
  translation: string
}

// Storage migration utility
export async function migrateStorage(): Promise<void> {
  // Migrate old storage keys to new format
  const migrations = [
    { old: 'token', new: StorageKeys.AUTH_TOKEN },
    { old: 'refreshToken', new: StorageKeys.REFRESH_TOKEN },
    { old: 'user_language', new: StorageKeys.LANGUAGE },
    { old: 'theme_preference', new: StorageKeys.THEME }
  ]

  migrations.forEach(({ old, new: newKey }) => {
    const oldValue = localStorage.getItem(old)
    if (oldValue && !storage.get(newKey)) {
      try {
        const parsed = JSON.parse(oldValue)
        storage.set(newKey, parsed)
        localStorage.removeItem(old)
        logger.info('Storage: Migrated key', { old, new: newKey })
      } catch {
        // If not JSON, store as string
        storage.set(newKey, oldValue)
        localStorage.removeItem(old)
      }
    }
  })
}