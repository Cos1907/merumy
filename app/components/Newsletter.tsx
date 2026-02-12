'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        if (data.alreadySubscribed) {
          setStatus('already')
          setMessage(data.message)
        } else {
          setStatus('success')
          setMessage(data.message)
          setEmail('')
        }
      } else {
        setStatus('error')
        setMessage(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Bağlantı hatası, lütfen tekrar deneyin')
    }
  }

  return (
    <div className="bg-white py-8 md:py-20">
      <div className="container mx-auto px-3 md:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Başlık - Mobil için optimize edildi */}
          <h2 
            className="text-[#88C6A3] font-bold text-xl md:text-3xl lg:text-4xl mb-4 md:mb-8 uppercase text-center md:text-left"
            style={{ fontFamily: 'Satoshi, sans-serif' }}
          >
            BÜLTENİMİZE ABONE OLUN
          </h2>
          
          {/* Form - Mobil için tam genişlik ve dikey düzen */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:gap-4 w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Posta Adresiniz"
              className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl border-2 border-[#88C6A3] text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#88C6A3]/50 placeholder-gray-400 text-sm md:text-base"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
              required
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full md:w-auto bg-[#88C6A3] text-white px-6 md:px-12 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-sm md:text-lg hover:bg-[#7ab594] transition-colors whitespace-nowrap uppercase disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  GÖNDERİLİYOR...
                </>
              ) : (
                'ABONE OL'
              )}
            </button>
          </form>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="flex items-center gap-2 mt-4 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span>{message}</span>
            </div>
          )}

          {status === 'already' && (
            <div className="flex items-center gap-2 mt-4 text-blue-600 bg-blue-50 px-4 py-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span>{message}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 mt-4 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{message}</span>
            </div>
          )}
          
          {/* Mobil için ek bilgi */}
          <p className="text-gray-500 text-xs md:text-sm mt-3 md:mt-4 text-center md:text-left">
            Kampanyalardan ve yeni ürünlerden ilk siz haberdar olun!
          </p>
        </div>
      </div>
    </div>
  )
}
