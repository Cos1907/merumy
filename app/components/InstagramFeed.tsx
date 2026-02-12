import Image from 'next/image'

export default function InstagramFeed() {
  const posts = [
    {
      id: 1,
      image: "/images/1.gorsel.webp",
      likes: "1.2K",
      comments: "89",
      caption: "K-Beauty rutininin ilk adımı: Çift temizleme ✨ #KBeauty #Merumy"
    },
    {
      id: 2,
      image: "/images/2.gorsel.webp",
      likes: "2.1K",
      comments: "156",
      caption: "Kore serumları ile cildinizi dönüştürün 🌟 #KBeauty #Serum"
    },
    {
      id: 3,
      image: "/images/3.gorsel.webp",
      likes: "987",
      comments: "67",
      caption: "Günlük K-Beauty rutini nasıl olmalı? 👇 #KBeautyRoutine"
    },
    {
      id: 4,
      image: "/images/4.gorsel.webp",
      likes: "1.8K",
      comments: "134",
      caption: "Kore makyaj trendleri 2024 💄 #KBeauty #Makeup"
    },
    {
      id: 5,
      image: "/images/karisikciltler.png",
      likes: "1.5K",
      comments: "98",
      caption: "Cilt bakımında Kore felsefesi 🧘‍♀️ #KBeauty #Skincare"
    },
    {
      id: 6,
      image: "/images/kuruciltler.png",
      likes: "2.3K",
      comments: "201",
      caption: "Merumy ile K-Beauty dünyasına hoş geldiniz! 🎉 #Merumy #KBeauty"
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="cs_fs_48 font-sf-pro font-bold text-primary mb-4">
            Instagram Feed
          </h2>
          <p className="cs_fs_20 font-sf-pro text-gray-600 max-w-3xl mx-auto">
            <span className="font-sf-pro font-semibold">@merumy_official</span> hesabımızdan 
            <span className="font-bold"> en son paylaşımları</span> keşfedin ve 
            <span className="font-sf-pro font-semibold"> K-Beauty dünyasına</span> katılın.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com/merumy.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group cursor-pointer block"
            >
              <div className="cs_radius_12 overflow-hidden aspect-square relative">
                <Image 
                  src={post.image} 
                  alt="Instagram Post"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-colors"></div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white text-center">
                    <div className="flex items-center justify-center space-x-4 mb-2">
                      <div className="flex items-center space-x-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span className="text-sm font-sf-pro">{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span className="text-sm font-sf-pro">{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <a 
            href="https://instagram.com/merumy.tr" 
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
