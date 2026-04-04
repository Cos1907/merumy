'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Newsletter from '../components/Newsletter'
import LiveChat from '../components/LiveChat'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react'

const TURNSTILE_SITE_KEY = '0x4AAAAAAC0gHEUeei8_bzqf'

export default function SignupPage() {
  const router = useRouter()
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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false,
    acceptNewsletter: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir'
    }
    
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gereklidir'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin'
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalıdır'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gereklidir'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir'
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası girin'
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Kullanım şartlarını kabul etmelisiniz'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      if (!turnstileToken) {
        setErrors({ general: 'Lütfen robot olmadığınızı doğrulayın.' })
        setIsLoading(false)
        return
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          turnstileToken,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data?.error === 'EMAIL_EXISTS') {
          setErrors({ email: 'Bu e-posta adresi zaten kayıtlı.' })
        } else if (data?.error === 'WEAK_PASSWORD') {
          setErrors({ password: 'Şifre en az 8 karakter olmalıdır.' })
        } else if (data?.error === 'MISSING_FIELDS') {
          setErrors({ general: 'Lütfen gerekli alanları doldurun.' })
        } else if (data?.error === 'CAPTCHA_FAILED') {
          setErrors({ general: 'Güvenlik doğrulaması başarısız. Lütfen sayfayı yenileyip tekrar deneyin.' })
        } else {
          setErrors({ general: 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.' })
        }
        // Turnstile'ı sıfırla
        if (widgetIdRef.current && (window as any).turnstile) {
          ;(window as any).turnstile.reset(widgetIdRef.current)
          setTurnstileToken(null)
        }
        return
      }

      router.push('/')
      router.refresh()
    } catch (error) {
      setErrors({ general: 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.' })
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 2) return 'bg-red-500'
    if (strength < 4) return 'bg-accent-strong'
    return 'bg-accent'
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 2) return 'Zayıf'
    if (strength < 4) return 'Orta'
    return 'Güçlü'
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
              MERUMY Ailesine Katılın
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-sf-pro font-light max-w-2xl mx-auto px-2">
              Kore güzellik dünyasının kapılarını açın ve 
              <span className="font-semibold"> özel üyelik avantajlarından</span> yararlanın.
            </p>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-white" />
                </div>
                <h2 className="cs_fs_36 font-sf-pro font-bold text-primary mb-2">
                  Hesap Oluştur
                </h2>
                <p className="cs_fs_16 font-sf-pro text-gray-600">
                  Ücretsiz hesap oluşturun ve avantajlardan yararlanın
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
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block cs_fs_14 font-sf-pro font-medium text-gray-700 mb-2">
                      Ad *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Adınız"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-red-500 cs_fs_12 font-sf-pro mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block cs_fs_14 font-sf-pro font-medium text-gray-700 mb-2">
                      Soyad *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Soyadınız"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-red-500 cs_fs_12 font-sf-pro mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block cs_fs_14 font-sf-pro font-medium text-gray-700 mb-2">
                    E-posta Adresi *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="ornek@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 cs_fs_12 font-sf-pro mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block cs_fs_14 font-sf-pro font-medium text-gray-700 mb-2">
                    Telefon Numarası *
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+90 5XX XXX XX XX"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 cs_fs_12 font-sf-pro mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block cs_fs_14 font-sf-pro font-medium text-gray-700 mb-2">
                    Şifre *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                  
                  {/* Password Strength */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength(formData.password))}`}
                            style={{ width: `${(passwordStrength(formData.password) / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`cs_fs_12 font-sf-pro font-medium ${
                          passwordStrength(formData.password) < 2 ? 'text-red-500' :
                          passwordStrength(formData.password) < 4 ? 'text-accent-strong' : 'text-accent'
                        }`}>
                          {getPasswordStrengthText(passwordStrength(formData.password))}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="text-red-500 cs_fs_12 font-sf-pro mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block cs_fs_14 font-sf-pro font-medium text-gray-700 mb-2">
                    Şifre Tekrarı *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 cs_fs_12 font-sf-pro mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms and Newsletter */}
                <div className="space-y-4">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent mt-1"
                    />
                    <span className="cs_fs_14 font-sf-pro text-gray-600">
                      <a href="/kullanim-sartlari" className="text-accent hover:text-accent/80 underline">Kullanım Şartları</a>,{' '}
                      <a href="/gizlilik-politikasi" className="text-accent hover:text-accent/80 underline">Gizlilik Politikası</a> ve{' '}
                      <a href="/kvkk-aydinlatma" className="text-accent hover:text-accent/80 underline">KVKK Aydınlatma Metni</a>&apos;ni okudum ve kabul ediyorum. *
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-red-500 cs_fs_12 font-sf-pro">{errors.acceptTerms}</p>
                  )}

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="acceptNewsletter"
                      checked={formData.acceptNewsletter}
                      onChange={handleChange}
                      className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent mt-1"
                    />
                    <span className="cs_fs_14 font-sf-pro text-gray-600">
                      MERUMY'nin özel kampanyaları ve yeni ürünler hakkında e-posta almak istiyorum.
                    </span>
                  </label>
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
                      <span>Hesap oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <span>Hesap Oluştur</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-8">
                <p className="cs_fs_16 font-sf-pro text-gray-600">
                  Zaten hesabınız var mı?{' '}
                  <a
                    href="/login"
                    className="text-accent hover:text-accent/80 transition-colors font-semibold"
                  >
                    Giriş Yapın
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h3 className="cs_fs_18 font-sf-pro font-semibold text-primary mb-2">
                Ücretsiz Üyelik
              </h3>
              <p className="cs_fs_14 font-sf-pro text-gray-600">
                Hiçbir ücret ödemeden üye olun
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="cs_fs_18 font-sf-pro font-semibold text-primary mb-2">
                Özel İndirimler
              </h3>
              <p className="cs_fs_14 font-sf-pro text-gray-600">
                Üyelere özel %15 indirim
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="cs_fs_18 font-sf-pro font-semibold text-primary mb-2">
                Ücretsiz Kargo
              </h3>
              <p className="cs_fs_14 font-sf-pro text-gray-600">
                1000 TL üzeri ücretsiz kargo
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="cs_fs_18 font-sf-pro font-semibold text-primary mb-2">
                Uzman Danışmanlık
              </h3>
              <p className="cs_fs_14 font-sf-pro text-gray-600">
                Kişisel cilt analizi
              </p>
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
