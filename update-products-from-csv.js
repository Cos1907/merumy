const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Sunucu için yollar
const csvPath = '/var/www/merumy-full/products-update.csv';
const imageDir = '/var/www/merumy-full/public/SIZED BARCODE';
const jsonPath = '/var/www/merumy-full/data/products.json';
const appJsonPath = '/var/www/merumy-full/app/data/products.json';

// Türkçe karakterleri URL-safe hale getir
function slugify(text) {
  const charMap = {
    'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U'
  };
  
  let result = text.toLowerCase();
  for (const [from, to] of Object.entries(charMap)) {
    result = result.replace(new RegExp(from, 'g'), to.toLowerCase());
  }
  
  return result
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Fiyatı parse et - "32.998,00" -> 32998.00
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/"/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// CSV satırını parse et (tırnak içindeki virgülleri koru)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

// Tüm CSV'yi parse et
function parseCSV(content) {
  const products = [];
  const lines = content.split('\n');
  
  let i = 1; // Header'ı atla
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Barkod ile başlayan satır mı?
    const barcodeMatch = line.match(/^_?(\d{10,14})-?,/);
    
    if (barcodeMatch) {
      const barcode = barcodeMatch[1];
      
      // Bu satırdan başlayarak tüm ürün verisini topla
      let fullLine = line;
      let j = i + 1;
      
      // Sonraki barkod satırına kadar devam et
      while (j < lines.length && !lines[j].match(/^_?(\d{10,14})-?,/)) {
        const nextLine = lines[j].trim();
        if (nextLine) {
          fullLine += '\n' + nextLine;
        }
        j++;
      }
      
      // Parse et
      const product = parseProductLine(barcode, fullLine);
      if (product) {
        products.push(product);
      }
      
      i = j;
    } else {
      i++;
    }
  }
  
  return products;
}

// Tek bir ürün satırını parse et
function parseProductLine(barcode, fullLine) {
  try {
    const parts = parseCSVLine(fullLine);
    
    if (parts.length < 8) {
      return null;
    }
    
    // Tırnakları temizle
    const cleanQuotes = (s) => s ? s.replace(/^"|"$/g, '').trim() : '';
    
    const product = {
      barcode: barcode,
      koreCategory: cleanQuotes(parts[1]) || '', // Boş ise Kore Trendlerinde değil
      category: cleanQuotes(parts[2]) || 'Cilt Bakımı',
      brand: cleanQuotes(parts[3]) || '',
      name: cleanQuotes(parts[4]) || '',
      description: cleanQuotes(parts[5]) || '',
      originalPrice: parsePrice(parts[6]),
      price: parsePrice(parts[7]),
      stock: parseInt(parts[8]) || 100
    };
    
    return product;
  } catch (error) {
    console.error(`Parse hatası: ${barcode} - ${error.message}`);
    return null;
  }
}

// Görsel dosyasını bul
function findImage(barcode, imageDir) {
  try {
    const files = fs.readdirSync(imageDir);
    
    // Önce tam eşleşme ara
    for (const file of files) {
      const name = path.parse(file).name.replace(/^_/, '').replace(/-$/, '');
      if (name === barcode) {
        return `/SIZED BARCODE/${file}`;
      }
    }
    
    // Partial eşleşme
    for (const file of files) {
      const name = path.parse(file).name.replace(/^_/, '').replace(/-$/, '');
      if (name.includes(barcode) || barcode.includes(name)) {
        return `/SIZED BARCODE/${file}`;
      }
    }
  } catch (error) {
    console.error(`Görsel klasörü okunamadı: ${error.message}`);
  }
  
  return null;
}

