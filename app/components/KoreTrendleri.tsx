'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import ProductCardModern from './ProductCardModern'

export default function KoreTrendleri() {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  
  useEffect(() => {
    fetch('/api/kore-trends?section=kore_trend&limit=12')
      .then(r => r.json())
      .then(d => { if (d.products) setProducts(d.products) })
      .catch(() => {})
  }, [])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateScrollButtons = () => {
      setCanScrollLeft(container.scrollLeft > 10)
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)
    }

    updateScrollButtons()
    container.addEventListener('scroll', updateScrollButtons)
    window.addEventListener('resize', updateScrollButtons)
    
    return () => {
      container.removeEventListener('scroll', updateScrollButtons)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [products])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth / 4
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, scrollContainerRef.current.scrollLeft - cardWidth),
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth / 4
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth
      scrollContainerRef.current.scrollTo({
        left: Math.min(maxScroll, scrollContainerRef.current.scrollLeft + cardWidth),
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="py-6 md:py-12 bg-white">
      <div className="container mx-auto px-2 md:px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-3xl font-bold font-grift uppercase" style={{ color: '#92D0AA' }}>
            KORE TRENDLERİ
          </h2>
          <Link 
            href="/koleksiyon/kore-trendleri"
            className="px-3 py-1.5 md:px-6 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-colors uppercase"
            style={{ backgroundColor: '#92D0AA', color: 'white' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#7bb896' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#92D0AA' }}
          >
            TÜMÜNÜ GÖR
          </Link>
        </div>

        {/* Product Slider with blur edges */}
        <div className="relative">
          {/* Left blur overlay + arrow */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-4 w-16 md:w-24 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)' }}
            >
              <button
                onClick={scrollLeft}
                className="pointer-events-auto absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-[#92D0AA] hover:bg-[#7ab594] text-white shadow-lg transition-all"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>
          )}

          {/* Right blur overlay + arrow */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-4 w-16 md:w-24 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)' }}
            >
              <button
                onClick={scrollRight}
                className="pointer-events-auto absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-[#92D0AA] hover:bg-[#7ab594] text-white shadow-lg transition-all"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>
          )}

          {/* Product Cards Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 md:gap-4 lg:gap-5 overflow-x-auto scroll-smooth pb-4 -mx-2 px-2 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
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
