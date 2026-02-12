'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { notFound } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductCardModern from '../../components/ProductCardModern'
import { getProductsByCollection, type Product } from '../../lib/products'

const PRODUCTS_PER_PAGE = 15

const collectionData: Record<string, { title: string; description: string }> = {
  'kore-trendleri': {
    title: 'KORE TRENDLERİ',
    description: 'Kore\'nin en trend ve popüler güzellik ürünleri'
  },
  'en-cok-satanlar': {
    title: 'EN ÇOK SATANLAR',
    description: 'Müşterilerimizin en çok tercih ettiği ürünler'
  },
  'merumy-com-a-ozel': {
    title: 'MERUMY.COM\'A ÖZEL',
    description: 'Sadece Merumy\'de bulabileceğiniz özel ürünler'
  }
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const collection = collectionData[slug]
  
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(140)
  
  // Koleksiyon türüne göre ürünleri al
  const allCollectionProducts = useMemo(() => {
    return getProductsByCollection(slug)
  }, [slug])

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const headerContainer = document.querySelector('.fixed.top-0.left-0.right-0.z-50')
      if (headerContainer) setHeaderHeight((headerContainer as HTMLElement).clientHeight)
      else setHeaderHeight(140)
    }
    setTimeout(calculateHeaderHeight, 50)
    window.addEventListener('resize', calculateHeaderHeight)
    return () => window.removeEventListener('resize', calculateHeaderHeight)
  }, [])

  // İlk yüklemede ürünleri göster
  useEffect(() => {
    const initialProducts = allCollectionProducts.slice(0, PRODUCTS_PER_PAGE)
    setDisplayedProducts(initialProducts)
    setHasMore(allCollectionProducts.length > PRODUCTS_PER_PAGE)
  }, [allCollectionProducts])

  // Daha fazla ürün yükle
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return
    
    setLoading(true)
    const nextPage = page + 1
    const startIndex = page * PRODUCTS_PER_PAGE
    const endIndex = startIndex + PRODUCTS_PER_PAGE
    const newProducts = allCollectionProducts.slice(startIndex, endIndex)
    
    setTimeout(() => {
      setDisplayedProducts(prev => [...prev, ...newProducts])
      setPage(nextPage)
      setHasMore(endIndex < allCollectionProducts.length)
      setLoading(false)
    }, 300)
  }, [page, loading, hasMore, allCollectionProducts])

  // Scroll event listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      ) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore])

  if (!collection) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div style={{ marginTop: `${headerHeight}px` }}>
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#92D0AA] to-[#7BC496] py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold font-grift text-white uppercase mb-4">
              {collection.title}
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              {collection.description}
            </p>
            <p className="text-white/70 mt-4">
              {allCollectionProducts.length} ürün
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          {displayedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {displayedProducts.map((product) => (
                  <ProductCardModern key={product.id} product={product} />
                ))}
              </div>

              {/* Load More / Loading State */}
              {hasMore && (
                <div className="mt-8 text-center">
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 bg-[#92D0AA] rounded-full animate-bounce"></div>
                      <div className="w-4 h-4 bg-[#92D0AA] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-4 h-4 bg-[#92D0AA] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  ) : (
                    <button
                      onClick={loadMore}
                      className="px-8 py-3 bg-[#92D0AA] hover:bg-[#7BC496] text-white font-bold rounded-lg transition-colors"
                    >
                      DAHA FAZLA GÖSTER
                    </button>
                  )}
                </div>
              )}

              {/* Showing count */}
              <div className="mt-6 text-center text-gray-500">
                {displayedProducts.length} / {allCollectionProducts.length} ürün gösteriliyor
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Bu koleksiyonda henüz ürün bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}

