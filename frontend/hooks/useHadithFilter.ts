import { useState, useEffect, useMemo } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

interface Hadith {
  id: number
  book_id: number
  hadith_number: number
  arabic_text: string
  english_text: string
  narrator_chain: string
  grade: string | null
  reference: string
}

export function useHadithFilter(hadiths: Hadith[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBook, setSelectedBook] = useState<number | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const filteredHadiths = useMemo(() => {
    let filtered = hadiths
    
    // Search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(hadith => 
        hadith.english_text.toLowerCase().includes(query) ||
        hadith.arabic_text.includes(debouncedSearchQuery) ||
        (hadith.narrator_chain && hadith.narrator_chain.toLowerCase().includes(query)) ||
        hadith.reference.toLowerCase().includes(query)
      )
    }
    
    // Book filter
    if (selectedBook !== null) {
      filtered = filtered.filter(hadith => hadith.book_id === selectedBook)
    }
    
    // Grade filter
    if (selectedGrade) {
      filtered = filtered.filter(hadith => hadith.grade === selectedGrade)
    }
    
    return filtered
  }, [debouncedSearchQuery, selectedBook, selectedGrade, hadiths])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedBook(null)
    setSelectedGrade(null)
  }

  const hasActiveFilters = searchQuery || selectedGrade || selectedBook !== null

  return {
    searchQuery,
    setSearchQuery,
    selectedBook,
    setSelectedBook,
    selectedGrade,
    setSelectedGrade,
    showFilters,
    setShowFilters,
    filteredHadiths,
    clearFilters,
    hasActiveFilters
  }
}