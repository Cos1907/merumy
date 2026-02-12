const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function parsePrice(priceStr) {
  if (!priceStr || priceStr === '' || priceStr === null || priceStr === undefined) {
    return null;
  }
  // Remove currency symbols and spaces, replace comma with dot
  const cleaned = String(priceStr).trim()
    .replace(/TRY/gi, '')
    .replace(/,/g, '.')
    .replace(/"/g, '')
    .replace(/₺/g, '')
    .trim();
  try {
    const price = parseFloat(cleaned);
    return isNaN(price) ? null : price;
  } catch {
    return null;
  }
}

function cleanText(text) {
  if (!text || text === null || text === undefined) {
    return '';
  }
  return String(text).split(/\s+/).join(' ').trim();
}

function generateSlug(productCode, productName) {
  let slug = productName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
  slug = slug.split('').filter(c => /[a-z0-9-]/.test(c)).join('').substring(0, 50);
  return `${productCode}-${slug}`;
}

// Read Excel file
const excelPath = path.join(__dirname, '..', 'kbeauty', 'Merumy E-ticaret.xlsx');

if (!fs.existsSync(excelPath)) {
  console.error(`Error: Excel file not found at ${excelPath}`);
  process.exit(1);
}

console.log(`Reading Excel file: ${excelPath}`);

const workbook = XLSX.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

console.log(`Found ${data.length} rows`);

if (data.length === 0) {
  console.error('No data found in Excel file');
  process.exit(1);
}

// First row is headers
const headers = data[0].map(h => String(h || '').toLowerCase());
console.log(`Columns: ${headers.slice(0, 10).join(', ')}...`);

// Find column indices
let urunKoduCol = null;
let urunAdiCol = null;
let barkodCol = null;
let markaCol = null;
let kategoriCol = null; // Ozellik04Adi
let altKategoriCol = null; // Ozellik05Adi
let fiyatCol = null;
let gorselCol = null;

headers.forEach((header, index) => {
  const h = String(header || '').toLowerCase();
  if (h.includes('urunkodu') || (h.includes('urun') && h.includes('kod'))) {
    urunKoduCol = index;
  } else if (h.includes('urunadi') || (h.includes('urun') && h.includes('adi') && !h.includes('ozellik'))) {
    urunAdiCol = index;
  } else if (h.includes('barkod') && !h.includes('tipi')) {
    barkodCol = index;
  } else if (h.includes('ozellik03adi') || h.includes('ozellik 03') || h.includes('özellik03')) {
    markaCol = index; // Brand is in Ozellik03Adi
  } else if (h.includes('ozellik04adi') || h.includes('ozellik 04') || h.includes('özellik04')) {
    kategoriCol = index; // Main category
  } else if (h.includes('ozellik05adi') || h.includes('ozellik 05') || h.includes('özellik05')) {
    altKategoriCol = index; // Subcategory
  } else if (h.includes('perakende') && h.includes('fiyat')) {
    fiyatCol = index; // Retail price
  } else if (h.includes('gorsel') || h.includes('image') || h.includes('resim')) {
    gorselCol = index;
  }
});

console.log(`\nColumn mapping:`);
console.log(`  UrunKodu: ${urunKoduCol} (${headers[urunKoduCol] || 'NOT FOUND'})`);
console.log(`  UrunAdi: ${urunAdiCol} (${headers[urunAdiCol] || 'NOT FOUND'})`);
console.log(`  Barkod: ${barkodCol} (${headers[barkodCol] || 'NOT FOUND'})`);
console.log(`  Marka: ${markaCol} (${headers[markaCol] || 'NOT FOUND'})`);
console.log(`  Kategori (Ozellik04Adi): ${kategoriCol} (${headers[kategoriCol] || 'NOT FOUND'})`);
console.log(`  Alt Kategori (Ozellik05Adi): ${altKategoriCol} (${headers[altKategoriCol] || 'NOT FOUND'})`);
console.log(`  Fiyat: ${fiyatCol} (${headers[fiyatCol] || 'NOT FOUND'})`);
console.log(`  Görsel: ${gorselCol} (${headers[gorselCol] || 'NOT FOUND'})`);

const products = [];
const categories = {};
const brands = {};

// Process rows (skip header row)
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  
  try {
    const productCode = urunKoduCol !== null ? cleanText(row[urunKoduCol]) : '';
    const productName = urunAdiCol !== null ? cleanText(row[urunAdiCol]) : '';
    
    if (!productCode || !productName) {
      continue;
    }
    
    const barcode = barkodCol !== null ? cleanText(row[barkodCol]) : '';
    const brandName = markaCol !== null ? cleanText(row[markaCol]) : 'Merumy';
    const categoryName = kategoriCol !== null ? cleanText(row[kategoriCol]) : 'Genel';
    const subcategoryName = altKategoriCol !== null ? cleanText(row[altKategoriCol]) : '';
    const price = fiyatCol !== null ? parsePrice(row[fiyatCol]) : null;
    const imageLink = gorselCol !== null ? cleanText(row[gorselCol]) : '';
    
    const finalPrice = price || 0;
    const slug = generateSlug(productCode, productName);
    
    const product = {
      id: productCode,
      code: productCode,
      slug: slug,
      name: productName,
      brand: brandName || 'Merumy',
      category: categoryName || 'Genel',
      subcategory: subcategoryName || '',
      price: finalPrice,
      originalPrice: null,
      image: imageLink || '/images/product-placeholder.png',
      barcode: barcode,
      rating: parseFloat((4.0 + (Math.abs(hashCode(productCode)) % 10) / 10).toFixed(1)),
      reviews: (Math.abs(hashCode(productCode)) % 500) + 10,
      sold: (Math.abs(hashCode(productCode)) % 1000) + 50,
      inStock: true,
      description: `${productName} - ${brandName} markasından kaliteli ${categoryName} ürünü.`
    };
    
    products.push(product);
    
    // Track categories
    if (categoryName && categoryName !== 'Genel') {
      if (!categories[categoryName]) {
        categories[categoryName] = {
          name: categoryName,
          subcategories: new Set(),
          products: []
        };
      }
      categories[categoryName].products.push(product);
      if (subcategoryName) {
        categories[categoryName].subcategories.add(subcategoryName);
      }
    }
    
    // Track brands
    if (brandName && brandName !== 'Merumy') {
      if (!brands[brandName]) {
        brands[brandName] = [];
      }
      brands[brandName].push(product);
    }
  } catch (error) {
    console.error(`Error processing row ${i + 1}: ${error.message}`);
    continue;
  }
}

