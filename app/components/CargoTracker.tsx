'use client';

import Link from 'next/link';

export default function CargoTracker() {
  return (
    <Link
      href="/siparis-takip"
      className="text-white hover:text-[#EEE695] transition-colors font-grift font-normal text-[10px] md:text-xs leading-tight"
    >
      Kargo Takip
    </Link>
  );
}
