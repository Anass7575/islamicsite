'use client'

import { useEffect, useState } from 'react'

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Pendant le SSR ou l'hydratation, afficher un placeholder
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        {/* Placeholder minimal pour éviter le flash */}
      </div>
    )
  }

  return <>{children}</>
}