import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Newsletter from '../../components/Newsletter'
import LiveChat from '../../components/LiveChat'
import { Clock, User, Share2, Heart, ArrowLeft, Tag } from 'lucide-react'

// Blog yazıları veritabanı
const blogPosts: Record<string, any> = {
  'kore-cilt-bakim-trendleri-2024': {
    title: '2024 Kore Cilt Bakım Trendleri',
    excerpt: 'Bu yılın en popüler K-Beauty trendlerini keşfedin ve cildinizi dönüştürün.',
    image: '/images/1.gorsel.webp',
    category: 'Cilt Bakımı',
    date: '15 Aralık 2024',
    readTime: '8 dk',
    author: 'MERUMY Uzman Ekibi',
    authorBio: 'Kore güzellik uzmanları ve cilt bakım danışmanları',
    tags: ['K-Beauty', 'Cilt Bakımı', 'Cam Cilt', 'Kore Trendleri']
  },
  'cam-cilt-icin-10-altin-kural': {
    title: 'Cam Cilt İçin 10 Altın Kural',
    excerpt: 'Kore\'nin ünlü glass skin trendini yakalamak için uzmanlarımızdan özel ipuçları.',
    image: '/images/2.gorsel.webp',
    category: 'Cilt Bakımı',
    date: '12 Aralık 2024',
    readTime: '7 dk',
    author: 'MERUMY Uzman Ekibi',
    authorBio: 'Kore güzellik uzmanları ve cilt bakım danışmanları',
    tags: ['Cam Cilt', 'Glass Skin', 'K-Beauty']
  },
  'k-beauty-rutini-nasil-olusturulur': {
    title: 'K-Beauty Rutini Nasıl Oluşturulur?',
    excerpt: 'Kişisel cilt tipinize uygun K-Beauty rutini oluşturmanın püf noktaları.',
    image: '/images/3.gorsel.webp',
    category: 'K-Beauty Trendleri',
    date: '10 Aralık 2024',
    readTime: '6 dk',
    author: 'MERUMY Uzman Ekibi',
    authorBio: 'Kore güzellik uzmanları ve cilt bakım danışmanları',
    tags: ['K-Beauty', 'Cilt Bakım Rutini', 'Kore']
  },
  'kore-makyaj-teknikleri': {
    title: 'Kore Makyaj Teknikleri',
    excerpt: 'Kore makyajının sırlarını öğrenin ve doğal güzelliğinizi ortaya çıkarın.',
    image: '/images/4.gorsel.webp',
    category: 'Makyaj',
    date: '8 Aralık 2024',
    readTime: '4 dk',
    author: 'MERUMY Makyaj Uzmanı',
    authorBio: 'Profesyonel makyaj artisti ve K-Beauty uzmanı',
    tags: ['Makyaj', 'Kore Makyajı', 'K-Beauty']
  },
  'snail-mucin-faydalari': {
    title: 'Snail Mucin Faydaları',
    excerpt: 'Kore\'nin en popüler içeriği snail mucin\'in cilde faydaları ve kullanımı.',
    image: '/images/karisikciltler.png',
    category: 'Cilt Bakımı',
    date: '5 Aralık 2024',
    readTime: '5 dk',
    author: 'MERUMY Uzman Ekibi',
    authorBio: 'Kore güzellik uzmanları ve cilt bakım danışmanları',
    tags: ['Snail Mucin', 'Cilt Bakımı', 'K-Beauty']
  },
  'hyaluronic-acid-rehberi': {
    title: 'Hyaluronic Acid Rehberi',
    excerpt: 'Nemlendirme konusunda devrim yaratan hyaluronic acid\'i yakından tanıyın.',
    image: '/images/kuruciltler.png',
    category: 'Cilt Bakımı',
    date: '3 Aralık 2024',
    readTime: '6 dk',
    author: 'MERUMY Uzman Ekibi',
    authorBio: 'Kore güzellik uzmanları ve cilt bakım danışmanları',
    tags: ['Hyaluronic Acid', 'Nemlendirme', 'K-Beauty']
  }
}

