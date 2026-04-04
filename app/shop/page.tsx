'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCardModern from '../components/ProductCardModern'
import type { Product } from '../lib/products'
import { Search, X, ChevronDown } from 'lucide-react'

const PRODUCTS_PER_PAGE = 20

const CATEGORIES = [
  { slug: 'cilt-bakimi', name: 'Cilt Bakımı' },
  { slug: 'sac-bakimi', name: 'Saç Bakımı' },
  { slug: 'makyaj', name: 'Makyaj' },
  { slug: 'kisisel-bakim', name: 'Kişisel Bakım' },
  { slug: 'mask-bar', name: 'Mask Bar' },
  { slug: 'bebek-ve-cocuk-bakimi', name: 'Bebek ve Çocuk Bakımı' },
]

export default function ShopPage() {
  const [headerHeight, setHeaderHeight] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024 ? 80 : 64)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [brandOpen, setBrandOpen] = useState(true)
  const [categoryOpen, setCategoryOpen] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [fetchLoading, setFetchLoading] = useState(true)
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const headerContainer = document.querySelector('.fixed.top-0.left-0.right-0.z-50')
      if (headerContainer) {
        setHeaderHeight((headerContainer as HTMLElement).offsetHeight)
      } else {
        setHeaderHeight(window.innerWidth < 768 ? 90 : 140)
      }
    }
    calculateHeaderHeight()
    const t1 = setTimeout(calculateHeaderHeight, 100)
    const t2 = setTimeout(calculateHeaderHeight, 500)
    window.addEventListener('resize', calculateHeaderHeight)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('resize', calculateHeaderHeight)
    }
  }, [])

  // Sync from URL params
  useEffect(() => {
    const brand = searchParams?.get('brand')
    const category = searchParams?.get('category')
    const q = searchParams?.get('q')
    if (brand) setSelectedBrand(brand)
    if (category) setSelectedCategory(category)
    if (q) { setSearchQuery(q); setSearchInput(q) }
  }, [searchParams])

  // Fetch from DB
  useEffect(() => {
    const fetchProducts = async () => {
      setFetchLoading(true)
      try {
        const params = new URLSearchParams({ limit: '200' })
        if (selectedBrand) params.set('brand', selectedBrand)
        if (selectedCategory) params.set('category', selectedCategory)
        const q = searchParams?.get('q')
        if (q) params.set('q', q)

        const res = await fetch(`/api/products/search?${params.toString()}`)
        const data = await res.json()
        setProducts(data.products || [])
        if (data.brands) setBrands(data.brands)
      } catch {
        setProducts([])
      } finally {
        setFetchLoading(false)
      }
    }
    fetchProducts()
    setDisplayedCount(PRODUCTS_PER_PAGE)
  }, [selectedBrand, selectedCategory, searchParams])

  const loadMore = useCallback(() => {
    if (isLoading || displayedCount >= products.length) return
    setIsLoading(true)
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + PRODUCTS_PER_PAGE, products.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, displayedCount, products.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  const displayedProducts = products.slice(0, displayedCount)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchInput.trim()
    setSearchQuery(q)
    setSelectedBrand(null)
    if (q) router.push(`/shop?q=${encodeURIComponent(q)}`, { scroll: false })
  }

  const clearAll = () => {
    setSelectedBrand(null)
    setSelectedCategory(null)
    setSearchQuery('')
    setSearchInput('')
    router.push('/shop', { scroll: false })
  }

  // Helper: get logo URL for a brand name
  const getBrandLogo = (brandName: string): string | null => {
    const found = brands.find((b: any) => (b.name || b.brand) === brandName)
    return found?.logo_url || null
  }

  const brandList = useMemo((): Array<{ brand: string; count: number }> => {
    if (brands.length > 0) {
      return brands
        .map((b: any) => ({ brand: b.name || b.brand || String(b), count: b.count || 0 }))
        .sort((a: { brand: string }, b: { brand: string }) => a.brand.localeCompare(b.brand))
    }
    return Array.from(new Set(products.map((p: any) => p.brand))).filter(Boolean).sort().map(br => ({ brand: br as string, count: 0 }))
  }, [brands, products])

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50"><Header /></div>

      {/* Hero */}
      <div className="w-full relative overflow-hidden" style={{ marginTop: `${headerHeight}px` }}>
        <div className="md:hidden relative w-full bg-[#92D0AA]/10">
          <div className="flex items-center">
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold font-grift uppercase text-[#92D0AA]">TÜM ÜRÜNLER</h1>
            </div>
            <div className="flex-1">
              <img
                src="/mobilkategorislider.png"
                alt="Tüm Ürünler"
                className="w-full h-auto max-h-[150px] object-contain"
                style={{ maxWidth: '393px', marginLeft: 'auto' }} />
            </div>
          </div>
        </div>
        <div className="hidden md:block relative w-full h-[356px]">
          <Image src="/main/kategoriler/tumurunler.png" alt="Tüm Ürünler"
            fill className="object-cover" priority quality={100} />
        </div>
      </div>

      <div className="mx-4 sm:mx-6 lg:mx-12 xl:mx-24 2xl:mx-[175px]">
        <section className="py-6 md:py-14">
          <h1 className="hidden md:block text-3xl font-bold font-grift uppercase mb-6" style={{ color: '#92D0AA' }}>
            TÜM ÜRÜNLER
          </h1>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-2xl">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Ürün, marka, açıklama ara..."
                className="w-full pl-10 pr-4 py-3 border border-[#92D0AA]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30 text-sm"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setSearchQuery(''); router.push('/shop', { scroll: false }) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit"
              className="px-6 py-3 text-white rounded-xl font-semibold text-sm"
              style={{ backgroundColor: '#92D0AA' }}>Ara</button>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 lg:gap-10">
            {/* Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-36 h-fit">
              {/* Brand Filter with logos */}
              <div className="rounded-2xl border border-[#92D0AA]/40 overflow-hidden bg-white">
                <button
                  onClick={() => setBrandOpen(!brandOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 font-bold uppercase text-sm text-white"
                  style={{ backgroundColor: '#92D0AA' }}>
                  <span>MARKA</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${brandOpen ? 'rotate-180' : ''}`} />
                </button>
                {brandOpen && (
                  <div className="p-3 max-h-[360px] overflow-auto">
                    <button onClick={() => { setSelectedBrand(null); router.push(searchQuery ? `/shop?q=${encodeURIComponent(searchQuery)}` : '/shop', { scroll: false }) }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedBrand ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}>
                      Tüm Markalar
                    </button>
                    {brandList.map(({ brand: b, count }) => {
                      const logo = getBrandLogo(b)
                      return (
                        <button key={b} onClick={() => { setSelectedBrand(b); setSelectedCategory(null) }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedBrand === b ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}>
                          {logo ? (
                            <img src={logo} alt={b} className="w-8 h-6 object-contain flex-shrink-0"
                              onError={(e) => { e.currentTarget.style.display = 'none' }} />
                          ) : (
                            <div className="w-8 h-6 flex-shrink-0" />
                          )}
                          <span className="flex-1 truncate">{b}</span>
                          <span className="text-xs text-gray-400">({count})</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="rounded-2xl border border-[#92D0AA]/40 overflow-hidden bg-white">
                <button
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 font-bold uppercase text-sm text-white"
                  style={{ backgroundColor: '#92D0AA' }}>
                  <span>KATEGORİ</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`} />
                </button>
                {categoryOpen && (
                  <div className="p-3">
                    <button onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}>
                      Tüm Kategoriler
                    </button>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => setSelectedCategory(c.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === c.name ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
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
              {fetchLoading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#92D0AA]" />
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">{products.length} ürün bulundu</p>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                    {displayedProducts.map((p) => (
                      <ProductCardModern key={p.id || p.slug} product={p} />
                    ))}
                  </div>

                  {displayedCount < products.length && (
                    <div ref={loaderRef} className="flex justify-center py-8">
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#92D0AA]" />
                      ) : (
                        <button
                          onClick={loadMore}
                          className="px-6 py-3 bg-[#92D0AA] text-white rounded-xl hover:bg-[#7bb896] transition-colors"
                        >
                          Daha Fazla Göster ({products.length - displayedCount} ürün kaldı)
                        </button>
                      )}
                    </div>
                  )}

                  {displayedCount >= products.length && products.length > 0 && (
                    <p className="text-center text-gray-400 py-8">Tüm ürünler gösterildi</p>
                  )}

                  {products.length === 0 && !fetchLoading && (
                    <div className="text-center py-16 text-gray-400">
                      <p className="text-lg">Ürün bulunamadı</p>
                      {(selectedBrand || selectedCategory) && (
                        <button onClick={clearAll} className="mt-4 text-[#92D0AA] hover:underline">
                          Filtreleri temizle
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
