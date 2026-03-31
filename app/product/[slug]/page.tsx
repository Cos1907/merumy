import type { Metadata } from 'next'
import { getProductBySlug, getProductsByCategory, type Product } from '../../lib/products'
import { query } from '../../lib/db'
import { notFound } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductClient from './ProductClient'

// Her istekte canlı DB verisi kullan, önbelleğe alma
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getProductFromDB(slug: string): Promise<Product | null> {
  try {
    const rows = await query<any[]>(
      `SELECT 
         p.id, p.name, p.slug, p.price,
         p.compare_price AS originalPrice,
         p.description,
         COALESCE(p.stock, 0) AS stock,
         p.stock_status,
         COALESCE(p.barcode, '') AS barcode,
         COALESCE(p.category, '') AS category,
         COALESCE(b.name, '') AS brand,
         COALESCE(pi.image_url, '') AS image
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
       WHERE p.slug = ?
       LIMIT 1`,
      [slug]
    )
    if (!rows || rows.length === 0) return null
    const r = rows[0]
    return {
      id: String(r.id),
      name: r.name || '',
      slug: r.slug || slug,
      brand: r.brand || '',
      category: r.category || '',
      price: Number(r.price) || 0,
      originalPrice: r.originalPrice ? Number(r.originalPrice) : null,
      image: r.image || '',
      description: r.description || '',
      inStock: r.stock_status === 'in_stock' || (Number(r.stock) > 0),
      barcode: r.barcode || '',
      stock: Number(r.stock) || 0,
      rating: 0,
      reviews: 0,
      sold: 0,
    }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params
  const product = (await getProductFromDB(slug)) || (getProductBySlug(slug) ?? null)
  if (!product) return { title: 'Ürün Bulunamadı | Merumy' }

  const title = product.name
  const description =
    product.description
      ? product.description.slice(0, 160)
      : `${product.brand} - ${product.name} | Merumy K-Beauty`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://merumy.com/product/${slug}`,
      type: 'website',
      ...(product.image && {
        images: [{ url: `https://merumy.com${product.image}`, alt: product.name }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://merumy.com/product/${slug}`,
    },
  }
}

async function getRelatedFromDB(productId: string, category: string, brand: string): Promise<Product[]> {
  try {
    const rows = await query<any[]>(
      `SELECT 
         p.id, p.name, p.slug, p.price,
         p.compare_price AS originalPrice,
         p.description,
         COALESCE(p.stock, 0) AS stock,
         p.stock_status,
         COALESCE(p.category, '') AS category,
         COALESCE(b.name, '') AS brand,
         COALESCE(pi.image_url, '') AS image
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
       WHERE p.id != ?
         AND p.stock_status = 'in_stock'
         AND (
           (b.name = ? AND ? != '')
           OR (p.category = ? AND ? != '')
         )
       ORDER BY (b.name = ?) DESC, RAND()
       LIMIT 8`,
      [productId, brand, brand, category, category, brand]
    )
    return rows.map((r) => ({
      id: String(r.id),
      name: r.name || '',
      slug: r.slug || '',
      brand: r.brand || '',
      category: r.category || '',
      price: Number(r.price) || 0,
      originalPrice: r.originalPrice ? Number(r.originalPrice) : null,
      image: r.image || '',
      description: r.description || '',
      inStock: r.stock_status === 'in_stock' || Number(r.stock) > 0,
      barcode: '',
      stock: Number(r.stock) || 0,
      rating: 0,
      reviews: 0,
      sold: 0,
    }))
  } catch {
    return []
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  // 1. Her zaman önce DB'den çek (admin güncellemeleri anlık yansısın)
  let product: Product | null = await getProductFromDB(slug)

  // 2. DB'de yoksa JSON'dan dene (fallback)
  if (!product) {
    product = getProductBySlug(slug) ?? null
  }

  if (!product) {
    notFound()
  }

  // İlgili ürünler: önce JSON'dan aynı kategori/marka, eksik kalan için DB'den tamamla
  const jsonRelated = getProductsByCategory(product!.category)
    .filter((p) => p.id !== product!.id && p.inStock)
    .sort((a, b) => (a.brand === product!.brand ? -1 : 0) - (b.brand === product!.brand ? -1 : 0))
    .slice(0, 4)

  let relatedProducts: Product[] = jsonRelated

  if (jsonRelated.length < 4) {
    const existingIds = new Set(jsonRelated.map((p) => p.id))
    const dbRelated = await getRelatedFromDB(product!.id, product!.category, product!.brand)
    const extra = dbRelated
      .filter((p) => !existingIds.has(p.id))
      .slice(0, 4 - jsonRelated.length)
    relatedProducts = [...jsonRelated, ...extra]
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>
      <ProductClient product={product!} relatedProducts={relatedProducts} />
      <Footer />
    </main>
  )
}
