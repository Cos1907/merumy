import Image from 'next/image'

export default function Banners() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative overflow-hidden cs_radius_12 bg-accent-light group cursor-pointer">
          <div className="p-8 lg:p-12">
            <p className="cs_fs_24 font-medium uppercase mb-4">SINIRLI SÜRE TEKLİF</p>
            <h2 className="cs_fs_100 text-accent mb-0 font-bold leading-tight">
              %20 <br />
              Tasarruf Et
            </h2>
          </div>
          <div className="absolute bottom-0 right-0">
            <Image 
              src="/images/banner/banner_img_1.png" 
              alt="Banner" 
              width={200} 
              height={200}
              className="object-contain"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="relative overflow-hidden cs_radius_12 bg-white border border-gray-200 group cursor-pointer">
            <div className="p-8">
              <p className="cs_fs_24 text-primary mb-4">
                Ücretsiz Kargo <br />
                Siparişlerde
              </p>
              <h2 className="cs_fs_64 text-accent mb-0 font-normal leading-tight">
                ₺1000+
              </h2>
            </div>
            <div className="absolute bottom-0 right-0">
              <Image 
                src="/images/banner/banner_img_2.png" 
                alt="Banner" 
                width={150} 
                height={150}
                className="object-contain"
              />
            </div>
          </div>
          
          <div className="relative overflow-hidden cs_radius_12 bg-accent-light group cursor-pointer">
            <div className="p-8">
              <h2 className="cs_fs_54 text-accent mb-4 font-semibold leading-tight">
                Özel <br />
                İndirimler!
              </h2>
              <p className="cs_fs_24 text-primary mb-0">Yeni Müşteriler İçin</p>
            </div>
            <div className="absolute bottom-0 right-0">
              <Image 
                src="/images/banner/banner_img_3.png" 
                alt="Banner" 
                width={120} 
                height={120}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



