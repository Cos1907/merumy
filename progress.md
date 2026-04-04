# 📋 Merumy — Geliştirme İlerleme Raporu

> Son güncelleme: 4 Nisan 2026

---

## ✅ Tamamlanan Görevler

### 🚀 Altyapı & Deployment

- [x] **Ubuntu 22.04 sunucu kurulumu** — Hosting Dünyam üzerinde VPS hazırlandı
- [x] **Node.js v20 kurulumu** — Sunucuya yüklenip yapılandırıldı
- [x] **PM2 süreç yöneticisi** — `merumy-full` adıyla uygulama production'da çalışıyor (port 3005)
- [x] **Nginx reverse proxy** — `merumy.com` → Next.js uygulamasına yönlendirme yapılandırıldı
- [x] **Admin subdomain** — `yonetim.merumy.com` → Admin paneline yönlendirme
- [x] **GitHub entegrasyonu** — Repo: `https://github.com/Cos1907/merumy` (main branch)
- [x] **Cloudflare entegrasyonu** — DNS ve Flexible SSL konfigürasyonu

---

### 🏗️ Temel Uygulama Yapısı

- [x] **Next.js 14 App Router** — TypeScript ile tam kurulum
- [x] **MySQL veritabanı** — 21 tablo, tam şema oluşturuldu
- [x] **Veritabanı bağlantı katmanı** — `app/lib/db.ts` (pool, query, execute, transaction helpers)
- [x] **Tailwind CSS** — Tüm UI stillendirmesi
- [x] **Middleware** — Admin route koruması

---

### 🛍️ Mağaza (E-Ticaret)

- [x] **Ana sayfa** — Hero slider, öne çıkan ürünler, markalar
- [x] **Ürün listeleme** — Kategori filtresi, marka filtresi, sıralama
- [x] **Ürün detay sayfası** — Görseller, varyantlar, stok durumu, sepete ekle
- [x] **Sepet sistemi** — React Context ile client-side sepet yönetimi
- [x] **Arama** — Ürün arama
- [x] **Koleksiyonlar & Kategoriler** — Dinamik kategori sayfaları
- [x] **Markalar sayfası** — Tüm markalar listesi
- [x] **Blog** — Blog listesi ve detay sayfaları
- [x] **Statik sayfalar** — Hakkımızda, İletişim, SSS, KVKK, Kullanım Şartları, Kargo Rehberi, vb.

---

### 👤 Kullanıcı Sistemi

- [x] **Kayıt / Giriş** — Email & şifre ile hesap oluşturma
- [x] **Şifremi Unuttum** — Şifre sıfırlama akışı
- [x] **Hesabım sayfası** — Profil bilgileri, siparişler, adresler
- [x] **Adres yönetimi** — Çoklu adres desteği
- [x] **Sipariş takibi** — Sipariş durumu görüntüleme

---

### 💳 Ödeme Entegrasyonu — ParamPos

- [x] **Hosted Checkout entegrasyonu** — ParamPos'a yönlendirme tabanlı ödeme akışı
- [x] **Callback handler** — Ödeme dönüş URL'i işleme
- [x] **Sipariş oluşturma** — Ödeme onayı sonrası DB'ye sipariş kaydetme
- [x] **E-posta bildirimi** — Sipariş onay maili (SMTP)

---

### 🔧 Admin Paneli

- [x] **Admin login sayfası** — Email/şifre ile güvenli giriş
  - bcrypt ile şifre doğrulama
  - `admin_sessions` tablosunda session token saklama
  - 7 günlük oturum süresi
- [x] **Dashboard** — İstatistikler, son siparişler özeti
- [x] **Sipariş yönetimi** — Listeleme, durum güncelleme, detay görüntüleme
- [x] **Ürün yönetimi** — Ürün ekleme/düzenleme/silme, görsel yükleme
- [x] **Kategori yönetimi** — Kategori ekleme/düzenleme
- [x] **Marka yönetimi** — Marka ekleme/düzenleme
- [x] **Müşteri yönetimi** — Müşteri listesi, detayları
- [x] **Kupon yönetimi** — Kupon kodları oluşturma/yönetimi
- [x] **Hero slider yönetimi** — Ana sayfa görselleri yönetimi
- [x] **🧾 Fatura Yönetimi** — QNB eSolutions e-Arşiv entegrasyonu
  - Sipariş bazlı fatura kesme
  - Toplu fatura işleme
  - e-Arşiv bağlantı ayarları
  - SOAP/UBL-TR XML desteği

---

### 🎨 UI/UX İyileştirmeleri

- [x] **Cookie consent banner** — KVKK uyumlu çerez onay sistemi
- [x] **WhatsApp butonu** — Floating butonu (admin sayfalarında gizli)
- [x] **Erişilebilirlik widget'ı** — Font boyutu, kontrast ayarları (admin sayfalarında gizli)
- [x] **Cart toast bildirimi** — Sepete ekleme bildirimi (admin sayfalarında gizli)
- [x] **Coming soon sayfası** — Site henüz yayında değilken gösterilen sayfa

