'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

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
      question: "Distribütörlük başvurusu nasıl yapabilirim?",
      answer: "İş ortaklığı başvurularınız için bizimle iletişime geçebilirsiniz. Karlı iş modelimiz ve geniş dağıtım ağımızla büyüyen K-Beauty pazarında yerinizi alın."
    },
    {
      question: "Ürünleriniz hayvan dostu mu?",
      answer: "Evet, tüm K-Beauty ürünlerimiz cruelty-free sertifikalıdır. Kore'deki partner markalarımız da hayvan testi yapmayan markalardır."
    }
  ]

  return (
    <section className="py-20 bg-accent-light">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <h2 className="cs_fs_48 font-sf-pro font-bold text-primary mb-6 leading-tight">
              Sorularınız mı var?
            </h2>
            <h3 className="cs_fs_36 font-sf-pro font-semibold text-accent mb-8">
              Cevaplarımız var!
            </h3>
            <div className="relative">
              <div className="w-80 h-[28rem] bg-accent rounded-full overflow-hidden mx-auto">
                <Image 
                  src="/images/sss.jpg" 
                  alt="SSS Görseli" 
                  width={320} 
                  height={448}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white cs_radius_12 overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="cs_fs_24 font-medium text-primary pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown 
                      size={20} 
                      className={`text-accent transition-transform ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6">
                      <p className="text-secondary cs_fs_16 font-light leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
