'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function PageTransition() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Start loading animation
    setIsLoading(true)
    setProgress(0)

    // Quick progress animation
    const timer1 = setTimeout(() => setProgress(30), 50)
    const timer2 = setTimeout(() => setProgress(60), 100)
    const timer3 = setTimeout(() => setProgress(90), 150)
    const timer4 = setTimeout(() => {
      setProgress(100)
      // Hide after completion
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 100)
    }, 200)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [pathname, searchParams])

  if (!isLoading && progress === 0) return null

  return (
    <>
      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1">
        <div 
          className="h-full bg-gradient-to-r from-[#92D0AA] via-[#F1EB9C] to-[#92D0AA] transition-all duration-150 ease-out"
          style={{ 
            width: `${progress}%`,
            boxShadow: '0 0 10px rgba(146, 208, 170, 0.7), 0 0 5px rgba(146, 208, 170, 0.5)'
          }}
        />
      </div>

      {/* Subtle overlay fade */}
      <div 
        className={`fixed inset-0 z-[9998] pointer-events-none transition-opacity duration-150 ${
          isLoading && progress < 100 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          background: 'radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.1) 100%)'
        }}
      />
    </>
  )
}

