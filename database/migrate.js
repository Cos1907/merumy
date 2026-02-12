#!/usr/bin/env node
/**
 * Migration script to import existing JSON data into MySQL database
 * Run: node database/migrate.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: 'localhost',
  user: 'merumy_user',
  password: 'MLD)JQR4*#W%(*m&',
  database: 'merumy',
  multipleStatements: true,
};

async function migrate() {
  console.log('🚀 Starting migration...\n');
  
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 1. Import Brands
    console.log('📦 Importing brands...');
    await importBrands(connection);
    
    // 2. Import Categories
    console.log('📁 Importing categories...');
    await importCategories(connection);
    
    // 3. Import Products
    console.log('🛍️ Importing products...');
    await importProducts(connection);
    
    // 4. Import Users
    console.log('👤 Importing users...');
    await importUsers(connection);
    
    // 5. Import Orders
    console.log('📋 Importing orders...');
    await importOrders(connection);
    
    console.log('\n✅ Migration completed successfully!');
    
    // Show counts
    const [productCount] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [orderCount] = await connection.query('SELECT COUNT(*) as count FROM orders');
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [brandCount] = await connection.query('SELECT COUNT(*) as count FROM brands');
    
    console.log('\n📊 Summary:');
    console.log(`   - Brands: ${brandCount[0].count}`);
    console.log(`   - Products: ${productCount[0].count}`);
    console.log(`   - Users: ${userCount[0].count}`);
    console.log(`   - Orders: ${orderCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function importBrands(connection) {
  const productsPath = path.join(__dirname, '../data/products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  
  // Extract unique brands
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  
  for (const brandName of brands) {
    const slug = brandName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    try {
      await connection.query(
        `INSERT INTO brands (slug, name) VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [slug, brandName]
      );
    } catch (err) {
      console.log(`   Warning: Could not insert brand ${brandName}`);
    }
  }
  
  console.log(`   ✓ Imported ${brands.length} brands`);
}

async function importCategories(connection) {
  const productsPath = path.join(__dirname, '../data/products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  
  // Extract unique categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  
  for (const categoryName of categories) {
    const slug = categoryName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-ğüşıöç]/g, '')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    
    try {
      await connection.query(
        `INSERT INTO categories (slug, name) VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [slug || 'uncategorized', categoryName]
      );
    } catch (err) {
      console.log(`   Warning: Could not insert category ${categoryName}`);
    }
  }
  
  console.log(`   ✓ Imported ${categories.length} categories`);
}

async function importProducts(connection) {
  const productsPath = path.join(__dirname, '../data/products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  
  let imported = 0;
  let skipped = 0;
  
  for (const product of products) {
    try {
      // Get brand_id
      let brandId = null;
      if (product.brand) {
        const [brandRows] = await connection.query(
          'SELECT id FROM brands WHERE name = ? LIMIT 1',
          [product.brand]
        );
        if (brandRows.length > 0) {
          brandId = brandRows[0].id;
        }
      }
      
      // Get category_id
      let categoryId = null;
      if (product.category) {
        const [catRows] = await connection.query(
          'SELECT id FROM categories WHERE name = ? LIMIT 1',
          [product.category]
        );
        if (catRows.length > 0) {
          categoryId = catRows[0].id;
        }
      }
      
      // Determine stock status
      let stockStatus = 'in_stock';
      let stock = 100; // Default stock
      if (product.inStock === false) {
        stockStatus = 'out_of_stock';
        stock = 0;
      }
      
      // Insert product
      await connection.query(
        `INSERT INTO products 
         (slug, barcode, sku, name, description, price, compare_price, stock, stock_status, brand_id, category_id, is_active, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           name = VALUES(name),
           price = VALUES(price),
           compare_price = VALUES(compare_price),
           description = VALUES(description),
           brand_id = VALUES(brand_id),
           category_id = VALUES(category_id)`,
        [
          product.slug,
          product.barcode || null,
          product.code || null,
          product.name,
          product.description || null,
          product.price,
          product.originalPrice || null,
          stock,
          stockStatus,
          brandId,
          categoryId,
          true,
          product.subcategory ? JSON.stringify([product.subcategory]) : null
        ]
      );
      
      // Insert product image if exists
      if (product.image) {
        const [productRows] = await connection.query(
          'SELECT id FROM products WHERE slug = ?',
          [product.slug]
        );
        if (productRows.length > 0) {
          await connection.query(
            `INSERT INTO product_images (product_id, image_url, is_primary)
             VALUES (?, ?, TRUE)
             ON DUPLICATE KEY UPDATE image_url = VALUES(image_url)`,
            [productRows[0].id, product.image]
          );
        }
      }
      
      imported++;
    } catch (err) {
      console.log(`   Warning: Could not insert product ${product.name}: ${err.message}`);
      skipped++;
    }
  }
  
  console.log(`   ✓ Imported ${imported} products (${skipped} skipped)`);
}

async function importUsers(connection) {
  const usersPath = path.join(__dirname, '../data/users.json');
  
  if (!fs.existsSync(usersPath)) {
    console.log('   ⚠ No users.json found, skipping user import');
    return;
  }
  
  const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  // Handle both { users: [...] } and [...] formats
  const users = Array.isArray(usersData) ? usersData : (usersData.users || []);
  
  if (!Array.isArray(users)) {
    console.log('   ⚠ Invalid users.json format, skipping');
    return;
  }
  
  let imported = 0;
  
  for (const user of users) {
    try {
      // Handle password - store the hash or a placeholder
      let passwordHash = 'migrated_user';
      if (user.password) {
        if (typeof user.password === 'string') {
          passwordHash = user.password;
        } else if (user.password.hash) {
          passwordHash = user.password.hash;
        }
      } else if (user.passwordHash) {
        passwordHash = user.passwordHash;
      }
      
      // Combine firstName and lastName if available
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || user.email.split('@')[0];
      
      await connection.query(
        `INSERT INTO users (uuid, email, password_hash, name, phone, role, created_at)
         VALUES (?, ?, ?, ?, ?, 'customer', ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone)`,
        [
          user.id || require('crypto').randomUUID(),
          user.email,
          passwordHash,
          name,
          user.phone || null,
          user.createdAt ? new Date(user.createdAt) : new Date()
        ]
      );
      imported++;
    } catch (err) {
      // Skip duplicate emails
      console.log(`   Warning: Could not import user ${user.email}: ${err.message}`);
    }
  }
  
  console.log(`   ✓ Imported ${imported} users`);
}

async function importOrders(connection) {
  const ordersPath = path.join(__dirname, '../data/orders.json');
  
  if (!fs.existsSync(ordersPath)) {
    console.log('   ⚠ No orders.json found, skipping order import');
    return;
  }
  
  const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));
  let imported = 0;
  let skipped = 0;
  
  for (const order of orders) {
    try {
      // Parse address
      let shippingAddress = '';
      if (order.address) {
        shippingAddress = order.address;
      } else if (order.shippingAddress) {
        if (typeof order.shippingAddress === 'string') {
          shippingAddress = order.shippingAddress;
        } else {
          shippingAddress = [
            order.shippingAddress.address,
            order.shippingAddress.district,
            order.shippingAddress.city,
            order.shippingAddress.postalCode
          ].filter(Boolean).join(', ');
        }
      }
      
      // Map status
      let status = order.status || 'pending';
      const validStatuses = ['pending', 'processing', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        status = 'processing';
      }
      
      // Insert order
      const [result] = await connection.query(
        `INSERT INTO orders 
         (order_id, dekont_id, customer_name, customer_email, customer_phone, shipping_address, subtotal, shipping_cost, total, status, payment_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?)
         ON DUPLICATE KEY UPDATE 
           customer_name = VALUES(customer_name),
           status = VALUES(status)`,
        [
          order.orderId || order.id,
          order.dekontId || order.dekont_id || null,
          order.customerName || 'Müşteri',
          order.customerEmail || '',
          order.customerPhone || '',
          shippingAddress,
          order.subtotal || order.total || 0,
          order.shipping || 0,
          order.total || 0,
          status,
          order.createdAt ? new Date(order.createdAt) : new Date()
        ]
      );
      
      // Get the order ID (either inserted or existing)
      const orderId = result.insertId || (await connection.query(
        'SELECT id FROM orders WHERE order_id = ?',
        [order.orderId || order.id]
      ))[0][0]?.id;
      
      // Insert order items
      if (orderId && order.items && order.items.length > 0) {
        for (const item of order.items) {
          try {
            await connection.query(
              `INSERT INTO order_items 
               (order_id, product_name, quantity, unit_price, total_price)
               VALUES (?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
              [
                orderId,
                item.name,
                item.quantity || 1,
                item.price || 0,
                (item.price || 0) * (item.quantity || 1)
              ]
            );
          } catch (err) {
            // Skip item errors
          }
        }
      }
      
      imported++;
    } catch (err) {
      console.log(`   Warning: Could not insert order ${order.orderId || order.id}: ${err.message}`);
      skipped++;
    }
  }
  
  console.log(`   ✓ Imported ${imported} orders (${skipped} skipped)`);
}

// Run migration
migrate().catch(console.error);

