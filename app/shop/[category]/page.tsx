'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCardModern from '../../components/ProductCardModern'
import type { Product } from '../../lib/products'

const PRODUCTS_PER_PAGE = 16

const VALID_SLUGS = [
  'cilt-bakimi',
  'sac-bakimi',
  'makyaj',
  'kisisel-bakim',
  'mask-bar',
  'bebek-ve-cocuk-bakimi',
]

function getCategoryDisplayName(slug: string): string {
  const map: Record<string, string> = {
    'cilt-bakimi': 'Cilt Bakımı',
    'sac-bakimi': 'Saç Bakımı',
    'makyaj': 'Makyaj',
    'kisisel-bakim': 'Kişisel Bakım',
    'mask-bar': 'Mask Bar',
    'bebek-ve-cocuk-bakimi': 'Bebek ve Çocuk Bakımı',
  }
  return map[slug] || slug
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'newest' | 'popular'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Son Eklenen' },
  { value: 'popular', label: 'Popüler' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
]

function sortProducts(products: Product[], key: SortKey): Product[] {
  const inStock = products.filter((p) => (p as any).inStock !== false)
  const outStock = products.filter((p) => (p as any).inStock === false)

  const sortFn = (list: Product[]) => {
    const copy = [...list]
    switch (key) {
      case 'price-asc':
        return copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
      case 'price-desc':
        return copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
      case 'popular':
        return copy.sort((a, b) => {
          const aDisc = a.originalPrice ? a.originalPrice - a.price : 0
          const bDisc = b.originalPrice ? b.originalPrice - b.price : 0
          return bDisc - aDisc
        })
      case 'newest':
      case 'default':
      default:
        return copy
    }
  }

  return [...sortFn(inStock), ...sortFn(outStock)]
}

export default function CategoryShopPage({ params }: { params: { category: string } }) {
  const { category: categorySlug } = params
  const categoryDisplayName = getCategoryDisplayName(categorySlug)
  const searchParams = useSearchParams()

  const [headerHeight, setHeaderHeight] = useState(0)
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('default')

  // Çoklu marka seçimi: pendingBrands = checkbox'lardan seçilenler (henüz uygulanmamış)
  //                      selectedBrands = filtrele'ye basınca uygulananlar
  const [pendingBrands, setPendingBrands] = useState<Set<string>>(new Set())
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set())

  const loaderRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  // Header yüksekliği
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

  // URL brand parametresi
  useEffect(() => {
    const b = searchParams?.get('brand')
    if (b) {
      setPendingBrands(new Set([b]))
      setSelectedBrands(new Set([b]))
    }
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
      .catch(() => { setAllProducts([]); setBrands([]) })
      .finally(() => setIsFetching(false))
  }, [categorySlug])

  // Sort dropdown dışına tıklanınca kapat
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Filtrelenmiş + sıralanmış ürünler
  const filtered = useMemo(() => {
    let list = allProducts
    if (selectedBrands.size > 0) {
      list = list.filter((p) => selectedBrands.has((p as any).brand))
    }
    return sortProducts(list, sortKey)
  }, [allProducts, selectedBrands, sortKey])

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

  // Filtre / sort değişince sıfırla
  useEffect(() => { setDisplayedCount(PRODUCTS_PER_PAGE) }, [selectedBrands, sortKey, categorySlug])

  // Marka checkbox toggle
  const toggleBrand = (brand: string) => {
    setPendingBrands((prev) => {
      const next = new Set(prev)
      next.has(brand) ? next.delete(brand) : next.add(brand)
      return next
    })
  }

  // Filtrele
  const applyFilter = () => {
    setSelectedBrands(new Set(pendingBrands))
    setDisplayedCount(PRODUCTS_PER_PAGE)
  }

  // Temizle
  const clearFilter = () => {
    setPendingBrands(new Set())
    setSelectedBrands(new Set())
    setDisplayedCount(PRODUCTS_PER_PAGE)
  }

  const hasPending = pendingBrands.size > 0
  const hasActive = selectedBrands.size > 0
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)?.label ?? 'Son Eklenen'

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

      {/* ───── BANNER ───── */}
      <div className="w-full relative overflow-hidden" style={{ marginTop: `${headerHeight}px` }}>
        {/* Görsel (hem mobil hem desktop aynı) */}
        <div className="relative w-full">
          <img
            src="https://www.merumy.com/main/kategoriler/kategoriler.jpg"
            alt={categoryDisplayName}
            className="w-full object-cover"
            style={{ height: 'clamp(120px, 20vw, 280px)' }}
          />
          {/* Sol taraf kategori adı */}
          <div className="absolute inset-0 flex items-center">
            <div className="px-6 sm:px-10 md:px-16">
              <h1
                className="font-grift font-bold uppercase text-white drop-shadow-lg leading-tight"
                style={{ fontSize: 'clamp(1.4rem, 4vw, 3.2rem)', textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}
              >
                {categoryDisplayName}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ───── İÇERİK ───── */}
      <div className="mx-4 sm:mx-6 lg:mx-12 xl:mx-24 2xl:mx-[175px]">
        <section className="py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-10">

            {/* ── Sidebar ── */}
            <aside className="space-y-4 lg:sticky lg:top-36 h-fit">
              <div className="rounded-2xl border border-[#92D0AA]/40 overflow-hidden bg-white shadow-sm">
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
                    isFilterOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-3 max-h-[400px] overflow-auto space-y-1">
                    {brands.map((b) => {
                      const count = allProducts.filter((p) => (p as any).brand === b).length
                      const checked = pendingBrands.has(b)
                      return (
                        <label
                          key={b}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors select-none ${
                            checked ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleBrand(b)}
                            className="w-4 h-4 rounded accent-[#92D0AA] flex-shrink-0"
                          />
                          <span className="flex-1 truncate">{b}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">({count})</span>
                        </label>
                      )
                    })}
                  </div>

                  {/* Filtrele butonu */}
                  <div className="px-3 pb-3 pt-1 space-y-2">
                    <button
                      onClick={applyFilter}
                      disabled={!hasPending && !hasActive}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-40"
                      style={{ backgroundColor: '#92D0AA' }}
                    >
                      <SlidersHorizontal className="inline w-4 h-4 mr-1.5 -mt-0.5" />
                      Filtrele
                      {pendingBrands.size > 0 && ` (${pendingBrands.size})`}
                    </button>

                    {(hasPending || hasActive) && (
                      <button
                        onClick={clearFilter}
                        className="w-full py-2 rounded-xl text-sm border border-[#92D0AA] text-[#92D0AA] hover:bg-[#92D0AA]/10 transition-colors"
                      >
                        <X className="inline w-4 h-4 mr-1 -mt-0.5" />
                        Filtreyi Temizle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Ürün Alanı ── */}
            <div>
              {/* Üst bar: ürün sayısı + sıralama */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <p className="text-sm text-gray-500">
                  {isFetching ? '...' : `${filtered.length} ürün bulundu`}
                  {hasActive && (
                    <span className="ml-2 text-[#92D0AA] font-medium">
                      ({Array.from(selectedBrands).join(', ')})
                    </span>
                  )}
                </p>

                {/* Sıralama dropdown */}
                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-[#92D0AA] hover:text-[#92D0AA] transition-colors bg-white shadow-sm"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>{currentSortLabel}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-gray-100 shadow-lg z-30 min-w-[210px] overflow-hidden">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortKey(opt.value); setIsSortOpen(false) }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            sortKey === opt.value
                              ? 'bg-[#92D0AA]/15 text-[#92D0AA] font-medium'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isFetching ? (
                <div className="flex items-center justify-center py-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92D0AA]"></div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-gray-500 text-lg">Bu kategoride ürün bulunamadı.</p>
                  {hasActive && (
                    <button onClick={clearFilter} className="mt-4 text-[#92D0AA] underline text-sm">
                      Filtreleri temizle
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                  {displayedProducts.map((p) => (
                    <ProductCardModern key={p.id} product={p} />
                  ))}
                </div>
              )}

              {/* Load more */}
              {!isFetching && displayedCount < filtered.length && (
                <div ref={loaderRef} className="flex justify-center py-8">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#92D0AA]"></div>
                  ) : (
                    <button
                      onClick={loadMore}
                      className="px-6 py-3 bg-[#92D0AA] text-white rounded-xl hover:bg-[#7bb896] transition-colors text-sm font-medium"
                    >
                      Daha Fazla Göster ({filtered.length - displayedCount} ürün kaldı)
                    </button>
                  )}
                </div>
              )}

              {!isFetching && displayedCount >= filtered.length && filtered.length > 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">Tüm ürünler gösterildi</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
