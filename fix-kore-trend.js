const fs = require('fs');

// CSV dosyasını oku
const csvPath = '/Users/huseyinkulekci/Downloads/Merumy Ürün Açıklamaları (11.02.2026).xlsx - Sayfa1.csv';
const productsPath = '/Users/huseyinkulekci/Downloads/merumy_final_version/merumy-full/data/products.json';

// CSV'yi satır satır oku ve barkod -> kore trendleri map'i oluştur
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

const koreTrendMap = new Map();

// İlk satır header, atla
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Barkod ile başlayan satır mı?
  const barcodeMatch = line.match(/^_?(\d{10,14})-?,/);
  if (barcodeMatch) {
    const barcode = barcodeMatch[1];
    
    // İkinci sütunu kontrol et (Kore Trendleri)
    const parts = line.split(',');
    const koreValue = parts[1] ? parts[1].trim() : '';
    
    if (koreValue.toLowerCase().includes('kore')) {
      koreTrendMap.set(barcode, true);
      console.log(`Kore Trend: ${barcode}`);
    }
  }
}

console.log(`\nToplam ${koreTrendMap.size} Kore Trendleri ürünü bulundu.\n`);

// Products JSON'u oku
const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Her ürün için isKoreTrend değerini güncelle
let updated = 0;
for (const product of products) {
  const barcode = product.barcode || product.id;
  if (koreTrendMap.has(barcode)) {
    product.isKoreTrend = true;
    updated++;
  } else {
    product.isKoreTrend = false;
  }
}

console.log(`${updated} ürün Kore Trendleri olarak işaretlendi.\n`);

// JSON'u kaydet
fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log(`${productsPath} güncellendi.`);

// app/data/products.json'u da güncelle
const appProductsPath = '/Users/huseyinkulekci/Downloads/merumy_final_version/merumy-full/app/data/products.json';
fs.writeFileSync(appProductsPath, JSON.stringify(products, null, 2));
console.log(`${appProductsPath} güncellendi.`);





