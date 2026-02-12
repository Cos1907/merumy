'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function TicariIletiOnayiPage() {
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
            Ticari Elektronik İleti Onayı
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <div className="bg-[#92D0AA]/10 p-6 rounded-xl border-l-4 border-[#92D0AA]">
              <p className="text-lg">
                Kişisel verilerimin, Merumy ("Şirket") tarafından doğrudan veya dolaylı pazarlama faaliyetlerinin yürütülmesi amacıyla işlenmesine; bu kapsamda iletişim bilgilerime reklam, promosyon, kampanya, indirim, avantaj, ürün ve hizmet tanıtımları ile müşteri memnuniyetine yönelik bilgilendirmeler hakkında, tercih ettiğim iletişim kanalı üzerinden (SMS, e-posta, WhatsApp vb.) ticari elektronik ileti gönderilmesine onay veriyorum.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Onayın Kapsamı</h2>
            <p>Bu onay kapsamında aşağıdaki iletişim türleri yer almaktadır:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reklam ve tanıtım içerikli e-postalar</li>
              <li>SMS ile gönderilen kampanya bilgilendirmeleri</li>
              <li>WhatsApp üzerinden iletilen promosyon haberleri</li>
              <li>İndirim ve fırsat duyuruları</li>
              <li>Yeni ürün ve hizmet tanıtımları</li>
              <li>Müşteri memnuniyeti anketleri</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Veri Paylaşımı</h2>
            <p>
              Bu amaçlarla sınırlı olmak üzere, kişisel verilerimin Şirket'in bu hizmetleri sunabilmesi için hizmet aldığı üçüncü kişilerle paylaşılmasını kabul ediyorum.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Onayın Geri Alınması</h2>
            <p>
              Dilediğim zaman ticari elektronik ileti alımına ilişkin onayımı geri alabileceğimi ve iletişim tercihlerimi güncelleyebileceğimi biliyorum.
            </p>
            <p>Onayınızı geri almak için:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>E-posta ile: <strong>info@merumy.com</strong> adresine başvuru yapabilirsiniz.</li>
              <li>SMS içerisindeki "İPTAL" komutunu kullanabilirsiniz.</li>
              <li>Hesap ayarlarınızdan iletişim tercihlerinizi güncelleyebilirsiniz.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">Yasal Dayanak</h2>
            <p>
              Bu onay, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve ilgili yönetmelikler kapsamında alınmaktadır.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mt-8">
              <h3 className="font-bold text-gray-800 mb-2">İletişim</h3>
              <p><strong>E-posta:</strong> info@merumy.com</p>
              <p><strong>Telefon:</strong> 0501 061 50 09</p>
              <p><strong>Adres:</strong> Suadiye Mahallesi, Bağdat Caddesi Ark 399 No: 399/1 İç Kapı No: 1 Kadıköy / İstanbul</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

