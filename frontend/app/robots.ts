import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/_next/',
          '/static/',
          '/*.json$',
          '/test/',
          '/debug/'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0,
      },
    ],
    sitemap: 'https://al-hidaya.com/sitemap.xml',
    host: 'https://al-hidaya.com',
  }
}