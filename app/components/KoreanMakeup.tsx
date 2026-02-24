'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMakeupProducts } from '../lib/products'
import ProductCardModern from './ProductCardModern'

export default function KoreanMakeup() {
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
      const cardWidth = scrollContainerRef.current.clientWidth / 4
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
    <section className="py-6 md:py-12 bg-white">
      <div className="container mx-auto px-2 md:px-4">
        {/* Header - Mobil için optimize edildi */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-3xl font-bold font-grift uppercase" style={{ color: '#92D0AA' }}>
            KOREAN MAKE UP
          </h2>
          <Link 
            href="/shop/makyaj"
            className="px-3 py-1.5 md:px-6 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-colors uppercase"
            style={{ 
              backgroundColor: '#92D0AA', 
              color: 'white' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7bb896'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#92D0AA'
            }}
          >
            TÜMÜNÜ GÖR
          </Link>
        </div>

        {/* Product Slider */}
        <div className="relative group">
          {/* Gradient Overlays - Sol ve Sağ fade efekti */}
          <div className="hidden md:block absolute left-0 top-0 bottom-4 w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="hidden md:block absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
          
          {/* Navigation Arrows - Mobil için gizle, desktop için göster */}
          <button
            onClick={scrollLeft}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full items-center justify-center transition-all bg-[#92D0AA] hover:bg-[#7ab594] text-white shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={scrollRight}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full items-center justify-center transition-all bg-[#92D0AA] hover:bg-[#7ab594] text-white shadow-lg cursor-pointer"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Product Cards Container - Tüm cihazlar için optimize edildi */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 md:gap-4 lg:gap-5 overflow-x-auto scroll-smooth pb-4 -mx-2 px-2 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className="flex-shrink-0 w-[130px] sm:w-[180px] md:w-[220px] lg:w-[260px] xl:w-[280px] 2xl:w-[300px]"
              >
                <ProductCardModern product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
