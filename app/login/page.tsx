'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Newsletter from '../components/Newsletter'
import LiveChat from '../components/LiveChat'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'

const TURNSTILE_SITE_KEY = '0x4AAAAAAC0gHEUeei8_bzqf'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

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
                <a href="/api/auth/google"
                  className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg cs_fs_16 font-sf-pro font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google ile Giriş Yap</span>
                </a>
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
