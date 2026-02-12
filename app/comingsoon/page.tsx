'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ComingSoon() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const auth = localStorage.getItem('merumy_authenticated')
    if (auth === 'true') {
      router.push('/')
    }
  }, [router])

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'merumy1907') {
      localStorage.setItem('merumy_authenticated', 'true')
      setIsModalOpen(false)
      router.push('/')
    } else {
      setError('Yanlış şifre. Lütfen tekrar deneyin.')
      setPassword('')
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setError('')
    setPassword('')
  }

  const handleAddressClick = () => {
    const address = 'Meydan AVM, Fatih Sultan Mehmet, Balkan Cd. 34764 Ümraniye/İstanbul'
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isModalOpen ? 'h-screen' : ''}`} style={{ backgroundColor: '#FFFFFF' }}>
      {/* Siyah Şerit - Üstte - Animasyonlu Metin - Mobil için optimize */}
      <div className="absolute top-0 left-0 right-0 bg-black text-white py-3 md:py-4 z-40 overflow-hidden">
        <div className="flex items-center whitespace-nowrap">
          <div className="flex animate-scroll-left">
            <span className="text-sm md:text-lg lg:text-2xl xl:text-3xl px-4 md:px-8 inline-block">
              <span style={{ fontFamily: 'var(--hello-seoul-font)' }}>안녕하세요 터키</span>
              <span className="mx-4">•</span>
              <span style={{ fontFamily: 'var(--hello-seoul-font)' }}>곧 서비스를 제공할 예정입니다</span>
              <span className="mx-4">•</span>
              <span className="font-engram">Merhaba Türkiye</span>
              <span className="mx-4">•</span>
              <span className="font-engram">Çok yakında hizmetinizdeyiz</span>
            </span>
            <span className="text-sm md:text-lg lg:text-2xl xl:text-3xl px-4 md:px-8 inline-block">
              <span style={{ fontFamily: 'var(--hello-seoul-font)' }}>안녕하세요 터키</span>
              <span className="mx-2 md:mx-4">•</span>
              <span style={{ fontFamily: 'var(--hello-seoul-font)' }}>곧 서비스를 제공할 예정입니다</span>
              <span className="mx-2 md:mx-4">•</span>
              <span className="font-engram">Merhaba Türkiye</span>
              <span className="mx-2 md:mx-4">•</span>
              <span className="font-engram">Çok yakında hizmetinizdeyiz</span>
            </span>
            <span className="text-sm md:text-lg lg:text-2xl xl:text-3xl px-4 md:px-8 inline-block">
              <span style={{ fontFamily: 'var(--hello-seoul-font)' }}>안녕하세요 터키</span>
              <span className="mx-2 md:mx-4">•</span>
              <span style={{ fontFamily: 'var(--hello-seoul-font)' }}>곧 서비스를 제공할 예정입니다</span>
              <span className="mx-2 md:mx-4">•</span>
              <span className="font-engram">Merhaba Türkiye</span>
              <span className="mx-2 md:mx-4">•</span>
              <span className="font-engram">Çok yakında hizmetinizdeyiz</span>
            </span>
            <span className="text-sm md:text-lg lg:text-2xl xl:text-3xl px-4 md:px-8 inline-block">
              <span style={{ fontFamily: 'var(--hello-seoul-font)' }}>안녕하세요 터키</span>
              <span className="mx-2 md:mx-4">•</span>
              <span style={{ fontFamily: 'var(--hello-seoul-font)' }}>곧 서비스를 제공할 예정입니다</span>
              <span className="mx-2 md:mx-4">•</span>
              <span className="font-engram">Merhaba Türkiye</span>
              <span className="mx-2 md:mx-4">•</span>
              <span className="font-engram">Çok yakında hizmetinizdeyiz</span>
            </span>
          </div>
        </div>
      </div>

      {/* Giriş Butonu - Sağ Alt */}
      <div className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative bg-white text-black px-4 md:px-6 py-3 md:py-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-105 flex items-center gap-2 md:gap-3 font-engram font-medium text-xs md:text-sm border-2 border-black/10 hover:border-black/20 backdrop-blur-sm"
        >
          <svg 
            className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
          <span>Giriş</span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        </button>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          {/* Modal Content */}
          <div 
            className="bg-white rounded-lg shadow-2xl p-5 md:p-6 w-full max-w-md relative z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-700 font-engram mb-2">
                  Şifre Girişi
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifre giriniz"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-engram text-sm md:text-base"
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="text-red-600 text-sm font-engram bg-red-50 p-3 rounded border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-engram text-sm md:text-base font-medium"
              >
                Giriş Yap
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ana İçerik - Responsive PNG Görselleri - Küçültülmüş ve Fit */}
      <div className="fixed inset-0 top-[48px] md:top-[64px] left-0 right-0 bottom-0 w-full h-[calc(100vh-48px)] md:h-[calc(100vh-64px)] z-0 flex items-center justify-center bg-white">
        {/* Mobil Görsel */}
        <img
          src="/images/coming-soon-mobile.png"
          alt="Coming Soon"
          className="w-full h-full object-contain md:hidden"
        />
        {/* Desktop Görsel */}
        <img
          src="/images/coming-soon-desktop.png"
          alt="Coming Soon"
          className="hidden md:block w-full h-full object-contain"
        />
      </div>

      {/* Adrese Git Butonu - Mobil için optimize */}
      <div className="fixed bottom-4 md:bottom-8 left-4 md:left-8 z-50">
        <button
          onClick={handleAddressClick}
          className="group relative bg-white text-black px-4 md:px-6 py-3 md:py-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-105 flex items-center gap-2 md:gap-3 font-engram font-medium text-xs md:text-sm border-2 border-black/10 hover:border-black/20 backdrop-blur-sm"
        >
          <svg 
            className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 transition-transform duration-300 group-hover:rotate-[-5deg] group-hover:scale-110" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          <span className="hidden sm:inline">Adrese Git</span>
          <span className="sm:hidden">Adres</span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        </button>
      </div>

      <style jsx>{`
        @font-face {
          font-family: 'Hello Seoul';
          src: url('/fonts/HelloSeoul.woff2') format('woff2'),
               url('/fonts/HelloSeoul.woff') format('woff');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        
        .font-hello-seoul {
          font-family: 'Hello Seoul', sans-serif;
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 20s linear infinite;
        }
      `}</style>
    </div>
  )
}

