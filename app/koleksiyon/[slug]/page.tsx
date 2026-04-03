'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCardModern from '../../components/ProductCardModern'
import Link from 'next/link'

const PRODUCTS_PER_PAGE = 20

const collectionConfig: Record<string, { title: string; description: string; apiSection: string }> = {
  'kore-trendleri': {
    title: 'KORE TRENDLERİ',
    description: "Kore'nin en trend ve popüler güzellik ürünleri",
    apiSection: 'kore_trend',
  },
  'en-cok-satanlar': {
    title: 'EN ÇOK SATANLAR',
    description: 'Müşterilerimizin en çok tercih ettiği ürünler',
    apiSection: 'bestsellers',
  },
  'merumy-com-a-ozel': {
    title: "MERUMY.COM'A ÖZEL",
    description: "Sadece Merumy'de bulabileceğiniz özel ürünler",
    apiSection: 'merumy_exclusive',
  },
}

export default function CollectionPage() {
  const params = useParams()
  const slug = (params?.slug as string) || ''
  const config = collectionConfig[slug]
  const [products, setProducts] = useState<any[]>([])
  const [displayed, setDisplayed] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!config) { setLoading(false); return }
    setLoading(true)
    fetch('/api/kore-trends?section=' + config.apiSection + '&limit=200')
      .then(r => r.json())
      .then(d => {
        const prods = d.products || []
        setProducts(prods)
        setDisplayed(prods.slice(0, PRODUCTS_PER_PAGE))
        setPage(1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  const loadMore = useCallback(() => {
    const next = page + 1
    setDisplayed(products.slice(0, next * PRODUCTS_PER_PAGE))
    setPage(next)
  }, [page, products])

  if (!config) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Koleksiyon Bulunamadı</h1>
          <Link href="/shop" className="text-accent hover:underline">Alışverişe Devam Et</Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-grift uppercase" style={{ color: '#92D0AA' }}>
              {config.title}
            </h1>
            <p className="text-gray-500 mt-2 text-sm">{config.description}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Bu koleksiyonda henüz ürün yok.</p>
              <Link href="/shop" className="mt-4 inline-block text-accent hover:underline">Tüm Ürünlere Git</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {displayed.map(product => (
                  <ProductCardModern key={product.id} product={product} />
                ))}
              </div>
              {displayed.length < products.length && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={loadMore}
                    className="px-8 py-3 rounded-xl font-bold text-white transition-colors"
                    style={{ backgroundColor: '#92D0AA' }}
                    onMouseEnter={(e: any) => e.target.style.backgroundColor = '#7bb896'}
                    onMouseLeave={(e: any) => e.target.style.backgroundColor = '#92D0AA'}
                  >
                    Daha Fazla Yükle ({products.length - displayed.length} ürün daha)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
