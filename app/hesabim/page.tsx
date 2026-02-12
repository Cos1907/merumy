'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { User, Package, MapPin, Settings, LogOut, ChevronRight } from 'lucide-react'

type UserData = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  createdAt: string
}

interface Stats {
  orderCount: number
  addressCount: number
}

export default function HesabimPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({ orderCount: 0, addressCount: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          
          // Sipariş sayısını al
          const ordersRes = await fetch('/api/orders', { cache: 'no-store' })
          const ordersData = await ordersRes.json()
          const orderCount = ordersData.orders?.length || 0
          
          // Adres sayısını localStorage'dan al
          const savedAddresses = localStorage.getItem(`addresses_${data.user.id}`)
          const addressCount = savedAddresses ? JSON.parse(savedAddresses).length : 0
          
          setStats({ orderCount, addressCount })
        } else {
          router.push('/login?next=/hesabim')
        }
      } catch {
        router.push('/login?next=/hesabim')
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
    { href: '/hesabim', label: 'Hesap Bilgilerim', icon: User, active: true },
    { href: '/hesabim/siparislerim', label: 'Siparişlerim', icon: Package },
    { href: '/hesabim/adreslerim', label: 'Adreslerim', icon: MapPin },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-accent via-accent/90 to-accent-strong py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Hesabım</h1>
            <p className="text-white/80">Hoş geldiniz, {user.firstName}!</p>
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Hesap Bilgilerim</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ad</label>
                    <p className="text-gray-900 font-medium">{user.firstName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Soyad</label>
                    <p className="text-gray-900 font-medium">{user.lastName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">E-posta</label>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Telefon</label>
                    <p className="text-gray-900 font-medium">{user.phone || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Üyelik Tarihi</label>
                    <p className="text-gray-900 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Link href="/hesabim/siparislerim" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <Package size={24} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.orderCount}</p>
                      <p className="text-sm text-gray-500">Sipariş</p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/hesabim/adreslerim" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <MapPin size={24} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.addressCount}</p>
                      <p className="text-sm text-gray-500">Adres</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

