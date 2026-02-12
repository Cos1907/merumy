'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { User, Package, MapPin, Ticket, LogOut, ChevronRight, Gift } from 'lucide-react'

export default function KuponlarimPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
        } else {
          router.push('/login?next=/hesabim/kuponlarim')
        }
      } catch {
        router.push('/login?next=/hesabim/kuponlarim')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
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
    { href: '/hesabim/siparislerim', label: 'Siparişlerim', icon: Package },
    { href: '/hesabim/adreslerim', label: 'Adreslerim', icon: MapPin },
    { href: '/hesabim/kuponlarim', label: 'Kuponlarım', icon: Ticket, active: true },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="bg-gradient-to-br from-accent via-accent/90 to-accent-strong py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Kuponlarım</h1>
            <p className="text-white/80">İndirim kuponlarınızı buradan kullanabilirsiniz</p>
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
                {/* Welcome Coupon */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktif Kuponlarınız</h3>
                  
                  <div className="bg-gradient-to-r from-accent to-accent/80 rounded-xl p-6 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/10 rounded-full -mb-10"></div>
                    
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-2">
                        <Gift size={24} />
                        <span className="text-sm font-medium uppercase tracking-wide">Hoş Geldin Kuponu</span>
                      </div>
                      <p className="text-3xl font-bold mb-1">%10 İNDİRİM</p>
                      <p className="text-sm text-white/80 mb-4">İlk alışverişinizde geçerli</p>
                      
                      <div className="bg-white/20 rounded-lg px-4 py-2 inline-block">
                        <span className="font-mono font-bold tracking-widest">HOSGELDIN10</span>
                      </div>
                      
                      <p className="text-xs text-white/60 mt-4">
                        * Minimum 200 TL alışverişte geçerlidir. 31.12.2026 tarihine kadar kullanılabilir.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Other Coupons */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Diğer Kuponlar</h3>
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <Ticket size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Başka aktif kuponunuz bulunmamaktadır.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}


