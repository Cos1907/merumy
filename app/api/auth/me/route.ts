import { NextResponse } from 'next/server'
import { getSessionUser } from '../../../lib/auth/session'

export async function GET() {
  const user = getSessionUser()
  return NextResponse.json({ user }, { status: 200 })
}


