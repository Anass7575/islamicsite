'use client'

import { motion } from '@/lib/motion'
import { useState } from 'react'
import { FiCopy, FiBookmark, FiShare2, FiCheck } from '@/lib/icons'
import { IslamicPatterns, OrnamentalDivider } from '@/components/ui/IslamicPatterns'

interface HadithCardProps {
  hadith: {
    id: number
    arabic_text: string
    english_text: string
    narrator_chain?: string
    reference: string
    grade?: string
  }
  index: number
  onCopy?: (hadith: any) => void
  onBookmark?: (hadith: any) => void
  onShare?: (hadith: any) => void
}

export function HadithCardStyled({ hadith, index, onCopy, onBookmark, onShare }: HadithCardProps) {
  const [copied, setCopied] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const handleCopy = () => {
    onCopy?.(hadith)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBookmark = () => {
    onBookmark?.(hadith)
    setBookmarked(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <div className="card card-pattern hover:shadow-gold transition-all duration-500">
        {/* Hadith Number Badge */}
        <motion.div 
          className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-gold-soft to-gold-muted rounded-full flex items-center justify-center text-white font-bold shadow-gold"
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {hadith.id}
        </motion.div>

        {/* Arabic Text */}
        <div className="mb-6">
          <motion.div 
            className="arabic text-3xl md:text-4xl text-emerald-deep dark:text-emerald-light leading-loose text-right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
          >
            {hadith.arabic_text}
          </motion.div>
        </div>

        <OrnamentalDivider />

        {/* English Translation */}
        <div className="mb-6">
          <motion.p 
            className="text-lg text-[var(--text-secondary)] leading-relaxed italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
          >
            "{hadith.english_text}"
          </motion.p>
        </div>

        {/* Narrator Chain */}
        {hadith.narrator_chain && (
          <motion.div 
            className="mb-4 p-3 bg-cream-light/50 dark:bg-sage-dark/20 rounded-organic-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: index * 0.1 + 0.6 }}
          >
            <p className="text-sm text-sage dark:text-sage-light">
              <span className="font-semibold">Chain of Narration:</span> {hadith.narrator_chain}
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center space-x-4">
            {/* Reference */}
            <span className="text-sm text-[var(--text-muted)]">{hadith.reference}</span>
            
            {/* Grade Badge */}
            {hadith.grade && (
              <span className={`
                px-3 py-1 rounded-full text-xs font-medium
                ${hadith.grade === 'sahih' 
                  ? 'bg-emerald-deep/10 text-emerald-deep' 
                  : 'bg-gold-soft/10 text-gold-soft'
                }
              `}>
                {hadith.grade}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-emerald-deep/10 text-emerald-deep transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Copy hadith"
            >
              {copied ? (
                <FiCheck className="w-5 h-5 text-emerald-deep" />
              ) : (
                <FiCopy className="w-5 h-5" />
              )}
            </motion.button>

            <motion.button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-all ${
                bookmarked 
                  ? 'bg-gold-soft/20 text-gold-soft' 
                  : 'hover:bg-gold-soft/10 text-gold-soft/70'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Bookmark hadith"
            >
              <FiBookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
            </motion.button>

            <motion.button
              onClick={() => onShare?.(hadith)}
              className="p-2 rounded-lg hover:bg-emerald-deep/10 text-emerald-deep transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Share hadith"
            >
              <FiShare2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}