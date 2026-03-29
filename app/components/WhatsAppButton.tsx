'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function WhatsAppButton() {
  const pathname = usePathname()
  const [showTooltip, setShowTooltip] = useState(false)

  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      {/* Desktop: bottom-left sabit */}
      <div
        className="hidden md:flex items-center"
        style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 9998 }}
      >
        {/* Tooltip - hover'da belirir */}
        {showTooltip && (
          <div
            style={{
              position: 'absolute',
              left: '70px',
              bottom: '50%',
              transform: 'translateY(50%)',
              backgroundColor: '#fff',
              color: '#333',
              padding: '8px 14px',
              borderRadius: '10px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              border: '1px solid rgba(37,211,102,0.25)',
            }}
          >
            💬 Size nasıl yardımcı olabiliriz?
            {/* Sol ok */}
            <span style={{
              position: 'absolute',
              left: '-7px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0, height: 0,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderRight: '7px solid #fff',
            }} />
          </div>
        )}

        <a
          href="https://wa.me/905010615009"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp ile iletişime geç"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37,211,102,0.5)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            transform: showTooltip ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <WhatsAppIcon />
        </a>
      </div>

      {/* Mobil: bottom nav'ın (64px) üstünde */}
      <a
        href="https://wa.me/905010615009"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ile iletişime geç"
        className="flex md:hidden"
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '16px',
          zIndex: 9998,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(37,211,102,0.5)',
        }}
      >
        <WhatsAppIcon size={28} />
      </a>
    </>
  )
}

function WhatsAppIcon({ size = 34 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} fill="white">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.476 2.027 7.785L0 32l8.418-2.007A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.26 13.26 0 01-6.763-1.846l-.486-.289-5.002 1.193 1.217-4.875-.317-.501A13.24 13.24 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.874c-.398-.199-2.355-1.162-2.72-1.295-.364-.133-.63-.199-.895.199-.265.398-1.028 1.295-1.26 1.561-.232.265-.464.299-.862.1-.398-.2-1.68-.619-3.2-1.976-1.183-1.056-1.981-2.36-2.213-2.758-.232-.398-.025-.613.174-.811.179-.178.398-.464.597-.696.199-.232.265-.398.398-.663.133-.265.066-.497-.033-.696-.1-.199-.895-2.157-1.227-2.953-.323-.774-.65-.669-.895-.681l-.763-.013c-.265 0-.696.1-1.06.497-.364.398-1.393 1.362-1.393 3.32s1.426 3.85 1.625 4.115c.199.265 2.807 4.287 6.802 6.014.951.41 1.693.656 2.272.84.954.304 1.823.261 2.51.158.766-.114 2.355-.963 2.688-1.893.332-.93.332-1.727.232-1.893-.099-.166-.364-.265-.762-.464z" />
    </svg>
  )
}
