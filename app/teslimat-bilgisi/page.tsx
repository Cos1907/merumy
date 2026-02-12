'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function TeslimatBilgisiPage() {
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
            Teslimat Bilgisi
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Teslimat Kapsamı</h2>
            <p>
              MERUMY olarak Türkiye'nin tüm illerine teslimat yapmaktayız. Şu an için yurt dışı teslimat hizmeti bulunmamaktadır.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Teslimat Süreleri</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 mt-4">
                <thead>
                  <tr className="bg-[#92D0AA]/10">
                    <th className="border border-gray-300 px-4 py-2 text-left">Bölge</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Tahmini Süre</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">İstanbul (Avrupa)</td>
                    <td className="border border-gray-300 px-4 py-2">1-2 iş günü</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">İstanbul (Anadolu)</td>
                    <td className="border border-gray-300 px-4 py-2">1-2 iş günü</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Marmara Bölgesi</td>
                    <td className="border border-gray-300 px-4 py-2">2-3 iş günü</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Ege ve Akdeniz</td>
                    <td className="border border-gray-300 px-4 py-2">2-3 iş günü</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">İç Anadolu</td>
                    <td className="border border-gray-300 px-4 py-2">3-4 iş günü</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Karadeniz</td>
                    <td className="border border-gray-300 px-4 py-2">3-4 iş günü</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Doğu ve Güneydoğu Anadolu</td>
                    <td className="border border-gray-300 px-4 py-2">4-5 iş günü</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Sipariş İşleme</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Siparişler hafta içi 16:00'a kadar verilirse aynı gün kargoya teslim edilir.</li>
              <li>Hafta sonu verilen siparişler Pazartesi günü işleme alınır.</li>
              <li>Resmi tatillerde sipariş işleme süreleri uzayabilir.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Teslimat Adresi</h2>
            <p>
              Teslimat adresinizi doğru ve eksiksiz girdiğinizden emin olun. Yanlış adres bilgisi nedeniyle yaşanan gecikmelerden MERUMY sorumlu tutulamaz.
            </p>

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

