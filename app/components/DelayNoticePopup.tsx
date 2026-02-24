'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { X } from 'lucide-react'

const POPUP_SESSION_KEY = 'merumy_delay_notice_shown'

export default function DelayNoticePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    
    // Admin sayfalarında popup gösterme
    if (pathname?.startsWith('/admin')) {
      return
    }
    
    // localStorage'da daha önce gösterilmiş mi kontrol et (tüm sekmeler için ortak)
    const hasShown = localStorage.getItem(POPUP_SESSION_KEY)
    
    if (!hasShown) {
      // 2 saniye sonra pop-up'ı göster
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [pathname])

  const handleClose = () => {
    setIsOpen(false)
    // localStorage'a kaydet - tarayıcı kapanana kadar tüm sekmelerde tekrar gösterme
    localStorage.setItem(POPUP_SESSION_KEY, 'true')
  }

  // SSR sırasında render etme
  if (!mounted) return null
  
  // Kapalıysa gösterme
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9999] transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-popup"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Left - Image */}
            <div className="relative w-full md:w-2/5 h-48 md:h-auto md:min-h-[350px]">
              <Image
                src="/main/kisiselbakim.jpg"
                alt="Merumy Bilgilendirme"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
              />
              {/* Gradient overlay for text readability on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:hidden" />
            </div>

            {/* Right - Content */}
            <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
              {/* Icon */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#92D0AA]/10 flex items-center justify-center mb-4 md:mb-6">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-[#92D0AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                Değerli Müşterimiz
              </h2>

              {/* Message */}
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 md:mb-6">
                Yoğunluk sebebiyle <strong className="text-gray-800">kargoların hazırlanması ve teslimatında</strong> bazı gecikmeler yaşanmaktadır. 
                Tüm siparişler en kısa sürede hazırlanıp kargoya teslim edilmektedir.
              </p>

              <p className="text-[#92D0AA] font-semibold text-sm md:text-base mb-5 md:mb-6">
                Sabrınız ve anlayışınız için teşekkür ederiz 💚
              </p>

              {/* CTA Button */}
              <button
                onClick={handleClose}
                className="w-full md:w-auto px-8 py-3 bg-[#92D0AA] text-white font-semibold rounded-xl hover:bg-[#7bb896] transition-colors text-sm md:text-base"
              >
                Anladım, Alışverişe Devam Et
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes popup-appear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-popup {
          animation: popup-appear 0.3s ease-out forwards;
        }
      `}</style>
    </>
  )
}

