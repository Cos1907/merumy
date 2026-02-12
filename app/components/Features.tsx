import Image from 'next/image'

export default function Features() {
  const features = [
    {
      icon: "/images/icons/feature_icon_1.svg",
      title: "Kalite Güvencesi"
    },
    {
      icon: "/images/icons/feature_icon_2.svg",
      title: "Müşteri Memnuniyeti"
    },
    {
      icon: "/images/icons/feature_icon_3.svg",
      title: "Güven ve Güvenilirlik"
    },
    {
      icon: "/images/icons/feature_icon_4.svg",
      title: "Kişiselleştirme"
    },
    {
      icon: "/images/icons/feature_icon_5.svg",
      title: "Sürekli Gelişim"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="text-center cs_radius_6 p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
              <Image 
                src={feature.icon} 
                alt={feature.title}
                width={48}
                height={48}
                className="mx-auto"
              />
            </div>
            <p className="font-semibold text-primary">{feature.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}



