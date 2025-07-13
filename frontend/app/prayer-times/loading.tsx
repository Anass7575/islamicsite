export default function PrayerTimesLoading() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 bg-glass-light rounded-lg max-w-md mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-glass-light rounded max-w-lg mx-auto animate-pulse"></div>
        </div>

        {/* Prayer Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="prayer-card animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-glass-light mb-3"></div>
                <div className="h-6 bg-glass-light rounded w-20 mb-2"></div>
                <div className="h-8 bg-glass-light rounded w-24 mb-2"></div>
                <div className="h-6 bg-glass-light rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Skeleton */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="glass-card p-6 animate-pulse">
            <div className="h-6 bg-glass-light rounded w-32 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-glass-light rounded"></div>
              <div className="h-4 bg-glass-light rounded w-5/6"></div>
              <div className="h-4 bg-glass-light rounded w-4/6"></div>
            </div>
          </div>
          <div className="glass-card p-6 animate-pulse">
            <div className="h-6 bg-glass-light rounded w-32 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-glass-light rounded"></div>
              <div className="h-4 bg-glass-light rounded w-5/6"></div>
              <div className="h-4 bg-glass-light rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}