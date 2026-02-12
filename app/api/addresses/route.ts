import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'

const SESSIONS_PATH = path.join(process.cwd(), 'data', 'sessions.json')
const ADDRESSES_PATH = path.join(process.cwd(), 'data', 'addresses.json')
const SESSION_COOKIE_NAME = 'merumy_session'

interface Address {
  id: string
  userId: string
  title: string
  fullName: string
  phone: string
  city: string
  district: string
  address: string
  postalCode: string
  isDefault: boolean
  createdAt: string
}

// Session'dan user ID al
function getUserIdFromSession(sessionToken: string | undefined): string | null {
  if (!sessionToken) return null
  try {
    if (fs.existsSync(SESSIONS_PATH)) {
      const sessions = JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf-8'))
      const session = sessions[sessionToken]
      if (session && session.user) {
        return session.user.id || null
      }
    }
  } catch (e) {
    console.error('Failed to get user from session:', e)
  }
  return null
}

// Adresleri oku
function getAddresses(): Address[] {
  try {
    if (fs.existsSync(ADDRESSES_PATH)) {
      return JSON.parse(fs.readFileSync(ADDRESSES_PATH, 'utf-8'))
    }
  } catch (e) {
    console.error('Failed to read addresses:', e)
  }
  return []
}

// Adresleri kaydet
function saveAddresses(addresses: Address[]) {
  try {
    const dir = path.dirname(ADDRESSES_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(ADDRESSES_PATH, JSON.stringify(addresses, null, 2))
  } catch (e) {
    console.error('Failed to save addresses:', e)
  }
}

// GET - Kullanıcının adreslerini getir
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const userId = getUserIdFromSession(sessionToken)
    
    if (!userId) {
      return NextResponse.json({ addresses: [] })
    }
    
    const allAddresses = getAddresses()
    const userAddresses = allAddresses.filter(a => a.userId === userId)
    
    return NextResponse.json({ addresses: userAddresses })
  } catch (error) {
    console.error('Get addresses error:', error)
    return NextResponse.json({ addresses: [] })
  }
}

// POST - Yeni adres ekle
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const userId = getUserIdFromSession(sessionToken)
    
    if (!userId) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }
    
    const body = await request.json()
    const { title, fullName, phone, city, district, address, postalCode, isDefault } = body
    
    if (!title || !fullName || !phone || !city || !district || !address) {
      return NextResponse.json({ error: 'Tüm alanlar zorunludur' }, { status: 400 })
    }
    
    const addresses = getAddresses()
    const userAddresses = addresses.filter(a => a.userId === userId)
    
    // İlk adres veya isDefault true ise, diğerlerinin isDefault'unu kaldır
    if (isDefault || userAddresses.length === 0) {
      addresses.forEach(a => {
        if (a.userId === userId) {
          a.isDefault = false
        }
      })
    }
    
    const newAddress: Address = {
      id: Date.now().toString(),
      userId,
      title,
      fullName,
      phone,
      city,
      district,
      address,
      postalCode: postalCode || '',
      isDefault: isDefault || userAddresses.length === 0,
      createdAt: new Date().toISOString()
    }
    
    addresses.push(newAddress)
    saveAddresses(addresses)
    
    return NextResponse.json({ success: true, address: newAddress })
  } catch (error) {
    console.error('Create address error:', error)
    return NextResponse.json({ error: 'Adres eklenemedi' }, { status: 500 })
  }
}

// DELETE - Adres sil
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const userId = getUserIdFromSession(sessionToken)
    
    if (!userId) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const addressId = searchParams.get('id')
    
    if (!addressId) {
      return NextResponse.json({ error: 'Adres ID gerekli' }, { status: 400 })
    }
    
    let addresses = getAddresses()
    const addressToDelete = addresses.find(a => a.id === addressId && a.userId === userId)
    
    if (!addressToDelete) {
      return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 })
    }
    
    addresses = addresses.filter(a => a.id !== addressId)
    
    // Eğer silinen varsayılan ise, ilk adresi varsayılan yap
    const userAddresses = addresses.filter(a => a.userId === userId)
    if (addressToDelete.isDefault && userAddresses.length > 0) {
      userAddresses[0].isDefault = true
    }
    
    saveAddresses(addresses)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete address error:', error)
    return NextResponse.json({ error: 'Adres silinemedi' }, { status: 500 })
  }
}

