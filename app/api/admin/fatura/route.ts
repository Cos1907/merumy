import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query, queryOne, execute } from '../../../lib/db'
import { randomUUID } from 'crypto'

const SESSION_COOKIE_NAME = 'admin_session'

// E-Arşiv Yapılandırması (DB'den veya env'den okunur)
async function getEarsivConfig() {
  try {
    const rows = await query<any[]>(
      "SELECT setting_key, setting_value FROM app_settings WHERE setting_key LIKE 'earsiv_%'"
    )
    const cfg: Record<string, string> = {}
    for (const row of rows) cfg[row.setting_key] = row.setting_value
    return {
      userServiceUrl: cfg['earsiv_user_service_url'] || 'https://connector.qnbesolutions.com.tr/connector/ws/userService',
      earsivServiceUrl: cfg['earsiv_service_url'] || 'https://earsiv.qnbesolutions.com.tr/earsiv/ws/EarsivWebService',
      username: cfg['earsiv_username'] || 'v.demir',
      password: cfg['earsiv_password'] || 'Merumy.2025',
      vkn: cfg['earsiv_vkn'] || '6191329041',
      erpKodu: cfg['earsiv_erp_kodu'] || 'VYN31280',
      sube: cfg['earsiv_sube'] || 'DFLT',
      kasa: cfg['earsiv_kasa'] || 'DFLT',
      tckn: '11111111111',
      kdvOrani: 20,
    }
  } catch {
    return {
      userServiceUrl: 'https://connector.qnbesolutions.com.tr/connector/ws/userService',
      earsivServiceUrl: 'https://earsiv.qnbesolutions.com.tr/earsiv/ws/EarsivWebService',
      username: 'v.demir',
      password: 'Merumy.2025',
      vkn: '6191329041',
      erpKodu: 'VYN31280',
      sube: 'DFLT',
      kasa: 'DFLT',
      tckn: '11111111111',
      kdvOrani: 20,
    }
  }
}

