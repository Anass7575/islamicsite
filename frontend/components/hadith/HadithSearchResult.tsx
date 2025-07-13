import { memo } from 'react'
import { motion } from '@/lib/motion'
import Link from 'next/link'

interface HadithSearchResultProps {
  hadith: {
    id: number
    collection_name: string
    hadith_number: number
    english_text: string
    arabic_text: string
    narrator_chain: string | null
    grade: string | null
    reference: string
  }
  index: number
}

export const HadithSearchResult = memo(function HadithSearchResult({ 
  hadith, 
  index 
}: HadithSearchResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="glass-card hadith-card hover:bg-glass-light transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          {hadith.grade && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              hadith.grade === 'sahih' 
                ? 'bg-islamic-500/20 text-islamic-400' 
                : hadith.grade === 'hasan'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-gold-500/20 text-gold-400'
            }`}>
              {hadith.grade}
            </span>
          )}
        </div>
        <span className="text-sm text-gray-400">{hadith.reference}</span>
      </div>
      
      <div className="hadith-content">
        {hadith.arabic_text && (
          <div className="hadith-arabic-section">
            <div className="arabic-text" dir="rtl">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: hadith.arabic_text.substring(0, 200) + (hadith.arabic_text.length > 200 ? '...' : '') 
                }} 
              />
            </div>
          </div>
        )}
        
        {(hadith.arabic_text && hadith.english_text) && (
          <hr className="hadith-separator" />
        )}
        
        {hadith.english_text && (
          <div className="hadith-english-section">
            <div className="text-gray-300">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: hadith.english_text.substring(0, 200) + (hadith.english_text.length > 200 ? '...' : '') 
                }} 
              />
            </div>
          </div>
        )}
        
        {hadith.narrator_chain && (
          <p className="text-sm text-gray-400 italic mt-2">
            {hadith.narrator_chain}
          </p>
        )}
      </div>
    </motion.div>
  )
})