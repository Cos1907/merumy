const fs = require('fs');

const paths = ['./app/data/products.json', './data/products.json'];

// Kapatılacak ürünler - daha spesifik arama
const productsToClose = [
  'retinal shot tightening booster krem',
  'vitamin c (%23',
  'vitamin c (23',
  'age-r booster pro head',
  'pdrn booster gel',
  'hyaluronic acid eye gel patch',
  'centella bubble cleansing',
  'arencia cloud sun',
  'arencia sun stick'
];

let updated = 0;
const updatedProducts = [];

paths.forEach(p => {
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    data.forEach(prod => {
      const nameLower = (prod.name || '').toLowerCase();
      
      const matchesProduct = productsToClose.some(keyword => nameLower.includes(keyword));
      
      if (matchesProduct && prod.inStock !== false) {
        prod.stock = 0;
        prod.inStock = false;
        updated++;
        updatedProducts.push(`[${prod.brand}] ${prod.name}`);
        console.log('Stok kapatıldı:', prod.name);
      }
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
    console.log('Kaydedildi:', p);
  }
});

console.log('\n=== ÖZET ===');
console.log('Toplam kapatılan ürün:', updated);
console.log('\nKapatılan ürünler:');
updatedProducts.forEach((p, i) => console.log(`${i+1}. ${p}`));



