const fs = require('fs');

const paths = ['./app/data/products.json', './data/products.json'];
let updated = 0;

paths.forEach(p => {
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    data.forEach(prod => {
      if (prod.brand && prod.brand.toLowerCase() === 'leaders') {
        prod.stock = 0;
        prod.inStock = false;
        updated++;
        console.log('Updated:', prod.name);
      }
    });
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
    console.log('Saved:', p);
  }
});

console.log('Total updated:', updated);



