import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  CART_COOKIE_NAME,
  addQuantity,
  clearPromo,
  clearCart,
  createCartId,
  getCartKey,
  hydrateCart,
  readCart,
  removeLine,
  setPromo,
  setQuantity,
} from '../../lib/cart/store'
import { query } from '../../lib/db'

// Override cart item prices with live DB prices so admin updates reflect immediately
async function applyLivePrices(payload: any): Promise<any> {
  try {
    if (!payload.items || payload.items.length === 0) return payload
    const barcodes = payload.items.map((i: any) => String(i.product.id))
    const livePrices = await query<any[]>(
      `SELECT barcode, price, compare_price as originalPrice, stock_status as stockStatus, stock
       FROM products WHERE barcode IN (${barcodes.map(() => '?').join(',')})`,
      barcodes
    )
    const priceMap = new Map(livePrices.map((p: any) => [String(p.barcode), p]))
    const updatedItems = payload.items.map((item: any) => {
      const live = priceMap.get(String(item.product.id))
      if (!live) return item
      return {
        ...item,
        product: {
          ...item.product,
          price: Number(live.price) || 0,
          originalPrice: (live.originalPrice && Number(live.originalPrice) > 0)
            ? Number(live.originalPrice)
            : Number(item.product.originalPrice) || 0,
          inStock: live.stockStatus !== 'out_of_stock',
          stock: Number(live.stock) || 0,
        },
      }
    })
    const subtotal = updatedItems.reduce((sum: number, i: any) => sum + i.product.price * i.quantity, 0)
    const discountFromOriginal = updatedItems.reduce((sum: number, i: any) => {
      const op = i.product.originalPrice && i.product.originalPrice > i.product.price
        ? i.product.originalPrice : i.product.price
      return sum + (op - i.product.price) * i.quantity
    }, 0)
    const total = Math.max(0, subtotal - (payload.promoDiscount || 0))
    return { ...payload, items: updatedItems, subtotal, discountFromOriginal, total }
  } catch (e) {
    console.error('Error applying live prices to cart:', e)
    return payload
  }
}

function getOrCreateCartId() {
  const existing = cookies().get(CART_COOKIE_NAME)?.value
  if (existing) return { cartId: existing, created: false }
  return { cartId: createCartId(), created: true }
}

export async function GET() {
  const { cartId, created } = getOrCreateCartId()
  const cartKey = getCartKey(cartId)
  const cart = readCart(cartKey)
  const payload = await applyLivePrices(hydrateCart(cart))

  const res = NextResponse.json({ ...payload, cartId }, { status: 200 })
  // Always set the cookie (not just when created) to ensure it persists
  res.cookies.set({
    name: CART_COOKIE_NAME,
    value: cartId,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // Production'da HTTPS kullanılıyorsa true
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}

export async function POST(req: Request) {
  const { cartId, created } = getOrCreateCartId()
  const cartKey = getCartKey(cartId)

  let body: any = {}
  try {
    body = await req.json()
  } catch {}

  const type = body?.type
  const productId = body?.productId

  if (type === 'clear') {
    clearCart(cartKey)
  } else if (type === 'setPromo') {
    const code = String(body?.code || '')
    try {
      setPromo(cartKey, code)
    } catch {
      return NextResponse.json({ error: 'INVALID_PROMO' }, { status: 400 })
    }
  } else if (type === 'clearPromo') {
    clearPromo(cartKey)
  } else if (type === 'remove') {
    if (!productId) return NextResponse.json({ error: 'MISSING_PRODUCT' }, { status: 400 })
    removeLine(cartKey, String(productId))
  } else if (type === 'setQty') {
    if (!productId) return NextResponse.json({ error: 'MISSING_PRODUCT' }, { status: 400 })
    const qty = Number(body?.quantity || 0)
    setQuantity(cartKey, String(productId), qty)
  } else if (type === 'add') {
    if (!productId) return NextResponse.json({ error: 'MISSING_PRODUCT' }, { status: 400 })
    const delta = Number(body?.quantity || 1)
    const productSnapshot = body?.productSnapshot ?? undefined
    addQuantity(cartKey, String(productId), delta, productSnapshot)
  } else {
    return NextResponse.json({ error: 'UNKNOWN_ACTION' }, { status: 400 })
  }

  const cart = readCart(cartKey)
  const payload = await applyLivePrices(hydrateCart(cart))
  const res = NextResponse.json({ ...payload, cartId }, { status: 200 })
  // Always set the cookie to ensure it persists
  res.cookies.set({
    name: CART_COOKIE_NAME,
    value: cartId,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // Production'da HTTPS kullanılıyorsa true
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}


