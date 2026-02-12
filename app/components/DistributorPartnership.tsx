import Image from 'next/image'

export default function DistributorPartnership() {
  const benefits = [
    {
      title: "Güvenilir Ortaklık",
      description: "Kore'deki partner markalarımızla doğrudan bağlantı"
    },
    {
      title: "Kolay Dağıtım",
      description: "Türkiye genelinde geniş dağıtım ağı"
    },
    {
      title: "Karlı İş Modeli",
      description: "Rekabetçi fiyatlar ve yüksek kar marjları"
    },
    {
      title: "Hedef Kitle",
      description: "K-Beauty tutkunu geniş müşteri kitlesi"
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div>
            <h2 className="cs_fs_48 font-sf-pro font-bold text-primary mb-6">
              Distribütör ve İş Ortaklığı
            </h2>
            <p className="cs_fs_20 font-sf-pro text-gray-600 mb-8 leading-relaxed">
              <span className="font-sf-pro font-semibold">Merumy ailesine katılın</span> ve 
              <span className="font-bold"> K-Beauty dünyasında</span> başarılı bir iş ortağı olun. 
              <span className="font-sf-pro font-semibold">Orijinal Kore ürünleri</span> ile 
              <span className="font-bold"> karlı bir iş modeli</span> kurun.
            </p>

            <div className="space-y-6 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="cs_fs_20 font-sf-pro font-semibold text-primary mb-2">
                      {benefit.title}
                    </h3>
                    <p className="cs_fs_16 font-sf-pro text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/contact" 
                className="inline-block bg-accent text-white px-8 py-4 rounded-lg cs_fs_18 font-sf-pro font-semibold hover:bg-accent/90 transition-colors text-center"
              >
                İş Ortaklığı Başvurusu
              </a>
              <a 
                href="tel:+902123456789" 
                className="inline-block bg-white text-accent border-2 border-accent px-8 py-4 rounded-lg cs_fs_18 font-sf-pro font-semibold hover:bg-accent hover:text-white transition-colors text-center"
              >
                Hemen Arayın
              </a>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative">
            <div className="cs_radius_20 overflow-hidden">
              <Image 
                src="/images/category_img_2.png" 
                alt="İş Ortaklığı" 
                width={600} 
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
