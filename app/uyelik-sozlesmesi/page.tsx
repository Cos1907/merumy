'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function UyelikSozlesmesiPage() {
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
            MERUMY ÜYELİK SÖZLEŞMESİ
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              Sayın Kullanıcımız, İşbu Üyelik Sözleşmesi ile, MERUMY GÜZELLİK VE BAKIM ÜRÜNLERİ TİCARET ANONİM ŞİRKETİ tarafından sunulan hizmetlerden, adınıza oluşturulacak güvenli kullanıcı hesabı aracılığıyla daha verimli şekilde yararlanmanız amaçlanmaktadır.
            </p>
            <p>
              Üyelik sırasında onay kutucuğunu işaretleyerek "Üye Ol" butonuna basmanız ile işbu Sözleşme yürürlüğe girecek olup, bu tarihten itibaren gerçekleştireceğiniz tüm işlemlerden kullanıcı sıfatıyla sorumluluğunuz doğacaktır.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">1. TARAFLAR</h2>
            <p>İşbu Üyelik Sözleşmesi;</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>MERUMY GÜZELLİK VE BAKIM ÜRÜNLERİ TİCARET ANONİM ŞİRKETİ</strong> ("MERUMY" veya "Şirket")</p>
              <p><strong>Merkez Adresi:</strong> Suadiye Mahallesi, Bağdat Caddesi Ark 399 No: 399/1 İç Kapı No: 1 Kadıköy / İstanbul</p>
            </div>
            <p>ile MERUMY'ye ait internet sitesi ve/veya mobil uygulama üzerinden sunulan hizmetlerden yararlanan Kullanıcı / Üye arasında akdedilmiştir.</p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">2. TANIMLAR</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Site:</strong> MERUMY'ye ait internet sitesini ifade eder.</li>
              <li><strong>Mobil Uygulama:</strong> MERUMY tarafından işletilen mobil uygulamayı ifade eder.</li>
              <li><strong>Kullanıcı:</strong> Siteye veya Mobil Uygulamaya erişen gerçek veya tüzel kişileri ifade eder.</li>
              <li><strong>Üye:</strong> İşbu Sözleşme'yi kabul ederek Site'ye veya Mobil Uygulama'ya üye olan reşit Kullanıcı'yı ifade eder.</li>
              <li><strong>Üyelik:</strong> Kullanıcı tarafından doldurulan üyelik formunun MERUMY tarafından onaylanmasıyla oluşan üyelik statüsünü ifade eder.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">3. SÖZLEŞME'NİN KONUSU</h2>
            <p>
              İşbu Sözleşme'nin konusu; MERUMY tarafından Site ve/veya Mobil Uygulama üzerinden sunulan hizmetlerden Üye'nin yararlanma koşullarının ve tarafların karşılıklı hak ve yükümlülüklerinin belirlenmesidir.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">4. ÜYE'NİN HAK VE YÜKÜMLÜLÜKLERİ</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Üye, üyelik sırasında MERUMY'ye sunduğu tüm bilgilerin doğru, eksiksiz ve güncel olduğunu kabul eder.</li>
              <li>Üye, hesap bilgilerinin gizliliğinden ve güvenliğinden sorumludur.</li>
              <li>Üye, hesabı üzerinden gerçekleştirilen tüm işlemlerden sorumludur.</li>
              <li>Üye, Site ve Mobil Uygulama'yı yalnızca yasal amaçlarla kullanacağını taahhüt eder.</li>
              <li>Üye, üyelik bilgilerinde değişiklik olması halinde bilgilerini derhal güncellemelidir.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">5. MERUMY'NİN HAK VE YÜKÜMLÜLÜKLERİ</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>MERUMY, Site ve Mobil Uygulama'nın kesintisiz ve hatasız çalışacağını garanti etmez.</li>
              <li>MERUMY, herhangi bir zamanda ve önceden bildirimde bulunmaksızın hizmetlerini değiştirme, askıya alma veya sonlandırma hakkını saklı tutar.</li>
              <li>MERUMY, üyelik başvurularını reddetme veya mevcut üyelikleri sonlandırma hakkını saklı tutar.</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">6. HESAP ASKIYA ALMA VE SONLANDIRMA</h2>
            <p>
              Hesabınızın 3 yıl boyunca kullanılmaması halinde, güvenlik ve veri koruma amacıyla hesabınız pasif hale getirilebilir ve varsa birikmiş puanlarınız silinebilir. Bu durumda yeniden sipariş verebilmek için yeni bir hesap oluşturmanız gerekir.
            </p>

            <h2 className="text-2xl font-bold text-[#92D0AA] mt-8">7. YETKİLİ MAHKEME</h2>
            <p>
              İşbu Sözleşme'den doğabilecek uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

