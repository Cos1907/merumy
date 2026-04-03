import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query, execute, queryOne } from '../../../lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value
    if (!sessionToken) return false
    const session = await queryOne<any>(
      'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    )
    return !!session
  } catch {
    return false
  }
}

export async function GET() {
  try {
    // Try DB first
    const slides = await query<any[]>(
      `SELECT id, title, subtitle, button_text, button_link, desktop_image, mobile_image, sort_order, is_active
       FROM hero_slides
       ORDER BY sort_order ASC, id ASC`
    )
    return NextResponse.json({ slides })
  } catch (error) {
    console.error('Hero slides GET error:', error)
    return NextResponse.json({ slides: [] })
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // Image upload
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const type = (formData.get('type') as string) || 'desktop' // desktop | mobile

      if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })

      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `hero_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
      const uploadDir = path.join(process.cwd(), 'public', 'herosection')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(path.join(uploadDir, filename), buffer)
      const url = `/herosection/${filename}`

      return NextResponse.json({ success: true, url, filename })
    } else {
      // Create / update slide record
      const body = await request.json()
      const { id, title, subtitle, buttonText, buttonLink, desktopImage, mobileImage, sortOrder, isActive } = body

      if (id) {
        // Update
        await execute(
          `UPDATE hero_slides SET title=?, subtitle=?, button_text=?, button_link=?,
           desktop_image=?, mobile_image=?, sort_order=?, is_active=?, updated_at=NOW()
           WHERE id=?`,
          [title || null, subtitle || null, buttonText || null, buttonLink || null,
           desktopImage || null, mobileImage || null, sortOrder ?? 0, isActive ?? true, id]
        )
        return NextResponse.json({ success: true })
      } else {
        // Insert
        const result = await execute(
          `INSERT INTO hero_slides (title, subtitle, button_text, button_link, desktop_image, mobile_image, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [title || null, subtitle || null, buttonText || null, buttonLink || null,
           desktopImage || null, mobileImage || null, sortOrder ?? 0, isActive ?? true]
        )
        return NextResponse.json({ success: true, id: result.insertId })
      }
    }
  } catch (error) {
    console.error('Hero slides POST error:', error)
    return NextResponse.json({ error: 'İşlem hatası' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })

    await execute('DELETE FROM hero_slides WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hero slides DELETE error:', error)
    return NextResponse.json({ error: 'Silme hatası' }, { status: 500 })
  }
}
