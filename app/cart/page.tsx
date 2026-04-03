'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

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
    setPromoCode,
    clearPromoCode,
    freeShipping,
  } = useCart()
  const router = useRouter()
  const [promoOpen, setPromoOpen] = useState(false)
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState<string | null>(null)
  const [headerHeight, setHeaderHeight] = useState(140)

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
                        <div className="font-grift font-bold text-xl leading-tight line-clamp-1" style={{ textTransform: "capitalize", color: '#92D0AA' }}>
                          <Link href={`/product/${item.product.slug}`} className="hover:underline">
                            {item.product.name}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-1">{item.product.description || 'Ürün açıklaması'}</div>

                        <div className="mt-3 text-base font-bold" style={{ color: '#92D0AA' }}>
                          ₺{item.product.price.toFixed(2)}
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
            <div className="bg-white p-6 rounded-[18px] border border-gray-200 sticky top-6">
              <h2 className="text-2xl font-bold font-grift" style={{ color: '#92D0AA' }}>Sipariş Özeti</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700 pt-4">
                  <span>Ürünler</span>
                  <span>₺{(cartSubtotal + discountFromOriginal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 border-t border-gray-200 pt-3">
                  <span>İndirim Kazancınız</span>
                  <span className="text-[#d9534f]">-₺{discountFromOriginal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 border-t border-gray-200 pt-3">
                  <button
                    type="button"
                    onClick={() => setPromoOpen((v) => !v)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span>Promosyon Kodu Ekle</span>
                    <span>{promoOpen ? '-' : '+'}</span>
                  </button>
                </div>
                {promoOpen && (
                  <div className="border-t border-gray-200 pt-3">
                    {promoCode ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-700">
                          Uygulandı: <span className="font-bold">{promoCode}</span>
                        </div>
                        <button
                          type="button"
                          className="text-sm underline underline-offset-4"
                          onClick={async () => {
                            setPromoError(null)
                            await clearPromoCode()
                          }}
                        >
                          Kaldır
                        </button>
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
                          placeholder="Kodu girin (örn: MERUMY250)"
                          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                        />
                        <button
                          type="submit"
                          className="rounded-xl px-4 py-2 text-white text-sm font-semibold"
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
                  <div className="flex justify-between text-gray-700 border-t border-gray-200 pt-3">
                    <span>Promosyon İndirimi</span>
                    <span className="text-[#d9534f]">-₺{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700 border-t border-gray-200 pt-3">
                  <span>Kargo Ücreti</span>
                  {freeShipping ? (
                    <span className="text-green-600 font-semibold">ÜCRETSİZ</span>
                  ) : (
                    <span>₺80,00</span>
                  )}
                </div>
                {!freeShipping && cartSubtotal > 0 && (
                  <div className="text-xs text-gray-500 bg-[#92D0AA]/10 rounded-lg px-3 py-2">
                    ₺{Math.max(0, 1000 - cartSubtotal).toFixed(0)} daha alın, kargo ücretsiz olsun!
                  </div>
                )}
                <div className="border-t border-gray-200 pt-6 flex justify-between font-bold text-lg text-gray-900">
                  <span>Toplam</span>
                  <span>₺{(cartTotal + (freeShipping ? 0 : 80)).toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={() => router.push('/checkout')}
                className="w-full text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 uppercase"
                style={{ backgroundColor: '#92D0AA' }}
              >
                Teslimat Adımına Geç
                <ArrowRight size={18} />
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


