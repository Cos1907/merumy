// Import JSON files - Next.js supports JSON imports with resolveJsonModule
import productsData from '../data/products.json'
import categoriesData from '../data/categories.json'

export interface Product {
  id: string
  code?: string
  slug: string
  name: string
  brand: string
  category: string
  categoryDisplay?: string
  subcategory?: string
  price: number
  originalPrice: number | null
  image: string
  barcode: string
  rating?: number
  reviews?: number
  sold?: number
  stock?: number
  inStock: boolean
  isKoreTrend?: boolean
  description: string
}

export interface Category {
  name: string
  subcategories: string[]
  productCount: number
}

export const products: Product[] = productsData as Product[]
export const categories: Record<string, Category> = categoriesData as Record<string, Category>

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug || p.id === slug)
}

export function getProductsByCategory(category: string): Product[] {
  const lowerCategory = category.toLowerCase()
  return products.filter(p => p.category?.toLowerCase() === lowerCategory)
}

// Makyaj kategorisindeki ürünleri getir (random)
export function getMakeupProducts(limit: number = 12): Product[] {
  const makeupProducts = products.filter(p => 
    p.category?.toLowerCase() === 'makyaj' && p.inStock
  )
  const shuffled = [...makeupProducts].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, limit)
}

export function getProductsByBrand(brand: string): Product[] {
  return products.filter(p => p.brand === brand)
}

export function getFeaturedProducts(limit: number = 8): Product[] {
  return products
    .filter(p => p.inStock)
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, limit)
}

// Kore Trendleri ürünlerini rastgele getir
export function getKoreTrendProducts(limit: number = 8): Product[] {
  const koreTrends = products.filter(p => p.isKoreTrend && p.inStock)
  // Shuffle array
  const shuffled = [...koreTrends].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, limit)
}

// Stokta olan ürünleri rastgele getir
export function getRandomProducts(limit: number = 8): Product[] {
  const inStockProducts = products.filter(p => p.inStock)
  const shuffled = [...inStockProducts].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, limit)
}

export function getNewProducts(limit: number = 8): Product[] {
  return products
    .filter(p => p.inStock)
    .sort((a, b) => parseInt(b.id) - parseInt(a.id))
    .slice(0, limit)
}

export function getProductsBySubcategory(category: string, subcategory: string): Product[] {
  return products.filter(p => p.category === category && p.subcategory === subcategory)
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase()
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.brand.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery)
  )
}

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function findProductByQuery(query: string): Product | undefined {
  const q = normalizeText(query)
  if (!q) return undefined
  const tokens = q.split(' ').filter(Boolean)

  let best: { p: Product; score: number } | null = null
  for (const p of products) {
    const hay = normalizeText(`${p.brand} ${p.name}`)
    let score = 0
    for (const t of tokens) {
      if (hay.includes(t)) score++
    }
    if (score === 0) continue
    if (!best || score > best.score) best = { p, score }
  }
  return best?.p
}

export function pickProductsByQueries(queries: string[]): Product[] {
  const picked: Product[] = []
  const seen = new Set<string>()
  for (const q of queries) {
    const p = findProductByQuery(q)
    if (p && !seen.has(p.id)) {
      picked.push(p)
      seen.add(p.id)
    }
  }
  return picked
}

// Koleksiyon sayfaları için ürünleri getir
export function getProductsByCollection(collectionSlug: string): Product[] {
  switch (collectionSlug) {
    case 'kore-trendleri':
      // Kore Trendleri - isKoreTrend true olanlar
      return products.filter(p => p.isKoreTrend === true)
    case 'en-cok-satanlar':
      // En Çok Satanlar - satış sayısına göre sıralanmış
      return [...products]
        .sort((a, b) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 50)
    case 'merumy-com-a-ozel':
      // Merumy.com'a Özel - rastgele 50 ürün
      const shuffled = [...products].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, 50)
    default:
      return []
  }
}

