'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function CategoryGrid() {
  const categories = [
    {
      id: 1,
      title: 'CİLT BAKIMI',
      image: '/main/ciltbakimm.jpg',
      link: '/shop/cilt-bakimi'
    },
    {
      id: 2,
      title: 'MAKYAJ',
      image: '/main/renklikozmetik.jpg',
      link: '/shop/makyaj'
    },
    {
      id: 3,
      title: 'SAÇ BAKIMI',
      image: '/main/sacbakimm.jpg',
      link: '/shop/sac-bakimi'
    },
    {
      id: 4,
      title: 'KİŞİSEL BAKIM',
      image: '/main/kisiselbakim.jpg',
      link: '/shop/kisisel-bakim'
    }
  ]

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.link}
              className="group relative flex flex-row items-end overflow-hidden cursor-pointer"
              style={{
                border: '2px solid #EEE695',
                borderRadius: '20px',
                minHeight: '450px'
              }}
            >
              {/* Background Image */}
              <div className="absolute inset-0 overflow-hidden rounded-[18px]">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  unoptimized
                />
              </div>

              {/* Category Title - White text in bottom left */}
              <div className="relative z-10 w-full" style={{ padding: '20px 30px' }}>
                <h3 
                  className="font-grift font-bold uppercase text-white"
                  style={{
                    fontSize: '24px',
                    lineHeight: '1.2'
                  }}
                >
                  {category.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

