'use client'

import { useEffect, useRef } from 'react'

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []
    const particleCount = 80
    const colors = [
      { r: 244, g: 114, b: 182 }, // Pink
      { r: 139, g: 92, b: 246 },  // Purple
      { r: 6, g: 182, b: 212 },   // Cyan
      { r: 16, g: 185, b: 129 },  // Emerald
      { r: 245, g: 158, b: 11 },  // Amber
      { r: 239, g: 68, b: 68 },   // Red
    ]

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      color: typeof colors[0]
      pulseSpeed: number
      pulsePhase: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.size = Math.random() * 4 + 2
        this.speedX = Math.random() * 1 - 0.5
        this.speedY = Math.random() * 1 - 0.5
        this.opacity = Math.random() * 0.7 + 0.3
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.pulseSpeed = Math.random() * 0.02 + 0.01
        this.pulsePhase = Math.random() * Math.PI * 2
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.pulsePhase += this.pulseSpeed

        // Wrap around edges
        if (this.x < -20) this.x = canvas!.width + 20
        if (this.x > canvas!.width + 20) this.x = -20
        if (this.y < -20) this.y = canvas!.height + 20
        if (this.y > canvas!.height + 20) this.y = -20
      }

      draw() {
        if (!ctx) return
        const pulseFactor = Math.sin(this.pulsePhase) * 0.3 + 0.7
        const currentSize = this.size * pulseFactor
        
        // Create gradient for particle
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentSize * 2)
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`)
        gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.5})`)
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`)
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, currentSize * 2, 0, Math.PI * 2)
        ctx.fill()

        // Core glow
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.8})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}