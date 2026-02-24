const fs = require('fs');

const paths = ['./app/data/products.json', './data/products.json'];

// Kapatılacak ürünler (küçük harfe çevrilecek ve içinde arama yapılacak)
const productsToClose = [
  'pdrn pink glutathione serum mist',
  'pdrn pink peptide eye cream',
  'pdrn booster gel 300',
  'vitamin c %23 serum',
  'vitamin c 23 serum',
  'the 6 peptide skin booster',
  'pure grinding cleansing balm',
  'arencia cloud sun stick',
  'moisture hand cream lavender',
  'iunik centella bubble cleansing',
  'mizon hyaluronic acid eye gel patch',
  'milk thistle repair cica',
  '1025 dokdo cleanser',
  'deep vita c capsule',
  'age-r başlık',
  'age r başlık',
  'booster pro başlık',
  'birch juice moisturizing sunscreen',
  'retinal shot tightening booster krem 15ml',
  'retinal shot tightening booster krem) 15ml'
];

// Nard markası için ayrı kontrol
const brandsToClose = ['nard'];

let updated = 0;
const updatedProducts = [];

paths.forEach(p => {
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    data.forEach(prod => {
      const nameLower = (prod.name || '').toLowerCase();
      const brandLower = (prod.brand || '').toLowerCase();
      
      // Ürün adı kontrolü
      const matchesProduct = productsToClose.some(keyword => nameLower.includes(keyword));
      
      // Marka kontrolü (Nard)
      const matchesBrand = brandsToClose.some(brand => brandLower === brand);
      
      if ((matchesProduct || matchesBrand) && prod.inStock !== false) {
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



