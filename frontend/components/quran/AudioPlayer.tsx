'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from '@/lib/motion'
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiRepeat, FiVolume2, FiSettings } from '@/lib/icons'

interface Reciter {
  identifier: string
  name: string
  englishName: string
  language: string
}

const reciters: Reciter[] = [
  { identifier: 'ar.alafasy', name: 'مشاري العفاسي', englishName: 'Mishary Rashid Alafasy', language: 'ar' },
  { identifier: 'ar.abdurrahmaansudais', name: 'عبدالرحمن السديس', englishName: 'Abdul Rahman Al-Sudais', language: 'ar' },
  { identifier: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', englishName: 'Maher Al-Muaiqly', language: 'ar' },
  { identifier: 'ar.minshawi', name: 'محمد صديق المنشاوي', englishName: 'Mohamed Siddiq Al-Minshawi', language: 'ar' },
  { identifier: 'ar.husary', name: 'محمود خليل الحصري', englishName: 'Mahmoud Khalil Al-Hussary', language: 'ar' },
]

interface AudioPlayerProps {
  surahNumber: number
  currentAyah: number
  totalAyahs: number
  onAyahChange: (ayah: number) => void
  onPlay: () => void
  onPause: () => void
}

export function AudioPlayer({
  surahNumber,
  currentAyah,
  totalAyahs,
  onAyahChange,
  onPlay,
  onPause,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedReciter, setSelectedReciter] = useState(reciters[0])
  const [volume, setVolume] = useState(1)
  const [showReciterMenu, setShowReciterMenu] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const fetchAudioUrl = async (ayahNumber: number) => {
    try {
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/${selectedReciter.identifier}`
      )
      const data = await response.json()
      const ayah = data.data.ayahs.find((a: any) => a.numberInSurah === ayahNumber)
      return ayah?.audio || null
    } catch (error) {
      console.error('Error fetching audio:', error)
      return null
    }
  }
  
  const playAyah = async (ayahNumber: number) => {
    const audioUrl = await fetchAudioUrl(ayahNumber)
    if (!audioUrl || !audioRef.current) return
    
    audioRef.current.src = audioUrl
    audioRef.current.playbackRate = playbackSpeed
    audioRef.current.play()
    setIsPlaying(true)
    onPlay()
  }
  
  const togglePlayPause = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      onPause()
    } else {
      if (!audioRef.current.src) {
        playAyah(currentAyah)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
        onPlay()
      }
    }
  }
  
  const handlePrevious = () => {
    if (currentAyah > 1) {
      onAyahChange(currentAyah - 1)
      playAyah(currentAyah - 1)
    }
  }
  
  const handleNext = () => {
    if (currentAyah < totalAyahs) {
      onAyahChange(currentAyah + 1)
      playAyah(currentAyah + 1)
    }
  }
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])
  
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentAyah === 1}
            className="p-3 rounded-full hover:bg-glass-light transition-colors disabled:opacity-50"
          >
            <FiSkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-4 rounded-full bg-islamic-500 hover:bg-islamic-600 transition-colors text-white"
          >
            {isPlaying ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6" />}
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentAyah === totalAyahs}
            className="p-3 rounded-full hover:bg-glass-light transition-colors disabled:opacity-50"
          >
            <FiSkipForward className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`p-3 rounded-full transition-colors ${
              isRepeat ? 'bg-islamic-500/20 text-islamic-400' : 'hover:bg-glass-light'
            }`}
          >
            <FiRepeat className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FiVolume2 className="w-5 h-5 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24"
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowReciterMenu(!showReciterMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-glass-light transition-colors"
            >
              <span className="text-sm">{selectedReciter.englishName}</span>
              <FiSettings className="w-4 h-4" />
            </button>
            
            {showReciterMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 glass-card p-4 min-w-[250px] z-20"
              >
                <h4 className="font-semibold mb-3">Select Reciter</h4>
                <div className="space-y-2">
                  {reciters.map((reciter) => (
                    <button
                      key={reciter.identifier}
                      onClick={() => {
                        setSelectedReciter(reciter)
                        setShowReciterMenu(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedReciter.identifier === reciter.identifier
                          ? 'bg-islamic-500/20 text-islamic-400'
                          : 'hover:bg-glass-light'
                      }`}
                    >
                      <p className="font-arabic text-lg">{reciter.name}</p>
                      <p className="text-sm text-gray-400">{reciter.englishName}</p>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-glass-border">
                  <label className="text-sm text-gray-400">Playback Speed</label>
                  <div className="flex gap-2 mt-2">
                    {[0.5, 0.75, 1, 1.25, 1.5].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          playbackSpeed === speed
                            ? 'bg-islamic-500 text-white'
                            : 'hover:bg-glass-light'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Ayah {currentAyah} of {totalAyahs}</span>
        <span>{selectedReciter.englishName}</span>
      </div>
      
      <audio
        ref={audioRef}
        onEnded={() => {
          if (isRepeat) {
            playAyah(currentAyah)
          } else if (currentAyah < totalAyahs) {
            handleNext()
          } else {
            setIsPlaying(false)
            onPause()
          }
        }}
      />
    </div>
  )
}