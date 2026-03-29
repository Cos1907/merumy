'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCardModern from '../../components/ProductCardModern'
import type { Product } from '../../lib/products'

const PRODUCTS_PER_PAGE = 15

const VALID_SLUGS = ['cilt-bakimi', 'sac-bakimi', 'makyaj', 'kisisel-bakim', 'mask-bar', 'bebek-ve-cocuk-bakimi']

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
  const categoryDisplayName = getCategoryDisplayName(categorySlug)
  const searchParams = useSearchParams()

  const [headerHeight, setHeaderHeight] = useState(0)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const loaderRef = useRef<HTMLDivElement>(null)

  // Header yüksekliğini hesapla
  useEffect(() => {
    const calc = () => {
      const el = document.querySelector('.fixed.top-0.left-0.right-0.z-50')
      setHeaderHeight(el ? (el as HTMLElement).offsetHeight : window.innerWidth < 768 ? 90 : 140)
    }
    calc()
    const t1 = setTimeout(calc, 100)
    const t2 = setTimeout(calc, 500)
    window.addEventListener('resize', calc)
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', calc) }
  }, [])

  // URL'deki brand parametresini dinle
  useEffect(() => {
    setSelectedBrand(searchParams?.get('brand') || null)
    setDisplayedCount(PRODUCTS_PER_PAGE)
  }, [searchParams])

  // Ürünleri DB'den çek
  useEffect(() => {
    if (!VALID_SLUGS.includes(categorySlug)) return
    setIsFetching(true)
    fetch(`/api/products/by-category?category=${encodeURIComponent(categorySlug)}`)
      .then((r) => r.json())
      .then((data) => {
        setAllProducts(data.products || [])
        setBrands(data.brands || [])
      })
      .catch(() => {
        setAllProducts([])
        setBrands([])
      })
      .finally(() => setIsFetching(false))
  }, [categorySlug])

  // Marka filtresine göre ürünleri filtrele
  const filtered = selectedBrand
    ? allProducts.filter((p) => p.brand === selectedBrand)
    : allProducts

  const displayedProducts = filtered.slice(0, displayedCount)

  // Daha fazla yükle
  const loadMore = useCallback(() => {
    if (isLoading || displayedCount >= filtered.length) return
    setIsLoading(true)
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + PRODUCTS_PER_PAGE, filtered.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, displayedCount, filtered.length])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  // Filtre değişince sayacı sıfırla
  useEffect(() => {
    setDisplayedCount(PRODUCTS_PER_PAGE)
  }, [selectedBrand, categorySlug])

  // Geçersiz kategori
  if (!VALID_SLUGS.includes(categorySlug)) {
    return (
      <main className="min-h-screen bg-white">
        <div className="fixed top-0 left-0 right-0 z-50"><Header /></div>
        <div className="min-h-screen flex items-center justify-center" style={{ marginTop: `${headerHeight}px` }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Kategori Bulunamadı</h1>
            <Link href="/shop" className="text-[#92D0AA] hover:underline">Tüm ürünlere dön</Link>
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

      {/* Hero */}
      <div className="w-full relative overflow-hidden" style={{ marginTop: `${headerHeight}px` }}>
        {/* Mobil */}
        <div className="md:hidden relative w-full bg-[#92D0AA]/10">
          <div className="flex items-center">
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold font-grift uppercase text-[#92D0AA]">{categoryDisplayName}</h1>
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
        {/* Desktop */}
        <div className="hidden md:block">
          <div className="py-8 px-6 bg-gradient-to-r from-[#92D0AA]/20 to-[#92D0AA]/5">
            <h1 className="text-4xl font-bold font-grift uppercase text-[#92D0AA] text-center">{categoryDisplayName}</h1>
          </div>
        </div>
      </div>

      <div className="mx-4 sm:mx-6 lg:mx-12 xl:mx-24 2xl:mx-[175px]">
        <section className="py-6 md:py-14">
          <h1 className="hidden md:block text-3xl font-bold font-grift uppercase mb-10" style={{ color: '#92D0AA' }}>
            {categoryDisplayName}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-10">
            {/* Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-36 h-fit">
              <div className="rounded-2xl border border-[#92D0AA]/40 overflow-hidden bg-white">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full px-4 py-3 font-bold uppercase text-sm text-white flex items-center justify-between cursor-pointer"
                  style={{ backgroundColor: '#92D0AA' }}
                >
                  <span>MARKA</span>
                  {isFilterOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isFilterOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-3 max-h-[400px] overflow-auto">
                    <button
                      onClick={() => setSelectedBrand(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedBrand ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}
                    >
                      Tüm Markalar ({allProducts.length})
                    </button>
                    {brands.map((b) => {
                      const count = allProducts.filter((p) => p.brand === b).length
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

            {/* Ürün Grid */}
            <div>
              {isFetching ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92D0AA]"></div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    {filtered.length} ürün bulundu{selectedBrand && ` - ${selectedBrand}`}
                  </p>

                  {filtered.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-gray-500 text-lg">Bu kategoride ürün bulunamadı.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                      {displayedProducts.map((p) => (
                        <ProductCardModern key={p.id} product={p} />
                      ))}
                    </div>
                  )}

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
                    <p className="text-center text-gray-400 py-8">Tüm ürünler gösterildi</p>
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
