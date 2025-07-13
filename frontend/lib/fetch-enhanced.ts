// Enhanced fetch wrapper with proper error handling and type safety

interface FetchOptions extends RequestInit {
  params?: Record<string, any>
  timeout?: number
  retries?: number
  retryDelay?: number
}

interface ErrorResponse {
  message?: string
  detail?: string
  errors?: Record<string, string[]>
  status?: number
}

export class FetchError extends Error {
  status: number
  statusText: string
  response: ErrorResponse
  isNetworkError: boolean
  isTimeout: boolean

  constructor(
    message: string, 
    status: number, 
    statusText: string, 
    response: ErrorResponse,
    isNetworkError = false,
    isTimeout = false
  ) {
    super(message)
    this.name = 'FetchError'
    this.status = status
    this.statusText = statusText
    this.response = response
    this.isNetworkError = isNetworkError
    this.isTimeout = isTimeout
  }
}

// Parse error response safely
async function parseErrorResponse(response: Response): Promise<ErrorResponse> {
  const contentType = response.headers.get('content-type')
  
  try {
    if (contentType?.includes('application/json')) {
      return await response.json()
    } else {
      const text = await response.text()
      return { 
        message: text || response.statusText,
        status: response.status 
      }
    }
  } catch {
    return { 
      message: 'Failed to parse error response',
      status: response.status 
    }
  }
}

// Retry logic for failed requests
async function fetchWithRetry(
  url: string, 
  options: FetchOptions = {}, 
  retries = 3,
  retryDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchWithTimeout(url, options, options.timeout)
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on client errors (4xx)
      if (error instanceof FetchError && error.status >= 400 && error.status < 500) {
        throw error
      }
      
      // Wait before retrying
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)))
      }
    }
  }
  
  throw lastError
}

// Fetch with timeout
async function fetchWithTimeout(
  url: string, 
  options: FetchOptions = {}, 
  timeout = 30000
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'include', // Include cookies
      headers: {
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection
        ...options.headers
      }
    })
    clearTimeout(id)
    return response
  } catch (error: any) {
    clearTimeout(id)
    
    // Handle different error types
    if (error.name === 'AbortError') {
      throw new FetchError(
        'Request timeout',
        0,
        'Timeout',
        { message: 'Request timed out' },
        false,
        true
      )
    } else if (error.message === 'Failed to fetch') {
      throw new FetchError(
        'Network error',
        0,
        'Network Error',
        { message: 'Network connection failed' },
        true,
        false
      )
    }
    
    throw error
  }
}

// Get CSRF token from cookie
function getCSRFToken(): string | null {
  const match = document.cookie.match(/csrf_token=([^;]+)/)
  return match ? match[1] : null
}

export const httpClient = {
  async get<T = any>(url: string, options: FetchOptions = {}): Promise<{ data: T }> {
    const { params, retries = 3, retryDelay = 1000, ...fetchOptions } = options
    
    // Add query params if provided
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      url = queryString ? `${url}?${queryString}` : url
    }

    const response = await fetchWithRetry(url, {
      method: 'GET',
      ...fetchOptions
    }, retries, retryDelay)

    if (!response.ok) {
      const errorData = await parseErrorResponse(response)
      throw new FetchError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText,
        errorData
      )
    }

    const data = await response.json()
    return { data }
  },

  async post<T = any>(url: string, data?: any, options: FetchOptions = {}): Promise<{ data: T }> {
    const { retries = 3, retryDelay = 1000, ...fetchOptions } = options
    const csrfToken = getCSRFToken()
    
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        ...fetchOptions.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...fetchOptions
    }, retries, retryDelay)

    if (!response.ok) {
      const errorData = await parseErrorResponse(response)
      throw new FetchError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText,
        errorData
      )
    }

    const responseData = await response.json()
    return { data: responseData }
  },

  async put<T = any>(url: string, data?: any, options: FetchOptions = {}): Promise<{ data: T }> {
    const { retries = 3, retryDelay = 1000, ...fetchOptions } = options
    const csrfToken = getCSRFToken()
    
    const response = await fetchWithRetry(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        ...fetchOptions.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...fetchOptions
    }, retries, retryDelay)

    if (!response.ok) {
      const errorData = await parseErrorResponse(response)
      throw new FetchError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText,
        errorData
      )
    }

    const responseData = await response.json()
    return { data: responseData }
  },

  async delete<T = any>(url: string, options: FetchOptions = {}): Promise<{ data: T }> {
    const { retries = 3, retryDelay = 1000, ...fetchOptions } = options
    const csrfToken = getCSRFToken()
    
    const response = await fetchWithRetry(url, {
      method: 'DELETE',
      headers: {
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        ...fetchOptions.headers
      },
      ...fetchOptions
    }, retries, retryDelay)

    if (!response.ok) {
      const errorData = await parseErrorResponse(response)
      throw new FetchError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText,
        errorData
      )
    }

    const responseData = await response.json()
    return { data: responseData }
  }
}

// Error handling utilities
export const errorUtils = {
  getErrorMessage(error: unknown): string {
    if (error instanceof FetchError) {
      if (error.isNetworkError) {
        return 'Unable to connect to the server. Please check your internet connection.'
      }
      if (error.isTimeout) {
        return 'Request timed out. Please try again.'
      }
      if (error.status === 401) {
        return 'You need to log in to access this resource.'
      }
      if (error.status === 403) {
        return 'You do not have permission to access this resource.'
      }
      if (error.status === 404) {
        return 'The requested resource was not found.'
      }
      if (error.status === 429) {
        return 'Too many requests. Please try again later.'
      }
      if (error.status >= 500) {
        return 'Server error. Please try again later.'
      }
      return error.response.message || error.message
    }
    
    if (error instanceof Error) {
      return error.message
    }
    
    return 'An unexpected error occurred'
  },
  
  isNetworkError(error: unknown): boolean {
    return error instanceof FetchError && error.isNetworkError
  },
  
  isAuthError(error: unknown): boolean {
    return error instanceof FetchError && (error.status === 401 || error.status === 403)
  },
  
  isValidationError(error: unknown): boolean {
    return error instanceof FetchError && error.status === 422
  },
  
  getValidationErrors(error: unknown): Record<string, string[]> {
    if (error instanceof FetchError && error.response.errors) {
      return error.response.errors
    }
    return {}
  }
}

// Create axios-compatible wrapper
export const axios = {
  get: httpClient.get,
  post: httpClient.post,
  put: httpClient.put,
  delete: httpClient.delete,
  
  // For compatibility
  create: (config?: any) => httpClient
}