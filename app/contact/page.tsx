'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Contact from '../components/Contact'

export default function ContactPage() {
  const [headerHeight, setHeaderHeight] = useState(0)

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
    <main className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Hero banner */}
      <div className="w-full relative overflow-hidden" style={{ marginTop: `${headerHeight}px`, height: '356px' }}>
        <Image
          src="/main/iletisim/iletisimhero.jpg"
          alt="İletişim"
          fill
          className="object-cover"
          priority
          quality={100}
          style={{ filter: 'brightness(1)' }}
        />
        {/* Color overlay */}
        <div
          className="absolute inset-0"
          style={{
            pointerEvents: 'none',
            backgroundColor: 'rgba(123, 202, 162, 0.03)',
          }}
        />
      </div>

      {/* Content */}
      <div className="mx-[175px] max-2xl:mx-24 max-xl:mx-12 max-lg:mx-6 max-md:mx-4">
        <Contact />
      </div>

      <Footer />
    </main>
  )
}
