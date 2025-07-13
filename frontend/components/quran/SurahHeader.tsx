import { motion } from '@/lib/motion'
import Link from 'next/link'
import { FiChevronLeft, FiSettings } from '@/lib/icons'

interface SurahInfo {
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
}

interface SurahHeaderProps {
  surahInfo: SurahInfo
  surahNumber: number
  showSettings: boolean
  onToggleSettings: () => void
}

export function SurahHeader({ 
  surahInfo, 
  surahNumber, 
  showSettings, 
  onToggleSettings 
}: SurahHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <Link href="/quran">
          <button className="p-2 rounded-full hover:bg-glass-light transition-colors">
            <FiChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-1">
            <span className="text-gradient">{surahInfo.englishName}</span>
          </h1>
          <p className="text-xl font-arabic text-gold-400">{surahInfo.name}</p>
          <p className="text-gray-400">{surahInfo.englishNameTranslation}</p>
        </div>
        
        <button
          onClick={onToggleSettings}
          className="p-2 rounded-full hover:bg-glass-light transition-colors"
        >
          <FiSettings className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
        <span>{surahInfo.numberOfAyahs} verses</span>
        <span>{surahInfo.revelationType}</span>
        <span>Surah {surahNumber}</span>
      </div>
    </motion.div>
  )
}