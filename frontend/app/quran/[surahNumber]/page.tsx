'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from '@/lib/motion'
import { useParams } from 'next/navigation'
import { surahsData } from '@/data/surahs'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/services/apiClient'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'
import { useSurahData } from '@/hooks/useSurahData'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { SurahHeader } from '@/components/quran/SurahHeader'
import { AudioControls } from '@/components/quran/AudioControls'
import { AyahCard } from '@/components/quran/AyahCard'

export default function SurahReaderPage() {
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const surahNumber = parseInt(params.surahNumber as string)
  
  // Use custom hooks
  const { surahData, translationData, loading } = useSurahData(surahNumber)
  const { 
    audioRef, 
    isPlaying, 
    currentAyah, 
    playAyah, 
    togglePlayPause, 
    handleAudioEnded 
  } = useAudioPlayer(surahData)
  
  // Local state
  const [fontSize, setFontSize] = useState('text-3xl')
  const [showTranslation, setShowTranslation] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  
  const surahInfo = surahsData.find(s => s.number === surahNumber)
  
  const copyAyah = useCallback(async (ayahNumber: number) => {
    if (!surahData || !translationData) return
    
    const arabicAyah = surahData.ayahs.find(a => a.numberInSurah === ayahNumber)
    const translationAyah = translationData.ayahs.find(a => a.numberInSurah === ayahNumber)
    
    if (!arabicAyah) return
    
    const textToCopy = `${arabicAyah.text}\n\n${translationAyah?.text || ''}\n\n- ${surahData.englishName} ${surahData.number}:${ayahNumber}`
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      toast.success('Ayah copied to clipboard')
    } catch (error) {
      logger.error('Failed to copy ayah', error)
      toast.error('Failed to copy')
    }
  }, [surahData, translationData])
  
  const saveBookmark = useCallback(async (ayahNumber: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to save bookmarks')
      return
    }
    
    if (!surahData) return
    
    try {
      await apiClient.post('/api/bookmarks', {
        type: 'quran',
        surah_number: surahNumber,
        ayah_number: ayahNumber,
        title: `${surahData.englishName} ${surahNumber}:${ayahNumber}`,
        description: surahData.englishNameTranslation
      })
      toast.success('Bookmark saved')
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('Bookmark already exists')
      } else {
        logger.error('Failed to save bookmark', error)
        toast.error('Failed to save bookmark')
      }
    }
  }, [isAuthenticated, surahData, surahNumber])
  
  return loading ? (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 animate-pulse">
          <div className="h-8 bg-glass-light rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-glass-light rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : !surahData || !surahInfo ? null : (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <SurahHeader
          surahInfo={surahInfo}
          surahNumber={surahNumber}
          showSettings={showSettings}
          onToggleSettings={() => setShowSettings(!showSettings)}
        />
        
        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm">Font Size:</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="px-3 py-1 rounded-lg bg-glass-light border border-glass-border"
                >
                  <option value="text-2xl">Small</option>
                  <option value="text-3xl">Medium</option>
                  <option value="text-4xl">Large</option>
                  <option value="text-5xl">Extra Large</option>
                </select>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show Translation</span>
              </label>
            </div>
          </motion.div>
        )}
        
        {/* Audio Controls */}
        <AudioControls
          isPlaying={isPlaying}
          currentAyah={currentAyah}
          totalAyahs={surahData.numberOfAyahs}
          surahNumber={surahNumber}
          onTogglePlay={togglePlayPause}
        />
        
        {/* Bismillah (except for Surah 1 and 9) */}
        {surahNumber !== 1 && surahNumber !== 9 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <p className={`${fontSize} font-arabic text-gold-400`}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            {showTranslation && (
              <p className="text-gray-400 mt-2">Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux</p>
            )}
          </motion.div>
        )}
        
        {/* Ayahs */}
        <div className="space-y-6">
          {surahData.ayahs.map((ayah, index) => {
            const translation = translationData?.ayahs.find(
              t => t.numberInSurah === ayah.numberInSurah
            )
            
            return (
              <AyahCard
                key={ayah.number}
                ayah={ayah}
                translation={translation}
                fontSize={fontSize}
                showTranslation={showTranslation}
                index={index}
                onPlayAudio={playAyah}
                onCopyAyah={copyAyah}
                onSaveBookmark={saveBookmark}
              />
            )
          })}
        </div>
        
        {/* Audio Element */}
        <audio
          ref={audioRef}
          onEnded={handleAudioEnded}
        />
      </div>
    </div>
  )
}