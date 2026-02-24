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
}

export type Cart = {
  key: string
  lines: CartLine[]
  promoCode?: string
}

const TTL_MS = 15 * 60 * 1000 // 15 dakika
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
  const userPart = user?.id ? `user:${user.id}` : 'guest'
  // "each browser" => cartId; "each user" => userPart
  return `${cartId}:${userPart}`
}

function pruneExpired(lines: CartLine[]) {
  const now = Date.now()
  return lines.filter((l) => l.expiresAt > now && l.quantity > 0)
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

type Promo =
  | { code: string; type: 'percent'; percent: number; oneTime: true; minAmount?: number }
  | { code: string; type: 'amount'; amount: number; oneTime: true; minAmount?: number }

// Tek kullanımlık kuponlar
// percent: yüzdelik indirim, amount: sabit tutar indirim (TL), minAmount: alt limit
const ONE_TIME_PROMOS: Record<string, { type: 'percent' | 'amount'; value: number; minAmount?: number }> = {
  // %20 indirim kodu
  'LGQGPM3D': { type: 'percent', value: 20 },
  
  // %10 indirim kodu
  'JZPITJGM': { type: 'percent', value: 10 },
  
  // 1000 TL sabit indirim kodları (5000 TL alt limit)
  '3HJM1D3E': { type: 'amount', value: 1000, minAmount: 5000 },
  'DGZPEO5V': { type: 'amount', value: 1000, minAmount: 5000 },
  'CFHYLKGY': { type: 'amount', value: 1000, minAmount: 5000 },
  'YL7A90MW': { type: 'amount', value: 1000, minAmount: 5000 },
  'GXE8OH2Q': { type: 'amount', value: 1000, minAmount: 5000 },
  '18KAB4H7': { type: 'amount', value: 1000, minAmount: 5000 },
  'PL5VJ9M7': { type: 'amount', value: 1000, minAmount: 5000 },
  '6YIG4SVZ': { type: 'amount', value: 1000, minAmount: 5000 },
  '3C6FM50B': { type: 'amount', value: 1000, minAmount: 5000 },
  '8AENQUBX': { type: 'amount', value: 1000, minAmount: 5000 },
  'ORXJIWTI': { type: 'amount', value: 1000, minAmount: 5000 },
  'O2DTQYHP': { type: 'amount', value: 1000, minAmount: 5000 },
  'ONFIEHDX': { type: 'amount', value: 1000, minAmount: 5000 },
  'H8BQCHBF': { type: 'amount', value: 1000, minAmount: 5000 },
  'KYTLIYTG': { type: 'amount', value: 1000, minAmount: 5000 },
  'LR2C3ZNK': { type: 'amount', value: 1000, minAmount: 5000 },
  'BDKWWXF4': { type: 'amount', value: 1000, minAmount: 5000 },
  'FLK2CHO7': { type: 'amount', value: 1000, minAmount: 5000 },
  'HJ1I7K2T': { type: 'amount', value: 1000, minAmount: 5000 },
  '4PSWWDMD': { type: 'amount', value: 1000, minAmount: 5000 },
  'NRZGCWR2': { type: 'amount', value: 1000, minAmount: 5000 },
  'QVFOJXIN': { type: 'amount', value: 1000, minAmount: 5000 },
  'JVKUNU3U': { type: 'amount', value: 1000, minAmount: 5000 },
  'FSEFICVI': { type: 'amount', value: 1000, minAmount: 5000 },
  'AYSO0FPK': { type: 'amount', value: 1000, minAmount: 5000 },
  'S8XGHBEK': { type: 'amount', value: 1000, minAmount: 5000 },
  'Z6K8IBGH': { type: 'amount', value: 1000, minAmount: 5000 },
  'W2OZY4MD': { type: 'amount', value: 1000, minAmount: 5000 },
  'Z9I5TPWK': { type: 'amount', value: 1000, minAmount: 5000 },
  'O6POP5TC': { type: 'amount', value: 1000, minAmount: 5000 },
  'UGCX3QXK': { type: 'amount', value: 1000, minAmount: 5000 },
  'CIOVRSZY': { type: 'amount', value: 1000, minAmount: 5000 },
  'LTF3P9W9': { type: 'amount', value: 1000, minAmount: 5000 },
  'QCIQPM8G': { type: 'amount', value: 1000, minAmount: 5000 },
  'RELOU5DD': { type: 'amount', value: 1000, minAmount: 5000 },
  'ZNMLCJ74': { type: 'amount', value: 1000, minAmount: 5000 },
  'OQVIOQK8': { type: 'amount', value: 1000, minAmount: 5000 },
  '3SCG954I': { type: 'amount', value: 1000, minAmount: 5000 },
  'YKKO2JLQ': { type: 'amount', value: 1000, minAmount: 5000 },
  'I5LDQ4VA': { type: 'amount', value: 1000, minAmount: 5000 },
  '6VW4GHEM': { type: 'amount', value: 1000, minAmount: 5000 },
  'H8SCLZTW': { type: 'amount', value: 1000, minAmount: 5000 },
  'DBUNML7E': { type: 'amount', value: 1000, minAmount: 5000 },
  'M3R5AQSI': { type: 'amount', value: 1000, minAmount: 5000 },
  'ZCGT819B': { type: 'amount', value: 1000, minAmount: 5000 },
  'O7I4KRTC': { type: 'amount', value: 1000, minAmount: 5000 },
  '8TY268ML': { type: 'amount', value: 1000, minAmount: 5000 },
  '5UZW4UPB': { type: 'amount', value: 1000, minAmount: 5000 },
  'BLB4K31C': { type: 'amount', value: 1000, minAmount: 5000 },
  'GSWP45FF': { type: 'amount', value: 1000, minAmount: 5000 },
}

// Kullanılmış tek kullanımlık kuponları dosyadan oku
const usedPromosPath = path.join(process.cwd(), 'data', 'used-promos.json')
function loadUsedPromos(): Set<string> {
  try {
    if (fs.existsSync(usedPromosPath)) {
      const data = JSON.parse(fs.readFileSync(usedPromosPath, 'utf-8'))
      return new Set(data)
    }
  } catch (e) {
    console.error('Error loading used promos:', e)
  }
  return new Set()
}

function saveUsedPromo(code: string) {
  const used = loadUsedPromos()
  used.add(code.toUpperCase())
  try {
    fs.writeFileSync(usedPromosPath, JSON.stringify(Array.from(used), null, 2))
  } catch (e) {
    console.error('Error saving used promo:', e)
  }
}

// Kupon kullanıldığında çağrılacak (export)
export function markPromoAsUsed(code: string) {
  const c = code.trim().toUpperCase()
  if (ONE_TIME_PROMOS[c]) {
    saveUsedPromo(c)
  }
}

function isPromoUsed(code: string): boolean {
  const used = loadUsedPromos()
  return used.has(code.toUpperCase())
}

function normalizePromo(code: string): Promo | null {
  const c = code.trim().toUpperCase()
  
  // Tek kullanımlık kupon kontrolü
  const promo = ONE_TIME_PROMOS[c]
  if (promo) {
    if (isPromoUsed(c)) return null // Zaten kullanılmış
    if (promo.type === 'percent') {
      return { code: c, type: 'percent', percent: promo.value, oneTime: true, minAmount: promo.minAmount }
    } else {
      return { code: c, type: 'amount', amount: promo.value, oneTime: true, minAmount: promo.minAmount }
    }
  }
  
  return null
}

export function setPromo(cartKey: string, code: string) {
  const cart = readCart(cartKey)
  const promo = normalizePromo(code)
  if (!promo) throw new Error('INVALID_PROMO')
  carts.set(cartKey, { ...cart, promoCode: promo.code })
  saveCarts(carts)
}

export function clearPromo(cartKey: string) {
  const cart = readCart(cartKey)
  carts.set(cartKey, { ...cart, promoCode: undefined })
  saveCarts(carts)
}

export function setQuantity(cartKey: string, productId: string, quantity: number) {
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
    const next = cart.lines.map((l) => (l.productId === productId ? { ...l, quantity: finalQuantity, updatedAt: now, expiresAt } : l))
    carts.set(cartKey, { ...cart, lines: next })
    saveCarts(carts)
    return
  }

  carts.set(cartKey, {
    ...cart,
    lines: [...cart.lines, { productId, quantity: finalQuantity, updatedAt: now, expiresAt }],
  })
  saveCarts(carts)
}

