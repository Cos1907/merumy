'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CreditCard, Lock, ShieldCheck, AlertCircle, Loader2, ArrowLeft, Package, Truck, CheckCircle, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import Header from '../components/Header'
import Footer from '../components/Footer'

const TURKEY_PROVINCES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
  'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
  'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
  'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
  'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
  'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
  'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce',
]

interface SavedAddress {
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

interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const testMode = searchParams ? searchParams.get('test') === 'true' : false
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { items, cartTotal, cartSubtotal, discountFromOriginal, promoDiscount, freeShipping } = useCart()
  const [paymentStep, setPaymentStep] = useState(false)
  const paymentRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(140)
  const [stepError, setStepError] = useState<string | null>(null)
  
  // Kullanıcı ve kayıtlı adresler
  const [user, setUser] = useState<UserData | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [saveAddressChecked, setSaveAddressChecked] = useState(true)
  
  // Test modu için varsayılan ürün
  const testProduct = testMode ? {
    name: 'Test Ürünü',
    price: 100,
    image: '/images/products/product1.jpg'
  } : null
  
  // Form state
  const [formData, setFormData] = useState({
    // Kişisel bilgiler
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    province: '',
    district: '',
    addressName: '',
    address: '',
    // Kart bilgileri (example_code/odeme.js formatında)
    cardHolder: '',     // KK_Sahibi
    cardNumber: '',     // KK_No (16 hane)
    expiryMonth: '',    // KK_SK_Ay (2 hane: 01-12)
    expiryYear: '',     // KK_SK_Yil (2 hane: 26)
    cvv: ''             // KK_CVC (3 hane)
  })
  const installment = 1

  // Kullanıcı ve kayıtlı adresleri yükle
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Kullanıcı bilgilerini al
        const userRes = await fetch('/api/auth/me', { cache: 'no-store' })
        const userData = await userRes.json()
        
        if (userData.user) {
          setUser(userData.user)
          
          // Formu kullanıcı bilgileriyle doldur
          setFormData(prev => ({
            ...prev,
            firstName: userData.user.firstName || '',
            lastName: userData.user.lastName || '',
            email: userData.user.email || '',
            phone: userData.user.phone || ''
          }))
          
          // Kayıtlı adresleri al
          const addressRes = await fetch('/api/addresses', { cache: 'no-store' })
          const addressData = await addressRes.json()
          
          if (addressData.addresses && addressData.addresses.length > 0) {
            setSavedAddresses(addressData.addresses)
            
            // Varsayılan adresi seç
            const defaultAddress = addressData.addresses.find((a: SavedAddress) => a.isDefault)
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id)
              applyAddress(defaultAddress)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [])

  // Seçilen adresi forma uygula
  const applyAddress = (addr: SavedAddress) => {
    setFormData(prev => ({
      ...prev,
      firstName: addr.fullName.split(' ')[0] || prev.firstName,
      lastName: addr.fullName.split(' ').slice(1).join(' ') || prev.lastName,
      phone: addr.phone || prev.phone,
      province: addr.city || '',
      district: addr.district || '',
      addressName: addr.title || '',
      address: addr.address || ''
    }))
  }
  
