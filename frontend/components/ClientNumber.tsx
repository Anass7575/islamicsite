'use client'

import { useEffect, useState } from 'react'

interface ClientNumberProps {
  value: number
  locale?: string
  className?: string
}

export default function ClientNumber({ value, locale = 'en-US', className }: ClientNumberProps) {
  const [mounted, setMounted] = useState(false)
  const [formattedValue, setFormattedValue] = useState(value.toString())
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (mounted) {
      // Format number only on client side to avoid hydration mismatch
      setFormattedValue(value.toLocaleString(locale))
    }
  }, [value, locale, mounted])
  
  // Return the raw number during SSR, formatted number after hydration
  if (!mounted) {
    return <span className={className}>{value}</span>
  }
  
  return (
    <span className={className} suppressHydrationWarning>
      {formattedValue}
    </span>
  )
}