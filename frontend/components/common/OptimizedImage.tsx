'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  objectFit = 'cover'
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px 0px', // Load images 50px before they enter viewport
        threshold: 0.01
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [priority])

  // Generate blur placeholder if not provided
  const generateBlurDataURL = (width: number, height: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Create a gradient placeholder
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(1, '#16213e')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }
    return canvas.toDataURL()
  }

  const defaultBlurDataURL = blurDataURL || (typeof window !== 'undefined' ? generateBlurDataURL(10, 10) : '')

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {isInView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            quality={quality}
            sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
            placeholder={placeholder}
            blurDataURL={defaultBlurDataURL}
            onLoad={() => {
              setIsLoaded(true)
              onLoad?.()
            }}
            className={`object-${objectFit}`}
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
          />
        </motion.div>
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 animate-pulse" />
      )}
    </div>
  )
}

// Responsive image component with art direction
interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'src'> {
  sources: {
    mobile?: string
    tablet?: string
    desktop: string
  }
}

export function ResponsiveImage({
  sources,
  alt,
  className,
  ...props
}: ResponsiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(sources.desktop)

  useEffect(() => {
    const updateSrc = () => {
      if (window.innerWidth < 640 && sources.mobile) {
        setCurrentSrc(sources.mobile)
      } else if (window.innerWidth < 1024 && sources.tablet) {
        setCurrentSrc(sources.tablet || sources.desktop)
      } else {
        setCurrentSrc(sources.desktop)
      }
    }

    updateSrc()
    window.addEventListener('resize', updateSrc)
    return () => window.removeEventListener('resize', updateSrc)
  }, [sources])

  return (
    <OptimizedImage
      src={currentSrc}
      alt={alt}
      className={className}
      {...props}
    />
  )
}