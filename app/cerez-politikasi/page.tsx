'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function CerezPolitikasiPage() {
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
            MERUMY ÇEREZ AYDINLATMA METNİ
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              İşbu Çerez Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("Kanun") 10'uncu maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamında, veri sorumlusu sıfatıyla MERUMY GÜZELLİK VE BAKIM ÜRÜNLERİ TİCARET ANONİM ŞİRKETİ ("Merumy" veya "Şirket") tarafından hazırlanmıştır.
            </p>

            <p>
              Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcılar aracılığıyla cihazınıza veya ağ sunucusuna depolanan küçük metin dosyalarıdır.
            </p>

            <p>
              İşbu Çerez Aydınlatma Metni'nin amacı; internet sitemizde kullanılan çerezlerin cihazınıza yerleştirilmesi aracılığıyla otomatik yollarla elde edilen kişisel verilerin işlenmesine ilişkin olarak, hangi amaçlarla hangi tür çerezleri kullandığımız ve bu çerezleri nasıl yönetebileceğiniz hakkında sizleri bilgilendirmektir.
            </p>

            <p>
              İnternet sitemizde kullanılan zorunlu çerezler haricindeki çerezler için kullanıcıların açık rızaları alınmakta, kullanıcıların diledikleri zaman rızalarını değiştirebilmelerine imkân tanınmaktadır.
            </p>

            <p>
              Kullanıcılar, çerez yönetim paneli üzerinden internet sitemizde kullanılan çerez türlerini görüntüleyebilir; zorunlu çerezler dışındaki çerezler için "açık" veya "kapalı" seçenekleri ile tercihlerini belirleyebilir ve bu tercihlerini diledikleri zaman güncelleyebilirler.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">1. Çerez Türleri</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 mt-4">
                <thead>
                  <tr className="bg-[#92D0AA]/10">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Çerez Türü</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Oturum Çerezleri</td>
                    <td className="border border-gray-300 px-4 py-2">Site'yi kullanımınız sırasında geçerli olan çerezlerdir. Tarayıcı kapatıldığında otomatik olarak silinir ve oturumun sürekliliğini sağlamak amacıyla kullanılır.</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Kalıcı Çerezler</td>
                    <td className="border border-gray-300 px-4 py-2">Tarayıcınızda saklanan ve siz silinceye veya son kullanım tarihine kadar geçerliliğini koruyan çerezlerdir.</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Birinci Taraf Çerezler</td>
                    <td className="border border-gray-300 px-4 py-2">Doğrudan Merumy internet sitesi tarafından yerleştirilen çerezlerdir.</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Üçüncü Taraf Çerezler</td>
                    <td className="border border-gray-300 px-4 py-2">Ziyaret edilen alan adı dışında bir alan adı tarafından yerleştirilen çerezlerdir.</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Zorunlu Çerezler</td>
                    <td className="border border-gray-300 px-4 py-2">İnternet sitesinin çalışması için zorunlu olan çerezlerdir.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">2. Çerezlerin Kullanım Amaçları</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>İnternet sitesinin düzgün çalışmasını sağlamak</li>
              <li>Kullanıcı tercihlerini hatırlamak</li>
              <li>Site performansını analiz etmek ve iyileştirmek</li>
              <li>Güvenliği sağlamak</li>
              <li>Kişiselleştirilmiş içerik sunmak</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">3. Çerez Tercihlerinizi Yönetme</h2>
            <p>
              Tarayıcınızın ayarlarını değiştirerek çerezlere ilişkin tercihlerinizi kişiselleştirebilirsiniz. Çerezleri tamamen engelleyebilir, yalnızca belirli çerezlere izin verebilir veya cihazınıza kaydedilen çerezleri silebilirsiniz.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">4. İletişim</h2>
            <p>
              Çerezler hakkında sorularınız için <strong>info@merumy.com</strong> adresinden bizimle iletişime geçebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

