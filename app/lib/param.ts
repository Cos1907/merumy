/**
 * Param Sanal POS Entegrasyonu
 * nodejs-client-main/example_code örnek kodları birebir kullanılmıştır
 * Test sistemi için hazırlanmıştır
 * 
 * NOT: Bu dosya soap kütüphanesi kullanmaktadır (örnek kodlarla birebir aynı)
 */

import crypto from 'crypto'
import iconv from 'iconv-lite'
import * as soap from 'soap'

// Config - Production ortamı bilgileri
// Environment variable'lardan oku, yoksa production bilgilerini kullan
export const config = {
  URL: process.env.PARAM_URL || "https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx?wsdl",
  CLIENT_CODE: process.env.PARAM_CLIENT_CODE || "160915",
  CLIENT_USERNAME: process.env.PARAM_CLIENT_USERNAME || "TP10177898",
  CLIENT_PASSWORD: process.env.PARAM_CLIENT_PASSWORD || "2F409FEF2061F8FC",
  GUID: process.env.PARAM_GUID || "C0A6E111-408E-4BF4-9751-1A340798217A",
}

// Version - nodejs-client-main/src/configs/index.js'den birebir
export const version = "v2.0.0"

// SHA2B64 Hash fonksiyonu (Hash.js'den birebir)
// ISO-8859-9 encoding kullanılıyor
export function SHA2B64(value: string): string {
  const result = crypto
    .createHash('sha1')
    .update(iconv.encode(value, 'ISO-8859-9'))
    .digest()
    .toString('base64')
  return result
}

// Islem_Hash hesaplama (OdemeService.js'den birebir)
// Format: CLIENT_CODE + GUID + Taksit + Islem_Tutar + Toplam_Tutar + Siparis_ID
export function calculateIslemHash(params: {
  taksit: string
  islemTutar: string
  toplamTutar: string
  siparisId: string
}): string {
  const hashString = config.CLIENT_CODE + 
    config.GUID + 
    params.taksit + 
    params.islemTutar + 
    params.toplamTutar + 
    params.siparisId
  
  console.log('Hash String:', hashString)
  return SHA2B64(hashString)
}

// Sipariş ID oluştur
export function generateSiparisId(): string {
  return `SIP${Date.now()}${Math.floor(Math.random() * 1000)}`
}

// Tutar formatı: virgüllü kuruş (örn: 100,50)
export function formatAmount(amount: number): string {
  return amount.toFixed(2).replace('.', ',')
}

// Telefon formatı: başında 0 olmadan (5xxxxxxxxx)
export function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('90')) {
    cleaned = cleaned.substring(2)
  }
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }
  return cleaned
}

// SOAP Client singleton
let soapClient: any = null

// SOAP Client oluştur (OdemeService.js'den birebir)
async function createClient(): Promise<any> {
  if (!soapClient) {
    soapClient = await soap.createClientAsync(config.URL)
  }
  return soapClient
}

