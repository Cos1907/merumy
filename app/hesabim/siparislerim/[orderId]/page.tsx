'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { User, Package, MapPin, LogOut, ChevronRight, ChevronLeft, Clock, CheckCircle, Truck, XCircle, ShoppingBag, CreditCard } from 'lucide-react'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.orderId as string
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          const orderRes = await fetch(`/api/orders/${orderId}`, { cache: 'no-store' })
          if (orderRes.ok) {
            const orderData = await orderRes.json()
            setOrder(orderData.order)
          } else {
            router.push('/hesabim/siparislerim')
          }
        } else {
          router.push('/login?next=/hesabim/siparislerim')
        }
      } catch {
        router.push('/login?next=/hesabim/siparislerim')
      } finally {
        setLoading(false)
      }
    }
    if (orderId) fetchData()
  }, [router, orderId])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" />
        </div>
        <Footer />
      </main>
    )
  }

  if (!user || !order) return null

  const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    processing: { label: 'Hazırlanıyor', color: 'text-amber-600 bg-amber-50', icon: Clock },
    shipped: { label: 'Kargoda', color: 'text-blue-600 bg-blue-50', icon: Truck },
    delivered: { label: 'Teslim Edildi', color: 'text-green-600 bg-green-50', icon: CheckCircle },
    cancelled: { label: 'İptal Edildi', color: 'text-red-600 bg-red-50', icon: XCircle },
    pending: { label: 'Bekliyor', color: 'text-gray-600 bg-gray-100', icon: Clock },
  }
  const statusInfo = statusMap[order.status] || statusMap.pending
  const StatusIcon = statusInfo.icon

  const menuItems = [
    { href: '/hesabim', label: 'Hesap Bilgilerim', icon: User },
    { href: '/hesabim/siparislerim', label: 'Siparişlerim', icon: Package, active: true },
    { href: '/hesabim/adreslerim', label: 'Adreslerim', icon: MapPin },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-gradient-to-br from-accent via-accent/90 to-accent-strong py-10">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-1">Sipariş Detayı</h1>
            <p className="text-white/80 text-sm">#{order.orderId}</p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-accent to-accent/80 text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User size={32} />
                  </div>
                  <h3 className="font-semibold text-center">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-white/80 text-center truncate">{user.email}</p>
                </div>
                <nav className="p-2">
                  {menuItems.map((item) => (
                    <Link key={item.href} href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        item.active ? 'bg-accent/10 text-accent' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight size={16} className="ml-auto" />
                    </Link>
                  ))}
                  <button onClick={async () => {
                    try { await fetch('/api/auth/logout', { method: 'POST' }) } finally {
                      router.push('/'); router.refresh()
                    }
                  }} className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full mt-2">
                    <LogOut size={20} />
                    <span className="font-medium">Çıkış Yap</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main */}
            <div className="lg:col-span-3 space-y-5">
              {/* Back */}
              <Link href="/hesabim/siparislerim" className="inline-flex items-center gap-2 text-accent hover:underline text-sm">
                <ChevronLeft size={16} /> Siparişlerime Dön
              </Link>

              {/* Status & Header */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Sipariş No</p>
                    <p className="font-bold text-gray-900 text-lg">#{order.orderId}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${statusInfo.color}`}>
                    <StatusIcon size={16} />
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2"><ShoppingBag size={18} className="text-accent" /> Ürünler</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {(order.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-5">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.image && item.image !== 'null' ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={20} className="text-gray-300" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 line-clamp-2 text-sm">{item.name}</p>
                        {item.brand && <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>}
                        <p className="text-xs text-gray-500 mt-1">Adet: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900">₺{(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">₺{Number(item.price).toFixed(2)} / adet</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Delivery grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Payment Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-accent" /> Ödeme Özeti</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Ara Toplam</span>
                      <span>₺{Number(order.subtotal || order.total || 0).toFixed(2)}</span>
                    </div>
                    {order.promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>İndirim Kodu</span>
                        <span>-₺{Number(order.promoDiscount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Kargo</span>
                      <span>{order.shippingFee > 0 ? `₺${Number(order.shippingFee).toFixed(2)}` : 'Ücretsiz'}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                      <span>Toplam</span>
                      <span className="text-accent">₺{Number(order.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-accent" /> Teslimat Adresi</h2>
                    <div className="text-sm text-gray-700 space-y-1">
                      {typeof order.shippingAddress === 'string' ? (
                        <p className="whitespace-pre-line">{order.shippingAddress}</p>
                      ) : (
                        <>
                          {order.shippingAddress.fullName && <p className="font-medium">{order.shippingAddress.fullName}</p>}
                          {order.shippingAddress.phone && <p className="text-gray-500">{order.shippingAddress.phone}</p>}
                          {order.shippingAddress.address && <p>{order.shippingAddress.address}</p>}
                          {order.shippingAddress.district && <p>{order.shippingAddress.district}, {order.shippingAddress.city}</p>}
                          {order.shippingAddress.zipCode && <p>{order.shippingAddress.zipCode}</p>}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
