'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Newsletter from '../components/Newsletter'
import LiveChat from '../components/LiveChat'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'

const TURNSTILE_SITE_KEY = '0x4AAAAAAC0gHEUeei8_bzqf'
const GOOGLE_CLIENT_ID = '136796381852-n0djijgtd3iq93jerd5hum6ha4lga1r5.apps.googleusercontent.com'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const googleBtnRef = useRef<HTMLDivElement>(null)

  // Cloudflare Turnstile
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
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(null),
          'error-callback': () => setTurnstileToken(null),
          theme: 'light',
        })
      }
    }

    const timer = setTimeout(renderWidget, 500)
    return () => clearTimeout(timer)
  }, [])

  // Google Identity Services — GSI client-side flow (sunucu → Google API çağrısı yok)
  useEffect(() => {
    const scriptId = 'gsi-client-script'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const initGoogle = () => {
      if (!(window as any).google?.accounts?.id) return
      ;(window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          setGoogleLoading(true)
          try {
            const res = await fetch('/api/auth/google/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            })
            if (res.ok) {
              const next = searchParams?.get('next')
              router.push(next || '/')
              router.refresh()
            } else {
              const d = await res.json().catch(() => ({}))
              setErrors({ general: 'Google ile giriş başarısız: ' + (d.error || 'bilinmeyen hata') })
            }
          } catch {
            setErrors({ general: 'Google ile giriş sırasında bir hata oluştu.' })
          } finally {
            setGoogleLoading(false)
          }
        },
      })

      if (googleBtnRef.current) {
        ;(window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          logo_alignment: 'left',
          locale: 'tr',
          width: googleBtnRef.current.offsetWidth || 400,
        })
      }
    }

    // Script zaten yüklüyse hemen init et, değilse load sonrası dene
    if ((window as any).google?.accounts?.id) {
      initGoogle()
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(interval)
          initGoogle()
        }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [router, searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gereklidir'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin'
    }
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    if (!turnstileToken) {
      setErrors({ general: 'Lütfen robot olmadığınızı doğrulayın.' })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          turnstileToken,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data?.error === 'INVALID_CREDENTIALS') {
          setErrors({ general: 'E-posta veya şifre hatalı.' })
        } else if (data?.error === 'CAPTCHA_FAILED') {
          setErrors({ general: 'Güvenlik doğrulaması başarısız. Lütfen sayfayı yenileyip tekrar deneyin.' })
        } else {
          setErrors({ general: 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.' })
        }
        // Turnstile'ı sıfırla
        if (widgetIdRef.current && (window as any).turnstile) {
          ;(window as any).turnstile.reset(widgetIdRef.current)
          setTurnstileToken(null)
        }
        return
      }

      const next = searchParams?.get('next')
      router.push(next || '/')
      router.refresh()
    } catch {
      setErrors({ general: 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="cs_height_40 cs_height_lg_30"></div>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-accent via-accent/90 to-accent-strong py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sf-pro font-bold mb-2 md:mb-4">
              MERUMY&apos;ye Hoş Geldiniz
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-sf-pro font-light max-w-2xl mx-auto px-2">
              Kore güzellik dünyasının kapılarını açın ve 
              <span className="font-semibold"> özel üyelik avantajlarından</span> yararlanın.
            </p>
          </div>
        </div>
      </section>

      {/* Login Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-white" />
                </div>
                <h2 className="cs_fs_36 font-sf-pro font-bold text-primary mb-2">
                  Giriş Yap
                </h2>
                <p className="cs_fs_16 font-sf-pro text-gray-600">
                  Hesabınıza giriş yaparak alışverişe devam edin
                </p>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 cs_fs_14 font-sf-pro">{errors.general}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block cs_fs_14 font-sf-pro font-medium text-gray-700 mb-2">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="ornek@email.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 cs_fs_12 font-sf-pro mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block cs_fs_14 font-sf-pro font-medium text-gray-700 mb-2">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 cs_fs_12 font-sf-pro mt-1">{errors.password}</p>}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent" />
                    <span className="ml-2 cs_fs_14 font-sf-pro text-gray-600">Beni hatırla</span>
                  </label>
                  <a href="/forgot-password" className="cs_fs_14 font-sf-pro text-accent hover:text-accent/80 transition-colors">
                    Şifremi unuttum
                  </a>
                </div>

                {/* Cloudflare Turnstile */}
                <div className="flex justify-center">
                  <div ref={turnstileRef}></div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !turnstileToken}
                  className="w-full bg-accent text-white py-3 rounded-lg cs_fs_18 font-sf-pro font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Giriş yapılıyor...</span>
                    </>
                  ) : (
                    <>
                      <span>Giriş Yap</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 cs_fs_14 font-sf-pro text-gray-500">veya</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                {/* Google — GSI renderButton (client-side, dış bağlantı yok) */}
                <div className="w-full flex justify-center items-center min-h-[48px] relative">
                  {googleLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-10">
                      <div className="w-5 h-5 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  <div ref={googleBtnRef} className="w-full" />
                </div>
                <a href="/api/auth/facebook"
                  className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg cs_fs_16 font-sf-pro font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook ile Giriş Yap</span>
                </a>
              </div>

              {/* Sign Up Link */}
              <div className="text-center mt-8">
                <p className="cs_fs_16 font-sf-pro text-gray-600">
                  Hesabınız yok mu?{' '}
                  <a href="/signup" className="text-accent hover:text-accent/80 transition-colors font-semibold">
                    Kayıt Olun
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="cs_fs_36 font-sf-pro font-bold text-primary mb-4">
              MERUMY Üyeliğinin Avantajları
            </h2>
            <p className="cs_fs_18 font-sf-pro text-gray-600 max-w-2xl mx-auto">
              Üye olarak özel fırsatlar ve avantajlardan yararlanın
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="cs_fs_20 font-sf-pro font-semibold text-primary mb-2">Özel İndirimler</h3>
              <p className="cs_fs_14 font-sf-pro text-gray-600">Üyelere özel %15 indirim ve erken erişim fırsatları</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="cs_fs_20 font-sf-pro font-semibold text-primary mb-2">Ücretsiz Kargo</h3>
              <p className="cs_fs_14 font-sf-pro text-gray-600">1000 TL ve üzeri alışverişlerde ücretsiz kargo avantajı</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="cs_fs_20 font-sf-pro font-semibold text-primary mb-2">Uzman Danışmanlık</h3>
              <p className="cs_fs_14 font-sf-pro text-gray-600">Kişisel cilt analizi ve uzman önerileri</p>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
      <LiveChat />
    </main>
  )
}
