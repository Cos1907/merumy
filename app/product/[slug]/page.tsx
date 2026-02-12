'use client'

import { useEffect, useMemo, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { getProductBySlug, getProductsByCategory, products, type Product } from '../../lib/products'
import { useCart } from '../../context/CartContext'

function encodeImagePath(pathStr: string): string {
  if (!pathStr) return ''
  return pathStr
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
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

// Tamamlayıcı ürün bölümü geçici olarak devre dışı

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const product = getProductBySlug(slug)
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [headerHeight, setHeaderHeight] = useState(140)
  const [selectedImage, setSelectedImage] = useState(0)
  const [galleryImages, setGalleryImages] = useState<string[]>([])

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

  useEffect(() => {
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
  }, [product.image, product.slug])

  const relatedProducts = useMemo(() => {
    return getProductsByCategory(product.category)
      .filter((p) => p.id !== product.id && p.inStock)
      .slice(0, 4)
  }, [product.category, product.id])

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div style={{ marginTop: `${headerHeight}px` }}>
        <div className="mx-[175px] max-2xl:mx-24 max-xl:mx-12 max-lg:mx-6 max-md:mx-4">
          {/* Top layout */}
          <section className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left: Big image slider */}
              <div className="relative rounded-[60px] bg-gray-200 overflow-hidden">
                <div className="relative w-full aspect-[4/5]">
                  <img
                    src={encodeImagePath(galleryImages[selectedImage] || product.image)}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/images/product-placeholder.png'
                    }}
                  />
                  
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
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: '#92D0AA' }}
                    aria-label="Önceki görsel"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage((prev) => {
                        const len = galleryImages.length || 1
                        return (prev + 1) % len
                      })
                    }
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: '#92D0AA' }}
                    aria-label="Sonraki görsel"
                  >
                    <ChevronRight size={28} />
                  </button>
                </div>

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  {(galleryImages.length ? galleryImages : [product.image]).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: idx === selectedImage ? '#92D0AA' : 'rgba(146, 208, 170, 0.35)' }}
                      aria-label={`Görsel ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Product info (2nd design) */}
              <div>
                <div className="text-xs uppercase tracking-wide" style={{ color: '#F1EB9C' }}>
                  {product.category}
                </div>
                <div className="mt-2 text-sm font-semibold uppercase" style={{ color: '#92D0AA' }}>
                  {product.brand}
                </div>

                <h1
                  className="mt-4 font-grift font-bold uppercase leading-tight text-2xl lg:text-3xl line-clamp-2"
                  style={{ color: '#92D0AA' }}
                  title={product.name}
                >
                  {product.name}
                </h1>

                <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                  {product.description || 'Ürün açıklaması'}
                </p>

                {/* Pricing - her zaman göster */}
                <div className="mt-8">
                  {product.originalPrice && product.originalPrice > product.price ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          %{Math.round((1 - product.price / product.originalPrice) * 100)} İNDİRİM
                        </span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold" style={{ color: '#92D0AA' }}>
                          ₺{product.price.toLocaleString('tr-TR')}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          ₺{product.originalPrice.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-semibold uppercase" style={{ color: '#92D0AA' }}>
                      Ürün Fiyatı: <span className="text-2xl font-bold">₺{product.price.toLocaleString('tr-TR')}</span>
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
            <h2 className="font-grift font-bold uppercase text-2xl mb-6" style={{ color: '#92D0AA' }}>
              İLGİLİ ÜRÜNLER
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} className="group block">
                  <div className="rounded-[18px] border-2 border-[#92D0AA]/40 overflow-hidden bg-white">
                    <div className="relative aspect-[4/5] bg-gray-200">
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
                    <div className="font-grift font-bold uppercase" style={{ color: '#92D0AA' }}>
                      {p.name}
                    </div>
                    <div className="mt-2 text-sm font-bold" style={{ color: '#92D0AA' }}>
                      ₺{p.price.toFixed(2)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