// Convert sets to arrays for JSON
const categoriesData = {};
for (const [key, value] of Object.entries(categories)) {
  categoriesData[key] = {
    name: value.name,
    subcategories: Array.from(value.subcategories),
    productCount: value.products.length
  };
}

const brandsData = {};
for (const [key, value] of Object.entries(brands)) {
  brandsData[key] = value.length;
}

// Save products data - save to both locations for compatibility
const outputDir = path.join(__dirname, '..', 'data');
const appDataDir = path.join(__dirname, '..', 'app', 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(appDataDir)) {
  fs.mkdirSync(appDataDir, { recursive: true });
}

// Write to both locations
const writeFiles = (dir) => {
  fs.writeFileSync(
    path.join(dir, 'products.json'),
    JSON.stringify(products, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(dir, 'categories.json'),
    JSON.stringify(categoriesData, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(dir, 'brands.json'),
    JSON.stringify(brandsData, null, 2),
    'utf8'
  );
};

writeFiles(outputDir);
writeFiles(appDataDir);

console.log(`\n✅ Parsed ${products.length} products`);
console.log(`✅ Found ${Object.keys(categoriesData).length} categories`);
console.log(`✅ Found ${Object.keys(brandsData).length} brands`);
console.log(`\nTop categories:`);
Object.entries(categoriesData)
  .sort((a, b) => b[1].productCount - a[1].productCount)
  .slice(0, 10)
  .forEach(([catName, catData]) => {
    console.log(`  - ${catName}: ${catData.productCount} products`);
  });

// Simple hash function for generating consistent ratings/reviews
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

