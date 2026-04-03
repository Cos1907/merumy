'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: number
  slug: string
  barcode: string
  sku: string
  name: string
  description: string
  price: number
  comparePrice: number
  stock: number
  stockStatus: string
  isActive: boolean
  isFeatured: boolean
  brand: string
  category: string
  image: string
}

interface HeroSlide {
  id: number
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  desktopImage: string
  mobileImage: string
  sortOrder: number
  isActive: boolean
}

interface DiscountCode {
  id: number
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderAmount: number | null
  maxDiscountAmount: number | null
  brandId: number | null
  brandName: string | null
  usageLimit: number | null
  usageCount: number
  userEmail: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

interface Order {
  id: string
  orderId: string
  dekontId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: any[]
  subtotal: number
  shipping: number
  total: number
  address: string
  status: string
  createdAt: string
  adminNotes?: string
}

interface Brand {
  id: number
  name: string
  slug: string
  logo_url: string
}

const CATEGORIES = [
  'Cilt Bakımı', 'Saç Bakımı', 'Makyaj', 'Kişisel Bakım', 'Mask Bar', 'Bebek ve Çocuk Bakımı'
]

const STATUS_LABELS: Record<string, string> = {
  processing: 'Hazırlanıyor',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
  pending: 'Beklemede',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('orders')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Products
  const [products, setProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [productPage, setProductPage] = useState(1)
  const [productTotal, setProductTotal] = useState(0)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState<Partial<Product>>({})
  const [productImages, setProductImages] = useState<any[]>([])
  const [imageUploading, setImageUploading] = useState(false)

  // Hero
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [heroForm, setHeroForm] = useState<Partial<HeroSlide>>({})
  const [heroUploadingDesktop, setHeroUploadingDesktop] = useState(false)
  const [heroUploadingMobile, setHeroUploadingMobile] = useState(false)

  // Discount Codes
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [discountForm, setDiscountForm] = useState<Partial<DiscountCode>>({ type: 'percentage', isActive: true })
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null)

  // Orders
  const [orders, setOrders] = useState<Order[]>([])
  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Site Settings
  const [siteSettings, setSiteSettings] = useState({
    topbarEnabled: true,
    topbarText: 'AÇILIŞA ÖZEL %30 İNDİRİM',
    topbarBgColor: '#92D0AA',
    topbarTextColor: '#ffffff',
  })

  // Brands for dropdown
  const [brands, setBrands] = useState<Brand[]>([])

  const desktopFileRef = useRef<HTMLInputElement>(null)
  const mobileFileRef = useRef<HTMLInputElement>(null)
  const productImageRef = useRef<HTMLInputElement>(null)

  // ─── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!loading) {
      if (activeTab === 'products') fetchProducts()
      else if (activeTab === 'hero') fetchHeroSlides()
      else if (activeTab === 'discount-codes') { fetchDiscountCodes(); fetchBrands() }
      else if (activeTab === 'orders') fetchOrders()
      else if (activeTab === 'settings') fetchSiteSettings()
    }
  }, [activeTab, loading])

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin/auth/me', { cache: 'no-store' })
      if (!res.ok) {
        router.push('/admin/login')
        return
      }
    } catch {
      router.push('/admin/login')
      return
    }
    setLoading(false)
    fetchOrders() // default tab
  }

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ─── Brands ─────────────────────────────────────────────────────────────────
  async function fetchBrands() {
    try {
      const res = await fetch('/api/brands')
      const data = await res.json()
      setBrands(data.brands || [])
    } catch {
      // ignore
    }
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────
  async function fetchOrders() {
    try {
      const params = new URLSearchParams()
      if (orderFilter) params.set('status', orderFilter)
      if (orderSearch) params.set('search', orderSearch)
      const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setOrders(data.orders || [])
    } catch {
      setOrders([])
    }
  }

  useEffect(() => {
    if (activeTab === 'orders' && !loading) fetchOrders()
  }, [orderFilter, orderSearch])

  async function updateOrderStatus(orderId: string, status: string, adminNotes?: string) {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, adminNotes }),
      })
      if (res.ok) {
        showToast('Sipariş güncellendi')
        fetchOrders()
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status } : null)
        }
      }
    } catch {
      showToast('Hata oluştu', 'error')
    }
  }

  // ─── Products ───────────────────────────────────────────────────────────────
  async function fetchProducts() {
    try {
      const params = new URLSearchParams({ page: String(productPage), limit: '20' })
      if (productSearch) params.set('search', productSearch)
      const res = await fetch(`/api/admin/products?${params.toString()}`, { cache: 'no-store' })
      const data = await res.json()
      setProducts(data.products || [])
      setProductTotal(data.pagination?.total || 0)
    } catch {
      setProducts([])
    }
  }

  useEffect(() => {
    if (activeTab === 'products' && !loading) fetchProducts()
  }, [productSearch, productPage])

  async function fetchProductImages(productId: number) {
    try {
      const res = await fetch(`/api/admin/product-images?productId=${productId}`)
      const data = await res.json()
      setProductImages(data.images || [])
    } catch {
      setProductImages([])
    }
  }

  async function saveProduct() {
    try {
      const method = editingProduct ? 'PUT' : 'POST'
      const body = editingProduct ? { ...productForm, id: editingProduct.id } : productForm
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        showToast(editingProduct ? 'Ürün güncellendi' : 'Ürün oluşturuldu')
        setEditingProduct(null)
        setProductForm({})
        setProductImages([])
        fetchProducts()
      } else {
        showToast('Kayıt hatası', 'error')
      }
    } catch {
      showToast('Hata oluştu', 'error')
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    try {
      await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
      showToast('Ürün silindi')
      fetchProducts()
    } catch {
      showToast('Silme hatası', 'error')
    }
  }

  async function uploadProductImage(file: File, isPrimary: boolean) {
    if (!editingProduct) return
    setImageUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('productId', String(editingProduct.id))
      fd.append('isPrimary', String(isPrimary))
      const res = await fetch('/api/admin/product-images', { method: 'POST', body: fd })
      if (res.ok) {
        showToast('Görsel yüklendi')
        fetchProductImages(editingProduct.id)
      } else {
        showToast('Yükleme hatası', 'error')
      }
    } catch {
      showToast('Hata', 'error')
    } finally {
      setImageUploading(false)
    }
  }

  async function setPrimaryImage(imageId: number) {
    if (!editingProduct) return
    try {
      await fetch('/api/admin/product-images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, productId: editingProduct.id }),
      })
      showToast('Ana görsel güncellendi')
      fetchProductImages(editingProduct.id)
    } catch {
      showToast('Hata', 'error')
    }
  }

  async function deleteProductImage(imageId: number) {
    try {
      await fetch(`/api/admin/product-images?id=${imageId}`, { method: 'DELETE' })
      showToast('Görsel silindi')
      if (editingProduct) fetchProductImages(editingProduct.id)
    } catch {
      showToast('Hata', 'error')
    }
  }

  // ─── Hero ────────────────────────────────────────────────────────────────────
  async function fetchHeroSlides() {
    try {
      const res = await fetch('/api/admin/hero-slides', { cache: 'no-store' })
      const data = await res.json()
      setHeroSlides(data.slides || [])
    } catch {
      setHeroSlides([])
    }
  }

  async function uploadHeroImage(file: File, type: 'desktop' | 'mobile') {
    if (type === 'desktop') setHeroUploadingDesktop(true)
    else setHeroUploadingMobile(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', type)
      const res = await fetch('/api/admin/hero-slides', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        if (type === 'desktop') setHeroForm((prev) => ({ ...prev, desktopImage: data.url }))
        else setHeroForm((prev) => ({ ...prev, mobileImage: data.url }))
        showToast('Görsel yüklendi')
      } else {
        showToast('Yükleme hatası', 'error')
      }
    } catch {
      showToast('Hata', 'error')
    } finally {
      if (type === 'desktop') setHeroUploadingDesktop(false)
      else setHeroUploadingMobile(false)
    }
  }

  async function saveHeroSlide() {
    try {
      const body = editingSlide ? { ...heroForm, id: editingSlide.id } : heroForm
      const res = await fetch('/api/admin/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        showToast(editingSlide ? 'Slide güncellendi' : 'Slide oluşturuldu')
        setEditingSlide(null)
        setHeroForm({})
        fetchHeroSlides()
      } else {
        showToast('Kayıt hatası', 'error')
      }
    } catch {
      showToast('Hata', 'error')
    }
  }

  async function deleteHeroSlide(id: number) {
    if (!confirm('Bu slide\'ı silmek istiyor musunuz?')) return
    try {
      await fetch(`/api/admin/hero-slides?id=${id}`, { method: 'DELETE' })
      showToast('Slide silindi')
      fetchHeroSlides()
    } catch {
      showToast('Hata', 'error')
    }
  }

  // ─── Discount Codes ──────────────────────────────────────────────────────────
  async function fetchDiscountCodes() {
    try {
      const res = await fetch('/api/admin/discount-codes', { cache: 'no-store' })
      const data = await res.json()
      setDiscountCodes(data.codes || [])
    } catch {
      setDiscountCodes([])
    }
  }

  async function saveDiscountCode() {
    try {
      const method = editingCode ? 'PUT' : 'POST'
      const body = editingCode ? { ...discountForm, id: editingCode.id } : discountForm
      const res = await fetch('/api/admin/discount-codes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(editingCode ? 'Kod güncellendi' : 'Kod oluşturuldu')
        setEditingCode(null)
        setDiscountForm({ type: 'percentage', isActive: true })
        fetchDiscountCodes()
      } else {
        showToast(data.error || 'Kayıt hatası', 'error')
      }
    } catch {
      showToast('Hata', 'error')
    }
  }

  async function deleteDiscountCode(id: number) {
    if (!confirm('Bu kodu silmek istiyor musunuz?')) return
    try {
      await fetch(`/api/admin/discount-codes?id=${id}`, { method: 'DELETE' })
      showToast('Kod silindi')
      fetchDiscountCodes()
    } catch {
      showToast('Hata', 'error')
    }
  }

  // ─── Site Settings ───────────────────────────────────────────────────────────
  async function fetchSiteSettings() {
    try {
      const res = await fetch('/api/admin/site-settings', { cache: 'no-store' })
      const data = await res.json()
      setSiteSettings((prev) => ({ ...prev, ...data }))
    } catch {
      // ignore
    }
  }

  async function saveSiteSettings() {
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      })
      if (res.ok) {
        showToast('Ayarlar kaydedildi')
      } else {
        showToast('Kayıt hatası', 'error')
      }
    } catch {
      showToast('Hata', 'error')
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => {})
    router.push('/admin/login')
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#92D0AA] border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'orders', label: '📦 Siparişler' },
    { id: 'products', label: '🛒 Ürünler' },
    { id: 'hero', label: '🎨 Hero Yönetimi' },
    { id: 'discount-codes', label: '🏷️ İndirim Kodları' },
    { id: 'settings', label: '⚙️ Site Ayarları' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${
            toast.type === 'success' ? 'bg-[#92D0AA]' : 'bg-red-500'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <Image src="/logo.svg" alt="Merumy" width={120} height={40} className="h-8 w-auto" />
          <p className="text-xs text-gray-500 mt-1">Yönetim Paneli</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#92D0AA]/15 text-[#92D0AA]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            🚪 Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">

          {/* ── ORDERS ────────────────────────────────────── */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">📦 Siparişler</h1>
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2 bg-[#92D0AA] text-white rounded-lg text-sm hover:bg-[#7abb96]"
                >
                  Yenile
                </button>
              </div>

              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Sipariş no, müşteri ara..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                />
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  className="px-4 py-2 border rounded-xl text-sm focus:outline-none"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="processing">Hazırlanıyor</option>
                  <option value="shipped">Kargoda</option>
                  <option value="delivered">Teslim Edildi</option>
                  <option value="cancelled">İptal</option>
                </select>
              </div>

              {selectedOrder ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-[#92D0AA] hover:underline text-sm"
                    >
                      ← Geri
                    </button>
                    <h2 className="text-lg font-bold">Sipariş Detayı: {selectedOrder.orderId}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Müşteri</p>
                      <p className="font-semibold">{selectedOrder.customerName}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customerEmail}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sipariş Bilgisi</p>
                      <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}</p>
                      <p className="text-sm text-gray-600">Dekont: {selectedOrder.dekontId || '-'}</p>
                      <p className="text-sm text-gray-600">Toplam: ₺{selectedOrder.total?.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Adres</p>
                    <p className="text-sm bg-gray-50 rounded-lg p-3">{selectedOrder.address}</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Ürünler</p>
                    <div className="space-y-3">
                      {(selectedOrder.items || []).map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.brand}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">x{item.quantity}</p>
                            <p className="text-sm text-[#92D0AA]">₺{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      defaultValue={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.orderId, e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="processing">Hazırlanıyor</option>
                      <option value="shipped">Kargoda</option>
                      <option value="delivered">Teslim Edildi</option>
                      <option value="cancelled">İptal</option>
                    </select>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-600">Sipariş No</th>
                        <th className="text-left p-4 font-semibold text-gray-600">Müşteri</th>
                        <th className="text-left p-4 font-semibold text-gray-600">Tarih</th>
                        <th className="text-left p-4 font-semibold text-gray-600">Toplam</th>
                        <th className="text-left p-4 font-semibold text-gray-600">Durum</th>
                        <th className="text-left p-4 font-semibold text-gray-600">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-gray-400">
                            Henüz sipariş yok
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-mono text-xs">{order.orderId}</td>
                            <td className="p-4">
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-xs text-gray-500">{order.customerEmail}</p>
                            </td>
                            <td className="p-4 text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="p-4 font-semibold text-[#92D0AA]">
                              ₺{order.total?.toFixed(2)}
                            </td>
                            <td className="p-4">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                                className="text-xs px-2 py-1 border rounded-lg"
                              >
                                <option value="processing">Hazırlanıyor</option>
                                <option value="shipped">Kargoda</option>
                                <option value="delivered">Teslim Edildi</option>
                                <option value="cancelled">İptal</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-[#92D0AA] hover:underline text-xs"
                              >
                                Detay
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS ──────────────────────────────────── */}
          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">🛒 Ürünler</h1>
                <button
                  onClick={() => {
                    setEditingProduct({ id: 0 } as Product)
                    setProductForm({ isActive: true, isFeatured: false })
                    setProductImages([])
                  }}
                  className="px-4 py-2 bg-[#92D0AA] text-white rounded-xl text-sm hover:bg-[#7abb96]"
                >
                  + Yeni Ürün
                </button>
              </div>

              {editingProduct ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => { setEditingProduct(null); setProductForm({}); setProductImages([]) }}
                      className="text-[#92D0AA] hover:underline text-sm"
                    >
                      ← Geri
                    </button>
                    <h2 className="text-lg font-bold">{editingProduct.id ? 'Ürün Düzenle' : 'Yeni Ürün'}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı *</label>
                      <input
                        type="text"
                        value={productForm.name || ''}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Barkod</label>
                      <input
                        type="text"
                        value={productForm.barcode || ''}
                        onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺) *</label>
                      <input
                        type="number"
                        value={productForm.price || ''}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Karşılaştırma Fiyatı (₺)</label>
                      <input
                        type="number"
                        value={productForm.comparePrice || ''}
                        onChange={(e) => setProductForm({ ...productForm, comparePrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                      <input
                        type="number"
                        value={productForm.stock || ''}
                        onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                      <select
                        value={productForm.category || ''}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none"
                      >
                        <option value="">Seçin</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                      <textarea
                        value={productForm.description || ''}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={productForm.isActive ?? true}
                          onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                          className="rounded"
                        />
                        Aktif
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={productForm.isFeatured ?? false}
                          onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                          className="rounded"
                        />
                        Öne Çıkan
                      </label>
                    </div>
                  </div>

                  {/* Product Image Gallery */}
                  {editingProduct.id > 0 && (
                    <div className="border-t pt-6 mt-2">
                      <h3 className="font-semibold text-gray-800 mb-4">📷 Ürün Görselleri</h3>

                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                        {productImages.map((img) => (
                          <div key={img.id} className="relative group">
                            <img
                              src={img.image_url}
                              alt=""
                              className={`w-full aspect-square object-cover rounded-xl border-2 ${img.is_primary ? 'border-[#92D0AA]' : 'border-gray-200'}`}
                              onError={(e) => { e.currentTarget.src = '/gorselsizurun.jpg' }}
                            />
                            {img.is_primary && (
                              <span className="absolute top-1 left-1 bg-[#92D0AA] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                Ana
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1">
                              {!img.is_primary && (
                                <button
                                  onClick={() => setPrimaryImage(img.id)}
                                  className="text-[10px] bg-white text-gray-800 px-2 py-1 rounded-lg"
                                >
                                  Ana
                                </button>
                              )}
                              <button
                                onClick={() => deleteProductImage(img.id)}
                                className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg"
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Upload button */}
                        <button
                          onClick={() => productImageRef.current?.click()}
                          className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-[#92D0AA] flex items-center justify-center text-gray-400 hover:text-[#92D0AA] transition-colors"
                        >
                          {imageUploading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#92D0AA] border-t-transparent" />
                          ) : (
                            <span className="text-2xl">+</span>
                          )}
                        </button>
                      </div>

                      <input
                        ref={productImageRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const isPrimary = productImages.length === 0
                            uploadProductImage(file, isPrimary)
                          }
                          e.target.value = ''
                        }}
                      />
                      <p className="text-xs text-gray-500">İlk yüklenen görsel otomatik ana görsel olur. Üstüne tıklayarak ana görseli değiştirebilirsiniz.</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={saveProduct}
                      className="px-6 py-2 bg-[#92D0AA] text-white rounded-xl text-sm hover:bg-[#7abb96]"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => { setEditingProduct(null); setProductForm({}); setProductImages([]) }}
                      className="px-6 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Ürün adı, barkod ara..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                    />
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-semibold text-gray-600">Görsel</th>
                          <th className="text-left p-4 font-semibold text-gray-600">Ürün</th>
                          <th className="text-left p-4 font-semibold text-gray-600">Fiyat</th>
                          <th className="text-left p-4 font-semibold text-gray-600">Stok</th>
                          <th className="text-left p-4 font-semibold text-gray-600">Durum</th>
                          <th className="text-left p-4 font-semibold text-gray-600">İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-gray-400">Ürün bulunamadı</td>
                          </tr>
                        ) : (
                          products.map((p) => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                              <td className="p-4">
                                <img
                                  src={p.image || '/gorselsizurun.jpg'}
                                  alt={p.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                  onError={(e) => { e.currentTarget.src = '/gorselsizurun.jpg' }}
                                />
                              </td>
                              <td className="p-4">
                                <p className="font-medium text-gray-900">{p.name}</p>
                                <p className="text-xs text-gray-500">{p.brand} • {p.category}</p>
                                <p className="text-xs text-gray-400 font-mono">{p.barcode}</p>
                              </td>
                              <td className="p-4">
                                <p className="font-semibold text-[#92D0AA]">₺{p.price}</p>
                                {p.comparePrice > 0 && (
                                  <p className="text-xs line-through text-gray-400">₺{p.comparePrice}</p>
                                )}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  p.stockStatus === 'out_of_stock' ? 'bg-red-100 text-red-600' :
                                  p.stockStatus === 'low_stock' ? 'bg-amber-100 text-amber-600' :
                                  'bg-green-100 text-green-600'
                                }`}>
                                  {p.stock} adet
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                  {p.isActive ? 'Aktif' : 'Pasif'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p)
                                      setProductForm({ ...p })
                                      fetchProductImages(p.id)
                                    }}
                                    className="text-[#92D0AA] hover:underline text-xs"
                                  >
                                    Düzenle
                                  </button>
                                  <button
                                    onClick={() => deleteProduct(p.id)}
                                    className="text-red-500 hover:underline text-xs"
                                  >
                                    Sil
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {productTotal > 20 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <button
                        onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                        disabled={productPage === 1}
                        className="px-4 py-2 border rounded-xl text-sm disabled:opacity-40"
                      >
                        ←
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-600">
                        Sayfa {productPage} / {Math.ceil(productTotal / 20)}
                      </span>
                      <button
                        onClick={() => setProductPage((p) => p + 1)}
                        disabled={productPage >= Math.ceil(productTotal / 20)}
                        className="px-4 py-2 border rounded-xl text-sm disabled:opacity-40"
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── HERO ──────────────────────────────────────── */}
          {activeTab === 'hero' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">🎨 Hero Yönetimi</h1>
                <button
                  onClick={() => { setEditingSlide({ id: 0 } as HeroSlide); setHeroForm({ isActive: true, sortOrder: heroSlides.length }) }}
                  className="px-4 py-2 bg-[#92D0AA] text-white rounded-xl text-sm hover:bg-[#7abb96]"
                >
                  + Yeni Slide
                </button>
              </div>

              {editingSlide ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => { setEditingSlide(null); setHeroForm({}) }} className="text-[#92D0AA] hover:underline text-sm">← Geri</button>
                    <h2 className="text-lg font-bold">{editingSlide.id ? 'Slide Düzenle' : 'Yeni Slide'}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                      <input
                        type="text"
                        value={heroForm.title || ''}
                        onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alt Başlık</label>
                      <input
                        type="text"
                        value={heroForm.subtitle || ''}
                        onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buton Metni</label>
                      <input
                        type="text"
                        value={heroForm.buttonText || ''}
                        onChange={(e) => setHeroForm({ ...heroForm, buttonText: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buton Linki</label>
                      <input
                        type="text"
                        value={heroForm.buttonLink || ''}
                        onChange={(e) => setHeroForm({ ...heroForm, buttonLink: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sıra</label>
                      <input
                        type="number"
                        value={heroForm.sortOrder ?? 0}
                        onChange={(e) => setHeroForm({ ...heroForm, sortOrder: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={heroForm.isActive ?? true}
                          onChange={(e) => setHeroForm({ ...heroForm, isActive: e.target.checked })}
                          className="rounded"
                        />
                        Aktif
                      </label>
                    </div>
                  </div>

                  {/* Desktop Image */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">🖥️ Masaüstü Görseli</label>
                    <div className="flex items-start gap-4">
                      {heroForm.desktopImage ? (
                        <div className="relative">
                          <img
                            src={heroForm.desktopImage}
                            alt="Desktop"
                            className="h-32 w-56 object-cover rounded-xl border border-gray-200"
                            onError={(e) => { e.currentTarget.src = '/gorselsizurun.jpg' }}
                          />
                          <button
                            onClick={() => setHeroForm({ ...heroForm, desktopImage: '' })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="h-32 w-56 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                          Görsel yok
                        </div>
                      )}
                      <div className="space-y-2">
                        <button
                          onClick={() => desktopFileRef.current?.click()}
                          disabled={heroUploadingDesktop}
                          className="px-4 py-2 border border-[#92D0AA] text-[#92D0AA] rounded-xl text-sm hover:bg-[#92D0AA]/10 disabled:opacity-50"
                        >
                          {heroUploadingDesktop ? 'Yükleniyor...' : 'Görsel Yükle'}
                        </button>
                        <input
                          ref={desktopFileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) uploadHeroImage(f, 'desktop')
                            e.target.value = ''
                          }}
                        />
                        <input
                          type="text"
                          placeholder="veya URL girin"
                          value={heroForm.desktopImage || ''}
                          onChange={(e) => setHeroForm({ ...heroForm, desktopImage: e.target.value })}
                          className="px-3 py-2 border rounded-xl text-sm focus:outline-none w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Image */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">📱 Mobil Görseli</label>
                    <div className="flex items-start gap-4">
                      {heroForm.mobileImage ? (
                        <div className="relative">
                          <img
                            src={heroForm.mobileImage}
                            alt="Mobile"
                            className="h-32 w-20 object-cover rounded-xl border border-gray-200"
                            onError={(e) => { e.currentTarget.src = '/gorselsizurun.jpg' }}
                          />
                          <button
                            onClick={() => setHeroForm({ ...heroForm, mobileImage: '' })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="h-32 w-20 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                          Yok
                        </div>
                      )}
                      <div className="space-y-2">
                        <button
                          onClick={() => mobileFileRef.current?.click()}
                          disabled={heroUploadingMobile}
                          className="px-4 py-2 border border-[#92D0AA] text-[#92D0AA] rounded-xl text-sm hover:bg-[#92D0AA]/10 disabled:opacity-50"
                        >
                          {heroUploadingMobile ? 'Yükleniyor...' : 'Görsel Yükle'}
                        </button>
                        <input
                          ref={mobileFileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) uploadHeroImage(f, 'mobile')
                            e.target.value = ''
                          }}
                        />
                        <input
                          type="text"
                          placeholder="veya URL girin"
                          value={heroForm.mobileImage || ''}
                          onChange={(e) => setHeroForm({ ...heroForm, mobileImage: e.target.value })}
                          className="px-3 py-2 border rounded-xl text-sm focus:outline-none w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={saveHeroSlide} className="px-6 py-2 bg-[#92D0AA] text-white rounded-xl text-sm hover:bg-[#7abb96]">
                      Kaydet
                    </button>
                    <button onClick={() => { setEditingSlide(null); setHeroForm({}) }} className="px-6 py-2 border rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroSlides.length === 0 ? (
                    <p className="text-gray-400 col-span-3 text-center py-12">Hero slide bulunamadı</p>
                  ) : (
                    heroSlides.map((slide) => (
                      <div key={slide.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="relative h-36 bg-gray-100">
                          {slide.desktopImage ? (
                            <img
                              src={slide.desktopImage}
                              alt={slide.title || ''}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.src = '/gorselsizurun.jpg' }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">
                              Görsel yok
                            </div>
                          )}
                          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {slide.isActive ? 'Aktif' : 'Pasif'}
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="font-semibold text-gray-800 truncate">{slide.title || '(Başlıksız)'}</p>
                          <p className="text-sm text-gray-500 truncate">{slide.subtitle || '-'}</p>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => {
                                setEditingSlide(slide)
                                setHeroForm({
                                  title: slide.title,
                                  subtitle: slide.subtitle,
                                  buttonText: slide.buttonText,
                                  buttonLink: slide.buttonLink,
                                  desktopImage: slide.desktopImage,
                                  mobileImage: slide.mobileImage,
                                  sortOrder: slide.sortOrder,
                                  isActive: slide.isActive,
                                })
                              }}
                              className="flex-1 py-2 text-sm text-[#92D0AA] border border-[#92D0AA]/40 rounded-lg hover:bg-[#92D0AA]/10"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => deleteHeroSlide(slide.id)}
                              className="flex-1 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── DISCOUNT CODES ────────────────────────────── */}
          {activeTab === 'discount-codes' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">🏷️ İndirim Kodları</h1>

              {/* Create / Edit Form */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                <h2 className="font-semibold text-gray-800 mb-4">
                  {editingCode ? 'Kodu Düzenle' : 'Yeni İndirim Kodu'}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Kod *</label>
                    <input
                      type="text"
                      value={discountForm.code || ''}
                      onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                      placeholder="MERUMY30"
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tür *</label>
                    <select
                      value={discountForm.type || 'percentage'}
                      onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none"
                    >
                      <option value="percentage">Yüzde (%)</option>
                      <option value="fixed">Sabit (₺)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Değer *</label>
                    <input
                      type="number"
                      value={discountForm.value || ''}
                      onChange={(e) => setDiscountForm({ ...discountForm, value: Number(e.target.value) })}
                      placeholder={discountForm.type === 'percentage' ? '30' : '50'}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Min. Sipariş Tutarı (₺)</label>
                    <input
                      type="number"
                      value={discountForm.minOrderAmount || ''}
                      onChange={(e) => setDiscountForm({ ...discountForm, minOrderAmount: Number(e.target.value) || null })}
                      placeholder="0"
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Maks. İndirim (₺)</label>
                    <input
                      type="number"
                      value={discountForm.maxDiscountAmount || ''}
                      onChange={(e) => setDiscountForm({ ...discountForm, maxDiscountAmount: Number(e.target.value) || null })}
                      placeholder="Sınırsız"
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Markaya Özel (boş = tüm markalar)</label>
                    <select
                      value={discountForm.brandId || ''}
                      onChange={(e) => setDiscountForm({ ...discountForm, brandId: e.target.value ? Number(e.target.value) : null })}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none"
                    >
                      <option value="">Tüm Markalar</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Kullanım Limiti</label>
                    <input
                      type="number"
                      value={discountForm.usageLimit || ''}
                      onChange={(e) => setDiscountForm({ ...discountForm, usageLimit: Number(e.target.value) || null })}
                      placeholder="Sınırsız"
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Kullanıcı E-posta (opsiyonel)</label>
                    <input
                      type="email"
                      value={discountForm.userEmail || ''}
                      onChange={(e) => setDiscountForm({ ...discountForm, userEmail: e.target.value || null })}
                      placeholder="ornek@email.com"
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Son Geçerlilik Tarihi</label>
                    <input
                      type="date"
                      value={discountForm.expiresAt ? discountForm.expiresAt.split('T')[0] : ''}
                      onChange={(e) => setDiscountForm({ ...discountForm, expiresAt: e.target.value || null })}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm pb-2">
                      <input
                        type="checkbox"
                        checked={discountForm.isActive ?? true}
                        onChange={(e) => setDiscountForm({ ...discountForm, isActive: e.target.checked })}
                        className="rounded"
                      />
                      Aktif
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={saveDiscountCode}
                    className="px-6 py-2 bg-[#92D0AA] text-white rounded-xl text-sm hover:bg-[#7abb96]"
                  >
                    {editingCode ? 'Güncelle' : 'Oluştur'}
                  </button>
                  {editingCode && (
                    <button
                      onClick={() => { setEditingCode(null); setDiscountForm({ type: 'percentage', isActive: true }) }}
                      className="px-6 py-2 border rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                    >
                      İptal
                    </button>
                  )}
                </div>
              </div>

              {/* Codes List */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-600">Kod</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Tür / Değer</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Marka</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Kullanım</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Son Tarih</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Durum</th>
                      <th className="text-left p-4 font-semibold text-gray-600">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discountCodes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-400">İndirim kodu bulunamadı</td>
                      </tr>
                    ) : (
                      discountCodes.map((c) => (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-mono font-bold text-[#92D0AA]">{c.code}</td>
                          <td className="p-4">
                            {c.type === 'percentage' ? `%${c.value}` : `₺${c.value}`}
                            {c.minOrderAmount ? <span className="text-xs text-gray-400 block">Min: ₺{c.minOrderAmount}</span> : null}
                            {c.maxDiscountAmount ? <span className="text-xs text-gray-400 block">Max: ₺{c.maxDiscountAmount}</span> : null}
                          </td>
                          <td className="p-4 text-gray-600">{c.brandName || 'Tümü'}</td>
                          <td className="p-4 text-gray-600">
                            {c.usageCount || 0} / {c.usageLimit || '∞'}
                          </td>
                          <td className="p-4 text-gray-600">
                            {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('tr-TR') : '∞'}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {c.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingCode(c)
                                  setDiscountForm({
                                    code: c.code,
                                    type: c.type,
                                    value: c.value,
                                    minOrderAmount: c.minOrderAmount,
                                    maxDiscountAmount: c.maxDiscountAmount,
                                    brandId: c.brandId,
                                    usageLimit: c.usageLimit,
                                    userEmail: c.userEmail,
                                    expiresAt: c.expiresAt,
                                    isActive: c.isActive,
                                  })
                                }}
                                className="text-[#92D0AA] hover:underline text-xs"
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={() => deleteDiscountCode(c.id)}
                                className="text-red-500 hover:underline text-xs"
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SITE SETTINGS ─────────────────────────────── */}
          {activeTab === 'settings' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Site Ayarları</h1>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg">
                <h2 className="font-semibold text-gray-800 mb-4">Topbar Ayarları</h2>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={siteSettings.topbarEnabled}
                      onChange={(e) => setSiteSettings({ ...siteSettings, topbarEnabled: e.target.checked })}
                      className="rounded w-5 h-5"
                    />
                    <span className="text-sm font-medium">Topbar Aktif</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topbar Metni</label>
                    <input
                      type="text"
                      value={siteSettings.topbarText}
                      onChange={(e) => setSiteSettings({ ...siteSettings, topbarText: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Arka Plan Rengi</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={siteSettings.topbarBgColor}
                          onChange={(e) => setSiteSettings({ ...siteSettings, topbarBgColor: e.target.value })}
                          className="w-10 h-10 rounded-lg border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={siteSettings.topbarBgColor}
                          onChange={(e) => setSiteSettings({ ...siteSettings, topbarBgColor: e.target.value })}
                          className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Metin Rengi</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={siteSettings.topbarTextColor}
                          onChange={(e) => setSiteSettings({ ...siteSettings, topbarTextColor: e.target.value })}
                          className="w-10 h-10 rounded-lg border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={siteSettings.topbarTextColor}
                          onChange={(e) => setSiteSettings({ ...siteSettings, topbarTextColor: e.target.value })}
                          className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <div
                      className="py-2 px-4 text-center text-sm font-bold"
                      style={{ backgroundColor: siteSettings.topbarBgColor, color: siteSettings.topbarTextColor }}
                    >
                      {siteSettings.topbarText}
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveSiteSettings}
                  className="mt-6 px-6 py-2 bg-[#92D0AA] text-white rounded-xl text-sm hover:bg-[#7abb96]"
                >
                  Kaydet
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
