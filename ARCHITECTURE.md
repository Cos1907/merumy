# 🏗️ Merumy — Mimari & Altyapı Dokümantasyonu

> Son güncelleme: Nisan 2026

---

## 🖥️ Sunucu Bilgileri

| Bilgi | Değer |
|---|---|
| **IP Adresi** | `31.210.36.183` |
| **SSH Kullanıcı** | `root` |
| **SSH Şifresi** | `Tbt12345-` |
| **İşletim Sistemi** | Ubuntu 22.04 LTS |
| **Kernel** | Linux 5.15.0-171-generic |
| **CPU** | Intel Xeon E5-2699C v4 @ 2x 2.2GHz |
| **RAM** | 2968 MB (~3 GB) |
| **Disk** | 59 GB (şu an %46 kullanımda) |
| **Sağlayıcı** | Hosting Dünyam Bilişim Teknolojileri |
| **Veri Merkezi** | Comnet Datacenter |

### SSH Bağlantısı
```bash
ssh root@31.210.36.183
# Şifre: Tbt12345-
```

---

## 📁 Sunucudaki Dosya Yapısı

```
/var/www/
├── merumy-full/          ← Ana Next.js uygulaması
│   ├── app/              ← Next.js App Router sayfaları ve API'ler
│   ├── public/           ← Statik dosyalar (görseller, logolar)
│   │   ├── herosection/  ← Ana sayfa hero görselleri
│   │   ├── mobilsliderlar/ ← Mobil slider görselleri
│   │   ├── products/     ← Ürün görselleri
│   │   └── comingsoon/   ← Coming soon sayfa varlıkları
│   ├── .env              ← Ortam değişkenleri (ParamPos bilgileri)
│   ├── next.config.js
│   ├── package.json
│   └── .next/            ← Build çıktısı (build sonrası oluşur)
│
└── html/
    ├── comingsoon/       ← Coming soon HTML statik sayfası
    └── coming-soon.html  ← Nginx tarafından servis edilir
```

---

## ⚙️ PM2 Süreç Yöneticisi

| Bilgi | Değer |
|---|---|
| **PM2 Uygulama Adı** | `merumy-full` |
| **PM2 ID** | `2` |
| **Çalışma Dizini** | `/var/www/merumy-full` |
| **Başlatma Komutu** | `npm start` (Next.js production server) |
| **Port** | `3005` (localhost, dışa kapalı) |
| **Node.js Versiyonu** | `v20.20.0` |
| **NPM Versiyonu** | `10.8.2` |
| **Mod** | `fork_mode` |
| **Log (Error)** | `/root/.pm2/logs/merumy-full-error.log` |
| **Log (Output)** | `/root/.pm2/logs/merumy-full-out.log` |

### PM2 Komutları
```bash
pm2 list                        # Tüm süreçleri listele
pm2 restart merumy-full         # Uygulamayı yeniden başlat
pm2 stop merumy-full            # Uygulamayı durdur
pm2 logs merumy-full            # Canlı logları izle
pm2 logs merumy-full --lines 100 # Son 100 satır log
pm2 show merumy-full            # Detaylı süreç bilgisi
```

> **⚠️ Not:** `restarts: 1799` — Bu yüksek restart sayısı, geçmişteki build hatalarından kaynaklanıyor. Normal çalışmada sorun yok.

---

## 🌐 Nginx Yapılandırması

Nginx, ters proxy (reverse proxy) olarak çalışır. 2 ayrı virtual host yapılandırması var:

### 1. `merumy.com` — Ana Site (Coming Soon Modu)
**Dosya:** `/etc/nginx/sites-enabled/merumy.com`

```nginx
server {
    listen 80 default_server;
    server_name merumy.com www.merumy.com _;

    # Statik varlıklar (Next.js public/ klasöründen)
    location ^~ /herosection/   { alias /var/www/merumy-full/public/herosection/; }
    location ^~ /mobilsliderlar/ { alias /var/www/merumy-full/public/mobilsliderlar/; }
    location ^~ /products/      { alias /var/www/merumy-full/public/products/; }
    location ^~ /comingsoon/    { alias /var/www/html/comingsoon/; }

    # API çağrıları Next.js'e yönlendirilir
    location ^~ /api/ {
        proxy_pass http://127.0.0.1:3005;
        # ...
    }

    # Diğer her şey → Coming Soon sayfası
    location / {
        try_files $uri /coming-soon.html;
    }
}
```

