'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

interface HeroSlide {
  id: string | number
  desktopImage: string
  mobileImage: string
  link: string | null
}

interface HeroProps {
  initialSlides?: HeroSlide[]
}

// Fallback – sadece DB boşsa kullanılır
const FALLBACK_SLIDES: readonly HeroSlide[] = [
  { id: 'slide-1', desktopImage: '/herosection/herosection01.jpg', mobileImage: '/mobilsliderlar/1.slider.jpg', link: '/booster-pro' },
  { id: 'slide-2', desktopImage: '/herosection/herosection02.jpg', mobileImage: '/mobilsliderlar/2.slider.jpg', link: '/product/00354-celimax-retinal-shot-tightening-booster-15-ml' },
  { id: 'slide-3', desktopImage: '/herosection/herosection03.jpg', mobileImage: '/mobilsliderlar/3.slider.jpg', link: '/shop' },
  { id: 'slide-4', desktopImage: '/herosection/herosection04.jpg', mobileImage: '/mobilsliderlar/4.slider.jpg', link: '/product/00354-celimax-retinal-shot-tightening-booster-15-ml' },
  { id: 'slide-5', desktopImage: '/herosection/herosection06.jpg', mobileImage: '/mobilsliderlar/5.slider.jpg', link: '/product/00001-age-r-booster-pro-black' },
  { id: 'slide-6', desktopImage: '/herosection/herosection07.jpg', mobileImage: '/mobilsliderlar/6.slider.jpg', link: '/shop' },
]

export default function Hero({ initialSlides }: HeroProps) {
  // DB'den gelen slides kullan; yoksa fallback
  const HERO_SLIDES = (initialSlides && initialSlides.length > 0) ? initialSlides : FALLBACK_SLIDES
  const TOTAL_SLIDES = HERO_SLIDES.length

  const [currentSlide, setCurrentSlide] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const minSwipeDistance = 50

  useEffect(() => {
    const handleResize = () => {
      const isMobileDevice = window.innerWidth < 768
      setIsMobile(isMobileDevice)
      const headerContainer = document.querySelector('.fixed.top-0.left-0.right-0.z-50')
      if (headerContainer) {
        setHeaderHeight(headerContainer.clientHeight)
      } else {
        setHeaderHeight(isMobileDevice ? 80 : 120)
      }
    }
    handleResize()
    setTimeout(handleResize, 50)
    window.addEventListener('resize', handleResize)

    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES)
    }, 5000)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [TOTAL_SLIDES])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES)
    }, 5000)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) goToSlide((currentSlide + 1) % TOTAL_SLIDES)
    if (distance < -minSwipeDistance) goToSlide((currentSlide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES)
  }

  // isMobile kullanım (lint için)
  void isMobile

  return (
    <section className="relative w-full overflow-hidden" style={{ marginTop: `${headerHeight}px` }}>
      {/* Desktop Version */}
      <div className="relative mx-auto hidden md:block" style={{ width: '100%', maxWidth: '1600px', aspectRatio: '1600 / 700' }}>
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={`desktop-${slide.id}`}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {slide.link ? (
              <Link href={slide.link} className="w-full h-full relative block cursor-pointer">
                <Image src={slide.desktopImage} alt={`Hero Slide ${index + 1}`} fill priority={index === 0} quality={100} className="object-contain" sizes="(max-width: 1600px) 100vw, 1600px" unoptimized={false} />
              </Link>
            ) : (
              <Image src={slide.desktopImage} alt={`Hero Slide ${index + 1}`} fill priority={index === 0} quality={100} className="object-contain" sizes="(max-width: 1600px) 100vw, 1600px" unoptimized={false} />
            )}
          </div>
        ))}

        {/* Desktop Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {HERO_SLIDES.map((slide, index) => (
            <button key={`desktop-dot-${slide.id}`} onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-10' : 'bg-white/50 w-3 hover:bg-white/75'}`}
              aria-label={`Slide ${index + 1}`} />
          ))}
        </div>

        {/* Desktop Arrows */}
        <button onClick={() => goToSlide((currentSlide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES)} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white rounded-full p-3 transition-all duration-300 shadow-lg" aria-label="Previous slide">
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => goToSlide((currentSlide + 1) % TOTAL_SLIDES)} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white rounded-full p-3 transition-all duration-300 shadow-lg" aria-label="Next slide">
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Mobile Version */}
      <div className="relative w-full md:hidden overflow-hidden" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {HERO_SLIDES.map((slide, index) => (
          <div key={`mobile-${slide.id}`}
            className={`w-full transition-opacity duration-500 ease-in-out ${index === currentSlide ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'}`}
            style={{ zIndex: index === currentSlide ? 10 : 0 }}>
            {slide.link ? (
              <Link href={slide.link} className="block w-full">
                <img src={slide.mobileImage} alt={`Hero Slide ${index + 1}`} className="w-full h-auto block" />
              </Link>
            ) : (
              <img src={slide.mobileImage} alt={`Hero Slide ${index + 1}`} className="w-full h-auto block" />
            )}
          </div>
        ))}

        {/* Mobile Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {HERO_SLIDES.map((slide, index) => (
            <button key={`mobile-dot-${slide.id}`} onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50 w-2'}`}
              aria-label={`Slide ${index + 1}`} />
          ))}
        </div>

        {/* Mobile Arrows */}
        <button onClick={() => goToSlide((currentSlide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES)} className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/60 active:bg-white rounded-full p-1.5 transition-all duration-200 shadow-md" aria-label="Previous slide">
          <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => goToSlide((currentSlide + 1) % TOTAL_SLIDES)} className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/60 active:bg-white rounded-full p-1.5 transition-all duration-200 shadow-md" aria-label="Next slide">
          <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  )
}
