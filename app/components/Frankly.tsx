'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '../context/CartContext'

function encodeImagePath(path: string): string {
  if (!path) return ''
  return path.split('/').map(part => encodeURIComponent(part)).join('/')
}

export default function Frankly() {
  const { addToCart } = useCart()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/products/by-brand?brand=Frankly')
      .then(r => r.json())
      .then(d => { if (d.products) setProducts(d.products.slice(0, 12)) })
      .catch(() => {})
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
      
      // Calculate progress percentage
      const maxScroll = scrollWidth - clientWidth
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0
      setProgressPercentage(Math.min(100, Math.max(0, progress)))
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
      const cardWidth = scrollContainerRef.current.clientWidth / 2
      const scrollAmount = scrollContainerRef.current.scrollLeft - cardWidth
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, scrollAmount),
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth / 2
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
        <div className="mb-4 md:mb-8">
          <h2 className="text-lg md:text-3xl font-bold font-grift uppercase text-[#92D0AA]">
            FRANKLY
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Left Side - Featured Image - Mobil için küçültüldü */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="w-full h-[200px] md:h-[350px] lg:h-[500px] bg-[#d9d9d9] rounded-xl md:rounded-[20px] overflow-hidden relative border-2 border-[#92D0AA]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/main/frankly.jpg"
                alt="Frankly Featured"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Side - Carousel */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div className="flex items-center gap-2 md:gap-4 h-full">
              {/* Left Arrow - Mobilde gizle */}
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`hidden md:flex flex-shrink-0 w-10 md:w-12 h-10 md:h-12 rounded-full items-center justify-center transition-all ${
                  canScrollLeft 
                    ? 'bg-[#92D0AA] hover:bg-[#7ab594] text-white shadow-lg cursor-pointer' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-6 md:w-8 h-6 md:h-8" />
              </button>

              {/* Products Container - Mobil için optimize edildi */}
              <div 
                ref={scrollContainerRef}
                className="flex-1 flex gap-2 md:gap-4 lg:gap-6 overflow-x-auto scroll-smooth pb-2 md:pb-4 -mx-2 px-2 md:mx-0 md:px-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {products.map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/product/${product.slug}`}
                    className="flex-shrink-0 w-[130px] sm:w-[160px] md:w-[200px] lg:w-[220px] xl:w-[250px] group"
                  >
                    <div className="flex flex-col h-full">
                      {/* Product Image Box - Mobil için optimize edildi */}
                      <div className="aspect-[4/5] bg-[#d9d9d9] rounded-lg md:rounded-[20px] overflow-hidden mb-2 md:mb-4 relative border-2 border-[#92D0AA]">
                        {product.image && product.image !== '/images/product-placeholder.png' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={encodeImagePath(product.image)}
                            alt={product.name || ''}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                           <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs md:text-sm">
                              Product Image
                           </div>
                        )}

                        {/* Sepete Ekle butonu - Desktop hover, mobilde hidden */}
                        <button
                          type="button"
                          className="hidden md:block absolute inset-x-2 md:inset-x-4 bottom-2 md:bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg md:rounded-xl py-2 md:py-3 text-white font-bold uppercase text-xs md:text-sm bg-[#92D0AA]"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            addToCart(product, 1)
                          }}
                        >
                          Sepete Ekle
                        </button>
                      </div>

                      {/* Product Info - Mobil için kompakt */}
                      <div className="text-center">
                        <h3 className="text-xs md:text-base lg:text-xl font-bold mb-0.5 md:mb-1 font-grift uppercase text-[#92D0AA] line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm">
                          {product.originalPrice && product.originalPrice > product.price ? (
                            <>
                              <span className="text-gray-400 line-through">
                                ₺{Number(product.originalPrice).toFixed(2)}
                              </span>
                              <span className="text-red-500 font-semibold">
                                ₺{Number(product.price).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-600">
                              ₺{Number(product.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        {/* Mobil Sepete Ekle butonu */}
                        <button
                          type="button"
                          className="md:hidden mt-2 w-full rounded-md py-1.5 text-white font-bold text-[10px] bg-[#92D0AA]"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            addToCart(product, 1)
                          }}
                        >
                          Sepete Ekle
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right Arrow - Mobilde gizle */}
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`hidden md:flex flex-shrink-0 w-10 md:w-12 h-10 md:h-12 rounded-full items-center justify-center transition-all ${
                  canScrollRight 
                    ? 'bg-[#92D0AA] hover:bg-[#7ab594] text-white shadow-lg cursor-pointer' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-6 md:w-8 h-6 md:h-8" />
              </button>
            </div>

            {/* Progress Bar - Mobil için küçültüldü */}
            <div className="mt-4 md:mt-8 px-0 md:px-16">
              <div className="w-full h-2 md:h-3 rounded-full overflow-hidden bg-[#92D0AA]">
                <div 
                  className="h-full transition-all duration-300 bg-[#F1EB9C]"
                  style={{ 
                    width: `${Math.max(10, progressPercentage)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
