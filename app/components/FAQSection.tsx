'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function FAQSection() {
  const faqs = [
    {
      question: "Merumy ürünleri gerçekten orijinal Kore ürünleri mi?",
      answer: "Evet, tüm ürünlerimiz Kore'deki partner markalarımızdan doğrudan temin edilmektedir. Orijinallik garantimiz vardır ve her ürünün sertifikasını sunuyoruz."
    },
    {
      question: "K-Beauty rutinimi nasıl oluşturabilirim?",
      answer: "Uzman ekibimiz size kişisel cilt tipinize uygun K-Beauty rutini önerir. Mağazalarımızda ücretsiz cilt analizi hizmeti sunuyoruz."
    },
    {
      question: "Hangi Kore markalarını satıyorsunuz?",
      answer: "Kore'nin önde gelen kozmetik markalarından Cosrx, Innisfree, Etude House, Laneige, Sulwhasoo ve daha birçok popüler markayı portföyümüzde bulunduruyoruz."
    },
    {
      question: "Mağazalarınız nerede bulunuyor?",
      answer: "Alışveriş merkezlerinde konumlandırdığımız perakende noktalarımız bulunmaktadır. En güncel mağaza listesi için web sitemizi ziyaret edebilirsiniz."
    },
    {
      question: "Ürünleriniz hayvan dostu mu?",
      answer: "Evet, tüm K-Beauty ürünlerimiz cruelty-free sertifikalıdır. Kore'deki partner markalarımız da hayvan testi yapmayan markalardır."
    }
  ]

  return (
    <section className="py-20" style={{ backgroundColor: '#92D0AA' }}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Side - Image */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-square w-full max-w-[600px] mx-auto rounded-[30px] overflow-hidden bg-white">
              <Image
                src="/main/faq.png"
                alt="FAQ"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Right Side - FAQ Content */}
          <div className="w-full lg:w-1/2 text-white">
            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`pb-8 ${index !== faqs.length - 1 ? 'border-b border-white/30' : ''}`}
                >
                  <h3 className="text-xl font-bold mb-3 text-[#F1EB9C]">
                    {faq.question}
                  </h3>
                  <p className="text-white/90 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


