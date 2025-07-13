import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { I18nProvider } from '@/components/providers/I18nProvider'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import { ClientAuthProvider } from '@/components/providers/ClientAuthProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

// Optimisation des fonts avec préchargement
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

// Use Google Fonts CDN for Amiri instead of local files
const amiri = {
  className: 'font-amiri',
  style: { fontFamily: 'Amiri, serif' },
  variable: '--font-amiri',
}

export const metadata: Metadata = {
  title: {
    default: 'Al-Hidaya - Your Complete Islamic Companion',
    template: '%s | Al-Hidaya'
  },
  description: 'Access Quran, Hadith, Prayer Times and Islamic Learning Resources in 193 languages',
  metadataBase: new URL('https://al-hidaya.com'),
  openGraph: {
    title: 'Al-Hidaya - Your Complete Islamic Companion',
    description: 'Access Quran, Hadith, Prayer Times and Islamic Learning Resources in 193 languages',
    url: 'https://al-hidaya.com',
    siteName: 'Al-Hidaya',
    locale: 'en_US',
    type: 'website',
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to 'en' for now - we'll implement proper locale detection
  const locale = 'en'
  const isRTL = ['ar', 'fa', 'ur', 'he'].includes(locale)

  return (
    <html 
      lang={locale} 
      dir={isRTL ? 'rtl' : 'ltr'} 
      suppressHydrationWarning
      className={`${inter.variable} ${amiri.variable}`}
    >
      <head>
        {/* Critical CSS inline */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical above-the-fold styles */
            :root {
              --font-inter: ${inter.style.fontFamily};
              --font-amiri: ${amiri.style.fontFamily};
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: var(--font-inter), system-ui, sans-serif;
              line-height: 1.5;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            .font-arabic {
              font-family: var(--font-amiri), 'Arabic Typesetting', 'Traditional Arabic', serif;
            }
            
            /* Prevent layout shift */
            .navbar {
              height: 64px;
            }
            
            /* Optimize rendering */
            img, video {
              max-width: 100%;
              height: auto;
            }
            
            /* Smooth scrolling */
            html {
              scroll-behavior: smooth;
            }
            
            @media (prefers-reduced-motion: reduce) {
              html {
                scroll-behavior: auto;
              }
            }
          `
        }} />
        
        {/* Google Fonts for Amiri */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
        
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://api.quran.com" />
        <link rel="dns-prefetch" href="https://api.sunnah.com" />
        <link rel="preconnect" href="https://api.quran.com" />
        <link rel="preconnect" href="https://api.sunnah.com" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <ThemeProvider>
          <I18nProvider locale={locale}>
            <ClientAuthProvider>
              <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                <Navigation />
                <main className="flex min-h-[calc(100vh-4rem)] flex-col">
                  {children}
                </main>
              </div>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className: '',
                  style: {
                    background: 'var(--gray-800)',
                    color: 'var(--gray-50)',
                  },
                }}
              />
            </ClientAuthProvider>
          </I18nProvider>
        </ThemeProvider>
        
        {/* Analytics scripts can be added here when needed */}
      </body>
    </html>
  )
}