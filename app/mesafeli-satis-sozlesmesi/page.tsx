'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MesafeliSatisSozlesmesiPage() {
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
            MESAFELİ SATIŞ SÖZLEŞMESİ
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">TARAFLAR</h2>
            
            <h3 className="text-xl font-semibold text-gray-800">(1) SATICI</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Ticaret Unvanı:</strong> MERUMY GÜZELLİK VE BAKIM ÜRÜNLERİ TİCARET ANONİM ŞİRKETİ ("MERUMY" veya "Satıcı")</p>
              <p><strong>Merkez Adresi:</strong> Suadiye Mahallesi, Bağdat Caddesi Ark 399 No: 399/1 İç Kapı No: 1 Kadıköy / İstanbul</p>
              <p><strong>Telefon:</strong> 0501 061 50 09</p>
              <p><strong>E-posta:</strong> info@merumy.com</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800">(2) ALICI</h3>
            <p>MERUMY'ye ait internet sitesi ve/veya mobil uygulama üzerinden alışveriş yapan gerçek veya tüzel kişi ("Alıcı").</p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">1. KONU</h2>
            <p>
              İşbu Sözleşme'nin konusu; MERUMY'ye ait internet sitesi ve/veya mobil uygulama üzerinden sipariş edilen ürün veya ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca tarafların hak ve yükümlülüklerinin belirlenmesidir.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">2. ÜRÜN VE TESLİMAT</h2>
            <p>Alıcı tarafından sipariş edilen ürünlere ilişkin bilgiler sipariş onayı e-postasında detaylı olarak belirtilmektedir.</p>

            <h3 className="text-xl font-semibold text-gray-800 mt-4">Teslimat Prosedürü</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>MERUMY, yalnızca Türkiye sınırları içerisinde teslimat yapmaktadır.</li>
              <li>Ürünler, Satıcı'nın anlaşmalı olduğu kargo firması aracılığıyla Alıcı'nın bildirdiği adrese teslim edilir.</li>
              <li>Teslimat süresi, sipariş onayının Alıcı'ya iletilmesinden itibaren azami 30 (otuz) gündür.</li>
              <li>Kargo firmasının haftada belirli günlerde teslimat yaptığı bölgelerde, sevk bilgilerindeki eksiklikler, doğal afetler, olağanüstü haller gibi Satıcı'nın kontrolü dışında gelişen durumlarda gecikme yaşanabilir.</li>
              <li>Alıcı, ürünü teslim alırken paketi kontrol etmekle yükümlüdür. Hasarlı paketler teslim alınmamalı ve kargo görevlisine tutanak tutturulmalıdır.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">3. CAYMA HAKKI</h2>
            <p>
              Alıcı, hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin, ürünü teslim aldığı tarihten itibaren 14 (on dört) gün içinde cayma hakkını kullanabilir.
            </p>
            <p>
              Cayma hakkının kullanılabilmesi için ürünün kullanılmamış, ambalajının açılmamış ve satışa uygun durumda olması gerekmektedir.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">4. İADE PROSEDÜRÜ</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>İade talebinizi info@merumy.com adresine e-posta göndererek veya müşteri hizmetlerimizi arayarak iletebilirsiniz.</li>
              <li>Ürün, orijinal ambalajında ve faturası ile birlikte iade edilmelidir.</li>
              <li>İade kargo ücreti Alıcı tarafından karşılanır.</li>
              <li>Ürün bedelinin iadesi, ürünün Satıcı'ya ulaşmasından itibaren 14 gün içinde yapılır.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">5. YETKİLİ MAHKEME</h2>
            <p>
              İşbu Sözleşme'den doğabilecek uyuşmazlıklarda, Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

