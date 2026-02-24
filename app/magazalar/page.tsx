'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { MapPin, Clock, Phone, Navigation, ChevronRight } from 'lucide-react'

interface Store {
  id: number
  name: string
  address: string
  image: string
  isComingSoon: boolean
  phone?: string
  hours?: string
  mapLink?: string
}

const stores: Store[] = [
  {
    id: 1,
    name: 'Meydan İstanbul AVM',
    address: 'Fatih Sultan Mehmet, Balkan Cd. No:62, 34771, 34764 Ümraniye/İstanbul',
    image: '/magazalar/meydanistanbul.jpg',
    isComingSoon: false,
    phone: '+90 501 061 50 09',
    hours: '10:00 - 22:00',
    mapLink: 'https://maps.app.goo.gl/oZoPiyJWt2iP6YHT6'
  },
  {
    id: 2,
    name: 'Mall of İstanbul',
    address: 'Ziya Gökalp, Süleyman Demirel Blv No:7, 34490 Başakşehir/İstanbul',
    image: '/magazalar/mallofistanbul.jpg',
    isComingSoon: false,
    phone: '+90 501 061 50 09',
    hours: '10:00 - 22:00',
    mapLink: 'https://www.google.com/maps/place//data=!4m2!3m1!1s0x14caa59939b08cf5:0x51dbb16a702cb15a?sa=X&ved=1t:8290&ictx=111'
  },
  {
    id: 3,
    name: "City's Kozyatağı",
    address: 'İçerenköy, Çayır Cd No: 1, 34752 Ataşehir/İstanbul',
    image: '/magazalar/cityskozyatagi.jpg',
    isComingSoon: true,
    phone: '+90 501 061 50 09',
    hours: '10:00 - 22:00',
    mapLink: 'https://www.google.com/maps/place//data=!4m2!3m1!1s0x14cac6498286da1b:0x1884c5c52073115a?sa=X&ved=1t:8290&ictx=111'
  }
]

