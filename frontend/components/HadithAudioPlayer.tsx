'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from '@/lib/motion'
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiRepeat, FiSkipBack, FiSkipForward } from '@/lib/icons'

interface HadithAudioPlayerProps {
  arabicText: string
  hadithId: string
  onNextHadith?: () => void
  onPreviousHadith?: () => void
}

export default function HadithAudioPlayer({ 
  arabicText, 
  hadithId,
  onNextHadith,
  onPreviousHadith
}: HadithAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  // Generate audio using browser's speech synthesis API as fallback
  const generateAudio = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // In a real implementation, this would call an API to get audio
      // For now, we'll use the browser's speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(arabicText)
        utterance.lang = 'ar-SA' // Arabic (Saudi Arabia)
        utterance.rate = playbackRate
        
        utterance.onstart = () => {
          setIsPlaying(true)
          setIsLoading(false)
        }
        
        utterance.onend = () => {
          setIsPlaying(false)
        }
        
        utterance.onerror = () => {
          setError('Failed to play audio')
          setIsPlaying(false)
          setIsLoading(false)
        }
        
        window.speechSynthesis.speak(utterance)
      } else {
        setError('Audio playback not supported in this browser')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Failed to generate audio')
      setIsLoading(false)
    }
  }
  
  const togglePlayPause = () => {
    if (isPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.pause()
      }
      setIsPlaying(false)
    } else {
      if ('speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
        setIsPlaying(true)
      } else {
        generateAudio()
      }
    }
  }
  
  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
    setCurrentTime(0)
  }
  
  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate)
    if (isPlaying) {
      stopAudio()
      generateAudio()
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Audio Recitation</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg hover:bg-glass-light transition-colors"
          >
            {isMuted ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div 
          ref={progressRef}
          className="h-2 bg-glass-light rounded-full overflow-hidden cursor-pointer"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-islamic-400 to-islamic-600"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onPreviousHadith}
          disabled={!onPreviousHadith}
          className="p-3 rounded-full hover:bg-glass-light transition-colors disabled:opacity-50"
        >
          <FiSkipBack className="w-5 h-5" />
        </button>
        
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="p-4 rounded-full bg-islamic-500 hover:bg-islamic-600 transition-colors text-white"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <FiPause className="w-6 h-6" />
          ) : (
            <FiPlay className="w-6 h-6" />
          )}
        </button>
        
        <button
          onClick={onNextHadith}
          disabled={!onNextHadith}
          className="p-3 rounded-full hover:bg-glass-light transition-colors disabled:opacity-50"
        >
          <FiSkipForward className="w-5 h-5" />
        </button>
      </div>
      
      {/* Playback Speed */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-sm text-gray-400">Speed:</span>
        {[0.5, 0.75, 1, 1.25, 1.5].map(rate => (
          <button
            key={rate}
            onClick={() => handleRateChange(rate)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              playbackRate === rate 
                ? 'bg-islamic-500 text-white' 
                : 'hover:bg-glass-light'
            }`}
          >
            {rate}x
          </button>
        ))}
      </div>
      
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Note about audio */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Audio recitation is generated using text-to-speech. For authentic recitations, 
        please refer to verified sources.
      </p>
    </motion.div>
  )
}