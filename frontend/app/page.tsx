import { Metadata } from 'next'
import { HomePageClient } from '@/components/home/HomePageClient'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturesGrid } from '@/components/home/FeaturesGrid'
import { StatsSection } from '@/components/home/StatsSection'

export const metadata: Metadata = {
  title: 'Al-Hidaya - Your Complete Islamic Companion',
  description: 'Access Quran with translations in 177 languages, authentic Hadith collections, accurate prayer times, Islamic calendar, and learning resources. Join millions of Muslims worldwide.',
  keywords: 'Islam, Quran, Hadith, Prayer Times, Islamic Learning, Muslim, Salah, Dua, Tafsir, Islamic Calendar, Qibla Direction, Zakat Calculator',
  openGraph: {
    title: 'Al-Hidaya - Your Complete Islamic Companion',
    description: 'Access Quran with translations in 177 languages, authentic Hadith collections, accurate prayer times, Islamic calendar, and learning resources.',
    type: 'website',
    url: 'https://al-hidaya.com',
    siteName: 'Al-Hidaya',
    images: [
      {
        url: 'https://al-hidaya.com/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Al-Hidaya - Islamic Platform'
      }
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Al-Hidaya - Your Complete Islamic Companion',
    description: 'Access Quran, Hadith, Prayer Times & more in 177 languages',
    images: ['https://al-hidaya.com/og-home.jpg'],
  },
  alternates: {
    canonical: 'https://al-hidaya.com',
    languages: {
      'en-US': 'https://al-hidaya.com/en',
      'ar-SA': 'https://al-hidaya.com/ar',
      'fr-FR': 'https://al-hidaya.com/fr',
      'tr-TR': 'https://al-hidaya.com/tr',
      'ur-PK': 'https://al-hidaya.com/ur',
      'id-ID': 'https://al-hidaya.com/id',
      'ms-MY': 'https://al-hidaya.com/ms'
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// Generate structured data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Al-Hidaya',
  description: 'Complete Islamic platform with Quran, Hadith, Prayer Times, and learning resources in 177 languages',
  url: 'https://al-hidaya.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://al-hidaya.com/search?q={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  },
  publisher: {
    '@type': 'Organization',
    name: 'Al-Hidaya Platform',
    logo: {
      '@type': 'ImageObject',
      url: 'https://al-hidaya.com/logo.png'
    }
  },
  inLanguage: ['en', 'ar', 'fr', 'tr', 'ur', 'id', 'ms'],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '15420'
  }
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen">
        {/* SSR Components */}
        <HeroSection />
        
        {/* Client Components Container */}
        <HomePageClient />
        
        {/* More SSR Components */}
        <FeaturesGrid />
        <StatsSection />
        
        {/* CTA Section - SSR */}
        <section className="relative py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-card p-12 md:p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-islamic-600/20 to-gold-600/20" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Start Your Journey Today
                </h2>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  Join millions of Muslims worldwide in experiencing Islam through beautiful design and powerful features
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="glass-button">
                    Get Started Free
                  </button>
                  <button className="px-8 py-4 rounded-full font-semibold border-2 border-islamic-500 hover:bg-islamic-500/20 transition-all duration-300">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}