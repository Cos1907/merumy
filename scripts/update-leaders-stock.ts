import fs from 'fs'
import path from 'path'

const PRODUCTS_PATH = path.join(process.cwd(), 'data', 'products.json')
const CSV_PATH = path.join(process.cwd(), 'public', 'markalar', 'urunler.csv')

// Leaders barkod listesi (CSV'den alındı)
const leadersBarcodes = [
  '8809672284501', '8809672284631', '8809672284488', '8809672282637', '8809672282644',
  '8809672282620', '8809672283696', '8809672283924', '8809672283697', '8809672283698',
  '8809483318754', '8809483318914', '8809672282897', '8809672284570', '8809672283917',
  '8809672283979', '8809672283981', '8809672283982', '8809672283610', '8809672282699',
  '8809672283611', '8809672284105', '8809672282712', '8809672282705', '8809672281517',
  '8809672281518', '8809672281519', '8809672281520', '8809672284525', '8809672281869',
  '8809672284327', '8809672284099', '8809672284100', '8809672284101', '8809672284102',
  '8809672284103', '8809672284471', '8809672284440', '8809672280589', '8809672283672',
  '8809672282804', '8809672284587', '8809672284464', '8809672284617', '8809672284457',
  '8809672284549', '8809242199303', '8809242199327', '8809242199328', '8809242199329',
  '8809242199330', '8809672285263', '8809672285264', '8809672283699', '8809672283918',
  '8809672282477', '8809672282460', '8809672282491', '8809672283566', '8809672285249',
  '8809672284211'
]

async function updateLeadersStock() {
  console.log('Leaders ürünlerinin stoku 0 yapılıyor...\n')

  // 1. products.json güncelle
  try {
    const productsData = fs.readFileSync(PRODUCTS_PATH, 'utf-8')
    const products = JSON.parse(productsData)
    
    let updatedCount = 0
    products.forEach((product: any) => {
      if (leadersBarcodes.includes(product.barcode)) {
        product.inStock = false
        product.stock = 0
        updatedCount++
        console.log(`✓ ${product.name} - stok: 0`)
      }
    })

    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2))
    console.log(`\n✅ products.json güncellendi: ${updatedCount} ürün`)
  } catch (error) {
    console.error('❌ products.json güncellenemedi:', error)
  }

  // 2. urunler.csv güncelle
  try {
    const csvData = fs.readFileSync(CSV_PATH, 'utf-8')
    const lines = csvData.split('\n')
    
    const updatedLines = lines.map((line, index) => {
      if (index === 0) return line // Header
      
      const columns = line.split(',')
      const barcode = columns[0]
      
      if (leadersBarcodes.includes(barcode)) {
        // Son sütun stok
        columns[columns.length - 1] = '0'
        return columns.join(',')
      }
      return line
    })

    fs.writeFileSync(CSV_PATH, updatedLines.join('\n'))
    console.log('✅ urunler.csv güncellendi')
  } catch (error) {
    console.error('❌ urunler.csv güncellenemedi:', error)
  }

  console.log('\n✅ Leaders stok güncellemesi tamamlandı!')
}

updateLeadersStock()

