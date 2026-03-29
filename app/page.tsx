import type { Metadata } from 'next'
import { query } from './lib/db'

// Her request'te DB'den taze veri çek - cache yok
export const dynamic = 'force-dynamic'
export const revalidate = 0
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
import KoreanMakeup from './components/KoreanMakeup'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'

interface HeroSlide {
  id: string | number
  desktopImage: string
  mobileImage: string
  link: string | null
}

export const metadata: Metadata = {
  title: 'Merumy | Kore Güzellik Ürünleri - K-Beauty Türkiye',
  description:
    'Türkiye\'nin K-Beauty destinasyonu Merumy\'de Pyunkang Yul, Anua, Medicube, Cosrx ve daha fazlasını keşfet. Orijinal Kore kozmetik ürünleri hızlı teslimat ile.',
  keywords: 'kore güzellik, k-beauty, kozmetik, cilt bakımı, kore markaları, pyunkang yul, anua, medicube, cosrx, türkiye',
  openGraph: {
    title: 'Merumy | Kore Güzellik Ürünleri - K-Beauty Türkiye',
    description: 'Türkiye\'nin K-Beauty destinasyonu. Orijinal Kore kozmetik ürünleri hızlı teslimat ile.',
    url: 'https://merumy.com',
    siteName: 'Merumy',
    type: 'website',
    images: [{ url: 'https://merumy.com/logo.svg', alt: 'Merumy Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merumy | K-Beauty Türkiye',
    description: 'Orijinal Kore güzellik ürünleri - K-Beauty destinasyonu',
  },
  alternates: { canonical: 'https://merumy.com' },
}

async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const rows = await query<any[]>(
      `SELECT id, desktop_image as desktopImage, mobile_image as mobileImage, link
       FROM hero_slides WHERE is_active = 1 ORDER BY slide_order ASC`
    )
    return rows.map((r) => ({
      id: r.id,
      desktopImage: r.desktopImage || '',
      mobileImage: r.mobileImage || '',
      // Tam URL ise iç URL'ye çevir
      link: r.link ? r.link.replace(/^https?:\/\/merumy\.com/, '') : null,
    }))
  } catch {
    return []
  }
}

export default async function Home() {
  const heroSlides = await getHeroSlides()

  return (
    <main className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      <Hero initialSlides={heroSlides} />
      {/* Page content */}
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
      <Footer />
    </main>
  )
}
