'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from './components/Header'
import Hero from './components/Hero'
import BrandCarousel from './components/BrandCarousel'
import KoreTrendleri from './components/KoreTrendleri'
import CategoryCards from './components/CategoryCards'
import Bestsellers from './components/Bestsellers'
import SpecialOffers from './components/SpecialOffers'
import MerumyExclusive from './components/MerumyExclusive'
import CategoryGrid from './components/CategoryGrid'
import Frankly from './components/Frankly'
// MaskBar removed
import KoreanMakeup from './components/KoreanMakeup'
// SkinCare20 removed
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate loading for smooth transition or data fetching if needed
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 font-engram">Yükleniyor...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      <Hero />
      {/* Page content (except Hero) */}
      <div className="mx-[175px] max-2xl:mx-24 max-xl:mx-12 max-lg:mx-6 max-md:mx-4">
        <BrandCarousel />
        <KoreTrendleri />
        <CategoryCards />
        <Bestsellers />
        <SpecialOffers />
        <MerumyExclusive />
        <CategoryGrid />
        <Frankly />
        <KoreanMakeup />
        <Newsletter />
      </div>
      {/* Keep footer full-width */}
      <Footer />
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </main>
  )
}
