# 📋 Merumy — Geliştirme İlerleme Raporu

> Son güncelleme: 4 Nisan 2026 (Akşam)

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

### 🛠️ Ürün Detay & Carousel Güncellemeleri (4 Nisan 2026 — Akşam)

- [x] **İLGİLİ ÜRÜNLER tamamen DB'den** — `app/product/[slug]/page.tsx`
  - JSON fallback tamamen kaldırıldı; ürün sadece veritabanında aranıyor
  - DB'de bulunamazsa `notFound()` (404) döndürülüyor — JSON'dan gösterilmiyor
  - Görsel sorgusu iyileştirildi: önce `is_primary=1` görseli, yoksa herhangi bir görsel (`COALESCE` ile)
  - İlgili ürünler (`getRelatedFromDB`) aynı iyileştirme uygulandı
  - `generateMetadata` da artık sadece DB'den çekiyor
- [x] **Admin paneli layout düzeltildi** — `app/admin/dashboard/page.tsx`
  - `👤 Admin Kullanıcı Yönetimi` ve `🎟️ İndirim Kodu Yönetimi` sekmeleri `p-4 md:p-6 max-w-5xl mx-auto` ile sarılıyordu
  - Dış container'ın `p-3 md:p-6`'sıyla çift padding oluşturup sağa kayma yaratan fazla sınıflar kaldırıldı
- [x] **Carousel ürünleri her yüklemede değişiyor** — `app/api/kore-trends/route.ts`
  - `ORDER BY k.added_at DESC` → `ORDER BY RAND()` olarak değiştirildi
  - KORE TRENDLERİ, EN ÇOK SATANLAR, MERUMY.COM'A ÖZEL her açılışta rastgele ürün sırası gösteriyor
- [x] **Hero slider cache sorunu giderildi** — `app/components/Hero.tsx`
  - `useEffect` ile `/api/hero?t=timestamp` endpoint'inden `cache: 'no-store'` seçeneğiyle taze veri çekiyor
  - Sayfa HTML'i CDN/Nginx tarafından cache'lense bile slider verileri her zaman güncel DB'den geliyor
  - Admin link veya görsel güncellediğinde canlıda anında yansıyor

---

### 🐛 Çözülen Hatalar (4 Nisan 2026 — Akşam)

| Hata | Çözüm |
|---|---|
| Ürün görseli görünmüyordu (is_primary=1 olan görsel yoksa boş geliyordu) | `COALESCE` ile önce primary, sonra herhangi bir görsel alınıyor |
| JSON'dan gelen ürünler görselsiz görünüyordu | Ürün sayfası tamamen DB'ye bağlandı, JSON fallback kaldırıldı |
| Admin Kullanıcı & İndirim Kodu sekmeleri PC'de sağa kayıyordu | Çift padding (`p-4 md:p-6 max-w-5xl mx-auto`) kaldırıldı |
| Hero yönetiminde güncellenen link/görsel canlıya yansımıyordu | Hero bileşeni client-side API fetch ile cache bypass yapıyor |
| Carousel ürünleri her açılışta aynı sırada görünüyordu | `RAND()` sıralama eklendi |

---

### 🔐 Sosyal Giriş & Hesap Bazlı Sepet (4 Nisan 2026 — Gece)

#### Google ile Giriş (OAuth 2.0)
- [x] **`/api/auth/google`** — Google OAuth consent ekranına yönlendirme (state cookie ile CSRF koruması)
- [x] **`/api/auth/google/callback`** — Token değişimi, kullanıcı bilgisi çekme, DB'de eşleştirme
  - **E-posta eşleştirme:** Aynı e-posta zaten kayıtlıysa (şifre ile kayıt vs. Google) mevcut hesaba otomatik giriş yapılır — **çift kayıt oluşmaz**
  - Yeni kullanıcıysa `is_active=1, email_verified=1`, `password_hash=''` olarak oluşturulur
  - Misafir sepeti kullanıcı hesabına aktarılır
- [x] **`/api/auth/google/callback`** için Google Cloud Console'da `redirect_uri` güncellenmeli:
  ```
  https://merumy.com/api/auth/google/callback
  ```
  > ⚠️ Google Console → Credentials → OAuth 2.0 Client → "Authorized redirect URIs" bölümüne eklenmelidir.

#### Facebook ile Giriş (OAuth 2.0)
- [x] **`/api/auth/facebook`** — Facebook OAuth dialog'una yönlendirme
- [x] **`/api/auth/facebook/callback`** — Token değişimi, kullanıcı bilgisi, DB eşleştirme
  - Aynı e-posta kontrolü (Google ile girmiş ama Facebook ile denenirse → aynı hesaba giriş)
  - **Facebook App'te ayarlanması gereken Callback URL:**
    ```
    https://merumy.com/api/auth/facebook/callback
    ```
  > ⚠️ Facebook Developer Console → App → Facebook Login → Settings → "Valid OAuth Redirect URIs" bölümüne eklenmelidir.
