'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function OdemeYontemleriPage() {
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
            Ödeme Yöntemleri
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              MERUMY'de güvenli ve kolay ödeme seçenekleri sunuyoruz. Aşağıdaki ödeme yöntemlerinden size en uygun olanı seçebilirsiniz.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Kredi Kartı / Banka Kartı</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Visa</li>
              <li>Mastercard</li>
              <li>American Express</li>
              <li>Troy</li>
            </ul>
            <p>Tüm kredi kartı işlemleriniz 256-bit SSL şifreleme ile korunmaktadır.</p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Taksitli Ödeme</h2>
            <p>Anlaşmalı bankaların kredi kartlarıyla 2, 3, 6 ve 9 taksit seçeneklerinden yararlanabilirsiniz.</p>
            <div className="bg-[#92D0AA]/10 p-4 rounded-lg">
              <p className="font-semibold">Not: Taksit seçenekleri kampanya dönemlerinde değişiklik gösterebilir.</p>
            </div>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Havale / EFT</h2>
            <p>Banka havalesi ile ödeme yapmak isterseniz, sipariş sonrası size iletilecek banka hesap bilgilerine ödemenizi yapabilirsiniz.</p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Kapıda Ödeme</h2>
            <p>Kapıda nakit veya kredi kartı ile ödeme seçeneği mevcuttur. Kapıda ödeme için ek hizmet bedeli uygulanabilir.</p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Güvenli Ödeme</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tüm ödemeleriniz 3D Secure ile korunmaktadır.</li>
              <li>Kart bilgileriniz hiçbir şekilde sistemimizde saklanmaz.</li>
              <li>PCI DSS uyumlu ödeme altyapısı kullanılmaktadır.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">İletişim</h2>
            <p>Ödeme ile ilgili sorularınız için:</p>
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

