'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import {
  User, Package, MapPin, LogOut, ChevronRight,
  Clock, CheckCircle, Truck, XCircle, ArrowLeft
} from 'lucide-react'

interface OrderDetail {
  orderId: string
  dekontId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  subtotal: number
  shippingCost: number
  discountAmount: number
  total: number
  shippingAddress: string
  shippingCity: string
  shippingDistrict: string
  shippingPostalCode: string
  status: string
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  items: any[]
}

const STATUS_CONFIG = {
  processing: { label: 'Hazırlanıyor', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  shipped: { label: 'Kargoda', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
  delivered: { label: 'Teslim Edildi', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  cancelled: { label: 'İptal Edildi', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  pending: { label: 'Beklemede', icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50' },
}

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check auth
        const authRes = await fetch('/api/auth/me', { cache: 'no-store' })
        const authData = await authRes.json()
        if (!authData.user) {
          router.push(`/login?next=/hesabim/siparislerim/${params.orderId}`)
          return
        }
        setUser(authData.user)

        // Fetch order detail
        const res = await fetch(`/api/orders/${params.orderId}`, { cache: 'no-store' })
        if (res.status === 401 || res.status === 403) {
          setError('Bu siparişi görüntüleme yetkiniz yok.')
          return
        }
        if (res.status === 404) {
          setError('Sipariş bulunamadı.')
          return
        }
        const data = await res.json()
        setOrder(data.order || data)
      } catch {
        setError('Sipariş bilgileri yüklenemedi.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.orderId, router])

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } finally {
      router.push('/')
      router.refresh()
    }
  }

  const menuItems = [
    { href: '/hesabim', label: 'Hesap Bilgilerim', icon: User },
    { href: '/hesabim/siparislerim', label: 'Siparişlerim', icon: Package, active: true },
    { href: '/hesabim/adreslerim', label: 'Adreslerim', icon: MapPin },
  ]

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-gradient-to-br from-accent via-accent/90 to-accent/80 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Sipariş Detayı</h1>
            <p className="text-white/80">{order?.orderId || params.orderId}</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            {user && (
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
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${item.active ? 'bg-accent/10 text-accent' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                        <ChevronRight size={16} className="ml-auto" />
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full mt-2"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">Çıkış Yap</span>
                    </button>
                  </nav>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className={user ? 'lg:col-span-3' : 'lg:col-span-4'}>
              <Link href="/hesabim/siparislerim" className="inline-flex items-center text-sm text-accent hover:underline mb-4">
                <ArrowLeft size={16} className="mr-1" />
                Siparişlerime Dön
              </Link>

              {error ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <p className="text-red-600 text-lg font-medium">{error}</p>
                  <Link href="/hesabim/siparislerim" className="mt-4 inline-block text-accent hover:underline">
                    Siparişlerime Dön
                  </Link>
                </div>
              ) : order ? (
                <div className="space-y-6">
                  {/* Status + Info */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Sipariş Numarası</p>
                        <p className="text-xl font-bold text-gray-900">{order.orderId}</p>
                        {order.dekontId && (
                          <p className="text-sm text-gray-500 mt-1">Dekont: {order.dekontId}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Sipariş Tarihi</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {(() => {
                      const config = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
                      const Icon = config.icon
                      return (
                        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.color}`}>
                          <Icon size={16} />
                          <span className="font-medium">{config.label}</span>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Products */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="font-bold text-gray-900 mb-4">Sipariş Ürünleri</h2>
                    <div className="space-y-4">
                      {(order.items || []).map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/gorselsizurun.jpg' }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Package size={20} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            {item.brand && <p className="text-sm text-gray-500">{item.brand}</p>}
                            <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-accent">
                              ₺{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400">₺{Number(item.price).toFixed(2)} / adet</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-6 border-t border-gray-100 pt-4 space-y-2">
                      {order.subtotal > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Ara Toplam</span>
                          <span>₺{Number(order.subtotal).toFixed(2)}</span>
                        </div>
                      )}
                      {order.shippingCost > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Kargo</span>
                          <span>₺{Number(order.shippingCost).toFixed(2)}</span>
                        </div>
                      )}
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>İndirim</span>
                          <span>-₺{Number(order.discountAmount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100">
                        <span>Toplam</span>
                        <span className="text-accent">₺{Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping + Payment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipping */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h2 className="font-bold text-gray-900 mb-3">Teslimat Adresi</h2>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-semibold text-gray-900">{order.customerName}</p>
                        {order.shippingAddress && <p>{order.shippingAddress}</p>}
                        {order.shippingDistrict && order.shippingCity && (
                          <p>{order.shippingDistrict}, {order.shippingCity}</p>
                        )}
                        {order.shippingPostalCode && <p>Posta Kodu: {order.shippingPostalCode}</p>}
                        {order.customerPhone && <p>Tel: {order.customerPhone}</p>}
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                      <h2 className="font-bold text-gray-900 mb-3">Ödeme Bilgileri</h2>
                      <div className="text-sm text-gray-600 space-y-2">
                        {order.paymentMethod && (
                          <div className="flex justify-between">
                            <span>Ödeme Yöntemi</span>
                            <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                          </div>
                        )}
                        {order.paymentStatus && (
                          <div className="flex justify-between">
                            <span>Ödeme Durumu</span>
                            <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                              {order.paymentStatus === 'paid' ? 'Ödendi' : order.paymentStatus === 'pending' ? 'Beklemede' : order.paymentStatus}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Toplam Ödeme</span>
                          <span className="font-bold text-accent">₺{Number(order.total).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
