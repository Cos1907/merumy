# Deploy Talimatları - Hash Encoding Güncellemeleri

## Yapılan Kritik Değişiklikler

### ✅ 1. Hash Encoding: UTF-8 → ISO-8859-9 (Türkçe karakterler için)
- **Dosya**: `app/lib/param.ts`
- **Fonksiyon**: `sha2b64()` ve `sha1b64()`
- **Kaynak**: nodejs-client-main/src/types/utils/Hash.js

### ✅ 2. API Hash Format: URL parametreleri kaldırıldı
- **Dosya**: `app/lib/param.ts`
- **Fonksiyon**: `calculateWMDHash()`
- **Kaynak**: nodejs-client-main/src/services/OdemeService.js
- **Eski**: `CLIENT_CODE + GUID + Taksit + Islem_Tutar + Toplam_Tutar + Siparis_ID + Hata_URL + Basarili_URL`
- **Yeni**: `CLIENT_CODE + GUID + Taksit + Islem_Tutar + Toplam_Tutar + Siparis_ID`

### ✅ 3. Hash Algoritması: SHA1 (doğru)
- ParamPOS SHA2B64 metodunda SHA1 kullanıyor

## Manuel Deploy (Önerilen)

### 1. Terminal'den SSH ile bağlan:
```bash
ssh root@31.210.36.183
# Şifre: Tbt12345-
```

### 2. Mevcut kodu yedekle:
```bash
cd /var/www/glowify
cp -r . ../glowify-backup-$(date +%Y%m%d-%H%M%S)
```

### 3. Yerel bilgisayardan dosyaları kopyala:

**Mac/Linux terminalinde** (SSH bağlantısını kapatıp yerel terminalde):
```bash
cd "/Users/huseyinkulekci/Downloads/glowify-beauty-products-ecommerce-template-2025-05-18-01-33-50-utc/Glowify - Template"

# Dosyaları gönder (şifre: Tbt12345-)
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next' \
  --exclude '*.exp' \
  ./ root@31.210.36.183:/var/www/glowify/
```

### 4. Sunucuda build ve restart:

SSH ile tekrar bağlan ve:
```bash
ssh root@31.210.36.183
cd /var/www/glowify

# Build al
npm run build

# PM2 restart
pm2 restart glowify

# Logları kontrol et
pm2 logs glowify --lines 20
```

## Alternatif: FTP/SFTP ile Deploy

1. **FileZilla** veya **Cyberduck** ile bağlan:
   - Host: sftp://31.210.36.183
   - Username: root
   - Password: Tbt12345-
   - Port: 22

2. `/var/www/glowify/app/lib/param.ts` dosyasını güncelle

3. SSH ile:
```bash
ssh root@31.210.36.183
cd /var/www/glowify
npm run build
pm2 restart glowify
```

## Test Adımları

1. **Checkout sayfasını aç**:
   - https://31.210.36.183/checkout-new

2. **Test kartı ile ödeme yap**:
   - Kart No: 5421190122944522
   - Son Kullanma: 04/28
   - CVV: 466
   - İsim: TEST USER

3. **Sunucu loglarını kontrol et**:
```bash
ssh root@31.210.36.183
pm2 logs glowify --lines 50
```

4. **Kontrol edilecekler**:
   - ✅ Hash encoding: ISO-8859-9
   - ✅ Hash algorithm: SHA1
   - ✅ Hash değeri doğru hesaplanmış mı?
   - ✅ mdStatus değeri 5 değil, 1-4 arası mı?
   - ✅ Callback başarılı mı?

## Beklenen Sonuçlar

### Başarılı Ödeme:
```
=== HASH CALCULATION (SHA1 + ISO-8859-9) - Hosted Payment ===
Encoding: ISO-8859-9 (Turkish/Latin5) - CRITICAL!
Calculated Hash (SHA1 Base64 + ISO-8859-9): [hash_degeri]

=== CALLBACK PARAMETERS ===
mdStatus: 1 (numeric: 1) ✅
mdStatus Value: 1
Is Valid (1-4)? true ✅

✅ PAYMENT SUCCESS
```

### Hatalı Ödeme (Önceki Durum):
```
mdStatus: 5 (numeric: 5) ❌
Is Valid (1-4)? false ❌
❌ INVALID MDSTATUS - 3D Doğrulama Başarısız
```

## Sorun Çözüm

### Hala mdStatus 5 alıyorsanız:

1. **Hash'i kontrol edin**:
```bash
# Sunucu loglarında hash değerini bulun
pm2 logs glowify --lines 100 | grep -A 10 "HASH CALCULATION"
```

2. **Encoding'i doğrulayın**:
```bash
# param.ts dosyasında ISO-8859-9 olduğunu doğrulayın
cat /var/www/glowify/app/lib/param.ts | grep -A 5 "sha2b64"
```

3. **Build cache'i temizleyin**:
```bash
ssh root@31.210.36.183
cd /var/www/glowify
rm -rf .next
npm run build
pm2 restart glowify
```

## ParamPOS'a Bildirim

Eğer sorun devam ederse, PARAMPOS_EMAIL.txt dosyasını güncelleyerek:

1. **Hash encoding değişikliğini** ekleyin:
```
Hash Encoding: ISO-8859-9 (Turkish/Latin5)
Hash Algorithm: SHA1 (not SHA256)
Kaynak: ParamPOS resmi Node.js örnek kodları
```

2. **Test sonuçlarını** ekleyin:
```
Önceki durum: UTF-8 encoding → mdStatus 5 hatası
Yeni durum: ISO-8859-9 encoding → Sonuç: [test sonucu]
```

## İletişim

Hash encoding değişikliği %100 ParamPOS resmi örnek kodlarına uygun yapıldı.
Kaynak: `nodejs-client-main/src/types/utils/Hash.js` ve `OdemeService.js`

Bu değişiklikler tüm Türk POS sistemlerinde standart encoding yöntemidir.