**🔄 Coming Soon'u kapatıp siteyi açmak için** `location /` bloğunu şu şekilde değiştir:
```nginx
location / {
    proxy_pass http://127.0.0.1:3005;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```
Ardından: `nginx -t && systemctl reload nginx`

### 2. `yonetim.merumy.com` — Admin Paneli
**Dosya:** `/etc/nginx/sites-enabled/yonetim.merumy.com`

- Root `/` → `/admin`'e redirect
- Tüm istekler `http://127.0.0.1:3005`'e proxy edilir
- Statik dosyalar (herosection, mobilsliderlar) dosya sisteminden direkt servis edilir

### Nginx Komutları
```bash
nginx -t                    # Konfigürasyonu test et
systemctl reload nginx       # Konfigürasyonu yeniden yükle
systemctl restart nginx      # Nginx'i yeniden başlat
cat /etc/nginx/sites-enabled/merumy.com    # Ana site config
cat /etc/nginx/sites-enabled/yonetim.merumy.com  # Admin config
```

---

## 🗄️ Veritabanı

| Bilgi | Değer |
|---|---|
| **Motor** | MySQL |
| **Veritabanı Adı** | `merumy` |
| **Kullanıcı** | `merumy_user` |
| **Şifre** | `MLD)JQR4*#W%(*m&` |
| **Host** | `localhost` (sadece sunucu içi erişim) |

### Tablolar
| Tablo | Açıklama |
|---|---|
| `users` | Müşteri hesapları |
| `admin_users` | Admin panel kullanıcıları |
| `admin_sessions` | Admin oturum tokenları |
| `admin_activity_logs` | Admin eylem logları |
| `products` | Ürünler |
| `product_images` | Ürün görselleri |
| `product_variants` | Ürün varyantları (renk, beden) |
| `categories` | Kategoriler |
| `brands` | Markalar |
| `orders` | Siparişler |
| `order_items` | Sipariş kalemleri |
| `order_status_history` | Sipariş durum geçmişi |
| `coupons` | Kupon kodları |
| `discount_codes` | İndirim kodları |
| `hero_slides` | Ana sayfa hero slider'ları |
| `kore_trend_products` | Kore trend ürünleri |
| `user_addresses` | Müşteri adresleri |
| `password_reset_tokens` | Şifre sıfırlama tokenları |
| `app_settings` | Uygulama ayarları (QNB e-Arşiv vs.) |
| `settings` | Genel ayarlar |
| `site_settings` | Site görünüm ayarları |

### MySQL Bağlantısı
```bash
mysql -u merumy_user '-pMLD)JQR4*#W%(*m&' merumy
```

---

## 🚀 Deploy Süreci

### Standart Deploy Adımları
```bash
# 1. Lokal geliştirme → Git'e push
cd /Users/huseyinkulekci/Downloads/merumy_final_version/merumy-full
git add .
git commit -m "değişiklik açıklaması"
git push origin main

# 2. Sunucuya bağlan
ssh root@31.210.36.183
# Şifre: Tbt12345-

# 3. Sunucuda güncelle ve build al
cd /var/www/merumy-full
git pull origin main
npm run build

# 4. Uygulamayı yeniden başlat
pm2 restart merumy-full
```

### GitHub Repository
- **Repo:** `https://github.com/Cos1907/merumy`
- **Ana branch:** `main`

---

## 🏛️ Next.js Uygulama Mimarisi

