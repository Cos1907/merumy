'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCardModern from '../components/ProductCardModern'

const PRODUCTS_PER_PAGE = 15

const CATEGORIES = [
  { slug: 'cilt-bakimi', name: 'Cilt Bakımı' },
  { slug: 'sac-bakimi', name: 'Saç Bakımı' },
  { slug: 'makyaj', name: 'Makyaj' },
  { slug: 'kisisel-bakim', name: 'Kişisel Bakım' },
  { slug: 'mask-bar', name: 'Mask Bar' },
  { slug: 'bebek-ve-cocuk-bakimi', name: 'Bebek ve Çocuk Bakımı' },
]

export default function ShopPage() {
  const [headerHeight, setHeaderHeight] = useState(0)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [fetchLoading, setFetchLoading] = useState(true)
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
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
    if (brand) setSelectedBrand(brand)
    if (category) setSelectedCategory(category)
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

  // Infinite scroll
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

  const clearAll = () => {
    setSelectedBrand(null)
    setSelectedCategory(null)
  }

  const brandList = useMemo(() => {
    // Use brands from API if available, otherwise derive from products
    if (brands.length > 0) return brands.map((b: any) => b.name).sort()
    return Array.from(new Set(products.map((p: any) => p.brand))).filter(Boolean).sort() as string[]
  }, [brands, products])

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
              <h1 className="text-xl font-bold font-grift uppercase text-[#92D0AA]">TÜM ÜRÜNLER</h1>
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
                    <button
                      key={c.slug}
                      onClick={() => setSelectedCategory(c.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === c.name ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}
                    >
                      {c.name}
                    </button>
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