- [x] **Credentials:**
  - App ID: `1480189673750604`
  - Callback URL: `https://merumy.com/api/auth/facebook/callback`

#### Giriş / Kayıt Sayfası Güncellemeleri
- [x] **`/login`** — "Google ile Giriş Yap" ve "Facebook ile Giriş Yap" butonları aktif edildi (eski `disabled` kaldırıldı)
- [x] **`/signup`** — "Google ile Kayıt Ol" ve "Facebook ile Kayıt Ol" butonları eklendi

#### Hesap Bazlı Sepet (Cross-Device)
- [x] **`app/lib/cart/store.ts`** — `getCartKey()` değiştirildi:
  - Giriş yapmış kullanıcı: `user:{userId}` (cihazdan bağımsız, hesaba bağlı)
  - Misafir: `guest:{cartId}` (tarayıcıya özel)
- [x] **Çoklu cihaz desteği:** Telefondan eklenen ürünler PC'de de görünür (aynı hesap, aynı anahtar)
- [x] **Çıkış yapınca sepet sıfırlanır:** Session temizlenir → misafir sepeti boş → kullanıcı farklı biri sepeti göremez
- [x] **Tekrar girişte sepet geri gelir:** Kullanıcı hesabının sepeti `user:{userId}` altında saklanmaya devam eder
- [x] **`app/api/auth/login/route.ts`** — Giriş sırasında misafir sepeti hesap sepetine birleştirme güncellendi
- [x] **`app/api/auth/update-profile/route.ts`** — SHA256 yerine bcrypt ile şifre doğrulama; OAuth kullanıcıları için şifre değişikliği engellendi

---

### 🐛 Çözülen Hatalar (4 Nisan 2026 — Gece / OAuth Düzeltmeleri)

| Hata | Neden | Çözüm |
|---|---|---|
| Google ile giriş sonrası tekrar `/login`'e dönüyor | `createSession()` cookie'yi `cookies().set()` ile set ediyor, ardından `NextResponse.redirect()` farklı bir response objesi oluşturduğu için cookie aktarılmıyordu | `createSessionToken()` fonksiyonu eklendi; token döner, cookie set etmez. Cookie doğrudan `res.cookies.set()` ile redirect response'a yazılıyor |
| Facebook: `Invalid Scopes: email` | `scope: 'email,public_profile'` — `public_profile` bazı app konfigürasyonlarında geçersiz scope hatası veriyor | Scope `email` olarak sadeleştirildi; `public_profile` default permission olduğu için zaten geliyor |
| Facebook: "Bu içeriğe şu anda ulaşılamıyor" | Facebook App'te app domain ve redirect URI eklenmemişti | Kullanıcı Facebook Developer Console'dan `merumy.com` domain + callback URL ekledi |
| Google: `redirect_uri_mismatch` | Eski credential "installed app" tipindeydi; redirect URI sadece `http://localhost` kabul ediyordu | Yeni "Web Application" tipinde credential oluşturuldu, `https://merumy.com/api/auth/google/callback` eklendi |
| Google/Facebook: `invalid_state` hatası | `sameSite: lax` cookie, Cloudflare proxy arkasında callback sırasında iletilmiyordu | Cookie yerine **time-based state** uygulandı: state = base64url(`{ts, r}`) → callback'te sadece timestamp kontrolü (10 dk) yapılıyor, cookie gerektirmiyor |
| Marka sayfası bulunamıyor: `/marka/pyunkang-yul` | DB'de slug `pkunkang-yul` (yazım hatası) olarak kaydedilmişti | Sunucuda `UPDATE brands SET slug='pyunkang-yul' WHERE slug='pkunkang-yul'` çalıştırıldı |
| Tüm Ürünler sayfasında Marka/Kategori filtresi kapanmıyor | Header her zaman açık durumdaydı, toggle yoktu | `brandOpen` / `categoryOpen` state eklendi; başlığa tıklayınca açılır/kapanır; ChevronDown ikonu ile animasyonlu |

---

### 🐛 Çözülen Hatalar (4 Nisan 2026 — Gece / Kupon & Admin Layout Düzeltmeleri)

