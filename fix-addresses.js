const mysql = require('mysql2/promise');
const fs = require('fs');

async function fixAddresses() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'merumy_user',
    password: 'MLD)JQR4*#W%(*m&',
    database: 'merumy'
  });

  // JSON'dan siparişleri oku
  const ordersData = JSON.parse(fs.readFileSync('./data/orders.json', 'utf8'));
  console.log('JSON siparişleri:', ordersData.length);

  // Eksik adresli siparişleri bul
  const [missingAddressOrders] = await connection.query(`
    SELECT id, order_id FROM orders 
    WHERE shipping_address IS NULL OR shipping_address = '' OR shipping_address = '{}'
  `);
  console.log('Eksik adresli sipariş sayısı:', missingAddressOrders.length);

  // JSON verilerinden bir map oluştur
  const ordersMap = {};
  for (const order of ordersData) {
    ordersMap[order.orderId] = order;
  }

  let updated = 0;

  for (const dbOrder of missingAddressOrders) {
    const jsonOrder = ordersMap[dbOrder.order_id];
    
    if (!jsonOrder) {
      console.log('JSON\'da bulunamadı:', dbOrder.order_id);
      continue;
    }

    let shippingAddress = '';
    let shippingCity = '';
    let shippingDistrict = '';

    // Farklı adres formatlarını dene
    if (jsonOrder.shippingAddress) {
      const addr = jsonOrder.shippingAddress;
      
      if (typeof addr === 'string' && addr.length > 0) {
        shippingAddress = addr;
      } else if (typeof addr === 'object') {
        // Object formatı
        const title = addr.title || addr.name || '';
        const address = addr.address || addr.street || addr.fullAddress || '';
        const city = addr.city || addr.il || '';
        const district = addr.district || addr.ilce || '';
        
        if (address || city || district) {
          const parts = [title, address, district, city].filter(Boolean);
          shippingAddress = parts.join(', ');
          shippingCity = city;
          shippingDistrict = district;
        }
      }
    }

    // customerAddress alanını da kontrol et
    if (!shippingAddress && jsonOrder.customerAddress) {
      if (typeof jsonOrder.customerAddress === 'string') {
        shippingAddress = jsonOrder.customerAddress;
      } else if (typeof jsonOrder.customerAddress === 'object') {
        const addr = jsonOrder.customerAddress;
        const parts = [addr.title, addr.address, addr.district, addr.city].filter(Boolean);
        shippingAddress = parts.join(', ');
        shippingCity = addr.city || '';
        shippingDistrict = addr.district || '';
      }
    }

    // deliveryAddress alanını da kontrol et
    if (!shippingAddress && jsonOrder.deliveryAddress) {
      shippingAddress = typeof jsonOrder.deliveryAddress === 'string' 
        ? jsonOrder.deliveryAddress 
        : JSON.stringify(jsonOrder.deliveryAddress);
    }

    if (shippingAddress && shippingAddress.length > 3) {
      try {
        await connection.query(`
          UPDATE orders SET 
            shipping_address = ?,
            shipping_city = COALESCE(NULLIF(?, ''), shipping_city),
            shipping_district = COALESCE(NULLIF(?, ''), shipping_district)
          WHERE id = ?
        `, [shippingAddress, shippingCity, shippingDistrict, dbOrder.id]);
        updated++;
        console.log('Güncellendi:', dbOrder.order_id, '->', shippingAddress.substring(0, 50) + '...');
      } catch (e) {
        console.error('Güncelleme hatası:', dbOrder.order_id, e.message);
      }
    } else {
      console.log('Adres bulunamadı:', dbOrder.order_id, JSON.stringify(jsonOrder.shippingAddress || null).substring(0, 100));
    }
  }

  console.log('\n=== ÖZET ===');
  console.log('Güncellenen:', updated);
  
  // Sonuç kontrolü
  const [stillMissing] = await connection.query(`
    SELECT COUNT(*) as cnt FROM orders 
    WHERE shipping_address IS NULL OR shipping_address = '' OR shipping_address = '{}'
  `);
  console.log('Hâlâ eksik adresli:', stillMissing[0].cnt);

  await connection.end();
}

fixAddresses().catch(console.error);





