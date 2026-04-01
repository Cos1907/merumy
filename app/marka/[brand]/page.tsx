'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCardModern from '../../components/ProductCardModern'
import type { Product } from '../../lib/products'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'

function slugifyBrand(input: string) {
  return input.toLowerCase().trim()
    .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ş/g, 's')
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

const BRAND_LOGO_MAP: Record<string, string> = {
  'Bibimcos': 'bibimcos.webp', 'Banobagi': 'banobagi.webp', 'Anua': 'anua.webp',
  'Arencia': 'arencia.webp', 'Round Lab': 'Roundlab.webp', 'Roundlab': 'Roundlab.webp',
  'Pyunkang Yul': 'pyunkang-yul.webp', 'Pkunkang Yul': 'pyunkang-yul.webp',
  'Medisure': 'Medisure.jpg', 'Medicube': 'Medicube.png', 'LEADERS': 'LEADERS.jpg',
  '2AN': '2an.png', '2an': '2an.png', 'The Saem': 'The Seam.jpg', 'The Seam': 'The Seam.jpg',
  'Lilybyred': 'Lilybyred.webp', 'Jejudo': 'Jejudo.png', 'IUNIK': 'IUNIK.webp',
  'Frankly': 'Frankly.webp', 'Dr. Althea': 'Dr. Althea.webp',
  'Bouquet Garni': 'Bouquet Garni.jpg', 'Cosrx': 'cosrx.webp', 'Celimax': 'celimax.jpg',
  'Biodance': 'biodance.png', 'DalBam': 'dalbam.webp', 'Dalbam': 'dalbam.webp',
  'Mizon': 'mizon.png', 'Mjcare': 'mjcare.png', 'MJCare': 'mjcare.png',
  'Tırtır': 'tirtir.webp', 'Tirtir': 'tirtir.webp', 'Nard': 'nard.png',
  'VT': 'vt-logo.webp', 'Salt Train': 'salttrain.png', 'Saltrain': 'salttrain.png',
}

function getBrandLogoPath(brandName: string): string | null {
  const filename = BRAND_LOGO_MAP[brandName]
  return filename ? `/markalar/${encodeURIComponent(filename)}` : null
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'popular'
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Son Eklenen' },
  { value: 'popular', label: 'Popüler' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
]

const PRODUCTS_PER_PAGE = 20

export default function BrandPage({ params }: { params: { brand: string } }) {
  const brandSlug = params.brand
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [brandName, setBrandName] = useState('')
  const [isFetching, setIsFetching] = useState(true)
  const [displayedCount, setDisplayedCount] = useState(PRODUCTS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(140)
  const [logoError, setLogoError] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const calc = () => {
      const el = document.querySelector('.fixed.top-0.left-0.right-0.z-50')
      setHeaderHeight(el ? (el as HTMLElement).offsetHeight : 140)
    }
    setTimeout(calc, 50)
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  // Find actual brand name from slug
  useEffect(() => {
    // Try to find brand by fetching all brands
    fetch('/api/search?limit=1')
      .then(r => r.json())
      .then(data => {
        const brands: any[] = data.brands || []
        const found = brands.find((b: any) => slugifyBrand(b.brand) === brandSlug)
        if (found) setBrandName(found.brand)
        else setBrandName(brandSlug.replace(/-/g, ' '))
      })
      .catch(() => setBrandName(brandSlug.replace(/-/g, ' ')))
  }, [brandSlug])

  // Fetch brand products
  useEffect(() => {
    if (!brandName) return
    setIsFetching(true)
    fetch(`/api/search?brand=${encodeURIComponent(brandName)}&limit=200`)
      .then(r => r.json())
      .then(data => setAllProducts(data.products || []))
      .catch(() => setAllProducts([]))
      .finally(() => setIsFetching(false))
  }, [brandName])

  const sorted = useMemo(() => {
    const inStock = allProducts.filter((p: any) => p.inStock !== false)
    const outStock = allProducts.filter((p: any) => p.inStock === false)
    const sortFn = (list: Product[]) => {
      const copy = [...list]
      switch (sortKey) {
        case 'price-asc': return copy.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
        case 'price-desc': return copy.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
        case 'popular': return copy.sort((a, b) => {
          const aDisc = a.originalPrice ? a.originalPrice - a.price : 0
          const bDisc = b.originalPrice ? b.originalPrice - b.price : 0
          return bDisc - aDisc
        })
        default: return copy
      }
    }
    return [...sortFn(inStock), ...sortFn(outStock)]
  }, [allProducts, sortKey])

  const displayedProducts = sorted.slice(0, displayedCount)

  const loadMore = useCallback(() => {
    if (isLoading || displayedCount >= sorted.length) return
    setIsLoading(true)
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + PRODUCTS_PER_PAGE, sorted.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, displayedCount, sorted.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setIsSortOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const logoPath = brandName ? getBrandLogoPath(brandName) : null
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortKey)?.label ?? 'Son Eklenen'

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50"><Header /></div>

      <div style={{ marginTop: `${headerHeight}px` }}>
        {/* Brand Header */}
        <div className="bg-gradient-to-r from-[#92D0AA]/20 to-[#92D0AA]/5 border-b border-[#92D0AA]/20">
          <div className="mx-4 sm:mx-6 lg:mx-12 xl:mx-24 2xl:mx-[175px] py-8 flex items-center gap-6">
            {logoPath && !logoError ? (
              <img src={logoPath} alt={brandName}
                className="h-20 max-w-[180px] object-contain rounded-lg bg-white p-2 shadow-sm"
                onError={() => setLogoError(true)} />
            ) : (
              <div className="h-20 w-44 flex items-center justify-center bg-[#92D0AA]/20 rounded-lg">
                <span className="text-xl font-bold uppercase" style={{ color: '#92D0AA' }}>{brandName}</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-grift uppercase" style={{ color: '#92D0AA' }}>
                {brandName}
              </h1>
              <p className="text-gray-500 mt-1">
                {isFetching ? 'Yükleniyor...' : `${sorted.length} ürün`}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-4 sm:mx-6 lg:mx-12 xl:mx-24 2xl:mx-[175px] py-8">
          {/* Sort bar */}
          <div className="flex justify-end mb-4" ref={sortRef}>
            <button onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-[#92D0AA] bg-white shadow-sm">
              <SlidersHorizontal className="w-4 h-4" />
              <span>{currentSortLabel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSortOpen && (
              <div className="absolute right-4 mt-10 bg-white rounded-xl border border-gray-100 shadow-lg z-30 min-w-[210px]">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setSortKey(opt.value); setIsSortOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortKey === opt.value ? 'bg-[#92D0AA]/15 text-[#92D0AA] font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isFetching ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92D0AA]"></div>
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Bu markada ürün bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6">
              {displayedProducts.map(p => (
                <ProductCardModern key={(p as any).id || (p as any).slug} product={p} />
              ))}
            </div>
          )}

          {!isFetching && displayedCount < sorted.length && (
            <div ref={loaderRef} className="flex justify-center py-8">
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#92D0AA]"></div>
              ) : (
                <button onClick={loadMore}
                  className="px-6 py-3 bg-[#92D0AA] text-white rounded-xl hover:bg-[#7bb896] transition-colors">
                  Daha Fazla Göster ({sorted.length - displayedCount} ürün kaldı)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
