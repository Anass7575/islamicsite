import { Suspense } from 'react'
import { motion } from '@/lib/motion'

interface LazyRouteProps {
  children: React.ReactNode
}

// Loading component with Islamic theme
const RouteLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="relative w-24 h-24 mx-auto mb-6">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-islamic-200"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-t-4 border-islamic-500"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-arabic text-islamic-500">الھ</span>
        </div>
      </div>
      <p className="text-gray-400 animate-pulse">Loading...</p>
    </motion.div>
  </div>
)

export function LazyRoute({ children }: LazyRouteProps) {
  return (
    <Suspense fallback={<RouteLoader />}>
      {children}
    </Suspense>
  )
}