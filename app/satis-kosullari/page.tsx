'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function SatisKosullariPage() {
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
            MERUMY – Online Satışlar İçin Hüküm ve Şartlar
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">1. Genel</h2>
            <p>
              İşbu Online Satışlar için Hüküm ve Şartlar ("Hüküm ve Şartlar") kapsamında;
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>"MERUMY" veya "Biz":</strong> MERUMY GÜZELLİK VE BAKIM ÜRÜNLERİ TİCARET ANONİM ŞİRKETİ'ni ifade eder.</li>
              <li><strong>"Müşteri" veya "Siz":</strong> MERUMY'ye ait web sitesi ve/veya mobil uygulama üzerinden sipariş veren gerçek veya tüzel kişileri ifade eder.</li>
            </ul>
            <p>
              Lütfen web sitemizi veya mobil uygulamamızı kullanmadan önce işbu Hüküm ve Şartları dikkatlice okuyunuz. Web sitesine ve/veya mobil uygulamaya erişmeniz veya kullanmanız, işbu Hüküm ve Şartları kabul ettiğiniz anlamına gelir.
            </p>
            <p>
              İşbu Hüküm ve Şartları kabul etmiyorsanız, web sitesine veya mobil uygulamaya erişmeyiniz ve kullanmayınız.
            </p>
            <p>
              Tüm siparişler MERUMY'nin onayına tabidir. MERUMY, ürün veya hizmetin stokta bulunmaması veya operasyonel nedenlerle siparişi reddetme veya iptal etme hakkını saklı tutar.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">2. Üyelik</h2>
            <p>Web sitesi ve mobil uygulama üzerinden sipariş verebilmek için üye olmanız gerekmektedir.</p>
            <p>Üyelik sırasında;</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Doğru, eksiksiz ve güncel bilgiler sunmayı,</li>
              <li>Kullanıcı adı ve şifrenizin gizliliğini korumayı,</li>
              <li>Hesabınız üzerinden yapılan tüm işlemlerden sorumlu olduğunuzu,</li>
              <li>MERUMY'nin, tamamen kendi takdirine bağlı olarak üyelik başvurularını reddedebileceğini veya mevcut üyelikleri sonlandırabileceğini</li>
            </ul>
            <p>kabul etmiş sayılırsınız.</p>
            <p>Üyelik bilgilerinizde değişiklik olması halinde, bilgilerinizi derhal güncellemeniz gerekmektedir.</p>
            <p>
              Hesabınızın 3 yıl boyunca kullanılmaması halinde, güvenlik ve veri koruma amacıyla hesabınız pasif hale getirilebilir ve varsa birikmiş puanlarınız silinebilir. Bu durumda yeniden sipariş verebilmek için yeni bir hesap oluşturmanız gerekir.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">3. Gizlilik ve Kişisel Veriler</h2>
            <p>
              Müşteri, kişisel verilerinin MERUMY tarafından Gizlilik Politikası ve KVKK Aydınlatma Metni kapsamında işleneceğini kabul eder.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">4. Sipariş ve Ödeme</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Siparişiniz, ödemenin başarıyla tamamlanması ve MERUMY tarafından onaylanması ile kesinleşir.</li>
              <li>Kredi kartı, banka kartı ve diğer ödeme yöntemleri kabul edilmektedir.</li>
              <li>Fiyatlar, site üzerinde belirtildiği şekilde KDV dahildir.</li>
              <li>MERUMY, fiyatları önceden haber vermeksizin değiştirme hakkını saklı tutar.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">5. Teslimat</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Teslimat yalnızca Türkiye sınırları içerisinde yapılmaktadır.</li>
              <li>Teslimat süresi sipariş onayından itibaren 1-5 iş günüdür.</li>
              <li>Mücbir sebepler (doğal afet, salgın hastalık vb.) nedeniyle teslimat gecikmelerinden MERUMY sorumlu tutulamaz.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">6. İade ve Değişim</h2>
            <p>
              İade ve değişim koşulları Mesafeli Satış Sözleşmesi kapsamında belirlenmiştir. Detaylı bilgi için ilgili sözleşmeyi inceleyiniz.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">7. Fikri Mülkiyet</h2>
            <p>
              Web sitesi ve mobil uygulamadaki tüm içerik, tasarım, logo, marka ve diğer fikri mülkiyet hakları MERUMY'ye aittir ve izinsiz kullanılamaz.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">8. İletişim</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
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

