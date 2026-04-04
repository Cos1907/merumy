import { NextResponse } from 'next/server'
import crypto from 'crypto'

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || 'https://merumy.com/api/auth/facebook/callback'

export const dynamic = 'force-dynamic'

function generateState(): string {
  const obj = { ts: Date.now(), r: crypto.randomBytes(8).toString('hex') }
  return Buffer.from(JSON.stringify(obj)).toString('base64url')
}

export async function GET() {
  const state = generateState()

  const params = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'email',
    response_type: 'code',
    state,
  })

  const url = `https://www.facebook.com/v19.0/dialog/oauth?${params}`
  return NextResponse.redirect(url)
}
