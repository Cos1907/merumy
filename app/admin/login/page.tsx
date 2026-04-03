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
      <div
        className="hidden lg:flex flex-col justify-between w-[48%] relative overflow-hidden px-16 py-14"
        style={{ background: 'linear-gradient(160deg, #0a1a10 0%, #0d2318 60%, #0a1a10 100%)' }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(146,208,170,1) 1px, transparent 1px), linear-gradient(90deg, rgba(146,208,170,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        {/* Glow */}
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(146,208,170,0.06) 0%, transparent 70%)',
            transform: 'translate(20%, 20%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <img src="/logo.svg" alt="Merumy" className="h-9 w-auto" />
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(146,208,170,0.08)', color: '#92D0AA', border: '1px solid rgba(146,208,170,0.18)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#92D0AA' }} />
            Yönetim Paneli
          </div>

          <div>
            <h1 className="text-4xl font-bold leading-snug text-white">
              Merumy<br />
              <span style={{ color: '#92D0AA' }}>Admin</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Siparişleri yönetin, ürün kataloğunu düzenleyin ve satış verilerini analiz edin.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3 mt-2">
            {[
              'Gerçek zamanlı sipariş takibi',
              'Ürün ve stok yönetimi',
              'Satış raporları ve analizler',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(146,208,170,0.12)', border: '1px solid rgba(146,208,170,0.25)' }}
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="#92D0AA" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © 2026 Merumy. Tüm hakları saklıdır.
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <img src="/logo.svg" alt="Merumy" className="h-8 w-auto mx-auto" />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white tracking-tight">Giriş Yap</h2>
            <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Yönetim paneline erişmek için bilgilerinizi girin.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-6 flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@merumy.com"
                required
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  caretColor: '#92D0AA',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(146,208,170,0.45)'
                  e.currentTarget.style.background = 'rgba(146,208,170,0.04)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 pr-12 py-3 rounded-xl text-white text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    caretColor: '#92D0AA',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'rgba(146,208,170,0.45)'
                    e.currentTarget.style.background = 'rgba(146,208,170,0.04)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
                >
                  {showPassword ? (
                    <svg className="w-4.5 h-4.5 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? 'rgba(146,208,170,0.45)' : '#92D0AA',
                color: '#0a1a10',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#7ec098' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#92D0AA' }}
            >
              {loading ? (
                <>
                  <div
                    className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(10,26,16,0.25)', borderTopColor: '#0a1a10' }}
                  />
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <span>Giriş Yap</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
