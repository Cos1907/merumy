# ParamPOS Hash Encoding Güncellemeleri

## Yapılan Kritik Değişiklikler

### 1. Hash Encoding: ISO-8859-9 (Turkish/Latin5) ✅

**PROBLEM**: Sistemde UTF-8 encoding kullanılıyordu
**ÇÖZÜM**: ParamPOS örnek kodlarına göre ISO-8859-9 encoding kullanımı

ParamPOS örnek kodlarında (nodejs-client-main/src/types/utils/Hash.js):
```javascript
SHA2B64(hash) {
  const result = crypto
    .createHash("sha1")
    .update(iconv.encode(hash, "ISO-8859-9"))
    .digest()
    .toString("base64");
  return this.hash = result;
}
```

**Güncellenen Fonksiyon**: `app/lib/param.ts -> sha2b64()`
```typescript
export function sha2b64(value: string): string {
  // ISO-8859-9 (Turkish/Latin5) encoding ile SHA1 hash
  // Türkçe karakterler için bu encoding zorunlu
  const iconv = require('iconv-lite')
  const encoded = iconv.encode(value, 'ISO-8859-9')
  
  // SHA1 hash al ve Base64'e çevir
  return crypto.createHash('sha1').update(encoded).digest('base64')
}
```

### 2. API Hash Format Düzeltmesi ✅

**PROBLEM**: API hash hesaplamasında Hata_URL ve Basarili_URL kullanılıyordu
**ÇÖZÜM**: URL parametreleri kaldırıldı (sadece Hosted Payment Page için gerekli)

ParamPOS örnek kodlarında (nodejs-client-main/src/services/OdemeService.js):
```javascript
req.Islem_Hash = Hash.SHA2B64(
  config.CLIENT_CODE +
    config.GUID +
    req.Taksit +
    req.Islem_Tutar +
    req.Toplam_Tutar +
    req.Siparis_ID
);
```

**Güncellenen Fonksiyon**: `app/lib/param.ts -> calculateWMDHash()`

**Eski Format**:
```
CLIENT_CODE + GUID + Taksit + Islem_Tutar + Toplam_Tutar + Siparis_ID + Hata_URL + Basarili_URL
```

**Yeni Format** (Doğru):
```
CLIENT_CODE + GUID + Taksit + Islem_Tutar + Toplam_Tutar + Siparis_ID
```

### 3. Hash Algoritması: SHA1 (SHA256 değil) ✅

**ÖNEMLI**: ParamPOS SHA2B64 metodunda SHA1 kullanıyor, SHA256 değil!

### 4. Hosted Payment Page Hash (Değişiklik Yok)

Hosted Payment Page için hash formatı doğru (URL'ler dahil):
```
CLIENT_CODE + GUID + Taksit + Islem_Tutar + Toplam_Tutar + Siparis_ID + Hata_URL + Basarili_URL
```

### 5. Callback Hash Verification (Değişiklik Yok)

Callback hash doğrulaması doğru (ISO-8859-9 ile):
```
islemGUID + md + mdStatus + orderId + GUID
```

## Neden Bu Değişiklikler Önemli?

### ISO-8859-9 Encoding
- **Türkçe karakterler**: ş, ğ, ü, ö, ç, ı karakterlerinin doğru hash'lenmesi
- **mdStatus 5 hatası**: Yanlış encoding nedeniyle hash uyuşmazlığı
- **Dokümantasyon**: ParamPOS resmi örnek kodlarında ISO-8859-9 kullanılıyor

### API Hash Format
- **mdStatus 5 hatası**: Yanlış hash formatı nedeniyle sunucu reddi
- **URL parametreleri**: API çağrılarında URL'ler hash'e dahil edilmemeli
- **Hosted vs API**: İki farklı hash formatı var (karıştırılmamalı)

## Kaynak Kodlar

1. **nodejs-client-main/src/types/utils/Hash.js**: Hash encoding ISO-8859-9
2. **nodejs-client-main/src/services/OdemeService.js**: API hash formatı (URL'siz)
3. **nodejs-client-main/example_code/odeme.js**: API ödeme örneği
4. **nodejs-client-main/example_code/ortak_odeme.js**: Hosted Payment Page örneği

## Test Önerileri

1. **Checkout sayfası**: https://31.210.36.183/checkout-new
2. **Test kartları**: 
   - Vakıf Bank: 5421190122944522 (04/28, CVV: 466)
   - Yapı Kredi: 4506344230780754 (10/28, CVV: 000)
3. **Loglara bakın**: Hash değerlerinin doğru hesaplandığını kontrol edin
4. **mdStatus değeri**: 1-4 arası olmalı (5 olmamalı!)

## Beklenen Sonuç

- ✅ Hash değerleri ISO-8859-9 ile doğru hesaplanacak
- ✅ API hash'i URL parametresi olmadan doğru olacak
- ✅ Türkçe karakterler doğru işlenecek
- ✅ mdStatus 5 hatası düzelecek
- ✅ ParamPOS örnek kodlarına %100 uyumlu

## Deploy Komutu

```bash
# Dosyaları sunucuya gönder
rsync -avz --delete -e "ssh" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.next' \
  ./  root@31.210.36.183:/var/www/glowify/

# Sunucuda build ve restart
ssh root@31.210.36.183 "cd /var/www/glowify && npm run build && pm2 restart glowify"
```


