'use client'

import Image from 'next/image'

export default function SkinTypeSelector() {
  const skinTypes = [
    {
      name: 'Karma Cilt',
      image: '/images/karisikciltler.png',
      description: 'Dengeleyici ürünlerle karma cildinizi mükemmelleştirin.',
      link: '/shop?skinType=combination'
    },
    {
      name: 'Kuru Cilt',
      image: '/images/kuruciltler.png',
      description: 'Yoğun nemlendirme ile kuru cildinize canlılık katın.',
      link: '/shop?skinType=dry'
    },
    {
      name: 'Normal Cilt',
      image: '/images/normalciltler.png',
      description: 'Sağlıklı ve ışıltılı bir görünüm için normal cildinizi koruyun.',
      link: '/shop?skinType=normal'
    },
    {
      name: 'Yağlı Cilt',
      image: '/images/yagliciltler.png',
      description: 'Yağ dengeleyici ürünlerle parlamayı kontrol altına alın.',
      link: '/shop?skinType=oily'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="cs_fs_48 font-sf-pro font-bold text-primary mb-4">
            Cilt Tipinize Göre Seçin
          </h2>
          <p className="cs_fs_20 font-sf-pro text-gray-600 max-w-3xl mx-auto">
            Cildinizin ihtiyaçlarına özel olarak tasarlanmış ürünleri keşfedin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {skinTypes.map((type, index) => (
            <div key={index} className="relative group">
              <div className="overflow-hidden">
                <Image
                  src={type.image}
                  alt={type.name}
                  width={400}
                  height={500}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 20%' }}
                />
                <div className="absolute top-6 left-6">
                  <h3 className="cs_fs_24 font-sf-pro font-bold text-white drop-shadow-lg">
                    {type.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
