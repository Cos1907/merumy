'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { products } from '../lib/products'
import ProductCardModern from '../components/ProductCardModern'

const SORT_OPTIONS = [
  { value: 'featured', label: 'ÖNE ÇIKARILANLAR' },
  { value: 'price-asc', label: 'DÜŞÜKTEN YÜKSEĞE' },
  { value: 'price-desc', label: 'YÜKSEKTEN DÜŞÜĞE' },
  { value: 'discount-asc', label: 'İNDİRİM ORANI ARTAN' },
  { value: 'discount-desc', label: 'İNDİRİM ORANI AZALAN' },
  { value: 'oldest', label: 'İLK EKLENEN' },
  { value: 'newest', label: 'SON EKLENEN' },
  { value: 'bestseller', label: 'EN ÇOK SATANLAR' },
]

const PRODUCTS_PER_PAGE = 15

// Türkçe karakterleri normalize et (arama için)
const normalizeText = (text: string | null | undefined): string => {
  if (!text) return ''
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
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [tempSelectedBrands, setTempSelectedBrands] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [tempSelectedCategory, setTempSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [tempSearchQuery, setTempSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  // Live product data fetched from API (overrides bundled static JSON)
  const [liveProducts, setLiveProducts] = useState(products)
  const searchParams = useSearchParams()
  const loaderRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

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
    const q = searchParams?.get('q')
    if (brand) {
      setSelectedBrands([brand])
      setTempSelectedBrands([brand])
    }
    if (category) {
      setSelectedCategory(category)
      setTempSelectedCategory(category)
    }
    if (q) {
      setSearchQuery(q)
      setTempSearchQuery(q)
    }
  }, [searchParams])

  // Fetch live price/stock data from API and merge with static products
  // Only price/stock fields are overridden - category/brand/name stay from static JSON
  useEffect(() => {
    fetch('/api/products?limit=10000')
      .then(r => r.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          // Build slug → live price/stock overrides map
          const overrides = new Map<string, { price: number; originalPrice: number | null; inStock: boolean; stock: number }>()
          data.products.forEach((p: any) => {
            if (p.slug) {
              overrides.set(p.slug, {
                price: p.price,
                originalPrice: p.originalPrice ?? null,
                inStock: p.stockStatus ? p.stockStatus !== 'out_of_stock' : Boolean(p.inStock),
                stock: p.stock ?? 0
              })
            }
          })
          // Merge: keep all static fields, only override price/stock from API
          const updated = products.map(staticP => {
            const live = overrides.get(staticP.slug)
            if (!live) return staticP
            return { ...staticP, price: live.price, originalPrice: live.originalPrice ?? staticP.originalPrice, inStock: live.inStock, stock: live.stock }
          })
          setLiveProducts(updated)
        }
      })
      .catch(() => {/* fallback to static products */})
  }, [])

  const brandList = useMemo(() => 
    Array.from(new Set(liveProducts.map((p) => p.brand))).filter(Boolean).sort()
  , [liveProducts])

  const filtered = useMemo(() => {
    // Filter out products with no name (guard against null API data)
    let list = liveProducts.filter((p) => p && p.name)
    if (selectedBrands.length > 0) {
      list = list.filter((p) => p.brand && selectedBrands.includes(p.brand))
    }
    if (selectedCategory) {
      // Slug'dan gerçek kategori ismine dönüştür
      const realCategory = slugToRealCategory(selectedCategory)
      list = list.filter((p) => p.category === realCategory)
    }
    if (searchQuery.trim()) {
      const query = normalizeText(searchQuery.trim())
      list = list.filter((p) => 
        normalizeText(p.name).includes(query) || 
        normalizeText(p.brand).includes(query)
      )
    }
    return list
  }, [liveProducts, selectedBrands, selectedCategory, searchQuery])

  // Sıralanmış ürünler (stokta olmayanlar her zaman en altta)
  const sortedProducts = useMemo(() => {
    const inStock = filtered.filter(p => p.inStock)
    const outOfStock = filtered.filter(p => !p.inStock)

    const sortFn = (list: typeof filtered) => {
      switch (sortBy) {
        case 'price-asc':
          return [...list].sort((a, b) => a.price - b.price)
        case 'price-desc':
          return [...list].sort((a, b) => b.price - a.price)
        case 'discount-asc':
          return [...list].sort((a, b) => {
            const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0
            const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0
            return discountA - discountB
          })
        case 'discount-desc':
          return [...list].sort((a, b) => {
            const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0
            const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0
            return discountB - discountA
          })
        case 'oldest':
          return [...list].sort((a, b) => String(a.id).localeCompare(String(b.id)))
        case 'newest':
          return [...list].sort((a, b) => String(b.id).localeCompare(String(a.id)))
        case 'bestseller':
          return [...list].sort(() => Math.random() - 0.5)
        case 'featured':
        default:
          return list
      }
    }

    // In-stock first (sorted), then out-of-stock (sorted)
    return [...sortFn(inStock), ...sortFn(outOfStock)]
  }, [filtered, sortBy])

  // Click outside to close sort dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Multi-select marka toggle
  const toggleBrand = (brand: string) => {
    setTempSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  // Filtreyi uygula
  const applyFilters = () => {
    setSelectedBrands(tempSelectedBrands)
    setSelectedCategory(tempSelectedCategory)
    setSearchQuery(tempSearchQuery)
  }

  // Filtreleri temizle
  const clearAllFilters = () => {
    setSelectedBrands([])
    setTempSelectedBrands([])
    setSelectedCategory(null)
    setTempSelectedCategory(null)
    setSearchQuery('')
    setTempSearchQuery('')
  }

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
  }, [selectedBrands, selectedCategory, searchQuery])

  const displayedProducts = sortedProducts.slice(0, displayedCount)

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Hero Banner */}
      <div className="w-full relative overflow-hidden" style={{ marginTop: `${headerHeight}px` }}>
        {/* Mobil Header */}
        <div className="md:hidden relative w-full h-[120px]">
          <Image src="/main/kategoriler/kategoriler.jpg" alt="Tüm Ürünler" fill className="object-cover" priority quality={100} />
          {/* Title - sol ortada beyaz font */}
          <div className="absolute inset-0 flex items-center">
            <h1 className="text-2xl font-bold text-white font-grift uppercase pl-4 drop-shadow-lg">
              TÜM ÜRÜNLER
            </h1>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block relative w-full h-[300px]">
          <Image src="/main/kategoriler/kategoriler.jpg" alt="Tüm Ürünler" fill className="object-cover" priority quality={100} />
          {/* Title - sol ortada beyaz font */}
          <div className="absolute inset-0 flex items-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-white font-grift uppercase pl-10 lg:pl-20 drop-shadow-lg">
              TÜM ÜRÜNLER
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-4 sm:mx-6 lg:mx-12 xl:mx-24 2xl:mx-[175px]">
        <section className="py-6 md:py-10">

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-10">
            {/* Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-36 h-fit">
              {/* Brand Filter - Multi-select */}
              <div>
                <div className="rounded-full px-6 py-2 font-bold uppercase text-sm text-white mb-2" style={{ backgroundColor: '#92D0AA' }}>
                  MARKA
                </div>
                <div className="rounded-2xl border-2 border-[#92D0AA] bg-white max-h-[280px] overflow-auto">
                  {brandList.map((b, index) => (
                    <button
                      key={b}
                      onClick={() => toggleBrand(b)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        tempSelectedBrands.includes(b) ? 'text-[#92D0AA] font-medium bg-[#92D0AA]/10' : 'text-gray-600 hover:bg-gray-50'
                      } ${index !== brandList.length - 1 ? 'border-b border-[#92D0AA]/30' : ''}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <div className="rounded-full px-6 py-2 font-bold uppercase text-sm text-white mb-2" style={{ backgroundColor: '#92D0AA' }}>
                  KATEGORİ
                </div>
                <div className="rounded-2xl border-2 border-[#92D0AA] bg-white max-h-[280px] overflow-auto">
                  {CATEGORIES.map((c, index) => (
                    <button
                      key={c.slug}
                      onClick={() => setTempSelectedCategory(tempSelectedCategory === c.slug ? null : c.slug)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        tempSelectedCategory === c.slug ? 'text-[#92D0AA] font-medium bg-[#92D0AA]/10' : 'text-gray-600 hover:bg-gray-50'
                      } ${index !== CATEGORIES.length - 1 ? 'border-b border-[#92D0AA]/30' : ''}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Search */}
              <div>
                <div className="rounded-full px-6 py-2 font-bold uppercase text-sm text-white mb-2" style={{ backgroundColor: '#92D0AA' }}>
                  ÜRÜN
                </div>
                <div className="rounded-2xl border-2 border-[#92D0AA] bg-white p-3">
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={tempSearchQuery}
                    onChange={(e) => setTempSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="space-y-2 pt-2">
                <button 
                  onClick={applyFilters} 
                  className="w-full rounded-full bg-[#92D0AA] text-white px-4 py-3 text-sm font-bold uppercase hover:bg-[#7bb896] transition-colors"
                >
                  Filtreyi Uygula
                </button>
                {(selectedBrands.length > 0 || selectedCategory || searchQuery) && (
                  <button 
                    onClick={clearAllFilters} 
                    className="w-full rounded-full border-2 border-[#92D0AA] text-[#92D0AA] px-4 py-3 text-sm font-bold uppercase hover:bg-[#92D0AA]/10 transition-colors"
                  >
                    Filtreyi Temizle
                  </button>
                )}
              </div>
            </aside>

            {/* Product Grid */}
            <div>
              {/* Header with count and sort */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {sortedProducts.length} ürün bulundu
                </p>

                {/* Sort Dropdown */}
                <div ref={sortRef} className="relative">
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase text-[#1a2a4a] hover:text-[#92D0AA] transition-colors"
                  >
                    {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'ÖNE ÇIKARILANLAR'}
                    <ChevronDown className={`w-5 h-5 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border-2 border-[#92D0AA]/30 shadow-xl z-50 overflow-hidden">
                      {SORT_OPTIONS.map((option, index) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value)
                            setIsSortOpen(false)
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                            sortBy === option.value ? 'text-[#92D0AA] bg-[#92D0AA]/10' : 'text-[#1a2a4a] hover:bg-gray-50'
                          } ${index !== SORT_OPTIONS.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

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
