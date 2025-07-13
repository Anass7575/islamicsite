'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ModernCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  delay?: number
}

export function ModernCard({ children, className = '', hover = true, delay = 0 }: ModernCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4 } : {}}
      className={`card ${className}`}
    >
      {children}
    </motion.div>
  )
}

// Feature Card Component
export function FeatureCard({ 
  icon, 
  title, 
  description,
  delay = 0 
}: {
  icon: ReactNode
  title: string
  description: string
  delay?: number
}) {
  return (
    <ModernCard delay={delay} className="group cursor-pointer">
      <div className="flex flex-col h-full">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <div className="text-primary-600 dark:text-primary-400">
            {icon}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-1">
          {description}
        </p>
        
        <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:gap-2 transition-all">
          Learn more
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </ModernCard>
  )
}

// Verse Card Component
export function VerseCard({ 
  arabic, 
  translation, 
  reference,
  delay = 0 
}: {
  arabic: string
  translation: string
  reference: string
  delay?: number
}) {
  return (
    <ModernCard delay={delay} hover={false} className="text-center">
      <div className="space-y-4">
        <p className="text-2xl font-arabic text-gray-900 dark:text-white leading-relaxed">
          {arabic}
        </p>
        
        <p className="text-gray-600 dark:text-gray-400 italic">
          "{translation}"
        </p>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
            {reference}
          </p>
        </div>
      </div>
    </ModernCard>
  )
}

// Stats Card Component
export function StatsCard({ 
  value, 
  label, 
  icon,
  delay = 0 
}: {
  value: string
  label: string
  icon?: ReactNode
  delay?: number
}) {
  return (
    <ModernCard delay={delay}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </div>
        </div>
        
        {icon && (
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <div className="text-primary-600 dark:text-primary-400">
              {icon}
            </div>
          </div>
        )}
      </div>
    </ModernCard>
  )
}