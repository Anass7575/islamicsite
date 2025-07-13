import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for debouncing callbacks
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  dependencies: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay, ...dependencies]
  ) as T

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Hook for search with debouncing and loading state
 */
interface UseSearchOptions {
  delay?: number
  minLength?: number
  onSearch: (query: string) => void | Promise<void>
}

export function useSearch({
  delay = 300,
  minLength = 2,
  onSearch
}: UseSearchOptions) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const debouncedQuery = useDebounce(query, delay)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (debouncedQuery.length >= minLength) {
      // Cancel previous search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      const performSearch = async () => {
        setIsSearching(true)
        try {
          await onSearch(debouncedQuery)
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            throw error
          }
        } finally {
          setIsSearching(false)
        }
      }

      performSearch()
    } else {
      setIsSearching(false)
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [debouncedQuery, minLength, onSearch])

  return {
    query,
    setQuery,
    debouncedQuery,
    isSearching,
    abortController: abortControllerRef.current
  }
}

/**
 * Hook for throttling values
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * Hook for throttling callbacks
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const lastRan = useRef(Date.now())
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRan.current >= limit) {
        callbackRef.current(...args)
        lastRan.current = Date.now()
      }
    },
    [limit]
  ) as T

  return throttledCallback
}
