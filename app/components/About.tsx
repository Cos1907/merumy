import Image from 'next/image'

export default function About() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-accent transition-colors">Ana Sayfa</a>
            <span>/</span>
            <span className="text-accent">Hakkımızda</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="cs_fs_72 font-bold text-primary mb-6">Merumy Hakkında</h1>
          <p className="cs_fs_24 text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Kore'nin önde gelen kozmetik ve yaşam markalarını Türkiye'ye getirerek tüketicilerle buluşturan yenilikçi bir perakende markasıyız.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="relative">
            <div className="cs_radius_12 overflow-hidden">
              <Image 
                src="/images/category_img_1.png" 
                alt="Merumy Hakkında" 
                width={600} 
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          <div>
            <h2 className="cs_fs_48 font-semibold text-primary mb-6">Hikayemiz</h2>
            <div className="space-y-6 text-gray-700 cs_fs_18 leading-relaxed">
              <p>
                Merumy, Kore'nin önde gelen kozmetik ve yaşam markalarını Türkiye'ye getirerek tüketicilerle buluşturan yenilikçi bir perakende markasıdır. Amacımız, Kore'nin güzellik anlayışını, etkili bakım rutinlerini ve yüksek kaliteli ürünlerini Türkiye'deki tüketicilere güvenilir, ulaşılabilir ve keyifli bir alışveriş deneyimiyle sunmaktır.
              </p>
              <p>
                Sistemimizde Kore markaları ile Türk tüketiciler arasında güçlü bir köprü görevi görüyoruz. Kore'deki partner markalarımızdan ürünleri doğrudan temin ederek, Türkiye'deki distribütörler aracılığıyla mağazalarımıza ulaştırıyor; alışveriş merkezlerinde konumlandırdığımız perakende noktalarımızda son tüketiciyle buluşturuyoruz.
              </p>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="bg-accent-light p-8 cs_radius_12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="cs_fs_32 font-semibold text-primary">Misyonumuz</h3>
            </div>
            <p className="text-gray-700 cs_fs_18 leading-relaxed">
              Müşterilerimize Kore kozmetik ürün çeşitlerini sunarak, onların bir çok bakım ihtiyaçlarının karşılanmasını sağlamak.
            </p>
          </div>

          <div className="bg-accent-light p-8 cs_radius_12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="cs_fs_32 font-semibold text-primary">Vizyonumuz</h3>
            </div>
            <p className="text-gray-700 cs_fs_18 leading-relaxed">
              Türkiye'de birçok markayı tek bir çatı altında buluşturarak ürün çeşidini portföyünde bulundurmak.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="cs_fs_48 font-semibold text-primary mb-4">Değerlerimiz</h2>
            <p className="cs_fs_20 text-gray-600 max-w-3xl mx-auto">
              Merumy, yalnızca bir satış noktası değil; aynı zamanda Kore kültürünü, güzellik trendlerini ve yenilikçi bakım anlayışını Türkiye'ye taşıyan bir marka olarak konumlanmaktadır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="cs_fs_24 font-semibold text-primary mb-3">Şeffaflık</h3>
              <p className="text-gray-600 cs_fs_16">
                Tüm işlemlerimizde şeffaflık ilkesiyle hareket ediyor, müşterilerimizle açık iletişim kuruyoruz.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="cs_fs_24 font-semibold text-primary mb-3">Güven</h3>
              <p className="text-gray-600 cs_fs_16">
                Müşterilerimizin güvenini kazanmak ve korumak için sürekli çalışıyor, güvenilir hizmet sunuyoruz.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="cs_fs_24 font-semibold text-primary mb-3">Kalite</h3>
              <p className="text-gray-600 cs_fs_16">
                Her bir ürünün orijinalliğini ve etkinliğini garanti altına alarak, yüksek kalite standartları sunuyoruz.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-accent text-white p-12 cs_radius_16 text-center">
          <h2 className="cs_fs_48 font-semibold mb-4">Kore'nin Güzelliğini Keşfedin</h2>
          <p className="cs_fs_20 mb-8 opacity-90 max-w-2xl mx-auto">
            Merumy, Kore'nin güzelliğini Türkiye'ye taşıyan köprüdür. Siz de bu güzellik yolculuğuna katılın.
          </p>
          <a 
            href="/shop" 
            className="inline-block bg-white text-accent px-8 py-4 rounded-lg cs_fs_18 font-semibold hover:bg-gray-100 transition-colors"
          >
            Alışverişe Başla
          </a>
        </div>
      </div>
    </section>
  )
}
