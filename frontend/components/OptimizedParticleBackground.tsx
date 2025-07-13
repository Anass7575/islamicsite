'use client'

import { useEffect, useRef, useCallback } from 'react'

// Configuration optimisée
const CONFIG = {
  particleCount: 30, // Réduit de 80 à 30
  fps: 30, // Limite à 30 FPS au lieu de 60
  colors: [
    '#f472b6', // Pink
    '#8b5cf6', // Purple  
    '#06b6d4', // Cyan
    '#10b981', // Emerald
  ],
  // Cache les calculs trigonométriques
  sinCache: new Map<number, number>(),
  cosCache: new Map<number, number>(),
}

// Utilise une seule instance du canvas pour éviter les créations multiples
let canvasInstance: HTMLCanvasElement | null = null
let contextInstance: CanvasRenderingContext2D | null = null
let animationId: number | null = null

export function OptimizedParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const lastFrameTime = useRef<number>(0)
  const frameInterval = 1000 / CONFIG.fps

  // Classe Particle optimisée
  class Particle {
    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    opacity: number
    colorIndex: number
    pulsePhase: number

    constructor(canvasWidth: number, canvasHeight: number) {
      this.x = Math.random() * canvasWidth
      this.y = Math.random() * canvasHeight
      this.size = Math.random() * 3 + 1.5 // Plus petit
      this.speedX = (Math.random() - 0.5) * 0.5 // Plus lent
      this.speedY = (Math.random() - 0.5) * 0.5
      this.opacity = 0.3 + Math.random() * 0.3 // Moins opaque
      this.colorIndex = Math.floor(Math.random() * CONFIG.colors.length)
      this.pulsePhase = Math.random() * Math.PI * 2
    }

    update(canvasWidth: number, canvasHeight: number, deltaTime: number) {
      // Mise à jour basée sur deltaTime pour une animation fluide
      const movement = deltaTime * 0.06
      this.x += this.speedX * movement
      this.y += this.speedY * movement
      this.pulsePhase += 0.01 * movement

      // Wrap around edges avec marge
      const margin = 10
      if (this.x < -margin) this.x = canvasWidth + margin
      if (this.x > canvasWidth + margin) this.x = -margin
      if (this.y < -margin) this.y = canvasHeight + margin
      if (this.y > canvasHeight + margin) this.y = -margin
    }

    draw(ctx: CanvasRenderingContext2D) {
      // Utilise le cache pour sin
      let pulseFactor = CONFIG.sinCache.get(this.pulsePhase)
      if (pulseFactor === undefined) {
        pulseFactor = Math.sin(this.pulsePhase) * 0.2 + 0.8
        CONFIG.sinCache.set(this.pulsePhase, pulseFactor)
      }

      const currentSize = this.size * pulseFactor
      const color = CONFIG.colors[this.colorIndex]
      
      // Dessin simplifié sans gradient (plus performant)
      ctx.globalAlpha = this.opacity
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2)
      ctx.fill()
      
      // Effet de glow simple
      ctx.globalAlpha = this.opacity * 0.3
      ctx.beginPath()
      ctx.arc(this.x, this.y, currentSize * 2, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.globalAlpha = 1
    }
  }

  // Fonction d'animation optimisée avec throttling
  const animate = useCallback((currentTime: number) => {
    if (!contextInstance || !canvasInstance) return

    // Throttle à 30 FPS
    const deltaTime = currentTime - lastFrameTime.current
    if (deltaTime < frameInterval) {
      animationId = requestAnimationFrame(animate)
      return
    }

    lastFrameTime.current = currentTime

    // Clear avec fillRect (plus rapide que clearRect)
    contextInstance.fillStyle = 'rgba(0, 0, 0, 0)'
    contextInstance.fillRect(0, 0, canvasInstance.width, canvasInstance.height)

    // Update et draw des particules
    particlesRef.current.forEach(particle => {
      particle.update(canvasInstance!.width, canvasInstance!.height, deltaTime)
      particle.draw(contextInstance!)
    })

    animationId = requestAnimationFrame(animate)
  }, [frameInterval])

  // Initialisation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvasInstance = canvas
    contextInstance = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // Performance boost
    })
    
    if (!contextInstance) return

    // Désactive l'antialiasing pour de meilleures performances
    contextInstance.imageSmoothingEnabled = false

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      // Réinitialise les particules si nécessaire
      if (particlesRef.current.length === 0) {
        for (let i = 0; i < CONFIG.particleCount; i++) {
          particlesRef.current.push(new Particle(canvas.width, canvas.height))
        }
      }
    }

    updateCanvasSize()

    // Utilise ResizeObserver au lieu de window.resize (plus performant)
    const resizeObserver = new ResizeObserver(updateCanvasSize)
    resizeObserver.observe(document.body)

    // Démarre l'animation
    animationId = requestAnimationFrame(animate)

    // Nettoyage du cache périodiquement
    const cacheCleanup = setInterval(() => {
      if (CONFIG.sinCache.size > 1000) {
        CONFIG.sinCache.clear()
      }
    }, 60000) // Toutes les minutes

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      resizeObserver.disconnect()
      clearInterval(cacheCleanup)
      particlesRef.current = []
      CONFIG.sinCache.clear()
    }
  }, [animate])

  // Pause l'animation quand la page n'est pas visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
      } else if (!document.hidden && !animationId) {
        animationId = requestAnimationFrame(animate)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [animate])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        opacity: 0.4,
        willChange: 'transform', // Optimisation GPU
      }}
      aria-hidden="true" // Accessibilité
    />
  )
}