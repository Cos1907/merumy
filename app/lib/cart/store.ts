import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import type { Product } from '../products'
import { products } from '../products'
import { getSessionUser } from '../auth/session'

export const CART_COOKIE_NAME = 'merumy_cart_id'

export type CartLine = {
  productId: string
  quantity: number
  updatedAt: number
  expiresAt: number
  productSnapshot?: Product // DB-only ürünler için snapshot
}

export type Cart = {
  key: string
  lines: CartLine[]
  promoCode?: string
  // DB'den gelen kupon detayları (hardcode'dan kurtulmak için)
  promoType?: 'amount' | 'percent'
  promoValue?: number    // fixed indirim TL veya yüzde değeri
  promoMinAmount?: number // minimum sepet tutarı
}

const TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 gün (süresiz)
const MAX_QUANTITY_PER_ITEM = 10 // Ürün başına maksimum adet

// File-based cart storage for persistence
const DATA_DIR = path.join(process.cwd(), 'data')
const CARTS_FILE = path.join(DATA_DIR, 'carts.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadCarts(): Map<string, Cart> {
  ensureDataDir()
  try {
    if (fs.existsSync(CARTS_FILE)) {
      const data = fs.readFileSync(CARTS_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      return new Map(Object.entries(parsed))
    }
  } catch (e) {
    console.error('Error loading carts:', e)
  }
  return new Map()
}

function saveCarts(carts: Map<string, Cart>) {
  ensureDataDir()
  try {
    const obj: Record<string, Cart> = {}
    carts.forEach((value, key) => {
      obj[key] = value
    })
    fs.writeFileSync(CARTS_FILE, JSON.stringify(obj, null, 2))
  } catch (e) {
    console.error('Error saving carts:', e)
  }
}

// Load carts from file on startup
let carts = loadCarts()

export function createCartId() {
  return crypto.randomBytes(16).toString('hex')
}

export function getCartKey(cartId: string) {
  const user = getSessionUser()
  if (user?.id) {
    // Giriş yapmış kullanıcı → sadece userId bazlı (cihazdan bağımsız, hesaba bağlı)
    return `user:${user.id}`
  }
  // Misafir → tarayıcıya özel sepet
  return `guest:${cartId}`
}

// Misafir cart key'i direkt al (login sırasında merge için)
export function getGuestCartKey(cartId: string) {
  return `guest:${cartId}`
}

// Kullanıcı cart key'i direkt al (herhangi bir cihazdan erişilebilir)
export function getUserCartKey(userId: string) {
  return `user:${userId}`
}

function pruneExpired(lines: CartLine[]) {
  // Süre limitini kaldırdık - sadece sıfır miktarlıları temizle
  return lines.filter((l) => l.quantity > 0)
}

export function readCart(cartKey: string): Cart {
  // Reload from file to get latest data
  carts = loadCarts()
  
  const existing = carts.get(cartKey)
  if (!existing) {
    const empty: Cart = { key: cartKey, lines: [], promoCode: undefined }
    carts.set(cartKey, empty)
    saveCarts(carts)
    return empty
  }
  const pruned = pruneExpired(existing.lines)
  if (pruned.length !== existing.lines.length) {
    const next = { ...existing, lines: pruned }
    carts.set(cartKey, next)
    saveCarts(carts)
    return next
  }
  return existing
}

export function clearCart(cartKey: string) {
  carts.set(cartKey, { key: cartKey, lines: [], promoCode: undefined })
  saveCarts(carts)
}

export function removeLine(cartKey: string, productId: string) {
  const cart = readCart(cartKey)
  carts.set(cartKey, { ...cart, lines: cart.lines.filter((l) => l.productId !== productId) })
  saveCarts(carts)
}

export type PromoDetails = {
  type: 'amount' | 'percent'
  value: number
  minAmount?: number
}

/**
 * DB'den doğrulanmış kupon detaylarıyla promo set eder.
 * Artık hardcoded liste yok — cart/route.ts DB'den doğrular ve buraya gönderir.
 */
export function setPromo(cartKey: string, code: string, details: PromoDetails) {
  const cart = readCart(cartKey)
  carts.set(cartKey, {
    ...cart,
    promoCode: code.toUpperCase(),
    promoType: details.type,
    promoValue: details.value,
    promoMinAmount: details.minAmount,
  })
  saveCarts(carts)
}

export function clearPromo(cartKey: string) {
  const cart = readCart(cartKey)
  carts.set(cartKey, {
    ...cart,
    promoCode: undefined,
    promoType: undefined,
    promoValue: undefined,
    promoMinAmount: undefined,
  })
  saveCarts(carts)
}

export function setQuantity(cartKey: string, productId: string, quantity: number, productSnapshot?: Product) {
  const cart = readCart(cartKey)
  const now = Date.now()
  const expiresAt = now + TTL_MS

  if (quantity <= 0) {
    removeLine(cartKey, productId)
    return
  }

  // Maksimum adet sınırı
  const finalQuantity = Math.min(quantity, MAX_QUANTITY_PER_ITEM)

  const existing = cart.lines.find((l) => l.productId === productId)
  if (existing) {
    const next = cart.lines.map((l) =>
      l.productId === productId
        ? { ...l, quantity: finalQuantity, updatedAt: now, expiresAt, ...(productSnapshot ? { productSnapshot } : {}) }
        : l
    )
    carts.set(cartKey, { ...cart, lines: next })
    saveCarts(carts)
    return
  }

  carts.set(cartKey, {
    ...cart,
    lines: [...cart.lines, { productId, quantity: finalQuantity, updatedAt: now, expiresAt, ...(productSnapshot ? { productSnapshot } : {}) }],
  })
  saveCarts(carts)
}

export function addQuantity(cartKey: string, productId: string, delta: number, productSnapshot?: Product) {
  const cart = readCart(cartKey)
  const current = cart.lines.find((l) => l.productId === productId)?.quantity || 0
  setQuantity(cartKey, productId, current + delta, productSnapshot)
}

export function hydrateCart(cart: Cart) {
  const detailed = cart.lines
    .map((l) => {
      // Önce products.json'dan ara, bulamazsan cart'taki snapshot'ı kullan
      const product = (products.find((p) => p.id === l.productId) as Product | undefined)
        ?? (l.productSnapshot as Product | undefined)
      if (!product) return null
      return { product, quantity: l.quantity, expiresAt: l.expiresAt }
    })
    .filter(Boolean) as Array<{ product: Product; quantity: number; expiresAt: number }>

  const subtotal = detailed.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const discountFromOriginal = detailed.reduce((sum, i) => {
    const op = i.product.originalPrice && i.product.originalPrice > i.product.price ? i.product.originalPrice : i.product.price
    return sum + (op - i.product.price) * i.quantity
  }, 0)

  let promoDiscount = 0
  if (cart.promoCode && cart.promoType && cart.promoValue !== undefined) {
    const minAmt = cart.promoMinAmount || 0
    if (minAmt && subtotal < minAmt) {
      promoDiscount = 0 // Minimum tutarın altındaysa indirim uygulanmaz
    } else if (cart.promoType === 'amount') {
      promoDiscount = cart.promoValue
    } else if (cart.promoType === 'percent') {
      promoDiscount = Math.round((subtotal * cart.promoValue) / 100)
    }
    promoDiscount = Math.max(0, Math.min(promoDiscount, subtotal))
  }

  const total = Math.max(0, subtotal - promoDiscount)
  const count = detailed.reduce((sum, i) => sum + i.quantity, 0)

  return {
    items: detailed,
    subtotal,
    discountFromOriginal,
    promoCode: cart.promoCode || null,
    promoDiscount,
    total,
    count,
  }
}
