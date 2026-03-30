'use client'

import { useState, useEffect, useRef } from 'react'
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
    'Pkunkang Yul': 'Pkunkang Yul.webp',
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

export default function MaskBar() {
  const [brands, setBrands] = useState<Brand[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollPositionRef = useRef(0)
  const isPausedRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const containerWidthRef = useRef(0)

  useEffect(() => {
    // Get unique brands from products that are Masks
    const brandMap = new Map<string, number>()
    
    products.forEach(product => {
      // Filter for Mask related products
      const isMask = 
        (product.category && product.category.toLowerCase().includes('mask')) ||
        (product.subcategory && product.subcategory.toLowerCase().includes('mask')) ||
        (product.name && product.name.toLowerCase().includes('mask'))

      if (isMask && product.brand && product.brand !== 'Merumy') {
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

    setBrands(brandsList)
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    if (brands.length === 0) return

    const container = scrollContainerRef.current
    if (!container) return

    const itemWidth = 144 // w-28 (112px) + space-x-8 (32px) = 144px
    const singleSetWidth = brands.length * itemWidth

    // Get container width
    const updateContainerWidth = () => {
      if (container.parentElement) {
        containerWidthRef.current = container.parentElement.clientWidth - 128 // Subtract padding
      }
    }
    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)

    const animate = () => {
      if (!isPausedRef.current && container) {
        scrollPositionRef.current += 1 // Scroll speed
        
        const totalContentWidth = singleSetWidth * 3
        const visibleWidth = containerWidthRef.current || container.clientWidth
        const maxScroll = Math.max(0, totalContentWidth - visibleWidth)
        
        if (scrollPositionRef.current >= maxScroll) {
          scrollPositionRef.current = 0
        }

        container.scrollLeft = scrollPositionRef.current
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    const handleMouseEnter = () => { isPausedRef.current = true }
    const handleMouseLeave = () => { isPausedRef.current = false }

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', updateContainerWidth)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [brands.length])

  const handlePrevious = () => {
    const container = scrollContainerRef.current
    if (!container) return
    
    isPausedRef.current = true
    const visibleWidth = container.clientWidth
    const scrollAmount = visibleWidth * 0.8
    const newScroll = Math.max(0, container.scrollLeft - scrollAmount)
    
    scrollPositionRef.current = newScroll
    container.scrollTo({ left: newScroll, behavior: 'smooth' })
    
    setTimeout(() => { isPausedRef.current = false }, 500)
  }

  const handleNext = () => {
    const container = scrollContainerRef.current
    if (!container) return
    
    isPausedRef.current = true
    const visibleWidth = container.clientWidth
    const scrollAmount = visibleWidth * 0.8
    const newScroll = container.scrollLeft + scrollAmount
    
    scrollPositionRef.current = newScroll
    container.scrollTo({ left: newScroll, behavior: 'smooth' })
    
    setTimeout(() => { isPausedRef.current = false }, 500)
  }

  if (brands.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 
            className="text-3xl font-bold font-grift uppercase"
            style={{ color: '#92D0AA' }}
          >
            MASK BAR
          </h2>
        </div>

        <div className="relative">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#92D0AA] text-white shadow-lg flex items-center justify-center transition-all hover:bg-[#7ab594]"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#92D0AA] text-white shadow-lg flex items-center justify-center transition-all hover:bg-[#7ab594]"
          >
            <ChevronRight size={24} />
          </button>

          {/* Scrolling container */}
          <div className="overflow-hidden mx-auto px-12">
            <div 
              ref={scrollContainerRef}
              className="flex space-x-8 py-4"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                overflowX: 'auto',
              }}
            >
              {[...brands, ...brands, ...brands].map((brand, index) => (
                <Link
                  key={`${brand.name}-${index}`}
                  href={`/marka/${brand.slug}?q=mask`}
                  className="flex-shrink-0 group flex flex-col items-center w-32"
                >
                  <div 
                    className="w-32 h-32 rounded-full p-1 flex items-center justify-center transition-all duration-300 group-hover:scale-105 mb-3 bg-white"
                    style={{ border: '3px solid #F1EB9C' }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gray-50">
                        <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-full h-full object-contain p-2"
                            loading="lazy"
                            onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/images/product-placeholder.png'
                            }}
                        />
                    </div>
                  </div>
                  <p 
                    className="text-sm text-center font-bold uppercase transition-colors line-clamp-1"
                    style={{ color: '#92D0AA' }}
                  >
                    {brand.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

