'use client'

import { HiBookOpen, HiCollection, HiClock, HiTranslate, HiAcademicCap, HiCalculator } from 'react-icons/hi'
import { FeatureCard } from '../ModernCard'

const features = [
  {
    icon: <HiBookOpen className="w-6 h-6" />,
    title: "Complete Quran",
    description: "Read, listen, and study the Holy Quran with translations in 193 languages"
  },
  {
    icon: <HiCollection className="w-6 h-6" />,
    title: "Authentic Hadith",
    description: "Access over 40,000 authentic hadiths from major collections"
  },
  {
    icon: <HiClock className="w-6 h-6" />,
    title: "Prayer Times",
    description: "Accurate prayer times for your location with beautiful Adhan notifications"
  },
  {
    icon: <HiTranslate className="w-6 h-6" />,
    title: "Multi-Language",
    description: "Full support for 193 languages including RTL languages"
  },
  {
    icon: <HiAcademicCap className="w-6 h-6" />,
    title: "Islamic Learning",
    description: "Comprehensive courses and resources for all levels"
  },
  {
    icon: <HiCalculator className="w-6 h-6" />,
    title: "Zakat Calculator",
    description: "Calculate your Zakat accurately with our easy-to-use tool"
  }
]

export function FeaturesGrid() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need in One Place
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access comprehensive Islamic resources designed to enhance your spiritual journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}