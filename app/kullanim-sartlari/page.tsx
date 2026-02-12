'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function KullanimSartlariPage() {
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
            Kullanım Şartları
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              MERUMY GÜZELLİK VE BAKIM ÜRÜNLERİ TİCARET ANONİM ŞİRKETİ ("MERUMY") olarak, web sitemizi ve mobil uygulamamızı kullanımınız aşağıdaki şartlara tabidir.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">1. Genel Hükümler</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Web sitesini kullanarak bu şartları kabul etmiş sayılırsınız.</li>
              <li>MERUMY, bu şartları önceden haber vermeksizin değiştirme hakkını saklı tutar.</li>
              <li>Değişiklikler web sitesinde yayınlandığı tarihten itibaren geçerli olur.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">2. Hesap Güvenliği</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hesap bilgilerinizin gizliliğinden siz sorumlusunuz.</li>
              <li>Şifrenizi kimseyle paylaşmayın.</li>
              <li>Yetkisiz erişim tespit ettiğinizde derhal bize bildirin.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">3. Yasaklanan Davranışlar</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Yasadışı amaçlarla kullanım</li>
              <li>Zararlı yazılım yükleme veya dağıtma</li>
              <li>Başkalarının haklarını ihlal etme</li>
              <li>Sisteme yetkisiz erişim girişimi</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">4. Fikri Mülkiyet</h2>
            <p>
              Web sitesindeki tüm içerik, tasarım, logo ve markalar MERUMY'ye aittir ve telif hakkı ile korunmaktadır.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">5. İletişim</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>E-posta:</strong> info@merumy.com</p>
              <p><strong>Telefon:</strong> 0501 061 50 09</p>
              <p><strong>Adres:</strong> Atatürk, Erzincan Sk. No: 11, 34758 Ataşehir/İstanbul</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

