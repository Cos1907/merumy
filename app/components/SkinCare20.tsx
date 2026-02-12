'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function SkinCare20() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Side - Text Content */}
          <div className="flex-1">
            <h2 
              className="text-4xl lg:text-5xl font-bold font-grift mb-8 uppercase"
              style={{ color: '#92D0AA' }}
            >
              CİLT BAKIMI 2.0
            </h2>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-10">
              Geleneksel cilt bakımının ötesine geçin. Kore'nin en son teknolojisi ve 
              doğal içeriklerin mükemmel uyumuyla cildinizin gerçek potansiyelini keşfedin. 
              Akıllı cihazlar ve yenilikçi formüllerle evinizde profesyonel bakım deneyimi 
              yaşayın. Cildinizdeki değişimi ilk kullanımdan itibaren hissedeceksiniz.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link 
                href="/shop/cilt-bakimi"
                className="px-10 py-4 rounded-xl text-white font-bold text-lg transition-all hover:opacity-90"
                style={{ backgroundColor: '#92D0AA' }}
              >
                KEŞFET
              </Link>
              <Link 
                href="/shop/cilt-bakimi"
                className="px-10 py-4 rounded-xl text-white font-bold text-lg transition-all hover:opacity-90"
                style={{ backgroundColor: '#F1EB9C' }}
              >
                SATIN AL
              </Link>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="flex-1 w-full">
            <div className="relative w-full aspect-[16/9] lg:aspect-[4/3] rounded-[30px] overflow-hidden">
              <Image
                src="/main/koreanmakeup.jpg"
                alt="Cilt Bakımı 2.0"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