// Admin session ve fatura yetkisi kontrolü
async function checkFaturaPermission() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!sessionToken) return null

    const session = await queryOne<any>(
      `SELECT s.*, u.email, u.name, u.role, u.allowed_sections
       FROM admin_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    )
    if (!session) return null

    // null allowed_sections = tam yetkili admin, ya da 'fatura' içermeli
    const allowed = session.allowed_sections
      ? session.allowed_sections.split(',').map((s: string) => s.trim())
      : null

    if (allowed && !allowed.includes('fatura')) return null
    return session
  } catch {
    return null
  }
}

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatDecimal(n: number): string {
  return n.toFixed(2)
}

// Şirket sabit bilgileri
const COMPANY = {
  name: 'Merumy Güzellik ve Bakım Ürünleri Tic. A.Ş.',
  vkn: '6191329041',
  taxOffice: 'ERENKÖY',
  email: 'info@merumy.com',
  street: 'SUADİYE MAH. BAĞDAT CAD. ARK 399 NO: 399 /1 İÇ KAPI NO: 1',
  district: 'KADIKÖY',
  city: 'İSTANBUL',
  postalCode: '34740',
  country: 'Türkiye',
}

// UBL e-Arşiv Fatura XML Oluştur
function generateUBL(
  order: any,
  items: any[],
  cfg: Awaited<ReturnType<typeof getEarsivConfig>>,
  options: { faturaTuru?: 'temel' | 'ticari'; musteriVkn?: string } = {}
): string {
  const uuid = randomUUID().toUpperCase()
  const now = new Date()
  const issueDate = now.toISOString().slice(0, 10)
  const issueTime = now.toTimeString().slice(0, 8)
  const KDV = cfg.kdvOrani // %20
  const isTicari = options.faturaTuru === 'ticari'

  const grossTotal = Number(order.total)
  const shippingCost = Number(order.shipping_cost || 0)

  // Her ürün için %20 KDV ile ayrı satır
  let lines = ''
  let lineNum = 0

  for (const item of items) {
    lineNum++
    const lineGross = Number(item.totalPrice || item.total_price || (Number(item.price) * Number(item.quantity)))
    const lineNet = lineGross / (1 + KDV / 100)
    const lineKdv = lineGross - lineNet
    const unitNet = lineNet / Number(item.quantity)

    lines += `
  <cac:InvoiceLine>
    <cbc:ID>${lineNum}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">${formatDecimal(lineNet)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="TRY">${formatDecimal(lineKdv)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="TRY">${formatDecimal(lineNet)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="TRY">${formatDecimal(lineKdv)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${KDV}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:Name>KDV</cbc:Name>
            <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${escapeXml(item.name || item.product_name)}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="TRY">${formatDecimal(unitNet)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`
  }

  // Kargo bedeli varsa ayrı satır
  if (shippingCost > 0) {
    lineNum++
    const shipNet = shippingCost / (1 + KDV / 100)
    const shipKdv = shippingCost - shipNet

    lines += `
  <cac:InvoiceLine>
    <cbc:ID>${lineNum}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">${formatDecimal(shipNet)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="TRY">${formatDecimal(shipKdv)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="TRY">${formatDecimal(shipNet)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="TRY">${formatDecimal(shipKdv)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${KDV}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:Name>KDV</cbc:Name>
            <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>Kargo Bedeli</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="TRY">${formatDecimal(shipNet)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`
  }

  const netTotal = grossTotal / (1 + KDV / 100)
  const kdvTotal = grossTotal - netTotal

  // Müşteri bilgileri
  const fullName = (order.customer_name || 'Nihai Tüketici').trim()
  const nameParts = fullName.split(' ')
  const firstName = escapeXml(nameParts.slice(0, -1).join(' ') || nameParts[0] || 'Nihai')
  const lastName = escapeXml(nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Tüketici')
  const customerName = escapeXml(fullName)
  const customerAddress = escapeXml(order.shipping_address || '')
  const customerCity = escapeXml(order.shipping_city || 'İstanbul')
  const orderId = escapeXml(order.order_id || order.orderId || '')

  // Ticari fatura: VKN ile, Temel: TCKN 11111111111
  const buyerIdScheme = isTicari ? 'VKN' : 'TCKN'
  const buyerId = isTicari ? (options.musteriVkn || '11111111111') : cfg.tckn

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent/>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>EARSIVFATURA</cbc:ProfileID>
  <cbc:ID>MRY2026000000001</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>${lineNum}</cbc:LineCountNumeric>
  <cbc:Note>Gönderim Şekli: ELEKTRONIK</cbc:Note>
  <cbc:Note>Gönderim Tarihi: ${issueDate}</cbc:Note>
  <cbc:Note>Fatura Türü: ${isTicari ? 'TİCARİ' : 'TEMEL'}</cbc:Note>
  <cbc:Note>Sipariş Numarası: ${orderId}</cbc:Note>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VKN">${COMPANY.vkn}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${escapeXml(COMPANY.name)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(COMPANY.street)}</cbc:StreetName>
        <cbc:CitySubdivisionName>${escapeXml(COMPANY.district)}</cbc:CitySubdivisionName>
        <cbc:CityName>${escapeXml(COMPANY.city)}</cbc:CityName>
        <cbc:PostalZone>${COMPANY.postalCode}</cbc:PostalZone>
        <cac:Country><cbc:Name>${COMPANY.country}</cbc:Name></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${escapeXml(COMPANY.name)}</cbc:RegistrationName>
        <cbc:CompanyID schemeID="VKN">${COMPANY.vkn}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:Name>${escapeXml(COMPANY.taxOffice)}</cbc:Name>
          <cbc:TaxTypeCode>VKN</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:Contact>
        <cbc:ElectronicMail>${escapeXml(COMPANY.email)}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${buyerIdScheme}">${buyerId}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${customerName}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${customerAddress}</cbc:StreetName>
        <cbc:CitySubdivisionName>-</cbc:CitySubdivisionName>
        <cbc:CityName>${customerCity}</cbc:CityName>
        <cac:Country><cbc:Name>Türkiye</cbc:Name></cac:Country>
      </cac:PostalAddress>
      ${!isTicari ? `<cac:Person>
        <cbc:FirstName>${firstName}</cbc:FirstName>
        <cbc:FamilyName>${lastName}</cbc:FamilyName>
      </cac:Person>` : ''}
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="TRY">${formatDecimal(kdvTotal)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="TRY">${formatDecimal(netTotal)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="TRY">${formatDecimal(kdvTotal)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:Percent>${KDV}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:Name>KDV</cbc:Name>
          <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="TRY">${formatDecimal(netTotal)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="TRY">${formatDecimal(netTotal)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="TRY">${formatDecimal(grossTotal)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="TRY">${formatDecimal(grossTotal)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>${lines}
</Invoice>`
}

// e-Arşiv'e giriş yap, session cookie al
// WSDL: https://connectortest.qnbesolutions.com.tr/connector/ws/userService?xsd=1
// Doğru alan adları: userId, password, lang (namespace: http://service.csap.cs.com.tr/)
async function earsivLogin(cfg: Awaited<ReturnType<typeof getEarsivConfig>>): Promise<string | null> {
  try {
    const loginSoap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ser="http://service.csap.cs.com.tr/">
  <soapenv:Header/>
  <soapenv:Body>
    <ser:wsLogin>
      <userId>${escapeXml(cfg.username)}</userId>
      <password>${escapeXml(cfg.password)}</password>
      <lang>tr</lang>
    </ser:wsLogin>
  </soapenv:Body>
</soapenv:Envelope>`

    const resp = await fetch(cfg.userServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '',
      },
      body: loginSoap,
    })

    const setCookieHeader = resp.headers.get('set-cookie')
    console.log('eArşiv login status:', resp.status)
    console.log('eArşiv set-cookie:', setCookieHeader)

    if (setCookieHeader) {
      // PROD: PROD_CSAPSESSIONID, TEST: CSAPSESSIONID veya JSESSIONID
      const cookieMatch = setCookieHeader.match(/(?:PROD_CSAPSESSIONID|CSAPSESSIONID|JSESSIONID|jsessionid)=[^;]+/i)
      if (cookieMatch) return cookieMatch[0]
      const firstCookie = setCookieHeader.split(';')[0]
      if (firstCookie) return firstCookie
    }

    const respText = await resp.text()
    console.log('eArşiv login response:', respText.substring(0, 400))

    // Login başarılıysa fakat cookie yoksa (bazı servisler cookie dönmez)
    if (resp.status === 200 && !respText.includes('Fault')) {
      return 'no-session-required'
    }
    return null
  } catch (e) {
    console.error('eArşiv login error:', e)
    return null
  }
}

// Fatura oluştur
// faturason.md'ye göre: <input> içinde JSON formatı kullanılır,
// <fatura> ayrı element olarak belgeFormati ve belgeIcerigi içerir
async function createEarsivInvoice(
  sessionCookie: string,
  ubl: string,
  cfg: Awaited<ReturnType<typeof getEarsivConfig>>
): Promise<{ uuid?: string; faturaNo?: string; faturaUrl?: string; error?: string }> {
  try {
    const ublBase64 = Buffer.from(ubl, 'utf-8').toString('base64')
    const islemId = randomUUID()

    // input alanı JSON string olarak gönderilir (faturason.md örneğine göre)
    // NOT: erpKodu prodüksiyon ortamında kayıtlı olmayabilir; cookie session yeterli
    const inputJson = JSON.stringify({
      islemId: islemId,
      vkn: cfg.vkn,
      sube: cfg.sube,
      kasa: cfg.kasa,
      donenBelgeFormati: 2, // HTML formatında dönsün (önizleme için)
      numaraVerilsinMi: 1,
      taslagaYonlendir: 0,
    })

    const invoiceSoap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ser="http://service.earsiv.uut.cs.com.tr/">
  <soapenv:Header/>
  <soapenv:Body>
    <ser:faturaOlusturExt>
      <input>${inputJson}</input>
      <fatura>
        <belgeFormati>UBL</belgeFormati>
        <belgeIcerigi>${ublBase64}</belgeIcerigi>
      </fatura>
    </ser:faturaOlusturExt>
  </soapenv:Body>
</soapenv:Envelope>`

    const cookieHeader = sessionCookie === 'no-session-required' ? '' : sessionCookie
    console.log('eArşiv invoice SOAP (ilk 500 karakter):', invoiceSoap.substring(0, 500))

    const resp = await fetch(cfg.earsivServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '',
        ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
      },
      body: invoiceSoap,
    })

    const responseText = await resp.text()
    console.log('eArşiv faturaOlusturExt response:', responseText.substring(0, 800))

    // Result code kontrolü
    const resultCodeMatch = responseText.match(/<resultCode>(.*?)<\/resultCode>/)
    const resultCode = resultCodeMatch?.[1] || ''

    if (resultCode !== 'AE00000') {
      const resultTextMatch = responseText.match(/<resultText>([\s\S]*?)<\/resultText>/)
      return { error: resultTextMatch?.[1]?.trim() || `Hata kodu: ${resultCode || 'Bilinmiyor'}` }
    }

    // Fatura bilgilerini çıkar
    const faturaUrlMatch = responseText.match(/<key[^>]*>faturaURL<\/key>\s*<value[^>]*>([\s\S]*?)<\/value>/)
    const uuidMatch = responseText.match(/<key[^>]*>uuid<\/key>\s*<value[^>]*>([\s\S]*?)<\/value>/)
    const faturaNoMatch = responseText.match(/<key[^>]*>faturaNo<\/key>\s*<value[^>]*>([\s\S]*?)<\/value>/)

    return {
      faturaUrl: faturaUrlMatch?.[1]?.trim() || '',
      uuid: uuidMatch?.[1]?.trim() || islemId,
      faturaNo: faturaNoMatch?.[1]?.trim() || '',
    }
  } catch (e: any) {
    console.error('eArşiv invoice creation error:', e)
    return { error: e.message || 'Bağlantı hatası' }
  }
}

