import { useState, useRef, useCallback } from 'react'

interface Ayah {
  numberInSurah: number
  audio: string
}

interface SurahData {
  numberOfAyahs: number
  ayahs: Ayah[]
}

export function useAudioPlayer(surahData: SurahData | null) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAyah, setCurrentAyah] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  const playAyah = useCallback((ayahNumber: number) => {
    if (!surahData) return
    
    const ayah = surahData.ayahs.find(a => a.numberInSurah === ayahNumber)
    if (!ayah) return
    
    if (audioRef.current) {
      audioRef.current.src = ayah.audio
      audioRef.current.play()
      setIsPlaying(true)
      setCurrentAyah(ayahNumber)
    }
  }, [surahData])

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      if (!audioRef.current.src && surahData) {
        playAyah(1)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }, [isPlaying, surahData, playAyah])

  const handleAudioEnded = useCallback(() => {
    if (!surahData) return
    
    if (currentAyah < surahData.numberOfAyahs) {
      playAyah(currentAyah + 1)
    } else {
      setIsPlaying(false)
    }
  }, [currentAyah, surahData, playAyah])

  return {
    audioRef,
    isPlaying,
    currentAyah,
    playAyah,
    togglePlayPause,
    handleAudioEnded
  }
}