'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getKoreTrendProducts, getRandomProducts } from '../lib/products'
import ProductCardModern from './ProductCardModern'

export default function KoreTrendleri() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  // Kore Trendleri ürünlerini rastgele getir - her render'da farklı ürünler
  const [products, setProducts] = useState(() => getKoreTrendProducts(12))
  
  // Sayfa yenilendiğinde farklı ürünler göster
  useEffect(() => {
    setProducts(getKoreTrendProducts(12))
  }, [])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
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
            KORE TRENDLERİ
          </h2>
          <Link 
            href="/koleksiyon/kore-trendleri"
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
          {/* Navigation Arrows - Mobil için gizle, desktop için göster */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full items-center justify-center transition-all ${
              canScrollLeft 
                ? 'bg-[#92D0AA] hover:bg-[#7ab594] text-white shadow-lg cursor-pointer opacity-100' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-0'
            }`}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full items-center justify-center transition-all ${
              canScrollRight 
                ? 'bg-[#92D0AA] hover:bg-[#7ab594] text-white shadow-lg cursor-pointer opacity-100' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-0'
            }`}
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
