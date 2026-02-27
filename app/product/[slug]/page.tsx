'use client'

import { useEffect, useMemo, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { ChevronLeft, ChevronRight, Minus, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { getProductBySlug, getProductsByCategory, products, type Product } from '../../lib/products'
import { useCart } from '../../context/CartContext'

function encodeImagePath(pathStr: string): string {
  if (!pathStr) return ''
  return pathStr
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
}

// Binlik ayırıcı ile fiyat formatla (1200 → 1.200)
function formatPrice(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function slugifyCategory(input: string) {
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
    'Pyunkang Yul': 'pyunkang-yul.webp',
    'Medisure': 'Medisure.jpg',
    'Medicube': 'Medicube.png',
    'LEADERS': 'LEADERS.jpg',
    '2an': '2an.png',
    '2AN': '2an.png',
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

  return `/markalar/${encodeURIComponent(normalizedName + '.webp')}`
}

// Tamamlayıcı ürün bölümü geçici olarak devre dışı

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const staticProduct = getProductBySlug(slug)
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [headerHeight, setHeaderHeight] = useState(140)
  const [selectedImage, setSelectedImage] = useState(0)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [showFullDescription, setShowFullDescription] = useState(false)
  // Live product data from API (overrides ONLY price/stock — category/brand/name stay from static JSON)
  const [liveProductData, setLiveProductData] = useState<any>(null)

  // Merge static + live: keep all static fields, only update price/stock/originalPrice from API
  const product = (() => {
    if (liveProductData && staticProduct) {
      const liveOriginal = liveProductData.originalPrice != null ? Number(liveProductData.originalPrice) : null
      return {
        ...staticProduct,
        price: Number(liveProductData.price ?? staticProduct.price),
        originalPrice: (liveOriginal && liveOriginal > 0) ? liveOriginal : staticProduct.originalPrice ?? null,
        inStock: liveProductData.stockStatus
          ? liveProductData.stockStatus !== 'out_of_stock'
          : staticProduct.inStock,
        stock: liveProductData.stock ?? staticProduct.stock,
      }
    }
    if (liveProductData && !staticProduct) {
      // Product exists in DB but not in JSON (newly added via admin panel)
      const liveOriginal = liveProductData.originalPrice != null ? Number(liveProductData.originalPrice) : null
      return {
        id: String(liveProductData.id),
        slug: liveProductData.slug,
        name: liveProductData.name || '',
        description: liveProductData.description || '',
        price: Number(liveProductData.price),
        originalPrice: (liveOriginal && liveOriginal > 0) ? liveOriginal : null,
        inStock: liveProductData.stockStatus ? liveProductData.stockStatus !== 'out_of_stock' : true,
        stock: liveProductData.stock ?? 0,
        brand: liveProductData.brand || '',
        category: liveProductData.category || '',
        barcode: liveProductData.barcode || '',
        image: liveProductData.image || '',
        images: liveProductData.images || [],
        rating: 4.5,
        reviews: 50,
        sold: 100,
      }
    }
    return staticProduct
  })()

  // If live data is still loading, show loading state (don't 404 yet)
  if (!product && !liveProductData) {
    // Will either render once liveProductData loads, or notFound when confirmed missing
    return null
  }

  if (!product) {
    notFound()
  }

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

  // Fetch live product data from API for real-time price/stock updates
  useEffect(() => {
    if (!slug) return
    fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        if (data.product) setLiveProductData(data.product)
      })
      .catch(() => {/* fallback to static data */})
  }, [slug])

  useEffect(() => {
    if (!product?.slug) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/product/images?slug=${encodeURIComponent(product.slug)}`)
        const data = await res.json().catch(() => ({}))
        const imgs = Array.isArray(data?.images) ? data.images : []
        const fallback = product.image ? [product.image] : []
        const next = (imgs.length ? imgs : fallback).filter(Boolean)
        if (!cancelled) {
          setGalleryImages(next)
          setSelectedImage(0)
        }
      } catch {
        if (!cancelled) setGalleryImages(product.image ? [product.image] : [])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [product?.image, product?.slug])

  const relatedProducts = useMemo(() => {
    if (!product?.category) return []
    return getProductsByCategory(product.category)
      .filter((p) => p.id !== product.id && p.inStock)
      .slice(0, 4)
  }, [product?.category, product?.id])

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div style={{ marginTop: `${headerHeight}px` }}>
        <div className="mx-[175px] max-2xl:mx-24 max-xl:mx-12 max-lg:mx-6 max-md:mx-4">
          {/* Top layout */}
          <section className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left: Big image slider */}
              <div className="relative rounded-[30px] md:rounded-[40px] border-2 border-[#92D0AA] bg-gray-100 overflow-hidden">
                <div className="relative w-full aspect-[4/5]">
                  <img
                    src={encodeImagePath(galleryImages[selectedImage] || product.image)}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/images/product-placeholder.png'
                    }}
                  />
                  
                  {/* İndirim etiketi - sol üst */}
                  {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                    <div className="absolute left-4 top-4 z-10">
                      <span className="bg-[#92D0AA] text-white text-lg md:text-xl font-bold px-6 py-3 rounded-2xl shadow-lg">
                        %{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)} İNDİRİM
                      </span>
                    </div>
                  )}
                  
                  {/* Stok Yok etiketi - görsel üzerinde */}
                  {product.inStock === false && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/30"></div>
                      <div className="relative bg-red-600/90 text-white font-bold text-2xl md:text-3xl py-4 px-8 transform -rotate-12 shadow-lg">
                        STOK YOK
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage((prev) => {
                        const len = galleryImages.length || 1
                        return (prev - 1 + len) % len
                      })
                    }
                    className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: '#92D0AA' }}
                    aria-label="Önceki görsel"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage((prev) => {
                        const len = galleryImages.length || 1
                        return (prev + 1) % len
                      })
                    }
                    className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: '#92D0AA' }}
                    aria-label="Sonraki görsel"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                {/* Dots */}
                <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3">
                  {(galleryImages.length ? galleryImages : [product.image]).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full"
                      style={{ backgroundColor: idx === selectedImage ? '#92D0AA' : 'rgba(146, 208, 170, 0.35)' }}
                      aria-label={`Görsel ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Product info */}
              <div>
                {/* Kategori */}
                <div className="text-sm md:text-base uppercase tracking-wide font-medium" style={{ color: '#F1EB9C' }}>
                  {product.category}
                </div>
                
                {/* Marka Logosu */}
                <div className="mt-3">
                  <img
                    src={getBrandLogoPath(product.brand)}
                    alt={`${product.brand} logo`}
                    className="h-10 md:h-14 w-auto object-contain"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      t.style.display = 'none'
                      const parent = t.parentElement
                      if (parent) {
                        parent.innerHTML = `<span class="text-lg md:text-xl font-bold text-gray-800 uppercase">${product.brand}</span>`
                      }
                    }}
                  />
                </div>

                <h1
                  className={`mt-4 font-grift font-bold uppercase leading-snug ${
                    product.name.length > 80 
                      ? 'text-sm md:text-base lg:text-lg' 
                      : product.name.length > 60 
                        ? 'text-base md:text-lg lg:text-xl' 
                        : product.name.length > 40 
                          ? 'text-lg md:text-xl lg:text-2xl' 
                          : 'text-xl md:text-2xl lg:text-3xl'
                  }`}
                  style={{ color: '#92D0AA' }}
                  title={product.name}
                >
                  {product.name}
                </h1>

                {/* Açıklama - Devamını Gör */}
                <div className="mt-4">
                  <p className={`text-sm md:text-base text-gray-700 leading-relaxed ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                    {product.description || 'Ürün açıklaması'}
                  </p>
                  {product.description && product.description.length > 150 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-2 flex items-center gap-1 text-sm font-medium text-[#92D0AA] hover:underline"
                    >
                      {showFullDescription ? (
                        <>Daha Az Göster <ChevronUp size={16} /></>
                      ) : (
                        <>Devamını Gör <ChevronDown size={16} /></>
                      )}
                    </button>
                  )}
                </div>

                {/* Pricing - Büyük fiyatlar */}
                <div className="mt-6 md:mt-8">
                  {product.originalPrice && Number(product.originalPrice) > Number(product.price) ? (
                    <div>
                      <div className="flex items-baseline gap-4 flex-wrap">
                        <span className="text-4xl md:text-5xl font-extrabold" style={{ color: '#92D0AA' }}>
                          ₺{Number(product.price).toLocaleString('tr-TR')}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xl md:text-2xl text-gray-400 line-through">
                            ₺{Number(product.originalPrice).toLocaleString('tr-TR')}
                          </span>
                          <span className="text-sm font-bold text-[#92D0AA]">
                            %{Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)} İndirim
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl md:text-5xl font-extrabold" style={{ color: '#92D0AA' }}>
                        ₺{Number(product.price).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stok durumu ve sepete ekleme */}
                {product.inStock === false ? (
                  <div className="mt-6">
                    <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                      <span className="text-red-600 font-bold text-xl">STOK YOK</span>
                      <p className="text-red-500 text-sm mt-1">Bu ürün şu anda stokta bulunmamaktadır.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Qty */}
                    <div className="mt-6 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: '#92D0AA' }}
                        aria-label="Azalt"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="text-sm font-bold text-gray-800">{quantity}</div>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: '#92D0AA' }}
                        aria-label="Arttır"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Main CTA */}
                    <button
                      type="button"
                      onClick={() => addToCart(product, quantity)}
                      className="mt-6 w-full rounded-[12px] py-4 text-white font-bold uppercase"
                      style={{ backgroundColor: '#92D0AA' }}
                    >
                      SEPETE EKLE
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Related products */}
          <section className="py-10">
            <h2 className="font-grift font-bold uppercase text-3xl lg:text-4xl mb-8" style={{ color: '#92D0AA' }}>
              İLGİLİ ÜRÜNLER
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <div key={p.id} className="group">
                  <Link href={`/product/${p.slug}`} className="block">
                    <div className="rounded-[18px] border-2 border-[#92D0AA] overflow-hidden bg-white">
                      <div className="relative aspect-[4/5] bg-gray-100">
                        <img
                          src={encodeImagePath(p.image)}
                          alt={p.name}
                          className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = '/images/product-placeholder.png'
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <div className="font-grift font-bold uppercase text-sm md:text-base line-clamp-1" style={{ color: '#92D0AA' }}>
                        {p.name}
                      </div>
                      <div className="mt-2 text-lg md:text-xl font-extrabold" style={{ color: '#92D0AA' }}>
                        ₺{formatPrice(p.price)}
                      </div>
                    </div>
                  </Link>
                  {/* Butonlar */}
                  <div className="mt-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        addToCart(p, 1)
                      }}
                      className="flex-1 rounded-md py-1.5 text-white font-semibold text-[10px] md:text-xs bg-[#92D0AA] hover:bg-[#7bb896] transition-colors"
                    >
                      Sepete Ekle
                    </button>
                    <Link
                      href={`/product/${p.slug}`}
                      className="flex-1 rounded-md py-1.5 text-[#92D0AA] font-semibold text-[10px] md:text-xs border border-[#92D0AA] hover:bg-[#92D0AA]/10 transition-colors text-center"
                    >
                      Hemen Al
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
