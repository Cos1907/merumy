'use client'

import { useState, useMemo } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Newsletter from '../components/Newsletter'
import LiveChat from '../components/LiveChat'
import { Clock, User, Search } from 'lucide-react'

// Blog yazıları verileri
const allPosts = [
  {
    id: 'kore-cilt-bakim-trendleri-2024',
    title: '2024 Kore Cilt Bakım Trendleri',
    excerpt: 'Bu yılın en popüler K-Beauty trendlerini keşfedin ve cildinizi dönüştürün.',
    image: '/images/1.gorsel.webp',
    category: 'Cilt Bakımı',
    date: '15 Aralık 2024',
    readTime: '5 dk',
    author: 'MERUMY Uzman Ekibi',
    featured: true
  },
  {
    id: 'cam-cilt-icin-10-altin-kural',
    title: 'Cam Cilt İçin 10 Altın Kural',
    excerpt: 'Kore\'nin ünlü glass skin trendini yakalamak için uzmanlarımızdan özel ipuçları.',
    image: '/images/2.gorsel.webp',
    category: 'Cilt Bakımı',
    date: '12 Aralık 2024',
    readTime: '7 dk',
    author: 'MERUMY Uzman Ekibi',
    featured: true
  },
  {
    id: 'k-beauty-rutini-nasil-olusturulur',
    title: 'K-Beauty Rutini Nasıl Oluşturulur?',
    excerpt: 'Kişisel cilt tipinize uygun K-Beauty rutini oluşturmanın püf noktaları.',
    image: '/images/3.gorsel.webp',
    category: 'K-Beauty Trendleri',
    date: '10 Aralık 2024',
    readTime: '6 dk',
    author: 'MERUMY Uzman Ekibi',
    featured: false
  },
  {
    id: 'kore-makyaj-teknikleri',
    title: 'Kore Makyaj Teknikleri',
    excerpt: 'Kore makyajının sırlarını öğrenin ve doğal güzelliğinizi ortaya çıkarın.',
    image: '/images/4.gorsel.webp',
    category: 'Makyaj',
    date: '8 Aralık 2024',
    readTime: '4 dk',
    author: 'MERUMY Makyaj Uzmanı',
    featured: false
  },
  {
    id: 'snail-mucin-faydalari',
    title: 'Snail Mucin Faydaları',
    excerpt: 'Kore\'nin en popüler içeriği snail mucin\'in cilde faydaları ve kullanımı.',
    image: '/images/karisikciltler.png',
    category: 'Cilt Bakımı',
    date: '5 Aralık 2024',
    readTime: '5 dk',
    author: 'MERUMY Uzman Ekibi',
    featured: false
  },
  {
    id: 'hyaluronic-acid-rehberi',
    title: 'Hyaluronic Acid Rehberi',
    excerpt: 'Nemlendirme konusunda devrim yaratan hyaluronic acid\'i yakından tanıyın.',
    image: '/images/kuruciltler.png',
    category: 'Cilt Bakımı',
    date: '3 Aralık 2024',
    readTime: '6 dk',
    author: 'MERUMY Uzman Ekibi',
    featured: false
  },
  {
    id: 'dogal-makyaj-trendi',
    title: 'Doğal Makyaj Trendi',
    excerpt: 'K-Beauty\'nin vazgeçilmezi olan doğal ve fresh makyaj görünümü nasıl elde edilir.',
    image: '/images/1.gorsel.webp',
    category: 'Makyaj',
    date: '1 Aralık 2024',
    readTime: '5 dk',
    author: 'MERUMY Makyaj Uzmanı',
    featured: false
  },
  {
    id: 'cushion-fondoten-kullanimi',
    title: 'Cushion Fondöten Kullanımı',
    excerpt: 'Kore makyajının olmazsa olmazı cushion fondöten hakkında bilmeniz gerekenler.',
    image: '/images/2.gorsel.webp',
    category: 'Makyaj',
    date: '28 Kasım 2024',
    readTime: '4 dk',
    author: 'MERUMY Makyaj Uzmanı',
    featured: false
  },
  {
    id: 'lip-tint-rehberi',
    title: 'Lip Tint Rehberi',
    excerpt: 'Uzun süre kalıcı ve doğal dudak görünümü için lip tint seçimi ve kullanımı.',
    image: '/images/3.gorsel.webp',
    category: 'Makyaj',
    date: '25 Kasım 2024',
    readTime: '4 dk',
    author: 'MERUMY Makyaj Uzmanı',
    featured: false
  },
  {
    id: 'kore-cilt-bakim-sirlari',
    title: 'Kore Cilt Bakım Sırları',
    excerpt: 'Kore kadınlarının kusursuz cildinin arkasındaki sırları öğrenin.',
    image: '/images/4.gorsel.webp',
    category: 'K-Beauty Trendleri',
    date: '22 Kasım 2024',
    readTime: '7 dk',
    author: 'MERUMY Uzman Ekibi',
    featured: false
  },
  {
    id: 'cilt-tipine-gore-urun-secimi',
    title: 'Cilt Tipine Göre Ürün Seçimi',
    excerpt: 'Yağlı, kuru ve karma cilt tipleri için doğru K-Beauty ürünleri.',
    image: '/images/kuruciltler.png',
    category: 'Cilt Bakımı',
    date: '20 Kasım 2024',
    readTime: '6 dk',
    author: 'MERUMY Uzman Ekibi',
    featured: false
  },
  {
    id: '7-skin-method',
    title: '7 Skin Method Nedir?',
    excerpt: 'Kore\'nin viral cilt bakım tekniği 7 skin method\'u nasıl uygulayacağınızı öğrenin.',
    image: '/images/karisikciltler.png',
    category: 'K-Beauty Trendleri',
    date: '18 Kasım 2024',
    readTime: '5 dk',
    author: 'MERUMY Uzman Ekibi',
    featured: false
  }
]

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Tümü')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Kategorileri ve sayıları hesapla
  const categories = useMemo(() => {
    const counts: Record<string, number> = { 'Tümü': allPosts.length }
    allPosts.forEach(post => {
      counts[post.category] = (counts[post.category] || 0) + 1
    })
    return [
      { name: 'Tümü', count: counts['Tümü'] },
      { name: 'Cilt Bakımı', count: counts['Cilt Bakımı'] || 0 },
      { name: 'Makyaj', count: counts['Makyaj'] || 0 },
      { name: 'K-Beauty Trendleri', count: counts['K-Beauty Trendleri'] || 0 }
    ]
  }, [])

  // Filtrelenmiş yazılar
  const filteredPosts = useMemo(() => {
    let posts = [...allPosts]
    
    // Kategori filtresi
    if (activeCategory !== 'Tümü') {
      posts = posts.filter(post => post.category === activeCategory)
    }
    
    // Arama filtresi
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt.toLowerCase().includes(query)
      )
    }
    
    return posts
  }, [activeCategory, searchQuery])

  // Öne çıkan ve son yazıları ayır
  const featuredPosts = filteredPosts.filter(p => p.featured)
  const recentPosts = filteredPosts.filter(p => !p.featured)

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="cs_height_40 cs_height_lg_30"></div>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-accent via-accent/90 to-accent-strong py-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="cs_fs_72 font-sf-pro font-bold mb-6">
              MERUMY Blog
            </h1>
            <p className="cs_fs_24 font-sf-pro font-light max-w-3xl mx-auto leading-relaxed">
              Kore güzellik dünyasının sırlarını keşfedin, uzman önerilerini okuyun ve 
              <span className="font-semibold"> K-Beauty trendlerini</span> yakından takip edin.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Blog yazılarında ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-sf-pro transition-colors ${
                    activeCategory === category.name
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="cs_fs_48 font-sf-pro font-bold text-primary mb-4">
                Öne Çıkan Yazılar
              </h2>
              <p className="cs_fs_20 font-sf-pro text-gray-600 max-w-2xl mx-auto">
                Uzmanlarımızın özenle hazırladığı en güncel K-Beauty rehberleri
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {featuredPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-sf-pro font-medium">
                        {post.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-white/90 text-accent px-3 py-1 rounded-full text-sm font-sf-pro font-medium">
                        Öne Çıkan
                      </span>
                    </div>
                    <div className="relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="cs_fs_28 font-sf-pro font-bold text-primary mb-4 line-clamp-2 group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="cs_fs_16 font-sf-pro text-gray-600 mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User size={14} />
                          <span className="font-sf-pro">{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span className="font-sf-pro">{post.readTime}</span>
                        </div>
                      </div>
                      <span className="font-sf-pro">{post.date}</span>
                    </div>
                    
                    <a
                      href={`/blog/${post.id}`}
                      className="inline-block bg-accent text-white px-6 py-3 rounded-lg cs_fs_16 font-sf-pro font-semibold hover:bg-accent/90 transition-colors"
                    >
                      Devamını Oku
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Posts Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="cs_fs_48 font-sf-pro font-bold text-primary mb-4">
              {activeCategory === 'Tümü' ? 'Son Yazılar' : activeCategory}
            </h2>
            <p className="cs_fs_20 font-sf-pro text-gray-600 max-w-2xl mx-auto">
              {filteredPosts.length} yazı bulundu
            </p>
          </div>

          {recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-accent-light text-accent px-3 py-1 rounded-full text-sm font-sf-pro font-medium">
                        {post.category}
                      </span>
                    </div>
                    <div className="relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="cs_fs_20 font-sf-pro font-semibold text-primary mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="cs_fs_14 font-sf-pro text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <User size={12} />
                          <span className="font-sf-pro">{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span className="font-sf-pro">{post.readTime}</span>
                        </div>
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Bu kategoride henüz yazı bulunmuyor.</p>
            </div>
          )}
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
