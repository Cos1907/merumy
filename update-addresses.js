const mysql = require('mysql2/promise');
const fs = require('fs');

async function updateAddresses() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'merumy_user',
    password: 'MLD)JQR4*#W%(*m&',
    database: 'merumy'
  });

  // JSON'dan siparişleri oku
  const ordersData = JSON.parse(fs.readFileSync('./data/orders.json', 'utf8'));
  console.log('JSON siparişleri:', ordersData.length);

  // JSON verilerinden bir map oluştur
  const ordersMap = {};
  for (const order of ordersData) {
    ordersMap[order.orderId] = order;
  }

  // Veritabanındaki tüm siparişleri al
  const [dbOrders] = await connection.query('SELECT id, order_id, shipping_address FROM orders');
  console.log('Veritabanı siparişleri:', dbOrders.length);

  let updated = 0;

  for (const dbOrder of dbOrders) {
    const jsonOrder = ordersMap[dbOrder.order_id];
    
    if (!jsonOrder) continue;

    // JSON'daki adres bilgisini al
    let addressFromJson = '';
    
    // address alanını kontrol et
    if (jsonOrder.address && typeof jsonOrder.address === 'string' && jsonOrder.address.trim().length > 3) {
      addressFromJson = jsonOrder.address.trim();
    }
    
    // shippingAddress alanını kontrol et
    if (!addressFromJson && jsonOrder.shippingAddress) {
      if (typeof jsonOrder.shippingAddress === 'string' && jsonOrder.shippingAddress.trim().length > 3) {
        addressFromJson = jsonOrder.shippingAddress.trim();
      } else if (typeof jsonOrder.shippingAddress === 'object') {
        const addr = jsonOrder.shippingAddress;
        const parts = [addr.title, addr.address, addr.district, addr.city].filter(Boolean);
        if (parts.length > 0) {
          addressFromJson = parts.join(', ');
        }
      }
    }

    // Veritabanındaki adres boş ve JSON'da adres varsa güncelle
    if (addressFromJson && (!dbOrder.shipping_address || dbOrder.shipping_address.trim() === '')) {
      try {
        await connection.query(
          'UPDATE orders SET shipping_address = ? WHERE id = ?',
          [addressFromJson, dbOrder.id]
        );
        updated++;
        console.log('Güncellendi:', dbOrder.order_id, '->', addressFromJson.substring(0, 50) + '...');
      } catch (e) {
        console.error('Güncelleme hatası:', dbOrder.order_id, e.message);
      }
    }
  }

  console.log('\n=== ÖZET ===');
  console.log('Güncellenen sipariş:', updated);

  // Sonuç kontrolü
  const [stillMissing] = await connection.query(`
    SELECT COUNT(*) as cnt FROM orders 
    WHERE shipping_address IS NULL OR shipping_address = ''
  `);
  console.log('Hâlâ eksik adresli:', stillMissing[0].cnt);

  await connection.end();
}

updateAddresses().catch(console.error);

