'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCardModern from './ProductCardModern'

export default function KoreTrendleri() {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  
  useEffect(() => {
    fetch(`/api/kore-trends?section=kore_trend&limit=30&t=${Date.now()}`)
      .then(r => r.json())
      .then(data => { if (data.products?.length) setProducts(data.products) })
      .catch(() => {})
  }, [])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Sonsuz döngü için ürünleri 3 kez tekrarla
  const infiniteProducts = [...products, ...products, ...products]
  
  const updateScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    
    const scrollLeft = container.scrollLeft
    const scrollWidth = container.scrollWidth
    const clientWidth = container.clientWidth
    
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])
  
  // Sonsuz döngü için scroll pozisyonunu kontrol et
  const handleInfiniteScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    
    const scrollLeft = container.scrollLeft
    const scrollWidth = container.scrollWidth
    const clientWidth = container.clientWidth
    const oneThird = scrollWidth / 3
    
    // Başa yaklaştığında ortaya atla
    if (scrollLeft < 50) {
      container.scrollLeft = oneThird + scrollLeft
    }
    // Sona yaklaştığında ortaya atla
    else if (scrollLeft > scrollWidth - clientWidth - 50) {
      container.scrollLeft = oneThird + (scrollLeft - (scrollWidth - clientWidth))
    }
    
    updateScrollButtons()
  }, [updateScrollButtons])
  
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Başlangıçta ortadan başla (sonsuz döngü için)
    const oneThird = container.scrollWidth / 3
    container.scrollLeft = oneThird

    updateScrollButtons()
    container.addEventListener('scroll', handleInfiniteScroll)
    window.addEventListener('resize', updateScrollButtons)
    
    return () => {
      container.removeEventListener('scroll', handleInfiniteScroll)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [handleInfiniteScroll, updateScrollButtons, infiniteProducts.length])
  
  // Otomatik kaydırma
  useEffect(() => {
    if (!isAutoScrolling) return
    
    autoScrollRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const cardWidth = scrollContainerRef.current.clientWidth / 4
        scrollContainerRef.current.scrollBy({
          left: cardWidth,
          behavior: 'smooth'
        })
      }
    }, 4000)
    
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }
    }
  }, [isAutoScrolling])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      setIsAutoScrolling(false) // Manuel kaydırmada otomatik kaydırmayı durdur
      const cardWidth = scrollContainerRef.current.clientWidth / 4
      scrollContainerRef.current.scrollBy({
        left: -cardWidth,
        behavior: 'smooth'
      })
      // 10 saniye sonra otomatik kaydırmayı tekrar başlat
      setTimeout(() => setIsAutoScrolling(true), 10000)
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      setIsAutoScrolling(false) // Manuel kaydırmada otomatik kaydırmayı durdur
      const cardWidth = scrollContainerRef.current.clientWidth / 4
      scrollContainerRef.current.scrollBy({
        left: cardWidth,
        behavior: 'smooth'
      })
      // 10 saniye sonra otomatik kaydırmayı tekrar başlat
      setTimeout(() => setIsAutoScrolling(true), 10000)
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

          {/* Product Cards Container - Sonsuz döngü ile */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 md:gap-4 lg:gap-5 overflow-x-auto scroll-smooth pb-4 -mx-2 px-2 md:mx-0 md:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            onMouseEnter={() => setIsAutoScrolling(false)}
            onMouseLeave={() => setIsAutoScrolling(true)}
          >
            {infiniteProducts.map((product, index) => (
              <div 
                key={`${product.id}-${index}`} 
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
