import Head from 'next/head'

interface SEOProps {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  ogType?: string
  canonicalUrl?: string
  structuredData?: any
  locale?: string
}

export function SEO({
  title,
  description,
  keywords = 'Islam, Quran, Hadith, Prayer Times, Islamic Learning, Muslim, Salah, Dua, Tafsir',
  ogImage = 'https://al-hidaya.com/og-image.jpg',
  ogType = 'website',
  canonicalUrl,
  structuredData,
  locale = 'en'
}: SEOProps) {
  const siteName = 'Al-Hidaya - Your Islamic Companion'
  const fullTitle = `${title} | ${siteName}`
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Al-Hidaya Platform" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:locale" content={locale} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Language Alternates */}
      <link rel="alternate" hrefLang="en" href="https://al-hidaya.com/en" />
      <link rel="alternate" hrefLang="ar" href="https://al-hidaya.com/ar" />
      <link rel="alternate" hrefLang="fr" href="https://al-hidaya.com/fr" />
      <link rel="alternate" hrefLang="x-default" href="https://al-hidaya.com" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="theme-color" content="#00A86B" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </Head>
  )
}