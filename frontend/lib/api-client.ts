import { httpClient, FetchError, errorUtils } from './fetch-enhanced'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'
const API_VERSION = 'v1'

// Request interceptor type
type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>
// Response interceptor type
type ResponseInterceptor = (response: any) => any | Promise<any>
// Error interceptor type
type ErrorInterceptor = (error: Error) => Promise<never> | never

class ApiClient {
  private baseURL: string
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.setupDefaultInterceptors()
  }

  private setupDefaultInterceptors() {
    // Default request interceptor
    this.addRequestInterceptor((config) => {
      // Add common headers
      config.headers = {
        'Accept': 'application/json',
        'X-API-Version': API_VERSION,
        ...config.headers
      }
      return config
    })

    // Default response interceptor
    this.addResponseInterceptor((response) => {
      // Log successful responses in development
      if (process.env.NODE_ENV === 'development') {
        console.log('API Response:', response)
      }
      return response
    })

    // Default error interceptor
    this.addErrorInterceptor(async (error) => {
      // Handle authentication errors
      if (error instanceof FetchError && error.status === 401) {
        // Redirect to login or refresh token
        if (typeof window !== 'undefined') {
          // Store current path for redirect after login
          localStorage.setItem('redirectAfterLogin', window.location.pathname)
          
          // Clear auth state
          document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
          
          // Redirect to login
          window.location.href = '/login'
        }
      }

      // Log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', error)
      }

      throw error
    })
  }

  // Add interceptors
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor)
  }

  // Apply interceptors
  private async applyRequestInterceptors(config: RequestInit): Promise<RequestInit> {
    let finalConfig = config
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig)
    }
    return finalConfig
  }

  private async applyResponseInterceptors(response: any): Promise<any> {
    let finalResponse = response
    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse)
    }
    return finalResponse
  }

  private async applyErrorInterceptors(error: Error): Promise<never> {
    let currentError = error
    for (const interceptor of this.errorInterceptors) {
      try {
        await interceptor(currentError)
      } catch (newError: any) {
        currentError = newError
      }
    }
    throw currentError
  }

  // Request methods
  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const config = await this.applyRequestInterceptors(options)
      const response = await httpClient.get<T>(`${this.baseURL}${endpoint}`, config)
      const data = await this.applyResponseInterceptors(response.data)
      return data
    } catch (error) {
      return this.applyErrorInterceptors(error as Error)
    }
  }

  async post<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    try {
      const config = await this.applyRequestInterceptors(options)
      const response = await httpClient.post<T>(`${this.baseURL}${endpoint}`, data, config)
      const responseData = await this.applyResponseInterceptors(response.data)
      return responseData
    } catch (error) {
      return this.applyErrorInterceptors(error as Error)
    }
  }

  async put<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    try {
      const config = await this.applyRequestInterceptors(options)
      const response = await httpClient.put<T>(`${this.baseURL}${endpoint}`, data, config)
      const responseData = await this.applyResponseInterceptors(response.data)
      return responseData
    } catch (error) {
      return this.applyErrorInterceptors(error as Error)
    }
  }

  async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const config = await this.applyRequestInterceptors(options)
      const response = await httpClient.delete<T>(`${this.baseURL}${endpoint}`, config)
      const data = await this.applyResponseInterceptors(response.data)
      return data
    } catch (error) {
      return this.applyErrorInterceptors(error as Error)
    }
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// Helper to build query string
function buildQueryString(params: Record<string, any>): string {
  const cleanParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  return cleanParams.length > 0 ? `?${cleanParams.join('&')}` : ''
}

// Export specific API services
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    apiClient.post('/api/auth/login', credentials),
  
  register: (userData: { email: string; username: string; password: string; full_name: string }) =>
    apiClient.post('/api/auth/register', userData),
  
  logout: () => apiClient.post('/api/auth/logout'),
  
  getCurrentUser: () => apiClient.get('/api/auth/me'),
  
  refreshToken: () => apiClient.post('/api/auth/refresh')
}

export const quranApi = {
  getSurahs: () => apiClient.get('/api/v1/quran/surahs'),
  
  getSurah: (surahNumber: number, edition?: string) =>
    apiClient.get(`/api/v1/quran/surah/${surahNumber}${buildQueryString({ edition })}`),
  
  getVerse: (surahNumber: number, verseNumber: number, edition?: string) =>
    apiClient.get(`/api/v1/quran/verse/${surahNumber}/${verseNumber}${buildQueryString({ edition })}`),
  
  search: (query: string, language?: string) =>
    apiClient.get(`/api/v1/quran/search${buildQueryString({ q: query, language })}`)
}

export const hadithApi = {
  getCollections: () => apiClient.get('/api/hadith/collections'),
  
  getBooks: (collection: string) =>
    apiClient.get(`/api/hadith/collections/${collection}/books`),
  
  getHadith: (collection: string, hadithNumber: number) =>
    apiClient.get(`/api/hadith/${collection}/${hadithNumber}`),
  
  search: (query: string, collection?: string) =>
    apiClient.get(`/api/hadith/search${buildQueryString({ q: query, collection })}`),
    
  getDailyHadith: () => apiClient.get('/api/hadith/daily')
}

export const prayerApi = {
  getTimes: (latitude: number, longitude: number, date?: string) =>
    apiClient.get(`/api/prayer/times${buildQueryString({ latitude, longitude, date })}`),
  
  getQibla: (latitude: number, longitude: number) =>
    apiClient.get(`/api/prayer/qibla${buildQueryString({ latitude, longitude })}`),
  
  logPrayer: (prayerData: { prayer_name: string; prayed_at: string }) =>
    apiClient.post('/api/prayer-logs/', prayerData),
  
  getHistory: (startDate?: string, endDate?: string) =>
    apiClient.get(`/api/prayer/history${buildQueryString({ start_date: startDate, end_date: endDate })}`)
}

export const zakatApi = {
  calculate: (data: {
    cash: number
    gold_weight: number
    silver_weight: number
    investments: number
    debts: number
  }) => apiClient.post('/api/zakat/calculate', data),
  
  getHistory: () => apiClient.get('/api/zakat/history'),
  
  saveCalculation: (calculation: any) =>
    apiClient.post('/api/zakat/calculations', calculation)
}

// Export utilities
export { errorUtils, FetchError }