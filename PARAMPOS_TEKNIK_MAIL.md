# ParamPOS Entegrasyonu - Teknik Detay Raporu

**Gönderen:** [Firma Adınız]  
**Tarih:** 31 Ocak 2026  
**Konu:** ParamPOS Hosted Payment Page Entegrasyonu - Teknik Detaylar ve mdStatus 5 Hatası

---

## 1. GENEL BİLGİLER

**Üye İşyeri Bilgileri:**
- CLIENT_CODE: 160915
- CLIENT_USERNAME: TP10177898
- GUID (Anahtar): C0A6E111-408E-4BF4-9751-1A340798217A
- Sunucu IP Adresi: 31.210.36.183
- Sunucu Port: 3000

**Entegrasyon Tipi:** Hosted Payment Page (Ortak Ödeme Sayfası)  
**API Endpoint:** https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx  
**Ödeme Sayfası URL:** https://pos.param.com.tr/Tahsilat/Default.aspx

---

## 2. HASH HESAPLAMA SİSTEMİ

### 2.1. Islem_Hash Hesaplama (Hosted Payment Page)

**Kullanılan Algoritma:** SHA256 + Base64 Encoding  
**Encoding:** UTF-8

**Hash String Oluşturma Sırası:**
```
CLIENT_CODE + GUID + Taksit + Islem_Tutar + Toplam_Tutar + Siparis_ID + Hata_URL + Basarili_URL
```

**Örnek Hesaplama:**
```
CLIENT_CODE: 160915
GUID (lowercase): c0a6e111-408e-4bf4-9751-1a340798217a
Taksit: 1
Islem_Tutar: 720,00
Toplam_Tutar: 720,00
Siparis_ID: MRM17698467958945590
Hata_URL: http://31.210.36.183/api/payment/callback/fail
Basarili_URL: http://31.210.36.183/api/payment/callback/success

Hash String: 160915c0a6e111-408e-4bf4-9751-1a340798217a1720,00720,00MRM17698467958945590http://31.210.36.183/api/payment/callback/failhttp://31.210.36.183/api/payment/callback/success

SHA256 Hash (Base64): g1VKPP5d0xpguKqSQdgJRMKdKuzWTAdk/CuF9mcoO3o=
```

**Önemli Notlar:**
- GUID değeri küçük harfe çevrilerek kullanılmaktadır
- Taksit değeri sadece sayısal olarak gönderilmektedir (1, 2, 3, ...)
- Tutarlar virgüllü kuruş formatında gönderilmektedir (örn: 720,00)
- URL'lerden query parametreleri temizlenerek hash'e dahil edilmektedir
- CLIENT_PASSWORD hash hesaplamasına dahil edilmemektedir

### 2.2. Callback Hash Doğrulama

**Kullanılan Algoritma:** SHA1 + Base64 Encoding  
**Encoding:** UTF-8

**Hash String Oluşturma Sırası:**
```
islemGUID + md + mdStatus + orderId + GUID
```

**Örnek:**
```
islemGUID: [ParamPOS'tan gelen]
md: [ParamPOS'tan gelen]
mdStatus: [ParamPOS'tan gelen]
orderId: MRM17698467958945590
GUID (lowercase): c0a6e111-408e-4bf4-9751-1a340798217a
```

---

## 3. İSTEK GÖNDERME SİSTEMİ

### 3.1. Hosted Payment Page Form Gönderimi

**HTTP Method:** POST  
**Content-Type:** application/x-www-form-urlencoded  
**Action URL:** https://pos.param.com.tr/Tahsilat/Default.aspx

**Gönderilen Form Parametreleri:**
```
CLIENT_CODE: 160915
GUID: c0a6e111-408e-4bf4-9751-1a340798217a
Siparis_ID: MRM17698467958945590
Siparis_Aciklama: Test Odeme
Taksit: 1
Islem_Tutar: 720,00
Toplam_Tutar: 720,00
Hata_URL: http://31.210.36.183/api/payment/callback/fail
Basarili_URL: http://31.210.36.183/api/payment/callback/success
Islem_Hash: g1VKPP5d0xpguKqSQdgJRMKdKuzWTAdk/CuF9mcoO3o=
Islem_Guvenlik_Tip: 3D
KK_Sahibi: Test Kart Sahibi
KK_Sahibi_GSM: 5555555555
IPAdr: 31.210.36.183
```

