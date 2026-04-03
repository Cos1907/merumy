import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { queryOne, query, execute } from '../../../lib/db'

const KDV_RATE = 20 // 20% KDV

// ─── Auth ────────────────────────────────────────────────────────────────────
async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value
    if (!sessionToken) return false
    const session = await queryOne<any>(
      'SELECT id FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    )
    return !!session
  } catch {
    return false
  }
}

// ─── Settings helpers ────────────────────────────────────────────────────────
async function getEarsivSettings() {
  const rows = await query<any[]>(
    "SELECT setting_key, setting_value FROM app_settings WHERE setting_key LIKE 'earsiv_%'",
    []
  )
  const map: Record<string, string> = {}
  for (const r of rows) map[r.setting_key] = r.setting_value || ''
  return {
    username: map['earsiv_username'] || '',
    password: map['earsiv_password'] || '',
    vkn: map['earsiv_vkn'] || '',
    erpKodu: map['earsiv_erp_kodu'] || '',
    userServiceUrl: map['earsiv_user_service_url'] || '',
    earsivServiceUrl: map['earsiv_service_url'] || '',
  }
}

// ─── UUID / Number helpers ───────────────────────────────────────────────────
function generateUUID(): string {
  return crypto.randomUUID()
}

function generateFaturaNo(): string {
  const now = new Date()
  const year = now.getFullYear()
  const ms = String(Date.now()).slice(-8)
  return `ARŞ${year}${ms}`
}

// ─── SOAP helpers (raw HTTP) ─────────────────────────────────────────────────
async function soapPost(url: string, soapAction: string, body: string): Promise<string> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': soapAction,
    },
    body,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SOAP error ${res.status}: ${text.slice(0, 300)}`)
  }
  return res.text()
}

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<[^>]*:?${tag}[^>]*>([^<]*)<`, 'i'))
    || xml.match(new RegExp(`<${tag}>([^<]*)<`, 'i'))
  return m ? m[1].trim() : ''
}

// Login to QNB eSolutions userService, returns session token
async function loginEarsiv(settings: ReturnType<typeof getEarsivSettings> extends Promise<infer T> ? T : never): Promise<string> {
  const { username, password, erpKodu, userServiceUrl } = settings
  if (!userServiceUrl) throw new Error('User Service URL tanımlı değil')

  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ser="http://service.user.ws.connector.qnbesolutions.com.tr/">
  <soapenv:Body>
    <ser:login>
      <ser:userId>${escXml(username)}</ser:userId>
      <ser:password>${escXml(password)}</ser:password>
      <ser:erpCode>${escXml(erpKodu)}</ser:erpCode>
    </ser:login>
  </soapenv:Body>
</soapenv:Envelope>`

  const resp = await soapPost(userServiceUrl, '"login"', envelope)
  const token = extractTag(resp, 'return')
  if (!token) {
    const fault = extractTag(resp, 'faultstring')
    throw new Error(`Login hatası: ${fault || resp.slice(0, 200)}`)
  }
  return token
}

// Create e-Arşiv invoice, returns { uuid, documentNo }
async function createEarsivInvoiceSOAP(
  earsivServiceUrl: string,
  sessionId: string,
  invoiceXml: string,
): Promise<{ uuid: string; documentNo: string }> {
  if (!earsivServiceUrl) throw new Error('e-Arşiv Service URL tanımlı değil')
  const xmlB64 = Buffer.from(invoiceXml, 'utf8').toString('base64')

  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ear="http://service.earsiv.ws.qnbesolutions.com.tr/">
  <soapenv:Body>
    <ear:createEarsivInvoice>
      <ear:sessionId>${escXml(sessionId)}</ear:sessionId>
      <ear:earsivInvoiceXML>${xmlB64}</ear:earsivInvoiceXML>
      <ear:deleteOldInvoiceFlag>N</ear:deleteOldInvoiceFlag>
    </ear:createEarsivInvoice>
  </soapenv:Body>
</soapenv:Envelope>`

  const resp = await soapPost(earsivServiceUrl, '"createEarsivInvoice"', envelope)
  const uuid = extractTag(resp, 'invUUID') || extractTag(resp, 'uuid')
  const documentNo = extractTag(resp, 'documentNo') || extractTag(resp, 'faturaNo') || extractTag(resp, 'invoiceNumber')
  if (!uuid && !documentNo) {
    const fault = extractTag(resp, 'faultstring') || extractTag(resp, 'errorMessage')
    throw new Error(`Fatura oluşturma hatası: ${fault || resp.slice(0, 300)}`)
  }
  return { uuid, documentNo }
}

