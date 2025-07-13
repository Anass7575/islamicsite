import { httpClient } from '@/lib/fetch'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

// Create a wrapper with auth headers
const apiClient = {
  async get(url: string, options?: any) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return httpClient.get(`${API_URL}${url}`, {
      ...options,
      headers: {
        ...options?.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
  },

  async post(url: string, data?: any, options?: any) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return httpClient.post(`${API_URL}${url}`, data, {
      ...options,
      headers: {
        ...options?.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
  },

  async put(url: string, data?: any, options?: any) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return httpClient.put(`${API_URL}${url}`, data, {
      ...options,
      headers: {
        ...options?.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
  },

  async delete(url: string, options?: any) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return httpClient.delete(`${API_URL}${url}`, {
      ...options,
      headers: {
        ...options?.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
  }
}

export default apiClient