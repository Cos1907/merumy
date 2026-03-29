'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getKoreTrendProducts } from '../lib/products'

export default function SpecialOffers() {
  const [offerProducts, setOfferProducts] = useState(() => getKoreTrendProducts(2))

  useEffect(() => {
    setOfferProducts(getKoreTrendProducts(2))
  }, [])

  if (!offerProducts || offerProducts.length === 0) return null

  return (
    <section className="py-6 md:py-12 bg-white">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6">
          {offerProducts.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group relative overflow-hidden cursor-pointer border-2 border-[#EEE695] rounded-xl md:rounded-[20px]"
            >
              {/* ── MOBİL LAYOUT: dikey (üstte görsel, altta metin) ── */}
              <div className="flex flex-col md:hidden">
                {/* Görsel – sabit oran, object-contain ile kırpma yok */}
                <div className="w-full bg-gray-50 overflow-hidden rounded-t-xl" style={{ aspectRatio: '4/3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image || ''}
                    alt={p.name || ''}
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Metin */}
                <div className="p-4 flex flex-col gap-1">
                  <span className="font-grift font-bold uppercase text-[#92D0AA] text-base leading-tight">
                    SANA ÖZEL FIRSAT
                  </span>
                  <p className="font-grift text-[#F1EB9C] text-sm leading-tight line-clamp-2">
                    {p.name}
                  </p>
                  <p className="font-grift text-[#92D0AA] text-sm font-bold">
                    ₺{p.price.toFixed(2)}
                  </p>
                  <button
                    className="mt-2 font-grift font-bold uppercase text-white rounded-lg px-5 py-2 w-fit bg-[#92D0AA] hover:bg-[#7bb896] transition-colors text-xs"
                    onClick={(e) => {
                      e.preventDefault()
                      window.location.href = `/product/${p.slug}`
                    }}
                  >
                    KEŞFET
                  </button>
                </div>
              </div>

              {/* ── DESKTOP LAYOUT: yan yana ── */}
              <div className="hidden md:flex items-stretch min-h-[260px] lg:min-h-[300px]">
                {/* Sol: görsel */}
                <div className="relative w-1/2 overflow-hidden rounded-l-[18px] bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image || ''}
                    alt={p.name || ''}
                    className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                {/* Sağ: metin */}
                <div className="w-1/2 flex flex-col justify-center p-5 lg:p-8">
                  <h3 className="font-grift font-bold uppercase mb-3 text-[#92D0AA] text-xl lg:text-2xl leading-tight">
                    SANA ÖZEL FIRSAT
                  </h3>
                  <p className="font-grift mb-2 text-[#F1EB9C] text-base lg:text-lg leading-tight line-clamp-2">
                    {p.name}
                  </p>
                  <p className="font-grift mb-1 text-[#92D0AA] text-sm">
                    Merumy.com&apos;a Özel
                  </p>
                  <p className="font-grift mb-5 text-[#92D0AA] text-base font-bold">
                    ₺{p.price.toFixed(2)}
                  </p>
                  <button
                    className="font-grift font-bold uppercase text-white rounded-lg px-6 py-3 w-fit transition-colors bg-[#92D0AA] hover:bg-[#7bb896] text-sm lg:text-base"
                    onClick={(e) => {
                      e.preventDefault()
                      window.location.href = `/product/${p.slug}`
                    }}
                  >
                    KEŞFET
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
