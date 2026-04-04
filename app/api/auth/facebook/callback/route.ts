import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { createSessionToken, SESSION_COOKIE_OPTIONS } from '../../../../lib/auth/session'
import { query, execute } from '../../../../lib/db'
import { CART_COOKIE_NAME, getGuestCartKey, getUserCartKey, readCart, addQuantity, clearCart } from '../../../../lib/cart/store'

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'https://merumy.com/api/auth/facebook/callback'

export const dynamic = 'force-dynamic'

function validateState(state: string | null): boolean {
  if (!state) return false
  try {
    const obj = JSON.parse(Buffer.from(state, 'base64url').toString())
    const age = Date.now() - (obj.ts || 0)
    return typeof obj.r === 'string' && age < 10 * 60 * 1000
  } catch {
    return false
  }
}

async function findOrCreateUser(email: string, name: string): Promise<any> {
  const rows = await query<any[]>('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()])

  if (rows && rows.length > 0) {
    execute('UPDATE users SET last_login = NOW() WHERE id = ?', [rows[0].id]).catch(() => {})
    return rows[0]
  }

  const uuid = crypto.randomUUID()
  await execute(
    `INSERT INTO users (uuid, email, password_hash, name, role, is_active, email_verified, created_at, updated_at)
     VALUES (?, ?, '', ?, 'customer', 1, 1, NOW(), NOW())`,
    [uuid, email.toLowerCase(), name]
  )

  const newRows = await query<any[]>('SELECT * FROM users WHERE uuid = ? LIMIT 1', [uuid])
  return newRows[0]
}

function dbRowToSessionUser(row: any) {
  const fullName = row.name || ''
  const spaceIdx = fullName.indexOf(' ')
  return {
    id: row.uuid || String(row.id),
    email: row.email,
    firstName: spaceIdx > -1 ? fullName.slice(0, spaceIdx) : fullName,
    lastName: spaceIdx > -1 ? fullName.slice(spaceIdx + 1) : '',
    phone: row.phone || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const BASE_URL = 'https://merumy.com'

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=facebook_cancelled', BASE_URL))
  }

  // State doğrula (time-based)
  if (!validateState(state)) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', BASE_URL))
  }

  const cookieStore = cookies()

  try {
    // Code → access token
    const tokenParams = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    })
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams}`)
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      console.error('Facebook token error:', tokenData)
      return NextResponse.redirect(new URL('/login?error=facebook_token_failed', BASE_URL))
    }

    // Kullanıcı bilgilerini al (name + email)
    const userRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${tokenData.access_token}`
    )
    const fbUser = await userRes.json()

    // Facebook email vermeyebilir (telefon numarasıyla kayıtlı hesaplar)
    if (!fbUser.email) {
      return NextResponse.redirect(new URL('/login?error=facebook_no_email', BASE_URL))
    }

    // DB'de bul veya oluştur (email eşleşmesi → çift kayıt önlenir)
    const dbUser = await findOrCreateUser(fbUser.email, fbUser.name || fbUser.email)
    const sessionUser = dbRowToSessionUser(dbUser)

    // Misafir sepetini hesap sepetine aktar
    const cartId = cookieStore.get(CART_COOKIE_NAME)?.value
    if (cartId) {
      try {
        const guestKey = getGuestCartKey(cartId)
        const userKey = getUserCartKey(sessionUser.id)
        const guestCart = readCart(guestKey)
        if (guestCart.lines.length > 0) {
          for (const line of guestCart.lines) {
            addQuantity(userKey, line.productId, line.quantity, line.productSnapshot)
          }
          clearCart(guestKey)
        }
      } catch {}
    }

    // Token oluştur + redirect response'a direkt cookie set et
    const sessionToken = createSessionToken(sessionUser)

    const res = NextResponse.redirect(new URL('/', BASE_URL))
    res.cookies.set({ ...SESSION_COOKIE_OPTIONS, value: sessionToken })
    return res
  } catch (err) {
    console.error('Facebook callback error:', err)
    return NextResponse.redirect(new URL('/login?error=facebook_error', BASE_URL))
  }
}
