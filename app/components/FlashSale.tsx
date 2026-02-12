'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, ShoppingCart, Zap } from 'lucide-react'

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 30,
    seconds: 45
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const products = [
    {
      id: 1,
      name: "Kore Salyangoz Özü",
      brand: "MERUMY BEAUTY",
      price: 199.99,
      originalPrice: 235.00,
      discount: 20,
      rating: 4.5,
      reviews: 871,
      stock: 10,
      image: "/images/product_1.png"
    },
    {
      id: 2,
      name: "Kore Kirpik Serumu",
      brand: "LUXE LASHES",
      price: 249.99,
      originalPrice: 305.00,
      discount: 15,
      rating: 4.5,
      reviews: 110,
      stock: 5,
      image: "/images/product_2.png"
    },
    {
      id: 3,
      name: "Kore C Vitamini Serumu",
      brand: "RADIANT SKINCARE",
      price: 299.99,
      originalPrice: 459.99,
      discount: 25,
      rating: 5.0,
      reviews: 1100,
      stock: 8,
      image: "/images/product_3.png"
    }
  ]

  return (
    <section className="py-20 bg-accent-light">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div className="mb-6 lg:mb-0">
            <h2 className="cs_fs_54 font-semibold text-primary flex items-center">
              Fla<Zap className="text-accent-strong mx-2" size={32} />h İndirim
            </h2>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
            <div className="mb-4 lg:mb-0">
              <h3 className="cs_fs_16 font-normal text-secondary mb-2">Bitiş Süresi</h3>
              <div className="flex space-x-2">
                <div className="bg-accent text-white cs_center cs_radius_5 px-3 py-2">
                  <span className="cs_fs_36 font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                </div>
                <div className="bg-accent text-white cs_center cs_radius_5 px-3 py-2">
                  <span className="cs_fs_36 font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                </div>
                <div className="bg-accent text-white cs_center cs_radius_5 px-3 py-2">
                  <span className="cs_fs_36 font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
            <a 
              href="/flash-sale" 
              className="text-accent font-medium cs_fs_24 hover:text-accent/80 transition-colors"
            >
              Tümünü Gör
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white cs_radius_12 overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
              <div className="relative">
                <div className="absolute top-3 left-3 z-10 bg-accent-strong text-white px-2 py-1 cs_radius_5 text-xs font-bold">
                  %{product.discount} İNDİRİM
                </div>
                <div className="relative overflow-hidden">
                  <Image 
                    src={product.image} 
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
              </div>
              
              <div className="p-4">
                <div className="text-accent cs_fs_14 font-light uppercase mb-2">
                  {product.brand}
                </div>
                <h3 className="cs_fs_18 font-normal text-primary mb-2">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="cs_fs_24 text-accent font-medium">
                    ₺{product.price}
                  </span>
                  <span className="cs_fs_16 text-gray-500 line-through">
                    ₺{product.originalPrice}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
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
                    ({product.reviews || 0})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-accent h-2 rounded-full" 
                    style={{ width: `${(product.stock / 10) * 100}%` }}
                  ></div>
                </div>
                <p className="cs_fs_14 text-gray-500">Stok: {product.stock}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}



