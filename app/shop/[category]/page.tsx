'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCardModern from '../../components/ProductCardModern'
import { products, categories } from '../../lib/products'

const PRODUCTS_PER_PAGE = 15

function slugToCategory(slug: string): string | null {
  // URL slug'ından gerçek kategori ismine dönüştür
  const categoryMap: Record<string, string> = {
    'cilt-bakimi': 'Cilt Bakımı',
    'sac-bakimi': 'Saç Bakımı',
    'makyaj': 'Makyaj',
    'kisisel-bakim': 'Kişisel Bakım',
    'mask-bar': 'Mask Bar',
    'bebek-ve-cocuk-bakimi': 'Bebek ve Çocuk Bakımı',
  }
  return categoryMap[slug] || slug
}

function getCategoryDisplayName(slug: string): string {
  const displayMap: Record<string, string> = {
    'cilt-bakimi': 'Cilt Bakımı',
    'sac-bakimi': 'Saç Bakımı',
    'makyaj': 'Makyaj',
    'kisisel-bakim': 'Kişisel Bakım',
    'mask-bar': 'Mask Bar',
    'bebek-ve-cocuk-bakimi': 'Bebek ve Çocuk Bakımı',
  }
  return displayMap[slug] || slug
}

export default function CategoryShopPage({ params }: { params: { category: string } }) {
  const { category: categorySlug } = params
  const categoryKey = slugToCategory(categorySlug)
  const categoryDisplayName = getCategoryDisplayName(categorySlug)
  const searchParams = useSearchParams()
  const brandParam = searchParams?.get('brand') || null

  const [headerHeight, setHeaderHeight] = useState(0)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(brandParam)
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const headerContainer = document.querySelector('.fixed.top-0.left-0.right-0.z-50')
      if (headerContainer) {
        const height = (headerContainer as HTMLElement).offsetHeight
        setHeaderHeight(height)
      } else {
        // Mobil için varsayılan değer
        setHeaderHeight(window.innerWidth < 768 ? 90 : 140)
      }
      setIsMobile(window.innerWidth < 768)
    }
    // Hemen hesapla
    calculateHeaderHeight()
    // Kısa bir gecikme ile tekrar hesapla (font yüklenmesi vs için)
    const timer1 = setTimeout(calculateHeaderHeight, 100)
    const timer2 = setTimeout(calculateHeaderHeight, 500)
    window.addEventListener('resize', calculateHeaderHeight)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      window.removeEventListener('resize', calculateHeaderHeight)
    }
  }, [])

  useEffect(() => {
    const b = searchParams?.get('brand') || null
    if (b) setSelectedBrand(b)
  }, [searchParams])

  // Kategoriye göre ürünleri filtrele
  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === categoryKey)
  }, [categoryKey])

  // Markaya göre filtrele
  const filtered = useMemo(() => {
    let list = categoryProducts
    if (selectedBrand) {
      list = list.filter((p) => p.brand === selectedBrand)
    }
    return list
  }, [categoryProducts, selectedBrand])

  // Markaları al
  const brands = useMemo(() => {
    return Array.from(new Set(categoryProducts.map((p) => p.brand))).filter(Boolean).sort()
  }, [categoryProducts])

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (isLoading || displayedCount >= filtered.length) return
    setIsLoading(true)
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + PRODUCTS_PER_PAGE, filtered.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, displayedCount, filtered.length])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore])

  // Reset displayed count when filter changes
  useEffect(() => {
    setDisplayedCount(PRODUCTS_PER_PAGE)
  }, [selectedBrand, categoryKey])

  const displayedProducts = filtered.slice(0, displayedCount)

  if (categoryProducts.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header />
        </div>
        <div className="min-h-screen flex items-center justify-center" style={{ marginTop: `${headerHeight}px` }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Kategori Bulunamadı</h1>
            <Link href="/shop" className="text-[#92D0AA] hover:underline">
              Tüm ürünlere dön
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Hero - Mobil için 393x150 görsel, Desktop için gizle */}
      <div 
        className="w-full relative overflow-hidden" 
        style={{ marginTop: `${headerHeight}px` }}
      >
        {/* Mobil Header Görsel */}
        <div className="md:hidden relative w-full bg-[#92D0AA]/10">
          <div className="flex items-center">
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold font-grift uppercase text-[#92D0AA]">
                {categoryDisplayName}
              </h1>
            </div>
            <div className="flex-1">
              <img 
                src="/mobilkategorislider.png" 
                alt={categoryDisplayName}
                className="w-full h-auto max-h-[150px] object-contain"
                style={{ maxWidth: '393px', marginLeft: 'auto' }}
              />
            </div>
          </div>
        </div>

        {/* Desktop Header - Gizli */}
        <div className="hidden md:block">
          <div className="py-8 px-6 bg-gradient-to-r from-[#92D0AA]/20 to-[#92D0AA]/5">
            <h1 className="text-4xl font-bold font-grift uppercase text-[#92D0AA] text-center">
              {categoryDisplayName}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-4 sm:mx-6 lg:mx-12 xl:mx-24 2xl:mx-[175px]">
        <section className="py-6 md:py-14">
          {/* Desktop Başlık */}
          <h1 className="hidden md:block text-3xl font-bold font-grift uppercase mb-10" style={{ color: '#92D0AA' }}>
            {categoryDisplayName}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-10">
            {/* Sidebar - Sadece Marka Filtresi */}
            <aside className="space-y-4 lg:sticky lg:top-36 h-fit">
              {/* Brand Filter */}
              <div className="rounded-2xl border border-[#92D0AA]/40 overflow-hidden bg-white">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full px-4 py-3 font-bold uppercase text-sm text-white flex items-center justify-between cursor-pointer" 
                  style={{ backgroundColor: '#92D0AA' }}
                >
                  <span>MARKA</span>
                  {isFilterOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isFilterOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-3 max-h-[400px] overflow-auto">
                    <button
                      onClick={() => setSelectedBrand(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedBrand ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}
                    >
                      Tüm Markalar ({categoryProducts.length})
                    </button>
                    {brands.map((b) => {
                      const count = categoryProducts.filter(p => p.brand === b).length
                      return (
                        <button
                          key={b}
                          onClick={() => setSelectedBrand(b)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedBrand === b ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}
                        >
                          {b} ({count})
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {selectedBrand && (
                <button 
                  onClick={() => setSelectedBrand(null)} 
                  className="w-full rounded-xl border border-[#92D0AA] text-[#92D0AA] px-4 py-3 text-sm hover:bg-[#92D0AA]/10 transition-colors"
                >
                  Filtreyi Temizle
                </button>
              )}
            </aside>

            {/* Product Grid */}
            <div>
              <p className="text-sm text-gray-500 mb-4">
                {filtered.length} ürün bulundu
                {selectedBrand && ` - ${selectedBrand}`}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {displayedProducts.map((p) => (
                  <ProductCardModern key={p.id} product={p} />
                ))}
              </div>

              {/* Loader / Load More */}
              {displayedCount < filtered.length && (
                <div ref={loaderRef} className="flex justify-center py-8">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#92D0AA]"></div>
                  ) : (
                    <button
                      onClick={loadMore}
                      className="px-6 py-3 bg-[#92D0AA] text-white rounded-xl hover:bg-[#7bb896] transition-colors"
                    >
                      Daha Fazla Göster ({filtered.length - displayedCount} ürün kaldı)
                    </button>
                  )}
                </div>
              )}

              {displayedCount >= filtered.length && filtered.length > 0 && (
                <p className="text-center text-gray-400 py-8">
                  Tüm ürünler gösterildi
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