export function addQuantity(cartKey: string, productId: string, delta: number) {
  const cart = readCart(cartKey)
  const current = cart.lines.find((l) => l.productId === productId)?.quantity || 0
  setQuantity(cartKey, productId, current + delta)
}

export function hydrateCart(cart: Cart) {
  const detailed = cart.lines
    .map((l) => {
      const product = products.find((p) => p.id === l.productId) as Product | undefined
      if (!product) return null
      return { product, quantity: l.quantity, expiresAt: l.expiresAt }
    })
    .filter(Boolean) as Array<{ product: Product; quantity: number; expiresAt: number }>

  const subtotal = detailed.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const discountFromOriginal = detailed.reduce((sum, i) => {
    const op = i.product.originalPrice && i.product.originalPrice > i.product.price ? i.product.originalPrice : i.product.price
    return sum + (op - i.product.price) * i.quantity
  }, 0)

  const promo = cart.promoCode ? normalizePromo(cart.promoCode) : null
  let promoDiscount = 0
  let promoMinAmount = promo?.minAmount || 0
  let promoMinNotMet = false
  
  if (promo) {
    // Alt limit kontrolü
    if (promo.minAmount && subtotal < promo.minAmount) {
      promoMinNotMet = true
      promoDiscount = 0 // Alt limit karşılanmadığında indirim uygulanmaz
    } else {
      if (promo.type === 'percent') {
        promoDiscount = Math.round((subtotal * promo.percent) / 100)
      } else if (promo.type === 'amount') {
        promoDiscount = promo.amount
      }
      promoDiscount = Math.max(0, Math.min(promoDiscount, subtotal))
    }
  }
  const total = Math.max(0, subtotal - promoDiscount)
  const count = detailed.reduce((sum, i) => sum + i.quantity, 0)

  return { 
    items: detailed, 
    subtotal, 
    discountFromOriginal, 
    promoCode: promo?.code || null, 
    promoDiscount, 
    promoMinAmount,
    promoMinNotMet,
    total, 
    count 
  }
}


