'use client'

import Image from 'next/image'

export default function UnlockNaturalBeauty() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="relative">
            <div className="relative w-full h-[600px] rounded-2xl overflow-hidden">
              <Image
                src="/images/Rectangle_160pc.webp"
                alt="Doğal Güzellik"
                fill
                className="object-cover"
              />
              {/* Floating water stickers */}
              <div className="absolute top-20 left-8 animate-float">
                <Image
                  src="/images/S_watersticker2.avif"
                  alt="Su Damlası"
                  width={80}
                  height={80}
                  className="opacity-80"
                />
              </div>
              <div className="absolute bottom-32 right-12 animate-float-delayed">
                <Image
                  src="/images/B_waterstiicker1.avif"
                  alt="Su Damlası"
                  width={120}
                  height={120}
                  className="opacity-80"
                />
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8">
            <div>
              <h2 className="cs_fs_72 font-sf-pro font-bold text-primary leading-tight mb-6">
                <span className="block">Doğal</span>
                <span className="block">Güzelliğinizi Keşfedin</span>
              </h2>
              <p className="cs_fs_20 font-sf-pro text-gray-600 leading-relaxed max-w-lg">
                <span className="font-sf-pro font-semibold">MERUMY</span>, temiz doğadan elde edilen doğal içerikli kozmetiklerle sağlıklı yaşam tarzını destekleyen küresel bir markadır.
              </p>
            </div>

            <div className="pt-4">
              <a
                href="/shop"
                className="inline-block border-2 border-primary text-primary px-8 py-4 rounded-lg cs_fs_18 font-sf-pro font-semibold hover:bg-primary hover:text-white transition-all duration-300"
              >
                DAHA FAZLA KEŞFET
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </section>
  )
}
