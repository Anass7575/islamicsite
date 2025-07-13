'use client'

import { useState } from 'react'
import { motion } from '@/lib/motion'
import { FiDownload } from '@/lib/icons'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface ExportHadithButtonProps {
  collectionId?: string
  hadithIds?: number[]
  limit?: number
}

export function ExportHadithButton({ 
  collectionId, 
  hadithIds, 
  limit = 100 
}: ExportHadithButtonProps) {
  const [loading, setLoading] = useState(false)

  const exportToPDF = async () => {
    setLoading(true)
    
    try {
      // Build query parameters
      const params = new URLSearchParams()
      if (collectionId) params.append('collection_id', collectionId)
      if (hadithIds && hadithIds.length > 0) {
        params.append('hadith_ids', hadithIds.join(','))
      }
      params.append('limit', limit.toString())
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      const response = await fetch(`${apiUrl}/hadith/export/pdf?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to export PDF')
      }
      
      // Create blob from response
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hadiths_${collectionId || 'export'}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      // Clean up
      window.URL.revokeObjectURL(url)
      
      toast.success('PDF exported successfully')
    } catch (error) {
      logger.error('Failed to export PDF', error)
      toast.error('Failed to export PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={exportToPDF}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-islamic-500 hover:bg-islamic-600 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
      title="Export to PDF"
    >
      <FiDownload className="w-5 h-5" />
      {loading ? 'Exporting...' : 'Export PDF'}
    </motion.button>
  )
}