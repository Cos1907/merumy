'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, XCircle } from 'lucide-react'

const TURNSTILE_SITE_KEY = '0x4AAAAAAC0gHEUeei8_bzqf'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get('token') || ''

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  // Token geçerliliğini kontrol et
  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      return
    }
    fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setTokenValid(d.valid === true))
      .catch(() => setTokenValid(false))
  }, [token])

  // Turnstile widget yükle
  useEffect(() => {
    const scriptId = 'cf-turnstile-script'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const renderWidget = () => {
      if (turnstileRef.current && (window as any).turnstile && !widgetIdRef.current) {
        widgetIdRef.current = (window as any).turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (t: string) => setTurnstileToken(t),
          'expired-callback': () => setTurnstileToken(null),
          'error-callback': () => setTurnstileToken(null),
          theme: 'light',
        })
      }
    }

    const timer = setTimeout(renderWidget, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (!turnstileToken) {
      setError('Lütfen robot olmadığınızı doğrulayın.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: formData.password, turnstileToken }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data?.error === 'INVALID_OR_EXPIRED_TOKEN') {
          setError('Bu bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama bağlantısı isteyin.')
        } else if (data?.error === 'CAPTCHA_FAILED') {
          setError('Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.')
          if (widgetIdRef.current && (window as any).turnstile) {
            ;(window as any).turnstile.reset(widgetIdRef.current)
            setTurnstileToken(null)
          }
        } else {
          setError('Bir hata oluştu. Lütfen tekrar deneyin.')
        }
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = (pw: string) => {
    let s = 0
    if (pw.length >= 8) s++
    if (/[a-z]/.test(pw)) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }

  const strengthColor = (s: number) => s < 2 ? 'bg-red-500' : s < 4 ? 'bg-yellow-500' : 'bg-accent'
  const strengthText = (s: number) => s < 2 ? 'Zayıf' : s < 4 ? 'Orta' : 'Güçlü'

  if (tokenValid === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-sf-pro font-bold text-primary mb-3">Geçersiz Bağlantı</h2>
          <p className="text-gray-600 font-sf-pro text-sm mb-6">
            Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center space-x-2 bg-accent text-white py-3 px-6 rounded-lg font-sf-pro font-semibold hover:bg-accent/90 transition-colors"
          >
            <span>Yeni Bağlantı İste</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-xl font-sf-pro font-bold text-primary mb-3">Şifre Güncellendi!</h2>
          <p className="text-gray-600 font-sf-pro text-sm mb-6">
            Şifreniz başarıyla güncellendi. Birkaç saniye içinde giriş sayfasına yönlendiriliyorsunuz...
          </p>
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 bg-accent text-white py-3 px-6 rounded-lg font-sf-pro font-semibold hover:bg-accent/90 transition-colors"
          >
            <span>Giriş Yap</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-sf-pro font-bold text-primary mb-2">Yeni Şifre Belirle</h2>
          <p className="text-gray-600 font-sf-pro text-sm">En az 8 karakterli güçlü bir şifre seçin</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm font-sf-pro">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Yeni Şifre */}
          <div>
            <label className="block text-sm font-sf-pro font-medium text-gray-700 mb-2">Yeni Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${strengthColor(passwordStrength(formData.password))}`}
                    style={{ width: `${(passwordStrength(formData.password) / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-sf-pro ${passwordStrength(formData.password) < 2 ? 'text-red-500' : passwordStrength(formData.password) < 4 ? 'text-yellow-600' : 'text-accent'}`}>
                  {strengthText(passwordStrength(formData.password))}
                </span>
              </div>
            )}
          </div>

          {/* Şifre Tekrar */}
          <div>
            <label className="block text-sm font-sf-pro font-medium text-gray-700 mb-2">Şifre Tekrarı</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Cloudflare Turnstile */}
          <div className="flex justify-center">
            <div ref={turnstileRef}></div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !turnstileToken}
            className="w-full bg-accent text-white py-3 rounded-lg text-base font-sf-pro font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Güncelleniyor...</span>
              </>
            ) : (
              <>
                <span>Şifremi Güncelle</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="cs_height_40 cs_height_lg_30"></div>

      <section className="bg-gradient-to-br from-accent via-accent/90 to-accent-strong py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-sf-pro font-bold mb-2 md:mb-4">
              Şifre Sıfırlama
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-sf-pro font-light max-w-2xl mx-auto px-2">
              Hesabınız için yeni bir şifre belirleyin.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </section>

      <Footer />
    </main>
  )
}