// Odeme fonksiyonu - TP_WMD_UCD (OdemeService.js'den birebir)
export async function Odeme(req: {
  KK_Sahibi: string
  KK_No: string
  KK_SK_Ay: string
  KK_SK_Yil: string
  KK_CVC: string
  KK_Sahibi_GSM: string
  Hata_URL: string
  Basarili_URL: string
  Siparis_ID: string
  Siparis_Aciklama: string
  Taksit: string
  Islem_Tutar: string
  Toplam_Tutar: string
  Islem_Guvenlik_Tip: '3D' | 'NS'
  Islem_ID: string
  IPAdr: string
  Ref_URL: string
  Data1?: string
  Data2?: string
  Data3?: string
  Data4?: string
  Data5?: string
}): Promise<any> {
  // Islem_Hash hesapla (OdemeService.js'deki gibi birebir)
  const islemHash = SHA2B64(
    config.CLIENT_CODE +
    config.GUID +
    req.Taksit +
    req.Islem_Tutar +
    req.Toplam_Tutar +
    req.Siparis_ID
  )

  // Request parametrelerini hazırla (OdemeService.js'deki gibi birebir)
  const requestParams = {
    ...req,
    Islem_Hash: islemHash,
    G: {
      CLIENT_CODE: config.CLIENT_CODE,
      CLIENT_USERNAME: config.CLIENT_USERNAME,
      CLIENT_PASSWORD: config.CLIENT_PASSWORD,
    },
    GUID: config.GUID,
    Islem_ID: (req.Data1 || '1') + "|SDK_NODEJS_" + version + "_TP_WMD_UCD",
  }

  console.log('=== ODEME REQUEST (soap kütüphanesi ile) ===')
  console.log('Siparis_ID:', req.Siparis_ID)
  console.log('Islem_Tutar:', req.Islem_Tutar)
  console.log('Taksit:', req.Taksit)
  console.log('Islem_Hash:', islemHash)
  console.log('Islem_ID:', requestParams.Islem_ID)

  try {
    const client = await createClient()
    const result = await client.TP_WMD_UCDAsync(requestParams)
    
    console.log('=== ODEME RESPONSE ===')
    console.log('Result:', JSON.stringify(result, null, 2))
    
    return result
  } catch (error: any) {
    console.error('SOAP Error:', error.message || error)
    throw error
  }
}

// ThreeDSTamamla fonksiyonu - TP_WMD_Pay (ThreeDSTamamlaService.js'den birebir)
export async function ThreeDSTamamla(req: {
  UCD_MD: string
  Islem_GUID: string
  Siparis_ID: string
}): Promise<any> {
  const requestParams = {
    ...req,
    G: {
      CLIENT_CODE: config.CLIENT_CODE,
      CLIENT_USERNAME: config.CLIENT_USERNAME,
      CLIENT_PASSWORD: config.CLIENT_PASSWORD,
    },
    GUID: config.GUID,
  }

  console.log('=== THREEDS TAMAMLA REQUEST ===')
  console.log('UCD_MD:', req.UCD_MD)
  console.log('Islem_GUID:', req.Islem_GUID)
  console.log('Siparis_ID:', req.Siparis_ID)

  try {
    const client = await createClient()
    const result = await client.TP_WMD_PayAsync(requestParams)
    
    console.log('=== THREEDS TAMAMLA RESPONSE ===')
    console.log('Result:', JSON.stringify(result, null, 2))
    
    return result
  } catch (error: any) {
    console.error('SOAP Error:', error.message || error)
    throw error
  }
}

// Response'dan UCD_HTML çıkar
export function extractUCDHTML(response: any): string | null {
  try {
    if (response && response[0] && response[0].TP_WMD_UCDResult) {
      return response[0].TP_WMD_UCDResult.UCD_HTML || null
    }
    return null
  } catch {
    return null
  }
}

// Response'dan Sonuc ve Sonuc_Str çıkar
export function extractResult(response: any): { Sonuc: number; Sonuc_Str: string; Islem_GUID?: string } {
  try {
    if (response && response[0] && response[0].TP_WMD_UCDResult) {
      const result = response[0].TP_WMD_UCDResult
      return {
        Sonuc: parseInt(result.Sonuc || '0', 10),
        Sonuc_Str: result.Sonuc_Str || '',
        Islem_GUID: result.Islem_GUID || '',
      }
    }
    return { Sonuc: 0, Sonuc_Str: 'Response parse error' }
  } catch {
    return { Sonuc: 0, Sonuc_Str: 'Response parse error' }
  }
}

// ThreeDSTamamla Response'dan sonuc çıkar
export function extractThreeDSResult(response: any): { Sonuc: number; Sonuc_Str: string; Dekont_ID?: string } {
  try {
    if (response && response[0] && response[0].TP_WMD_PayResult) {
      const result = response[0].TP_WMD_PayResult
      return {
        Sonuc: parseInt(result.Sonuc || '0', 10),
        Sonuc_Str: result.Sonuc_Str || '',
        Dekont_ID: result.Dekont_ID || '',
      }
    }
    return { Sonuc: 0, Sonuc_Str: 'Response parse error' }
  } catch {
    return { Sonuc: 0, Sonuc_Str: 'Response parse error' }
  }
}
