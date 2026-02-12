'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function KBeautyHero() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Üst Bölüm */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Ana Başlık - Sol */}
            <div className="flex-1">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-engram font-bold text-primary leading-tight mb-6">
                K-Beauty'nin Büyülü Dokunuşu.
              </h1>
            </div>
            
            {/* Açıklama ve CTA - Sağ */}
            <div className="flex-1 lg:max-w-md">
              <p className="cs_fs_18 md:cs_fs_20 font-engram font-light text-secondary leading-relaxed mb-6">
                Doğanın saflığını bilimle birleştiren, cildinize sağlık ve ışıltı katan formüller. Merumy ile pürüzsüz güzelliğinizi keşfedin.
              </p>
              <a 
                href="/shop"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg cs_fs_18 font-engram font-medium hover:bg-primary/90 transition-colors"
              >
                Koleksiyonu Keşfet
                <ArrowRight size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Ana İçerik Alanı - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Büyük Sol Bölüm - Üzerinde Yazı Olan Görsel */}
          <div className="relative md:row-span-2 min-h-[500px] rounded-2xl overflow-hidden group">
            <Image
              src="/images/1compoment.jpg"
              alt="İpeksi Dokunuş"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 z-10">
              <p className="cs_fs_16 font-engram font-light text-white mb-2 opacity-90">
                İpeksi Dokunuş
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-engram font-bold text-white leading-tight">
                Cildinizin Rüyası<br />Gerçek Olsun
              </h2>
            </div>
          </div>

          {/* Sağ Taraf - Flex Column */}
          <div className="flex flex-col gap-6">
            {/* Üst: Yenilikçi Formüller ve Günlük Ritüel */}
            <div className="flex flex-col gap-6">
              {/* Yenilikçi Formüller */}
              <div className="relative min-h-[240px] rounded-2xl overflow-hidden group">
                <Image
                  src="/images/2compoment.jpg"
                  alt="Yenilikçi Formüller"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 z-10">
                  <p className="cs_fs_16 font-engram font-light text-white mb-2 opacity-90">
                    Yenilikçi Formüller
                  </p>
                  <h3 className="text-2xl md:text-3xl font-engram font-bold text-white leading-tight uppercase">
                    CİLDİNİZİ BESLEYEN<br />SAF İÇERİKLER
                  </h3>
                </div>
              </div>

              {/* Günlük Ritüel */}
              <div className="relative min-h-[240px] rounded-2xl overflow-hidden group">
                <Image
                  src="/images/3compoment.jpg"
                  alt="Günlük Ritüel"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 z-10">
                  <p className="cs_fs_16 font-engram font-light text-white mb-2 opacity-90">
                    Günlük Ritüel
                  </p>
                  <h3 className="text-2xl md:text-3xl font-engram font-bold text-white leading-tight">
                    Her An Canlı<br />ve Taze Görünüm
                  </h3>
                </div>
              </div>
            </div>

            {/* Alt: Yan Yana İki Kart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sol: %50 İndirim ve Yenilikçi Formüller */}
              <div className="relative min-h-[240px] rounded-2xl overflow-hidden p-6 flex flex-col justify-between border border-white/20" style={{ background: 'linear-gradient(135deg, #92D0AA 0%, #F0E99A 100%)' }}>
                <div>
                  <p className="cs_fs_16 font-engram font-light text-primary mb-2">
                    Yenilikçi Formüller
                  </p>
                  <h3 className="text-3xl md:text-4xl font-engram font-bold text-white mb-4 drop-shadow-md">
                    %50 İndirim
                  </h3>
                </div>
                <a 
                  href="/shop?promo=serum-set"
                  className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg cs_fs_16 font-engram font-medium hover:bg-white/90 transition-colors w-fit shadow-lg"
                >
                  İndirimi Yakala
                  <ArrowRight size={18} />
                </a>
              </div>

              {/* Sağ: Çok Satan Serum Seti */}
              <div className="relative min-h-[240px] rounded-2xl overflow-hidden p-6 flex flex-col justify-between border border-white/20" style={{ background: 'linear-gradient(135deg, #92D0AA 0%, #F0E99A 100%)' }}>
                <div>
                  <p className="cs_fs_16 font-engram font-light text-white/90 mb-2">
                    Çok Satan Serum Seti
                  </p>
                  <h3 className="text-3xl md:text-4xl font-engram font-bold text-white mb-4 drop-shadow-md">
                    Her An Canlı<br />ve Taze Görünüm
                  </h3>
                </div>
                <a 
                  href="/shop?promo=serum-set"
                  className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg cs_fs_16 font-engram font-medium hover:bg-white/90 transition-colors w-fit shadow-lg"
                >
                  Keşfet
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

