'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function CategoryCards() {
  const topCategories = [
    {
      id: 1,
      title: 'CİLT BAKIM',
      image: '/main/ciltbakim.jpg',
      link: '/shop/cilt-bakimi'
    },
    {
      id: 2,
      title: 'MAKYAJ',
      image: '/main/renklikozmetik.png',
      link: '/shop/makyaj'
    }
  ]

  const bottomCategory = {
    id: 3,
    title: 'SAÇ BAKIM',
    image: '/main/sacbakim.png',
    link: '/shop/sac-bakimi'
  }

  return (
    <section className="py-6 md:py-12 bg-white">
      <div className="container mx-auto px-2 md:px-4">
        {/* Top Row: Two panels side-by-side - Mobil için optimize edildi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-3 md:mb-6">
          {topCategories.map((category) => (
            <Link 
              key={category.id} 
              href={category.link}
              className="group relative flex flex-row items-end overflow-hidden cursor-pointer border-2 border-[#EEE695] rounded-xl md:rounded-[20px] p-3 md:p-[20px_30px] min-h-[150px] md:min-h-[253px]"
            >
              <div className="absolute inset-0 overflow-hidden rounded-xl md:rounded-[18px]">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              {/* Category Title - Mobil için küçültüldü */}
              <div className="relative z-10">
                <h3 className="text-white uppercase font-grift font-bold text-xl md:text-[44px] leading-tight md:leading-[55px]">
                  {category.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Row: One full-width panel - Mobil için optimize edildi */}
        <div className="w-full">
          <Link 
            href={bottomCategory.link}
            className="group relative flex flex-row items-end overflow-hidden cursor-pointer border-2 border-[#EEE695] rounded-xl md:rounded-[20px] p-3 md:p-[20px_30px] min-h-[150px] md:min-h-[300px]"
          >
            <div className="absolute inset-0 overflow-hidden rounded-xl md:rounded-[18px]">
              <Image
                src={bottomCategory.image}
                alt={bottomCategory.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="100vw"
              />
            </div>
            
            {/* Category Title - Mobil için küçültüldü */}
            <div className="relative z-10">
              <h3 className="text-white uppercase font-grift font-bold text-xl md:text-[44px] leading-tight md:leading-[55px]">
                {bottomCategory.title}
              </h3>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

