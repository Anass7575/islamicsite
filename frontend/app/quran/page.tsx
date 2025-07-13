import { Metadata } from 'next'
import { QuranPageClient } from '@/components/quran/QuranPageClient'
import { surahsData } from '@/data/surahs'
import Link from 'next/link'
import { FiBook, FiMapPin } from '@/lib/icons'

export const metadata: Metadata = {
  title: 'Read Quran Online - 114 Surahs with Translations',
  description: 'Read the Holy Quran online with translations in 177 languages. Browse all 114 Surahs, 6,236 verses with audio recitation, tafsir and word-by-word analysis.',
  keywords: 'Quran online, read Quran, Quran translation, Surah, Ayah, Islamic scripture, Quran audio, Quran tafsir, Arabic Quran',
  openGraph: {
    title: 'Read the Holy Quran Online | Al-Hidaya',
    description: 'Access all 114 Surahs with translations in 177 languages, audio recitation, and comprehensive tafsir.',
    type: 'website',
    url: 'https://al-hidaya.com/quran',
    siteName: 'Al-Hidaya',
    images: [
      {
        url: 'https://al-hidaya.com/og-quran.jpg',
        width: 1200,
        height: 630,
        alt: 'Read Quran Online - Al-Hidaya'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Read the Holy Quran Online | Al-Hidaya',
    description: 'All 114 Surahs with translations in 177 languages',
    images: ['https://al-hidaya.com/og-quran.jpg'],
  },
  alternates: {
    canonical: 'https://al-hidaya.com/quran',
    languages: {
      'en-US': 'https://al-hidaya.com/en/quran',
      'ar-SA': 'https://al-hidaya.com/ar/quran',
      'fr-FR': 'https://al-hidaya.com/fr/coran',
      'tr-TR': 'https://al-hidaya.com/tr/kuran',
      'ur-PK': 'https://al-hidaya.com/ur/quran',
    },
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'The Holy Quran - Complete Collection',
  description: 'Browse and read all 114 Surahs of the Holy Quran with translations',
  url: 'https://al-hidaya.com/quran',
  inLanguage: ['ar', 'en'],
  hasPart: surahsData.map(surah => ({
    '@type': 'CreativeWork',
    '@id': `https://al-hidaya.com/quran/${surah.number}`,
    name: surah.englishName,
    alternateName: surah.name,
    description: surah.englishNameTranslation,
    position: surah.number,
    text: {
      '@type': 'TextObject',
      inLanguage: 'ar',
      characterCount: surah.numberOfAyahs
    }
  })),
  publisher: {
    '@type': 'Organization',
    name: 'Al-Hidaya Platform',
    url: 'https://al-hidaya.com'
  }
}

export default function QuranPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header - SSR */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-gradient">The Holy Quran</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Read, listen, and reflect on the divine revelation
            </p>
          </div>

          {/* Client-side Search and Filters */}
          <QuranPageClient />

          {/* Quick Stats - SSR */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-bold text-islamic-400">114</p>
              <p className="text-gray-400">Surahs</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-bold text-gold-400">6,236</p>
              <p className="text-gray-400">Ayahs</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-bold text-islamic-400">30</p>
              <p className="text-gray-400">Juz</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-bold text-gold-400">604</p>
              <p className="text-gray-400">Pages</p>
            </div>
          </div>

          {/* Surahs Grid - SSR for SEO */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" id="surahs-grid">
            {surahsData.map((surah) => (
              <Link key={surah.number} href={`/quran/${surah.number}`}>
                <div className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-islamic-500 to-islamic-700 flex items-center justify-center text-white font-bold">
                        {surah.number}
                      </div>
                      <div>
                        <h2 className="text-2xl font-arabic text-gold-400 mb-1">
                          {surah.name}
                        </h2>
                        <h3 className="text-lg font-semibold group-hover:text-gradient transition-all">
                          {surah.englishName}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {surah.englishNameTranslation}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FiBook className="w-4 h-4" />
                      <span>{surah.numberOfAyahs} verses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-islamic-400" />
                      <span className={surah.revelationType === 'Meccan' ? 'text-islamic-400' : 'text-gold-400'}>
                        {surah.revelationType}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}