// GET - Fatura kesilecek siparişleri listele
export async function GET(request: NextRequest) {
  try {
    const session = await checkFaturaPermission()
    if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const faturaFilter = searchParams.get('fatura') || 'all'
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const offset = (page - 1) * limit

    let conditions = ['1=1']
    let params: any[] = []

    if (search) {
      conditions.push('(order_id LIKE ? OR customer_name LIKE ? OR customer_email LIKE ?)')
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (dateFrom) {
      conditions.push('DATE(created_at) >= ?')
      params.push(dateFrom)
    }

    if (dateTo) {
      conditions.push('DATE(created_at) <= ?')
      params.push(dateTo)
    }

    if (faturaFilter === 'kesildi') {
      conditions.push("fatura_durum = 'kesildi'")
    } else if (faturaFilter === 'bekliyor') {
      conditions.push("(fatura_durum IS NULL OR fatura_durum != 'kesildi')")
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ')

    const [countResult] = await query<any[]>(
      `SELECT COUNT(*) as total FROM orders ${whereClause}`,
      params
    )
    const total = countResult?.total || 0

    const orders = await query<any[]>(`
      SELECT
        id, order_id as orderId, customer_name as customerName,
        customer_email as customerEmail, customer_phone as customerPhone,
        shipping_address as address, shipping_city as city,
        subtotal, shipping_cost as shipping, discount_amount as discount,
        total, status, payment_status as paymentStatus,
        fatura_uuid as faturaUuid, fatura_no as faturaNo,
        fatura_url as faturaUrl, fatura_tarihi as faturaTarihi,
        fatura_durum as faturaDurum, created_at as createdAt
      FROM orders
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `, params)

    for (const order of orders) {
      const items = await query<any[]>(
        `SELECT product_name as name, quantity, unit_price as price, total_price as totalPrice
         FROM order_items WHERE order_id = ?`,
        [order.id]
      )
      order.items = items
    }

    return NextResponse.json({ orders, total, page, limit })
  } catch (err: any) {
    console.error('Fatura GET error:', err)
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 })
  }
}