async function main() {
  console.log('Ürün güncelleme başlıyor...\n');
  
  // CSV'yi oku
  console.log('CSV dosyası okunuyor...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Parse et
  console.log('CSV parse ediliyor...');
  const csvProducts = parseCSV(csvContent);
  console.log(`${csvProducts.length} ürün CSV'den parse edildi.\n`);
  
  // İlk 5 ürünü göster
  console.log('İlk 5 ürün:');
  csvProducts.slice(0, 5).forEach(p => {
    console.log(`- ${p.barcode}: ${p.name.substring(0, 40)}... | PSF: ${p.originalPrice} | Fiyat: ${p.price} | Marka: ${p.brand}`);
  });
  console.log('');
  
  // Görselleri listele
  let imageFiles = [];
  try {
    imageFiles = fs.readdirSync(imageDir);
    console.log(`${imageFiles.length} görsel dosyası bulundu.\n`);
  } catch (e) {
    console.log('Görsel klasörü bulunamadı, devam ediliyor...\n');
  }
  
  // Veritabanına bağlan
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'merumy',
    socketPath: '/var/run/mysqld/mysqld.sock'
  });
  
  console.log('MySQL veritabanına bağlandı.\n');
  
  // Brand tablosunu oluştur/güncelle
  const brandMap = new Map();
  const [brands] = await connection.execute('SELECT id, name FROM brands');
  brands.forEach(b => brandMap.set(b.name.toLowerCase(), b.id));
  
  // Her ürün için işlem yap
  let updated = 0;
  let inserted = 0;
  let errors = 0;
  let noImage = 0;
  
  const allProducts = [];
  
  for (const product of csvProducts) {
    try {
      if (!product.barcode || !product.name) {
        continue;
      }
      
      // Görsel bul
      const imagePath = findImage(product.barcode, imageDir);
      if (!imagePath) {
        noImage++;
      }
      
      // Slug oluştur
      const slug = slugify(product.name);
      const productSlug = `${product.barcode.substring(0, 5)}-${slug}`.substring(0, 100);
      
      // Brand ID bul veya oluştur
      let brandId = null;
      if (product.brand) {
        const brandKey = product.brand.toLowerCase();
        if (brandMap.has(brandKey)) {
          brandId = brandMap.get(brandKey);
        } else {
          // Yeni brand ekle
          const [result] = await connection.execute(
            'INSERT INTO brands (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
            [product.brand, slugify(product.brand)]
          );
          brandId = result.insertId;
          brandMap.set(brandKey, brandId);
        }
      }
      
      // Veritabanında kontrol et
      const [existing] = await connection.execute(
        'SELECT id FROM products WHERE barcode = ?',
        [product.barcode]
      );
      
      if (existing.length > 0) {
        // Güncelle
        await connection.execute(
          `UPDATE products SET 
            name = ?, slug = ?, description = ?, price = ?, 
            compare_price = ?, brand_id = ?, 
            stock = ?, updated_at = NOW()
          WHERE barcode = ?`,
          [
            product.name, productSlug, product.description, product.price,
            product.originalPrice, brandId,
            product.stock, product.barcode
          ]
        );
        updated++;
      } else {
        // Yeni ekle
        await connection.execute(
          `INSERT INTO products (barcode, name, slug, description, price, compare_price, brand_id, stock, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
          [
            product.barcode, product.name, productSlug, product.description,
            product.price, product.originalPrice, brandId, product.stock
          ]
        );
        inserted++;
      }
      
      // product_images tablosuna görsel ekle
      if (imagePath) {
        const [existingImage] = await connection.execute(
          'SELECT id FROM product_images WHERE product_id = (SELECT id FROM products WHERE barcode = ?) AND image_url = ?',
          [product.barcode, imagePath]
        );
        
        if (existingImage.length === 0) {
          await connection.execute(
            `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
             SELECT id, ?, 1, 0 FROM products WHERE barcode = ?
             ON DUPLICATE KEY UPDATE image_url = ?`,
            [imagePath, product.barcode, imagePath]
          );
        }
      }
      
      // JSON için listeye ekle
      // CSV'deki "Kore Trendleri" değeri varsa isKoreTrend = true
      const isKoreTrend = product.koreCategory && product.koreCategory.toLowerCase().includes('kore');
      
      allProducts.push({
        id: product.barcode,
        barcode: product.barcode,
        name: product.name,
        slug: productSlug,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        brand: product.brand,
        category: product.category,
        stock: product.stock,
        inStock: product.stock > 0,
        isKoreTrend: isKoreTrend,
        image: imagePath || '/placeholder.jpg',
        images: imagePath ? [imagePath] : [],
        isActive: true
      });
      
    } catch (error) {
      errors++;
      console.error(`✗ Hata: ${product.barcode} - ${error.message}`);
    }
  }
  
  // JSON dosyalarını güncelle
  console.log('\nJSON dosyaları güncelleniyor...');
  
  fs.writeFileSync(jsonPath, JSON.stringify(allProducts, null, 2));
  console.log(`✓ ${jsonPath} güncellendi`);
  
  fs.writeFileSync(appJsonPath, JSON.stringify(allProducts, null, 2));
  console.log(`✓ ${appJsonPath} güncellendi`);
  
  await connection.end();
  
  console.log('\n=== ÖZET ===');
  console.log(`Güncellenen: ${updated}`);
  console.log(`Eklenen: ${inserted}`);
  console.log(`Hata: ${errors}`);
  console.log(`Görseli olmayan: ${noImage}`);
  console.log(`Toplam ürün: ${allProducts.length}`);
}

main().catch(console.error);
