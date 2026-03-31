import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '../../../../lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getAdminUser(): Promise<{ isAdmin: boolean }> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken) return { isAdmin: false };
    const session = await queryOne<any>(
      `SELECT s.user_id FROM admin_sessions s WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    );
    return { isAdmin: !!session };
  } catch {
    return { isAdmin: false };
  }
}

// GET - Get gallery images for a product
export async function GET(request: NextRequest) {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'Ürün ID gerekli' }, { status: 400 });

  try {
    const images = await query<any[]>(
      `SELECT id, image_url, alt_text, sort_order, is_primary
       FROM product_images
       WHERE product_id = ?
       ORDER BY is_primary DESC, sort_order ASC`,
      [productId]
    );
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json({ error: 'Görseller alınamadı' }, { status: 500 });
  }
}

// POST - Add a gallery image
export async function POST(request: NextRequest) {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  try {
    const { productId, imageUrl, altText, isPrimary } = await request.json();
    if (!productId || !imageUrl) {
      return NextResponse.json({ error: 'Ürün ID ve görsel URL gerekli' }, { status: 400 });
    }

    // If setting as primary, unset all others first
    if (isPrimary) {
      await execute(
        `UPDATE product_images SET is_primary = 0 WHERE product_id = ?`,
        [productId]
      );
    }

    // Get next sort order
    const maxSort = await queryOne<any>(
      `SELECT MAX(sort_order) as maxSort FROM product_images WHERE product_id = ?`,
      [productId]
    );
    const sortOrder = (maxSort?.maxSort || 0) + 1;

    await execute(
      `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
       VALUES (?, ?, ?, ?, ?)`,
      [productId, imageUrl, altText || null, sortOrder, isPrimary ? 1 : 0]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gallery POST error:', error);
    return NextResponse.json({ error: 'Görsel eklenemedi' }, { status: 500 });
  }
}

// PUT - Update image (set as primary or update order)
export async function PUT(request: NextRequest) {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  try {
    const { imageId, productId, isPrimary, sortOrder } = await request.json();
    if (!imageId) return NextResponse.json({ error: 'Görsel ID gerekli' }, { status: 400 });

    if (isPrimary && productId) {
      // Unset all others first
      await execute(
        `UPDATE product_images SET is_primary = 0 WHERE product_id = ?`,
        [productId]
      );
    }

    await execute(
      `UPDATE product_images SET
        is_primary = COALESCE(?, is_primary),
        sort_order = COALESCE(?, sort_order)
       WHERE id = ?`,
      [isPrimary !== undefined ? (isPrimary ? 1 : 0) : null, sortOrder ?? null, imageId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gallery PUT error:', error);
    return NextResponse.json({ error: 'Görsel güncellenemedi' }, { status: 500 });
  }
}

// DELETE - Remove a gallery image
export async function DELETE(request: NextRequest) {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get('imageId');
  if (!imageId) return NextResponse.json({ error: 'Görsel ID gerekli' }, { status: 400 });

  try {
    await execute(`DELETE FROM product_images WHERE id = ?`, [imageId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Gallery DELETE error:', error);
    return NextResponse.json({ error: 'Görsel silinemedi' }, { status: 500 });
  }
}
