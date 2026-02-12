import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { getProductBySlug } from '../../../lib/products'

function isImageFile(fileName: string) {
  const lower = fileName.toLowerCase()
  return (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.gif')
  )
}

function sortNaturally(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

// Dosya adından uzantıyı kaldır ve base name al
function getBaseFileName(fileName: string): string {
  // Uzantıyı kaldır
  const withoutExt = fileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
  
  // Eğer dosya adı tamamen sayı ise (barkod), olduğu gibi döndür
  if (/^\d+$/.test(withoutExt)) {
    return withoutExt
  }
  
  // Değilse, sondaki -1, -2, _1, _2 gibi numaralandırmaları kaldır
  // Ama sadece tire veya alt çizgi ile ayrılmış sayıları kaldır
  return withoutExt.replace(/[-_]\d+$/, '')
}

// İki dosya adının aynı ürüne ait olup olmadığını kontrol et
function isSameProductImage(mainFileName: string, otherFileName: string): boolean {
  // Uzantıları kaldır
  const mainWithoutExt = mainFileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
  const otherWithoutExt = otherFileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
  
  // Tam eşleşme
  if (mainWithoutExt === otherWithoutExt) return true
  
  // Eğer ana dosya adı tamamen sayıysa (barkod), sadece tam eşleşme veya 
  // aynı barkod ile başlayan varyasyonları kabul et (örn: "8809552278125" ve "8809552278125-2")
  if (/^\d+$/.test(mainWithoutExt)) {
    // Diğer dosya ana barkod ile başlamalı ve ardından - veya _ ile bir sayı gelmeli
    // Örnek: 8809552278125.jpg ile 8809552278125-2.jpg eşleşir
    // Ama 8809552278125.jpg ile 8809552278126.jpg eşleşMEZ
    const pattern = new RegExp(`^${mainWithoutExt}[-_]\\d+$`)
    return pattern.test(otherWithoutExt)
  }
  
  // Sayısal olmayan dosya adları için base name karşılaştırması yap
  const mainBase = getBaseFileName(mainFileName)
  const otherBase = getBaseFileName(otherFileName)
  
  return mainBase === otherBase
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug') || ''
    if (!slug) return NextResponse.json({ images: [] }, { status: 400 })

    const product = getProductBySlug(slug)
    if (!product?.image) return NextResponse.json({ images: [] }, { status: 404 })

    // image: "/urun-gorselleri/<folder>/<file>"
    const webPath = product.image
    const pathParts = webPath.split('/')
    const mainFileName = pathParts.pop() || ''
    const folderWeb = pathParts.join('/')
    const folderFs = path.join(process.cwd(), 'public', folderWeb)

    let files: string[] = []
    try {
      files = await fs.readdir(folderFs)
    } catch {
      // fallback: only the main image
      return NextResponse.json({ images: [webPath] }, { status: 200 })
    }

    // Sadece bu ürüne ait görselleri filtrele
    const productImages = files
      .filter(isImageFile)
      .filter((f) => isSameProductImage(mainFileName, f))
      .sort(sortNaturally)
      .map((f) => `${folderWeb}/${encodeURIComponent(f)}`)

    // Eğer hiç eşleşen görsel bulunamadıysa, sadece ana görseli döndür
    if (productImages.length === 0) {
      return NextResponse.json({ images: [webPath] }, { status: 200 })
    }

    // Ana görselin ilk sırada olduğundan emin ol
    const mainEncoded = `${folderWeb}/${encodeURIComponent(mainFileName)}`
    const dedup = [mainEncoded, ...productImages].filter((v, i, arr) => arr.indexOf(v) === i)

    return NextResponse.json({ images: dedup }, { status: 200 })
  } catch {
    return NextResponse.json({ images: [] }, { status: 500 })
  }
}
