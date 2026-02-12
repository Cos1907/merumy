'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function VideoReels() {
  const [activeVideo, setActiveVideo] = useState(0)

  const reels = [
    {
      id: 1,
      title: "K-Beauty Temizleme Rutini",
      influencer: "@koreabeauty_turkey",
      thumbnail: "/images/category_img_1.png",
      duration: "0:45"
    },
    {
      id: 2,
      title: "Kore Serum Kullanımı",
      influencer: "@merumy_official",
      thumbnail: "/images/category_img_2.png",
      duration: "1:20"
    },
    {
      id: 3,
      title: "K-Beauty Makyaj Trendleri",
      influencer: "@koreabeauty_turkey",
      thumbnail: "/images/category_img_1.png",
      duration: "2:15"
    },
    {
      id: 4,
      title: "Kore Cilt Bakımı İpuçları",
      influencer: "@merumy_official",
      thumbnail: "/images/category_img_2.png",
      duration: "1:45"
    }
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="cs_fs_48 font-sf-pro font-bold text-primary mb-4">
            Instagram Reels
          </h2>
          <p className="cs_fs_20 font-sf-pro text-gray-600 max-w-3xl mx-auto">
            <span className="font-sf-pro font-semibold">Influencer'larımızın</span> 
            <span className="font-bold"> K-Beauty reels'leri</span> ile güzellik dünyasının 
            <span className="font-sf-pro font-semibold"> en son trendlerini</span> keşfedin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reels.map((reel, index) => (
            <div 
              key={reel.id}
              className="relative group cursor-pointer"
              onClick={() => setActiveVideo(index)}
            >
              <div className="cs_radius_12 overflow-hidden aspect-[9/16] relative">
                <Image 
                  src={reel.thumbnail} 
                  alt={reel.title}
                  width={300}
                  height={533}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-colors"></div>
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-opacity-100 transition-colors">
                    <svg className="w-8 h-8 text-accent ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>

                {/* Duration */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-sf-pro">
                  {reel.duration}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="cs_fs_18 font-sf-pro font-semibold text-primary mb-1">
                  {reel.title}
                </h3>
                <p className="cs_fs_14 font-sf-pro text-gray-500">
                  {reel.influencer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a 
            href="https://instagram.com/merumy_official" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-accent text-white px-8 py-4 rounded-lg cs_fs_18 font-sf-pro font-semibold hover:bg-accent/90 transition-colors"
          >
            Instagram'da Bizi Takip Edin
          </a>
        </div>
      </div>
    </section>
  )
}
