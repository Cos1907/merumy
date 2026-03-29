'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Star, Check, Sparkles } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'

// Ürün verileri - products.json ile senkronize
const products = {
  black: {
    id: '00001',
    slug: '00001-age-r-booster-pro-black',
    name: 'Medicube AGE-R Booster Pro Black',
    price: 16499,
    originalPrice: 32998,
    image: '/siyah/siyah-cihaz01.jpg',
    images: ['/siyah/siyah-cihaz01.jpg', '/siyah/siyah-cihaz-02.jpg', '/siyah/siyah-cihaz-03.jpg'],
    color: 'Siyah',
    barcode: '8800256114481',
    brand: 'Medicube',
    category: 'Cihaz',
    inStock: true
  },
  pink: {
    id: '00002',
    slug: '00002-age-r-booster-pro-pink',
    name: 'Medicube AGE-R Booster Pro Pink',
    price: 16999,
    originalPrice: 33998,
    image: '/pembe/pembe-cihaz.jpg',
    images: ['/pembe/pembe-cihaz.jpg'],
    color: 'Pembe',
    barcode: '8800256114482',
    brand: 'Medicube',
    category: 'Cihaz',
    inStock: true
  }
}

const features = [
  { icon: '⚡', title: 'EMS Teknolojisi', desc: 'Kas stimülasyonu ile sıkılaştırma' },
  { icon: '💡', title: 'LED Terapi', desc: 'Kırmızı ışık ile cilt yenileme' },
  { icon: '🔊', title: 'Titreşim', desc: 'Derin penetrasyon desteği' },
  { icon: '✨', title: 'İyontoforez', desc: 'Serum emilimini artırır' }
]

