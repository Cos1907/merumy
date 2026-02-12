const fs = require('fs');
const path = require('path');

// CSV dosyasını oku
const csvPath = '/Users/huseyinkulekci/Downloads/son hüseyin - Sayfa1.csv';
const productsPath = path.join(__dirname, '../app/data/products.json');
const imagesDir = path.join(__dirname, '../public/urun-gorselleri');

// Fiyat parse et (₺1.036 -> 1036)
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  // ₺ işaretini ve noktaları kaldır, virgülü noktaya çevir
  const cleaned = priceStr
    .replace(/₺/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .trim();
  return parseFloat(cleaned) || 0;
}

// Slug oluştur
function createSlug(id, name) {
  const slug = name
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  return `${id.toString().padStart(5, '0')}-${slug}`;
}

// Görsel klasörü bul (fuzzy match)
function findImageFolder(productName, brand, imageFolders) {
  const normalize = (str) => str
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');

  const normalizedName = normalize(productName);
  const normalizedBrand = normalize(brand);
  
  // Önce tam eşleşme dene
  for (const folder of imageFolders) {
    const normalizedFolder = normalize(folder);
    if (normalizedFolder === normalizedName) {
      return folder;
    }
  }
  
  // Sonra kısmi eşleşme dene (ürün adı klasör içinde)
  for (const folder of imageFolders) {
    const normalizedFolder = normalize(folder);
    // En az 15 karakter eşleşmeli
    if (normalizedName.length > 15 && normalizedFolder.includes(normalizedName.substring(0, 15))) {
      return folder;
    }
    if (normalizedFolder.length > 15 && normalizedName.includes(normalizedFolder.substring(0, 15))) {
      return folder;
    }
  }
  
  // Marka + anahtar kelimelerle eşleşme
  const keywords = productName.split(/\s+/).filter(w => w.length > 3);
  for (const folder of imageFolders) {
    const normalizedFolder = normalize(folder);
    if (normalizedFolder.includes(normalizedBrand)) {
      let matchCount = 0;
      for (const keyword of keywords) {
        if (normalizedFolder.includes(normalize(keyword))) {
          matchCount++;
        }
      }
      if (matchCount >= Math.min(3, keywords.length)) {
        return folder;
      }
    }
  }
  
  return null;
}

// İlk görseli bul
function getFirstImage(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    const imageFile = files.find(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));
    return imageFile || null;
  } catch {
    return null;
  }
}

// Kategori belirle
function determineCategory(brand, productName) {
  const nameLower = productName.toLowerCase();
  
  // Renkli Kozmetik markaları
  const colorCosmeticBrands = ['Tırtır', 'TIRTIR', '2AN', 'Lilybyred', 'The Seam', 'Bouquet Garni'];
  if (colorCosmeticBrands.includes(brand)) {
    return { category: 'Renkli Kozmetik', subcategory: 'Makyaj' };
  }
  
  // Alt kategori tespiti
  if (nameLower.includes('şampuan') || nameLower.includes('shampoo') || nameLower.includes('saç')) {
    return { category: 'Saç Bakımı', subcategory: 'Şampuan' };
  }
  if (nameLower.includes('diş') || nameLower.includes('tooth')) {
    return { category: 'Vücut Bakımı', subcategory: 'Ağız Bakımı' };
  }
  if (nameLower.includes('vücut') || nameLower.includes('body')) {
    return { category: 'Vücut Bakımı', subcategory: 'Vücut Bakımı' };
  }
  if (nameLower.includes('güneş') || nameLower.includes('sun')) {
    return { category: 'Cilt Bakımı', subcategory: 'Güneş Koruma' };
  }
  if (nameLower.includes('serum') || nameLower.includes('ampul') || nameLower.includes('ampoule')) {
    return { category: 'Cilt Bakımı', subcategory: 'Serum' };
  }
  if (nameLower.includes('krem') || nameLower.includes('cream') || nameLower.includes('moistur')) {
    return { category: 'Cilt Bakımı', subcategory: 'Krem' };
  }
  if (nameLower.includes('tonik') || nameLower.includes('toner')) {
    return { category: 'Cilt Bakımı', subcategory: 'Tonik' };
  }
  if (nameLower.includes('maske') || nameLower.includes('mask')) {
    return { category: 'Cilt Bakımı', subcategory: 'Maske' };
  }
  if (nameLower.includes('temizle') || nameLower.includes('cleans') || nameLower.includes('foam') || nameLower.includes('wash')) {
    return { category: 'Cilt Bakımı', subcategory: 'Temizleyici' };
  }
  if (nameLower.includes('göz') || nameLower.includes('eye')) {
    return { category: 'Cilt Bakımı', subcategory: 'Göz Bakımı' };
  }
  if (nameLower.includes('ruj') || nameLower.includes('tint') || nameLower.includes('lip')) {
    return { category: 'Renkli Kozmetik', subcategory: 'Dudak' };
  }
  if (nameLower.includes('fondöten') || nameLower.includes('cushion') || nameLower.includes('foundation')) {
    return { category: 'Renkli Kozmetik', subcategory: 'Fondöten' };
  }
  if (nameLower.includes('maskara') || nameLower.includes('eyeliner') || nameLower.includes('kaş')) {
    return { category: 'Renkli Kozmetik', subcategory: 'Göz Makyajı' };
  }
  if (nameLower.includes('allık') || nameLower.includes('blush')) {
    return { category: 'Renkli Kozmetik', subcategory: 'Allık' };
  }
  
  return { category: 'Cilt Bakımı', subcategory: 'Diğer' };
}