| Hata | Neden | Çözüm |
|---|---|---|
| Google GSI popup kapanmıyordu | `ux_mode: 'popup'` ve `cancel_on_tap_outside: true` `google.accounts.id.initialize()`'a geçersiz parametrelerdi; popup kapatma davranışını bozuyordu | Bu iki parametre kaldırıldı; GSI `renderButton` kendi popup/session yönetimini yapar, callback tetiklenince otomatik kapanır |
| Admin panelinde `👤 Admin Kullanıcılar` ve `🎟️ İndirim Kodları` sekmeleri PC'de sağa kayıyordu | Bu iki sekme `</main>` etiketinin **dışına** çıkmıştı; dış flex container'da sidebar'ın yanında ayrı flex eleman olarak render oluyordu | `</div></main>` kapanış etiketleri coupons sekmesinin hemen ardına taşındı; her iki sekme artık `<main>` içinde, diğer sekmelerle aynı layout container'da |
| Sepette promosyon kodu "Geçersiz" hatası veriyordu (`6JRHVZZJ` gibi aktif kodlar dahil) | Validate endpoint önce `discount_codes` tablosunu sorguluyordu; bu tabloda `brand_id` kolonu olmadığından SQL hatası fırlatılıyor, `coupons` tablosuna hiç gelinmiyordu. Admin paneli `coupons` tablosunu yönetiyorken validate `discount_codes` tablosuna bakıyordu | Validate endpoint sadece `coupons` tablosuna bakacak şekilde yeniden yazıldı; `discount_codes` referansı tamamen kaldırıldı; sadece admin panelindeki kodlar geçerli |
| Admin panel coupon listesinde `%30` yerine `%0` görünüyordu | `c.type \|\| c.discount_type` ifadesi `discount_codes` tablosu için yazılmıştı; `coupons` tablosu `discount_type` / `discount_value` kullanıyor | Display kodu `c.discount_type` ve `c.discount_value` doğrudan kullanacak şekilde düzeltildi |

#### Kupon Sistemi Mimari Netleştirme
- **`coupons` tablosu**: Admin paneli `🎟️ İndirim Kodu Yönetimi` → `/api/admin/coupons` → `coupons` — **geçerli ve doğru tablo**
- **`discount_codes` tablosu**: Eski sistem kalıntısı; admin paneli tarafından yönetilmiyor; validate endpoint artık bu tabloya bakmıyor
- **Sonuç**: Sadece admin panelinden eklenen/yönetilen kuponlar sepette çalışır

### 🐛 Çözülen Hatalar (4 Nisan 2026 — Gece 2 / Kupon Sistem Yeniden Yazımı)

| Hata | Neden | Çözüm |
|---|---|---|
| `6JRHVZZJ` admin panelinde aktif olmasına rağmen "Promosyon kodu geçersiz" hatası | `store.ts`'deki `normalizePromo` tamamen hardcoded bir liste kullanıyordu; `coupons` DB tablosuna hiç bakılmıyordu; yeni eklenen kodlar çalışmıyordu | `store.ts`'deki `normalizePromo` kaldırıldı; `Cart` tipi `promoType/promoValue/promoMinAmount` alanlarıyla genişletildi; `setPromo` DB detaylarını kabul eder; `hydrateCart` stored detayları kullanır |
| `MERUMY250` gibi hardcoded kodlar admin panelinde olmamasına rağmen çalışıyordu | `normalizePromo`'da `MERUMY250`, `MERUMY10`, `HOSGELDIN10` ve 50 adet bulk kod elle yazılmıştı | Tüm hardcoded kodlar kaldırıldı |
| `/api/cart` (setPromo) `coupons` DB'ye bakmıyordu | `cart/route.ts` sadece `normalizePromo` üzerinden doğrulama yapıyordu | `cart/route.ts` setPromo handler'ında `coupons` tablosuna `queryOne` ile bakılıyor; DB'den gelen `discount_type`/`discount_value` bilgileriyle `setPromo` çağrılıyor |
| `CartContext` hardcoded minimum tutar listesi tutuyordu | `BULK_PROMO_CODES_CTX` seti ve koşullu `promoMinAmount` hesabı frontend'de hardcode'du | `CartContext`'ten kaldırıldı; minimum tutar artık sunucu tarafında DB'den kontrol ediliyor |

---

### 🐛 Çözülen Hatalar (4 Nisan 2026 — Gece 3 / Sipariş Durumu & Carousel)

| Hata | Neden | Çözüm |
|---|---|---|
| Kullanıcı dashboardunda sipariş "Hazırlanıyor" görünüyor, admin panelinde "İptal" | `app/api/orders/route.ts` merge yaparken JSON siparişleri önce ekliyordu; aynı `orderId` DB'de de varsa JSON'un eski statüsü kazanıyordu | Merge sırası tersine çevrildi: **DB siparişleri önce** eklenir, JSON yalnızca DB'de bulunmayan siparişler için fallback olarak kullanılır |
| Sipariş detay sayfası (`/api/orders/[orderId]`) da yalnızca JSON'a bakıyordu | Rota sadece `orders.json` dosyasında arama yapıyor, DB'ye hiç sorgu atmıyordu | Rota yeniden yazıldı: önce DB'den `queryOne` ile sipariş ve `order_items` çekiliyor; bulunamazsa JSON fallback kullanılıyor |
| EN ÇOK SATANLAR ve MERUMY.COM'A ÖZEL carousel her yüklemede aynı ürünleri gösteriyor | `kore_trend_products` tablosunda `bestsellers` ve `exclusive` section kaydı yok; tag-based ve last-resort fallback sorgularda `RAND()` yoktu, hep aynı sırayla geliyordu | Tag-based ve last-resort fallback sorgulara `ORDER BY RAND()` eklendi; her sayfa yüklemesinde farklı ürünler gelir |

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
