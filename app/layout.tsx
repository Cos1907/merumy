import type { Metadata } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'
import './globals.css'
import { CartProvider } from './context/CartContext'
import CartToast from './components/CartToast'
import CookieConsent from './components/CookieConsent'
import PageTransition from './components/PageTransition'

export const metadata: Metadata = {
  title: 'Merumy - Kore Güzellik Ürünleri',
  description: 'Kore\'nin önde gelen kozmetik ve yaşam markalarını Türkiye\'ye getiren yenilikçi perakende markası',
  keywords: 'kore güzellik, k-beauty, kozmetik, cilt bakımı, kore markaları',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
            <head>
              <link rel="icon" href="/favicon.ico" sizes="any" />
              <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
              <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
              <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
              <link rel="manifest" href="/site.webmanifest" />
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-DB8EM5BRPJ"
                strategy="lazyOnload"
              />
            </head>
      <body className="font-sans">
        {/* Google Analytics - Moved to head with lazyOnload strategy */}
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DB8EM5BRPJ');
          `}
        </Script>
        <CartProvider>
          <Suspense fallback={null}>
            <PageTransition />
          </Suspense>
          <CartToast />
          {children}
          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  )
}
