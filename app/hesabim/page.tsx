'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { User, Package, MapPin, LogOut, ChevronRight, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

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

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          setEditForm(f => ({
            ...f,
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            phone: data.user.phone || '',
          }))

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

  const handleSave = async () => {
    setSaveMsg(null)

    // Şifre değişikliği validasyonu
    if (editForm.newPassword) {
      if (editForm.newPassword.length < 8) {
        setSaveMsg({ type: 'error', text: 'Yeni şifre en az 8 karakter olmalıdır.' })
        return
      }
      if (editForm.newPassword !== editForm.confirmPassword) {
        setSaveMsg({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' })
        return
      }
      if (!editForm.currentPassword) {
        setSaveMsg({ type: 'error', text: 'Mevcut şifrenizi girmelisiniz.' })
        return
      }
    }

    setSaving(true)
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          phone: editForm.phone.trim(),
          currentPassword: editForm.currentPassword || undefined,
          newPassword: editForm.newPassword || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSaveMsg({ type: 'success', text: 'Hesap bilgileriniz başarıyla güncellendi! Onay e-postası gönderildi.' })
        // Update local user state
        setUser(prev => prev ? {
          ...prev,
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          phone: editForm.phone.trim(),
        } : prev)
        // Clear password fields
        setEditForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }))
      } else {
        setSaveMsg({ type: 'error', text: data.error || 'Bir hata oluştu.' })
      }
    } catch {
      setSaveMsg({ type: 'error', text: 'Sunucuya bağlanılamadı.' })
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
            <div className="lg:col-span-3 space-y-6">

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Link href="/hesabim/siparislerim" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
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

                <Link href="/hesabim/adreslerim" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
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

              {/* Edit Form */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                      activeTab === 'info'
                        ? 'text-accent border-b-2 border-accent bg-accent/5'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Kişisel Bilgiler
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                      activeTab === 'password'
                        ? 'text-accent border-b-2 border-accent bg-accent/5'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Şifre Değiştir
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === 'info' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad</label>
                          <input
                            type="text"
                            value={editForm.firstName}
                            onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-gray-900"
                            placeholder="Adınız"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Soyad</label>
                          <input
                            type="text"
                            value={editForm.lastName}
                            onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-gray-900"
                            placeholder="Soyadınız"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-2.5 border border-gray-100 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">E-posta adresi değiştirilemez.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-gray-900"
                          placeholder="05XX XXX XX XX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Üyelik Tarihi</label>
                        <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-600 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'password' && (
                    <div className="space-y-5 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mevcut Şifre</label>
                        <div className="relative">
                          <input
                            type={showCurrentPw ? 'text' : 'password'}
                            value={editForm.currentPassword}
                            onChange={e => setEditForm(f => ({ ...f, currentPassword: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-gray-900 pr-12"
                            placeholder="Mevcut şifreniz"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni Şifre</label>
                        <div className="relative">
                          <input
                            type={showNewPw ? 'text' : 'password'}
                            value={editForm.newPassword}
                            onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-gray-900 pr-12"
                            placeholder="En az 8 karakter"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni Şifre (Tekrar)</label>
                        <div className="relative">
                          <input
                            type={showConfirmPw ? 'text' : 'password'}
                            value={editForm.confirmPassword}
                            onChange={e => setEditForm(f => ({ ...f, confirmPassword: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-gray-900 pr-12"
                            placeholder="Yeni şifreyi tekrar girin"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success / Error message */}
                  {saveMsg && (
                    <div className={`mt-4 flex items-start gap-3 p-4 rounded-lg ${
                      saveMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {saveMsg.type === 'success'
                        ? <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                        : <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                      }
                      <p className="text-sm font-medium">{saveMsg.text}</p>
                    </div>
                  )}

                  {/* Save button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-8 py-2.5 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : 'Değişiklikleri Kaydet'}
                    </button>
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