```
app/
├── layout.tsx              ← Root layout (global komponenler)
├── page.tsx                ← Ana sayfa (/)
├── globals.css             ← Global CSS
├── middleware.ts            ← Next.js middleware (auth kontrol)
│
├── admin/                  ← Admin panel sayfaları
│   ├── login/page.tsx      ← Admin giriş sayfası
│   └── dashboard/page.tsx  ← Ana admin paneli (tüm sekmeler)
│
├── api/                    ← API Route'ları
│   ├── admin/
│   │   ├── auth/login/     ← Admin login API
│   │   ├── auth/logout/    ← Admin logout API
│   │   ├── auth/check/     ← Session kontrolü
│   │   ├── orders/         ← Sipariş yönetimi
│   │   ├── products/       ← Ürün yönetimi
│   │   ├── categories/     ← Kategori yönetimi
│   │   ├── fatura/         ← QNB e-Arşiv fatura entegrasyonu
│   │   └── settings/       ← Ayarlar
│   ├── orders/             ← Müşteri sipariş API'leri
│   ├── products/           ← Ürün API'leri
│   ├── auth/               ← Müşteri auth API'leri
│   └── payment/            ← ParamPos ödeme entegrasyonu
│
├── components/             ← Ortak React komponentleri
│   ├── CookieConsent.tsx   ← Çerez onay banner'ı
│   ├── CartToast.tsx       ← Sepet bildirimi
│   ├── WhatsAppButton.tsx  ← WhatsApp butonu
│   └── AccessibilityWidget.tsx ← Erişilebilirlik widget'ı
│
├── context/                ← React Context'ler
│   └── CartContext.tsx     ← Sepet state yönetimi
│
└── lib/
    └── db.ts               ← MySQL veritabanı bağlantısı ve helpers
```

---

## 🔐 Admin Panel Erişimi

| Bilgi | Değer |
|---|---|
| **URL (Alt domain)** | `http://yonetim.merumy.com` → `/admin` |
| **URL (Direkt)** | `http://merumy.com/admin` |
| **Admin Email** | `admin@merumy.co` |
| **Admin Şifre** | `Merumy2026` |
| **Şifre Hash Tipi** | bcrypt (bcryptjs) |

### Admin Şifresini Sıfırlamak İçin
```javascript
// Node.js ile yeni hash oluştur:
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('YeniŞifre', 10);
// Sonra MySQL'de güncelle:
// UPDATE admin_users SET password_hash = '<hash>' WHERE email = 'admin@merumy.co';
```

---

## 💳 Ödeme Entegrasyonu — ParamPos

| Bilgi | Değer |
|---|---|
| **Sağlayıcı** | ParamPos (Param) |
| **Test Kart No** | `6371500611323368` |
| **GUID** | `C0A6E111-408E-4BF4-9751-1A340798217A` |
| **Client Code** | `160915` |
| **Client Username** | `TP10177898` |
| **Entegrasyon** | Hosted Checkout (yönlendirme tabanlı) |

---

## 🧾 e-Arşiv Fatura Entegrasyonu — QNB eSolutions

| Bilgi | Değer |
|---|---|
| **Sağlayıcı** | QNB eSolutions |
| **Protokol** | SOAP (XML tabanlı) |
| **Standart** | UBL-TR (Türkiye e-Arşiv standardı) |
| **Ayarlar** | `app_settings` tablosunda saklanır |
| **API Route** | `/api/admin/fatura` |

Ayarlar admin paneli → Fatura Yönetimi → ⚙️ Ayarlar'dan yapılandırılır.

---

## 🌍 Domain & DNS

| Domain | Yönlendirme |
|---|---|
| `merumy.com` | → Sunucu IP (Cloudflare Proxy ile) |
| `www.merumy.com` | → Sunucu IP |
| `yonetim.merumy.com` | → Sunucu IP (Admin panel) |

**Not:** Cloudflare Flexible SSL kullanılıyor. `X-Forwarded-Proto` header'ı güvenilir olarak işaretleniyor.

---

## 🔧 Ortam Değişkenleri

Veritabanı bağlantısı `app/lib/db.ts` içinde hardcoded fallback değerlerle tanımlı. Sunucuda `.env` dosyası `/var/www/merumy-full/.env` konumunda bulunur.

```env
DB_HOST=localhost
DB_USER=merumy_user
DB_PASSWORD=MLD)JQR4*#W%(*m&
DB_NAME=merumy
```

---

## 📊 Teknoloji Stack'i

| Katman | Teknoloji |
|---|---|
| **Frontend Framework** | Next.js 14 (App Router) |
| **UI Styling** | Tailwind CSS |
| **Programlama Dili** | TypeScript |
| **Veritabanı** | MySQL |
| **ORM/DB Client** | mysql2/promise (raw SQL) |
| **Şifre Hash** | bcryptjs |
| **Web Sunucusu** | Nginx (reverse proxy) |
| **Süreç Yöneticisi** | PM2 |
| **Runtime** | Node.js v20.20.0 |
| **Paket Yöneticisi** | npm 10.8.2 |
| **Versiyon Kontrolü** | Git + GitHub |
| **CDN/Proxy** | Cloudflare |
