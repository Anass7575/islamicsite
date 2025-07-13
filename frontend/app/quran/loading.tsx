import { motion } from '@/lib/motion'

export default function QuranLoading() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 bg-glass-light rounded-lg max-w-md mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-glass-light rounded max-w-lg mx-auto animate-pulse"></div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="glass-card p-6 mb-8 animate-pulse">
          <div className="h-12 bg-glass-light rounded-xl"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-8 bg-glass-light rounded mb-2"></div>
              <div className="h-4 bg-glass-light rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Surahs Grid Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-glass-light"></div>
                <div className="flex-1">
                  <div className="h-6 bg-glass-light rounded mb-2"></div>
                  <div className="h-4 bg-glass-light rounded w-3/4"></div>
                </div>
              </div>
              <div className="h-4 bg-glass-light rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}