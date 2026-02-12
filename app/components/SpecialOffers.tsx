'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getKoreTrendProducts } from '../lib/products'

export default function SpecialOffers() {
  const [offerProducts, setOfferProducts] = useState(() => getKoreTrendProducts(2))
  
  useEffect(() => {
    setOfferProducts(getKoreTrendProducts(2))
  }, [])

  return (
    <section className="py-6 md:py-12 bg-white">
      <div className="container mx-auto px-2 md:px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {offerProducts.map((p, idx) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group relative flex flex-col md:flex-row items-stretch overflow-hidden cursor-pointer border-2 border-[#EEE695] rounded-xl md:rounded-[20px] min-h-[200px] md:min-h-[300px]"
            >
              {/* Mobile: Full width image at top, Desktop: Left side */}
              <div className="relative w-full md:w-1/2 h-[150px] md:h-auto overflow-hidden rounded-t-xl md:rounded-t-none md:rounded-l-[18px]">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              </div>

              {/* Text Section - Mobile: Bottom, Desktop: Right */}
              <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center p-3 md:p-5 lg:p-[20px_30px]">
                <h3 className="font-grift font-bold uppercase mb-2 md:mb-4 text-[#92D0AA] text-base md:text-xl lg:text-2xl leading-tight">
                  SANA ÖZEL FIRSAT
                </h3>
                <p className="font-grift font-normal mb-1 md:mb-2 text-[#F1EB9C] text-sm md:text-base lg:text-lg leading-tight line-clamp-2">
                  {p.name}
                </p>
                <p className="font-grift font-normal mb-0.5 md:mb-1 text-[#92D0AA] text-xs md:text-sm lg:text-base leading-tight">
                  Merumy.com&apos;a Özel
                </p>
                <p className="font-grift font-normal mb-3 md:mb-6 text-[#92D0AA] text-sm md:text-base leading-tight">
                  ₺{p.price.toFixed(2)}
                </p>
                <button
                  className="font-grift font-bold uppercase text-white rounded-lg px-4 md:px-6 py-2 md:py-3 w-fit transition-colors bg-[#92D0AA] hover:bg-[#7bb896] text-xs md:text-sm lg:text-base"
                  onClick={(e) => {
                    e.preventDefault()
                    window.location.href = `/product/${p.slug}`
                  }}
                >
                  KEŞFET
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
