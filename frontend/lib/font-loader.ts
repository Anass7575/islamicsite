/**
 * Font loading optimization utilities
 */

// Font preloading configuration
export const FONT_PRELOADS = [
  {
    href: '/fonts/inter-regular.woff2',
    type: 'font/woff2',
    crossOrigin: 'anonymous' as const,
  },
  {
    href: '/fonts/amiri-regular.woff2',
    type: 'font/woff2',
    crossOrigin: 'anonymous' as const,
  }
]

// Dynamic font loading with Font Face Observer
export class FontLoader {
  private static loadedFonts = new Set<string>()
  
  static async loadFont(fontName: string, options?: {
    weight?: string | number
    style?: string
    timeout?: number
  }): Promise<void> {
    const fontKey = `${fontName}-${options?.weight || 'normal'}-${options?.style || 'normal'}`
    
    // Skip if already loaded
    if (this.loadedFonts.has(fontKey)) {
      return
    }
    
    // Check if FontFaceObserver is available
    if (typeof window === 'undefined' || !('FontFace' in window)) {
      return
    }
    
    try {
      // Create font face
      const fontFace = new FontFace(
        fontName,
        `url(/fonts/${fontName.toLowerCase()}-${options?.weight || 'regular'}.woff2)`,
        {
          weight: String(options?.weight || 'normal'),
          style: options?.style || 'normal',
          display: 'swap'
        }
      )
      
      // Load font
      await fontFace.load()
      
      // Add to document
      document.fonts.add(fontFace)
      
      // Mark as loaded
      this.loadedFonts.add(fontKey)
      
      // Store in localStorage for faster subsequent loads
      if (typeof localStorage !== 'undefined') {
        const loadedFonts = JSON.parse(localStorage.getItem('loadedFonts') || '[]')
        if (!loadedFonts.includes(fontKey)) {
          loadedFonts.push(fontKey)
          localStorage.setItem('loadedFonts', JSON.stringify(loadedFonts))
        }
      }
    } catch (error) {
      console.warn(`Failed to load font ${fontName}:`, error)
    }
  }
  
  static async loadCriticalFonts(): Promise<void> {
    // Load critical fonts for initial render
    const criticalFonts = [
      { name: 'Inter', weight: 400 },
      { name: 'Inter', weight: 600 },
      { name: 'Amiri', weight: 400 }
    ]
    
    await Promise.all(
      criticalFonts.map(font => 
        this.loadFont(font.name, { weight: font.weight })
      )
    )
  }
  
  static preconnectToFontSources(): void {
    if (typeof document === 'undefined') return
    
    const fontSources = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ]
    
    fontSources.forEach(source => {
      // Preconnect
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = source
      document.head.appendChild(link)
      
      // DNS prefetch as fallback
      const dnsPrefetch = document.createElement('link')
      dnsPrefetch.rel = 'dns-prefetch'
      dnsPrefetch.href = source
      document.head.appendChild(dnsPrefetch)
    })
  }
}

// Resource hints for performance
export function addResourceHints(): void {
  if (typeof document === 'undefined') return
  
  // Preload critical resources
  const criticalResources = [
    { href: '/patterns/islamic-pattern.svg', as: 'image' },
    { href: '/api/v1/prayer/times', as: 'fetch', crossOrigin: 'anonymous' }
  ]
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.href
    link.as = resource.as
    if (resource.crossOrigin) {
      link.crossOrigin = resource.crossOrigin
    }
    document.head.appendChild(link)
  })
}

// Optimize image loading
export function optimizeImages(): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return
  }
  
  // Native lazy loading for browsers that support it
  const images = document.querySelectorAll('img[data-src]')
  
  if ('loading' in HTMLImageElement.prototype) {
    images.forEach(img => {
      const imgElement = img as HTMLImageElement
      imgElement.src = imgElement.dataset.src || ''
      imgElement.loading = 'lazy'
    })
  } else {
    // Fallback to Intersection Observer
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src || ''
          img.onload = () => img.classList.add('loaded')
          imageObserver.unobserve(img)
        }
      })
    }, {
      rootMargin: '50px 0px'
    })
    
    images.forEach(img => imageObserver.observe(img))
  }
}

// Font loading strategy
export async function initializeFonts(): Promise<void> {
  // Preconnect to font sources
  FontLoader.preconnectToFontSources()
  
  // Load critical fonts
  await FontLoader.loadCriticalFonts()
  
  // Load remaining fonts after initial render
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      FontLoader.loadFont('Inter', { weight: 500 })
      FontLoader.loadFont('Inter', { weight: 700 })
      FontLoader.loadFont('Amiri', { weight: 700 })
    })
  } else {
    setTimeout(() => {
      FontLoader.loadFont('Inter', { weight: 500 })
      FontLoader.loadFont('Inter', { weight: 700 })
      FontLoader.loadFont('Amiri', { weight: 700 })
    }, 1000)
  }
}

// CSS optimization utilities
export function injectCriticalCSS(css: string): void {
  if (typeof document === 'undefined') return
  
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
}

// Remove unused CSS
export function removeUnusedCSS(): void {
  if (typeof document === 'undefined') return
  
  // This would integrate with PurgeCSS or similar tools
  // For now, we'll just log a reminder
  if (process.env.NODE_ENV === 'development') {
    console.log('Remember to configure PurgeCSS for production builds')
  }
}