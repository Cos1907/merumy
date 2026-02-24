'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getKoreTrendProducts } from '../lib/products'
import { useCart } from '../context/CartContext'

// Binlik ayırıcı ile fiyat formatla (1200 → 1.200)
function formatPrice(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function SpecialOffers() {
  const { addToCart } = useCart()
  const [offerProducts, setOfferProducts] = useState(() => getKoreTrendProducts(2))
  
  useEffect(() => {
    setOfferProducts(getKoreTrendProducts(2))
  }, [])

  return (
    <section className="py-6 md:py-12 bg-white">
      <div className="container mx-auto px-2 md:px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {offerProducts.map((p) => (
            <div key={p.id}>
              {/* Desktop Version */}
              <Link
                href={`/product/${p.slug}`}
                className="hidden md:flex group relative items-stretch overflow-hidden cursor-pointer border-2 border-[#EEE695] rounded-[20px] min-h-[300px]"
              >
                {/* Desktop: Left side image with padding */}
                <div className="relative w-1/2 p-4 lg:p-5">
                  <div className="relative w-full h-full overflow-hidden rounded-xl">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="50vw"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Desktop: Right side text */}
                <div className="relative z-10 w-1/2 flex flex-col justify-center p-5 lg:p-[20px_30px]">
                  <h3 className="font-grift font-bold uppercase mb-4 text-[#92D0AA] text-xl lg:text-2xl leading-tight">
                    SANA ÖZEL FIRSAT
                  </h3>
                  <p className="font-grift font-normal mb-2 text-[#F1EB9C] text-base lg:text-lg leading-tight line-clamp-2">
                    {p.name}
                  </p>
                  <p className="font-grift font-normal mb-1 text-[#92D0AA] text-sm lg:text-base leading-tight">
                    Merumy.com&apos;a Özel
                  </p>
                  <p className="font-grift font-normal mb-6 text-[#92D0AA] text-base leading-tight">
                    ₺{formatPrice(p.price)}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      className="font-grift font-bold uppercase text-white rounded-lg px-5 py-2.5 transition-colors bg-[#92D0AA] hover:bg-[#7bb896] text-xs lg:text-sm whitespace-nowrap"
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = `/product/${p.slug}`
                      }}
                    >
                      KEŞFET
                    </button>
                    <button
                      className="font-grift font-bold uppercase text-[#92D0AA] rounded-lg px-5 py-2.5 transition-colors bg-[#92D0AA]/15 hover:bg-[#92D0AA]/25 text-xs lg:text-sm whitespace-nowrap"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addToCart(p, 1)
                      }}
                    >
                      SEPETE EKLE
                    </button>
                  </div>
                </div>
              </Link>

              {/* Mobile Version - Dikey layout, tam görsel */}
              <Link
                href={`/product/${p.slug}`}
                className="md:hidden block overflow-hidden cursor-pointer border-2 border-[#EEE695] rounded-xl"
              >
                {/* Mobile: Full width image - aspect ratio ile kırpılmadan */}
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-contain bg-gray-50"
                    sizes="100vw"
                    unoptimized
                  />
                </div>

                {/* Mobile: Bottom text section */}
                <div className="p-4 bg-white">
                  <h3 className="font-grift font-bold uppercase mb-2 text-[#92D0AA] text-sm leading-tight">
                    SANA ÖZEL FIRSAT
                  </h3>
                  <p className="font-grift font-normal mb-1 text-[#F1EB9C] text-sm leading-tight line-clamp-2">
                    {p.name}
                  </p>
                  <p className="font-grift font-normal mb-0.5 text-[#92D0AA] text-xs leading-tight">
                    Merumy.com&apos;a Özel
                  </p>
                  <p className="font-grift font-bold mb-3 text-[#92D0AA] text-base leading-tight">
                    ₺{formatPrice(p.price)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex-1 font-grift font-bold uppercase text-white rounded-lg px-3 py-2 transition-colors bg-[#92D0AA] hover:bg-[#7bb896] text-[10px] whitespace-nowrap"
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = `/product/${p.slug}`
                      }}
                    >
                      KEŞFET
                    </button>
                    <button
                      className="flex-1 font-grift font-bold uppercase text-[#92D0AA] rounded-lg px-3 py-2 transition-colors bg-[#92D0AA]/15 hover:bg-[#92D0AA]/25 text-[10px] whitespace-nowrap"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addToCart(p, 1)
                      }}
                    >
                      SEPETE EKLE
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
