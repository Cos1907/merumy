'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCardModern from '../../components/ProductCardModern'
import { products } from '../../lib/products'

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

  const normalizedName = brandName.trim()
  if (brandMap[normalizedName]) return `/markalar/${encodeURIComponent(brandMap[normalizedName])}`

  const lowerName = normalizedName.toLowerCase()
  for (const [key, value] of Object.entries(brandMap)) {
    if (key.toLowerCase() === lowerName) return `/markalar/${encodeURIComponent(value)}`
  }

  const filename = normalizedName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
  for (const [_, value] of Object.entries(brandMap)) {
    const valueName = value.replace(/\.[^.]+$/, '').toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    if (valueName === filename || valueName.includes(filename) || filename.includes(valueName)) {
      return `/markalar/${encodeURIComponent(value)}`
    }
  }

  return `/markalar/${encodeURIComponent(normalizedName + '.webp')}`
}

export default function BrandPage({ params }: { params: { brand: string } }) {
  const brandSlug = params.brand
  const [headerHeight, setHeaderHeight] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(true)

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

  const uniqueBrands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [])
  const brandName = useMemo(() => uniqueBrands.find((b) => slugifyBrand(b) === brandSlug) || null, [uniqueBrands, brandSlug])

  const brandProducts = useMemo(() => {
    if (!brandName) return []
    return products.filter((p) => p.brand === brandName)
  }, [brandName])

  const availableCategories = useMemo(() => {
    return Array.from(new Set(brandProducts.map((p) => p.category))).sort()
  }, [brandProducts])

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return brandProducts
    return brandProducts.filter((p) => p.category === selectedCategory)
  }, [brandProducts, selectedCategory])

  if (!brandName) {
    return (
      <main className="min-h-screen bg-white">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header />
        </div>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Marka bulunamadı</h1>
            <Link href="/" className="text-[#92D0AA] hover:underline">
              Anasayfaya dön
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const logoPath = getBrandLogoPath(brandName)

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Hero */}
      <div 
        className="w-full relative overflow-hidden" 
        style={{ marginTop: `${headerHeight}px` }}
      >
        {/* Mobil Header */}
        <div className="md:hidden relative w-full bg-[#92D0AA]/10">
          <div className="flex items-center">
            <div className="px-4 py-3 flex-shrink-0">
              <div className="bg-white/90 rounded-xl p-2 shadow-sm backdrop-blur">
                <img
                  src={logoPath}
                  alt={`${brandName} logo`}
                  className="h-8 w-24 object-contain"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement
                    t.style.display = 'none'
                    const parent = t.parentElement
                    if (parent) {
                      parent.innerHTML = `<span class="text-lg font-bold text-[#92D0AA] font-grift uppercase">${brandName}</span>`
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
              <img 
                src="/mobilkategorislider.png" 
                alt={brandName}
                className="w-full h-auto max-h-[150px] object-contain"
                style={{ maxWidth: '393px', marginLeft: 'auto' }}
              />
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block relative w-full h-[356px]">
          <Image src="/main/kategoriler/kategoriler.jpg" alt={brandName} fill className="object-cover" priority quality={100} />
          {/* Brand logo overlay */}
          <div className="absolute left-10 top-10 z-10 rounded-2xl bg-white/85 p-4 shadow-lg backdrop-blur">
            <div className="relative h-12 w-40">
              <img
                src={logoPath}
                alt={`${brandName} logo`}
                className="h-full w-full object-contain"
                onError={(e) => {
                  const t = e.target as HTMLImageElement
                  t.style.display = 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-[175px] max-2xl:mx-24 max-xl:mx-12 max-lg:mx-6 max-md:mx-4">
        <section className="py-14">
          <h1 className="text-3xl font-bold font-grift uppercase mb-6" style={{ color: '#92D0AA' }}>
            {brandName}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
            {/* Category Sidebar */}
            <aside className="lg:sticky lg:top-36 h-fit">
              <div className="rounded-2xl border border-[#92D0AA]/40 overflow-hidden bg-white">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full px-4 py-3 font-bold uppercase text-sm text-white flex items-center justify-between cursor-pointer" 
                  style={{ backgroundColor: '#92D0AA' }}
                >
                  <span>KATEGORİ</span>
                  {isFilterOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isFilterOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-3">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}
                    >
                      Tümü ({brandProducts.length})
                    </button>
                    {availableCategories.map((c) => {
                      const count = brandProducts.filter((p) => p.category === c).length
                      return (
                        <button
                          key={c}
                          onClick={() => setSelectedCategory(c)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === c ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}
                        >
                          {c} ({count})
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((p) => (
                <ProductCardModern key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}



