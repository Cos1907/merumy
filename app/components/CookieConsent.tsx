'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie } from 'lucide-react'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookieConsent')
    if (!hasAccepted) {
      // Show cookie banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
        setTimeout(() => setIsAnimating(true), 50)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    setIsAnimating(false)
    setTimeout(() => setIsVisible(false), 300)
  }

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined')
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    setIsAnimating(false)
    setTimeout(() => setIsVisible(false), 300)
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] transition-all duration-300 ease-out ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      {/* Backdrop blur for mobile */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm md:hidden" />
      
      <div className="relative bg-white border-t-2 border-[#92D0AA] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-4 py-4 md:py-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            {/* Icon */}
            <div className="hidden md:flex w-12 h-12 bg-[#92D0AA]/10 rounded-full items-center justify-center flex-shrink-0">
              <Cookie className="w-6 h-6 text-[#92D0AA]" />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 md:hidden">
                <Cookie className="w-5 h-5 text-[#92D0AA]" />
                <h3 className="font-bold text-[#92D0AA] text-sm">Çerez Kullanımı</h3>
              </div>
              <h3 className="hidden md:block font-bold text-[#92D0AA] text-base mb-1">
                Çerez Kullanımı
              </h3>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                Size en iyi deneyimi sunmak için çerezleri kullanıyoruz. Sitemizi kullanmaya devam ederek{' '}
                <Link 
                  href="/cerez-politikasi" 
                  className="text-[#92D0AA] hover:underline font-medium"
                >
                  çerez politikamızı
                </Link>{' '}
                kabul etmiş olursunuz.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={declineCookies}
                className="flex-1 md:flex-none px-4 md:px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Reddet
              </button>
              <button
                onClick={acceptCookies}
                className="flex-1 md:flex-none px-4 md:px-6 py-2.5 text-sm font-bold text-white bg-[#92D0AA] hover:bg-[#7ab594] rounded-xl transition-colors shadow-lg shadow-[#92D0AA]/25"
              >
                Kabul Et
              </button>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={declineCookies}
              className="absolute top-3 right-3 md:hidden p-1 text-gray-400 hover:text-gray-600"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

