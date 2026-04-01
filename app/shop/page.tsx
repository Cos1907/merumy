'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCardModern from '../components/ProductCardModern'
import type { Product } from '../lib/products'
import { Search, X } from 'lucide-react'

const PRODUCTS_PER_PAGE = 20

const BRAND_LOGO_MAP: Record<string, string> = {
  'Bibimcos': 'bibimcos.webp', 'Banobagi': 'banobagi.webp', 'Anua': 'anua.webp',
  'Arencia': 'arencia.webp', 'Round Lab': 'Roundlab.webp', 'Roundlab': 'Roundlab.webp',
  'Pyunkang Yul': 'pyunkang-yul.webp', 'Medisure': 'Medisure.jpg',
  'Medicube': 'Medicube.png', 'LEADERS': 'LEADERS.jpg', '2AN': '2an.png', '2an': '2an.png',
  'The Saem': 'The Seam.jpg', 'The Seam': 'The Seam.jpg', 'Lilybyred': 'Lilybyred.webp',
  'Jejudo': 'Jejudo.png', 'IUNIK': 'IUNIK.webp', 'Frankly': 'Frankly.webp',
  'Dr. Althea': 'Dr. Althea.webp', 'Bouquet Garni': 'Bouquet Garni.jpg',
  'Cosrx': 'cosrx.webp', 'Celimax': 'celimax.jpg', 'Biodance': 'biodance.png',
  'DalBam': 'dalbam.webp', 'Dalbam': 'dalbam.webp', 'Mizon': 'mizon.png',
  'Mjcare': 'mjcare.png', 'MJCare': 'mjcare.png', 'Tırtır': 'tirtir.webp',
  'Tirtir': 'tirtir.webp', 'Nard': 'nard.png', 'VT': 'vt-logo.webp',
  'Salt Train': 'salttrain.png', 'Saltrain': 'salttrain.png',
}

function getBrandLogo(brand: string): string | null {
  const filename = BRAND_LOGO_MAP[brand]
  return filename ? `/markalar/${encodeURIComponent(filename)}` : null
}

function slugifyBrand(input: string) {
  return input.toLowerCase().trim()
    .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ş/g, 's')
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

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
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [brandList, setBrandList] = useState<Array<{ brand: string; count: number }>>([])
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const headerContainer = document.querySelector('.fixed.top-0.left-0.right-0.z-50')
      if (headerContainer) setHeaderHeight((headerContainer as HTMLElement).offsetHeight)
      else setHeaderHeight(window.innerWidth < 768 ? 90 : 140)
    }
    calculateHeaderHeight()
    const t1 = setTimeout(calculateHeaderHeight, 100)
    const t2 = setTimeout(calculateHeaderHeight, 500)
    window.addEventListener('resize', calculateHeaderHeight)
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', calculateHeaderHeight) }
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

  // Fetch from API
  useEffect(() => {
    setIsFetching(true)
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedBrand) params.set('brand', selectedBrand)
    params.set('limit', '200')
    fetch(`/api/search?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setAllProducts(data.products || [])
        if (data.brands?.length > 0) {
          setBrandList(data.brands.map((b: any) => ({ brand: b.brand, count: b.count })))
        }
      })
      .catch(() => setAllProducts([]))
      .finally(() => setIsFetching(false))
  }, [searchQuery, selectedBrand])

  const filtered = useMemo(() => {
    let list = allProducts
    if (selectedCategory) {
      list = list.filter((p: any) => {
        const catMap: Record<string, string> = {
          'cilt-bakimi': 'Cilt Bakımı', 'sac-bakimi': 'Saç Bakımı', 'makyaj': 'Makyaj',
          'kisisel-bakim': 'Kişisel Bakım', 'mask-bar': 'Mask Bar',
          'bebek-ve-cocuk-bakimi': 'Bebek ve Çocuk Bakımı'
        }
        return p.category === catMap[selectedCategory]
      })
    }
    return list
  }, [allProducts, selectedCategory])

  const loadMore = useCallback(() => {
    if (isLoading || displayedCount >= filtered.length) return
    setIsLoading(true)
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + PRODUCTS_PER_PAGE, filtered.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, displayedCount, filtered.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  useEffect(() => { setDisplayedCount(PRODUCTS_PER_PAGE) }, [selectedBrand, selectedCategory, searchQuery])

  const displayedProducts = filtered.slice(0, displayedCount)

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
              <img src="/mobilkategorislider.png" alt="Tüm Ürünler"
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
                <div className="px-4 py-2 font-bold uppercase text-sm text-white" style={{ backgroundColor: '#92D0AA' }}>MARKA</div>
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
              </div>

              {/* Category Filter */}
              <div className="rounded-2xl border border-[#92D0AA]/40 overflow-hidden bg-white">
                <div className="px-4 py-2 font-bold uppercase text-sm text-white" style={{ backgroundColor: '#92D0AA' }}>KATEGORİ</div>
                <div className="p-3">
                  <button onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}>
                    Tüm Kategoriler
                  </button>
                  {CATEGORIES.map(c => (
                    <button key={c.slug} onClick={() => setSelectedCategory(c.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === c.slug ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {(selectedBrand || selectedCategory || searchQuery) && (
                <button onClick={clearAll}
                  className="w-full rounded-xl border border-[#92D0AA] text-[#92D0AA] px-4 py-3 text-sm hover:bg-[#92D0AA]/10 transition-colors">
                  Filtreleri Temizle
                </button>
              )}
            </aside>

            {/* Product Grid */}
            <div>
              {searchQuery && (
                <div className="mb-4 p-3 bg-[#92D0AA]/10 rounded-xl text-sm">
                  <strong>"{searchQuery}"</strong> için {isFetching ? '...' : `${filtered.length} sonuç bulundu`}
                </div>
              )}
              {selectedBrand && (
                <div className="mb-4 flex items-center gap-3">
                  {getBrandLogo(selectedBrand) && (
                    <img src={getBrandLogo(selectedBrand)!} alt={selectedBrand}
                      className="h-10 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  )}
                  <span className="font-bold text-lg" style={{ color: '#92D0AA' }}>{selectedBrand}</span>
                  <span className="text-sm text-gray-500">- {isFetching ? '...' : `${filtered.length} ürün`}</span>
                </div>
              )}
              {!searchQuery && !selectedBrand && (
                <p className="text-sm text-gray-500 mb-4">{isFetching ? '...' : `${filtered.length} ürün bulundu`}</p>
              )}

              {isFetching ? (
                <div className="flex items-center justify-center py-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92D0AA]"></div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">Sonuç bulunamadı.</p>
                  <button onClick={clearAll} className="mt-4 text-[#92D0AA] underline text-sm">Temizle</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {displayedProducts.map(p => (
                    <ProductCardModern key={(p as any).id || (p as any).slug} product={p} />
                  ))}
                </div>
              )}

              {/* Loader */}
              {!isFetching && displayedCount < filtered.length && (
                <div ref={loaderRef} className="flex justify-center py-8">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#92D0AA]"></div>
                  ) : (
                    <button onClick={loadMore}
                      className="px-6 py-3 bg-[#92D0AA] text-white rounded-xl hover:bg-[#7bb896] transition-colors">
                      Daha Fazla Göster ({filtered.length - displayedCount} ürün kaldı)
                    </button>
                  )}
                </div>
              )}
              {!isFetching && displayedCount >= filtered.length && filtered.length > 0 && (
                <p className="text-center text-gray-400 py-8">Tüm ürünler gösterildi</p>
              )}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
