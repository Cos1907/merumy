'use client'

import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "Siparişimi nasıl takip edebilirim?",
    answer: "Siparişiniz kargoya verildiğinde size e-posta ve SMS ile kargo takip numarası gönderilir. Bu numara ile kargo firmasının web sitesinden veya hesabınızdaki 'Siparişlerim' bölümünden takip edebilirsiniz."
  },
  {
    question: "Kargo ücreti ne kadar?",
    answer: "1000 TL ve üzeri siparişlerde kargo ücretsizdir. 1000 TL altı siparişlerde standart kargo ücreti uygulanır."
  },
  {
    question: "İade ve değişim yapabilir miyim?",
    answer: "Evet, ürünü teslim aldığınız tarihten itibaren 14 gün içinde iade veya değişim yapabilirsiniz. Ürünün kullanılmamış ve orijinal ambalajında olması gerekmektedir."
  },
  {
    question: "Ödeme seçenekleri nelerdir?",
    answer: "Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerini sunmaktayız. Taksitli ödeme imkanı da mevcuttur."
  },
  {
    question: "Ürünler orijinal mi?",
    answer: "Evet, tüm ürünlerimiz Kore'den direkt ithal edilmektedir ve %100 orijinaldir. Sahte veya taklit ürün satışı yapmamaktayız."
  },
  {
    question: "Siparişimi ne zaman alırım?",
    answer: "İstanbul içi siparişler 1-2 iş günü, diğer iller için 2-5 iş günü içinde teslim edilir. Teslimat süreleri kargo yoğunluğuna göre değişebilir."
  },
  {
    question: "Üyelik zorunlu mu?",
    answer: "Sipariş verebilmek için üye olmanız gerekmektedir. Üyelik ücretsizdir ve birçok avantaj sağlar."
  },
  {
    question: "Şifremi unuttum, ne yapmalıyım?",
    answer: "Giriş sayfasındaki 'Şifremi Unuttum' linkine tıklayarak e-posta adresinize şifre sıfırlama bağlantısı gönderebilirsiniz."
  },
  {
    question: "Kampanyalardan nasıl haberdar olurum?",
    answer: "Bültenimize abone olarak veya sosyal medya hesaplarımızı takip ederek kampanyalardan haberdar olabilirsiniz."
  },
  {
    question: "Mağazanız var mı?",
    answer: "Evet, İstanbul'da fiziksel mağazalarımız bulunmaktadır. Mağaza adreslerimiz için 'Mağazalarımız' sayfasını ziyaret edebilirsiniz."
  }
]

export default function SSSPage() {
  const [headerHeight, setHeaderHeight] = useState(0)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const headerContainer = document.querySelector('.fixed.top-0.left-0.right-0.z-50')
      if (headerContainer) {
        setHeaderHeight((headerContainer as HTMLElement).clientHeight)
      } else {
        setHeaderHeight(140)
      }
    }

    setTimeout(calculateHeaderHeight, 50)
    window.addEventListener('resize', calculateHeaderHeight)
    return () => window.removeEventListener('resize', calculateHeaderHeight)
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div style={{ marginTop: `${headerHeight}px` }}>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-[#92D0AA] font-grift mb-8">
            Sıkça Sorulan Sorular
          </h1>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 md:p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-[#92D0AA] flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-4 md:px-6 pb-4 md:pb-6 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 bg-[#92D0AA]/10 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-[#92D0AA] mb-4">Başka Sorunuz mu Var?</h2>
            <p className="text-gray-700 mb-4">
              Aradığınız cevabı bulamadıysanız, bizimle iletişime geçmekten çekinmeyin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:info@merumy.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#92D0AA] text-white rounded-lg font-semibold hover:bg-[#7ab594] transition-colors"
              >
                E-posta Gönder
              </a>
              <a 
                href="tel:+905010615009"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#92D0AA] text-[#92D0AA] rounded-lg font-semibold hover:bg-[#92D0AA] hover:text-white transition-colors"
              >
                Bizi Arayın
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