// Get PDF URL for a created invoice
async function getPDFUrlSOAP(
  earsivServiceUrl: string,
  sessionId: string,
  uuid: string,
): Promise<string> {
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ear="http://service.earsiv.ws.qnbesolutions.com.tr/">
  <soapenv:Body>
    <ear:getPDFURL>
      <ear:sessionId>${escXml(sessionId)}</ear:sessionId>
      <ear:uuid>${escXml(uuid)}</ear:uuid>
    </ear:getPDFURL>
  </soapenv:Body>
</soapenv:Envelope>`

  try {
    const resp = await soapPost(earsivServiceUrl, '"getPDFURL"', envelope)
    return extractTag(resp, 'return') || extractTag(resp, 'pdfUrl') || ''
  } catch {
    return ''
  }
}

// ─── XML escape ──────────────────────────────────────────────────────────────
function escXml(s: string): string {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function fmt2(n: number): string {
  return n.toFixed(2)
}

// ─── Build UBL-TR e-Arşiv Invoice XML ───────────────────────────────────────
function buildUBLInvoiceXML(
  order: any,
  settings: { vkn: string },
  uuid: string,
  faturaNo: string,
  faturaTuru: 'temel' | 'ticari',
  musteriVkn?: string,
): string {
  const now = new Date()
  const issueDate = now.toISOString().slice(0, 10) // YYYY-MM-DD
  const issueTime = now.toISOString().slice(11, 19) // HH:MM:SS

  // Calculate totals — prices in DB are KDV-inclusive
  const items: any[] = order.items || []

  // Build line items
  const lines = items.map((item: any, idx: number) => {
    const lineTotal = Number(item.price) * Number(item.quantity) // KDV-inclusive
    const taxable = lineTotal / (1 + KDV_RATE / 100)
    const vatAmount = lineTotal - taxable
    const unitPriceExcl = taxable / Number(item.quantity)

    return `
  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">${fmt2(taxable)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="TRY">${fmt2(vatAmount)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="TRY">${fmt2(taxable)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="TRY">${fmt2(vatAmount)}</cbc:TaxAmount>
        <cbc:Percent>${KDV_RATE}</cbc:Percent>
        <cac:TaxCategory>
          <cac:TaxScheme>
            <cbc:Name>KDV</cbc:Name>
            <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${escXml(item.name)}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="TRY">${fmt2(unitPriceExcl)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`
  })

  // Add shipping as a line if > 0
  const shippingCost = Number(order.shipping || order.shippingCost || 0)
  if (shippingCost > 0) {
    const taxable = shippingCost / (1 + KDV_RATE / 100)
    const vatAmount = shippingCost - taxable
    lines.push(`
  <cac:InvoiceLine>
    <cbc:ID>${lines.length + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">1</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="TRY">${fmt2(taxable)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="TRY">${fmt2(vatAmount)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="TRY">${fmt2(taxable)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="TRY">${fmt2(vatAmount)}</cbc:TaxAmount>
        <cbc:Percent>${KDV_RATE}</cbc:Percent>
        <cac:TaxCategory>
          <cac:TaxScheme>
            <cbc:Name>KDV</cbc:Name>
            <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>Kargo Ücreti</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="TRY">${fmt2(taxable)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`)
  }

  // Totals
  const totalIncl = Number(order.total)
  const totalExcl = totalIncl / (1 + KDV_RATE / 100)
  const totalVat = totalIncl - totalExcl
  const lineCount = lines.length

  // Buyer party
  const buyerSchemeId = faturaTuru === 'ticari' ? 'VKN' : 'TCKN'
  const buyerIdValue = faturaTuru === 'ticari' && musteriVkn ? musteriVkn : '11111111111'

  // Seller VKN
  const sellerVkn = settings.vkn || '0000000000'

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
         xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
         xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent/>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>EARSIVFATURA</cbc:ProfileID>
  <cbc:ID>${escXml(faturaNo)}</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:UUID>${escXml(uuid)}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>${lineCount}</cbc:LineCountNumeric>
  <cac:OrderReference>
    <cbc:ID>${escXml(order.orderId)}</cbc:ID>
  </cac:OrderReference>
  <cac:Delivery>
    <cac:DeliveryAddress>
      <cbc:StreetName>${escXml(order.shippingAddress || order.address || '')}</cbc:StreetName>
      <cbc:CitySubdivisionName>${escXml(order.shippingDistrict || '')}</cbc:CitySubdivisionName>
      <cbc:CityName>${escXml(order.city || order.shippingCity || 'TÜRKİYE')}</cbc:CityName>
      <cbc:Country>
        <cbc:Name>TÜRKİYE</cbc:Name>
      </cbc:Country>
    </cac:DeliveryAddress>
  </cac:Delivery>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>48</cbc:PaymentMeansCode>
  </cac:PaymentMeans>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:WebsiteURI>https://merumy.com</cbc:WebsiteURI>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VKN">${escXml(sellerVkn)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>MERUMY</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>Merumy Online Mağaza</cbc:StreetName>
        <cbc:CityName>İSTANBUL</cbc:CityName>
        <cbc:Country>
          <cbc:Name>TÜRKİYE</cbc:Name>
        </cbc:Country>
      </cac:PostalAddress>
      <cac:Contact>
        <cbc:ElectronicMail>info@merumy.com</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${buyerSchemeId}">${escXml(buyerIdValue)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${escXml(order.customerName)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escXml(order.shippingAddress || order.address || '')}</cbc:StreetName>
        <cbc:CitySubdivisionName>${escXml(order.shippingDistrict || '')}</cbc:CitySubdivisionName>
        <cbc:CityName>${escXml(order.city || order.shippingCity || '')}</cbc:CityName>
        <cbc:Country>
          <cbc:Name>TÜRKİYE</cbc:Name>
        </cbc:Country>
      </cac:PostalAddress>
      <cac:Contact>
        <cbc:Telephone>${escXml(order.customerPhone || '')}</cbc:Telephone>
        <cbc:ElectronicMail>${escXml(order.customerEmail || '')}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="TRY">${fmt2(totalVat)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="TRY">${fmt2(totalExcl)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="TRY">${fmt2(totalVat)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:Percent>${KDV_RATE}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:Name>KDV</cbc:Name>
          <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="TRY">${fmt2(totalExcl)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="TRY">${fmt2(totalExcl)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="TRY">${fmt2(totalIncl)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="TRY">0.00</cbc:AllowanceTotalAmount>
    <cbc:PayableAmount currencyID="TRY">${fmt2(totalIncl)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
${lines.join('')}
</Invoice>`

  return xml
}

// ─── Fetch order with items from DB ─────────────────────────────────────────
async function fetchOrderWithItems(orderId: string): Promise<any | null> {
  const order = await queryOne<any>(
    `SELECT o.id, o.order_id, o.customer_name, o.customer_email, o.customer_phone,
            o.shipping_address, o.shipping_city, o.shipping_district,
            o.subtotal, o.shipping_cost, o.discount_amount, o.total,
            o.fatura_uuid, o.fatura_no, o.fatura_url, o.fatura_tarihi, o.fatura_durum
     FROM orders o WHERE o.order_id = ?`,
    [orderId]
  )
  if (!order) return null

  const items = await query<any[]>(
    `SELECT product_name, quantity, unit_price, total_price FROM order_items WHERE order_id = ?`,
    [order.id]
  )

  return {
    id: order.id,
    orderId: order.order_id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    shippingAddress: order.shipping_address,
    city: order.shipping_city,
    shippingCity: order.shipping_city,
    shippingDistrict: order.shipping_district,
    address: [order.shipping_address, order.shipping_city, order.shipping_district].filter(Boolean).join(', '),
    shipping: Number(order.shipping_cost || 0),
    shippingCost: Number(order.shipping_cost || 0),
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    faturaUuid: order.fatura_uuid,
    faturaNo: order.fatura_no,
    faturaUrl: order.fatura_url,
    faturaTarihi: order.fatura_tarihi,
    faturaDurum: order.fatura_durum,
    items: items.map((it: any) => ({
      name: it.product_name,
      quantity: it.quantity,
      price: Number(it.unit_price),
      total: Number(it.total_price),
    })),
  }
}

// ─── Core: create fatura for one order ──────────────────────────────────────
async function createFaturaForOrder(
  orderId: string,
  faturaTuru: 'temel' | 'ticari',
  musteriVkn?: string,
): Promise<{ success: boolean; faturaNo?: string; faturaUrl?: string; error?: string }> {
  // Get settings
  const settings = await getEarsivSettings()
  if (!settings.userServiceUrl || !settings.earsivServiceUrl) {
    return { success: false, error: 'e-Arşiv servis URL\'leri tanımlı değil. Lütfen ayarları güncelleyin.' }
  }
  if (!settings.username || !settings.password) {
    return { success: false, error: 'e-Arşiv kullanıcı adı veya şifre tanımlı değil.' }
  }

  // Get order
  const order = await fetchOrderWithItems(orderId)
  if (!order) return { success: false, error: 'Sipariş bulunamadı' }

  // Check if already invoiced
  if (order.faturaDurum === 'kesildi') {
    return { success: false, error: 'Bu sipariş için zaten fatura kesilmiş', }
  }

  // Mark as processing
  await execute(
    `UPDATE orders SET fatura_durum = 'bekleniyor', updated_at = NOW() WHERE order_id = ?`,
    [orderId]
  )

  let sessionId = ''
  try {
    // Step 1: Login
    sessionId = await loginEarsiv(settings)

    // Step 2: Build XML
    const uuid = generateUUID()
    const faturaNo = generateFaturaNo()
    const xml = buildUBLInvoiceXML(order, settings, uuid, faturaNo, faturaTuru, musteriVkn)

    // Step 3: Create invoice
    const result = await createEarsivInvoiceSOAP(settings.earsivServiceUrl, sessionId, xml)
    const finalUuid = result.uuid || uuid
    const finalDocNo = result.documentNo || faturaNo

    // Step 4: Get PDF URL
    const pdfUrl = await getPDFUrlSOAP(settings.earsivServiceUrl, sessionId, finalUuid)

    // Step 5: Save to DB
    await execute(
      `UPDATE orders SET
        fatura_uuid = ?, fatura_no = ?, fatura_url = ?,
        fatura_tarihi = NOW(), fatura_durum = 'kesildi', updated_at = NOW()
       WHERE order_id = ?`,
      [finalUuid, finalDocNo, pdfUrl || null, orderId]
    )

    return { success: true, faturaNo: finalDocNo, faturaUrl: pdfUrl || undefined }
  } catch (err: any) {
    // Save error state
    await execute(
      `UPDATE orders SET fatura_durum = 'hata', updated_at = NOW() WHERE order_id = ?`,
      [orderId]
    )
    const msg = err?.message || 'Bilinmeyen hata'
    return { success: false, error: msg }
  }
}

// ─── GET ─────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  // Return settings (for the settings modal pre-fill)
  if (action === 'settings') {
    const settings = await getEarsivSettings()
    return NextResponse.json({ settings })
  }

  // List orders with fatura filter
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit
  const search = searchParams.get('search') || ''
  const faturaFilter = searchParams.get('fatura') || 'all'
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''

  const conditions: string[] = []
  const params: any[] = []

  if (search) {
    conditions.push('(o.order_id LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ?)')
    const s = `%${search}%`
    params.push(s, s, s)
  }
  if (faturaFilter === 'kesildi') {
    conditions.push("o.fatura_durum = 'kesildi'")
  } else if (faturaFilter === 'bekliyor') {
    conditions.push("(o.fatura_durum IS NULL OR o.fatura_durum = 'hata')")
  }
  if (dateFrom) {
    conditions.push('DATE(o.created_at) >= ?')
    params.push(dateFrom)
  }
  if (dateTo) {
    conditions.push('DATE(o.created_at) <= ?')
    params.push(dateTo)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  try {
    const countResult = await queryOne<any>(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    )
    const total = countResult?.total || 0

    const ordersRaw = await query<any[]>(
      `SELECT o.id, o.order_id, o.customer_name, o.customer_email, o.customer_phone,
              o.shipping_address, o.shipping_city, o.shipping_district,
              o.shipping_cost, o.total,
              o.fatura_uuid, o.fatura_no, o.fatura_url, o.fatura_tarihi, o.fatura_durum,
              o.created_at
       FROM orders o ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    )

    // Fetch items for orders
    const orderIds = ordersRaw.map((o: any) => o.id)
    let itemsByOrderId: Record<number, any[]> = {}
    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => '?').join(',')
      const items = await query<any[]>(
        `SELECT order_id, product_name, quantity, unit_price FROM order_items WHERE order_id IN (${placeholders})`,
        orderIds
      )
      for (const item of items) {
        if (!itemsByOrderId[item.order_id]) itemsByOrderId[item.order_id] = []
        itemsByOrderId[item.order_id].push({
          name: item.product_name,
          quantity: item.quantity,
          price: Number(item.unit_price),
        })
      }
    }

    const orders = ordersRaw.map((o: any) => ({
      id: o.id,
      orderId: o.order_id,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      address: [o.shipping_address, o.shipping_city, o.shipping_district].filter(Boolean).join(', '),
      shippingAddress: o.shipping_address,
      city: o.shipping_city,
      shippingDistrict: o.shipping_district,
      shipping: Number(o.shipping_cost || 0),
      total: Number(o.total),
      faturaUuid: o.fatura_uuid || null,
      faturaNo: o.fatura_no || null,
      faturaUrl: o.fatura_url || null,
      faturaTarihi: o.fatura_tarihi || null,
      faturaDurum: o.fatura_durum || null,
      createdAt: o.created_at,
      items: itemsByOrderId[o.id] || [],
    }))

    return NextResponse.json({ orders, total, page, limit })
  } catch (error) {
    console.error('Fatura GET error:', error)
    return NextResponse.json({ error: 'Veritabanı hatası' }, { status: 500 })
  }
}

// ─── POST ────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 })
  }

  const { action } = body

  // ── Save settings ──────────────────────────────────────────────────────────
  if (action === 'save-settings') {
    const { username, password, vkn, erpKodu, userServiceUrl, earsivServiceUrl } = body
    try {
      const upsert = async (key: string, val: string) => {
        await execute(
          `INSERT INTO app_settings (setting_key, setting_value)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = ?`,
          [key, val || '', val || '']
        )
      }
      await upsert('earsiv_username', username || '')
      await upsert('earsiv_password', password || '')
      await upsert('earsiv_vkn', vkn || '')
      await upsert('earsiv_erp_kodu', erpKodu || '')
      await upsert('earsiv_user_service_url', userServiceUrl || '')
      await upsert('earsiv_service_url', earsivServiceUrl || '')
      return NextResponse.json({ success: true })
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
  }

  // ── Bulk fatura ────────────────────────────────────────────────────────────
  if (action === 'bulk-fatura') {
    const { orderIds, faturaTuru, musteriVkn } = body
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'orderIds boş' }, { status: 400 })
    }

    const results: any[] = []
    for (const oid of orderIds) {
      const result = await createFaturaForOrder(oid, faturaTuru || 'temel', musteriVkn)
      results.push({ orderId: oid, ...result })
    }

    return NextResponse.json({ success: true, results })
  }

  // ── Single fatura ──────────────────────────────────────────────────────────
  const { orderId, faturaTuru, musteriVkn } = body
  if (!orderId) {
    return NextResponse.json({ error: 'orderId gerekli' }, { status: 400 })
  }

  const result = await createFaturaForOrder(orderId, faturaTuru || 'temel', musteriVkn)

  if (!result.success) {
    // Check if already invoiced
    if (result.error?.includes('zaten fatura')) {
      return NextResponse.json(result, { status: 409 })
    }
    return NextResponse.json(result, { status: 500 })
  }

  return NextResponse.json(result)
}
