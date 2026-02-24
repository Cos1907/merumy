'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '../lib/products'
import { useCart } from '../context/CartContext'

function encodeImagePath(path: string): string {
  if (!path) return ''
  return path.split('/').map((part) => encodeURIComponent(part)).join('/')
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// Binlik ayırıcı ile fiyat formatla (1200 → 1.200)
function formatPrice(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ProductCardModern({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const discounted = product.price
  const original = round2(discounted * 1.4)
  const hasImage = product.image && product.image !== '/images/product-placeholder.png'

  return (
    <>
      {/* Desktop Version */}
      <Link
        href={`/product/${product.slug}`}
        className="hidden md:block group w-full"
      >
        <div className="rounded-2xl border-2 border-[#92D0AA] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden bg-[#f2f2f2]">
            {hasImage ? (
              <Image
                src={encodeImagePath(product.image)}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 1200px) 45vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Görsel Yok
              </div>
            )}

            {/* Tükendi etiketi */}
            {!product.inStock && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full bg-black/50 py-3 text-center">
                  <span className="text-white font-bold text-lg uppercase tracking-wider">
                    TÜKENDİ
                  </span>
                </div>
              </div>
            )}

            {/* Hover add-to-cart - Üstüne gelince görünür */}
            {product.inStock && (
              <button
                type="button"
                className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl py-3 text-white font-bold uppercase text-sm"
                style={{ backgroundColor: '#92D0AA' }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  addToCart(product, 1)
                }}
              >
                Sepete Ekle
              </button>
            )}

            {/* Discount badge - Sadece stokta varsa göster */}
            {product.inStock && (
              <div className="absolute left-3 top-3 rounded-xl bg-[#92D0AA] px-2.5 py-1 text-[11px] font-bold text-white shadow">
                %30 İNDİRİM
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-1 line-clamp-1 text-xs font-semibold uppercase text-gray-400">
              {product.brand}
            </div>

            <h3 className="mb-3 line-clamp-2 text-[14px] font-bold text-gray-900 min-h-[40px]">
              {product.name}
            </h3>

            {product.inStock ? (
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[16px] font-extrabold" style={{ color: '#92D0AA' }}>
                    ₺{formatPrice(discounted)}
                  </div>
                  <div className="text-xs text-gray-400 line-through">
                    ₺{formatPrice(original)}
                  </div>
                </div>

                <span className="rounded-lg bg-[#92D0AA]/15 px-3 py-1.5 text-[11px] font-bold whitespace-nowrap" style={{ color: '#92D0AA' }}>
                  Hemen Al
                </span>
              </div>
            ) : (
              <div className="w-full text-center py-2">
                <span className="text-gray-500 font-semibold text-sm">Stokta Yok</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Mobile Version - Kompakt kart tasarımı */}
      <Link
        href={`/product/${product.slug}`}
        className="md:hidden block w-full"
      >
        <div className="rounded-lg border-2 border-[#92D0AA] bg-white shadow-sm overflow-hidden">
          {/* Image - Mobil için kare görsel */}
          <div className="relative aspect-square overflow-hidden bg-[#f2f2f2]">
            {hasImage ? (
              <Image
                src={encodeImagePath(product.image)}
                alt={product.name}
                fill
                className="object-cover"
                sizes="50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                Görsel Yok
              </div>
            )}

            {/* Tükendi etiketi */}
            {!product.inStock && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full bg-black/50 py-1.5 text-center">
                  <span className="text-white font-bold text-xs uppercase">
                    TÜKENDİ
                  </span>
                </div>
              </div>
            )}

            {/* Discount badge - Mobil için küçük, sadece stokta varsa */}
            {product.inStock && (
              <div className="absolute left-1.5 top-1.5 rounded-lg bg-[#92D0AA] px-1.5 py-0.5 text-[8px] font-bold text-white shadow">
                %30
              </div>
            )}
          </div>

          {/* Content - Mobil için kompakt */}
          <div className="p-2">
            <div className="mb-0.5 line-clamp-1 text-[9px] font-semibold uppercase text-gray-400">
              {product.brand}
            </div>

            <h3 className="mb-1.5 line-clamp-2 text-[11px] font-bold text-gray-900 leading-tight min-h-[28px]">
              {product.name}
            </h3>

            <div className="flex items-center justify-between gap-1">
              {product.inStock ? (
                <>
                  <div>
                    <div className="text-[12px] font-extrabold" style={{ color: '#92D0AA' }}>
                      ₺{formatPrice(discounted)}
                    </div>
                    <div className="text-[8px] text-gray-400 line-through">
                      ₺{formatPrice(original)}
                    </div>
                  </div>

                  {/* Sepete Ekle butonu - Mobilde her zaman görünür */}
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-white font-bold text-[9px]"
                    style={{ backgroundColor: '#92D0AA' }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addToCart(product, 1)
                    }}
                  >
                    Ekle
                  </button>
                </>
              ) : (
                <div className="w-full text-center py-1">
                  <span className="text-gray-500 font-semibold text-[10px]">Stokta Yok</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </>
  )
}
