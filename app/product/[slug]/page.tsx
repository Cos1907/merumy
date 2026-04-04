import type { Metadata } from 'next'
import { type Product } from '../../lib/products'
import { query } from '../../lib/db'
import { notFound } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ProductClient from './ProductClient'

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
         COALESCE(
           (SELECT pi2.image_url FROM product_images pi2 WHERE pi2.product_id = p.id AND pi2.is_primary = 1 LIMIT 1),
           (SELECT pi3.image_url FROM product_images pi3 WHERE pi3.product_id = p.id LIMIT 1),
           ''
         ) AS image
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
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
  const product = await getProductFromDB(slug)
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
         COALESCE(
           (SELECT pi2.image_url FROM product_images pi2 WHERE pi2.product_id = p.id AND pi2.is_primary = 1 LIMIT 1),
           (SELECT pi3.image_url FROM product_images pi3 WHERE pi3.product_id = p.id LIMIT 1),
           ''
         ) AS image
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
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

  // Her zaman DB'den çek - JSON fallback yok
  const product: Product | null = await getProductFromDB(slug)
  if (!product) {
    notFound()
  }

  // İlgili ürünler: tamamı DB'den çek (aynı marka veya kategori)
  const relatedProducts: Product[] = await getRelatedFromDB(product!.id, product!.category, product!.brand)

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
