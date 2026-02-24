'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { getFeaturedProducts } from '../lib/products'

// Binlik ayırıcı ile fiyat formatla (1200 → 1.200)
function formatPrice(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function FeaturedProducts() {
  const products = getFeaturedProducts(8)

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div className="mb-6 lg:mb-0">
            <h2 className="cs_fs_54 font-semibold text-primary">
              ÖNE ÇIKAN ÜRÜNLER
            </h2>
          </div>
          <div>
            <a 
              href="/shop" 
              className="text-accent font-medium cs_fs_24 hover:text-accent/80 transition-colors"
            >
              Tümünü Gör
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`}>
              <div className="bg-white cs_radius_12 overflow-hidden shadow-sm hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="relative overflow-hidden">
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                    {product.image && product.image !== '/images/product-placeholder.png' ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/images/product-placeholder.png'
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-center p-4">
                        <ShoppingCart size={48} className="mx-auto mb-2" />
                        <p className="text-sm">Görsel Yok</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      <button className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors flex items-center space-x-2">
                        <ShoppingCart size={16} />
                        <span>Sepete Ekle</span>
                      </button>
                      <button className="bg-white text-accent p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Heart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="text-accent cs_fs_14 font-light uppercase mb-2">
                    {product.brand}
                  </div>
                  <h3 className="cs_fs_18 font-normal text-primary mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="cs_fs_24 text-accent font-medium">
                      ₺{formatPrice(product.price)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className={`text-sm ${i < Math.floor(product.rating || 0) ? 'text-accent-strong' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="cs_fs_14 text-gray-500">
                      ({product.rating || 0}/5) | {product.sold || 0} Satıldı
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}



