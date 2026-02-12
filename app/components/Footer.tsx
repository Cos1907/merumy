import Image from 'next/image'
import Link from 'next/link'
import CargoTracker from './CargoTracker'

export default function Footer() {
  return (
    <footer className="bg-[#92D0AA] pt-10 md:pt-20 pb-6 md:pb-10">
      <div className="w-full px-4 md:px-8 lg:px-16 xl:px-24 mx-auto">
        {/* Üst Bölüm: Logo ve Hikayemiz */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-8 md:mb-16 gap-6 md:gap-12">
          {/* Logo ve Slogan */}
          <div className="flex flex-col items-start w-full lg:w-auto">
            <div className="mb-3 md:mb-4 relative w-[200px] md:w-[390px] h-[60px] md:h-[111px]">
               <Image 
                 src="/footerlogo.png" 
                 alt="Merumy Logo" 
                 fill
                 className="object-contain object-left"
               />
            </div>
            <h2 className="text-white uppercase font-grift font-normal text-sm md:text-[20px] leading-tight md:leading-[26px]">
              PURE BEAUTY GLOW WITH MERUMY
            </h2>
          </div>

          {/* Hikayemiz - Mobilde gizle */}
          <div className="hidden md:flex flex-col items-start p-0 gap-[10px] w-[800px] max-w-full">
            <h3 className="text-[#EEE695] font-grift font-normal text-base leading-none tracking-normal">
              Hikayemiz
            </h3>
            <div className="text-white font-grift font-light text-sm leading-relaxed tracking-normal space-y-3">
              <p>
                Merumy, Kore cilt bakım markalarını tek bir çatı altında, güvenle bir araya getirme fikriyle ortaya çıktı.
              </p>
              <p>
                Kore kozmetiği dünyada uzun süredir ilgi görüyor; ancak doğru markalara ulaşmak ve hangisinin gerçekten size uygun olduğunu anlamak her zaman kolay olmuyor. Merumy, bu süreci daha sade ve anlaşılır hale getirmek için kuruldu.
              </p>
              <p>
                Farklı Kore markalarını; içeriklerine, kullanım amaçlarına ve ciltle uyumuna bakarak özenle seçiyoruz. Trendlerin peşinden gitmek yerine, güvenle kullanılabilecek ürünleri bir araya getirmeye odaklanıyoruz.
              </p>
              <p>
                Türkiye'de, Kore cilt bakımını bu yaklaşımla sunan öncü platformlardan biri olarak; kullanıcılarımızla yalnızca ürünleri değil, güven duygusunu ve doğru bilgiyi de paylaşıyoruz.
              </p>
              <p>
                Merumy, Kore cilt bakımını daha ulaşılabilir, daha anlaşılır ve daha güvenilir kılmak için burada.
              </p>
            </div>
          </div>
        </div>

        {/* Alt Bölüm: Linkler - 6 sütun */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-8 md:mb-16">
          {/* Müşteri Hizmetleri */}
          <div>
            <h3 className="text-[#EEE695] mb-2 md:mb-4 font-grift font-normal text-xs md:text-base leading-none tracking-normal">
              Müşteri Hizmetleri
            </h3>
            <ul className="space-y-1.5 md:space-y-3">
              <li><Link href="/shipping-returns" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Kargo ve İadeler</Link></li>
              <li><Link href="/contact" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">İletişim</Link></li>
              <li><Link href="/kvkk-aydinlatma" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Gizlilik Politikası</Link></li>
              <li className="hidden md:block"><Link href="/satis-kosullari" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Şartlar ve Koşullar</Link></li>
              <li className="pt-2">
                <CargoTracker />
              </li>
            </ul>
          </div>

          {/* İletişim Bilgileri */}
          <div>
            <h3 className="text-[#EEE695] mb-2 md:mb-4 font-grift font-normal text-xs md:text-base leading-none tracking-normal">
              İletişim Bilgileri
            </h3>
            <ul className="space-y-1.5 md:space-y-3">
              <li><a href="tel:+905010615009" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">+90 501 061 50 09</a></li>
              <li><a href="mailto:info@merumy.com" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight break-all">info@merumy.com</a></li>
              <li className="text-white font-grift font-light text-[10px] md:text-sm leading-tight">Atatürk, Erzincan Sk.</li>
              <li className="text-white font-grift font-light text-[10px] md:text-sm leading-tight">No: 11, 34758 Ataşehir/İstanbul</li>
            </ul>
          </div>

          {/* Ödeme */}
          <div>
            <h3 className="text-[#EEE695] mb-2 md:mb-4 font-grift font-normal text-xs md:text-base leading-none tracking-normal">
              Ödeme
            </h3>
            <ul className="space-y-1.5 md:space-y-3">
              <li><Link href="/kullanim-sartlari" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Kullanım Şartları</Link></li>
              <li><Link href="/odeme-yontemleri" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Ödeme Yöntemleri</Link></li>
              <li><Link href="/kargo-rehberi" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Kargo Rehberi</Link></li>
            </ul>
          </div>

          {/* Bilgi */}
          <div>
            <h3 className="text-[#EEE695] mb-2 md:mb-4 font-grift font-normal text-xs md:text-base leading-none tracking-normal">
              Bilgi
            </h3>
            <ul className="space-y-1.5 md:space-y-3">
              <li><Link href="/teslimat-bilgisi" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Teslimat Bilgisi</Link></li>
              <li><Link href="/sss" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">SSS</Link></li>
              <li><Link href="/contact" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">İletişim</Link></li>
            </ul>
          </div>

          {/* Sözleşmeler */}
          <div>
            <h3 className="text-[#EEE695] mb-2 md:mb-4 font-grift font-normal text-xs md:text-base leading-none tracking-normal">
              Sözleşmeler
            </h3>
            <ul className="space-y-1.5 md:space-y-3">
              <li><Link href="/mesafeli-satis-sozlesmesi" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="/uyelik-sozlesmesi" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Üyelik Sözleşmesi</Link></li>
              <li><Link href="/cerez-politikasi" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Çerez Politikası</Link></li>
              <li className="hidden md:block"><Link href="/ticari-ileti-onayi" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Ticari İleti Onayı</Link></li>
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <h3 className="text-[#EEE695] mb-2 md:mb-4 font-grift font-normal text-xs md:text-base leading-none tracking-normal">
              Kurumsal
            </h3>
            <ul className="space-y-1.5 md:space-y-3">
              <li><Link href="/hakkimizda" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Hakkımızda</Link></li>
              <li><Link href="/magazalar" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Mağazalarımız</Link></li>
              <li><Link href="/shop" className="text-white hover:text-[#EEE695] transition-colors font-grift font-light text-[10px] md:text-sm leading-tight">Tüm Ürünler</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 md:pt-8 border-t border-white/20 flex justify-center md:justify-end">
          <p className="text-white text-center md:text-right font-grift font-normal text-[10px] md:text-xs leading-tight">
            © 2026 Merumy | Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  )
}
