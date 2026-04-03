'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCardModern from '../../components/ProductCardModern'

export default function BrandPage({ params }: { params: { brand: string } }) {
  const brandSlug = params.brand
  const [headerHeight, setHeaderHeight] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(true)

  const [brandInfo, setBrandInfo] = useState<{ name: string; logo_url: string | null } | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

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

  useEffect(() => {
    const fetchBrand = async () => {
      setLoading(true)
      try {
        // Fetch brands list to find brand name by slug
        const brandsRes = await fetch('/api/brands')
        const brandsData = await brandsRes.json()
        const allBrands: any[] = brandsData.brands || []

        // Find brand by slug
        const found = allBrands.find((b: any) => b.slug === brandSlug)

        if (!found) {
          setNotFound(true)
          setLoading(false)
          return
        }

        setBrandInfo({ name: found.name, logo_url: found.logo_url })

        // Fetch products for this brand
        const productsRes = await fetch(`/api/products/search?brand=${encodeURIComponent(found.name)}&limit=200`)
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchBrand()
  }, [brandSlug])

  const availableCategories = Array.from(new Set(products.map((p: any) => p.category))).filter(Boolean).sort() as string[]
  const filteredProducts = selectedCategory ? products.filter((p: any) => p.category === selectedCategory) : products

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header />
        </div>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#92D0AA]" />
        </div>
      </main>
    )
  }

  if (notFound || !brandInfo) {
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

  const logoUrl = brandInfo.logo_url

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Hero */}
      <div className="w-full relative overflow-hidden" style={{ marginTop: `${headerHeight}px` }}>
        {/* Mobile Header */}
        <div className="md:hidden relative w-full bg-[#92D0AA]/10">
          <div className="flex items-center">
            <div className="px-4 py-3 flex-shrink-0">
              <div className="bg-white/90 rounded-xl p-2 shadow-sm backdrop-blur">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`${brandInfo.name} logo`}
                    className="h-8 w-24 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <span className="text-lg font-bold text-[#92D0AA] font-grift uppercase">{brandInfo.name}</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <img
                src="/mobilkategorislider.png"
                alt={brandInfo.name}
                className="w-full h-auto max-h-[150px] object-contain"
                style={{ maxWidth: '393px', marginLeft: 'auto' }}
              />
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block relative w-full h-[356px]">
          <Image src="/main/kategoriler/kategoriler.jpg" alt={brandInfo.name} fill className="object-cover" priority quality={100} />
          {logoUrl && (
            <div className="absolute left-10 top-10 z-10 rounded-2xl bg-white/85 p-4 shadow-lg backdrop-blur">
              <img
                src={logoUrl}
                alt={`${brandInfo.name} logo`}
                className="h-12 w-40 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mx-[175px] max-2xl:mx-24 max-xl:mx-12 max-lg:mx-6 max-md:mx-4">
        <section className="py-14">
          <h1 className="text-3xl font-bold font-grift uppercase mb-6" style={{ color: '#92D0AA' }}>
            {brandInfo.name}
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
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isFilterOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-3">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-[#92D0AA]/20 text-[#92D0AA] font-medium' : 'hover:bg-gray-50'}`}
                    >
                      Tümü ({products.length})
                    </button>
                    {availableCategories.map((c) => {
                      const count = products.filter((p: any) => p.category === c).length
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
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">Bu markada ürün bulunamadı.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((p: any) => (
                  <ProductCardModern key={p.id || p.slug} product={p} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
