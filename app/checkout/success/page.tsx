'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck, Home, ShoppingBag, MapPin, User, CreditCard } from 'lucide-react'
import { useCart } from '../../context/CartContext'

// Binlik ayırıcı ile fiyat formatla (1200 → 1.200)
function formatPrice(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams?.get('orderId') || ''
  const dekontId = searchParams?.get('dekontId') || ''
  const { clearCart } = useCart()
  
  const [orderData, setOrderData] = useState<any>(null)
  const hasCleared = useRef(false)

  useEffect(() => {
    // Sadece bir kez çalıştır
    if (hasCleared.current) return
    hasCleared.current = true
    
    // Sepeti temizle
    clearCart()
    
    // Kaydedilmiş sipariş bilgisini al
    const savedOrder = localStorage.getItem('pending_order')
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder)
        setOrderData(parsedOrder)
        
        // Adresi otomatik olarak kaydet
        if (parsedOrder.customer) {
          saveAddressAutomatically(parsedOrder.customer)
        }
        
        localStorage.removeItem('pending_order')
      } catch (e) {
        console.error('Failed to parse saved order:', e)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Adresi otomatik kaydetme fonksiyonu
  const saveAddressAutomatically = async (customer: any) => {
    try {
      // Kullanıcı bilgisini al
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      const data = await res.json()
      
      if (data.user?.id) {
        const userId = data.user.id
        const savedAddresses = localStorage.getItem(`addresses_${userId}`)
        let addresses = savedAddresses ? JSON.parse(savedAddresses) : []
        
        // Aynı adres var mı kontrol et
        const exists = addresses.some((addr: any) => 
          addr.address === customer.address && 
          addr.city === customer.province &&
          addr.district === customer.district
        )
        
        if (!exists) {
          const newAddress = {
            id: Date.now().toString(),
            title: customer.addressName || 'Sipariş Adresi',
            fullName: customer.name,
            phone: customer.phone,
            city: customer.province,
            district: customer.district,
            address: customer.address,
            postalCode: '',
            isDefault: addresses.length === 0 // İlk adresse varsayılan yap
          }
          
          addresses.push(newAddress)
          localStorage.setItem(`addresses_${userId}`, JSON.stringify(addresses))
        }
      }
    } catch (e) {
      console.error('Failed to save address automatically:', e)
    }
  }

  // Kargo ücreti hesaplama
  const shippingCost = orderData?.total >= 1000 ? 0 : 80
  const finalTotal = (orderData?.total || 0) + shippingCost

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="Merumy" className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Animation */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce-slow">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Ödeme Başarılı!
          </h1>
          <p className="text-gray-600 text-lg">
            Teşekkür ederiz. Siparişiniz başarıyla oluşturuldu.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Info */}
          <div className="space-y-6">
            {/* Order Number Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center pb-4 border-b border-gray-100 mb-4">
                <p className="text-sm text-gray-500 mb-1">Sipariş Numarası</p>
                <p className="text-2xl font-bold text-accent">{orderId || 'SIP' + Date.now()}</p>
                {dekontId && (
                  <p className="text-sm text-gray-500 mt-2">Dekont ID: {dekontId}</p>
                )}
              </div>

              {/* Order Timeline */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Ödeme Alındı</h3>
                    <p className="text-gray-500 text-xs">İşleminiz başarıyla tamamlandı</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Hazırlanıyor</h3>
                    <p className="text-gray-500 text-xs">Siparişiniz hazırlanmaya başlandı</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-50">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Kargoya Verilecek</h3>
                    <p className="text-gray-500 text-xs">Tahmini: 5-7 iş günü</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info Card */}
            {orderData?.customer && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-gray-900">Müşteri Bilgileri</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700"><span className="text-gray-500">Ad Soyad:</span> {orderData.customer.name}</p>
                  <p className="text-gray-700"><span className="text-gray-500">E-posta:</span> {orderData.customer.email}</p>
                  <p className="text-gray-700"><span className="text-gray-500">Telefon:</span> {orderData.customer.phone}</p>
                </div>
              </div>
            )}

            {/* Shipping Address Card */}
            {orderData?.customer && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-gray-900">Teslimat Adresi</h3>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-medium">{orderData.customer.addressName}</p>
                  <p>{orderData.customer.address}</p>
                  <p>{orderData.customer.district}, {orderData.customer.province}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Items Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-gray-900">Sipariş Detayı</h3>
              </div>
              
              {orderData?.items && orderData.items.length > 0 ? (
                <div className="space-y-3">
                  {orderData.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      {item?.product?.image && item.product.image !== 'null' && item.product.image !== '/placeholder.jpg' ? (
                        <img 
                          src={item.product.image} 
                          alt={item.product?.name || 'Ürün'}
                          className="w-14 h-14 object-cover rounded-lg bg-gray-100"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">{item?.product?.name || 'Ürün'}</p>
                        <p className="text-xs text-gray-500">{item?.quantity || 1} adet</p>
                      </div>
                      <span className="font-semibold text-sm">₺{formatPrice((item?.product?.price || 0) * (item?.quantity || 1))}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Sipariş detayları yükleniyor...</p>
              )}
            </div>

            {/* Payment Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-gray-900">Ödeme Özeti</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span>₺{formatPrice(orderData?.total || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium">Ücretsiz</span>
                  ) : (
                    <span>₺{formatPrice(shippingCost)}</span>
                  )}
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="font-semibold text-gray-900">Toplam Ödenen</span>
                  <span className="font-bold text-accent text-lg">₺{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-accent/5 rounded-2xl p-5">
              <p className="text-gray-700 text-sm text-center">
                Sipariş onay e-postası <strong>{orderData?.customer?.email || 'e-posta adresinize'}</strong> gönderildi.
                Kargo takip bilgileri siparişiniz kargoya verildiğinde iletilecektir.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link 
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <Home size={20} />
            Ana Sayfaya Dön
          </Link>
          <Link 
            href="/shop"
            className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-4 rounded-xl font-medium hover:bg-accent/90 transition-colors"
          >
            <ShoppingBag size={20} />
            Alışverişe Devam Et
          </Link>
        </div>
      </main>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

