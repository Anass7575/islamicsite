'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/services/apiClient'
import toast from 'react-hot-toast'

interface User {
  id: number
  email: string
  username: string
  full_name?: string
  is_active: boolean
  is_verified: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string, full_name?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Check if component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!mounted) {
        return
      }
      
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        if (token) {
          try {
            const response = await apiClient.get('/api/users/profile')
            setUser(response.data)
          } catch (error) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
            }
          }
        }
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [mounted])

  const login = async (email: string, password: string) => {
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)
      
      const response = await apiClient.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      const { access_token, refresh_token } = response.data
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
      }
      
      // Get user profile
      const userResponse = await apiClient.get('/api/users/profile')
      setUser(userResponse.data)
      
      toast.success('Welcome back!')
      router.push('/')
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed')
    }
  }

  const register = async (email: string, username: string, password: string, full_name?: string) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        email,
        username,
        password,
        full_name,
      })
      
      toast.success('Account created successfully!')
      // Auto login after registration
      await login(email, password)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed')
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    setUser(null)
    toast.success('Logged out successfully')
    router.push('/')
  }

  // Provide loading state during SSR or initial mount
  const value = {
    user: mounted ? user : null,
    loading: !mounted || loading,
    login,
    register,
    logout,
    isAuthenticated: mounted ? !!user : false,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}