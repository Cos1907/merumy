const mysql = require('mysql2/promise');
const fs = require('fs');

async function syncOrders() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'merumy_user',
    password: 'MLD)JQR4*#W%(*m&',
    database: 'merumy'
  });

  // JSON'dan siparişleri oku
  const ordersData = JSON.parse(fs.readFileSync('./data/orders.json', 'utf8'));
  console.log('JSON siparişleri:', ordersData.length);

  // Mevcut order_id'leri al
  const [existingRows] = await connection.query('SELECT order_id FROM orders');
  const existingIds = new Set(existingRows.map(r => r.order_id));
  console.log('Veritabanındaki sipariş sayısı:', existingIds.size);

  let inserted = 0;
  let updated = 0;

  for (const order of ordersData) {
    const orderId = order.orderId;
    
    // Adres bilgisini hazırla
    let shippingAddress = '';
    let shippingCity = '';
    let shippingDistrict = '';
    
    if (order.shippingAddress) {
      if (typeof order.shippingAddress === 'string') {
        shippingAddress = order.shippingAddress;
      } else if (order.shippingAddress.address) {
        const addr = order.shippingAddress;
        shippingAddress = `${addr.title || ''}, ${addr.address || ''}, ${addr.district || ''}/${addr.city || ''}`.trim();
        shippingCity = addr.city || '';
        shippingDistrict = addr.district || '';
      }
    }

    if (!existingIds.has(orderId)) {
      // Yeni sipariş ekle
      try {
        await connection.query(`
          INSERT INTO orders (order_id, dekont_id, customer_name, customer_email, customer_phone, 
            shipping_address, shipping_city, shipping_district, subtotal, total, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          orderId,
          order.dekontId || null,
          order.customerName || '',
          order.customerEmail || '',
          order.customerPhone || '',
          shippingAddress,
          shippingCity,
          shippingDistrict,
          order.subtotal || order.total || 0,
          order.total || 0,
          order.status || 'pending',
          order.createdAt ? new Date(order.createdAt) : new Date()
        ]);
        inserted++;
        console.log('Eklendi:', orderId);
        
        // Sipariş kalemlerini ekle
        if (order.items && Array.isArray(order.items)) {
          const [orderResult] = await connection.query('SELECT id FROM orders WHERE order_id = ?', [orderId]);
          if (orderResult.length > 0) {
            const dbOrderId = orderResult[0].id;
            for (const item of order.items) {
              await connection.query(`
                INSERT INTO order_items (order_id, product_name, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?)
              `, [
                dbOrderId,
                item.name || item.productName || 'Ürün',
                item.quantity || 1,
                item.price || item.unitPrice || 0,
                (item.quantity || 1) * (item.price || item.unitPrice || 0)
              ]);
            }
          }
        }
      } catch (e) {
        console.error('Insert error for', orderId, e.message);
      }
    } else if (shippingAddress) {
      // Mevcut siparişin eksik adresini güncelle
      try {
        const [result] = await connection.query(`
          UPDATE orders SET 
            shipping_address = ?,
            shipping_city = COALESCE(NULLIF(shipping_city, ''), ?),
            shipping_district = COALESCE(NULLIF(shipping_district, ''), ?)
          WHERE order_id = ? AND (shipping_address IS NULL OR shipping_address = '' OR shipping_address = '{}')
        `, [
          shippingAddress,
          shippingCity,
          shippingDistrict,
          orderId
        ]);
        if (result.affectedRows > 0) {
          updated++;
          console.log('Adresi güncellendi:', orderId);
        }
      } catch (e) {
        // Ignore
      }
    }
  }

  console.log('\n=== ÖZET ===');
  console.log('Eklenen yeni sipariş:', inserted);
  console.log('Adresi güncellenen sipariş:', updated);

  // Sonuç kontrolü
  const [finalCount] = await connection.query('SELECT COUNT(*) as cnt FROM orders');
  const [missingAddr] = await connection.query("SELECT COUNT(*) as cnt FROM orders WHERE shipping_address IS NULL OR shipping_address = '' OR shipping_address = '{}'");
  console.log('Toplam sipariş:', finalCount[0].cnt);
  console.log('Adresi eksik sipariş:', missingAddr[0].cnt);

  await connection.end();
}

syncOrders().catch(console.error);





