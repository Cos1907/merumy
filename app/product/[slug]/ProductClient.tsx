'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Minus, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../lib/products'

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

function encodeImagePath(pathStr: string): string {
  if (!pathStr) return ''
  return pathStr.split('/').map((part) => encodeURIComponent(part)).join('/')
}

function getBrandLogoPath(brandName: string): string | null {
  const brandMap: Record<string, string> = {
    'Bibimcos': 'bibimcos.webp',
    'Banobagi': 'banobagi.webp',
    'Anua': 'anua.webp',
    'Arencia': 'arencia.webp',
    'Round Lab': 'Roundlab.webp',
    'Roundlab': 'Roundlab.webp',
    'Pyunkang Yul': 'pyunkang-yul.webp',
    'Pkunkang Yul': 'pyunkang-yul.webp',
    'Medisure': 'Medisure.jpg',
    'Medicube': 'Medicube.png',
    'LEADERS': 'LEADERS.jpg',
    '2AN': '2an.png',
    '2an': '2an.png',
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
    'DalBam': 'dalbam.webp',
    'Dalbam': 'dalbam.webp',
    'Mizon': 'mizon.png',
    'Mjcare': 'mjcare.png',
    'MJCare': 'mjcare.png',
    'Tırtır': 'tirtir.webp',
    'Tirtir': 'tirtir.webp',
    'Nard': 'nard.png',
    'VT': 'vt-logo.webp',
    'Salt Train': 'salttrain.png',
    'Saltrain': 'salttrain.png',
  }
  const filename = brandMap[brandName] || brandMap[brandName?.trim()]
  return filename ? `/markalar/${encodeURIComponent(filename)}` : null
}