// CSV parse et
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const products = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // CSV satırını parse et (virgüllü değerler için)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    // Satır içi yeni satırları temizle
    const cleanedValues = values.map(v => v.replace(/\n/g, ' ').trim());
    
    if (cleanedValues.length >= 7) {
      const code = cleanedValues[0];
      const brand = cleanedValues[1];
      const name = cleanedValues[2];
      const barcode = cleanedValues[3];
      const supplier = cleanedValues[4];
      const psf = cleanedValues[5];
      const discountedPrice = cleanedValues[6];
      const stock = cleanedValues[7] || '0';
      
      if (code && name) {
        products.push({
          code,
          brand,
          name,
          barcode,
          supplier,
          psf: parsePrice(psf),
          price: parsePrice(discountedPrice),
          stock: parseInt(stock) || 0
        });
      }
    }
  }
  
  return products;
}

// Ana işlem
async function main() {
  console.log('CSV dosyası okunuyor...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const csvProducts = parseCSV(csvContent);
  console.log(`CSV'den ${csvProducts.length} ürün okundu.`);
  
  console.log('Mevcut products.json okunuyor...');
  const existingProducts = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  console.log(`Mevcut ${existingProducts.length} ürün var.`);
  
  // Barcode ile index oluştur
  const barcodeIndex = {};
  for (const p of existingProducts) {
    if (p.barcode) {
      barcodeIndex[p.barcode] = p;
    }
  }
  
  // Görsel klasörlerini listele
  console.log('Görsel klasörleri taranıyor...');
  const imageFolders = fs.readdirSync(imagesDir).filter(f => {
    return fs.statSync(path.join(imagesDir, f)).isDirectory();
  });
  console.log(`${imageFolders.length} görsel klasörü bulundu.`);
  
  let updatedCount = 0;
  let addedCount = 0;
  let imageFoundCount = 0;
  
  for (const csvProduct of csvProducts) {
    // Barcode ile mevcut ürünü bul
    const existingProduct = barcodeIndex[csvProduct.barcode];
    
    if (existingProduct) {
      // Mevcut ürünü güncelle
      existingProduct.price = csvProduct.price;
      if (csvProduct.psf && csvProduct.psf > csvProduct.price) {
        existingProduct.originalPrice = csvProduct.psf;
      }
      existingProduct.inStock = csvProduct.stock > 0;
      updatedCount++;
    } else {
      // Yeni ürün ekle
      const newId = (existingProducts.length + 1).toString().padStart(5, '0');
      const { category, subcategory } = determineCategory(csvProduct.brand, csvProduct.name);
      
      // Görsel bul
      const imageFolder = findImageFolder(csvProduct.name, csvProduct.brand, imageFolders);
      let imagePath = '/placeholder.jpg';
      
      if (imageFolder) {
        const imageFile = getFirstImage(path.join(imagesDir, imageFolder));
        if (imageFile) {
          imagePath = `/urun-gorselleri/${imageFolder}/${imageFile}`;
          imageFoundCount++;
        }
      }
      
      const newProduct = {
        id: newId,
        code: csvProduct.code || newId,
        slug: createSlug(newId, csvProduct.name),
        name: csvProduct.name,
        brand: csvProduct.brand,
        category,
        subcategory,
        price: csvProduct.price,
        originalPrice: csvProduct.psf > csvProduct.price ? csvProduct.psf : null,
        image: imagePath,
        barcode: csvProduct.barcode,
        rating: 4.0 + Math.random() * 0.9,
        reviews: Math.floor(Math.random() * 200) + 50,
        sold: Math.floor(Math.random() * 500) + 100,
        inStock: csvProduct.stock > 0,
        description: `${csvProduct.name} - ${csvProduct.brand} markasından kaliteli ${category} ürünü.`
      };
      
      existingProducts.push(newProduct);
      barcodeIndex[csvProduct.barcode] = newProduct;
      addedCount++;
    }
  }
  
  // Kaydet
  console.log('\nproducts.json kaydediliyor...');
  fs.writeFileSync(productsPath, JSON.stringify(existingProducts, null, 2));
  
  console.log('\n=== ÖZET ===');
  console.log(`Güncellenen ürün: ${updatedCount}`);
  console.log(`Yeni eklenen ürün: ${addedCount}`);
  console.log(`Görsel bulunan yeni ürün: ${imageFoundCount}`);
  console.log(`Toplam ürün sayısı: ${existingProducts.length}`);
}

main().catch(console.error);

