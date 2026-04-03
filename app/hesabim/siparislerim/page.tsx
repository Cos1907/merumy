'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { User, Package, MapPin, LogOut, ChevronRight, ShoppingBag, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'

interface Order {
  id: string
  orderId: string
  dekontId: string
  customerName: string
  items: any[]
  total: number
  status: string
  createdAt: string
}

export default function SiparislerimPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          
          // Siparişleri getir
          const ordersRes = await fetch('/api/orders', { cache: 'no-store' })
          const ordersData = await ordersRes.json()
          setOrders(ordersData.orders || [])
        } else {
          router.push('/login?next=/hesabim/siparislerim')
        }
      } catch {
        router.push('/login?next=/hesabim/siparislerim')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/')
      router.refresh()
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!user) return null

  const menuItems = [
    { href: '/hesabim', label: 'Hesap Bilgilerim', icon: User },
    { href: '/hesabim/siparislerim', label: 'Siparişlerim', icon: Package, active: true },
    { href: '/hesabim/adreslerim', label: 'Adreslerim', icon: MapPin },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="bg-gradient-to-br from-accent via-accent/90 to-accent-strong py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Siparişlerim</h1>
            <p className="text-white/80">Tüm siparişlerinizi buradan takip edebilirsiniz</p>
          </div>
        </div>
      </section>

      <section className="py-12">
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
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        item.active 
                          ? 'bg-accent/10 text-accent' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight size={16} className="ml-auto" />
                    </Link>
                  ))}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full mt-2"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Çıkış Yap</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingBag size={48} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz siparişiniz yok</h3>
                    <p className="text-gray-500 mb-6">İlk siparişinizi vermek için alışverişe başlayın!</p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center space-x-2 bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      <span>Alışverişe Başla</span>
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Siparişleriniz ({orders.length})</h2>
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-5 hover:border-accent/50 transition-colors cursor-pointer" onClick={() => router.push('/hesabim/siparislerim/' + order.orderId)}>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Sipariş No</p>
                            <p className="font-semibold text-gray-900">{order.orderId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Tarih</p>
                            <p className="font-medium text-gray-700">
                              {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {/* Ürün Önizleme */}
                        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                          {order.items.slice(0, 4).map((item: any, idx: number) => (
                            <div key={idx} className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {item.image && item.image !== 'null' && (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-gray-500 text-sm font-medium">+{order.items.length - 4}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            {order.status === 'processing' && (
                              <span className="flex items-center text-amber-600 text-sm">
                                <Clock size={16} className="mr-1" />
                                Hazırlanıyor
                              </span>
                            )}
                            {order.status === 'shipped' && (
                              <span className="flex items-center text-blue-600 text-sm">
                                <Truck size={16} className="mr-1" />
                                Kargoda
                              </span>
                            )}
                            {order.status === 'delivered' && (
                              <span className="flex items-center text-green-600 text-sm">
                                <CheckCircle size={16} className="mr-1" />
                                Teslim Edildi
                              </span>
                            )}
                            {order.status === 'cancelled' && (
                              <span className="flex items-center text-red-600 text-sm">
                                <XCircle size={16} className="mr-1" />
                                İptal Edildi
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-bold text-accent">₺{order.total.toFixed(2)}</span>
                            <Link
                              href={'/hesabim/siparislerim/' + order.orderId}
                              className="flex items-center gap-1 px-4 py-2 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Detayı Gör <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
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

