import { memo } from 'react'
import { motion } from '@/lib/motion'
import { FiVolume2, FiCopy, FiBookmark, FiShare2 } from '@/lib/icons'

interface AyahCardProps {
  ayah: {
    number: number
    text: string
    numberInSurah: number
  }
  translation?: {
    text: string
  }
  fontSize: string
  showTranslation: boolean
  index: number
  onPlayAudio: (ayahNumber: number) => void
  onCopyAyah: (ayahNumber: number) => void
  onSaveBookmark: (ayahNumber: number) => void
}

export const AyahCard = memo(function AyahCard({
  ayah,
  translation,
  fontSize,
  showTranslation,
  index,
  onPlayAudio,
  onCopyAyah,
  onSaveBookmark
}: AyahCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-6 hover:bg-glass-light transition-colors group"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-islamic-500/20 text-islamic-400 font-bold">
          {ayah.numberInSurah}
        </span>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onPlayAudio(ayah.numberInSurah)}
            className="p-2 rounded-full hover:bg-glass-light transition-colors"
            title="Play audio"
          >
            <FiVolume2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onCopyAyah(ayah.numberInSurah)}
            className="p-2 rounded-full hover:bg-glass-light transition-colors"
            title="Copy ayah"
          >
            <FiCopy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSaveBookmark(ayah.numberInSurah)}
            className="p-2 rounded-full hover:bg-glass-light transition-colors"
            title="Bookmark"
          >
            <FiBookmark className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-glass-light transition-colors"
            title="Share"
          >
            <FiShare2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className={`${fontSize} font-arabic text-right leading-loose mb-4`}>
        {ayah.text}
      </p>
      
      {showTranslation && translation && (
        <p className="text-gray-300 leading-relaxed">
          {translation.text}
        </p>
      )}
    </motion.div>
  )
})