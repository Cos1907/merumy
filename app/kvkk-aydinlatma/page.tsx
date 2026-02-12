'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function KVKKAydinlatmaPage() {
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
            KİŞİSEL VERİLERİN İŞLENMESİNE İLİŞKİN AYDINLATMA METNİ
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              Bu Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni, MERUMY GÜZELLİK VE BAKIM ÜRÜNLERİ TİCARET ANONİM ŞİRKETİ ("MERUMY" veya "Şirket") olarak, kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK")'nun 10. maddesi ve Aydınlatma Yükümlülüğünün Yerine Getirilmesine İlişkin Usul ve Esaslar Hakkında Tebliğ uyarınca nasıl işlediğimiz konusunda sizleri bilgilendirmek amacıyla hazırlanmıştır.
            </p>

            <p>
              MERUMY olarak gizlilik haklarınıza saygı duyuyor, kişisel verilerinizin güvenliğini sağlamak için azami özeni gösteriyoruz.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">1. Kapsam</h2>
            <p>Bu Aydınlatma Metni;</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fiziksel mağazalarımızda,</li>
              <li>Müşteri hizmetlerimiz aracılığıyla,</li>
              <li>MERUMY'ye ait internet sitesi ve mobil uygulamalar (varsa),</li>
              <li>Üçüncü taraf dijital platformlar</li>
            </ul>
            <p>üzerinden çevrimiçi veya çevrimdışı yollarla toplanan kişisel verilerin işlenmesine ilişkindir.</p>
            <p>Aydınlatma Metni, belirli kampanya, etkinlik veya sınırlı işleme faaliyetleri kapsamında güncellenebilir. Böyle bir durumda ilgili kişilere ayrıca bilgilendirme yapılır.</p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">2. Veri Sorumlusu</h2>
            <p>KVKK kapsamında kişisel verilerinizin veri sorumlusu:</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>MERUMY GÜZELLİK VE BAKIM ÜRÜNLERİ TİCARET ANONİM ŞİRKETİ</strong></p>
              <p><strong>Adres:</strong> Suadiye Mahallesi, Bağdat Caddesi Ark 399 No: 399/1 İç Kapı No: 1 Kadıköy / İstanbul</p>
              <p><strong>E-posta:</strong> info@merumy.com</p>
              <p><strong>Telefon:</strong> 0501 061 50 09</p>
            </div>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">3. Kişisel Verilerinizle İlgili Talepler İçin İletişim</h2>
            <p>Kişisel verilerinizin işlenmesine ilişkin her türlü soru ve talebiniz için bizimle aşağıdaki kanallardan iletişime geçebilirsiniz:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>E-posta:</strong> info@merumy.com</li>
              <li><strong>Yazılı Başvuru:</strong> Yukarıda belirtilen şirket adresine</li>
            </ul>
            <p>Başvurularınız KVKK ve ilgili Tebliğ hükümlerine uygun olarak değerlendirilir.</p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">4. İşlenen Kişisel Veri Kategorileri</h2>
            <h3 className="text-xl font-semibold text-gray-800 mt-4">4.1 Genel Bilgilendirme</h3>
            <p>Kişisel verileriniz, veri minimizasyonu ilkesi gereğince yalnızca gerekli olan ölçüde toplanır. Zorunlu alanlar doldurulmadığı takdirde bazı hizmetlerden yararlanmanız mümkün olmayabilir.</p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">5. Haklarınız</h2>
            <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
              <li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme,</li>
              <li>KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
              <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme.</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

