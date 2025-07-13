import { Metadata } from 'next'
import { HadithPageClient } from '@/components/hadith/HadithPageClient'
import { ApiStatusBanner } from '@/components/hadith/ApiStatusBanner'
import Link from 'next/link'
import { FiBook, FiBookOpen } from '@/lib/icons'

export const metadata: Metadata = {
  title: 'Authentic Hadith Collections - Sahih Bukhari, Muslim & More',
  description: 'Browse authentic hadith collections including Sahih Bukhari, Sahih Muslim, Abu Dawud, Tirmidhi, Nasai and Ibn Majah. Over 16,000 authentic narrations with Arabic text and English translations.',
  keywords: 'Hadith, Sahih Bukhari, Sahih Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Islamic narrations, Prophet Muhammad, Sunnah, authentic hadith',
  openGraph: {
    title: 'Authentic Hadith Collections | Al-Hidaya',
    description: 'Explore 16,000+ authentic narrations from the Prophet Muhammad (ﷺ) across 6 major collections with Arabic text and English translations.',
    type: 'website',
    url: 'https://al-hidaya.com/hadith',
    siteName: 'Al-Hidaya',
    images: [
      {
        url: 'https://al-hidaya.com/og-hadith.jpg',
        width: 1200,
        height: 630,
        alt: 'Hadith Collections - Al-Hidaya'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Authentic Hadith Collections | Al-Hidaya',
    description: '16,000+ authentic narrations from 6 major hadith collections',
    images: ['https://al-hidaya.com/og-hadith.jpg'],
  },
  alternates: {
    canonical: 'https://al-hidaya.com/hadith',
    languages: {
      'en-US': 'https://al-hidaya.com/en/hadith',
      'ar-SA': 'https://al-hidaya.com/ar/hadith',
      'fr-FR': 'https://al-hidaya.com/fr/hadith',
      'tr-TR': 'https://al-hidaya.com/tr/hadis',
      'ur-PK': 'https://al-hidaya.com/ur/hadith',
    },
  },
}

// Static data for SEO
const collections = [
  {
    id: 'bukhari',
    slug: 'bukhari',
    name: 'Sahih al-Bukhari',
    arabicName: 'صحيح البخاري',
    author: 'Imam Muhammad ibn Ismail al-Bukhari',
    authorArabic: 'الإمام محمد بن إسماعيل البخاري',
    description: 'The most authentic book after the Quran, compiled by Imam Bukhari',
    totalHadiths: 7563,
    books: 97,
    authenticity: 'sahih',
    icon: '📚'
  },
  {
    id: 'muslim',
    slug: 'muslim',
    name: 'Sahih Muslim',
    arabicName: 'صحيح مسلم',
    author: 'Imam Muslim ibn al-Hajjaj',
    authorArabic: 'الإمام مسلم بن الحجاج',
    description: 'One of the most authentic hadith collections, known for its rigorous methodology',
    totalHadiths: 7500,
    books: 56,
    authenticity: 'sahih',
    icon: '📖'
  },
  {
    id: 'abudawud',
    slug: 'abudawud',
    name: 'Sunan Abu Dawud',
    arabicName: 'سنن أبي داود',
    author: 'Imam Abu Dawud as-Sijistani',
    authorArabic: 'الإمام أبو داود السجستاني',
    description: 'A collection focused on legal hadiths and practical Islamic jurisprudence',
    totalHadiths: 5274,
    books: 43,
    authenticity: 'mixed',
    icon: '📜'
  },
  {
    id: 'tirmidhi',
    slug: 'tirmidhi',
    name: "Jami' at-Tirmidhi",
    arabicName: 'جامع الترمذي',
    author: 'Imam Muhammad ibn Isa at-Tirmidhi',
    authorArabic: 'الإمام محمد بن عيسى الترمذي',
    description: 'Known for its commentary on hadith authenticity and juristic opinions',
    totalHadiths: 3956,
    books: 49,
    authenticity: 'mixed',
    icon: '📕'
  },
  {
    id: 'nasai',
    slug: 'nasai',
    name: "Sunan an-Nasa'i",
    arabicName: 'سنن النسائي',
    author: "Imam Ahmad ibn Shu'ayb an-Nasa'i",
    authorArabic: 'الإمام أحمد بن شعيب النسائي',
    description: 'Known for its attention to the defects in hadith narrations',
    totalHadiths: 5761,
    books: 51,
    authenticity: 'mixed',
    icon: '📗'
  },
  {
    id: 'ibnmajah',
    slug: 'ibnmajah',
    name: 'Sunan Ibn Majah',
    arabicName: 'سنن ابن ماجه',
    author: 'Imam Muhammad ibn Yazid Ibn Majah',
    authorArabic: 'الإمام محمد بن يزيد بن ماجه',
    description: 'The sixth canonical hadith collection, containing unique narrations',
    totalHadiths: 4341,
    books: 37,
    authenticity: 'mixed',
    icon: '📘'
  }
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Authentic Hadith Collections',
  description: 'Browse authentic hadith collections from the six major books of hadith',
  url: 'https://al-hidaya.com/hadith',
  hasPart: collections.map(collection => ({
    '@type': 'Book',
    '@id': `https://al-hidaya.com/hadith/${collection.slug}`,
    name: collection.name,
    alternateName: collection.arabicName,
    author: {
      '@type': 'Person',
      name: collection.author,
      alternateName: collection.authorArabic
    },
    description: collection.description,
    numberOfPages: collection.books,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: collection.authenticity === 'sahih' ? '5.0' : '4.5',
      reviewCount: collection.totalHadiths
    }
  })),
  publisher: {
    '@type': 'Organization',
    name: 'Al-Hidaya Platform',
    url: 'https://al-hidaya.com'
  }
}

export default function HadithPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen py-20 px-4">
        {/* API Status Banner */}
        <ApiStatusBanner />
        
        <div className="max-w-7xl mx-auto">
          {/* Header - SSR */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-gradient">Hadith Collections</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Explore authentic narrations from the Prophet Muhammad (ﷺ)
            </p>
          </div>

          {/* Stats - SSR */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-bold text-islamic-400">6</p>
              <p className="text-gray-400">Major Collections</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-bold text-gold-400">16,562</p>
              <p className="text-gray-400">Total Hadiths</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-bold text-islamic-400">20</p>
              <p className="text-gray-400">Categories</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-bold text-gold-400">100%</p>
              <p className="text-gray-400">Authentic Sources</p>
            </div>
          </div>

          {/* Client Components for Search and Tabs */}
          <HadithPageClient />

          {/* Collections Grid - SSR for SEO */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" id="collections-grid">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/hadith/${collection.slug}`}>
                <div className={`glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group ${
                  collection.authenticity === 'sahih' 
                    ? 'hover:shadow-islamic-500/20' 
                    : 'hover:shadow-gold-500/20'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{collection.icon}</div>
                    {collection.authenticity === 'sahih' && (
                      <span className="px-3 py-1 rounded-full bg-islamic-500/20 text-islamic-400 text-xs font-semibold">
                        Sahih
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold mb-1 group-hover:text-gradient transition-all">
                    {collection.name}
                  </h2>
                  <h3 className="text-2xl font-arabic text-gold-400 mb-2">
                    {collection.arabicName}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {collection.author}
                  </p>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {collection.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FiBook className="w-4 h-4" />
                      <span>{collection.books} books</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <FiBookOpen className="w-4 h-4" />
                      <span>{collection.totalHadiths.toLocaleString()} hadiths</span>
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