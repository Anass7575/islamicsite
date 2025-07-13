import { memo } from 'react'

interface IslamicPatternProps {
  variant?: 'geometric' | 'star' | 'arabesque' | 'tessellation'
  opacity?: number
  size?: number
  className?: string
}

export const IslamicPattern = memo(function IslamicPattern({
  variant = 'geometric',
  opacity = 0.05,
  size = 60,
  className = ''
}: IslamicPatternProps) {
  const patterns = {
    geometric: (
      <pattern id="geometric" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
        <g fill="none" stroke="currentColor" strokeWidth="0.5">
          <path d="M30,5 L55,30 L30,55 L5,30 Z" />
          <path d="M30,15 L45,30 L30,45 L15,30 Z" />
          <circle cx="30" cy="30" r="10" />
        </g>
      </pattern>
    ),
    star: (
      <pattern id="star" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
        <g fill="currentColor">
          <path d="M30,10 L35,25 L50,25 L38,35 L43,50 L30,40 L17,50 L22,35 L10,25 L25,25 Z" />
        </g>
      </pattern>
    ),
    arabesque: (
      <pattern id="arabesque" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
        <g fill="none" stroke="currentColor" strokeWidth="0.5">
          <path d="M0,30 Q15,15 30,30 T60,30" />
          <path d="M30,0 Q45,15 30,30 T30,60" />
          <circle cx="30" cy="30" r="15" />
          <circle cx="30" cy="30" r="5" />
        </g>
      </pattern>
    ),
    tessellation: (
      <pattern id="tessellation" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
        <g fill="none" stroke="currentColor" strokeWidth="0.5">
          <polygon points="0,0 30,0 45,15 45,45 30,60 0,60 0,0" />
          <polygon points="30,0 60,0 60,60 30,60 45,45 45,15" />
          <line x1="0" y1="30" x2="60" y2="30" />
          <line x1="30" y1="0" x2="30" y2="60" />
        </g>
      </pattern>
    )
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ opacity }}>
      <svg className="w-full h-full" aria-hidden="true">
        <defs>
          {patterns[variant]}
        </defs>
        <rect width="100%" height="100%" fill={`url(#${variant})`} />
      </svg>
    </div>
  )
})

// Animated Islamic Pattern Background
export const AnimatedIslamicPattern = memo(function AnimatedIslamicPattern({
  variant = 'geometric',
  opacity = 0.03,
  className = ''
}: IslamicPatternProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div 
        className="absolute inset-0 animate-slide-pattern"
        style={{ opacity }}
      >
        <IslamicPattern variant={variant} opacity={1} />
      </div>
      <style jsx>{`
        @keyframes slide-pattern {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        .animate-slide-pattern {
          animation: slide-pattern 20s linear infinite;
        }
      `}</style>
    </div>
  )
})

// Corner Ornament Component
export const CornerOrnament = memo(function CornerOrnament({
  position = 'top-left',
  size = 100,
  opacity = 0.1,
  className = ''
}: {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size?: number
  opacity?: number
  className?: string
}) {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180'
  }

  return (
    <div 
      className={`absolute ${positionClasses[position]} ${className}`}
      style={{ width: size, height: size, opacity }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full text-accent-gold">
        <g fill="currentColor">
          <path d="M0,0 L40,0 Q0,0 0,40 Z" />
          <path d="M10,0 L30,0 Q0,0 0,30 L0,10 Q0,0 10,0 Z" opacity="0.5" />
          <circle cx="20" cy="20" r="5" />
          <path d="M50,0 L60,0 L60,10 Q60,0 50,0 Z" />
          <path d="M0,50 L0,60 L10,60 Q0,60 0,50 Z" />
        </g>
      </svg>
    </div>
  )
})

// Divider with Islamic Motif
export const IslamicDivider = memo(function IslamicDivider({
  variant = 'simple',
  className = ''
}: {
  variant?: 'simple' | 'ornate' | 'geometric'
  className?: string
}) {
  const dividers = {
    simple: (
      <div className="flex items-center justify-center">
        <div className="flex-1 h-px bg-primary-100 bg-opacity-20" />
        <svg className="w-6 h-6 mx-4 text-accent-gold opacity-50" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,2L14.4,9.6L22,12L14.4,14.4L12,22L9.6,14.4L2,12L9.6,9.6L12,2Z" />
        </svg>
        <div className="flex-1 h-px bg-primary-100 bg-opacity-20" />
      </div>
    ),
    ornate: (
      <div className="flex items-center justify-center py-4">
        <svg className="w-full max-w-xs h-8" viewBox="0 0 300 30">
          <g fill="currentColor" className="text-accent-gold opacity-30">
            <path d="M0,15 Q50,5 100,15 T200,15 T300,15" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="150" cy="15" r="8" />
            <circle cx="150" cy="15" r="4" fill="white" />
            <circle cx="120" cy="15" r="3" />
            <circle cx="180" cy="15" r="3" />
          </g>
        </svg>
      </div>
    ),
    geometric: (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rotate-45 bg-accent-gold opacity-30" />
          <div className="w-3 h-3 rotate-45 bg-accent-gold opacity-40" />
          <div className="w-4 h-4 rotate-45 bg-accent-gold opacity-50" />
          <div className="w-3 h-3 rotate-45 bg-accent-gold opacity-40" />
          <div className="w-2 h-2 rotate-45 bg-accent-gold opacity-30" />
        </div>
      </div>
    )
  }

  return (
    <div className={`my-8 ${className}`}>
      {dividers[variant]}
    </div>
  )
})