'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'E-posta veya şifre hatalı')
      }
    } catch {
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0b1117' }}>
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden p-14"
        style={{ background: 'linear-gradient(145deg, #0a1f14 0%, #0d2a1a 50%, #0a1f14 100%)' }}>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #92D0AA 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #92D0AA 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full opacity-3"
          style={{ background: 'radial-gradient(circle, #92D0AA 0%, transparent 60%)', transform: 'translate(-50%, -50%)' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(146,208,170,1) 1px, transparent 1px), linear-gradient(90deg, rgba(146,208,170,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Logo */}
        <div className="relative z-10">
          <img src="/logo.svg" alt="Merumy" className="h-9 w-auto" style={{ filter: 'brightness(0) invert(1) opacity(0.9)' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border"
            style={{ background: 'rgba(146,208,170,0.08)', borderColor: 'rgba(146,208,170,0.2)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#92D0AA' }} />
            <span className="text-sm font-medium" style={{ color: '#92D0AA' }}>Yönetim Paneli</span>
          </div>

          <div>
            <h1 className="text-5xl font-bold leading-tight" style={{ color: '#ffffff' }}>
              Merumy<br />
              <span style={{ color: '#92D0AA' }}>Admin Panel</span>
            </h1>
            <p className="text-lg mt-4 leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Siparişleri yönetin, ürünleri düzenleyin ve satış raporlarını takip edin.
            </p>
          </div>
        </div>

        {/* Bottom Feature Cards */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { icon: '📦', label: 'Sipariş Yönetimi', desc: 'Gerçek zamanlı takip' },
            { icon: '🛍️', label: 'Ürün Yönetimi', desc: 'Stok & fiyat kontrolü' },
            { icon: '📊', label: 'Satış Raporu', desc: 'Detaylı analizler' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl p-4 border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-xs font-semibold text-white">{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <img src="/logo.svg" alt="Merumy" className="h-9 w-auto mx-auto"
              style={{ filter: 'brightness(0) invert(1)' }} />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Tekrar Hoş Geldiniz</h2>
            <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Yönetim paneline erişmek için giriş yapın.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-xl border text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: '#f87171' }}>
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4.5 h-4.5 w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@merumy.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    caretColor: '#92D0AA',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(146,208,170,0.5)'; e.currentTarget.style.background = 'rgba(146,208,170,0.05)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    caretColor: '#92D0AA',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(146,208,170,0.5)'; e.currentTarget.style.background = 'rgba(146,208,170,0.05)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 mt-2"
              style={{
                background: loading ? 'rgba(146,208,170,0.5)' : '#92D0AA',
                color: '#0a1f14',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#7abb96'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#92D0AA'; }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(10,31,20,0.3)', borderTopColor: '#0a1f14' }} />
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              © 2026 Merumy. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
