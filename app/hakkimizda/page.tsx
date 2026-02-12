'use client'

import Image from 'next/image'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function HakkimizdaPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      
      {/* Hero Section */}
      <div className="w-full relative overflow-hidden" style={{ height: '356px', marginTop: '158px' }}>
        <Image
          src="/main/hakkimizda/hero.png"
          alt="Merumy Hakkımızda"
          fill
          className="object-cover"
          priority
          quality={100}
        />
      </div>

      {/* Hakkımızda Content */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            {/* Left Text */}
            <div className="flex-1">
              <h1 
                className="text-4xl lg:text-5xl font-bold font-grift mb-8 uppercase"
                style={{ color: '#92D0AA' }}
              >
                HAKKIMIZDA
              </h1>
              
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p className="font-medium text-xl text-gray-800">
                  Kore'nin önde gelen kozmetik ve yaşam markalarını Türkiye'ye getirerek tüketicilerle buluşturan yenilikçi bir perakende markasıyız.
                </p>
                <p>
                  Merumy, Kore'nin önde gelen kozmetik ve yaşam markalarını Türkiye'ye getirerek tüketicilerle buluşturan yenilikçi bir perakende markasıdır. Amacımız, Kore'nin güzellik anlayışını, etkili bakım rutinlerini ve yüksek kaliteli ürünlerini Türkiye'deki tüketicilere güvenilir, ulaşılabilir ve keyifli bir alışveriş deneyimiyle sunmaktır.
                </p>
                <p>
                  Sistemimizde Kore markaları ile Türk tüketiciler arasında güçlü bir köprü görevi görüyoruz. Kore'deki partner markalarımızdan ürünleri doğrudan temin ederek, Türkiye'deki distribütörler aracılığıyla mağazalarımıza ulaştırıyor; alışveriş merkezlerinde konumlandırdığımız perakende noktalarımızda son tüketiciyle buluşturuyoruz.
                </p>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-1 w-full">
              <div className="relative aspect-[4/3] w-full rounded-[30px] overflow-hidden shadow-xl">
                <Image
                  src="/main/hakkimizda/hakkimizdasag.jpg"
                  alt="Merumy Mağaza"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="relative h-[400px] rounded-[30px] overflow-hidden group">
              <Image
                src="/main/hakkimizda/misyonumuz.png"
                alt="Misyonumuz"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div 
                className="absolute inset-0 transition-colors"
                style={{ backgroundColor: 'rgba(146, 208, 170, 0.6)' }} // #92D0AA with opacity
              ></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 text-white">
                <h2 className="text-4xl font-bold font-grift mb-4 uppercase drop-shadow-md">MİSYONUMUZ</h2>
                <p className="text-lg max-w-md font-medium drop-shadow-sm">
                  Müşterilerimize Kore kozmetik ürün çeşitlerini sunarak, onların bir çok bakım ihtiyacının karşılanmasını sağlamak.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="relative h-[400px] rounded-[30px] overflow-hidden group">
              <Image
                src="/main/hakkimizda/vizyonumuz.png"
                alt="Vizyonumuz"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div 
                className="absolute inset-0 transition-colors"
                style={{ backgroundColor: 'rgba(146, 208, 170, 0.6)' }} // #92D0AA with opacity
              ></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 text-white">
                <h2 className="text-4xl font-bold font-grift mb-4 uppercase drop-shadow-md">VİZYONUMUZ</h2>
                <p className="text-lg max-w-md font-medium drop-shadow-sm">
                  Türkiye'de birçok markayı tek bir çatı altında buluşturarak ürün çeşidini portföyünde bulundurmak.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 mt-12 relative flex justify-center">
        <div 
          className="relative overflow-hidden flex flex-col items-center justify-center p-[30px]"
          style={{
            width: '1250px',
            height: '336px',
            background: '#7BCAA2',
            border: '2px solid #F0E99A',
            borderRadius: '20px',
            boxSizing: 'border-box'
          }}
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
             <Image
              src="/main/hakkimizda/degerlerimiz.png"
              alt="Değerlerimiz Background"
              fill
              className="object-cover"
              style={{ opacity: 0.1 }}
            />
          </div>
          
          {/* Content Overlay */}
          <div className="relative z-10 w-[1190px] flex flex-col items-center gap-[30px]">
            {/* Title */}
            <h2 
              className="font-grift font-bold text-[25px] leading-[31px] text-center text-white"
              style={{ width: '1190px', height: '31px' }}
            >
              DEĞERLERİMİZ
            </h2>

            {/* Description Text */}
            <div 
              className="font-grift font-normal text-[12px] leading-[15px] text-center text-white"
              style={{ width: '1190px' }}
            >
              <p className="mb-4">
                Merumy, yalnızca bir satış noktası değil; aynı zamanda Kore kültürünü, güzellik trendlerini ve yenilikçi bakım anlayışını Türkiye'ye taşıyan bir marka olarak konumlanmaktadır.
              </p>
              
              <div className="space-y-2">
                <p>
                  <span className="font-bold">Şeffaflık</span> Tüm işlemlerimizde şeffaflık ilkesiyle hareket ediyor, müşterilerimizle açık iletişim kuruyoruz.
                </p>
                <p>
                  <span className="font-bold">Güven</span> Müşterilerimizin güvenini kazanmak ve korumak için sürekli çalışıyor, güvenilir hizmet sunuyoruz.
                </p>
                <p>
                  <span className="font-bold">Kalite</span> Her bir ürünün orijinalliğini ve etkinliğini garanti altına alarak, yüksek kalite standartları sunuyoruz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
