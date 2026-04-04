'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Mail, ArrowRight, CheckCircle } from 'lucide-react'

const TURNSTILE_SITE_KEY = '0x4AAAAAAC0gHEUeei8_bzqf'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Turnstile script yükle
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Geçerli bir e-posta adresi girin.')
      return
    }

    if (!turnstileToken) {
      setError('Lütfen robot olmadığınızı doğrulayın.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data?.error === 'CAPTCHA_FAILED') {
          setError('Güvenlik doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin.')
        } else {
          setError('Bir hata oluştu. Lütfen tekrar deneyin.')
        }
        // Turnstile'ı sıfırla
        if (widgetIdRef.current && (window as any).turnstile) {
          ;(window as any).turnstile.reset(widgetIdRef.current)
          setTurnstileToken(null)
        }
        return
      }

      setSuccess(true)
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="cs_height_40 cs_height_lg_30"></div>

      <section className="bg-gradient-to-br from-accent via-accent/90 to-accent-strong py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-sf-pro font-bold mb-2 md:mb-4">
              Şifremi Unuttum
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-sf-pro font-light max-w-2xl mx-auto px-2">
              E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

              {success ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h2 className="text-xl font-sf-pro font-bold text-primary mb-3">
                    E-posta Gönderildi
                  </h2>
                  <p className="text-gray-600 font-sf-pro text-sm mb-6">
                    Eğer <strong>{email}</strong> adresiyle kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi. Lütfen gelen kutunuzu ve spam klasörünüzü kontrol edin.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center space-x-2 bg-accent text-white py-3 px-6 rounded-lg font-sf-pro font-semibold hover:bg-accent/90 transition-colors"
                  >
                    <span>Giriş Sayfasına Dön</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-sf-pro font-bold text-primary mb-2">
                      Şifre Sıfırla
                    </h2>
                    <p className="text-gray-600 font-sf-pro text-sm">
                      Hesabınıza bağlı e-posta adresini girin
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-700 text-sm font-sf-pro">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-sf-pro font-medium text-gray-700 mb-2">
                        E-posta Adresi
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro"
                          placeholder="ornek@email.com"
                          required
                        />
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
                          <span>Gönderiliyor...</span>
                        </>
                      ) : (
                        <>
                          <span>Sıfırlama Bağlantısı Gönder</span>
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-6">
                    <Link href="/login" className="text-sm font-sf-pro text-accent hover:text-accent/80 transition-colors">
                      ← Giriş sayfasına dön
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
