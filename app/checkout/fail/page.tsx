'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, RefreshCw, ArrowLeft, Phone, MessageCircle } from 'lucide-react'

function FailContent() {
  const searchParams = useSearchParams()
  const errorParam = searchParams?.get('error')
  
  // Hata mesajını güvenli şekilde decode et
  let error = 'Ödeme işlemi tamamlanamadı'
  if (errorParam) {
    try {
      error = decodeURIComponent(errorParam)
    } catch {
      error = errorParam
    }
  }

  // Hata mesajlarını kullanıcı dostu hale getir
  const getErrorMessage = (errorCode: string) => {
    const errorMessages: Record<string, string> = {
      '3d_failed': '3D Secure doğrulaması başarısız oldu. Bankanızla iletişime geçebilirsiniz.',
      'missing_data': 'Eksik veya hatalı veri. Lütfen bilgilerinizi kontrol edin.',
      'server_error': 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
      'timeout': 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.',
      'card_declined': 'Kart reddedildi. Farklı bir kart deneyebilirsiniz.',
      'insufficient_funds': 'Yetersiz bakiye.',
      'Ödeme başarısız': 'Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.',
    }
    
    return errorMessages[errorCode] || errorCode
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="Merumy" className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Error Icon */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <XCircle className="w-14 h-14 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Ödeme Başarısız
          </h1>
          <p className="text-gray-600 text-lg">
            Üzgünüz, ödeme işlemi tamamlanamadı.
          </p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg mb-6">
              <XCircle size={18} />
              <span className="text-sm font-medium">Hata Detayı</span>
            </div>
            
            <p className="text-gray-700 text-lg mb-6">
              {getErrorMessage(error)}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-left">
              <h3 className="font-medium text-gray-900 mb-3">Olası Nedenler:</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  Kart bilgileri hatalı girilmiş olabilir
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  Kart limitiniz yetersiz olabilir
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  3D Secure doğrulaması başarısız olmuş olabilir
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  Bankanız işlemi reddetmiş olabilir
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="bg-accent/5 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">Yardıma mı ihtiyacınız var?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+908501234567" 
              className="flex items-center justify-center gap-2 text-accent hover:underline"
            >
              <Phone size={18} />
              <span>0850 123 45 67</span>
            </a>
            <a 
              href="https://wa.me/905551234567" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-green-600 hover:underline"
            >
              <MessageCircle size={18} />
              <span>WhatsApp Destek</span>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/cart"
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
            Sepete Dön
          </Link>
          <Link 
            href="/checkout"
            className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-4 rounded-xl font-medium hover:bg-accent/90 transition-colors"
          >
            <RefreshCw size={20} />
            Tekrar Dene
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Sepetinizdeki ürünler hâlâ saklıdır. Dilediğiniz zaman ödeme işlemini tekrar deneyebilirsiniz.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function FailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    }>
      <FailContent />
    </Suspense>
  )
}

