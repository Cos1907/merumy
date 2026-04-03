import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query, execute, queryOne } from '../../../lib/db'
import { writeFile, mkdir, unlink } from 'fs/promises'
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

// GET - Fetch images for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    if (!productId) return NextResponse.json({ images: [] }, { status: 400 })

    const images = await query<any[]>(
      `SELECT id, image_url, is_primary, sort_order, alt_text
       FROM product_images
       WHERE product_id = ?
       ORDER BY is_primary DESC, sort_order ASC, id ASC`,
      [productId]
    )

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Product images GET error:', error)
    return NextResponse.json({ images: [] })
  }
}

// POST - Upload image or add image URL
export async function POST(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const productId = formData.get('productId') as string
      const isPrimary = formData.get('isPrimary') === 'true'

      if (!file || !productId) {
        return NextResponse.json({ error: 'Dosya ve ürün ID gerekli' }, { status: 400 })
      }

      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `product_${productId}_${Date.now()}.${ext}`
      const uploadDir = path.join(process.cwd(), 'public', 'products')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(path.join(uploadDir, filename), buffer)
      const imageUrl = `/products/${filename}`

      // If setting as primary, unset existing primary
      if (isPrimary) {
        await execute(
          'UPDATE product_images SET is_primary = FALSE WHERE product_id = ?',
          [productId]
        )
      }

      const result = await execute(
        'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
        [productId, imageUrl, isPrimary, 0]
      )

      return NextResponse.json({ success: true, id: result.insertId, imageUrl })
    } else {
      // Add image by URL
      const body = await request.json()
      const { productId, imageUrl, isPrimary } = body

      if (!productId || !imageUrl) {
        return NextResponse.json({ error: 'Ürün ID ve görsel URL gerekli' }, { status: 400 })
      }

      if (isPrimary) {
        await execute(
          'UPDATE product_images SET is_primary = FALSE WHERE product_id = ?',
          [productId]
        )
      }

      const result = await execute(
        'INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)',
        [productId, imageUrl, isPrimary || false, 0]
      )

      return NextResponse.json({ success: true, id: result.insertId, imageUrl })
    }
  } catch (error) {
    console.error('Product images POST error:', error)
    return NextResponse.json({ error: 'Yükleme hatası' }, { status: 500 })
  }
}

// PATCH - Set as primary
export async function PATCH(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const body = await request.json()
    const { imageId, productId } = body

    if (!imageId || !productId) {
      return NextResponse.json({ error: 'Görsel ID ve ürün ID gerekli' }, { status: 400 })
    }

    // Unset all primaries for this product
    await execute(
      'UPDATE product_images SET is_primary = FALSE WHERE product_id = ?',
      [productId]
    )
    // Set new primary
    await execute(
      'UPDATE product_images SET is_primary = TRUE WHERE id = ?',
      [imageId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product images PATCH error:', error)
    return NextResponse.json({ error: 'Güncelleme hatası' }, { status: 500 })
  }
}

// DELETE - Remove an image
export async function DELETE(request: NextRequest) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')
    if (!imageId) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })

    // Get image info first
    const img = await queryOne<any>('SELECT * FROM product_images WHERE id = ?', [imageId])
    if (img?.image_url) {
      // Try to delete the physical file if it's a local path
      if (img.image_url.startsWith('/products/')) {
        const filePath = path.join(process.cwd(), 'public', img.image_url)
        try {
          await unlink(filePath)
        } catch {
          // Ignore file deletion errors
        }
      }
    }

    await execute('DELETE FROM product_images WHERE id = ?', [imageId])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product images DELETE error:', error)
    return NextResponse.json({ error: 'Silme hatası' }, { status: 500 })
  }
}