**Önemli Notlar:**
- CLIENT_USERNAME ve CLIENT_PASSWORD formda gönderilmemektedir (sadece SOAP API çağrılarında kullanılmaktadır)
- KK_Sahibi_GSM başında 0 olmadan 10 haneli formatında gönderilmektedir (5xxxxxxxxx)
- IPAdr sunucu IP adresi olarak gönderilmektedir

### 3.2. SOAP API İstekleri

**Taksit Listesi Çekme (TP_Ozel_Oran_SK_Liste):**

**Endpoint:** https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx  
**SOAPAction:** https://turkpos.com.tr/TP_Ozel_Oran_SK_Liste  
**Content-Type:** text/xml; charset=utf-8

**SOAP Request Örneği:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TP_Ozel_Oran_SK_Liste xmlns="https://turkpos.com.tr/">
      <G>
        <CLIENT_CODE>160915</CLIENT_CODE>
        <CLIENT_USERNAME>TP10177898</CLIENT_USERNAME>
        <CLIENT_PASSWORD>2F409FEF2061F8FC</CLIENT_PASSWORD>
      </G>
      <GUID>c0a6e111-408e-4bf4-9751-1a340798217a</GUID>
      <BIN_No>535177</BIN_No>
      <Tutar>720,00</Tutar>
    </TP_Ozel_Oran_SK_Liste>
  </soap:Body>
