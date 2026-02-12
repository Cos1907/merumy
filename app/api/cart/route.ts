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

function getOrCreateCartId() {
  const existing = cookies().get(CART_COOKIE_NAME)?.value
  if (existing) return { cartId: existing, created: false }
  return { cartId: createCartId(), created: true }
}

export async function GET() {
  const { cartId, created } = getOrCreateCartId()
  const cartKey = getCartKey(cartId)
  const cart = readCart(cartKey)
  const payload = hydrateCart(cart)

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
    addQuantity(cartKey, String(productId), delta)
  } else {
    return NextResponse.json({ error: 'UNKNOWN_ACTION' }, { status: 400 })
  }

  const cart = readCart(cartKey)
  const payload = hydrateCart(cart)
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


