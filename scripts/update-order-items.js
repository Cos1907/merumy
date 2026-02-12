const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// CSV dosyasını oku ve parse et
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const orders = [];
  
  // İlk satır başlık
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(',,,')) continue;
    
    // CSV satırını parse et (virgülle ayrılmış ama ürünler içinde virgül olabilir)
    const parts = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());
    
    if (parts.length >= 10 && parts[0].startsWith('SIP')) {
      const orderId = parts[0].trim();
      const dekontId = parts[1];
      const customerName = parts[2];
      const email = parts[3];
      const phone = parts[4];
      const products = parts[5]; // Ürünler
      const subtotal = parseFloat(parts[6]) || 0;
      const shipping = parseFloat(parts[7]) || 0;
      const total = parseFloat(parts[8]) || 0;
      const address = parts[9];
      const status = parts[10] || 'processing';
      const date = parts[11];
      
      if (products && products.length > 10) {
        orders.push({
          orderId,
          dekontId,
          customerName,
          email,
          phone,
          products,
          subtotal,
          shipping,
          total,
          address,
          status,
          date
        });
      }
    }
  }
  
  return orders;
}

// Ürün string'ini parse et
function parseProducts(productString) {
  const items = [];
  
  // Farklı ayırıcılar: " | ", " , ", " x " şeklinde ayrılmış olabilir
  // Örnek: "AGE-R Booster Pro Pink x1 (16999 TL) | Collagen Jelly Cream x1 (1063 TL)"
  // veya: "PDRN Somon DNA x 2 , PDRN UV Daily Rose x 2"
  
  let parts = [];
  if (productString.includes(' | ')) {
    parts = productString.split(' | ');
  } else if (productString.includes(' , ')) {
    parts = productString.split(' , ');
  } else {
    parts = [productString];
  }
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    // Ürün adı ve miktarı parse et
    // Format 1: "AGE-R Booster Pro Pink x1 (16999 TL)"
    // Format 2: "PDRN Somon DNA x 2"
    // Format 3: "medicube - Zero Pore Pad Mild"
    
    let name = trimmed;
    let quantity = 1;
    let price = 0;
    
    // Fiyatı çıkar (eğer varsa)
    const priceMatch = trimmed.match(/\((\d+(?:\.\d+)?)\s*TL\)/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1]);
      name = trimmed.replace(/\s*\(\d+(?:\.\d+)?\s*TL\)/, '').trim();
    }
    
    // Miktarı çıkar
    const qtyMatch = name.match(/\s*x\s*(\d+)\s*$/i);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1]);
      name = name.replace(/\s*x\s*\d+\s*$/i, '').trim();
    }
    
    if (name) {
      items.push({
        name,
        quantity,
        price: price || 0
      });
    }
  }
  
  return items;
}

async function main() {
  // Veritabanı bağlantısı
  const db = await mysql.createPool({
    host: 'localhost',
    user: 'merumy_user',
    password: 'MLD)JQR4*#W%(*m&',
    database: 'merumy',
    waitForConnections: true,
    connectionLimit: 10
  });

  console.log('📦 Sipariş güncelleme scripti başlatılıyor...\n');

  // CSV dosyasını oku
  const csvPath = '/var/www/merumy-full/scripts/orders-update.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV dosyası bulunamadı:', csvPath);
    process.exit(1);
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvOrders = parseCSV(csvContent);
  
  console.log(`📋 CSV'den ${csvOrders.length} sipariş okundu\n`);

  // Veritabanından "Merumy Ürünleri (Detay Sepette)" olan siparişleri bul
  const [dbOrders] = await db.query(`
    SELECT o.id, o.order_id, oi.id as item_id, oi.product_name
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE oi.product_name LIKE '%Merumy Ürünleri%' 
       OR oi.product_name LIKE '%Detay Sepette%'
  `);

  console.log(`🔍 Veritabanında ${dbOrders.length} eksik ürün detaylı sipariş bulundu\n`);

  // Her bir eksik sipariş için CSV'den eşleşen veriyi bul
  let updated = 0;
  let notFound = 0;

  const processedOrderIds = new Set();

  for (const dbOrder of dbOrders) {
    if (processedOrderIds.has(dbOrder.order_id)) continue;
    processedOrderIds.add(dbOrder.order_id);

    // CSV'de bu sipariş var mı?
    const csvOrder = csvOrders.find(o => o.orderId === dbOrder.order_id);
    
    if (csvOrder) {
      console.log(`\n✅ Sipariş bulundu: ${dbOrder.order_id}`);
      console.log(`   Müşteri: ${csvOrder.customerName}`);
      console.log(`   Ürünler: ${csvOrder.products.substring(0, 80)}...`);
      
      // Ürünleri parse et
      const items = parseProducts(csvOrder.products);
      
      if (items.length > 0) {
        // Önce eski order_items'ları sil
        await db.query('DELETE FROM order_items WHERE order_id = ?', [dbOrder.id]);
        
        // Yeni ürünleri ekle
        for (const item of items) {
          await db.query(`
            INSERT INTO order_items (order_id, product_name, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)
          `, [
            dbOrder.id,
            item.name,
            item.quantity,
            item.price,
            item.price * item.quantity
          ]);
        }
        
        console.log(`   📝 ${items.length} ürün eklendi`);
        updated++;
      }
    } else {
      console.log(`\n⚠️ CSV'de bulunamadı: ${dbOrder.order_id}`);
      notFound++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Özet:`);
  console.log(`   ✅ Güncellenen: ${updated}`);
  console.log(`   ⚠️ CSV'de bulunamayan: ${notFound}`);
  console.log('='.repeat(50));

  await db.end();
  console.log('\n✨ İşlem tamamlandı!');
}

main().catch(console.error);

