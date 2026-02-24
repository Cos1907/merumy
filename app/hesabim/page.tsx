'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { User, Package, MapPin, LogOut, ChevronRight, Save, Eye, EyeOff, CheckCircle } from 'lucide-react'

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
  
  // Form state
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          setFormData({
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            phone: data.user.phone?.replace('+90', '') || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
          
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    
    // Validasyonlar
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Ad ve soyad zorunludur')
      return
    }
    
    // Şifre değişikliği kontrolü
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setError('Mevcut şifrenizi girmelisiniz')
        return
      }
      if (formData.newPassword.length < 6) {
        setError('Yeni şifre en az 6 karakter olmalıdır')
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Yeni şifreler eşleşmiyor')
        return
      }
    }
    
    setSaving(true)
    
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone ? `+90${formData.phone.replace(/\D/g, '')}` : null,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSuccess(true)
        setUser(prev => prev ? {
          ...prev,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone ? `+90${formData.phone}` : prev.phone
        } : null)
        
        // Şifre alanlarını temizle
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
        
        setIsEditing(false)
        
        // 3 saniye sonra success mesajını kaldır
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError(data.error || 'Bir hata oluştu')
      }
    } catch {
      setError('Bağlantı hatası oluştu')
    } finally {
      setSaving(false)
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
              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="text-green-800 font-medium">Hesap bilgileriniz başarıyla güncellendi!</p>
                    <p className="text-green-600 text-sm">E-posta adresinize bilgilendirme maili gönderildi.</p>
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Hesap Bilgilerim</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-accent hover:text-accent/80 font-medium text-sm"
                    >
                      Düzenle
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ad *</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                          placeholder="Adınız"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Soyad *</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                          placeholder="Soyadınız"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-sm">
                            +90
                          </span>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                            placeholder="5XX XXX XXXX"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Şifre Değiştirme Bölümü */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Şifre Değiştir (İsteğe Bağlı)</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Şifre</label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              value={formData.currentPassword}
                              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre</label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={formData.newPassword}
                              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre (Tekrar)</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Butonlar */}
                    <div className="flex items-center gap-4 mt-6">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <Save size={18} />
                        )}
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false)
                          setError('')
                          setFormData({
                            firstName: user.firstName,
                            lastName: user.lastName,
                            phone: user.phone?.replace('+90', '') || '',
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          })
                        }}
                        className="px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </form>
                ) : (
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
                )}
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
