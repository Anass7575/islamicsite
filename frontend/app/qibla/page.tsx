'use client'

import { motion } from '@/lib/motion'
import { FiCompass, FiMapPin, FiInfo } from '@/lib/icons'
import { useState, useEffect } from 'react'

export default function QiblaPage() {
  const [compassHeading, setCompassHeading] = useState(0)
  const [qiblaDirection] = useState(119.5) // Mock Qibla direction for Paris
  const [location] = useState({ city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 })

  useEffect(() => {
    // Simulate compass movement
    const interval = setInterval(() => {
      setCompassHeading((prev) => (prev + 0.5) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const needleRotation = qiblaDirection - compassHeading

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Qibla Direction</span>
          </h1>
          <p className="text-gray-400 text-lg">Find the direction to the Kaaba</p>
        </motion.div>

        {/* Location Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8 max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiMapPin className="w-6 h-6 text-islamic-400" />
              <div>
                <p className="font-semibold text-lg">{location.city}, {location.country}</p>
                <p className="text-sm text-gray-400">
                  Lat: {location.lat.toFixed(4)}°, Lng: {location.lng.toFixed(4)}°
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Qibla Direction</p>
              <p className="text-2xl font-bold text-islamic-400">{qiblaDirection.toFixed(1)}°</p>
            </div>
          </div>
        </motion.div>

        {/* Compass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-md mx-auto mb-12"
        >
          <div className="glass-card p-8 rounded-full aspect-square flex items-center justify-center">
            {/* Compass Background */}
            <div className="relative w-full h-full">
              {/* Compass Circle */}
              <div className="absolute inset-0 rounded-full border-4 border-glass-border">
                {/* Cardinal Points */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl font-bold text-islamic-400">N</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-2xl font-bold">S</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl font-bold">W</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl font-bold">E</div>
              </div>

              {/* Compass Needle */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${needleRotation}deg)` }}
                transition={{ type: "spring", stiffness: 50 }}
              >
                <div className="relative">
                  {/* Kaaba Icon */}
                  <div className="w-16 h-16 -mt-32 mx-auto bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-arabic text-black">🕋</span>
                  </div>
                  {/* Arrow */}
                  <div className="w-1 h-32 bg-gradient-to-t from-islamic-600 to-islamic-400 mx-auto rounded-full" />
                </div>
              </motion.div>

              {/* Center Dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-islamic-500 rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8 max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiInfo className="w-6 h-6 text-gold-400" />
            <h3 className="text-xl font-bold">How to use</h3>
          </div>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-islamic-400 font-bold">1.</span>
              <span>Hold your device flat and parallel to the ground</span>
            </li>
            <li className="flex gap-3">
              <span className="text-islamic-400 font-bold">2.</span>
              <span>Rotate yourself until the Kaaba icon points forward</span>
            </li>
            <li className="flex gap-3">
              <span className="text-islamic-400 font-bold">3.</span>
              <span>You are now facing the Qibla direction</span>
            </li>
          </ol>
          
          <div className="mt-6 p-4 bg-islamic-500/10 rounded-xl border border-islamic-500/20">
            <p className="text-sm text-islamic-400">
              <strong>Note:</strong> For accurate results, ensure your device's compass is calibrated and away from magnetic interference.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}