export default function MagazalarPage() {
  const [headerHeight, setHeaderHeight] = useState(0)
  const [activeStore, setActiveStore] = useState<number | null>(null)

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

      {/* Hero Banner */}
      <div 
        className="w-full relative overflow-hidden" 
        style={{ marginTop: `${headerHeight}px` }}
      >
        {/* Hero Image Container */}
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
          <Image
            src="/magazalar/herobanner.jpg"
            alt="Merumy Mağazaları"
            fill
            className="object-cover"
            priority
            quality={100}
          />
          {/* Green Overlay Layer - %10 opacity */}
          <div className="absolute inset-0 bg-[#92D0AA] opacity-40" />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 lg:pb-20 px-4">
            <div className="text-center">
              <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold font-grift mb-4 drop-shadow-lg">
                MAĞAZALARIMIZ
              </h1>
              <p className="text-white/90 text-lg md:text-xl font-light max-w-2xl mx-auto">
                Kore güzellik dünyasını keşfetmek için en yakın Merumy mağazasını ziyaret edin
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80H1440V40C1440 40 1320 0 1080 0C840 0 720 40 480 40C240 40 120 0 0 0V80Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#92D0AA] font-grift">3</div>
              <div className="text-gray-600 text-sm md:text-base mt-1">Mağaza</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#92D0AA] font-grift">50+</div>
              <div className="text-gray-600 text-sm md:text-base mt-1">Marka</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#92D0AA] font-grift">1000+</div>
              <div className="text-gray-600 text-sm md:text-base mt-1">Ürün</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 lg:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 bg-[#92D0AA]/10 text-[#92D0AA] rounded-full text-sm font-medium mb-4">
              📍 Türkiye Genelinde
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 font-grift">
              Bizi Ziyaret Edin
            </h2>
            <p className="text-gray-600 mt-3 max-w-xl mx-auto">
              K-Beauty&apos;nin büyülü dünyasını keşfetmek için mağazalarımıza bekleriz
            </p>
          </div>

          {/* Store Cards */}
          <div className="space-y-8 lg:space-y-12">
            {stores.map((store, index) => (
              <div 
                key={store.id}
                className={`group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                onMouseEnter={() => setActiveStore(store.id)}
                onMouseLeave={() => setActiveStore(null)}
              >
                <div className={`flex flex-col lg:flex-row ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  {/* Store Image */}
                  <div className="relative w-full lg:w-1/2 h-[280px] md:h-[350px] lg:h-[400px] overflow-hidden">
                    <Image
                      src={store.image}
                      alt={store.name}
                      fill
                      className={`object-cover transition-transform duration-700 ${
                        activeStore === store.id ? 'scale-110' : 'scale-100'
                      }`}
                    />
                    
                    {/* Coming Soon Overlay */}
                    {store.isComingSoon && (
                      <div className="absolute inset-0 bg-[#92D0AA]/90 flex flex-col items-center justify-center">
                        <div className="relative">
                          <div className="absolute -inset-4 bg-white/20 rounded-full blur-xl animate-pulse" />
                          <span className="relative text-white text-3xl md:text-4xl font-bold font-grift tracking-wider">
                            ÇOK YAKINDA
                          </span>
                        </div>
                        <p className="text-white/80 mt-4 text-sm md:text-base">
                          Yeni mağazamız açılıyor!
                        </p>
                      </div>
                    )}

                    {/* Open Badge */}
                    {!store.isComingSoon && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-gray-800 font-medium text-sm">Açık</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Store Info */}
                  <div className="w-full lg:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
                    {/* Store Name */}
                    <div className="mb-6">
                      <span className="text-[#F5B041] text-sm font-semibold uppercase tracking-wider">
                        Mağaza #{store.id}
                      </span>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#92D0AA] mt-2 font-grift">
                        {store.name}
                      </h3>
                    </div>

                    {/* Info Cards */}
                    <div className="space-y-4 mb-8">
                      {/* Address */}
                      <a
                        href={store.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-[#92D0AA]/10 transition-colors cursor-pointer group/address"
                      >
                        <div className="w-10 h-10 bg-[#92D0AA]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/address:bg-[#92D0AA]/20 transition-colors">
                          <MapPin className="w-5 h-5 text-[#92D0AA]" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Adres</span>
                          <p className="text-gray-800 text-sm md:text-base mt-1 group-hover/address:text-[#92D0AA] transition-colors">{store.address}</p>
                        </div>
                      </a>

                      {/* Hours & Phone Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-[#92D0AA]/5 transition-colors">
                          <div className="w-10 h-10 bg-[#92D0AA]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-[#92D0AA]" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Saatler</span>
                            <p className="text-gray-800 text-sm font-medium">{store.hours}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-[#92D0AA]/5 transition-colors">
                          <div className="w-10 h-10 bg-[#92D0AA]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5 text-[#92D0AA]" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Telefon</span>
                            <a href={`tel:${store.phone}`} className="text-gray-800 text-sm font-medium hover:text-[#92D0AA] transition-colors">
                              {store.phone?.replace('+90 ', '0')}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {!store.isComingSoon && store.mapLink && (
                      <a
                        href={store.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#92D0AA] text-white rounded-2xl font-semibold hover:bg-[#7ec49b] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                      >
                        <Navigation className="w-5 h-5" />
                        <span>Yol Tarifi Al</span>
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    )}

                    {store.isComingSoon && (
                      <button
                        disabled
                        className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gray-200 text-gray-500 rounded-2xl font-semibold cursor-not-allowed"
                      >
                        <Clock className="w-5 h-5" />
                        <span>Yakında Açılıyor</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-[#92D0AA]">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-grift mb-6">
            Online Alışverişin Keyfini Çıkarın
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Mağazalarımızı ziyaret edemiyorsanız endişelenmeyin! 
            Tüm ürünlerimize online mağazamızdan ulaşabilirsiniz.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#92D0AA] rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            <span>Alışverişe Başla</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="py-12 bg-[#F5B041]/10">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 font-grift">
                Sorularınız mı var?
              </h3>
              <p className="text-gray-600 mt-1">
                Müşteri hizmetlerimiz size yardımcı olmaktan mutluluk duyar
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#92D0AA] text-[#92D0AA] rounded-full font-semibold hover:bg-[#92D0AA] hover:text-white transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              <span>İletişime Geç</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