---

### 🎨 Admin Panel Yeniden Tasarımı (Nisan 2026)

- [x] **Login sayfası yeniden tasarlandı** — Minimal, kurumsal tasarım; emoji kaldırıldı; gerçek logo; sol brand panel + sağ form
- [x] **Dashboard sidebar yeniden tasarlandı** — Koyu tema (#0b1117), gerçek logo (filtre kaldırıldı), kullanıcı bilgi kartı, "Admin Panel" badge kaldırıldı
- [x] **Hoş geldin mesajı** — Giriş yapan kullanıcının adı topbar'da gösteriliyor
- [x] **Ürün galerisi düzeltildi** — Ürün düzenleme modalında galeri görsellerini yükleme, URL ekleme, ana görsel yapma, silme özellikleri çalışır hale getirildi
- [x] **Sipariş sayfası pagination** — Her zaman görünür, ilk/son sayfa butonları eklendi
- [x] **Logo beyaz filtresi kaldırıldı** — Gerçek Merumy yeşili logo artık doğal rengiyle görünüyor
- [x] **Activity log API düzeltildi** — Pagination formatı, `admin_users` join hatası ve filtre parametreleri düzeltildi

### 📈 Analiz & Mail Marketing (Nisan 2026)

- [x] **Analiz sekmesi** (admin@merumy.com'a özel)
  - Bugün özeti: sipariş, ciro, satılan ürün, kargoya çıkan
  - Tarih aralığı filtresi + hızlı önayarlar (Bugün, Bu Hafta, Bu Ay, Son 30 Gün)
  - Toplam KPI kartları: ciro, sipariş, satılan ürün, kargo
  - Durum dağılımı (tüm sipariş statüsleri)
  - Günlük detay tablosu (sipariş, ciro, ürün, kargo, bekleyen)
  - En çok satan 10 ürün listesi
- [x] **Mail Marketing sekmesi** (sena, serap, buse, admin'e özel)
  - Segment filtreleri: Tüm Kullanıcılar / Sipariş Verenler / Hiç Sipariş Vermeyenler / Tekrar Alışveriş Yapanlar / Yüksek Değerli / Son 30-90 Gün Kayıt
  - Ad/e-posta arama + kayıt tarihi aralığı filtresi
  - E-posta listesini kopyala (tek tıkla clipboard)
  - CSV olarak indir (UTF-8 BOM, Excel uyumlu)
  - Kullanıcı tablosu: ad, e-posta, telefon, sipariş sayısı, toplam harcama, kayıt tarihi

### 🔐 Admin Kullanıcı Yönetimi (Nisan 2026)

- [x] **Admin kullanıcı yönetimi API** — `app/api/admin/admin-users/route.ts` (CRUD)
  - Kullanıcı oluşturma, güncelleme, silme
  - bcrypt şifre hashleme
  - Bölüm bazlı erişim kontrolü (`allowed_sections` JSON kolonu)
  - `must_change_password` ilk giriş akışı
- [x] **İndirim kuponu yönetimi API** — `app/api/admin/coupons/route.ts` (CRUD)
  - Sabit tutar / yüzde indirim tipleri
  - Min sipariş tutarı, maks indirim tutarı
  - Marka & kullanıcıya özel kuponlar
  - Kullanım limiti, geçerlilik tarihi
- [x] **Kupon doğrulama API** — `app/api/coupon/validate/route.ts`
- [x] **Admin dashboard güncellemeleri**
  - Admin Kullanıcılar sekmesi (sadece super_admin erişebilir)
  - İndirim Kodları sekmesi (duygu, buse, serap, sena erişebilir)
  - Kore Trendleri yönetiminde yeni bölümler: Bestsellers, Exclusive, Korean Make Up
  - Şifre değiştirme modalı (ilk giriş zorunluluğu)
- [x] **Başlangıç admin kullanıcıları oluşturuldu**
  - devrim, duygu, serap, huseyin — varsayılan şifre: Merumy2026
  - Erişim seviyeleri konfigüre edildi
- [x] **50 adet kupon kodu** — 1000 TL indirim, 5000 TL min sepet tutarı

---

### 🏠 Ana Sayfa & Koleksiyon Güncellemeleri (Nisan 2026)

- [x] **Ürün verileri DB'den çekiliyor** — Tüm ana sayfa komponentleri JSON yerine API kullanıyor
  - `KoreTrendleri` → `/api/kore-trends?section=kore_trend`
  - `Bestsellers` → `/api/kore-trends?section=bestsellers`
  - `MerumyExclusive` → `/api/kore-trends?section=exclusive`
  - `KoreanMakeup` → `/api/kore-trends?section=makeup`
  - `Frankly` → `/api/products/by-brand`
- [x] **Koleksiyon sayfaları** — En Çok Satanlar, Merumy.com'a Özel, Kore Trendleri admin panelinden yönetiliyor
- [x] **Korean Make Up "Tümünü Gör"** — `/shop/makyaj` bağlantısı doğrulandı
- [x] **Blur + scroll okları** — KORE TRENDLERİ, EN ÇOK SATANLAR, MERUMY.COM'A ÖZEL, KOREAN MAKE UP carousel'larına eklendi

---

### 🔍 Arama Çubuğu Güncellemeleri (Nisan 2026)

- [x] **Mac ⌘/ ikonu kaldırıldı** — Arama çubuğundaki kısayol göstergesi silindi
- [x] **"Son Aramalar" bölümü** — localStorage'dan çekiliyor
- [x] **Fiyat "0" sorunu** — `price` ve `originalPrice` her zaman `Number()` ile dönüştürülüyor
- [x] **Kategori dropdown** — Marka logoları kaldırıldı, sadece isimler gösteriliyor

---

### 🐛 Çözülen Hatalar (4 Nisan 2026)

| Tarih | Hata | Çözüm |
|---|---|---|
| 4 Nisan 2026 | `TypeError: e.product.price.toFixed is not a function` sepet hatası | `Frankly.tsx`, `SpecialOffers.tsx`, `NewInStore.tsx`, `ProductClient.tsx`, `siparislerim/page.tsx` — tüm `.toFixed()` çağrıları `Number()` ile sarıldı |
| 4 Nisan 2026 | Admin paneli mobil tablolar uyumsuz | Tüm tablolara `min-w-[600px-800px]` sınıfı eklendi, `overflow-x-auto` korundu |
| 4 Nisan 2026 | Yeni siparişler DB'ye yazılmıyordu | `payment/callback/route.ts` — JSON yanı sıra `orders` ve `order_items` tablolarına da yazılıyor |
| 4 Nisan 2026 | Kullanıcı siparişleri sadece JSON'dan çekiliyordu | `app/api/orders/route.ts` GET — JSON + DB merge, email ile DB'den de sorgulama |
| 4 Nisan 2026 | İletişim formu sadece `info@merumy.com`'a gidiyordu | `huseyinkulekci0@gmail.com` da alıcılara eklendi |
| Nisan 2026 | Admin login "Geçersiz e-posta veya şifre" hatası | SHA256 yerine bcrypt ile şifre doğrulama; tüm admin şifreleri sıfırlandı (`Merumy2026`) |
| Nisan 2026 | Admin login sayfasında mağaza UI komponentleri görünüyordu | `CookieConsent`, `CartToast`, `WhatsAppButton`, `AccessibilityWidget` — `/admin` path kontrolü eklendi |
| Nisan 2026 | Coming soon sayfası istenmedik zamanda aktifti | Nginx config güncellendi, API route'ları çalışmaya devam etti |
| Nisan 2026 | Activity log "0 kayıt" sorunu | API response formatı düzeltildi (`pagination` objesi), `JOIN users` → `JOIN admin_users`, filtre parametreleri eklendi |
| Nisan 2026 | Logo beyaz görünüyordu | `brightness(0) invert(1)` CSS filtresi kaldırıldı |
| Geçmiş | `useEffect` hook rule ihlali (CookieConsent.tsx) | Hook, early return'den önce taşındı |

---

## 🔄 Şu Anki Durum

### Aktif Mod: **Coming Soon**
- `merumy.com` ziyaretçilere coming soon sayfası gösteriyor
- `merumy.com/api/*` API endpoint'leri çalışıyor
- `yonetim.merumy.com` admin paneli tamamen çalışıyor

### Canlı Hale Geçmek İçin:
1. Nginx config'de `location /` bloğunu coming soon'dan Next.js proxy'e çevir
2. `nginx -t && systemctl reload nginx`

---

## 📌 Bekleyen / Yapılacaklar

- [ ] **SSL (HTTPS)** — Let's Encrypt ile SSL sertifikası kurulumu
- [ ] **Coming soon → Canlı geçiş** — Nginx konfigürasyonu güncellenecek
- [ ] **E-posta sistemi iyileştirmesi** — Transactional mail şablonları
- [ ] **QNB e-Arşiv — Canlı test** — Gerçek QNB credentials ile entegrasyon testi
- [ ] **ParamPos canlı moda geçiş** — Test modundan production moduna geçiş
- [ ] **Performans optimizasyonu** — Image optimizasyon, caching stratejisi
- [ ] **Analytics** — Google Analytics veya benzeri entegrasyon
- [ ] **SEO** — Meta tag'lar, sitemap, robots.txt iyileştirmeleri (sitemap.ts ve robots.ts mevcut)

---

## 🗝️ Önemli Bilgiler (Hızlı Referans)

```
Sunucu SSH:     root@31.210.36.183  /  Tbt12345-
Admin Panel:    http://yonetim.merumy.com  →  /admin
Admin Giriş:    admin@merumy.co  /  Merumy2026
DB:             mysql -u merumy_user '-pMLD)JQR4*#W%(*m&' merumy
GitHub:         https://github.com/Cos1907/merumy
PM2 App:        merumy-full  (port 3005)
PM2 Logs:       /root/.pm2/logs/merumy-full-error.log
Nginx Config:   /etc/nginx/sites-enabled/merumy.com
```
