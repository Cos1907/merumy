import { NextResponse } from 'next/server'
import crypto from 'crypto'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://merumy.com/api/auth/google/callback'

export const dynamic = 'force-dynamic'

// State: timestamp + random → base64url (cookie gerekmez, CSRF için zaman damgası yeterli)
export function generateState(): string {
  const obj = { ts: Date.now(), r: crypto.randomBytes(8).toString('hex') }
  return Buffer.from(JSON.stringify(obj)).toString('base64url')
}

export async function GET() {
  const state = generateState()

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
  return NextResponse.redirect(url)
}