export default function BoosterProPage() {
  const [headerHeight, setHeaderHeight] = useState(140)
  const { addToCart } = useCart()

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const headerContainer = document.querySelector('.fixed.top-0.left-0.right-0.z-50')
      if (headerContainer) {
        setHeaderHeight((headerContainer as HTMLElement).clientHeight)
      } else {
        setHeaderHeight(140)
      }
    }
    
    setTimeout(calculateHeaderHeight, 50)
    window.addEventListener('resize', calculateHeaderHeight)
    return () => window.removeEventListener('resize', calculateHeaderHeight)
  }, [])

  const handleAddToCart = (productKey: 'black' | 'pink') => {
    const product = products[productKey]
    // CartContext'in beklediği Product tipine uygun şekilde çağır
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      brand: product.brand,
      category: product.category,
      barcode: product.barcode,
      inStock: product.inStock
    } as any, 1) // 1 adet ekle
  }

  const discount = Math.round(((products.black.originalPrice - products.black.price) / products.black.originalPrice) * 100)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div style={{ marginTop: `${headerHeight}px` }}>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white py-12 md:py-20 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#92D0AA]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 bg-[#92D0AA]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-[#92D0AA]" />
                <span className="text-sm font-medium text-[#92D0AA]">Profesyonel Cilt Bakımı</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 font-grift">
                MEDICUBE AGE-R
                <span className="block text-[#92D0AA]">BOOSTER PRO</span>
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-lg">
                EMS, LED ve titreşim teknolojileri ile evde profesyonel cilt bakımı deneyimi
              </p>
            </div>

            {/* Products Grid - Mobile: Side by Side, Desktop: Side by Side */}
            <div className="grid grid-cols-2 gap-3 md:gap-8 max-w-5xl mx-auto">
              {/* Black Product */}
              <div className="group bg-white/5 backdrop-blur-md rounded-2xl md:rounded-3xl p-3 md:p-6 border border-white/10 hover:border-[#92D0AA]/50 transition-all duration-500 hover:transform hover:scale-[1.02]">
                {/* Clickable Image */}
                <Link href={`/product/${products.black.slug}`} className="block">
                  <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-6 bg-gradient-to-br from-gray-900 to-black">
                    <Image
                      src={products.black.image}
                      alt={products.black.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 400px"
                    />
                    {/* Discount Badge */}
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-bold">
                      %{discount} İNDİRİM
                    </div>
                  </div>
                </Link>

                {/* Clickable Product Name */}
                <Link href={`/product/${products.black.slug}`} className="block hover:text-[#92D0AA] transition-colors">
                  <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2 line-clamp-2">
                    {products.black.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-[10px] md:text-sm text-gray-400">(237)</span>
                </div>

                {/* Pricing */}
                <div className="mb-3 md:mb-6">
                  <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
                    <span className="text-xl md:text-3xl font-bold text-[#92D0AA]">
                      ₺{products.black.price.toLocaleString('tr-TR')}
                    </span>
                    <span className="text-xs md:text-lg text-gray-500 line-through">
                      ₺{products.black.originalPrice.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart('black')}
                  className="w-full bg-gradient-to-r from-[#92D0AA] to-[#7BC496] hover:from-[#7BC496] hover:to-[#6AB385] text-white font-bold py-2.5 md:py-4 rounded-lg md:rounded-xl flex items-center justify-center gap-1 md:gap-2 transition-all duration-300 text-xs md:text-base"
                >
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  <span>SEPETE EKLE</span>
                </button>
              </div>

              {/* Pink Product */}
              <div className="group bg-white/5 backdrop-blur-md rounded-2xl md:rounded-3xl p-3 md:p-6 border border-white/10 hover:border-pink-400/50 transition-all duration-500 hover:transform hover:scale-[1.02]">
                {/* Clickable Image */}
                <Link href={`/product/${products.pink.slug}`} className="block">
                  <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-6 bg-gradient-to-br from-pink-100 to-pink-50">
                    <Image
                      src={products.pink.image}
                      alt={products.pink.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 400px"
                    />
                    {/* Discount Badge */}
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-bold">
                      %{discount} İNDİRİM
                    </div>
                    {/* Popular Badge */}
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-pink-500 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-bold">
                      EN POPÜLER
                    </div>
                  </div>
                </Link>

                {/* Clickable Product Name */}
                <Link href={`/product/${products.pink.slug}`} className="block hover:text-pink-400 transition-colors">
                  <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2 line-clamp-2">
                    {products.pink.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-[10px] md:text-sm text-gray-400">(312)</span>
                </div>

                {/* Pricing */}
                <div className="mb-3 md:mb-6">
                  <div className="flex items-baseline gap-1 md:gap-2 flex-wrap">
                    <span className="text-xl md:text-3xl font-bold text-pink-400">
                      ₺{products.pink.price.toLocaleString('tr-TR')}
                    </span>
                    <span className="text-xs md:text-lg text-gray-500 line-through">
                      ₺{products.pink.originalPrice.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart('pink')}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-2.5 md:py-4 rounded-lg md:rounded-xl flex items-center justify-center gap-1 md:gap-2 transition-all duration-300 text-xs md:text-base"
                >
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  <span>SEPETE EKLE</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 font-grift text-gray-900">
              4'ü 1 Arada Teknoloji
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-4 md:p-6 rounded-2xl bg-gray-50 hover:bg-[#92D0AA]/10 transition-colors duration-300">
                  <div className="text-3xl md:text-5xl mb-3 md:mb-4">{feature.icon}</div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 font-grift text-gray-900">
                Neden Booster Pro?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                {[
                  'Kolajen üretimini %35 artırır',
                  'İnce çizgi ve kırışıklıkları azaltır',
                  'Cilt elastikiyetini güçlendirir',
                  'Serum emilimini 10 kat artırır',
                  'Günde sadece 10 dakika kullanım',
                  '30 gün içinde görünür sonuçlar'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-xl shadow-sm">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#92D0AA]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-[#92D0AA]" />
                    </div>
                    <span className="text-sm md:text-base text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 font-grift text-gray-900">
              Kullanım Görselleri
            </h2>
            
            <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-4xl mx-auto">
              {['/siyah/siyah-cihaz01.jpg', '/siyah/siyah-cihaz-02.jpg', '/siyah/siyah-cihaz-03.jpg'].map((img, index) => (
                <div key={index} className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden">
                  <Image
                    src={img}
                    alt={`Booster Pro kullanım ${index + 1}`}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 33vw, 300px"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 bg-gradient-to-r from-[#92D0AA] to-[#7BC496]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6 font-grift">
              Şimdi Sipariş Ver, %50 İndirimden Yararlan!
            </h2>
            <p className="text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-lg">
              Sınırlı süreli kampanyamızdan faydalanın. Ücretsiz kargo ve 30 gün iade garantisi ile güvenle alışveriş yapın.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link
                href={`/product/${products.black.slug}`}
                className="bg-white text-[#92D0AA] px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors text-sm md:text-base"
              >
                SİYAH MODELİ İNCELE
              </Link>
              <Link
                href={`/product/${products.pink.slug}`}
                className="bg-pink-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold hover:bg-pink-600 transition-colors text-sm md:text-base"
              >
                PEMBE MODELİ İNCELE
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}

