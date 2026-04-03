import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı',
  description: 'Aradığınız sayfa mevcut değil. Ana sayfaya veya mağazamıza göz atabilirsiniz.',
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Minimal header for 404 page - avoids Client Component context issues */}
      <div className="bg-white border-b border-gray-100 py-4 px-6 flex items-center">
        <a href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Merumy" className="h-9 w-auto" />
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="max-w-2xl w-full text-center">

          {/* Dekoratif daireler */}
          <div className="relative inline-block mb-8">
            <div
              className="absolute -top-6 -left-6 w-24 h-24 rounded-full opacity-20"
              style={{ backgroundColor: '#92D0AA' }}
            />
            <div
              className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-15"
              style={{ backgroundColor: '#F1EB9C' }}
            />

            {/* 404 Büyük metin */}
            <div className="relative">
              <span
                className="font-grift font-black select-none leading-none"
                style={{
                  fontSize: 'clamp(100px, 20vw, 180px)',
                  color: 'transparent',
                  WebkitTextStroke: '3px #92D0AA',
                  display: 'block',
                  lineHeight: 1,
                }}
              >
                404
              </span>
              {/* Ortasındaki emoji */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ pointerEvents: 'none' }}
              >
                <span style={{ fontSize: 'clamp(36px, 7vw, 64px)' }}>🌿</span>
              </div>
            </div>
          </div>

          {/* Başlık */}
          <h1
            className="font-grift font-bold uppercase text-2xl md:text-3xl lg:text-4xl mb-4"
            style={{ color: '#92D0AA' }}
          >
            Ups! Sayfa Bulunamadı
          </h1>

          {/* Açıklama */}
          <p className="text-gray-500 text-base md:text-lg mb-8 leading-relaxed max-w-md mx-auto">
            Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
            Ama endişelenmeyin — harika K-Beauty ürünlerimiz sizi bekliyor!
          </p>

          {/* Ayırıcı çizgi - Merumy renkli */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-16 bg-[#F1EB9C]" />
            <span className="text-[#92D0AA] text-xl">✦</span>
            <div className="h-px w-16 bg-[#92D0AA]" />
          </div>

          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="/"
              className="font-grift font-bold uppercase tracking-wide text-white rounded-xl px-8 py-3.5 text-sm transition-all hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: '#92D0AA' }}
            >
              🏠 Ana Sayfaya Dön
            </a>
            <a
              href="/shop"
              className="font-grift font-bold uppercase tracking-wide rounded-xl px-8 py-3.5 text-sm transition-all hover:scale-105 border-2"
              style={{ borderColor: '#92D0AA', color: '#92D0AA' }}
            >
              🛍️ Alışverişe Başla
            </a>
          </div>

          {/* Hızlı kategori linkleri */}
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-4">
              Popüler Kategoriler
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: 'Cilt Bakımı', href: '/shop/cilt-bakimi' },
                { label: 'Makyaj', href: '/shop/makyaj' },
                { label: 'Saç Bakımı', href: '/shop/sac-bakimi' },
                { label: 'Kişisel Bakım', href: '/shop/kisisel-bakim' },
                { label: 'Mask Bar', href: '/shop/mask-bar' },
              ].map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm px-4 py-1.5 rounded-full border transition-colors hover:bg-[#92D0AA] hover:text-white hover:border-[#92D0AA]"
                  style={{ borderColor: 'rgba(146,208,170,0.4)', color: '#555' }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Simple footer */}
      <div className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Merumy. Tüm hakları saklıdır.</p>
      </div>
    </main>
  )
}