// POST - Seçilen sipariş için e-Arşiv fatura kes VEYA settings güncelle
export async function POST(request: NextRequest) {
  try {
    const session = await checkFaturaPermission()
    if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

    const body = await request.json()

    // --- Settings kaydet ---
    if (body.action === 'save-settings') {
      const { username, password, vkn, erpKodu, userServiceUrl, earsivServiceUrl } = body
      const settings = [
        ['earsiv_username', username],
        ['earsiv_password', password],
        ['earsiv_vkn', vkn],
        ['earsiv_erp_kodu', erpKodu],
        ['earsiv_user_service_url', userServiceUrl],
        ['earsiv_service_url', earsivServiceUrl],
      ]
      for (const [k, v] of settings) {
        if (v !== undefined && v !== null) {
          await execute(
            `INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
            [k, v]
          )
        }
      }
      return NextResponse.json({ success: true, message: 'Ayarlar kaydedildi' })
    }

    // --- Toplu fatura kes ---
    if (body.action === 'bulk-fatura') {
      const { orderIds, faturaTuru, musteriVkn } = body
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return NextResponse.json({ error: 'Sipariş listesi gerekli' }, { status: 400 })
      }
      const cfg = await getEarsivConfig()
      const results: any[] = []
      for (const oid of orderIds) {
        try {
          const ord = await queryOne<any>(`SELECT * FROM orders WHERE order_id = ?`, [oid])
          if (!ord || ord.fatura_durum === 'kesildi') {
            results.push({ orderId: oid, skip: true, reason: ord ? 'Zaten kesildi' : 'Bulunamadı' })
            continue
          }
          const itms = await query<any[]>(
            `SELECT product_name as name, quantity, unit_price as price, total_price as totalPrice FROM order_items WHERE order_id = ?`,
            [ord.id]
          )
          await execute(`UPDATE orders SET fatura_durum = 'bekleniyor' WHERE order_id = ?`, [oid])
          const ublXml = generateUBL(ord, itms, cfg, { faturaTuru: faturaTuru || 'temel', musteriVkn })
          const sessionCookie = await earsivLogin(cfg)
          if (!sessionCookie) { results.push({ orderId: oid, error: 'e-Arşiv bağlantı hatası' }); continue }
          const result = await createEarsivInvoice(sessionCookie, ublXml, cfg)
          if (result.error) {
            await execute(`UPDATE orders SET fatura_durum = 'hata' WHERE order_id = ?`, [oid])
            results.push({ orderId: oid, error: result.error })
          } else {
            await execute(
              `UPDATE orders SET fatura_uuid = ?, fatura_no = ?, fatura_url = ?, fatura_tarihi = NOW(), fatura_durum = 'kesildi' WHERE order_id = ?`,
              [result.uuid, result.faturaNo, result.faturaUrl, oid]
            )
            results.push({ orderId: oid, success: true, faturaNo: result.faturaNo, faturaUrl: result.faturaUrl })
          }
        } catch (e: any) { results.push({ orderId: oid, error: e.message }) }
      }
      return NextResponse.json({ success: true, results })
    }

    // --- Tekil fatura kes ---
    const { orderId, faturaTuru, musteriVkn } = body
    if (!orderId) return NextResponse.json({ error: 'Sipariş ID gerekli' }, { status: 400 })

    const order = await queryOne<any>(`SELECT * FROM orders WHERE order_id = ?`, [orderId])
    if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })

    if (order.fatura_durum === 'kesildi') {
      return NextResponse.json({
        error: 'Bu sipariş için zaten fatura kesilmiş',
        faturaNo: order.fatura_no,
        faturaUrl: order.fatura_url,
      }, { status: 409 })
    }

    const items = await query<any[]>(
      `SELECT product_name as name, quantity, unit_price as price, total_price as totalPrice
       FROM order_items WHERE order_id = ?`,
      [order.id]
    )

    await execute(`UPDATE orders SET fatura_durum = 'bekleniyor' WHERE order_id = ?`, [orderId])

    const cfg = await getEarsivConfig()
    const ublXml = generateUBL(order, items, cfg, { faturaTuru: faturaTuru || 'temel', musteriVkn })

    const sessionCookie = await earsivLogin(cfg)
    if (!sessionCookie) {
      await execute(`UPDATE orders SET fatura_durum = 'hata' WHERE order_id = ?`, [orderId])
      return NextResponse.json({
        error: 'e-Arşiv sistemine bağlanılamadı. Lütfen e-Arşiv kullanıcı adı ve şifresini kontrol edin.',
      }, { status: 500 })
    }

    const result = await createEarsivInvoice(sessionCookie, ublXml, cfg)

    if (result.error) {
      await execute(`UPDATE orders SET fatura_durum = 'hata' WHERE order_id = ?`, [orderId])
      return NextResponse.json({ error: `e-Arşiv hatası: ${result.error}` }, { status: 500 })
    }

    await execute(
      `UPDATE orders SET fatura_uuid = ?, fatura_no = ?, fatura_url = ?,
       fatura_tarihi = NOW(), fatura_durum = 'kesildi' WHERE order_id = ?`,
      [result.uuid, result.faturaNo, result.faturaUrl, orderId]
    )

    return NextResponse.json({
      success: true,
      faturaNo: result.faturaNo,
      faturaUrl: result.faturaUrl,
      faturaUuid: result.uuid,
    })
  } catch (err: any) {
    console.error('Fatura POST error:', err)
    return NextResponse.json({ error: 'Sunucu hatası: ' + err.message }, { status: 500 })
  }
}

// PATCH - e-Arşiv ayarlarını getir
export async function PATCH(request: NextRequest) {
  try {
    const session = await checkFaturaPermission()
    if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    const cfg = await getEarsivConfig()
    // Şifreyi maskele
    return NextResponse.json({
      username: cfg.username,
      password: cfg.password ? '***' : '',
      vkn: cfg.vkn,
      erpKodu: cfg.erpKodu,
      userServiceUrl: cfg.userServiceUrl,
      earsivServiceUrl: cfg.earsivServiceUrl,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