  // Kayıtlı adres seçimi değiştiğinde
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    const addr = savedAddresses.find(a => a.id === addressId)
    if (addr) {
      applyAddress(addr)
    }
  }

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const headerContainer = document.querySelector('.fixed.top-0.left-0.right-0.z-50')
      if (headerContainer) setHeaderHeight((headerContainer as HTMLElement).clientHeight)
      else setHeaderHeight(140)
    }
    setTimeout(calculateHeaderHeight, 50)
    window.addEventListener('resize', calculateHeaderHeight)
    return () => window.removeEventListener('resize', calculateHeaderHeight)
  }, [])

  const shippingFee = freeShipping ? 0 : 80
  const checkoutTotal = testProduct ? testProduct.price : (cartTotal + shippingFee)
  const checkoutItems = testProduct ? [{ product: testProduct, quantity: 1 }] : items

  // Test kartı doldur (example_code/odeme.js'deki veriler)
  const fillTestCard = () => {
    setFormData({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      phone: '5462970111',
      province: 'İstanbul',
      district: 'Ataşehir',
      addressName: 'Ev',
      address: 'Test Adres Mah. No:1',
      cardHolder: 'John Doe',
      cardNumber: '5571135571135575',  // Test kart numarası
      expiryMonth: '12',
      expiryYear: '26',
      cvv: '000'
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Kart numarası - sadece rakam, 16 hane
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '').substring(0, 16)
      setFormData(prev => ({ ...prev, [name]: cleaned }))
      return
    }
    
    // CVV - sadece rakam, 3 hane
    if (name === 'cvv') {
      const cleaned = value.replace(/\D/g, '').substring(0, 3)
      setFormData(prev => ({ ...prev, [name]: cleaned }))
      return
    }
    
    // Son kullanma ayı - 2 hane
    if (name === 'expiryMonth') {
      let cleaned = value.replace(/\D/g, '').substring(0, 2)
      if (parseInt(cleaned) > 12) cleaned = '12'
      setFormData(prev => ({ ...prev, [name]: cleaned }))
      return
    }
    
    // Son kullanma yılı - 2 hane
    if (name === 'expiryYear') {
      const cleaned = value.replace(/\D/g, '').substring(0, 2)
      setFormData(prev => ({ ...prev, [name]: cleaned }))
      return
    }

    // Telefon - başında 0 olmadan
    if (name === 'phone') {
      let cleaned = value.replace(/\D/g, '')
      if (cleaned.startsWith('0')) cleaned = cleaned.substring(1)
      cleaned = cleaned.substring(0, 10)
      setFormData(prev => ({ ...prev, [name]: cleaned }))
      return
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Kart numarasını formatla (görüntüleme için)
  const formatCardNumber = (number: string) => {
    return number.replace(/(.{4})/g, '$1 ').trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setErrorMessage('')

    // Validasyonlar (example_code/odeme.js'deki model'e göre)
    if (formData.cardNumber.length !== 16) {
      setErrorMessage('Kart numarası 16 haneli olmalıdır')
      setProcessing(false)
      return
    }
    
    if (formData.cvv.length !== 3) {
      setErrorMessage('CVV 3 haneli olmalıdır')
      setProcessing(false)
      return
    }
    
    if (formData.expiryMonth.length !== 2 || formData.expiryYear.length !== 2) {
      setErrorMessage('Son kullanma tarihi formatı hatalı (AA/YY)')
      setProcessing(false)
      return
    }

    if (!formData.phone.match(/^[1-9][0-9]{9}$/)) {
      setErrorMessage('Telefon numarası 10 haneli olmalı ve 0 ile başlamamalı')
      setProcessing(false)
      return
    }

    try {
      // Kargo ücreti hesapla
      const shippingCost = checkoutTotal >= 1000 ? 0 : 80
      const finalTotal = checkoutTotal + shippingCost
      
      // Yeni adres kaydet (kullanıcı giriş yapmışsa ve checkbox işaretliyse)
      if (user && saveAddressChecked && selectedAddressId === null) {
        try {
          await fetch('/api/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.addressName,
              fullName: `${formData.firstName} ${formData.lastName}`.trim(),
              phone: formData.phone,
              city: formData.province,
              district: formData.district,
              address: formData.address,
              postalCode: '',
              isDefault: savedAddresses.length === 0
            })
          })
        } catch (e) {
          console.error('Failed to save address:', e)
        }
      }
      
      // Ödeme başlat API çağrısı
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardHolder: formData.cardHolder,
          cardNumber: formData.cardNumber,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          cvv: formData.cvv,
          phone: formData.phone,
          totalAmount: finalTotal,
          installment,
          // Müşteri bilgileri (mail için)
          userId: user?.id || '',
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          customerEmail: formData.email,
          customerPhone: formData.phone,
          address: `${formData.addressName}, ${formData.address}, ${formData.district}/${formData.province}`,
          items: checkoutItems.map((item: any) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            image: item.product.image || '',
            brand: item.product.brand || '',
            barcode: item.product.barcode || item.product.id || '',
          })),
          subtotal: checkoutTotal,
          shipping: shippingCost,
        })
      })

      const result = await response.json()

      if (result.success && result.htmlContent) {
        // Sipariş bilgisini kaydet (cart snapshot)
        let cartSnapshot = { items: checkoutItems, total: checkoutTotal }
        try {
          const cartRes = await fetch('/api/cart', { cache: 'no-store' })
          const cartData = await cartRes.json().catch(() => ({}))
          if (Array.isArray(cartData?.items)) {
            cartSnapshot = { items: cartData.items, total: Number(cartData.total || checkoutTotal) }
          }
        } catch {}

        localStorage.setItem('pending_order', JSON.stringify({
          siparisId: result.siparisId,
          items: cartSnapshot.items,
          total: cartSnapshot.total,
          customer: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            province: formData.province,
            district: formData.district,
            addressName: formData.addressName,
            address: formData.address,
          }
        }))

        // 3D Secure HTML'ini aç
        document.open()
        document.write(result.htmlContent)
        document.close()
      } else {
        setErrorMessage(result.error || 'Ödeme başlatılamadı')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setErrorMessage('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!testProduct && items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f7] px-4">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sepetiniz Boş</h2>
        <p className="text-gray-500 mb-6">Alışverişe başlamak için ürünlerimize göz atın.</p>
        <Link 
          href="/shop" 
          className="bg-accent text-white px-8 py-3 rounded-full font-medium hover:bg-accent/90 transition-colors"
        >
          Alışverişe Başla
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div style={{ marginTop: `${headerHeight}px` }} className="py-12">
        <div className="mx-[175px] max-2xl:mx-24 max-xl:mx-12 max-lg:mx-6 max-md:mx-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left */}
            <div>
              <form onSubmit={handleSubmit} id="checkout-form">
                {/* Kullanıcı Bilgisi Banner */}
                {user && (
                  <div className="mb-6 bg-[#92D0AA]/10 border border-[#92D0AA]/30 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#92D0AA] rounded-full flex items-center justify-center">
                      <User className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                )}

                <div className="mb-10">
                  <h2 className="text-4xl font-bold font-grift uppercase" style={{ color: '#92D0AA' }}>İLETİŞİM</h2>
                  <div className="mt-6 space-y-4">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border-2 border-[#92D0AA]/40 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      placeholder="Adınız & Soyadınız"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border-2 border-[#92D0AA]/40 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      placeholder="E-Posta Adresiniz"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border-2 border-[#92D0AA]/40 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      placeholder="Telefon Numaranız"
                    />
                  </div>
                </div>

                <div className="mb-10">
                  <h2 className="text-4xl font-bold font-grift uppercase" style={{ color: '#92D0AA' }}>TESLİMAT</h2>
                  
                  {/* Kayıtlı Adresler */}
                  {savedAddresses.length > 0 && (
                    <div className="mt-4 mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">Kayıtlı Adresleriniz:</p>
                      <div className="grid gap-3">
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => handleAddressSelect(addr.id)}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                              selectedAddressId === addr.id
                                ? 'border-[#92D0AA] bg-[#92D0AA]/5'
                                : 'border-gray-200 hover:border-[#92D0AA]/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedAddressId === addr.id ? 'border-[#92D0AA]' : 'border-gray-300'
                              }`}>
                                {selectedAddressId === addr.id && (
                                  <div className="w-3 h-3 rounded-full bg-[#92D0AA]"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-800">{addr.title}</span>
                                  {addr.isDefault && (
                                    <span className="text-xs bg-[#92D0AA]/20 text-[#92D0AA] px-2 py-0.5 rounded">Varsayılan</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{addr.fullName} - {addr.phone}</p>
                                <p className="text-sm text-gray-500">{addr.address}, {addr.district}/{addr.city}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div
                          onClick={() => {
                            setSelectedAddressId(null)
                            setFormData(prev => ({
                              ...prev,
                              province: '',
                              district: '',
                              addressName: '',
                              address: ''
                            }))
                          }}
                          className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all text-center ${
                            selectedAddressId === null
                              ? 'border-[#92D0AA] bg-[#92D0AA]/5'
                              : 'border-gray-200 hover:border-[#92D0AA]/50'
                          }`}
                        >
                          <span className="text-gray-600">+ Yeni Adres Ekle</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 space-y-4">
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border-2 border-[#92D0AA]/40 px-5 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                    >
                      <option value="" disabled>
                        İl
                      </option>
                      {TURKEY_PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border-2 border-[#92D0AA]/40 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      placeholder="İlçe"
                    />

                    <input
                      type="text"
                      name="addressName"
                      value={formData.addressName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border-2 border-[#92D0AA]/40 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      placeholder="Adres Adı"
                    />

                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border-2 border-[#92D0AA]/40 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/30"
                      placeholder="Adres"
                    />
                    
                    {/* Adres Kaydet Checkbox */}
                    {user && selectedAddressId === null && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          checked={saveAddressChecked}
                          onChange={(e) => setSaveAddressChecked(e.target.checked)}
                          className="w-4 h-4 text-[#92D0AA] rounded border-gray-300 focus:ring-[#92D0AA]"
                        />
                        <label htmlFor="saveAddress" className="text-sm text-gray-600">
                          Bu adresi hesabıma kaydet
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment fields (step 2) */}
                {paymentStep && (
                  <div ref={paymentRef} className="mt-10">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold font-grift uppercase" style={{ color: '#92D0AA' }}>
                        ÖDEME
                      </h2>
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#92D0AA' }}>
                        <ShieldCheck size={18} />
                        <span className="font-semibold">Güvenli Ödeme</span>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#92D0AA]/30 bg-[#92D0AA]/10 p-4">
                      <div className="flex items-start gap-3">
                        <Lock className="text-[#92D0AA]" size={20} />
                        <div className="text-sm text-gray-700">
                          <div className="font-semibold">Kart bilgileriniz kaydedilmez.</div>
                          <div className="mt-1">Bilgileriniz yalnızca ödeme işlemi için güvenli şekilde bankaya iletilir.</div>
                        </div>
                      </div>
                    </div>

                    {testMode && (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <div className="font-semibold text-amber-800">Test Modu Aktif</div>
                            <p className="text-amber-700 text-sm mt-1">Bu sistem test ortamında çalışmaktadır. Gerçek kart bilgisi girmeyin.</p>
                            <button
                              type="button"
                              onClick={fillTestCard}
                              className="mt-3 rounded-xl px-4 py-2 bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors"
                            >
                              Test Bilgilerini Doldur
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kart Üzerindeki İsim</label>
                        <input
                          type="text"
                          name="cardHolder"
                          value={formData.cardHolder}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all uppercase"
                          placeholder="AD SOYAD"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kart Numarası</label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            name="cardNumber"
                            value={formatCardNumber(formData.cardNumber)}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/\D/g, '').substring(0, 16)
                              setFormData(prev => ({ ...prev, cardNumber: cleaned }))
                            }}
                            required
                            className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all font-mono text-lg tracking-wider"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ay</label>
                          <input
                            type="text"
                            name="expiryMonth"
                            value={formData.expiryMonth}
                            onChange={handleChange}
                            required
                            maxLength={2}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-center font-mono"
                            placeholder="MM"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Yıl</label>
                          <input
                            type="text"
                            name="expiryYear"
                            value={formData.expiryYear}
                            onChange={handleChange}
                            required
                            maxLength={2}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-center font-mono"
                            placeholder="YY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                          <input
                            type="password"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            required
                            maxLength={3}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all text-center font-mono"
                            placeholder="•••"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right */}
            <div className="sticky top-28 h-fit">
              <div className="rounded-2xl border border-[#92D0AA]/25 bg-white p-6">
                <h2 className="text-3xl font-bold font-grift" style={{ color: '#92D0AA' }}>Sipariş Özeti</h2>
              
                {/* Ürünler */}
                <div className="space-y-4 max-h-64 overflow-y-auto mb-6 mt-6">
                  {checkoutItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                        {item.product.image && (
                          <img 
                            src={item.product.image} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 line-clamp-2 text-sm">{item.product.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">{item.quantity} adet</p>
                        <p className="font-semibold text-accent mt-1">₺{(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fiyat Detayı */}
                <div className="space-y-3 border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Ürünler</span>
                    <span>₺{(testProduct ? checkoutTotal : (cartSubtotal + discountFromOriginal)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>İndirim Kazancınız</span>
                    <span className="text-[#d9534f]">-₺{(testProduct ? 0 : discountFromOriginal).toFixed(2)}</span>
                  </div>
                  {promoDiscount > 0 && !testProduct && (
                    <div className="flex justify-between text-gray-600">
                      <span>Promosyon İndirimi</span>
                      <span className="text-[#d9534f]">-₺{promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Kargo Ücreti</span>
                    {checkoutTotal >= 1000 ? (
                      <span className="text-green-600 font-medium">Ücretsiz</span>
                    ) : (
                      <span>₺80.00</span>
                    )}
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-800 pt-3 border-t border-gray-100">
                    <span>Toplam</span>
                    <span className="text-accent">₺{(checkoutTotal + (checkoutTotal >= 1000 ? 0 : 80)).toFixed(2)}</span>
                  </div>
                </div>

                {/* Hata Mesajı */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                      <p className="text-red-700 text-sm">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {!paymentStep ? (
                  <button
                    type="button"
                    className="w-full text-white py-4 rounded-xl font-semibold transition-colors text-lg uppercase"
                    style={{ backgroundColor: '#92D0AA' }}
                    onClick={() => {
                      setStepError(null)
                      const missing: string[] = []
                      if (!formData.firstName.trim()) missing.push('Ad Soyad')
                      if (!formData.email.trim()) missing.push('E-posta')
                      if (!formData.phone.trim()) missing.push('Telefon')
                      if (!formData.province) missing.push('İl')
                      if (!formData.district.trim()) missing.push('İlçe')
                      if (!formData.addressName.trim()) missing.push('Adres Adı')
                      if (!formData.address.trim()) missing.push('Adres')

                      if (missing.length) {
                        setStepError(`Lütfen önce şu alanları doldurun: ${missing.join(', ')}`)
                        return
                      }

                      setPaymentStep(true)
                      setTimeout(() => {
                        paymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }, 50)
                    }}
                  >
                    ÖDEME ADIMINA GEÇ
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={processing}
                    className="w-full bg-accent text-white py-4 rounded-xl font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="animate-spin" size={22} />
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <Lock size={20} />
                        ÖDEMEYİ BAŞLAT
                      </>
                    )}
                  </button>
                )}

                {stepError && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {stepError}
                  </div>
                )}

                <p className="text-center text-xs text-gray-500 mt-4">
                  "Öde" butonuna tıklayarak{' '}
                  <Link href="/terms" className="text-accent hover:underline">Satış Sözleşmesi</Link>
                  'ni kabul etmiş olursunuz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
