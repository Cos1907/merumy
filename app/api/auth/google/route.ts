import { NextResponse } from 'next/server'
import crypto from 'crypto'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://merumy.com/api/auth/google/callback'

export const dynamic = 'force-dynamic'

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`

  const res = NextResponse.redirect(url)
  // State'i cookie'de sakla (CSRF koruması)
  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 dakika
    path: '/',
  })

  return res
}
