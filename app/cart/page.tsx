'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

function formatRemaining(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Binlik ayırıcı ile fiyat formatla (1200 → 1.200)
function formatPrice(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartSubtotal,
    discountFromOriginal,
    promoCode,
    promoDiscount,
    promoMinAmount,
    promoMinNotMet,
    setPromoCode,
    clearPromoCode,
  } = useCart()
  const router = useRouter()
  const [now, setNow] = useState(Date.now())
  const [promoOpen, setPromoOpen] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState<string | null>(null)
  const [headerHeight, setHeaderHeight] = useState(140)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

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

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header />
        </div>
        <div style={{ marginTop: `${headerHeight}px` }} className="min-h-[60vh] flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#92D0AA' }}>Sepetiniz Boş</h1>
          <p className="text-gray-600 mb-8">Sepetinizde henüz ürün bulunmamaktadır.</p>
          <Link 
            href="/shop" 
            className="text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            style={{ backgroundColor: '#92D0AA' }}
          >
            Alışverişe Başla
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div style={{ marginTop: `${headerHeight}px` }} className="py-12">
        <div className="mx-[175px] max-2xl:mx-24 max-xl:mx-12 max-lg:mx-6 max-md:mx-4">
        <h1 className="text-4xl font-bold font-grift uppercase mb-10" style={{ color: '#92D0AA' }}>
          SEPETİM
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.product.id} className="border-2 rounded-[18px] overflow-hidden bg-white" style={{ borderColor: '#92D0AA' }}>
                <div className="flex">
                  {/* Image */}
                  <div className="w-44 h-32 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/images/product-placeholder.png'
                        }}
                      />
                    ) : (
                      <div className="text-gray-300 text-xs">Görsel Yok</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-grift font-bold uppercase text-xl leading-tight line-clamp-1" style={{ color: '#92D0AA' }}>
                          <Link href={`/product/${item.product.slug}`} className="hover:underline">
                            {item.product.name}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-1">{item.product.description || 'Ürün açıklaması'}</div>

                        <div className="mt-3 text-base font-bold" style={{ color: '#92D0AA' }}>
                          ₺{formatPrice(item.product.price)}
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                          Sepette kalma süresi:{' '}
                          <span className="font-semibold">{formatRemaining(item.expiresAt - now)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Ürünü kaldır"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Quantity Bar */}
                  <div className="w-16 flex flex-col items-center justify-between py-3 text-white" style={{ backgroundColor: '#92D0AA' }}>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                      aria-label="Arttır"
                    >
                      <Plus size={18} />
                    </button>
                    <div className="text-2xl font-bold">{item.quantity}</div>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                      aria-label="Azalt"
                    >
                      <Minus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[18px] border border-gray-100 shadow-sm sticky top-6">
              {/* Başlık - Italic */}
              <h2 className="text-3xl font-semibold italic mb-6" style={{ color: '#92D0AA' }}>Sipariş Özeti</h2>
              
              {/* Ürünler */}
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-700">Ürünler</span>
                <span className="text-gray-900 font-medium">{formatPrice(cartSubtotal + discountFromOriginal)} TL</span>
              </div>
              
              {/* İndirim Kazancınız */}
              <div className="flex justify-between items-center py-3">
                <span style={{ color: '#92D0AA' }}>İndirim Kazancınız</span>
                <span style={{ color: '#92D0AA' }}>-{formatPrice(discountFromOriginal)} TL</span>
              </div>
              
              {/* Promosyon Kodu Ekle */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setPromoOpen((v) => !v)}
                  className="flex w-full items-center justify-between"
                >
                  <span style={{ color: '#92D0AA' }}>Promosyon Kodu Ekle</span>
                  <span style={{ color: '#92D0AA' }} className="text-xl">{promoOpen ? '-' : '+'}</span>
                </button>
              </div>
              
              {promoOpen && (
                <div className="pb-3">
                  {promoCode ? (
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-700">
                          Uygulandı: <span className="font-bold">{promoCode}</span>
                        </div>
                        <button
                          type="button"
                          className="text-sm underline underline-offset-4"
                          style={{ color: '#92D0AA' }}
                          onClick={async () => {
                            setPromoError(null)
                            await clearPromoCode()
                          }}
                        >
                          Kaldır
                        </button>
                      </div>
                      {promoMinNotMet && promoMinAmount > 0 && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Bu kupon kodu minimum <strong>{formatPrice(promoMinAmount)} TL</strong> alışverişte geçerlidir.
                          </p>
                          <p className="text-xs text-yellow-600 mt-1">
                            Sepet tutarınız: {formatPrice(cartSubtotal)} TL | Kalan: {formatPrice(promoMinAmount - cartSubtotal)} TL
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form
                      className="flex items-center gap-2"
                      onSubmit={async (e) => {
                        e.preventDefault()
                        setPromoError(null)
                        const r = await setPromoCode(promoInput)
                        if (!r.ok) setPromoError('Promosyon kodu geçersiz.')
                        else setPromoInput('')
                      }}
                    >
                      <input
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="Kupon kodunuzu girin"
                        className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      />
                      <button
                        type="submit"
                        className="rounded-full px-4 py-2 text-white text-sm font-semibold"
                        style={{ backgroundColor: '#92D0AA' }}
                      >
                        Uygula
                      </button>
                    </form>
                  )}
                  {promoError && <div className="mt-2 text-xs text-red-600">{promoError}</div>}
                </div>
              )}
              
              {promoDiscount > 0 && (
                <div className="flex justify-between items-center py-3">
                  <span style={{ color: '#92D0AA' }}>Promosyon İndirimi</span>
                  <span style={{ color: '#92D0AA' }}>-{formatPrice(promoDiscount)} TL</span>
                </div>
              )}
              
              {/* Ayraç */}
              <div className="border-t border-gray-200 my-4"></div>
              
              {/* Kargo Bilgisi */}
              <p className="text-gray-600 text-sm mb-4">1000 TL üzeri kargo ücretsiz!</p>
              
              {/* Toplam */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-700 font-medium">Toplam</span>
                <span className="text-gray-900 font-bold text-lg">{formatPrice(cartTotal)} TL</span>
              </div>

              {/* Teslimat Butonu */}
              <button 
                onClick={() => router.push('/checkout')}
                className="w-full text-white py-4 rounded-full font-semibold transition-colors uppercase tracking-wide"
                style={{ backgroundColor: '#92D0AA' }}
              >
                TESLİMAT ADIMINA GEÇ
              </button>
              
              <Link 
                href="/shop" 
                className="block text-center mt-4 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </main>
  )
}


