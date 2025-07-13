import { memo } from 'react'
import { motion } from '@/lib/motion'
import Link from 'next/link'

interface HadithCategoryCardProps {
  category: {
    id: string
    name: string
    arabicName: string
    icon: string
    description: string
  }
  index: number
}

export const HadithCategoryCard = memo(function HadithCategoryCard({ 
  category, 
  index 
}: HadithCategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/hadith/category/${category.id}`}>
        <div className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer text-center group">
          <div className="text-4xl mb-3">{category.icon}</div>
          <h3 className="font-bold mb-1 group-hover:text-gradient transition-all">
            {category.name}
          </h3>
          <p className="text-lg font-arabic text-gold-400 mb-2">
            {category.arabicName}
          </p>
          <p className="text-xs text-gray-400">
            {category.description}
          </p>
        </div>
      </Link>
    </motion.div>
  )
})