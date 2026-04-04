import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authenticateUser } from '../../../lib/auth/userStore'
import { createSession } from '../../../lib/auth/session'
import { CART_COOKIE_NAME, getCartKey, readCart, addQuantity } from '../../../lib/cart/store'

const TURNSTILE_SECRET = '0x4AAAAAAC0gHMKrCpLcA1ExsjVubUZZhUY'

async function verifyTurnstile(token: string): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token }),
    })
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, turnstileToken } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 })
    }

    // Turnstile doğrulama
    if (!turnstileToken || !(await verifyTurnstile(turnstileToken))) {
      return NextResponse.json({ error: 'CAPTCHA_FAILED' }, { status: 400 })
    }

    const user = await authenticateUser({ email: String(email), password: String(password) })

    // Giriş öncesi misafir sepetini al (varsa)
    const cookieStore = cookies()
    const cartId = cookieStore.get(CART_COOKIE_NAME)?.value

    // Session oluştur (kullanıcı artık giriş yapmış)
    createSession(user)

    // Misafir sepetini kullanıcı sepetine aktar
    if (cartId) {
      try {
        const guestKey = `${cartId}:guest`
        const userKey = `${cartId}:user:${user.id}`
        const guestCart = readCart(guestKey)

        if (guestCart.lines.length > 0) {
          for (const line of guestCart.lines) {
            addQuantity(userKey, line.productId, line.quantity, line.productSnapshot)
          }
          // Misafir sepetini temizle
          const { clearCart } = await import('../../../lib/cart/store')
          clearCart(guestKey)
        }
      } catch (mergeErr) {
        console.error('Cart merge error:', mergeErr)
      }
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (e: any) {
    if (e?.message === 'INVALID_CREDENTIALS') {
      return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 })
    }
    console.error('Login error:', e)
    return NextResponse.json({ error: 'UNKNOWN_ERROR' }, { status: 500 })
  }
}
