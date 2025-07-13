'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from '@/lib/motion'
import { FiInfo, FiCheckCircle, FiAlertCircle, FiXCircle, FiHelpCircle } from '@/lib/icons'

interface HadithGradeExplainerProps {
  grade: 'sahih' | 'hasan' | 'da\'if' | 'mawdu\'' | string
  gradeText: string
  scholars?: Array<{
    name: string
    grade: string
    comments?: string
  }>
}

const gradeInfo = {
  sahih: {
    title: 'Sahih (Authentic)',
    arabicTitle: 'صحيح',
    color: 'text-islamic-400',
    bgColor: 'bg-islamic-500/20',
    icon: FiCheckCircle,
    description: 'This hadith meets all criteria for authenticity. The chain of narrators is continuous, all narrators are trustworthy and have precise memory, and the hadith contains no irregularities or defects.',
    criteria: [
      'Continuous chain of narration (Ittisal al-Sanad)',
      'All narrators are trustworthy (\'Adl)',
      'All narrators have precise memory (Dabt)',
      'No irregularities (Shudhudh)',
      'No hidden defects (\'Illah)'
    ]
  },
  hasan: {
    title: 'Hasan (Good)',
    arabicTitle: 'حسن',
    color: 'text-gold-400',
    bgColor: 'bg-gold-500/20',
    icon: FiCheckCircle,
    description: 'This hadith is acceptable and can be used as evidence. It meets most criteria for authenticity but may have minor issues, such as a narrator with slightly less precise memory.',
    criteria: [
      'Continuous chain of narration',
      'Narrators are trustworthy',
      'Minor weakness in memory of some narrators',
      'No serious irregularities',
      'Can be used for legal rulings'
    ]
  },
  'da\'if': {
    title: 'Da\'if (Weak)',
    arabicTitle: 'ضعيف',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    icon: FiAlertCircle,
    description: 'This hadith has weakness in its chain or text. It should not be used for establishing religious rulings but may be mentioned for encouragement in good deeds with disclosure of its weakness.',
    criteria: [
      'Break in the chain of narration',
      'Narrator with questionable reliability',
      'Narrator with poor memory',
      'Contradicts stronger narrations',
      'Should not be used for legal rulings'
    ]
  },
  mawdu: {
    title: 'Mawdu\' (Fabricated)',
    arabicTitle: 'موضوع',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    icon: FiXCircle,
    description: 'This narration is fabricated and falsely attributed to the Prophet (ﷺ). It should not be narrated except to warn against it.',
    criteria: [
      'Contains known liar in the chain',
      'Contradicts established Islamic principles',
      'Content is clearly fabricated',
      'Must not be narrated as hadith',
      'Should only be mentioned to warn others'
    ]
  }
}

export default function HadithGradeExplainer({ grade, gradeText, scholars = [] }: HadithGradeExplainerProps) {
  const [showDetails, setShowDetails] = useState(false)
  
  const gradeKey = grade === 'da\'if' ? 'da\'if' : grade === 'mawdu\'' ? 'mawdu' : grade
  const info = gradeInfo[gradeKey as keyof typeof gradeInfo] || {
    title: gradeText || 'Unknown',
    arabicTitle: 'غير معروف',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    icon: FiHelpCircle,
    description: 'The authenticity grade of this hadith is not clearly defined.',
    criteria: []
  }
  
  const Icon = info.icon
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${info.bgColor} ${info.color} 
                   font-semibold text-sm hover:opacity-80 transition-opacity cursor-pointer`}
      >
        <Icon className="w-4 h-4" />
        <span>{info.title}</span>
        <FiInfo className="w-3 h-3" />
      </button>
      
      <AnimatePresence>
        {showDetails && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowDetails(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg 
                         glass-card p-6 z-50 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${info.bgColor}`}>
                  <Icon className={`w-6 h-6 ${info.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{info.title}</h3>
                  <p className="text-2xl font-arabic text-gold-400">{info.arabicTitle}</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">{info.description}</p>
              
              {/* Criteria */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Criteria & Characteristics:</h4>
                <ul className="space-y-2">
                  {info.criteria.map((criterion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className={`mt-1 ${info.color}`}>•</span>
                      <span className="text-sm text-gray-300">{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Scholar Opinions */}
              {scholars.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Scholar Opinions:</h4>
                  <div className="space-y-3">
                    {scholars.map((scholar, index) => (
                      <div key={index} className="glass-card p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{scholar.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            gradeInfo[scholar.grade.toLowerCase() as keyof typeof gradeInfo]?.bgColor || 'bg-gray-500/20'
                          } ${
                            gradeInfo[scholar.grade.toLowerCase() as keyof typeof gradeInfo]?.color || 'text-gray-400'
                          }`}>
                            {scholar.grade}
                          </span>
                        </div>
                        {scholar.comments && (
                          <p className="text-sm text-gray-400">{scholar.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Additional Information */}
              <div className="p-4 rounded-lg bg-glass-light text-sm text-gray-400">
                <p className="flex items-start gap-2">
                  <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    The science of hadith authentication (\'Ilm al-Hadith) is a sophisticated 
                    discipline developed by Islamic scholars to preserve the authentic teachings 
                    of Prophet Muhammad (ﷺ).
                  </span>
                </p>
              </div>
              
              <button
                onClick={() => setShowDetails(false)}
                className="mt-6 w-full py-3 rounded-xl bg-islamic-500 hover:bg-islamic-600 
                         text-white font-semibold transition-colors"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}