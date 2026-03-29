'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

type ColorMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'grayscale' | 'high-contrast'
type FontSize = 100 | 110 | 125 | 150

const COLOR_FILTERS: Record<ColorMode, string> = {
  none: 'none',
  deuteranopia: 'url(#deuteranopia)',
  protanopia: 'url(#protanopia)',
  tritanopia: 'url(#tritanopia)',
  grayscale: 'grayscale(100%)',
  'high-contrast': 'none',
}

const STORAGE_KEY = 'merumy-accessibility'

interface A11yState {
  colorMode: ColorMode
  fontSize: FontSize
  reduceMotion: boolean
  highContrast: boolean
  highlightLinks: boolean
  letterSpacing: boolean
  dyslexiaFont: boolean
  cursorLarge: boolean
  saturation: number // 0-200 (100 = normal)
}

const DEFAULT_STATE: A11yState = {
  colorMode: 'none',
  fontSize: 100,
  reduceMotion: false,
  highContrast: false,
  highlightLinks: false,
  letterSpacing: false,
  dyslexiaFont: false,
  cursorLarge: false,
  saturation: 100,
}

export default function AccessibilityWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<A11yState>(DEFAULT_STATE)

  // Kaydedilmiş ayarları yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setState({ ...DEFAULT_STATE, ...JSON.parse(saved) })
    } catch {}
  }, [])

  // Ayarları uygula
  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    // — Renk filtresi —
    const filter = COLOR_FILTERS[state.colorMode]
    if (state.colorMode === 'grayscale') {
      html.style.filter = `grayscale(100%) saturate(${state.saturation}%)`
    } else if (state.colorMode !== 'none' && state.colorMode !== 'high-contrast') {
      html.style.filter = `${filter} saturate(${state.saturation}%)`
    } else {
      html.style.filter = state.saturation !== 100 ? `saturate(${state.saturation}%)` : 'none'
    }

    // — Yazı boyutu —
    html.style.fontSize = `${state.fontSize}%`

    // — Harf aralığı —
    body.style.letterSpacing = state.letterSpacing ? '0.12em' : ''
    body.style.wordSpacing = state.letterSpacing ? '0.16em' : ''
    body.style.lineHeight = state.letterSpacing ? '1.8' : ''

    // — Disleksi fontu —
    if (state.dyslexiaFont) {
      html.style.fontFamily = "'Arial', 'Helvetica Neue', sans-serif"
      body.style.fontFamily = "'Arial', 'Helvetica Neue', sans-serif"
    } else {
      html.style.fontFamily = ''
      body.style.fontFamily = ''
    }

    // — Büyük imleç —
    body.style.cursor = state.cursorLarge ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Ccircle cx=\'6\' cy=\'6\' r=\'5\' fill=\'%2392D0AA\' stroke=\'white\' stroke-width=\'2\'/%3E%3Cline x1=\'6\' y1=\'10\' x2=\'6\' y2=\'28\' stroke=\'%2392D0AA\' stroke-width=\'3\'/%3E%3C/svg%3E") 6 6, auto' : ''

    // — Link vurgulama —
    let linkStyle = document.getElementById('a11y-link-style')
    if (state.highlightLinks) {
      if (!linkStyle) {
        linkStyle = document.createElement('style')
        linkStyle.id = 'a11y-link-style'
        document.head.appendChild(linkStyle)
      }
      linkStyle.textContent = 'a { text-decoration: underline !important; color: #0057b7 !important; font-weight: bold !important; }'
    } else {
      linkStyle?.remove()
    }

    // — Hareket azaltma —
    let motionStyle = document.getElementById('a11y-motion-style')
    if (state.reduceMotion) {
      if (!motionStyle) {
        motionStyle = document.createElement('style')
        motionStyle.id = 'a11y-motion-style'
        document.head.appendChild(motionStyle)
      }
      motionStyle.textContent = '*, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }'
    } else {
      motionStyle?.remove()
    }

    // — Yüksek kontrast —
    let contrastStyle = document.getElementById('a11y-contrast-style')
    if (state.highContrast) {
      html.setAttribute('data-high-contrast', '1')
      if (!contrastStyle) {
        contrastStyle = document.createElement('style')
        contrastStyle.id = 'a11y-contrast-style'
        document.head.appendChild(contrastStyle)
      }
      contrastStyle.textContent = `
        body { background: #000 !important; color: #fff !important; }
        a { color: #ffff00 !important; }
        button { background: #fff !important; color: #000 !important; border: 2px solid #fff !important; }
        img { filter: contrast(150%) !important; }
      `
    } else {
      html.removeAttribute('data-high-contrast')
      contrastStyle?.remove()
    }

    // Kaydet
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  const update = (patch: Partial<A11yState>) => setState((s) => ({ ...s, ...patch }))
  const reset = () => setState(DEFAULT_STATE)

  const activeCount = [
    state.colorMode !== 'none',
    state.fontSize !== 100,
    state.reduceMotion,
    state.highContrast,
    state.highlightLinks,
    state.letterSpacing,
    state.dyslexiaFont,
    state.cursorLarge,
    state.saturation !== 100,
  ].filter(Boolean).length

  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      {/* SVG Filter Definitions */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
          </filter>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      {/* Sağ taraf şerit butonu */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Erişilebilirlik menüsünü aç"
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 9997,
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          backgroundColor: '#92D0AA',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          padding: '14px 7px',
          borderRadius: '8px 0 0 8px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          userSelect: 'none',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#7bbf97' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#92D0AA' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="4" r="2" />
          <path d="M12 7c-3.3 0-6 .9-6 2v1h12V9c0-1.1-2.7-2-6-2z" />
          <path d="M7 12l-2 7h2l1.5-4 1.5 2v5h2v-5l1.5-2L15 19h2l-2-7H7z" />
        </svg>
        <span>ERİŞİM</span>
        {activeCount > 0 && (
          <span style={{
            backgroundColor: '#fff',
            color: '#92D0AA',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            fontWeight: 800,
            writingMode: 'horizontal-tb',
          }}>
            {activeCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 9996, backgroundColor: 'rgba(0,0,0,0.3)' }}
          />

          <div
            role="dialog"
            aria-label="Erişilebilirlik Menüsü"
            style={{
              position: 'fixed',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 9999,
              width: '320px',
              maxWidth: '95vw',
              maxHeight: '92vh',
              overflowY: 'auto',
              backgroundColor: '#fff',
              borderRadius: '16px 0 0 16px',
              boxShadow: '-4px 0 32px rgba(0,0,0,0.18)',
              padding: '20px',
            }}
          >
            {/* Başlık */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#222' }}>♿ Erişilebilirlik</h2>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#888' }}>Görüntüleme tercihlerinizi ayarlayın</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#999', lineHeight: 1, padding: '4px' }}
                aria-label="Kapat"
              >×</button>
            </div>

            {/* ── 1. Renk Görme ── */}
            <Section title="🎨 Renk Görme Modu">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {([
                  ['none', 'Normal', '🟢'],
                  ['deuteranopia', 'Yeşil Körlüğü', '🔵'],
                  ['protanopia', 'Kırmızı Körlüğü', '🔴'],
                  ['tritanopia', 'Mavi Körlüğü', '🟣'],
                  ['grayscale', 'Gri Tonlama', '⬜'],
                  ['high-contrast', 'Yüksek Kontrast', '⚫'],
                ] as [ColorMode, string, string][]).map(([mode, label, icon]) => (
                  <button
                    key={mode}
                    onClick={() => update({ colorMode: mode, ...(mode === 'high-contrast' ? { highContrast: !state.highContrast } : {}) })}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '8px',
                      border: state.colorMode === mode ? '2px solid #92D0AA' : '2px solid #e5e7eb',
                      backgroundColor: state.colorMode === mode ? '#f0faf4' : '#f9fafb',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: state.colorMode === mode ? 700 : 400,
                      color: state.colorMode === mode ? '#2d7a4f' : '#444',
                      textAlign: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '14px', marginBottom: '2px' }}>{icon}</div>
                    {label}
                  </button>
                ))}
              </div>
            </Section>

            {/* ── 2. Doygunluk ── */}
            <Section title="🌈 Renk Doygunluğu">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: '#888', flexShrink: 0 }}>Az</span>
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={10}
                  value={state.saturation}
                  onChange={(e) => update({ saturation: Number(e.target.value) })}
                  style={{ flex: 1, accentColor: '#92D0AA' }}
                />
                <span style={{ fontSize: '11px', color: '#888', flexShrink: 0 }}>Çok</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#92D0AA', minWidth: '32px', textAlign: 'right' }}>
                  {state.saturation}%
                </span>
              </div>
            </Section>

            {/* ── 3. Yazı Boyutu ── */}
            <Section title="🔤 Yazı Boyutu">
              <div style={{ display: 'flex', gap: '6px' }}>
                {([100, 110, 125, 150] as FontSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => update({ fontSize: size })}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: state.fontSize === size ? '2px solid #92D0AA' : '2px solid #e5e7eb',
                      backgroundColor: state.fontSize === size ? '#f0faf4' : '#f9fafb',
                      cursor: 'pointer',
                      fontSize: `${8 + (size - 100) / 10}px`,
                      fontWeight: state.fontSize === size ? 700 : 400,
                      color: state.fontSize === size ? '#2d7a4f' : '#444',
                      transition: 'all 0.15s',
                    }}
                  >
                    A{size !== 100 ? '+' : ''}
                    <div style={{ fontSize: '9px', marginTop: '2px', fontWeight: 400 }}>{size}%</div>
                  </button>
                ))}
              </div>
            </Section>

            {/* ── 4. Görünüm ── */}
            <Section title="👁️ Görünüm & Okunaklılık">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <ToggleRow
                  label="Harf Aralığı"
                  desc="Harf ve kelime aralığını artır"
                  icon="↔️"
                  active={state.letterSpacing}
                  onChange={(v) => update({ letterSpacing: v })}
                />
                <ToggleRow
                  label="Disleksi Fontu"
                  desc="Arial ile okunabilirliği artır"
                  icon="📖"
                  active={state.dyslexiaFont}
                  onChange={(v) => update({ dyslexiaFont: v })}
                />
                <ToggleRow
                  label="Link Vurgulama"
                  desc="Bağlantıları belirginleştir"
                  icon="🔗"
                  active={state.highlightLinks}
                  onChange={(v) => update({ highlightLinks: v })}
                />
                <ToggleRow
                  label="Yüksek Kontrast"
                  desc="Siyah arka plan, beyaz metin"
                  icon="🌑"
                  active={state.highContrast}
                  onChange={(v) => update({ highContrast: v, colorMode: v ? 'high-contrast' : 'none' })}
                />
              </div>
            </Section>

            {/* ── 5. Hareket & İmleç ── */}
            <Section title="🖱️ Hareket & İmleç">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <ToggleRow
                  label="Animasyonları Durdur"
                  desc="Geçiş ve animasyonları kapat"
                  icon="⏸️"
                  active={state.reduceMotion}
                  onChange={(v) => update({ reduceMotion: v })}
                />
                <ToggleRow
                  label="Büyük İmleç"
                  desc="Fare imlecini büyüt"
                  icon="🖱️"
                  active={state.cursorLarge}
                  onChange={(v) => update({ cursorLarge: v })}
                />
              </div>
            </Section>

            {/* Sıfırla */}
            <button
              onClick={reset}
              style={{
                marginTop: '4px',
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                border: '2px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fee2e2' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9fafb' }}
            >
              ↺ Tüm Ayarları Sıfırla
            </button>

            {activeCount > 0 && (
              <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: '#92D0AA', fontWeight: 600 }}>
                {activeCount} aktif erişilebilirlik ayarı
              </p>
            )}
          </div>
        </>
      )}
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '16px' }}>
      <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </p>
      {children}
    </section>
  )
}

function ToggleRow({
  label, desc, icon, active, onChange,
}: {
  label: string; desc: string; icon: string; active: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 12px',
        borderRadius: '8px',
        backgroundColor: active ? '#f0faf4' : '#f9fafb',
        border: active ? '1px solid #92D0AA' : '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.15s',
        gap: '8px',
      }}
      onClick={() => onChange(!active)}
    >
      <span style={{ fontSize: '15px', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: active ? '#2d7a4f' : '#333' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '10px', color: '#888' }}>{desc}</p>
      </div>
      <div style={{
        width: '40px', height: '22px', borderRadius: '11px',
        backgroundColor: active ? '#92D0AA' : '#d1d5db',
        position: 'relative', flexShrink: 0, transition: 'background-color 0.2s',
      }}>
        <div style={{
          width: '16px', height: '16px', borderRadius: '50%',
          backgroundColor: '#fff',
          position: 'absolute', top: '3px',
          left: active ? '21px' : '3px',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  )
}
