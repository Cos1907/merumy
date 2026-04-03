'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Search, User, ShoppingBag, MapPin, ChevronDown, Package, MapPinned, Ticket, LogOut, UserCircle, Home, Grid3X3, X, Menu } from 'lucide-react'
import { categories, products } from '../lib/products'
import { useCart } from '../context/CartContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { cartCount, lastAddedAt } = useCart()
  // Start with enabled: false to prevent flash when topbar is disabled
  const [topbarSettings, setTopbarSettings] = useState<{ enabled: boolean; text: string; bgColor: string; textColor: string }>({ enabled: false, text: '1000 TL VE ÜZERİ ALIŞVERIŞLERDE ÜCRETSİZ KARGO', bgColor: '#000000', textColor: '#ffffff' })

  // DB'den gelen kategori-marka verileri
  const [dbCategoryBrands, setDbCategoryBrands] = useState<Record<string, string[]>>({})

  useEffect(() => {
    fetch('/api/site-settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings) setTopbarSettings({
          enabled: d.settings.topbarEnabled !== false,
          text: d.settings.topbarText || '1000 TL VE ÜZERİ ALIŞVERIŞLERDE ÜCRETSİZ KARGO',
          bgColor: d.settings.topbarBgColor || '#000000',
          textColor: d.settings.topbarTextColor || '#ffffff',
        })
        else setTopbarSettings({ enabled: false, text: '1000 TL VE ÜZERİ ALIŞVERIŞLERDE ÜCRETSİZ KARGO', bgColor: '#000000', textColor: '#ffffff' })
      })
      .catch(() => { setTopbarSettings({ enabled: false, text: '1000 TL VE ÜZERİ ALIŞVERIŞLERDE ÜCRETSİZ KARGO', bgColor: '#000000', textColor: '#ffffff' }) })
  }, [])

  // Kategori markalarını DB'den çek
  useEffect(() => {
    fetch('/api/nav-data')
      .then(r => r.json())
      .then(d => { if (d.categoryBrands) setDbCategoryBrands(d.categoryBrands) })
      .catch(() => {})
  }, [])

  const [mounted, setMounted] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const [authUser, setAuthUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [cartBump, setCartBump] = useState(false)

  // Live search state
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([])
  const [searchBrands, setSearchBrands] = useState<string[]>([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchDropdownLoading, setSearchDropdownLoading] = useState(false)
  const searchDropdownRef = useRef<HTMLDivElement>(null)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mobile search live results
  const [mobileSearchSuggestions, setMobileSearchSuggestions] = useState<any[]>([])
  const [mobileSearchBrands, setMobileSearchBrands] = useState<string[]>([])
  const [mobileSearchLoading, setMobileSearchLoading] = useState(false)
  const mobileDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
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
    setShowSearchDropdown(false)
  }, [pathname])

  // Live search helper
  const doSearch = async (q: string, setSuggestions: (v: any[]) => void, setBrands: (v: string[]) => void, setLoading: (v: boolean) => void) => {
    if (!q || q.length < 1) {
      setSuggestions([])
      setBrands([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=6`)
      const data = await res.json()
      setSuggestions(data.products || [])
      // Get brands that match the query
      const allBrands: string[] = data.brands || []
      const matchingBrands = allBrands.filter((b: string) =>
        b.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 3)
      setBrands(matchingBrands)
    } catch { /* ignore */ }
    setLoading(false)
  }

  // Desktop search debounce
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    const q = searchValue.trim()
    if (!q || q.length < 1) {
      setSearchSuggestions([])
      setSearchBrands([])
      setShowSearchDropdown(false)
      return
    }
    setShowSearchDropdown(true)
    searchDebounceRef.current = setTimeout(() => {
      doSearch(q, setSearchSuggestions, setSearchBrands, setSearchDropdownLoading)
    }, 200)
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  // Mobile search debounce
  useEffect(() => {
    if (mobileDebounceRef.current) clearTimeout(mobileDebounceRef.current)
    const q = searchValue.trim()
    if (!q || q.length < 1) {
      setMobileSearchSuggestions([])
      setMobileSearchBrands([])
      return
    }
    mobileDebounceRef.current = setTimeout(() => {
      doSearch(q, setMobileSearchSuggestions, setMobileSearchBrands, setMobileSearchLoading)
    }, 300)
    return () => { if (mobileDebounceRef.current) clearTimeout(mobileDebounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, isMobileSearchOpen])

  // Brand logo helper
  const getBrandLogo = (brandName: string): string | null => {
    const logos: Record<string, string> = {
      'ANUA': '/brands/anua.png', 'Anua': '/brands/anua.png',
      'COSRX': '/brands/cosrx.png', 'Cosrx': '/brands/cosrx.png',
      'MEDICUBE': '/brands/medicube.png', 'Medicube': '/brands/medicube.png',
      'PYUNKANG YUL': '/brands/pyunkangyul.png', 'Pyunkang Yul': '/brands/pyunkangyul.png',
      'NUMBUZIN': '/brands/numbuzin.png', 'Numbuzin': '/brands/numbuzin.png',
      'ISNTREE': '/brands/isntree.png', 'Isntree': '/brands/isntree.png',
      'ROUND LAB': '/brands/roundlab.png', 'Round Lab': '/brands/roundlab.png',
      'ILLIYOON': '/brands/illiyoon.png', 'Illiyoon': '/brands/illiyoon.png',
      'BEAUTY OF JOSEON': '/brands/beautyofjoseon.png', 'Beauty of Joseon': '/brands/beautyofjoseon.png',
      'SOME BY MI': '/brands/somebymi.png', 'Some By Mi': '/brands/somebymi.png',
      'TORRIDEN': '/brands/torriden.png', 'Torriden': '/brands/torriden.png',
      'AXIS-Y': '/brands/axisy.png', 'Axis-Y': '/brands/axisy.png',
      'SKIN1004': '/brands/skin1004.png', 'Skin1004': '/brands/skin1004.png',
      'DR.JART+': '/brands/drjart.png', 'Dr.Jart+': '/brands/drjart.png',
      'INNISFREE': '/brands/innisfree.png', 'Innisfree': '/brands/innisfree.png',
      'CELIMAX': '/brands/celimax.png', 'Celimax': '/brands/celimax.png',
      'LANEIGE': '/brands/laneige.png', 'Laneige': '/brands/laneige.png',
      'ETUDE': '/brands/etude.png', 'Etude': '/brands/etude.png',
      'THE FACE SHOP': '/brands/thefaceshop.png', 'The Face Shop': '/brands/thefaceshop.png',
    }
    return logos[brandName] || null
  }

  const slugifyBrand = (brand: string) =>
    brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

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

  const categoryList = [
    { name: "Cilt Bakımı", slug: "cilt-bakimi" },
    { name: "Mask Bar", slug: "mask-bar" },
    { name: "Saç Bakımı", slug: "sac-bakimi" },
    { name: "Makyaj", slug: "makyaj", displayName: "Makyaj" },
    { name: "Vücut Bakımı", slug: "kisisel-bakim", displayName: "Kişisel Bakım" },
    { name: "Bebek ve Çocuk Bakımı", slug: "bebek-ve-cocuk-bakimi" }
  ]

  // Search dropdown shared UI
  const SearchDropdownContent = ({ suggestions, brands, loading, onSelect }: { suggestions: any[]; brands: string[]; loading: boolean; onSelect: () => void }) => (
    <>
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Aranıyor...</span>
        </div>
      )}
      {!loading && brands.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2 px-1">Markalar</p>
          {brands.map((brand: string) => {
            const logo = getBrandLogo(brand)
            return (
              <Link
                key={brand}
                href={`/marka/${slugifyBrand(brand)}`}
                onClick={onSelect}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/5 transition-colors"
              >
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={brand} className="w-10 h-8 object-contain" onError={(e: any) => { e.target.style.display='none' }} />
                ) : (
                  <div className="w-10 h-8 bg-accent/10 rounded flex items-center justify-center">
                    <span className="text-[9px] font-bold text-accent">{brand.slice(0, 3)}</span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-800">{brand}</span>
                <span className="ml-auto text-xs text-accent">Markaya git →</span>
              </Link>
            )
          })}
        </div>
      )}
      {!loading && suggestions.length > 0 && (
        <div className="p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2 px-1">Ürünler</p>
          {suggestions.map((product: any) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              onClick={onSelect}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/5 transition-colors"
            >
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image.startsWith('/') ? product.image : `/${product.image}`}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                  onError={(e: any) => { e.target.src = '/logo.svg' }}
                />
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                {product.brand && <p className="text-xs text-gray-400">{product.brand}</p>}
              </div>
              <span className="text-sm font-semibold text-accent whitespace-nowrap">₺{Number(product.price).toFixed(2)}</span>
            </Link>
          ))}
        </div>
      )}
      {!loading && suggestions.length === 0 && brands.length === 0 && searchValue.trim().length >= 1 && (
        <div className="p-6 text-center text-gray-400 text-sm">
          <Search size={24} className="mx-auto mb-2 opacity-30" />
          <p>&ldquo;{searchValue}&rdquo; için sonuç bulunamadı</p>
        </div>
      )}
      {!loading && suggestions.length > 0 && (
        <div className="border-t border-gray-100 p-3">
          <Link
            href={`/shop?q=${encodeURIComponent(searchValue)}`}
            onClick={onSelect}
            className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-accent hover:bg-accent/5 rounded-lg transition-colors"
          >
            <Search size={16} />
            Tüm sonuçları gör
          </Link>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Top Header - Scrolling Banner - only render once settings are loaded to prevent flicker */}
      {topbarSettings.enabled && (
        <div className="py-2 overflow-hidden relative group" style={{ backgroundColor: topbarSettings.bgColor, color: topbarSettings.textColor }}>
          <div className="relative w-full">
            <div className="flex animate-scroll-banner font-grift font-bold">
              <div className="flex-shrink-0 whitespace-nowrap">
                <span className="banner-text" style={{ fontSize: '15px' }}>
                  <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • 
                </span>
              </div>
              <div className="flex-shrink-0 whitespace-nowrap">
                <span className="banner-text" style={{ fontSize: '15px' }}>
                  <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • <span className="banner-item">{topbarSettings.text}</span> • 
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  className="h-8 lg:h-10 w-auto border-0 shadow-none" 
                />
              </Link>
            </div>
            
            {/* Desktop Search */}
            <div className="hidden lg:flex items-center space-x-6 flex-1 max-w-3xl mx-8">
              <div className="relative flex-1" ref={searchDropdownRef}>
                <form
                  className="relative"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const q = searchValue.trim()
                    if (!q) return
                    setShowSearchDropdown(false)
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
                    onFocus={() => { if (searchValue.trim().length >= 2) setShowSearchDropdown(true) }}
                    className="w-full pl-12 pr-4 py-3 border border-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 text-gray-700"
                  />
                </form>
                {/* Desktop Search Dropdown */}
                {showSearchDropdown && searchValue.trim().length >= 1 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-[480px] overflow-y-auto">
                    <SearchDropdownContent
                      suggestions={searchSuggestions}
                      brands={searchBrands}
                      loading={searchDropdownLoading}
                      onSelect={() => { setShowSearchDropdown(false); setSearchValue('') }}
                    />
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
              <Link href="/" className="text-accent hover:text-accent/80 transition-colors uppercase whitespace-nowrap font-grift font-bold text-xs">
                ANA SAYFA
              </Link>
              
              {categoryList.map((cat) => {
                const categoryBrands = (dbCategoryBrands[cat.name] && dbCategoryBrands[cat.name].length > 0)
                  ? dbCategoryBrands[cat.name].slice(0, 8)
                  : Array.from(new Set(products.filter(p => p.category === cat.name).map(p => p.brand))).slice(0, 7)
                return (
                  <div
                    key={cat.slug}
                    className="relative group"
                    onMouseEnter={() => handleMenuEnter(cat.name)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <Link
                      href={`/shop/${cat.slug}`}
                      className="text-accent hover:text-accent/80 transition-colors flex items-center space-x-1 uppercase whitespace-nowrap font-grift font-bold text-xs"
                    >
                      <span>{cat.displayName || cat.name.toUpperCase()}</span>
                      {categoryBrands.length > 0 && (
                        <ChevronDown size={12} className={`transition-transform ${hoveredCategory === cat.name ? 'rotate-180' : ''}`} />
                      )}
                    </Link>
                    {hoveredCategory === cat.name && categoryBrands.length > 0 && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-accent/20 z-50 p-5"
                        onMouseEnter={() => handleMenuEnter(cat.name)}
                        onMouseLeave={handleMenuLeave}
                      >
                        <h3 className="text-accent font-bold text-sm uppercase tracking-wide mb-3">
                          {cat.displayName || cat.name.toUpperCase()}
                        </h3>
                        <div className="border-t border-accent/20 mb-3"></div>
                        <div className="space-y-2">
                          {categoryBrands.map((brand) => (
                            <Link
                              key={brand}
                              href={`/shop/${cat.slug}?brand=${encodeURIComponent(brand)}`}
                              className="block text-gray-700 hover:text-accent transition-colors text-sm py-1"
                            >
                              {brand}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-accent/20 mt-3 pt-3">
                          <Link href={`/shop/${cat.slug}`} className="text-sm font-medium text-accent hover:underline">
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
                  <span className="font-medium">{cat.displayName || cat.name}</span>
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
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <button onClick={() => { setIsMobileSearchOpen(false); setSearchValue('') }} className="p-2 -ml-2">
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

            {/* Mobile Live Search Results */}
            {searchValue.trim().length >= 1 && (
              <div className="mt-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <SearchDropdownContent
                  suggestions={mobileSearchSuggestions}
                  brands={mobileSearchBrands}
                  loading={mobileSearchLoading}
                  onSelect={() => { setIsMobileSearchOpen(false); setSearchValue('') }}
                />
              </div>
            )}
            
            {/* Popular Categories - show when no results yet */}
            {searchValue.trim().length < 1 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-500 mb-3">Popüler Kategoriler</p>
                <div className="flex flex-wrap gap-2">
                  {categoryList.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/shop/${cat.slug}`}
                      onClick={() => setIsMobileSearchOpen(false)}
                      className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium"
                    >
                      {cat.displayName || cat.name}
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
