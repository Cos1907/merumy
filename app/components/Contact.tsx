'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Form verilerini info@merumy.com adresine gönder
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-white">
      {/* Title */}
      <div className="mb-10">
        <h1 className="text-4xl lg:text-5xl font-bold font-grift uppercase" style={{ color: '#92D0AA' }}>
          BİZE ULAŞIN
        </h1>
        <p className="mt-4 text-gray-600">
          Güzel müşterilerimizden haber almayı çok seviyoruz! Aşağıdaki formu kullanarak bizimle iletişime geçmekten çekinmeyin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
        {/* Form */}
        <div className="h-full rounded-2xl border border-gray-200 p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Adınız ve Soyadınız"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#92D0AA]/50 px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/40"
              />
              <input
                type="email"
                name="email"
                placeholder="E-Posta Adresiniz"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#92D0AA]/50 px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/40"
              />
            </div>

            <textarea
              name="message"
              placeholder="Mesajınız"
              value={formData.message}
              onChange={handleChange}
              required
              rows={10}
              className="w-full resize-none rounded-xl border border-[#92D0AA]/50 px-5 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#92D0AA]/40"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl py-3 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#92D0AA' }}
            >
              {isSubmitting ? 'GÖNDERİLİYOR...' : 'GÖNDER'}
            </button>

            {submitStatus === 'success' && (
              <div className="rounded-xl border border-[#92D0AA]/40 bg-[#92D0AA]/10 p-4 text-sm" style={{ color: '#2f6b4a' }}>
                Teşekkürler! Mesajınız başarıyla gönderildi.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Üzgünüz, mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyin.
              </div>
            )}
          </form>
        </div>

        {/* Right image */}
        <div
          className="relative h-full min-h-[420px] overflow-hidden rounded-2xl border-2"
          style={{ borderColor: '#EEE695' }}
        >
          <Image
            src="/main/iletisim/iletisimsag.jpg"
            alt="İletişim görseli"
            fill
            className="object-cover"
            quality={100}
          />
        </div>
      </div>
    </section>
  )
}
