/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'merumy.com', 'www.merumy.com'],
    unoptimized: true, // Cloudflare ile uyumluluk için
  },
  // Cloudflare Flexible SSL ile uyumluluk
  // Cloudflare proxy arkasında olduğumuz için X-Forwarded-Proto header'ına güven
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  // Trailing slash tutarlılığı - redirect döngüsünü önler
  trailingSlash: false,
  // PoweredBy header'ını kaldır
  poweredByHeader: false,
}

module.exports = nextConfig
