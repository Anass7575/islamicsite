// Lightweight fetch wrapper to replace axios

interface FetchOptions extends RequestInit {
  params?: Record<string, any>
  timeout?: number
}

class FetchError extends Error {
  status: number
  statusText: string
  response: any

  constructor(message: string, status: number, statusText: string, response: any) {
    super(message)
    this.name = 'FetchError'
    this.status = status
    this.statusText = statusText
    this.response = response
  }
}

async function fetchWithTimeout(url: string, options: FetchOptions = {}, timeout = 30000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export const httpClient = {
  async get(url: string, options: FetchOptions = {}) {
    const { params, ...fetchOptions } = options
    
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

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      ...fetchOptions
    }, options.timeout)

    if (!response.ok) {
      const error = new FetchError(
        `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText,
        await response.text()
      )
      throw error
    }

    // Parse JSON response
    const data = await response.json()
    return { data }
  },

  async post(url: string, data?: any, options: FetchOptions = {}) {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    }, options.timeout)

    if (!response.ok) {
      const error = new FetchError(
        `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText,
        await response.text()
      )
      throw error
    }

    const responseData = await response.json()
    return { data: responseData }
  },

  async put(url: string, data?: any, options: FetchOptions = {}) {
    const response = await fetchWithTimeout(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    }, options.timeout)

    if (!response.ok) {
      const error = new FetchError(
        `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText,
        await response.text()
      )
      throw error
    }

    const responseData = await response.json()
    return { data: responseData }
  },

  async delete(url: string, options: FetchOptions = {}) {
    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
      ...options
    }, options.timeout)

    if (!response.ok) {
      const error = new FetchError(
        `HTTP error! status: ${response.status}`,
        response.status,
        response.statusText,
        await response.text()
      )
      throw error
    }

    const responseData = await response.json()
    return { data: responseData }
  }
}

// Create axios-compatible wrapper
export const axios = {
  get: httpClient.get,
  post: httpClient.post,
  put: httpClient.put,
  delete: httpClient.delete,
  
  // For compatibility
  create: (config?: any) => {
    // Return the same httpClient (we don't need instance config for our use case)
    return httpClient
  }
}