interface ProductClientProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductClient({ product, relatedProducts }: ProductClientProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [headerHeight, setHeaderHeight] = useState(140)
  const [selectedImage, setSelectedImage] = useState(0)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [descExpanded, setDescExpanded] = useState(false)
  const [brandLogoError, setBrandLogoError] = useState(false)

  const brandLogoPath = getBrandLogoPath(product.brand)
  const displayImages = galleryImages.length ? galleryImages : product.image ? [product.image] : []

  useEffect(() => {
    const calc = () => {
      const h = document.querySelector('.fixed.top-0.left-0.right-0.z-50') as HTMLElement | null
      setHeaderHeight(h ? h.clientHeight : 140)
    }
    setTimeout(calc, 50)
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
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
    return () => { cancelled = true }
  }, [product.image, product.slug])

  return (
    <div style={{ marginTop: `${headerHeight}px` }}>
      <div className="mx-[175px] max-2xl:mx-24 max-xl:mx-12 max-lg:mx-6 max-md:mx-4">
        {/* ── Product Detail ── */}
        <section className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left: Image gallery */}
            <div className="relative rounded-[60px] bg-gray-100 overflow-hidden">
              <div className="relative w-full aspect-[4/5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodeImagePath(displayImages[selectedImage] || product.image)}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.src = '/images/product-placeholder.png' }}
                />

                {product.inStock === false && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative bg-red-600/90 text-white font-bold text-2xl md:text-3xl py-4 px-8 -rotate-12 shadow-lg">
                      STOK YOK
                    </div>
                  </div>
                )}

                {displayImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedImage((p) => (p - 1 + displayImages.length) % displayImages.length)}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: '#92D0AA' }}
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedImage((p) => (p + 1) % displayImages.length)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: '#92D0AA' }}
                    >
                      <ChevronRight size={28} />
                    </button>
                  </>
                )}
              </div>

              {displayImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  {displayImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      className="w-3.5 h-3.5 rounded-full transition-all"
                      style={{ backgroundColor: idx === selectedImage ? '#92D0AA' : 'rgba(146,208,170,0.35)' }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product info */}
            <div>
              {/* Category */}
              <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#F1EB9C' }}>
                {product.category}
              </div>

              {/* Brand Logo - bigger + clickable */}
              <div className="mt-3 h-16 flex items-center">
                <Link href={`/marka/${slugifyBrand(product.brand)}`} className="inline-block hover:opacity-80 transition-opacity">
                  {brandLogoPath && !brandLogoError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={brandLogoPath}
                      alt={product.brand}
                      className="max-h-14 max-w-[160px] object-contain"
                      onError={() => setBrandLogoError(true)}
                    />
                  ) : (
                    <span className="text-base font-bold uppercase" style={{ color: '#92D0AA' }}>
                      {product.brand}
                    </span>
                  )}
                </Link>
              </div>

              {/* Product name */}
              <h1
                className="mt-4 font-grift font-bold uppercase leading-tight text-2xl lg:text-3xl"
                style={{ color: '#92D0AA' }}
              >
                {product.name}
              </h1>

              {/* Description with expand/collapse */}
              {product.description && (
                <div className="mt-4">
                  <p className={`text-sm text-gray-700 leading-relaxed ${!descExpanded ? 'line-clamp-3' : ''}`}>
                    {product.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => setDescExpanded((v) => !v)}
                    className="mt-2 text-sm font-semibold flex items-center gap-1"
                    style={{ color: '#92D0AA' }}
                  >
                    {descExpanded ? (
                      <><ChevronUp size={15} /> Daha az gör</>
                    ) : (
                      <><ChevronDown size={15} /> Devamını gör</>
                    )}
                  </button>
                </div>
              )}

              {/* Price */}
              <div className="mt-8">
                {product.originalPrice && product.originalPrice > product.price ? (
                  <div>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      %{Math.round((1 - product.price / product.originalPrice) * 100)} İNDİRİM
                    </span>
                    <div className="flex items-baseline gap-3 mt-2">
                      <span className="text-4xl font-bold" style={{ color: '#92D0AA' }}>
                        ₺{product.price.toLocaleString('tr-TR')}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        ₺{product.originalPrice.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-4xl font-bold" style={{ color: '#92D0AA' }}>
                    ₺{product.price.toLocaleString('tr-TR')}
                  </span>
                )}
              </div>

              {/* Stock & cart */}
              {product.inStock === false ? (
                <div className="mt-6 bg-red-100 border border-red-300 rounded-lg p-4">
                  <span className="text-red-600 font-bold text-xl">STOK YOK</span>
                  <p className="text-red-500 text-sm mt-1">Bu ürün şu anda stokta bulunmamaktadır.</p>
                </div>
              ) : (
                <>
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: '#92D0AA' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-bold text-gray-800">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: '#92D0AA' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(product, quantity)}
                    className="mt-6 w-full rounded-[12px] py-4 text-white font-bold uppercase tracking-wide"
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
        {relatedProducts.length > 0 && (
          <section className="py-10">
            <h2 className="font-grift font-bold uppercase text-xl md:text-2xl mb-6" style={{ color: '#92D0AA' }}>
              İLGİLİ ÜRÜNLER
            </h2>
            {/* Mobil: yatay kaydırma; Desktop: grid */}
            <div className="flex md:hidden gap-3 overflow-x-auto pb-3 snap-x snap-mandatory">
              {relatedProducts.map((p) => (
                <div key={p.id} className="flex-none w-[160px] snap-start">
                  <RelatedProductCard product={p} compact />
                </div>
              ))}
            </div>
            <div className="hidden md:grid grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <RelatedProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function RelatedProductCard({ product: p, compact = false }: { product: Product; compact?: boolean }) {
  const { addToCart } = useCart()

  function encodeImg(pathStr: string): string {
    if (!pathStr) return ''
    return pathStr.split('/').map((part) => encodeURIComponent(part)).join('/')
  }

  return (
    <div className="flex flex-col h-full">
      <Link href={`/product/${p.slug}`} className="group block flex-1">
        <div
          className={`overflow-hidden bg-white ${compact ? 'rounded-[14px]' : 'rounded-[18px]'}`}
          style={{ border: '2px solid rgba(146,208,170,0.4)' }}
        >
          <div className="relative aspect-square bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={encodeImg(p.image)}
              alt={p.name}
              className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300 p-2"
              onError={(e) => { e.currentTarget.src = '/images/product-placeholder.png' }}
            />
          </div>
        </div>
        <div className="mt-2 text-center px-1">
          <div
            className={`font-grift font-bold uppercase line-clamp-2 leading-tight ${compact ? 'text-[11px]' : 'text-xs md:text-sm'}`}
            style={{ color: '#92D0AA' }}
          >
            {p.name}
          </div>
          <div className={`mt-1 font-bold ${compact ? 'text-xs' : 'text-sm'}`} style={{ color: '#92D0AA' }}>
            ₺{p.price.toFixed(2)}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => addToCart(p, 1)}
        className={`mt-2 w-full rounded-xl text-white font-bold uppercase tracking-wide ${compact ? 'py-2 text-[10px]' : 'py-2.5 text-xs md:text-sm'}`}
        style={{ backgroundColor: '#92D0AA' }}
      >
        Sepete Ekle
      </button>
    </div>
  )
}
