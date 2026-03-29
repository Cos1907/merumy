import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/cart',
          '/checkout',
          '/profile',
          '/siparis-takip',
          '/login',
          '/signup',
        ],
      },
    ],
    sitemap: 'https://merumy.com/sitemap.xml',
    host: 'https://merumy.com',
  }
}
