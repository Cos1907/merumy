import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Cloudflare Flexible SSL uyumluluğu
  // Cloudflare X-Forwarded-Proto header'ı gönderir
  // Bu header https ise, kullanıcı güvenli bağlantı kullanıyor demektir
  // Sunucuya HTTP ile bağlansa bile redirect yapmayız
  
  const response = NextResponse.next()
  
  // HSTS header'ını ekle (Cloudflare zaten HTTPS kullandığı için güvenli)
  // Not: Flexible modda origin HTTP olsa bile, kullanıcı HTTPS kullanıyor
  if (request.headers.get('x-forwarded-proto') === 'https') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return response
}

// Middleware'in çalışacağı path'ler
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

