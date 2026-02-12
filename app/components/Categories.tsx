import Image from 'next/image'

export default function Categories() {
  const categories = [
    {
      id: 1,
      title: "Kore Cilt Bakımı!",
      description: "Kanıtlanmış içerikler ve yenilikçi formüllerle orijinal Kore cilt bakımını deneyimleyin.",
      image: "/images/category_img_1.png",
      link: "/shop?category=skincare"
    },
    {
      id: 2,
      title: "K-Beauty Makyaj",
      description: "Yüksek kaliteli, uzun süreli ürünlerle en son Kore makyaj trendlerini keşfedin.",
      image: "/images/category_img_2.png",
      link: "/shop?category=makeup"
    },
    {
      id: 3,
      title: "Kore Saç Bakımı",
      description: "Kore saç bakım yenilikleri ve doğal içeriklerle saçlarınızı dönüştürün.",
      image: "/images/kore-sac-bakimi.png",
      link: "/shop?category=haircare"
    }
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="relative overflow-hidden cs_radius_12 group cursor-pointer"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-colors"></div>
              </div>
              
              <div className="relative z-10 p-8 h-full flex flex-col justify-center items-center text-center text-white min-h-[400px]">
                <h2 className="cs_fs_54 font-semibold mb-4 leading-tight">
                  {category.title}
                </h2>
                <p className="cs_fs_18 mb-6 font-light opacity-90">
                  {category.description}
                </p>
                <a 
                  href={category.link}
                  className="inline-block bg-accent text-white px-6 py-3 rounded-lg cs_fs_18 font-medium hover:bg-accent/90 transition-colors"
                >
                  Alışverişe Başla
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
