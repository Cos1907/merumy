'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { User, Package, MapPin, LogOut, ChevronRight, Plus, X, Trash2, Edit2 } from 'lucide-react'

interface Address {
  id: string
  title: string
  fullName: string
  phone: string
  city: string
  district: string
  address: string
  postalCode: string
  isDefault: boolean
}

export default function AdreslerimPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    postalCode: '',
    isDefault: false
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          // Load addresses from localStorage
          const savedAddresses = localStorage.getItem(`addresses_${data.user.id}`)
          if (savedAddresses) {
            setAddresses(JSON.parse(savedAddresses))
          }
        } else {
          router.push('/login?next=/hesabim/adreslerim')
        }
      } catch {
        router.push('/login?next=/hesabim/adreslerim')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])

  const saveAddresses = (newAddresses: Address[]) => {
    if (user?.id) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(newAddresses))
      setAddresses(newAddresses)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingId) {
      // Update existing address
      const updated = addresses.map(addr => 
        addr.id === editingId 
          ? { ...formData, id: editingId, isDefault: formData.isDefault || addresses.length === 0 }
          : formData.isDefault ? { ...addr, isDefault: false } : addr
      )
      saveAddresses(updated)
    } else {
      // Add new address
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
        isDefault: formData.isDefault || addresses.length === 0
      }
      const updated = formData.isDefault 
        ? addresses.map(a => ({ ...a, isDefault: false })).concat(newAddress)
        : [...addresses, newAddress]
      saveAddresses(updated)
    }
    
    setShowForm(false)
    setEditingId(null)
    setFormData({ title: '', fullName: '', phone: '', city: '', district: '', address: '', postalCode: '', isDefault: false })
  }

  const handleEdit = (addr: Address) => {
    setFormData({
      title: addr.title,
      fullName: addr.fullName,
      phone: addr.phone,
      city: addr.city,
      district: addr.district,
      address: addr.address,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    const updated = addresses.filter(a => a.id !== id)
    // If deleted address was default, make first one default
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true
    }
    saveAddresses(updated)
  }

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }))
    saveAddresses(updated)
  }

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
    { href: '/hesabim/adreslerim', label: 'Adreslerim', icon: MapPin, active: true },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="bg-gradient-to-br from-accent via-accent/90 to-accent-strong py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Adreslerim</h1>
            <p className="text-white/80">Kayıtlı adreslerinizi yönetin</p>
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
                {/* Add Address Button */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Kayıtlı Adreslerim</h2>
                  <button
                    onClick={() => {
                      setShowForm(true)
                      setEditingId(null)
                      setFormData({ title: '', fullName: '', phone: '', city: '', district: '', address: '', postalCode: '', isDefault: false })
                    }}
                    className="inline-flex items-center space-x-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
                  >
                    <Plus size={18} />
                    <span>Yeni Adres Ekle</span>
                  </button>
                </div>

                {/* Address Form Modal */}
                {showForm && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center p-6 border-b">
                        <h3 className="text-lg font-semibold">{editingId ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={24} />
                        </button>
                      </div>
                      <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Adres Başlığı *</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Örn: Ev, İş"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="05XX XXX XX XX"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/30"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">İl *</label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              required
                              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/30"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">İlçe *</label>
                            <input
                              type="text"
                              value={formData.district}
                              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                              required
                              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/30"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Adres *</label>
                          <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/30"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
                          <input
                            type="text"
                            value={formData.postalCode}
                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/30"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                            className="w-4 h-4 text-accent rounded"
                          />
                          <label htmlFor="isDefault" className="text-sm text-gray-700">Varsayılan adres olarak ayarla</label>
                        </div>
                        <div className="flex space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                          >
                            İptal
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
                          >
                            {editingId ? 'Güncelle' : 'Kaydet'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Address List or Empty State */}
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MapPin size={48} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz kayıtlı adresiniz yok</h3>
                    <p className="text-gray-500 mb-6">Teslimat adresinizi ekleyerek daha hızlı alışveriş yapın!</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center space-x-2 bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      <Plus size={20} />
                      <span>Yeni Adres Ekle</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {addresses.map((addr) => (
                      <div 
                        key={addr.id} 
                        className={`relative border rounded-xl p-5 ${addr.isDefault ? 'border-accent bg-accent/5' : 'border-gray-200'}`}
                      >
                        {addr.isDefault && (
                          <span className="absolute top-3 right-3 text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded">
                            Varsayılan
                          </span>
                        )}
                        <div className="pr-20">
                          <h4 className="font-semibold text-gray-900">{addr.title}</h4>
                          <p className="text-gray-700 mt-1">{addr.fullName}</p>
                          <p className="text-gray-600 text-sm mt-2">{addr.address}</p>
                          <p className="text-gray-600 text-sm">{addr.district}, {addr.city} {addr.postalCode}</p>
                          <p className="text-gray-600 text-sm mt-1">{addr.phone}</p>
                        </div>
                        <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefault(addr.id)}
                              className="text-sm text-accent hover:underline"
                            >
                              Varsayılan Yap
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(addr)}
                            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                          >
                            <Edit2 size={14} />
                            <span>Düzenle</span>
                          </button>
                          <button
                            onClick={() => handleDelete(addr.id)}
                            className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                            <span>Sil</span>
                          </button>
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

