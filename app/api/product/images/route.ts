import { NextResponse } from 'next/server'
import { getProductBySlug } from '../../../lib/products'
import { query } from '../../../lib/db'

// ── DB'den ürün görsellerini çek ──────────────────────────────────────────────
async function getImagesFromDB(slug: string): Promise<string[]> {
  try {
    const rows = await query<{ image_url: string }[]>(
      `SELECT pi.image_url
       FROM product_images pi
       JOIN products p ON p.id = pi.product_id
       WHERE p.slug = ?
       ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC`,
      [slug]
    )
    return rows.map((r) => r.image_url).filter(Boolean)
  } catch {
    return []
  }
}

// ── Filesystem fallback helpers ────────────────────────────────────────────────
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

function getBaseFileName(fileName: string): string {
  const withoutExt = fileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
  if (/^\d+$/.test(withoutExt)) return withoutExt
  return withoutExt.replace(/[-_]\d+$/, '')
}

function isSameProductImage(mainFileName: string, otherFileName: string): boolean {
  const mainWithoutExt = mainFileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
  const otherWithoutExt = otherFileName.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
  if (mainWithoutExt === otherWithoutExt) return true
  if (/^\d+$/.test(mainWithoutExt)) {
    const pattern = new RegExp(`^${mainWithoutExt}[-_]\\d+$`)
    return pattern.test(otherWithoutExt)
  }
  return getBaseFileName(mainFileName) === getBaseFileName(otherFileName)
}

// ── API Handler ────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug') || ''
    if (!slug) return NextResponse.json({ images: [] }, { status: 400 })

    // 1. JSON'dan ürünü dene
    const product = getProductBySlug(slug)

    // 2. Eğer JSON'da yoksa DB'den görselleri çek
    if (!product?.image) {
      const dbImages = await getImagesFromDB(slug)
      if (dbImages.length > 0) {
        return NextResponse.json({ images: dbImages }, { status: 200 })
      }
      return NextResponse.json({ images: [] }, { status: 404 })
    }

    // 3. DB'den tüm görselleri çek (primary + galeri)
    const dbImages = await getImagesFromDB(slug)
    if (dbImages.length > 0) {
      return NextResponse.json({ images: dbImages }, { status: 200 })
    }

    // 4. DB'de görsel yoksa filesystem'den tara
    const { default: fs } = await import('fs/promises')
    const { default: path } = await import('path')

    const webPath = product.image
    const pathParts = webPath.split('/')
    const mainFileName = pathParts.pop() || ''
    const folderWeb = pathParts.join('/')
    const folderFs = path.join(process.cwd(), 'public', folderWeb)

    let files: string[] = []
    try {
      files = await fs.readdir(folderFs)
    } catch {
      return NextResponse.json({ images: [webPath] }, { status: 200 })
    }

    const productImages = files
      .filter(isImageFile)
      .filter((f) => isSameProductImage(mainFileName, f))
      .sort(sortNaturally)
      .map((f) => `${folderWeb}/${encodeURIComponent(f)}`)

    if (productImages.length === 0) {
      return NextResponse.json({ images: [webPath] }, { status: 200 })
    }

    const mainEncoded = `${folderWeb}/${encodeURIComponent(mainFileName)}`
    const dedup = [mainEncoded, ...productImages].filter((v, i, arr) => arr.indexOf(v) === i)

    return NextResponse.json({ images: dedup }, { status: 200 })
  } catch {
    return NextResponse.json({ images: [] }, { status: 500 })
  }
}
