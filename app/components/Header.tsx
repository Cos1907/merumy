'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search, User, ShoppingBag, MapPin, ChevronDown,
  Package, MapPinned, LogOut, UserCircle, Home, Grid3X3, X, Menu
} from 'lucide-react'
import { useCart } from '../context/CartContext'

interface NavBrand {
  name: string
  logo_url: string | null
}

interface NavCategory {
  id: number
  name: string
  slug: string
  brands: NavBrand[]
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
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
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const [authUser, setAuthUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [cartBump, setCartBump] = useState(false)

  // Nav data from DB
  const [navCategories, setNavCategories] = useState<NavCategory[]>([])

  // Topbar
  const [topbar, setTopbar] = useState<{ enabled: boolean; text: string; bgColor: string; textColor: string } | null>(null)

  // ─── Mega Menu hover ─────────────────────────────────────────────────────────
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

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!lastAddedAt) return
    setCartBump(true)
    const t = setTimeout(() => setCartBump(false), 600)
    return () => clearTimeout(t)
  }, [lastAddedAt])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auth
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
    return () => { cancelled = true }
  }, [])

  // Nav data (categories + brands) from DB
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/nav-data', { cache: 'no-store' })
        const data = await res.json()
        if (data.categories) setNavCategories(data.categories)
      } catch {
        // ignore - will use empty categories
      }
    })()
  }, [])

  // Topbar settings
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/site-settings', { cache: 'no-store' })
        const data = await res.json()
        setTopbar({
          enabled: data.topbarActive ?? false,
          text: data.topbarText || 'AÇILIŞA ÖZEL %30 İNDİRİM',
          bgColor: data.topbarBgColor || '#92D0AA',
          textColor: data.topbarTextColor || '#ffffff',
        })
      } catch {
        setTopbar({ enabled: false, text: '', bgColor: '#92D0AA', textColor: '#ffffff' })
      }
    })()
  }, [])

  // Close mobile menus on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsMobileSearchOpen(false)
    setSearchOpen(false)
  }, [pathname])

  // Live search
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    const q = searchValue.trim()
    if (q.length < 1) {
      setSearchResults([])
      setSearchOpen(false)
      return
    }
    setSearchLoading(true)
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=8`)
        const data = await res.json()
        setSearchResults(data.products || [])
        setSearchOpen(true)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [searchValue])

  function doSearch() {
    const q = searchValue.trim()
    if (!q) return
    setSearchOpen(false)
    setIsMobileSearchOpen(false)
    router.push(`/shop?q=${encodeURIComponent(q)}`)
  }

  const categoryList = navCategories.length > 0 ? navCategories : [
    { id: 1, name: 'Cilt Bakımı', slug: 'cilt-bakimi', brands: [] },
    { id: 2, name: 'Saç Bakımı', slug: 'sac-bakimi', brands: [] },
    { id: 3, name: 'Makyaj', slug: 'makyaj', brands: [] },
    { id: 4, name: 'Kişisel Bakım', slug: 'kisisel-bakim', brands: [] },
    { id: 5, name: 'Mask Bar', slug: 'mask-bar', brands: [] },
    { id: 6, name: 'Bebek ve Çocuk Bakımı', slug: 'bebek-ve-cocuk-bakimi', brands: [] },
  ]

  // Helper: brand name → URL slug
  const slugifyBrand = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  // Helper: brand name → logo URL (looks up from navCategories)
  const getBrandLogo = (brandName: string): string | null => {
    for (const cat of navCategories) {
      const found = cat.brands.find((b) => b.name === brandName)
      if (found) return found.logo_url
    }
    return null
  }

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
      {/* Topbar */}
      {topbar?.enabled && (
        <div
          className="py-2 overflow-hidden relative"
          style={{ backgroundColor: topbar.bgColor, color: topbar.textColor }}
        >
          <div className="relative w-full">
            <div className="flex animate-scroll-banner font-grift font-bold">
              {[0, 1].map((i) => (
                <div key={i} className="flex-shrink-0 whitespace-nowrap">
                  <span style={{ fontSize: '15px' }}>
                    {Array(10).fill(topbar.text).map((t, j) => (
                      <span key={j}>{t} • </span>
                    ))}
                  </span>
                </div>
              ))}
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
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="Merumy Logo" width={140} height={45} className="h-8 lg:h-10 w-auto" />
            </Link>

            {/* Desktop Search */}
            <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8">
              <div className="relative w-full" ref={searchRef}>
                <form
                  className="relative"
                  onSubmit={(e) => { e.preventDefault(); doSearch() }}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#92D0AA] pointer-events-none">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Ürün, marka veya kategori ara..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0 || searchValue.trim()) setSearchOpen(true) }}
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#92D0AA] focus:ring-2 focus:ring-[#92D0AA]/20 transition-all"
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => { setSearchValue(''); setSearchOpen(false); setSearchResults([]) }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </form>

                {/* Search Dropdown - Full overlay below */}
                {searchOpen && searchValue.trim() && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] overflow-hidden">
                    {searchLoading ? (
                      <div className="flex items-center justify-center gap-3 py-8 text-gray-500">
                        <div className="w-5 h-5 border-2 border-[#92D0AA]/30 border-t-[#92D0AA] rounded-full animate-spin" />
                        <span className="text-sm">Aranıyor...</span>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-10 text-center">
                        <Search size={32} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-gray-500 text-sm font-medium">&ldquo;{searchValue}&rdquo; için sonuç bulunamadı</p>
                        <p className="text-gray-400 text-xs mt-1">Farklı anahtar kelimeler deneyin</p>
                      </div>
                    ) : (
                      <>
                        {/* Results header */}
                        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {searchResults.length} sonuç bulundu
                          </span>
                          <button
                            onClick={doSearch}
                            className="text-xs font-semibold text-[#92D0AA] hover:underline"
                          >
                            Tümünü gör →
                          </button>
                        </div>

                        {/* Product results */}
                        <div className="max-h-[380px] overflow-y-auto">
                          {searchResults.map((p: any, idx: number) => (
                            <Link
                              key={p.id || p.slug}
                              href={`/product/${p.slug}`}
                              onClick={() => { setSearchOpen(false); setSearchValue('') }}
                              className={`flex items-center gap-4 px-4 py-3.5 hover:bg-[#92D0AA]/5 transition-colors group ${idx < searchResults.length - 1 ? 'border-b border-gray-50' : ''}`}
                            >
                              {/* Product image */}
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-[#92D0AA]/20 to-[#92D0AA]/5 flex items-center justify-center">
                                    <Search size={16} className="text-[#92D0AA]/40" />
                                  </div>
                                )}
                              </div>

                              {/* Product info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#92D0AA] transition-colors">
                                  {p.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {p.brandLogo && (
                                    <img
                                      src={p.brandLogo}
                                      alt={p.brand}
                                      className="h-3.5 w-8 object-contain opacity-70"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                    />
                                  )}
                                  <p className="text-xs text-gray-400">{p.brand}</p>
                                  {p.category && (
                                    <>
                                      <span className="text-gray-200">·</span>
                                      <p className="text-xs text-gray-400">{p.category}</p>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Price */}
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-[#92D0AA]">₺{Number(p.price).toFixed(0)}</p>
                                {p.originalPrice && p.originalPrice > p.price && (
                                  <p className="text-xs text-gray-400 line-through">₺{Number(p.originalPrice).toFixed(0)}</p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* Footer CTA */}
                        <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
                          <button
                            onClick={doSearch}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#92D0AA] text-white text-sm font-semibold hover:bg-[#7BC496] transition-colors"
                          >
                            <Search size={15} />
                            &ldquo;{searchValue}&rdquo; için tüm sonuçları gör
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 lg:space-x-6">
              {/* Desktop Store Location */}
              <Link href="/magazalar" className="hidden lg:flex items-center space-x-2 text-accent hover:text-accent/80">
                <MapPin size={20} />
                <span className="text-sm font-medium">Mağazalarımız</span>
              </Link>

              {/* User Account */}
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
                      className="flex items-center space-x-2 text-accent hover:text-accent/80"
                    >
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                        <UserCircle size={24} className="text-accent" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-semibold">{authUser.firstName} {authUser.lastName}</span>
                        <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

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
                          <Link href="/hesabim" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-accent">
                            <UserCircle size={20} />
                            <span className="text-sm font-medium">Hesabım</span>
                          </Link>
                          <Link href="/hesabim/siparislerim" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-accent">
                            <Package size={20} />
                            <span className="text-sm font-medium">Siparişlerim</span>
                          </Link>
                          <Link href="/hesabim/adreslerim" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-accent">
                            <MapPinned size={20} />
                            <span className="text-sm font-medium">Adreslerim</span>
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 py-2">
                          <button
                            type="button"
                            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full"
                            onClick={async () => {
                              setIsUserMenuOpen(false)
                              try { await fetch('/api/auth/logout', { method: 'POST' }) } finally {
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
                  <div className="flex items-center space-x-2 text-accent hover:text-accent/80">
                    <User size={20} />
                    <div className="text-sm font-medium">
                      <Link href="/login" className="hover:underline">Giriş Yap</Link>
                      <span className="mx-1">/</span>
                      <Link href="/signup" className="hover:underline">Üye Ol</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link href="/cart" className="flex items-center space-x-2 text-accent hover:text-accent/80 relative">
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
              <Link href="/" className="text-accent hover:text-accent/80 uppercase whitespace-nowrap font-grift font-bold text-xs">
                ANA SAYFA
              </Link>

              {categoryList.map((cat) => (
                <div
                  key={cat.slug}
                  className="relative group"
                  onMouseEnter={() => handleMenuEnter(cat.name)}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link
                    href={`/shop/${cat.slug}`}
                    className="text-accent hover:text-accent/80 flex items-center space-x-1 uppercase whitespace-nowrap font-grift font-bold text-xs"
                  >
                    <span>{cat.name.toUpperCase()}</span>
                    {cat.brands.length > 0 && (
                      <ChevronDown size={12} className={`transition-transform ${hoveredCategory === cat.name ? 'rotate-180' : ''}`} />
                    )}
                  </Link>

                  {hoveredCategory === cat.name && cat.brands.length > 0 && (
                    <div
                      className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-accent/20 z-50 p-5"
                      onMouseEnter={() => handleMenuEnter(cat.name)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <h3 className="text-accent font-bold text-sm uppercase tracking-wide mb-3">
                        {cat.name.toUpperCase()}
                      </h3>
                      <div className="border-t border-accent/20 mb-3" />
                      <div className="space-y-2">
                        {cat.brands.map((brand) => (
                          <Link
                            key={brand.name}
                            href={`/shop/${cat.slug}?brand=${encodeURIComponent(brand.name)}`}
                            className="flex items-center gap-2 text-gray-700 hover:text-accent text-sm py-1"
                          >
                            {brand.logo_url && (
                              <img src={brand.logo_url} alt={brand.name} className="h-4 w-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            )}
                            {brand.name}
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
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Slide Menu */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`absolute inset-0 bg-black/50 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)} />
        <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white overflow-y-auto">
          <div className="sticky top-0 bg-accent text-white p-4 flex items-center justify-between">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Image src="/logo.svg" alt="Merumy" width={120} height={40} className="h-8 w-auto" />
            </Link>
            <button onClick={() => setIsMenuOpen(false)} className="p-2"><X size={24} /></button>
          </div>

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
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex-1 py-3 text-center bg-accent text-white rounded-lg font-medium">Giriş Yap</Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="flex-1 py-3 text-center border border-accent text-accent rounded-lg font-medium">Üye Ol</Link>
              </div>
            )}
          </div>

          <div className="p-4 border-b border-gray-100">
            <form onSubmit={(e) => { e.preventDefault(); doSearch(); setIsMenuOpen(false) }} className="relative">
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

          <nav className="py-2">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
              <Home size={20} className="mr-3 text-accent" />
              <span className="font-medium">Ana Sayfa</span>
            </Link>
            <Link href="/magazalar" onClick={() => setIsMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50">
              <MapPin size={20} className="mr-3 text-accent" />
              <span className="font-medium">Mağazalarımız</span>
            </Link>

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
                    try { await fetch('/api/auth/logout', { method: 'POST' }) } finally {
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

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />
        <div className="relative bg-[#92D0AA] rounded-2xl shadow-lg shadow-[#92D0AA]/30">
          <div className="flex items-center justify-around py-2 px-1">
            <Link href="/" className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${pathname === '/' ? 'bg-white/25 text-white' : 'text-white/80 hover:bg-white/10'}`}>
              <Home size={20} strokeWidth={pathname === '/' ? 2.5 : 2} />
              <span className="text-[9px] mt-1 font-semibold tracking-wide">Ana Sayfa</span>
            </Link>
            <Link href="/shop" className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${pathname?.startsWith('/shop') || pathname?.startsWith('/marka') ? 'bg-white/25 text-white' : 'text-white/80 hover:bg-white/10'}`}>
              <Grid3X3 size={20} />
              <span className="text-[9px] mt-1 font-semibold tracking-wide">Kategoriler</span>
            </Link>
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="flex flex-col items-center justify-center w-14 h-14 -mt-5 bg-white rounded-full shadow-lg shadow-black/15 text-[#92D0AA] transition-transform duration-200 active:scale-95"
            >
              <Search size={22} strokeWidth={2.5} />
            </button>
            <Link href="/cart" className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 relative ${pathname === '/cart' ? 'bg-white/25 text-white' : 'text-white/80 hover:bg-white/10'}`}>
              <div className="relative">
                <ShoppingBag size={20} />
                {mounted && cartCount > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 bg-[#F1EB9C] text-[#92D0AA] text-[8px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center ${cartBump ? 'animate-bounce' : ''}`}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-1 font-semibold tracking-wide">Sepetim</span>
            </Link>
            <Link href={authUser ? '/hesabim' : '/login'} className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${pathname?.startsWith('/hesabim') || pathname === '/login' ? 'bg-white/25 text-white' : 'text-white/80 hover:bg-white/10'}`}>
              <User size={20} />
              <span className="text-[9px] mt-1 font-semibold tracking-wide">{authUser ? 'Hesabım' : 'Giriş'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {isMobileSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
            <button
              onClick={() => { setIsMobileSearchOpen(false); setSearchValue('') }}
              className="p-2 -ml-1 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X size={22} />
            </button>
            <form onSubmit={(e) => { e.preventDefault(); doSearch() }} className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#92D0AA] pointer-events-none">
                <Search size={17} />
              </div>
              <input
                type="text"
                placeholder="Ürün, marka veya kategori ara..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#92D0AA] focus:ring-2 focus:ring-[#92D0AA]/20 focus:bg-white transition-all"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => { setSearchValue(''); setSearchResults([]) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X size={15} />
                </button>
              )}
            </form>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading */}
            {searchLoading && (
              <div className="flex items-center justify-center gap-3 py-12 text-gray-400">
                <div className="w-5 h-5 border-2 border-[#92D0AA]/30 border-t-[#92D0AA] rounded-full animate-spin" />
                <span className="text-sm">Aranıyor...</span>
              </div>
            )}

            {/* Results */}
            {!searchLoading && searchResults.length > 0 && (
              <div>
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {searchResults.length} ürün bulundu
                  </span>
                  <button
                    onClick={doSearch}
                    className="text-xs font-semibold text-[#92D0AA]"
                  >
                    Tümünü gör →
                  </button>
                </div>
                {searchResults.map((p: any, idx: number) => (
                  <Link
                    key={p.id || p.slug}
                    href={`/product/${p.slug}`}
                    onClick={() => { setIsMobileSearchOpen(false); setSearchValue('') }}
                    className={`flex items-center gap-4 px-4 py-4 active:bg-[#92D0AA]/5 ${idx < searchResults.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <div className="w-full h-full bg-[#92D0AA]/10 flex items-center justify-center">
                          <Search size={16} className="text-[#92D0AA]/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.brand}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#92D0AA]">₺{Number(p.price).toFixed(0)}</p>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <p className="text-xs text-gray-400 line-through">₺{Number(p.originalPrice).toFixed(0)}</p>
                      )}
                    </div>
                  </Link>
                ))}
                {/* CTA */}
                <div className="p-4">
                  <button
                    onClick={doSearch}
                    className="w-full py-3.5 rounded-2xl bg-[#92D0AA] text-white text-sm font-semibold flex items-center justify-center gap-2 active:bg-[#7BC496] transition-colors"
                  >
                    <Search size={15} />
                    Tüm sonuçları gör
                  </button>
                </div>
              </div>
            )}

            {/* No results */}
            {!searchLoading && searchValue.trim() && searchResults.length === 0 && (
              <div className="py-16 text-center px-8">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-600 font-medium">&ldquo;{searchValue}&rdquo; bulunamadı</p>
                <p className="text-gray-400 text-sm mt-1">Farklı bir kelime deneyin</p>
              </div>
            )}

            {/* Empty state - show categories */}
            {!searchLoading && !searchValue.trim() && (
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Kategoriler</p>
                <div className="grid grid-cols-2 gap-2">
                  {categoryList.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/shop/${cat.slug}`}
                      onClick={() => setIsMobileSearchOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-[#92D0AA]/10 hover:text-[#92D0AA] transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#92D0AA] flex-shrink-0" />
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
