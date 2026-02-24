const fs = require('fs');
const path = require('path');

// Stoğu kapatılacak barkodlar
const barcodesToClose = [
  '8809672282637', // Ampoule (Cilt Bariyer)
  '8809672283924', // Gel Cleanser
  '8809672284105', // ImPHYTO Jericho Gülü
  '8809672283611', // ImPHYTO Kolajen Maske
  '8809672281869', // Milk Sponge Köpük Maske
  '8809672284471', // Nutrition Ampoule Pad
  '8809672284464', // Teca Cooling Pad
  '8809672284457', // Vita Blemish Pad
  '8809242199303', // Mediu Amino Ac-Free
  '8809672285263', // PDRN Somon DNA Ped
  '8809672285249', // PDRN UV Daily Rose Dudak Balmı
];

// Her iki products.json dosyasını güncelle
const files = [
  path.join(__dirname, 'app/data/products.json'),
  path.join(__dirname, 'data/products.json')
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`Dosya bulunamadı: ${filePath}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updatedCount = 0;

  data.forEach(product => {
    if (barcodesToClose.includes(product.barcode)) {
      product.stock = 0;
      product.inStock = false;
      console.log(`[${path.basename(filePath)}] Stok kapatıldı: ${product.name} (${product.barcode})`);
      updatedCount++;
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n${path.basename(filePath)}: ${updatedCount} ürün güncellendi.\n`);
});

console.log('JSON dosyaları güncellendi. MySQL güncellemesi için SSH ile sunucuya bağlanmanız gerekiyor.');


