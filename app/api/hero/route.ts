import { NextResponse } from 'next/server';
import { query } from '../../lib/db';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// Static fallback slides matching the current Hero.tsx hardcoded data
const DEFAULT_SLIDES = [
  { id: 1, desktopImage: '/herosection/herosection01.jpg', mobileImage: '/mobilsliderlar/slider1.jpg', link: '/booster-pro', slideOrder: 1 },
  { id: 2, desktopImage: '/herosection/herosection02.jpg', mobileImage: '/mobilsliderlar/slider2.jpg', link: '/product/00004-retinol-shot-tightening-serum-cilt-elastikiyetini-destekleyen-ve-sikiligin', slideOrder: 2 },
  { id: 3, desktopImage: '/herosection/herosection03.jpg', mobileImage: '/mobilsliderlar/slider3.jpg', link: '/shop', slideOrder: 3 },
  { id: 4, desktopImage: '/herosection/herosection04.jpg', mobileImage: '/mobilsliderlar/slider4.jpg', link: '/product/00003-retinal-shot-tightening-booster-krem-15ml', slideOrder: 4 },
  { id: 5, desktopImage: '/herosection/herosection06.jpg', mobileImage: '/mobilsliderlar/slider5.jpg', link: '/product/00002-age-r-booster-pro-pink', slideOrder: 5 },
  { id: 6, desktopImage: '/herosection/herosection07.jpg', mobileImage: '/mobilsliderlar/slider6.jpg', link: '/shop', slideOrder: 6 },
];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const slides = await query<any[]>(
      'SELECT id, slide_order as slideOrder, desktop_image as desktopImage, mobile_image as mobileImage, link, title FROM hero_slides WHERE is_active = 1 ORDER BY slide_order ASC'
    );
    if (!slides || slides.length === 0) {
      return NextResponse.json({ slides: DEFAULT_SLIDES }, { headers: NO_CACHE_HEADERS });
    }
    return NextResponse.json({ slides }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    // Return default slides on DB error so site never breaks
    return NextResponse.json({ slides: DEFAULT_SLIDES }, { headers: NO_CACHE_HEADERS });
  }
}

