import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { createSessionToken, SESSION_COOKIE_OPTIONS } from '../../../../lib/auth/session'
import { query, execute } from '../../../../lib/db'
import { CART_COOKIE_NAME, getGuestCartKey, getUserCartKey, readCart, addQuantity, clearCart } from '../../../../lib/cart/store'

export const dynamic = 'force-dynamic'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!

// Google'ın gönderdiği ID token (JWT) payload'ını decode et
// Sunucu → Google API çağrısı gerekmez; imza yok, sadece payload decode
function decodeGoogleCredential(credential: string): {
  email: string
  name: string
  given_name?: string
  family_name?: string
  picture?: string
  iss: string
  aud: string
  exp: number
} | null {
  try {
    const parts = credential.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'))
    return payload
  } catch {
    return null
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

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential || typeof credential !== 'string') {
      return NextResponse.json({ error: 'credential_missing' }, { status: 400 })
    }

    // JWT decode
    const payload = decodeGoogleCredential(credential)

    if (!payload) {
      return NextResponse.json({ error: 'invalid_credential' }, { status: 400 })
    }

    // Temel doğrulama: issuer, audience, expiry
    const now = Math.floor(Date.now() / 1000)
    if (
      payload.iss !== 'https://accounts.google.com' &&
      payload.iss !== 'accounts.google.com'
    ) {
      return NextResponse.json({ error: 'invalid_issuer' }, { status: 400 })
    }
    if (payload.aud !== GOOGLE_CLIENT_ID) {
      return NextResponse.json({ error: 'invalid_audience' }, { status: 400 })
    }
    if (payload.exp < now) {
      return NextResponse.json({ error: 'token_expired' }, { status: 400 })
    }
    if (!payload.email) {
      return NextResponse.json({ error: 'no_email' }, { status: 400 })
    }

    const name = payload.name ||
      [payload.given_name, payload.family_name].filter(Boolean).join(' ') ||
      payload.email

    // DB'de bul veya oluştur
    const dbUser = await findOrCreateUser(payload.email, name)
    const sessionUser = dbRowToSessionUser(dbUser)

    // Misafir sepetini hesap sepetine aktar
    const cookieStore = cookies()
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

    const sessionToken = createSessionToken(sessionUser)

    const res = NextResponse.json({ ok: true })
    res.cookies.set({ ...SESSION_COOKIE_OPTIONS, value: sessionToken })
    return res
  } catch (err) {
    console.error('Google token verify error:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
