'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Search, User, ShoppingBag, MapPin, ChevronDown, Package, MapPinned, Ticket, LogOut, UserCircle, Home, Grid3X3, X, Menu } from 'lucide-react'
import { categories, products, Product } from '../lib/products'
import { useCart } from '../context/CartContext'

// Türkçe karakterleri normalleştir
function normalizeText(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
}

// Türkçe karakterleri büyük harfe çevir
function turkishUpperCase(text: string): string {
  return text
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .replace(/ş/g, 'Ş')
    .replace(/ğ/g, 'Ğ')
    .replace(/ü/g, 'Ü')
    .replace(/ö/g, 'Ö')
    .replace(/ç/g, 'Ç')
    .toUpperCase()
}

// Binlik ayırıcı ile fiyat formatla (1200 → 1.200)
function formatPrice(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { cartCount, lastAddedAt } = useCart()
  const [mounted, setMounted] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const [authUser, setAuthUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [cartBump, setCartBump] = useState(false)
  const [liveSearchProducts, setLiveSearchProducts] = useState(products)

  // DB'den güncel ürünleri çek (yeni eklenenler ve isim güncellemeleri için)
  useEffect(() => {
    fetch('/api/products?limit=10000')
      .then(r => r.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          const dbMap = new Map<string, any>()
          data.products.forEach((p: any) => {
            if (p.slug) dbMap.set(p.slug, p)
            if (p.barcode) dbMap.set('barcode:' + p.barcode, p)
          })
          // Merge static products with DB data
          const merged = products.map(staticP => {
            const live = dbMap.get(staticP.slug) || dbMap.get('barcode:' + staticP.barcode)
            if (!live) return staticP
            return { ...staticP, name: live.name || staticP.name, brand: live.brand || staticP.brand, category: live.category || staticP.category, price: Number(live.price) || staticP.price, image: live.image || staticP.image }
          })
          // Append new DB products
          const staticSlugs = new Set(products.map(p => p.slug))
          const newProds = data.products
            .filter((p: any) => p.slug && !staticSlugs.has(p.slug) && p.name && p.isActive !== false)
            .map((p: any) => ({ id: String(p.id || p.slug), slug: p.slug, name: p.name, brand: p.brand || '', category: p.category || '', price: Number(p.price) || 0, originalPrice: null, inStock: p.stockStatus !== 'out_of_stock', stock: p.stock ?? 0, image: p.image || '', barcode: p.barcode || '', description: p.description || '' }))
          setLiveSearchProducts([...merged, ...newProds])
        }
      })
      .catch(() => {})
  }, [])

  // Canlı arama sonuçları
  const searchResults = useMemo(() => {
    if (!searchValue.trim() || searchValue.trim().length < 2) return []
    
    const query = normalizeText(searchValue.trim())
    const results = liveSearchProducts.filter((product) => {
      const name = normalizeText(product.name)
      const brand = normalizeText(product.brand)
      const category = normalizeText(product.category)
      
      return name.includes(query) || brand.includes(query) || category.includes(query)
    })
    
    return results.slice(0, 8) // Maksimum 8 sonuç göster
  }, [searchValue, liveSearchProducts])

  // Mega menü hover fonksiyonları
  const handleMenuEnter = (categoryName: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setHoveredCategory(categoryName)
  }

  const handleMenuLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
    }, 400)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!lastAddedAt) return
    setCartBump(true)
    const t = setTimeout(() => setCartBump(false), 600)
    return () => clearTimeout(t)
  }, [lastAddedAt])

  // Close user menu and search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (!cancelled) setAuthUser(data?.user || null)
      } catch {
        if (!cancelled) setAuthUser(null)
      } finally {
        if (!cancelled) setAuthLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Close mobile menus on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsMobileSearchOpen(false)
    setIsMobileCategoriesOpen(false)
  }, [pathname])

  const slugify = (input: string) => {
    return input
      .toLowerCase()
      .trim()
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'i')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }

  // Kategori isimleri JSON'daki gerçek değerlerle eşleşmeli
  const categoryList = [
    { name: "Cilt Bakımı", slug: "cilt-bakimi" },
    { name: "Mask Bar", slug: "mask-bar" },
    { name: "Saç Bakımı", slug: "sac-bakimi" },
    { name: "Makyaj", slug: "makyaj" },
    { name: "Kişisel Bakım", slug: "kisisel-bakim" },
    { name: "Bebek ve Çocuk Bakımı", slug: "bebek-ve-cocuk-bakimi" }
  ]

  return (
    <>
      {/* Top Header - Scrolling Banner */}
      <div className="bg-accent text-white py-2 overflow-hidden relative group">
        <div className="relative w-full">
          <div className="flex animate-scroll-banner font-grift font-bold">
            <div className="flex-shrink-0 whitespace-nowrap">
              <span className="banner-text" style={{ fontSize: '15px' }}>
                <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • 
              </span>
            </div>
            <div className="flex-shrink-0 whitespace-nowrap">
              <span className="banner-text" style={{ fontSize: '15px' }}>
                <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • <span className="banner-item">AÇILIŞA ÖZEL %30 İNDİRİM</span> • 
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white sticky top-0 z-40">
        <div className="w-full px-4 md:px-8 lg:px-16 xl:px-24 mx-auto">
          <div className="flex items-center justify-between py-3 lg:py-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-accent"
              aria-label="Menü"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.svg" 
                  alt="Merumy Logo" 
                  width={140} 
                  height={45} 
                  priority
                  className="h-8 lg:h-10 w-auto border-0 shadow-none" 
                />
              </Link>
            </div>
            
            {/* Desktop Search */}
            <div className="hidden lg:flex items-center space-x-6 flex-1 max-w-3xl mx-8" ref={searchRef}>
              <div className="relative flex-1">
                <form
                  className="relative"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const q = searchValue.trim()
                    if (!q) return
                    setIsSearchFocused(false)
                    router.push(`/shop?q=${encodeURIComponent(q)}`)
                  }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent">
                    <Search size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Ürün, marka, kategori ara..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full pl-12 pr-4 py-3 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 text-gray-700"
                  />
                </form>
                
                {/* Canlı Arama Sonuçları Dropdown */}
                {isSearchFocused && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-[480px] overflow-y-auto">
                    <div className="p-2">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          onClick={() => {
                            setIsSearchFocused(false)
                            setSearchValue('')
                          }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {/* Ürün Görseli */}
                          <div className="w-14 h-14 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                Görsel
                              </div>
                            )}
                          </div>
                          {/* Ürün Bilgileri */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.brand}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {product.originalPrice && product.originalPrice > product.price ? (
                                <>
                                  <span className="text-xs text-gray-400 line-through">₺{formatPrice(product.originalPrice)}</span>
                                  <span className="text-sm font-bold text-[#92D0AA]">₺{formatPrice(product.price)}</span>
                                </>
                              ) : (
                                <span className="text-sm font-bold text-gray-800">₺{formatPrice(product.price)}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {/* Tüm Sonuçları Gör */}
                    <div className="border-t border-gray-100 p-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchFocused(false)
                          router.push(`/shop?q=${encodeURIComponent(searchValue)}`)
                        }}
                        className="w-full py-2 text-center text-sm font-medium text-[#92D0AA] hover:bg-[#92D0AA]/10 rounded-lg transition-colors"
                      >
                        Tüm sonuçları gör ({products.filter(p => {
                          const query = normalizeText(searchValue.trim())
                          const name = normalizeText(p.name)
                          const brand = normalizeText(p.brand)
                          const category = normalizeText(p.category)
                          return name.includes(query) || brand.includes(query) || category.includes(query)
                        }).length} ürün)
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Arama yapılıyor ama sonuç yok */}
                {isSearchFocused && searchValue.trim().length >= 2 && searchResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-6 text-center">
                    <p className="text-gray-500">"{searchValue}" için sonuç bulunamadı</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 lg:space-x-6">
              {/* Desktop Store Location */}
              <Link href="/magazalar" className="hidden lg:flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors">
                <MapPin size={20} />
                <span className="text-sm font-medium">Mağazalarımız</span>
              </Link>
              
              {/* User Account Section - Desktop Only */}
              <div className="hidden lg:block relative" ref={userMenuRef}>
                {authLoading ? (
                  <div className="flex items-center space-x-2 text-accent">
                    <User size={20} />
                    <span className="text-sm font-medium opacity-60">Yükleniyor...</span>
                  </div>
                ) : authUser ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors"
                    >
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                        <UserCircle size={24} className="text-accent" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-semibold">
                          {authUser.firstName} {authUser.lastName}
                        </span>
                        <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    
                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                        <div className="bg-gradient-to-r from-accent to-accent/80 px-4 py-4 text-white">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                              <UserCircle size={32} />
                            </div>
                            <div>
                              <p className="font-semibold">{authUser.firstName} {authUser.lastName}</p>
                              <p className="text-xs opacity-80 truncate">{authUser.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="py-2">
                          <Link href="/hesabim" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-accent transition-colors">
                            <UserCircle size={20} />
                            <span className="text-sm font-medium">Hesabım</span>
                          </Link>
                          <Link href="/hesabim/siparislerim" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-accent transition-colors">
                            <Package size={20} />
                            <span className="text-sm font-medium">Siparişlerim</span>
                          </Link>
                          <Link href="/hesabim/adreslerim" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-accent transition-colors">
                            <MapPinned size={20} />
                            <span className="text-sm font-medium">Adreslerim</span>
                          </Link>
                        </div>
                        
                        <div className="border-t border-gray-100 py-2">
                          <button
                            type="button"
                            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full"
                            onClick={async () => {
                              setIsUserMenuOpen(false)
                              try {
                                await fetch('/api/auth/logout', { method: 'POST' })
                              } finally {
                                setAuthUser(null)
                                router.push('/')
                                router.refresh()
                              }
                            }}
                          >
                            <LogOut size={20} />
                            <span className="text-sm font-medium">Çıkış Yap</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors">
                    <User size={20} />
                    <div className="text-sm font-medium">
                      <Link href="/login" className="text-sm font-medium hover:underline">Giriş Yap</Link>
                      <span className="mx-1">/</span>
                      <Link href="/signup" className="text-sm font-medium hover:underline">Üye Ol</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart - Always Visible */}
              <Link href="/cart" className="flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors relative">
                <span className={cartBump ? 'animate-cart-bump' : ''}>
                  <ShoppingBag size={22} />
                </span>
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
                <span className="hidden lg:block text-sm font-medium">Sepetim</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block bg-white border-b border-gray-100">
        <div className="w-full px-4 md:px-8 lg:px-16 xl:px-24 mx-auto">
          <nav className="flex items-center justify-center py-3 w-full">
            <div className="flex items-center space-x-8">
              <Link 
                href="/" 
                className={`uppercase whitespace-nowrap font-grift font-bold text-xs px-4 py-2 rounded-full transition-all duration-200 ${
                  pathname === '/' 
                    ? 'bg-[#92D0AA] text-white' 
                    : 'text-accent hover:bg-[#92D0AA] hover:text-white'
                }`}
              >
                ANA SAYFA
              </Link>
              
              {categoryList.map((cat) => {
                const categoryBrands = Array.from(new Set(products.filter(p => p.category === cat.name).map(p => p.brand))).slice(0, 5)
                const isHovered = hoveredCategory === cat.name
                const isActive = pathname === `/shop/${cat.slug}` || pathname?.startsWith(`/shop/${cat.slug}?`)
                return (
                  <div
                    key={cat.slug}
                    className="relative"
                    onMouseEnter={() => handleMenuEnter(cat.name)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <Link
                      href={`/shop/${cat.slug}`}
                      className={`flex items-center space-x-1 uppercase whitespace-nowrap font-grift font-bold text-xs px-4 py-2 rounded-full transition-all duration-200 ${
                        isHovered || isActive
                          ? 'bg-[#92D0AA] text-white' 
                          : 'text-accent hover:bg-[#92D0AA] hover:text-white'
                      }`}
                    >
                      <span>{turkishUpperCase(cat.name)}</span>
                      {categoryBrands.length > 0 && (
                        <ChevronDown size={12} className={`transition-transform ${isHovered ? 'rotate-180' : ''}`} />
                      )}
                    </Link>
                    {isHovered && categoryBrands.length > 0 && (
                      <div 
                        className="absolute top-full left-0 mt-1 w-56 bg-[#92D0AA] rounded-2xl shadow-xl z-50 overflow-hidden"
                        onMouseEnter={() => handleMenuEnter(cat.name)}
                        onMouseLeave={handleMenuLeave}
                      >
                        {/* Başlık */}
                        <div className="px-5 pt-4 pb-3">
                          <h3 className="text-white font-bold text-sm uppercase tracking-wide">
                            {turkishUpperCase(cat.name)}
                          </h3>
                        </div>
                        <div className="border-t border-white/30 mx-4"></div>
                        {/* Marka Listesi */}
                        <div className="px-5 py-3">
                          {categoryBrands.map((brand, idx) => (
                            <div key={brand}>
                              <Link
                                href={`/shop/${cat.slug}?brand=${encodeURIComponent(brand)}`}
                                className="block text-white/90 hover:text-white transition-colors text-sm py-2"
                              >
                                {brand}
                              </Link>
                              {idx < categoryBrands.length - 1 && (
                                <div className="border-b border-white/20"></div>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* Tümünü Gör */}
                        <div className="px-5 pb-4 pt-1">
                          <Link 
                            href={`/shop/${cat.slug}`} 
                            className="text-sm font-bold text-white hover:underline"
                          >
                            Tümünü Gör
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Slide Menu */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white overflow-y-auto">
          {/* Menu Header */}
          <div className="sticky top-0 bg-accent text-white p-4 flex items-center justify-between">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Image src="/logo.svg" alt="Merumy" width={120} height={40} className="h-8 w-auto" />
            </Link>
            <button onClick={() => setIsMenuOpen(false)} className="p-2">
              <X size={24} />
            </button>
          </div>
          
          {/* User Section */}
          <div className="p-4 border-b border-gray-100">
            {authUser ? (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <UserCircle size={28} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{authUser.firstName} {authUser.lastName}</p>
                  <Link href="/hesabim" onClick={() => setIsMenuOpen(false)} className="text-sm text-accent">Hesabıma Git</Link>
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex-1 py-3 text-center bg-accent text-white rounded-lg font-medium">
                  Giriş Yap
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="flex-1 py-3 text-center border border-accent text-accent rounded-lg font-medium">
                  Üye Ol
                </Link>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const q = searchValue.trim()
                if (!q) return
                setIsMenuOpen(false)
                router.push(`/shop?q=${encodeURIComponent(q)}`)
              }}
              className="relative"
            >
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </form>
          </div>

          {/* Navigation Links */}
          <nav className="py-2">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
              <Home size={20} className="mr-3 text-accent" />
              <span className="font-medium">Ana Sayfa</span>
            </Link>
            <Link href="/magazalar" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
              <MapPin size={20} className="mr-3 text-accent" />
              <span className="font-medium">Mağazalarımız</span>
            </Link>

            {/* Categories */}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Kategoriler</p>
              {categoryList.map((cat) => (
                <Link 
                  key={cat.slug}
                  href={`/shop/${cat.slug}`} 
                  onClick={() => setIsMenuOpen(false)} 
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  <Grid3X3 size={20} className="mr-3 text-accent" />
                  <span className="font-medium">{cat.name}</span>
                </Link>
              ))}
            </div>

            {/* User Account Links (if logged in) */}
            {authUser && (
              <div className="border-t border-gray-100 mt-2 pt-2">
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Hesabım</p>
                <Link href="/hesabim/siparislerim" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
                  <Package size={20} className="mr-3 text-accent" />
                  <span>Siparişlerim</span>
                </Link>
                <Link href="/hesabim/adreslerim" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
                  <MapPinned size={20} className="mr-3 text-accent" />
                  <span>Adreslerim</span>
                </Link>
                <button
                  onClick={async () => {
                    setIsMenuOpen(false)
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' })
                    } finally {
                      setAuthUser(null)
                      router.push('/')
                      router.refresh()
                    }
                  }}
                  className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut size={20} className="mr-3" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Modern Floating Design */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1">
        {/* Gradient fade effect */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />
        
        {/* Navigation Bar */}
        <div className="relative bg-[#92D0AA] rounded-2xl shadow-lg shadow-[#92D0AA]/30">
          <div className="flex items-center justify-around py-2 px-1">
            {/* Ana Sayfa */}
            <Link 
              href="/" 
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${
                pathname === '/' 
                  ? 'bg-white/25 text-white' 
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Home size={20} strokeWidth={pathname === '/' ? 2.5 : 2} />
              <span className="text-[9px] mt-1 font-semibold tracking-wide">Ana Sayfa</span>
            </Link>
            
            {/* Kategoriler */}
            <Link 
              href="/shop" 
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${
                pathname?.startsWith('/shop') || pathname?.startsWith('/marka')
                  ? 'bg-white/25 text-white' 
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Grid3X3 size={20} strokeWidth={pathname?.startsWith('/shop') ? 2.5 : 2} />
              <span className="text-[9px] mt-1 font-semibold tracking-wide">Kategoriler</span>
            </Link>
            
            {/* Ara - Center Button (highlighted) */}
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="flex flex-col items-center justify-center w-14 h-14 -mt-5 bg-white rounded-full shadow-lg shadow-black/15 text-[#92D0AA] transition-transform duration-200 active:scale-95"
            >
              <Search size={22} strokeWidth={2.5} />
            </button>
            
            {/* Sepet */}
            <Link 
              href="/cart" 
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 relative ${
                pathname === '/cart' 
                  ? 'bg-white/25 text-white' 
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <div className="relative">
                <ShoppingBag size={20} strokeWidth={pathname === '/cart' ? 2.5 : 2} />
                {mounted && cartCount > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 bg-[#F1EB9C] text-[#92D0AA] text-[8px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center ${cartBump ? 'animate-bounce' : ''}`}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-1 font-semibold tracking-wide">Sepet</span>
            </Link>
            
            {/* Hesap */}
            <Link 
              href={authUser ? "/hesabim" : "/login"} 
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${
                pathname?.startsWith('/hesabim') || pathname === '/login' 
                  ? 'bg-white/25 text-white' 
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <User size={20} strokeWidth={(pathname?.startsWith('/hesabim') || pathname === '/login') ? 2.5 : 2} />
              <span className="text-[9px] mt-1 font-semibold tracking-wide">{authUser ? 'Hesabım' : 'Giriş'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {isMobileSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="p-4 pb-24">
            <div className="flex items-center space-x-3 mb-4">
              <button onClick={() => { setIsMobileSearchOpen(false); setSearchValue(''); }} className="p-2 -ml-2">
                <X size={24} className="text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold">Ürün Ara</h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const q = searchValue.trim()
                if (!q) return
                setIsMobileSearchOpen(false)
                setSearchValue('')
                router.push(`/shop?q=${encodeURIComponent(q)}`)
              }}
              className="relative"
            >
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün, marka veya kategori ara..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-lg"
              />
            </form>
            
            {/* Canlı Arama Sonuçları */}
            {searchResults.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-500 mb-3">Arama Sonuçları</p>
                <div className="space-y-2">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => {
                        setIsMobileSearchOpen(false)
                        setSearchValue('')
                      }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      {/* Ürün Görseli */}
                      <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-100">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            Görsel
                          </div>
                        )}
                      </div>
                      {/* Ürün Bilgileri */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {product.originalPrice && product.originalPrice > product.price ? (
                            <>
                              <span className="text-xs text-gray-400 line-through">₺{formatPrice(product.originalPrice)}</span>
                              <span className="text-sm font-bold text-[#92D0AA]">₺{formatPrice(product.price)}</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-gray-800">₺{formatPrice(product.price)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* Tüm Sonuçları Gör */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSearchOpen(false)
                    router.push(`/shop?q=${encodeURIComponent(searchValue)}`)
                    setSearchValue('')
                  }}
                  className="w-full mt-4 py-3 text-center text-sm font-medium text-white bg-[#92D0AA] rounded-xl"
                >
                  Tüm sonuçları gör
                </button>
              </div>
            )}
            
            {/* Sonuç bulunamadı */}
            {searchValue.trim().length >= 2 && searchResults.length === 0 && (
              <div className="mt-6 text-center py-8">
                <p className="text-gray-500">"{searchValue}" için sonuç bulunamadı</p>
              </div>
            )}
            
            {/* Popular Categories - Arama yapılmadığında göster */}
            {searchValue.trim().length < 2 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-500 mb-3">Popüler Kategoriler</p>
                <div className="flex flex-wrap gap-2">
                  {categoryList.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/shop/${cat.slug}`}
                      onClick={() => { setIsMobileSearchOpen(false); setSearchValue(''); }}
                      className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </>
  )
}
