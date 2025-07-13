import { memo } from 'react'
import { motion } from '@/lib/motion'
import { FiCopy, FiBookmark, FiShare2 } from '@/lib/icons'
import Link from 'next/link'
import HadithGradeExplainer from '@/components/HadithGradeExplainer'

interface HadithCardProps {
  hadith: any
  index: number
  onCopy: (hadith: any) => void | Promise<void>
  onBookmark: (hadith: any) => void | Promise<void>
  onShare: (hadith: any) => void | Promise<void>
}

export const HadithCard = memo(function HadithCard({
  hadith,
  index,
  onCopy,
  onBookmark,
  onShare
}: HadithCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card hadith-card hover:bg-glass-light transition-colors group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <span className="inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-full bg-islamic-500/20 text-islamic-400 font-bold">
            {hadith.hadith_number}
          </span>
          <div>
            <div className="flex items-center gap-2 mb-2">
              {hadith.grade && (
                <HadithGradeExplainer 
                  grade={hadith.grade} 
                  gradeText={hadith.grade_text || hadith.grade}
                />
              )}
              {hadith.reference && (
                <span className="text-sm text-gray-400">
                  {hadith.reference}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onCopy(hadith)}
            className="p-2 rounded-full hover:bg-glass-light transition-colors"
            title="Copy hadith"
          >
            <FiCopy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onBookmark(hadith)}
            className="p-2 rounded-full hover:bg-glass-light transition-colors"
            title="Bookmark"
          >
            <FiBookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => onShare(hadith)}
            className="p-2 rounded-full hover:bg-glass-light transition-colors"
            title="Share"
          >
            <FiShare2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="hadith-content">
        {hadith.arabic_text && (
          <div className="hadith-arabic-section">
            <div className="arabic-text arabic-text-large" dir="rtl">
              <div dangerouslySetInnerHTML={{ __html: hadith.arabic_text }} />
            </div>
          </div>
        )}
        
        {(hadith.arabic_text && hadith.english_text) && (
          <hr className="hadith-separator" />
        )}
        
        {hadith.english_text && (
          <div className="hadith-english-section">
            <div className="text-lg leading-relaxed text-gray-300">
              <div dangerouslySetInnerHTML={{ __html: hadith.english_text }} />
            </div>
          </div>
        )}
        
        {hadith.narrator_chain && (
          <p className="text-sm text-gray-400 italic mt-4">
            {hadith.narrator_chain}
          </p>
        )}
        
        {hadith.categories && hadith.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {hadith.categories.map((category: string) => (
              <Link key={category} href={`/hadith/category/${category}`}>
                <span className="px-3 py-1 rounded-full bg-glass-light text-xs hover:bg-glass-lighter transition-colors cursor-pointer">
                  {category}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
})