// Varsayılan blog yazısı
const defaultPost = {
  title: '2024 Kore Cilt Bakım Trendleri: Cam Cilt İçin 10 Altın Kural',
  excerpt: 'Bu yılın en popüler K-Beauty trendlerini keşfedin ve cildinizi dönüştürün. Uzmanlarımızdan özel ipuçları.',
  image: '/images/1.gorsel.webp',
  category: 'Cilt Bakımı',
  date: '15 Aralık 2024',
  readTime: '8 dk',
  author: 'MERUMY Uzman Ekibi',
  authorBio: 'Kore güzellik uzmanları ve cilt bakım danışmanları',
  tags: ['K-Beauty', 'Cilt Bakımı', 'Cam Cilt', 'Kore Trendleri']
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  // Blog yazısını slug'a göre bul veya varsayılanı kullan
  const postData = blogPosts[params.slug] || defaultPost
  
  const blogPost = {
    id: params.slug,
    ...postData,
    content: `
      <div class="prose prose-lg max-w-none">
        <p class="text-xl text-gray-700 leading-relaxed mb-8">
          Kore güzellik dünyasının en popüler trendi olan 'glass skin' (cam cilt), mükemmel nemlendirilmiş, parlak ve şeffaf görünen bir cilt anlamına gelir. 2024 yılında bu trend daha da gelişti ve yeni teknikler ortaya çıktı.
        </p>

        <h2 class="text-3xl font-sf-pro font-bold text-primary mb-6">Cam Cilt Trendinin Temelleri</h2>
        
        <p class="text-gray-700 leading-relaxed mb-6">
          Cam cilt trendi, Kore'nin önleyici cilt bakım felsefesinin en güzel örneğidir. Bu trend, cilt sorunları ortaya çıkmadan önce önlem almayı hedefler ve uzun vadeli cilt sağlığına odaklanır.
        </p>

        <div class="bg-accent-light p-6 rounded-xl mb-8">
          <h3 class="text-xl font-sf-pro font-semibold text-primary mb-4">Uzman Notu</h3>
          <p class="text-gray-700 leading-relaxed">
            "Cam cilt elde etmek için sabır ve tutarlılık şarttır. Bu trend sadece görsel değil, aynı zamanda cildin sağlıklı olması anlamına gelir. MERUMY'nin orijinal Kore ürünleriyle bu hedefe ulaşmak çok daha kolay."
          </p>
          <p class="text-sm text-gray-600 mt-3 font-sf-pro">- MERUMY Uzman Ekibi</p>
        </div>

        <h2 class="text-3xl font-sf-pro font-bold text-primary mb-6">2024'ün En Popüler K-Beauty Trendleri</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 class="text-xl font-sf-pro font-semibold text-primary mb-3">1. Çift Temizleme Plus</h3>
            <p class="text-gray-700 leading-relaxed">
              Geleneksel çift temizleme yöntemine ek olarak, pre-cleanse adımı eklendi. Bu sayede cilt daha derinlemesine temizleniyor.
            </p>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 class="text-xl font-sf-pro font-semibold text-primary mb-3">2. Essence Layering</h3>
            <p class="text-gray-700 leading-relaxed">
              Birden fazla essence'ı katmanlar halinde uygulama tekniği. Her essence farklı bir işlev görüyor.
            </p>
          </div>
        </div>

        <h2 class="text-3xl font-sf-pro font-bold text-primary mb-6">Cam Cilt İçin 10 Altın Kural</h2>

        <div class="space-y-6 mb-8">
          <div class="flex items-start space-x-4">
            <div class="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-sf-pro font-bold text-sm flex-shrink-0">1</div>
            <div>
              <h3 class="text-xl font-sf-pro font-semibold text-primary mb-2">Çift Temizleme (Double Cleansing)</h3>
              <p class="text-gray-700 leading-relaxed">
                Önce yağ bazlı temizleyici ile makyajı çıkarın, sonra su bazlı temizleyici ile cildi derinlemesine temizleyin. Bu adım, gözeneklerin tıkanmasını önler ve cam cilt için temel oluşturur.
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-sf-pro font-bold text-sm flex-shrink-0">2</div>
            <div>
              <h3 class="text-xl font-sf-pro font-semibold text-primary mb-2">Tonik ile pH Dengesi</h3>
              <p class="text-gray-700 leading-relaxed">
                Kore tonikleri sadece temizlemez, aynı zamanda cildi nemlendirir ve pH dengesini sağlar. Pamukla uygulayın veya avuç içine alıp hafifçe vurun.
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-sf-pro font-bold text-sm flex-shrink-0">3</div>
            <div>
              <h3 class="text-xl font-sf-pro font-semibold text-primary mb-2">Essence ile Besleme</h3>
              <p class="text-gray-700 leading-relaxed">
                Essence, Kore rutininin kalbidir. Hafif dokusu ile cildi besler ve sonraki adımlar için hazırlar. Snail mucin içeren essence'lar özellikle etkilidir.
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-sf-pro font-bold text-sm flex-shrink-0">4</div>
            <div>
              <h3 class="text-xl font-sf-pro font-semibold text-primary mb-2">Serum Seçimi</h3>
              <p class="text-gray-700 leading-relaxed">
                Cilt tipinize uygun serum seçin: Hyaluronic acid kuru ciltler için, Niacinamide yağlı ciltler için idealdir. MERUMY'nin geniş serum koleksiyonundan seçim yapabilirsiniz.
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-sf-pro font-bold text-sm flex-shrink-0">5</div>
            <div>
              <h3 class="text-xl font-sf-pro font-semibold text-primary mb-2">Sheet Mask Ritüeli</h3>
              <p class="text-gray-700 leading-relaxed">
                Haftada 2-3 kez sheet mask kullanın. 15-20 dakika bekletip, kalan serumu hafifçe masajla cilde yedirin. Bu adım cam cilt için kritik önem taşır.
              </p>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-r from-accent-light to-gray-50 p-8 rounded-xl mb-8">
          <h3 class="text-2xl font-sf-pro font-bold text-primary mb-4">MERUMY Önerisi</h3>
          <p class="text-gray-700 leading-relaxed mb-4">
            Cam cilt rutini için MERUMY'nin özel olarak seçtiği ürün kombinasyonları:
          </p>
          <ul class="list-disc list-inside text-gray-700 space-y-2">
            <li>COSRX Low pH Good Morning Gel Cleanser</li>
            <li>Medicube Zero Pore Pad</li>
            <li>COSRX Advanced Snail 96 Mucin Power Essence</li>
            <li>Medicube Collagen Serum</li>
            <li>Beauty of Joseon Dynasty Cream</li>
          </ul>
        </div>

        <h2 class="text-3xl font-sf-pro font-bold text-primary mb-6">Sonuç ve Öneriler</h2>
        
        <p class="text-gray-700 leading-relaxed mb-6">
          Cam cilt trendi, sadece görsel bir hedef değil, aynı zamanda sağlıklı cilt bakımının bir sonucudur. MERUMY'nin orijinal Kore ürünleriyle bu rutini oluşturmak, hem etkili hem de güvenli bir yoldur.
        </p>

        <p class="text-gray-700 leading-relaxed mb-8">
          <strong>Hatırlatma:</strong> Sonuçlar 2-3 hafta içinde görülmeye başlar. Tutarlılık ve sabır en önemli faktörlerdir. MERUMY uzman ekibimizden kişisel öneriler almak için mağazalarımızı ziyaret edebilirsiniz.
        </p>
      </div>
    `,
    relatedPosts: [
      {
        id: 'k-beauty-rutini-nasil-olusturulur',
        title: 'K-Beauty Rutini Nasıl Oluşturulur?',
        image: '/images/2.gorsel.webp',
        date: '10 Aralık 2024',
        readTime: '6 dk'
      },
      {
        id: 'snail-mucin-faydalari',
        title: 'Snail Mucin Faydaları',
        image: '/images/3.gorsel.webp',
        date: '5 Aralık 2024',
        readTime: '5 dk'
      },
      {
        id: 'hyaluronic-acid-rehberi',
        title: 'Hyaluronic Acid Rehberi',
        image: '/images/kuruciltler.png',
        date: '3 Aralık 2024',
        readTime: '6 dk'
      }
    ]
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="cs_height_40 cs_height_lg_30"></div>
      
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <a
          href="/blog"
          className="inline-flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors font-sf-pro"
        >
          <ArrowLeft size={20} />
          <span>Blog'a Geri Dön</span>
        </a>
      </div>

      {/* Article Header */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Category and Date */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-sf-pro font-medium">
                  {blogPost.category}
                </span>
                <span className="text-gray-500 cs_fs_14 font-sf-pro">{blogPost.date}</span>
              </div>
              <div className="flex items-center space-x-4 text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span className="cs_fs_14 font-sf-pro">{blogPost.readTime}</span>
                </div>
                <button className="flex items-center space-x-1 hover:text-accent transition-colors">
                  <Share2 size={16} />
                  <span className="cs_fs_14 font-sf-pro">Paylaş</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                  <Heart size={16} />
                  <span className="cs_fs_14 font-sf-pro">Beğen</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="cs_fs_48 font-sf-pro font-bold text-primary mb-6 leading-tight">
              {blogPost.title}
            </h1>

            {/* Excerpt */}
            <p className="cs_fs_20 font-sf-pro text-gray-600 mb-8 leading-relaxed">
              {blogPost.excerpt}
            </p>

            {/* Author Info */}
            <div className="flex items-center space-x-4 mb-8 p-6 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h3 className="cs_fs_18 font-sf-pro font-semibold text-primary">{blogPost.author}</h3>
                <p className="cs_fs_14 font-sf-pro text-gray-600">{blogPost.authorBio}</p>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative rounded-2xl overflow-hidden mb-12">
              <img
                src={blogPost.image}
                alt={blogPost.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Tags */}
            <div className="flex items-center space-x-2 mb-12">
              <Tag size={16} className="text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-sf-pro hover:bg-accent hover:text-white transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div
              className="prose prose-lg max-w-none font-sf-pro text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="cs_fs_36 font-sf-pro font-bold text-primary mb-8 text-center">
              İlgili Yazılar
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPost.relatedPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
                  <div className="relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="cs_fs_18 font-sf-pro font-semibold text-primary mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span className="font-sf-pro">{post.readTime}</span>
                      </div>
                      <span className="font-sf-pro">{post.date}</span>
                    </div>
                    
                    <a
                      href={`/blog/${post.id}`}
                      className="text-accent cs_fs_14 font-sf-pro font-semibold hover:text-accent/80 transition-colors"
                    >
                      Devamını Oku →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-accent via-accent/90 to-accent-strong rounded-2xl p-12 text-center text-white">
            <h2 className="cs_fs_48 font-sf-pro font-bold mb-4">
              Blog Güncellemelerini Kaçırmayın
            </h2>
            <p className="cs_fs_20 font-sf-pro font-light mb-8 max-w-2xl mx-auto">
              En yeni K-Beauty trendleri, uzman önerileri ve özel içerikler için 
              <span className="font-semibold"> bültenimize abone olun</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="E-posta adresinizi girin..."
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 font-sf-pro"
              />
              <button className="bg-white text-accent px-6 py-3 rounded-lg cs_fs_18 font-sf-pro font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap">
                ABONE OL
              </button>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
      <LiveChat />
    </main>
  )
}