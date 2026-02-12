# Sunucu Kurulum Rehberi
# Bu dosya sunucuya ilk kurulum için adımları içerir

## 1. Sunucuya Bağlan
```bash
ssh root@31.210.36.183
# Şifre: Tbt12345-
```

## 2. Gerekli Paketleri Yükle
```bash
# Node.js 18+ yüklü mü kontrol et
node --version

# Eğer yoksa:
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# PM2 yükle (process manager)
npm install -g pm2

# Nginx yükle (reverse proxy için - isteğe bağlı)
apt-get install -g nginx
```

## 3. Uygulama Dizini Oluştur
```bash
# Uygulama için dizin oluştur (başka siteleri bozmamak için)
mkdir -p /var/www/merumy
cd /var/www/merumy
```

## 4. Dosyaları Yükle
```bash
# Local bilgisayarınızdan:
# 1. Projeyi zip'le
# 2. Sunucuya gönder:
scp -r /path/to/project root@31.210.36.183:/var/www/merumy/

# VEYA git kullanıyorsanız:
git clone YOUR_REPO_URL /var/www/merumy
```

## 5. Environment Variables Ayarla
```bash
cd /var/www/merumy
nano .env.local

# .env.production.example dosyasındaki içeriği yapıştırın
# Production Param bilgilerini girin
```

## 6. Bağımlılıkları Yükle ve Build
```bash
cd /var/www/merumy
npm install
npm run build
```

## 7. PM2 ile Başlat
```bash
cd /var/www/merumy
pm2 start npm --name "merumy" -- start
pm2 save
pm2 startup  # Sistem açılışında otomatik başlat
```

## 8. Firewall Ayarları
```bash
# Port 3000'i aç
ufw allow 3000/tcp
ufw reload
```

## 9. Nginx Reverse Proxy (İsteğe bağlı - domain kullanıyorsanız)
```bash
# /etc/nginx/sites-available/merumy dosyası oluştur
nano /etc/nginx/sites-available/merumy

# İçerik:
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Link oluştur ve nginx'i yeniden başlat
ln -s /etc/nginx/sites-available/merumy /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 10. Param'a IP Adresini Bildir
Param destek ekibine şu bilgileri gönderin:
- **Sunucu IP:** 31.210.36.183
- **Callback URL:** http://31.210.36.183:3000/api/payment/callback/success
- **Hata URL:** http://31.210.36.183:3000/api/payment/callback/fail

## 11. Test
```bash
# PM2 durumunu kontrol et
pm2 status

# Logları izle
pm2 logs merumy

# Uygulamayı test et
curl http://localhost:3000
```

## Önemli Notlar
- Sunucuda başka siteler varsa, port çakışması olmamasına dikkat edin
- PM2 ile uygulama otomatik restart olur
- Loglar: `pm2 logs merumy`
- Restart: `pm2 restart merumy`
- Stop: `pm2 stop merumy`



