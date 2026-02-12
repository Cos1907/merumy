'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { products } from '../lib/products'
import ProductCardModern from '../components/ProductCardModern'

const PRODUCTS_PER_PAGE = 15

// Türkçe karakterleri normalize et (arama için)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
}

const CATEGORIES = [
  { slug: 'cilt-bakimi', name: 'Cilt Bakımı', realName: 'Cilt Bakımı' },
  { slug: 'sac-bakimi', name: 'Saç Bakımı', realName: 'Saç Bakımı' },
  { slug: 'makyaj', name: 'Makyaj', realName: 'Makyaj' },
  { slug: 'kisisel-bakim', name: 'Kişisel Bakım', realName: 'Kişisel Bakım' },
  { slug: 'mask-bar', name: 'Mask Bar', realName: 'Mask Bar' },
  { slug: 'bebek-ve-cocuk-bakimi', name: 'Bebek ve Çocuk Bakımı', realName: 'Bebek ve Çocuk Bakımı' },
]

// URL slug'ından gerçek kategori ismine dönüştür
function slugToRealCategory(slug: string): string {
  const cat = CATEGORIES.find(c => c.slug === slug)
  return cat ? cat.realName : slug
}

export default function ShopPage() {
  const [headerHeight, setHeaderHeight] = useState(0)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
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

  // Sync from URL params
  useEffect(() => {
    const brand = searchParams?.get('brand')
    const category = searchParams?.get('category')
    if (brand) setSelectedBrand(brand)
    if (category) setSelectedCategory(category)
  }, [searchParams])

  const brandList = useMemo(() => 
    Array.from(new Set(products.map((p) => p.brand))).filter(Boolean).sort()
  , [])

  const filtered = useMemo(() => {
    let list = [...products]
    if (selectedBrand) list = list.filter((p) => p.brand === selectedBrand)
    if (selectedCategory) {
      // Slug'dan gerçek kategori ismine dönüştür
      const realCategory = slugToRealCategory(selectedCategory)
      list = list.filter((p) => p.category === realCategory)
    }
    return list
  }, [selectedBrand, selectedCategory])

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (isLoading || displayedCount >= filtered.length) return
    setIsLoading(true)
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + PRODUCTS_PER_PAGE, filtered.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, displayedCount, filtered.length])

  // Intersection Observer
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
  }, [selectedBrand, selectedCategory])

  const displayedProducts = filtered.slice(0, displayedCount)

  const clearAll = () => {
    setSelectedBrand(null)
    setSelectedCategory(null)
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Hero */}
      <div className="w-full relative overflow-hidden" style={{ marginTop: `${headerHeight}px` }}>
        <div className="md:hidden relative w-full bg-[#92D0AA]/10">
          <div className="flex items-center">
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold font-grift uppercase text-[#92D0AA]">
                TÜM ÜRÜNLER
              </h1>
            </div>
            <div className="flex-1">
              <img 
                src="/mobilkategorislider.png" 
                alt="Tüm Ürünler"
                className="w-full h-auto max-h-[150px] object-contain"
                style={{ maxWidth: '393px', marginLeft: 'auto' }}
              />
            </div>
          </div>
        </div>
        <div className="hidden md:block relative w-full h-[356px]">
          <Image
            src="/main/kategoriler/tumurunler.png"
            alt="Tüm Ürünler"
            fill
            className="object-cover"
            priority
            quality={100}
          />
        </div>
      </div>

      <div className="mx-4 sm:mx-6 lg:mx-12 xl:mx-24 2xl:mx-[175px]">
        <section className="py-6 md:py-14">
          <h1 className="hidden md:block text-3xl font-bold font-grift uppercase mb-10" style={{ color: '#92D0AA' }}>
            TÜM ÜRÜNLER
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-10">
            {/* Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-36 h-fit">
              {/* Brand Filter */}
              <div className="rounded-2xl border border-[#92D0AA]/40 overflow-hidden bg-white">
                <div className="px-4 py-2 font-bold uppercase text-sm text-white" style={{ backgroundColor: '#92D0AA' }}>
                  MARKA
                </div>
                <div className="p-3 max-h-[300px] overflow-auto">
                  <button
                    onClick={() => setSelectedBrand(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedBrand ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}
                  >
                    Tüm Markalar
                  </button>
                  {brandList.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedBrand === b ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="rounded-2xl border border-[#92D0AA]/40 overflow-hidden bg-white">
                <div className="px-4 py-2 font-bold uppercase text-sm text-white" style={{ backgroundColor: '#92D0AA' }}>
                  KATEGORİ
                </div>
                <div className="p-3 max-h-[300px] overflow-auto">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}
                  >
                    Tüm Kategoriler
                  </button>
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/shop/${c.slug}`}
                      className="block px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              {(selectedBrand || selectedCategory) && (
                <button 
                  onClick={clearAll} 
                  className="w-full rounded-xl border border-[#92D0AA] text-[#92D0AA] px-4 py-3 text-sm hover:bg-[#92D0AA]/10 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              )}
            </aside>

            {/* Product Grid */}
            <div>
              <p className="text-sm text-gray-500 mb-4">
                {filtered.length} ürün bulundu
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {displayedProducts.map((p) => (
                  <ProductCardModern key={p.id} product={p} />
                ))}
              </div>

              {/* Loader */}
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
