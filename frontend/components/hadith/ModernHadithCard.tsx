import { memo, useState } from 'react'
import { motion, AnimatePresence } from '@/lib/motion'
import { FiCopy, FiBookmark, FiShare2, FiCheck, FiBookOpen } from '@/lib/icons'
import Link from 'next/link'
import HadithGradeExplainer from '@/components/HadithGradeExplainer'

interface HadithCardProps {
  hadith: any
  index: number
  onCopy: (hadith: any) => void | Promise<void>
  onBookmark: (hadith: any) => void | Promise<void>
  onShare: (hadith: any) => void | Promise<void>
}

export const ModernHadithCard = memo(function ModernHadithCard({
  hadith,
  index,
  onCopy,
  onBookmark,
  onShare
}: HadithCardProps) {
  const [copied, setCopied] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const handleCopy = async () => {
    await onCopy(hadith)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBookmark = async () => {
    await onBookmark(hadith)
    setBookmarked(!bookmarked)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="hadith-card group relative"
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          {/* Hadith Number */}
          <div className="hadith-number">
            {hadith.hadith_number}
          </div>
          
          {/* Metadata */}
          <div className="space-y-1">
            {/* Collection & Book */}
            <div className="flex items-center gap-2 text-sm text-primary-500">
              <FiBookOpen className="w-4 h-4" />
              <span>{hadith.collection_name || 'Collection'}</span>
              {hadith.book_name && (
                <>
                  <span className="text-primary-300">•</span>
                  <span>{hadith.book_name}</span>
                </>
              )}
            </div>
            
            {/* Grade */}
            {hadith.grade && (
              <div className="flex items-center gap-2">
                <HadithGradeExplainer 
                  grade={hadith.grade} 
                  gradeText={hadith.grade_text || hadith.grade}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-primary-100 hover:bg-opacity-10 transition-colors"
            title="Copy hadith"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <FiCheck className="w-4 h-4 text-accent-green" />
                </motion.div>
              ) : (
                <motion.div key="copy">
                  <FiCopy className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBookmark}
            className="p-2 rounded-lg hover:bg-primary-100 hover:bg-opacity-10 transition-colors"
            title="Bookmark"
          >
            <FiBookmark 
              className={`w-4 h-4 transition-colors ${
                bookmarked ? 'fill-accent-gold text-accent-gold' : ''
              }`} 
            />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onShare(hadith)}
            className="p-2 rounded-lg hover:bg-primary-100 hover:bg-opacity-10 transition-colors"
            title="Share"
          >
            <FiShare2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="space-y-6">
        {/* Arabic Text */}
        {hadith.arabic_text && (
          <div className="relative">
            {/* Subtle Islamic Pattern Background */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <pattern id="star" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" 
                    fill="currentColor" className="text-accent-gold" />
                </pattern>
                <rect width="100" height="100" fill="url(#star)" />
              </svg>
            </div>
            
            <div className="arabic p-6 rounded-xl bg-accent-gold bg-opacity-5 border border-accent-gold border-opacity-10">
              <div dangerouslySetInnerHTML={{ __html: hadith.arabic_text }} />
            </div>
          </div>
        )}
        
        {/* Divider */}
        {hadith.arabic_text && hadith.english_text && (
          <div className="flex items-center justify-center">
            <div className="w-full h-px bg-primary-100 bg-opacity-20" />
            <div className="px-4">
              <svg className="w-6 h-6 text-accent-gold opacity-50" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2L14.4,9.6L22,12L14.4,14.4L12,22L9.6,14.4L2,12L9.6,9.6L12,2Z" />
              </svg>
            </div>
            <div className="w-full h-px bg-primary-100 bg-opacity-20" />
          </div>
        )}
        
        {/* English Text */}
        {hadith.english_text && (
          <div className="english text-primary-700 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: hadith.english_text }} />
          </div>
        )}
        
        {/* Narrator Chain */}
        {hadith.narrator_chain && (
          <p className="text-sm text-primary-500 italic border-l-2 border-accent-gold border-opacity-30 pl-4">
            {hadith.narrator_chain}
          </p>
        )}
        
        {/* Categories */}
        {hadith.categories && hadith.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {hadith.categories.map((category: string, idx: number) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <Link 
                  href={`/hadith/category/${category}`}
                  className="inline-flex items-center px-3 py-1 rounded-lg bg-primary-100 bg-opacity-10 text-sm text-primary-700 hover:bg-opacity-20 transition-colors"
                >
                  {category}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  )
})