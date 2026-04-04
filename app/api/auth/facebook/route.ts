import { NextResponse } from 'next/server'
import crypto from 'crypto'

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'https://merumy.com/api/auth/facebook/callback'

export const dynamic = 'force-dynamic'

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'email,public_profile',
    response_type: 'code',
    state,
  })

  const url = `https://www.facebook.com/v19.0/dialog/oauth?${params}`

  const res = NextResponse.redirect(url)
  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })

  return res
}
