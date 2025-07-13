import { memo } from 'react'
import { motion } from '@/lib/motion'
import { FiPause, FiPlay, FiChevronLeft, FiChevronRight } from '@/lib/icons'
import { useRouter } from 'next/navigation'

interface AudioControlsProps {
  isPlaying: boolean
  currentAyah: number
  totalAyahs: number
  surahNumber: number
  onTogglePlay: () => void
}

export const AudioControls = memo(function AudioControls({
  isPlaying,
  currentAyah,
  totalAyahs,
  surahNumber,
  onTogglePlay
}: AudioControlsProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-4 mb-6 sticky top-20 z-10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onTogglePlay}
            className="p-3 rounded-full bg-islamic-500 hover:bg-islamic-600 transition-colors text-white"
          >
            {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
          </button>
          
          <div className="text-sm">
            <p className="font-semibold">Mishary Rashid Alafasy</p>
            <p className="text-gray-400">Ayah {currentAyah} of {totalAyahs}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => surahNumber > 1 && router.push(`/quran/${surahNumber - 1}`)}
            disabled={surahNumber === 1}
            className="p-2 rounded-full hover:bg-glass-light transition-colors disabled:opacity-50"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => surahNumber < 114 && router.push(`/quran/${surahNumber + 1}`)}
            disabled={surahNumber === 114}
            className="p-2 rounded-full hover:bg-glass-light transition-colors disabled:opacity-50"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
})