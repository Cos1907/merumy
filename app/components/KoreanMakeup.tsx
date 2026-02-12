'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMakeupProducts } from '../lib/products'
import { useCart } from '../context/CartContext'

function encodeImagePath(path: string): string {
  if (!path) return ''
  // Split by / to handle each segment
  return path.split('/').map(part => {
    // If part contains #, we need to encode it, but encodeURIComponent encodes everything.
    // However, for file system paths served via HTTP, we generally want standard URL encoding.
    return encodeURIComponent(part)
  }).join('/')
}

export default function KoreanMakeup() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState(() => getMakeupProducts(12))
  
  // Sayfa yenilendiğinde farklı ürünler göster
  useEffect(() => {
    setProducts(getMakeupProducts(12))
  }, [])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateScrollButtons = () => {
      const scrollLeft = container.scrollLeft
      const scrollWidth = container.scrollWidth
      const clientWidth = container.clientWidth
      
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }

    updateScrollButtons()
    container.addEventListener('scroll', updateScrollButtons)
    window.addEventListener('resize', updateScrollButtons)
    
    return () => {
      container.removeEventListener('scroll', updateScrollButtons)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth / 4 // Scroll one card width roughly
      const scrollAmount = scrollContainerRef.current.scrollLeft - cardWidth
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, scrollAmount),
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth / 4
      const scrollAmount = scrollContainerRef.current.scrollLeft + cardWidth
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth
      scrollContainerRef.current.scrollTo({
        left: Math.min(maxScroll, scrollAmount),
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 
            className="text-3xl font-bold font-grift uppercase"
            style={{ color: '#92D0AA' }}
          >
            KOREAN MAKE UP
          </h2>
          <Link 
            href="/shop/makyaj"
            className="bg-[#92D0AA] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#7ab594] transition-colors uppercase"
          >
            TÜMÜNÜ GÖR
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              canScrollLeft 
                ? 'bg-[#92D0AA] hover:bg-[#7ab594] text-white shadow-lg cursor-pointer opacity-100' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-0'
            }`}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Products List */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <Link 
                key={product.id} 
                href={`/product/${product.slug}`}
                className="flex-shrink-0 w-[calc(25%-18px)] min-w-[250px] group/card"
              >
                <div className="flex flex-col h-full">
                  {/* Product Image Box */}
                  <div 
                    className="aspect-[3/4] bg-[#e5e5e5] rounded-[20px] overflow-hidden mb-4 relative"
                    style={{ border: '1px solid #e5e5e5' }}
                  >
                    {product.image && product.image !== '/images/product-placeholder.png' ? (
                      <Image
                        src={encodeImagePath(product.image)}
                        alt={product.name}
                        fill
                        className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                         Product Image
                      </div>
                    )}

                    <button
                      type="button"
                      className="absolute inset-x-4 bottom-4 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 rounded-xl py-3 text-white font-bold uppercase text-sm"
                      style={{ backgroundColor: '#92D0AA' }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addToCart(product, 1)
                      }}
                    >
                      Sepete Ekle
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="text-center">
                    <h3 
                      className="text-xl font-bold mb-2 font-grift uppercase line-clamp-1"
                      style={{ color: '#92D0AA' }}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <>
                          <span className="text-gray-400 line-through">
                            ₺{product.originalPrice.toFixed(2)}
                          </span>
                          <span className="text-red-500 font-semibold">
                            / ₺{product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-600">
                          ₺{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              canScrollRight 
                ? 'bg-[#92D0AA] hover:bg-[#7ab594] text-white shadow-lg cursor-pointer opacity-100' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-0'
            }`}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    </section>
  )
}
