import { MetadataRoute } from 'next'
import { surahsData } from '@/data/surahs'

const BASE_URL = 'https://al-hidaya.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString()
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/quran`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/hadith`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/prayer-times`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/qibla`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/calendar`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/zakat`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/learn`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // Quran Surahs (114 pages)
  const surahPages: MetadataRoute.Sitemap = surahsData.map((surah) => ({
    url: `${BASE_URL}/quran/${surah.number}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Hadith Collections with SEO-friendly URLs
  const hadithCollections = [
    'sahih-bukhari',
    'sahih-muslim',
    'sunan-abu-dawud',
    'jami-at-tirmidhi',
    'sunan-an-nasai',
    'sunan-ibn-majah'
  ]
  
  const hadithPages: MetadataRoute.Sitemap = hadithCollections.map((collection) => ({
    url: `${BASE_URL}/hadith/${collection}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Language variations for main pages
  const languages = ['ar', 'fr', 'tr', 'ur', 'id', 'ms', 'bn', 'de', 'es', 'ru']
  const localizedPages: MetadataRoute.Sitemap = languages.flatMap(lang => [
    {
      url: `${BASE_URL}/${lang}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/${lang}/quran`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/${lang}/hadith`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ])

  return [...staticPages, ...surahPages, ...hadithPages, ...localizedPages]
}