# 📋 Merumy — Geliştirme İlerleme Raporu

> Son güncelleme: Nisan 2026

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

### 🐛 Çözülen Hatalar

| Tarih | Hata | Çözüm |
|---|---|---|
| Nisan 2026 | Admin login "Geçersiz e-posta veya şifre" hatası | SHA256 yerine bcrypt ile şifre doğrulama; tüm admin şifreleri sıfırlandı (`Merumy2026`) |
| Nisan 2026 | Admin login sayfasında mağaza UI komponentleri görünüyordu | `CookieConsent`, `CartToast`, `WhatsAppButton`, `AccessibilityWidget` — `/admin` path kontrolü eklendi |
| Nisan 2026 | Coming soon sayfası istenmedik zamanda aktifti | Nginx config güncellendi, API route'ları çalışmaya devam etti |
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
