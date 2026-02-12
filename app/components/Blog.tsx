import Image from 'next/image'
import { Clock, User } from 'lucide-react'

export default function Blog() {
  const posts = [
    {
      id: 1,
      category: "CİLT BAKIMI",
      title: "Cam Cilt İçin 10 Kore Cilt Bakım İpucu",
      author: "Merumy Uzman Ekibi",
      date: "5 Mayıs 2024",
      image: "/images/1.gorsel.webp",
      link: "/blog/kore-cilt-bakim-ipuclari",
      excerpt: "Kore'nin ünlü 'glass skin' trendini yakalamak için uzmanlarımızdan özel ipuçları. 10 adımlı rutinle mükemmel cilt elde edin.",
      content: `
        <h2>Cam Cilt İçin 10 Kore Cilt Bakım İpucu</h2>
        <p>Kore güzellik dünyasının en popüler trendi olan 'glass skin' (cam cilt), mükemmel nemlendirilmiş, parlak ve şeffaf görünen bir cilt anlamına gelir. İşte bu hedefe ulaşmak için uzmanlarımızdan 10 altın kural:</p>
        
        <h3>1. Çift Temizleme (Double Cleansing)</h3>
        <p>Önce yağ bazlı temizleyici ile makyajı çıkarın, sonra su bazlı temizleyici ile cildi derinlemesine temizleyin. Bu adım, gözeneklerin tıkanmasını önler.</p>
        
        <h3>2. Tonik Kullanımı</h3>
        <p>Kore tonikleri sadece temizlemez, aynı zamanda cildi nemlendirir ve pH dengesini sağlar. Pamukla uygulayın veya avuç içine alıp hafifçe vurun.</p>
        
        <h3>3. Essence ile Besleme</h3>
        <p>Essence, Kore rutininin kalbidir. Hafif dokusu ile cildi besler ve sonraki adımlar için hazırlar. Snail mucin içeren essence'lar özellikle etkilidir.</p>
        
        <h3>4. Serum Seçimi</h3>
        <p>Cilt tipinize uygun serum seçin: Hyaluronic acid kuru ciltler için, Niacinamide yağlı ciltler için idealdir.</p>
        
        <h3>5. Sheet Mask Ritüeli</h3>
        <p>Haftada 2-3 kez sheet mask kullanın. 15-20 dakika bekletip, kalan serumu hafifçe masajla cilde yedirin.</p>
        
        <h3>6. Göz Bakımı</h3>
        <p>Göz çevresi için özel serum veya krem kullanın. Ring finger ile nazikçe uygulayın.</p>
        
        <h3>7. Nemlendirici Katmanları</h3>
        <p>Önce hafif nemlendirici, sonra daha yoğun krem uygulayın. Bu katmanlama tekniği cildi maksimum nemlendirir.</p>
        
        <h3>8. Güneş Koruyucu</h3>
        <p>Günlük SPF 30+ kullanımı şarttır. Kore güneş koruyucuları hafif dokularıyla günlük kullanım için idealdir.</p>
        
        <h3>9. Yumuşak Dokunuş</h3>
        <p>Ürünleri cilde vurarak (patting) uygulayın, sürtmeyin. Bu teknik kan dolaşımını artırır ve ürünlerin emilimini kolaylaştırır.</p>
        
        <h3>10. Tutarlılık</h3>
        <p>En önemlisi tutarlılık! Sabah ve akşam rutinlerinizi düzenli olarak uygulayın. Sonuçlar 2-3 hafta içinde görülmeye başlar.</p>
        
        <p><strong>İpucu:</strong> Merumy'de bulunan orijinal Kore ürünleriyle bu rutini oluşturabilirsiniz. Uzman ekibimiz size kişisel önerilerde bulunmaya hazır!</p>
      `
    },
    {
      id: 2,
      category: "MAKYAJ",
      title: "2024 Kore Makyaj Trendleri",
      author: "Merumy Uzman Ekibi",
      date: "20 Nisan 2024",
      image: "/images/2.gorsel.webp",
      link: "/blog/kore-makyaj-trendleri-2024",
      excerpt: "2024'ün en sıcak Kore makyaj trendleri. Doğal görünümden cesur renklere kadar tüm trendleri keşfedin.",
      content: `
        <h2>2024 Kore Makyaj Trendleri</h2>
        <p>Kore makyaj dünyası 2024'te yine yenilikçi trendlerle karşımızda! Doğal görünümden cesur renklere kadar geniş bir yelpazede trendler var. İşte bu yılın en popüler Kore makyaj trendleri:</p>
        
        <h3>1. Glass Skin Makeup</h3>
        <p>Cam cilt trendi makyajda da devam ediyor. Dewy finish ile parlak, nemli görünen bir cilt elde edin. Cushion foundation'lar bu trend için mükemmel.</p>
        
        <h3>2. Gradient Lips</h3>
        <p>Kore'nin klasik gradient dudak trendi hala popüler. İç kısım koyu, dış kısım açık renkli dudak makyajı yapın.</p>
        
        <h3>3. Puppy Eye Makeup</h3>
        <p>Kedi gözü yerine köpek gözü! Gözün dış köşesini aşağı doğru çekerek daha masum bir görünüm elde edin.</p>
        
        <h3>4. Blush Draping</h3>
        <p>Allık sadece yanaklarda değil, burun köprüsünde de kullanılıyor. Bu teknik yüzü daha genç ve canlı gösterir.</p>
        
        <h3>5. Glitter & Sparkle</h3>
        <p>Göz kapaklarında ve yanaklarda ince glitter kullanımı. Subtle ama etkileyici bir parıltı için ideal.</p>
        
        <h3>6. Monochromatic Makeup</h3>
        <p>Aynı rengin tonlarını yüzün farklı bölgelerinde kullanın. Pembe tonlar özellikle popüler.</p>
        
        <h3>7. Natural Brows</h3>
        <p>Doğal, tüylü kaş trendi devam ediyor. Brow gel ile kaşları yukarı doğru tarayın.</p>
        
        <h3>8. Colorful Eyeliner</h3>
        <p>Siyah eyeliner yerine renkli eyeliner'lar. Mavi, mor, yeşil tonlar öne çıkıyor.</p>
        
        <h3>9. Lip Tints</h3>
        <p>Uzun süreli renk veren lip tint'ler. Doğal görünüm için mükemmel.</p>
        
        <h3>10. Cushion Everything</h3>
        <p>Sadece foundation değil, concealer, blush, highlighter da cushion formunda. Pratik ve hijyenik!</p>
        
        <p><strong>Merumy'de Bulunan Trend Ürünler:</strong> Tüm bu trendler için gerekli orijinal Kore ürünlerini mağazalarımızda bulabilirsiniz. Uzman ekibimiz size en uygun ürünleri seçmenizde yardımcı olur.</p>
      `
    },
    {
      id: 3,
      category: "CİLT BAKIMI",
      title: "Kore Cilt Bakım Felsefesi: Önleme Odaklı Yaklaşım",
      author: "Merumy Uzman Ekibi",
      date: "15 Mart 2024",
      image: "/images/3.gorsel.webp",
      link: "/blog/kore-cilt-bakim-felsefesi",
      excerpt: "Kore cilt bakım felsefesinin temel prensipleri. Neden önleme odaklı yaklaşım daha etkili?",
      content: `
        <h2>Kore Cilt Bakım Felsefesi: Önleme Odaklı Yaklaşım</h2>
        <p>Kore cilt bakım felsefesi, Batı'nın 'sorun çözme' yaklaşımından farklı olarak 'önleme' odaklıdır. Bu yaklaşım, cilt sorunları ortaya çıkmadan önce önlem almayı hedefler.</p>
        
        <h3>Temel Prensipler</h3>
        
        <h4>1. Erken Başlangıç</h4>
        <p>Kore'de cilt bakımı genç yaşlarda başlar. 20'li yaşlarda bile anti-aging ürünler kullanılır. Mantık basit: Cildi korumak, onarmaktan daha kolaydır.</p>
        
        <h4>2. Katmanlama (Layering)</h4>
        <p>Birden fazla ürünü ince katmanlar halinde uygulama. Her ürün farklı bir işlev görür ve birlikte sinerji yaratır.</p>
        
        <h4>3. Doğal İçerikler</h3>
        <p>Yeşil çay, pirinç suyu, snail mucin gibi geleneksel Kore içerikleri modern formüllerde kullanılır.</p>
        
        <h4>4. Yumuşak Dokunuş</h4>
        <p>Cilde sert davranmak yerine, nazik masaj ve patting teknikleri kullanılır.</p>
        
        <h3>Batı vs Kore Yaklaşımı</h3>
        
        <p><strong>Batı Yaklaşımı:</strong></p>
        <ul>
          <li>Sorun ortaya çıktıktan sonra müdahale</li>
          <li>Güçlü, aktif içerikler</li>
          <li>Hızlı sonuç odaklı</li>
          <li>Az sayıda ürün</li>
        </ul>
        
        <p><strong>Kore Yaklaşımı:</strong></p>
        <ul>
          <li>Sorun ortaya çıkmadan önleme</li>
          <li>Hafif, besleyici içerikler</li>
          <li>Uzun vadeli sağlık odaklı</li>
          <li>Çoklu ürün rutini</li>
        </ul>
        
        <h3>Bilimsel Temel</h3>
        <p>Kore cilt bakım felsefesi, cildin doğal bariyer fonksiyonunu güçlendirmeye odaklanır. Sağlıklı bir cilt bariyeri:</p>
        <ul>
          <li>Nem kaybını önler</li>
          <li>Çevresel hasarlara karşı korur</li>
          <li>Mikroorganizmalara karşı direnç sağlar</li>
          <li>Yaşlanma belirtilerini geciktirir</li>
        </ul>
        
        <h3>Pratik Uygulama</h3>
        <p>Bu felsefeyi günlük rutininize nasıl uygulayabilirsiniz:</p>
        <ol>
          <li><strong>Sabırlı olun:</strong> Sonuçlar 2-3 hafta içinde görülür</li>
          <li><strong>Tutarlı olun:</strong> Düzenli kullanım şarttır</li>
          <li><strong>Dinleyin:</strong> Cildinizin ihtiyaçlarını gözlemleyin</li>
          <li><strong>Uyum sağlayın:</strong> Mevsimsel değişiklikler yapın</li>
        </ol>
        
        <p><strong>Sonuç:</strong> Kore cilt bakım felsefesi, cildinizi bir bahçe gibi düşünmeyi öğretir. Düzenli bakım, doğru beslenme ve sabırla güzel sonuçlar elde edersiniz.</p>
        
        <p>Merumy'de bu felsefeyi destekleyen orijinal Kore ürünlerini bulabilir, uzman ekibimizden kişisel öneriler alabilirsiniz.</p>
      `
    }
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="cs_fs_54 font-semibold text-primary">
            KORE GÜZELLİK İPUÇLARI & TRENDLER
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white cs_radius_12 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-accent-light text-accent px-3 py-1 cs_radius_5 text-sm font-light uppercase">
                    {post.category}
                  </span>
                </div>
                <div className="relative overflow-hidden">
                  <Image 
                    src={post.image} 
                    alt={post.title}
                    width={400}
                    height={250}
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="cs_fs_24 font-medium text-primary mb-4 line-clamp-2">
                  <a href={post.link} className="hover:text-accent transition-colors">
                    {post.title}
                  </a>
                </h3>
                <div className="flex items-center space-x-4 text-gray-500 cs_fs_14">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User size={14} />
                    <span>{post.author}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