</soap:Envelope>
```

---

## 4. CALLBACK YÖNETİMİ

### 4.1. Callback URL'leri

**Başarılı Ödeme Callback:**
- URL: http://31.210.36.183/api/payment/callback/success
- Method: POST (form-data)

**Başarısız Ödeme Callback:**
- URL: http://31.210.36.183/api/payment/callback/fail
- Method: POST (form-data)

### 4.2. Callback Parametreleri

Callback'te beklenen parametreler:
- `mdStatus`: 3D Secure doğrulama durumu (1-4: başarılı, 0,5,6,7,8: başarısız)
- `md`: 3D doğrulama verisi
- `islemGUID`: İşlem GUID'i
- `islemHash`: Hash doğrulama değeri
- `Siparis_ID`: Sipariş ID
- `TURKPOS_RETVAL_Sonuc`: İşlem sonucu
- `TURKPOS_RETVAL_Sonuc_Str`: İşlem sonucu açıklaması
- `TURKPOS_RETVAL_Dekont_ID`: Dekont numarası
- `TURKPOS_RETVAL_Tahsilat_Tutari`: Tahsil edilen tutar
- `Banka_Sonuc_Kod`: Banka sonuç kodu
- `Banka_Sonuc_Mesaj`: Banka sonuç mesajı

### 4.3. mdStatus Kontrolü

Sistemimizde mdStatus değerine göre şu kontroller yapılmaktadır:

**Geçerli mdStatus Değerleri (1-4):**
- 3D Secure doğrulama başarılı
- TP_WMD_Pay metodu çağrılabilir
- Ödeme işlemi devam edebilir

**Geçersiz mdStatus Değerleri (0, 5, 6, 7, 8):**
- 3D Secure doğrulama başarısız
- TP_WMD_Pay metodu çağrılmamalı
- İşlem başarısız olarak işaretlenir

---

## 5. MEVCUT SORUN: mdStatus 5 HATASI

### 5.1. Sorun Tanımı

Ödeme işlemleri sırasında callback'te `mdStatus: 5` değeri gelmekte ve sistem "Geçerli doğrulama yok veya sistem hatası" mesajı vermektedir.

### 5.2. Teknik Detaylar

**Hata Mesajı:**
```
mdStatus: 5
Hata: Geçerli doğrulama yok veya sistem hatası (mdStatus: 5)
```

**Sistem Davranışı:**
- mdStatus 5 geldiğinde TP_WMD_Pay metodu çağrılmamaktadır (dokümantasyona uygun)
- Kullanıcı başarısız ödeme sayfasına yönlendirilmektedir
- Hash doğrulaması yapılmaktadır (eğer parametreler mevcut ise)

### 5.3. Kontrol Edilmesi Gerekenler

1. **Sunucu IP Yetkilendirmesi:**
   - Sunucu IP adresi (31.210.36.183) ParamPOS sisteminde tanımlı mı?
   - IP whitelist kontrolü yapıldı mı?

2. **Hash Hesaplama:**
   - Hash hesaplama yöntemimiz doğru mu?
   - ParamPOS tarafında hash doğrulaması başarılı oluyor mu?

3. **Form Parametreleri:**
   - Gönderilen form parametreleri eksiksiz mi?
   - Parametre formatları doğru mu?

4. **3D Secure İşlemi:**
   - 3D Secure doğrulama süreci tamamlanıyor mu?
   - Banka tarafından doğrulama başarılı oluyor mu?

### 5.4. İstenen Bilgiler

1. **mdStatus 5 Hatasının Nedeni:**
   - Bu hata hangi durumlarda oluşmaktadır?
   - Hash doğrulaması başarısız mı?
   - IP yetkilendirme sorunu mu var?
   - 3D Secure doğrulama sürecinde bir sorun mu var?

2. **Sonuc_Str Mesajı:**
   - mdStatus 5 geldiğinde Sonuc_Str parametresinde ne yazıyor?
   - Detaylı hata mesajı alabilir miyiz?

3. **Banka_Sonuc_Kod:**
   - Banka tarafından dönen hata kodu nedir?
   - Banka_Sonuc_Mesaj içeriği nedir?

4. **Log Kayıtları:**
   - ParamPOS sisteminde bu işlemler için log kayıtları mevcut mu?
   - Log kayıtlarında hangi hata görülüyor?

---

## 6. TEST BİLGİLERİ

**Test Sipariş ID:** MRM17698467958945590  
**Test Tutar:** 720,00 TL  
**Test Taksit:** 1 (Tek Çekim)  
**Test Kart Bilgileri:** [Test kartı kullanılmıştır]

**Test Sonuçları:**
- Form gönderimi: ✅ Başarılı
- ParamPOS ödeme sayfasına yönlendirme: ✅ Başarılı
- 3D Secure sayfasına yönlendirme: ✅ Başarılı
- Callback alma: ⚠️ mdStatus 5 hatası

---

## 7. SİSTEM MİMARİSİ

**Teknoloji Stack:**
- Framework: Next.js 14.0.4
- Runtime: Node.js
- Deployment: PM2 Process Manager
- Web Server: Nginx (Reverse Proxy)

**Güvenlik:**
- Tüm iletişim HTTPS üzerinden yapılmaktadır
- Hash doğrulaması her callback'te yapılmaktadır
- mdStatus kontrolü yapılmaktadır
- Tutar formatı kontrolü yapılmaktadır

---

## 8. İLETİŞİM BİLGİLERİ

**Teknik Destek İçin:**
- E-posta: [E-posta adresiniz]
- Telefon: [Telefon numaranız]
- Sunucu IP: 31.210.36.183

**Test URL'leri:**
- Checkout Sayfası: http://31.210.36.183/checkout-new
- Success Callback: http://31.210.36.183/api/payment/callback/success
- Fail Callback: http://31.210.36.183/api/payment/callback/fail

---

## 9. SONUÇ VE TALEP

Sistemimiz ParamPOS dokümantasyonuna uygun şekilde entegre edilmiştir. Hash hesaplama, form gönderimi ve callback yönetimi dokümantasyondaki spesifikasyonlara göre yapılmaktadır.

Ancak ödeme işlemleri sırasında `mdStatus: 5` hatası alınmaktadır. Bu hatanın nedenini ve çözümünü öğrenmek için teknik destek ekibinizden yardım talep ediyoruz.

**Özellikle şu konularda bilgi gerekmektedir:**
1. mdStatus 5 hatasının detaylı nedeni
2. Hash doğrulamasının başarılı olup olmadığı
3. Sunucu IP yetkilendirmesinin tamamlanıp tamamlanmadığı
4. Sonuc_Str ve Banka_Sonuc_Kod değerleri

İlginiz için teşekkür ederiz.

Saygılarımızla,  
[Firma Adınız]  
[İletişim Bilgileriniz]

---

**Ekler:**
- Hash hesaplama kod örneği
- SOAP request örneği
- Callback işleme kod örneği


