'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

// SABİT SLIDER VERİLERİ - Bu veriler hiçbir koşulda değişmez
// State Leakage'ı önlemek için component dışında sabit olarak tanımlandı
interface HeroSlide {
  id: string
  desktopImage: string
  mobileImage: string
  link: string | null
}

// Desktop ve Mobil görüntüler - Sıralama aynı kalıyor (1-6)
const HERO_SLIDES: readonly HeroSlide[] = [
  { 
    id: 'slide-1', 
    desktopImage: '/herosection/herosection01.jpg', 
    mobileImage: '/mobilsliderlar/slider1.jpg',
    link: '/booster-pro' 
  },
  { 
    id: 'slide-2', 
    desktopImage: '/herosection/herosection02.jpg', 
    mobileImage: '/mobilsliderlar/slider2.jpg',
    link: '/product/00004-retinol-shot-tightening-serum-cilt-elastikiyetini-destekleyen-ve-sikiligin' 
  },
  { 
    id: 'slide-3', 
    desktopImage: '/herosection/herosection03.jpg', 
    mobileImage: '/mobilsliderlar/slider3.jpg',
    link: '/shop' 
  },
  { 
    id: 'slide-4', 
    desktopImage: '/herosection/herosection04.jpg', 
    mobileImage: '/mobilsliderlar/slider4.jpg',
    link: '/product/00003-retinal-shot-tightening-booster-krem-15ml' 
  },
  { 
    id: 'slide-5', 
    desktopImage: '/herosection/herosection06.jpg', 
    mobileImage: '/mobilsliderlar/slider5.jpg',
    link: '/product/00002-age-r-booster-pro-pink' 
  },
  { 
    id: 'slide-6', 
    desktopImage: '/herosection/herosection07.jpg', 
    mobileImage: '/mobilsliderlar/slider6.jpg',
    link: '/shop' 
  }
]

const TOTAL_SLIDES = HERO_SLIDES.length

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  useEffect(() => {
    // Calculate header height and detect mobile
    const handleResize = () => {
      const isMobileDevice = window.innerWidth < 768
      setIsMobile(isMobileDevice)
      
      const headerContainer = document.querySelector('.fixed.top-0.left-0.right-0.z-50')
      if (headerContainer) {
        // Mobilde header yüksekliğini tam olarak al, boşluk bırakma
        setHeaderHeight(isMobileDevice ? headerContainer.clientHeight : headerContainer.clientHeight)
      } else {
        // Fallback: mobil için daha küçük header yüksekliği
        setHeaderHeight(isMobileDevice ? 80 : 120)
      }
    }

    // Initial calculation - hemen çalıştır
    handleResize()
    // Tekrar çalıştır (DOM tam yüklendiğinde)
    setTimeout(handleResize, 50)
    window.addEventListener('resize', handleResize)

    // Auto-rotate slides every 5 seconds
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES)
    }, 5000)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    // Reset timer when manually changing slide
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES)
    }, 5000)
  }

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe) {
      goToSlide((currentSlide + 1) % TOTAL_SLIDES)
    }
    if (isRightSwipe) {
      goToSlide((currentSlide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES)
    }
  }

  return (
    <section className="relative w-full overflow-hidden" style={{ marginTop: `${headerHeight}px` }}>
      {/* Desktop Version */}
      <div
        className="relative mx-auto hidden md:block"
        style={{
          width: '100%',
          maxWidth: '1600px',
          aspectRatio: '1600 / 700',
        }}
      >
        {/* Desktop Carousel Container */}
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={`desktop-${slide.id}`}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {slide.link ? (
              <Link href={slide.link} className="w-full h-full relative block cursor-pointer">
                <Image 
                  src={slide.desktopImage}
                  alt={`Hero Slide ${index + 1}`}
                  fill
                  priority={index === 0}
                  quality={100}
                  className="object-contain"
                  sizes="(max-width: 1600px) 100vw, 1600px"
                  unoptimized={false}
                />
              </Link>
            ) : (
              <Image 
                src={slide.desktopImage}
                alt={`Hero Slide ${index + 1}`}
                fill
                priority={index === 0}
                quality={100}
                className="object-contain"
                sizes="(max-width: 1600px) 100vw, 1600px"
                unoptimized={false}
              />
            )}
          </div>
        ))}

        {/* Desktop Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={`desktop-dot-${slide.id}`}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-10'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Desktop Navigation Arrows */}
        <button
          onClick={() => goToSlide((currentSlide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white rounded-full p-3 transition-all duration-300 shadow-lg"
          aria-label="Previous slide"
        >
          <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => goToSlide((currentSlide + 1) % TOTAL_SLIDES)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/80 hover:bg-white rounded-full p-3 transition-all duration-300 shadow-lg"
          aria-label="Next slide"
        >
          <svg 
            className="w-6 h-6 text-gray-800"
            fill="none" 
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Mobile Version - Görseller orijinal boyutlarında, zoom yok */}
      <div
        className="relative w-full md:hidden overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Mobile Carousel Container - Görseller orijinal boyutlarında */}
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={`mobile-${slide.id}`}
            className={`w-full transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'
            }`}
            style={{ zIndex: index === currentSlide ? 10 : 0 }}
          >
            {slide.link ? (
              <Link href={slide.link} className="block w-full">
                <img 
                  src={slide.mobileImage}
                  alt={`Hero Slide ${index + 1}`}
                  className="w-full h-auto block"
                  style={{ display: 'block' }}
                />
              </Link>
            ) : (
              <img 
                src={slide.mobileImage}
                alt={`Hero Slide ${index + 1}`}
                className="w-full h-auto block"
                style={{ display: 'block' }}
              />
            )}
          </div>
        ))}

        {/* Mobile Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {HERO_SLIDES.map((slide, index) => (
            <button
              key={`mobile-dot-${slide.id}`}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-6'
                  : 'bg-white/50 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Mobile Navigation Arrows - Smaller and more subtle */}
        <button
          onClick={() => goToSlide((currentSlide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES)}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 bg-white/60 active:bg-white rounded-full p-1.5 transition-all duration-200 shadow-md"
          aria-label="Previous slide"
        >
          <svg
            className="w-4 h-4 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => goToSlide((currentSlide + 1) % TOTAL_SLIDES)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 bg-white/60 active:bg-white rounded-full p-1.5 transition-all duration-200 shadow-md"
          aria-label="Next slide"
        >
          <svg 
            className="w-4 h-4 text-gray-800"
            fill="none" 
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}
