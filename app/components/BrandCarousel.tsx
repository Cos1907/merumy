'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { products } from '../lib/products'

interface Brand {
  name: string
  logo: string
  slug: string
  productCount: number
}

function slugifyBrand(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

// Marka isimlerini dosya isimlerine map et
function getBrandLogoPath(brandName: string): string {
  const brandMap: Record<string, string> = {
    'Bibimcos': 'bibimcos.webp',
    'Banobagi': 'banobagi.webp',
    'Anua': 'anua.webp',
    'Arencia': 'arencia.webp',
    'Roundlab': 'Roundlab.webp',
    'Round Lab': 'Roundlab.webp',
    'Pyunkang Yul': 'pyunkang-yul.webp',
    'Pkunkang Yul': 'pyunkang-yul.webp',
    'Medisure': 'Medisure.jpg',
    'Medicube': 'Medicube.png',
    'LEADERS': 'LEADERS.jpg',
    '2an': '2an.png',
    '2AN': '2an.png',
    'The Saem': 'The Seam.jpg',
    'The Seam': 'The Seam.jpg',
    'Lilybyred': 'Lilybyred.webp',
    'Jejudo': 'Jejudo.png',
    'IUNIK': 'IUNIK.webp',
    'Frankly': 'Frankly.webp',
    'Dr. Althea': 'Dr. Althea.webp',
    'Bouquet Garni': 'Bouquet Garni.jpg',
    'Cosrx': 'cosrx.webp',
    'Celimax': 'celimax.jpg',
    'Biodance': 'biodance.png',
    'Dalbam': 'dalbam.webp',
    'DalBam': 'dalbam.webp',
    'Mizon': 'mizon.png',
    'Merumy': 'merumy.svg',
    'Mjcare': 'mjcare.png',
    'MJCare': 'mjcare.png',
    'Tirtir': 'tirtir.webp',
    'Tırtır': 'tirtir.webp',
    'Nard': 'nard.png',
    'VT': 'vt-logo.webp',
    'Salt Train': 'salttrain.png',
    'Salttrain': 'salttrain.png',
    'Saltrain': 'salttrain.png',
  }

  // Normalize brand name
  const normalizedName = brandName.trim()
  
  // Direct match
  if (brandMap[normalizedName]) {
    const fileName = brandMap[normalizedName]
    return `/markalar/${encodeURIComponent(fileName)}`
  }

  // Try case-insensitive match
  const lowerName = normalizedName.toLowerCase()
  for (const [key, value] of Object.entries(brandMap)) {
    if (key.toLowerCase() === lowerName) {
      return `/markalar/${encodeURIComponent(value)}`
    }
  }

  // Try to find by filename pattern (remove spaces, special chars, compare)
  const filename = normalizedName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
  for (const [key, value] of Object.entries(brandMap)) {
    const valueName = value.replace(/\.[^.]+$/, '').toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    if (valueName === filename || valueName.includes(filename) || filename.includes(valueName)) {
      return `/markalar/${encodeURIComponent(value)}`
    }
  }

  // Fallback: try to construct filename from brand name
  const fallbackFileName = normalizedName.replace(/\s+/g, ' ') + '.webp'
  return `/markalar/${encodeURIComponent(fallbackFileName)}`
}

export default function BrandCarousel() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get unique brands from products
    const brandMap = new Map<string, number>()
    
    products.forEach(product => {
      if (product.brand && product.brand !== 'Merumy') {
        const count = brandMap.get(product.brand) || 0
        brandMap.set(product.brand, count + 1)
      }
    })

    // Convert to array and sort by product count
    const brandsList: Brand[] = Array.from(brandMap.entries())
      .map(([name, count]) => ({
        name,
        logo: getBrandLogoPath(name),
        slug: slugifyBrand(name),
        productCount: count,
      }))
      .filter(brand => brand.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 20) // Top 20 brands

    setBrands(brandsList)
  }, [])

  const scrollPositionRef = useRef(0)
  const isPausedRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const containerWidthRef = useRef(0)

  // Auto-scroll functionality - continuous smooth scrolling
  useEffect(() => {
    if (brands.length === 0) return

    const container = scrollContainerRef.current
    if (!container) return

    const itemWidth = 144 // w-28 (112px) + space-x-8 (32px) = 144px
    const singleSetWidth = brands.length * itemWidth
    let touchTimeout: ReturnType<typeof setTimeout> | null = null

    // Get container width
    const updateContainerWidth = () => {
      if (container.parentElement) {
        containerWidthRef.current = container.parentElement.clientWidth - 128 // Subtract padding (64px * 2)
      }
    }
    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)

    const animate = () => {
      if (!isPausedRef.current && container) {
        scrollPositionRef.current += 0.5 // Slower scroll speed for better UX
        
        // Calculate max scroll position (total content width - visible width)
        const totalContentWidth = singleSetWidth * 3 // 3 sets of brands
        const visibleWidth = containerWidthRef.current || container.clientWidth
        const maxScroll = Math.max(0, totalContentWidth - visibleWidth)
        
        // Reset when we've scrolled through all brands for seamless loop
        if (scrollPositionRef.current >= maxScroll) {
          scrollPositionRef.current = 0
        }

        // Direct scrollLeft assignment for smooth continuous scrolling
        container.scrollLeft = scrollPositionRef.current
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Pause on hover (desktop)
    const handleMouseEnter = () => {
      isPausedRef.current = true
    }

    const handleMouseLeave = () => {
      isPausedRef.current = false
    }

    // Pause on touch (mobile)
    const handleTouchStart = () => {
      isPausedRef.current = true
      // Clear any existing timeout
      if (touchTimeout) {
        clearTimeout(touchTimeout)
        touchTimeout = null
      }
    }

    const handleTouchMove = () => {
      // Keep paused while touching
      isPausedRef.current = true
    }

    const handleTouchEnd = () => {
      // Sync scroll position with current container scroll
      scrollPositionRef.current = container.scrollLeft
      
      // Resume auto-scroll after a delay
      touchTimeout = setTimeout(() => {
        isPausedRef.current = false
      }, 3000) // Wait 3 seconds after touch ends before resuming
    }

    // Handle manual scroll (for trackpad/wheel on desktop too)
    const handleScroll = () => {
      if (isPausedRef.current) {
        // Sync position when user scrolls manually
        scrollPositionRef.current = container.scrollLeft
      }
    }

    // Start animation
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    container.addEventListener('scroll', handleScroll, { passive: true })
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (touchTimeout) {
        clearTimeout(touchTimeout)
      }
      window.removeEventListener('resize', updateContainerWidth)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('scroll', handleScroll)
    }
  }, [brands.length])

  const handlePrevious = () => {
    const container = scrollContainerRef.current
    if (!container) return
    
    // Pause auto-scroll
    isPausedRef.current = true
    
    const itemWidth = 144
    const currentScroll = container.scrollLeft
    const visibleWidth = container.clientWidth
    const scrollAmount = visibleWidth * 0.8 // Scroll 80% of visible width
    
    const newScroll = Math.max(0, currentScroll - scrollAmount)
    
    // Update scroll position ref to match manual scroll
    scrollPositionRef.current = newScroll
    
    container.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    })
    
    // Resume auto-scroll after animation completes
    setTimeout(() => {
      isPausedRef.current = false
    }, 500)
  }

  const handleNext = () => {
    const container = scrollContainerRef.current
    if (!container) return
    
    // Pause auto-scroll
    isPausedRef.current = true
    
    const itemWidth = 144
    const currentScroll = container.scrollLeft
    const singleSetWidth = brands.length * itemWidth
    const totalWidth = singleSetWidth * 3
    const visibleWidth = container.clientWidth
    const maxScroll = Math.max(0, totalWidth - visibleWidth)
    const scrollAmount = visibleWidth * 0.8 // Scroll 80% of visible width
    
    const newScroll = Math.min(maxScroll, currentScroll + scrollAmount)
    
    // Update scroll position ref to match manual scroll
    scrollPositionRef.current = newScroll
    
    container.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    })
    
    // Resume auto-scroll after animation completes
    setTimeout(() => {
      isPausedRef.current = false
    }, 500)
  }

  if (brands.length === 0) {
    return null
  }

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* Previous Button - Hidden on mobile */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border-2 border-gray-200 shadow-lg items-center justify-center transition-all hover:bg-gray-50 hover:border-accent hidden md:flex"
            aria-label="Önceki markalar"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Next Button - Hidden on mobile */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border-2 border-gray-200 shadow-lg items-center justify-center transition-all hover:bg-gray-50 hover:border-accent hidden md:flex"
            aria-label="Sonraki markalar"
          >
            <ChevronRight size={24} />
          </button>

          {/* Scrolling container - full width with padding for buttons on desktop */}
          <div 
            className="overflow-hidden mx-auto w-full" 
            style={{ 
              paddingLeft: 'var(--brand-padding)', 
              paddingRight: 'var(--brand-padding)',
              // @ts-ignore
              '--brand-padding': '16px',
            }}
          >
            <style>{`
              @media (min-width: 768px) {
                .brand-carousel-container {
                  --brand-padding: 64px !important;
                }
              }
            `}</style>
            <div 
              ref={scrollContainerRef}
              className="flex space-x-4 md:space-x-8 py-4 md:py-8 brand-carousel-container"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Duplicate brands multiple times for seamless infinite scroll */}
              {[...brands, ...brands, ...brands].map((brand, index) => (
                <Link
                  key={`${brand.name}-${index}`}
                  href={`/marka/${brand.slug}`}
                  className="flex-shrink-0 group flex flex-col items-center w-[70px] md:w-28"
                >
                  <div className="w-[70px] h-[70px] md:w-28 md:h-28 rounded-full bg-white border-2 border-yellow-200 p-2 md:p-4 flex items-center justify-center hover:border-accent hover:shadow-xl transition-all duration-300 group-hover:scale-110 mb-1 md:mb-3">
                    <div className="relative w-full h-full">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/product-placeholder.png'
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] md:text-xs text-center text-green-500 group-hover:text-accent transition-colors line-clamp-1 font-medium">
                    {brand.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
