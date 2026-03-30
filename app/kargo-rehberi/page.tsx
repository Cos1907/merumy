'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function KargoRehberiPage() {
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const headerContainer = document.querySelector('.fixed.top-0.left-0.right-0.z-50')
      if (headerContainer) {
        setHeaderHeight((headerContainer as HTMLElement).clientHeight)
      } else {
        setHeaderHeight(140)
      }
    }

    setTimeout(calculateHeaderHeight, 50)
    window.addEventListener('resize', calculateHeaderHeight)
    return () => window.removeEventListener('resize', calculateHeaderHeight)
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div style={{ marginTop: `${headerHeight}px` }}>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-[#92D0AA] font-grift mb-8">
            Kargo Rehberi
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Kargo Firması</h2>
            <p>
              Siparişleriniz anlaşmalı kargo firmalarımız aracılığıyla gönderilmektedir. Kargo takip numaranız sipariş kargoya verildiğinde e-posta ve SMS ile tarafınıza iletilecektir.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Kargo Ücreti</h2>
            <div className="bg-[#92D0AA]/10 p-4 rounded-lg">
              <p className="font-semibold text-lg">1000 TL ve üzeri siparişlerde kargo ücretsiz!</p>
            </div>
            <p>1000 TL altı siparişlerde 80 TL kargo ücreti uygulanır.</p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Teslimat Süresi</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>İstanbul:</strong> 1-2 iş günü</li>
              <li><strong>Büyükşehirler:</strong> 2-3 iş günü</li>
              <li><strong>Diğer İller:</strong> 3-5 iş günü</li>
            </ul>
            <p className="text-sm text-gray-500">* Teslimat süreleri tahmini olup, kargo yoğunluğuna göre değişiklik gösterebilir.</p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Sipariş Takibi</h2>
            <p>Siparişinizi takip etmek için:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hesabınıza giriş yaparak "Siparişlerim" bölümünden</li>
              <li>Size gönderilen kargo takip numarası ile kargo firmasının web sitesinden</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Teslim Alırken Dikkat Edilmesi Gerekenler</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Paketi teslim almadan önce dış ambalajını kontrol edin.</li>
              <li>Hasarlı veya açılmış paketleri teslim almayın.</li>
              <li>Kargo görevlisi önünde tutanak tutturun.</li>
              <li>Sorunlu teslimatları derhal bize bildirin.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">İletişim</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>E-posta:</strong> info@merumy.com</p>
              <p><strong>Telefon:</strong> 0501 061 50 09</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

