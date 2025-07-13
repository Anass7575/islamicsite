'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from '@/lib/motion'
import { FiWifiOff, FiRefreshCw, FiX } from '@/lib/icons'
import { resilientHadithApi } from '@/lib/hadith-api-resilient'

export function ApiStatusBanner() {
  const [apiStatus, setApiStatus] = useState(resilientHadithApi.getApiStatus())
  const [isChecking, setIsChecking] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setApiStatus(resilientHadithApi.getApiStatus())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleRetry = async () => {
    setIsChecking(true)
    const status = await resilientHadithApi.forceApiCheck()
    setApiStatus(status)
    setIsChecking(false)
  }

  if (apiStatus.isOnline || dismissed) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-16 left-0 right-0 z-40 px-4 py-2"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiWifiOff className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-400 font-semibold">
                  Service temporarily unavailable
                </p>
                <p className="text-red-300 text-sm">
                  Showing cached content. Some features may be limited.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRetry}
                disabled={isChecking}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 text-red-400 ${isChecking ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setDismissed(true)}
                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <FiX className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}