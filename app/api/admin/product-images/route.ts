import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '../../../lib/db';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

async function checkAdmin(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken) return false;
    const rows = await query<any[]>(
      'SELECT s.user_id FROM admin_sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = ? AND s.expires_at > NOW()',
      [sessionToken]
    );
    return rows.length > 0;
  } catch { return false; }
}

// GET: fetch images for a product
export async function GET(request: NextRequest) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'productId gerekli' }, { status: 400 });
  const images = await query<any[]>(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC',
    [productId]
  );
  return NextResponse.json({ images });
}

// POST: upload image for a product
export async function POST(request: NextRequest) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('image') as File | null;
  const productId = formData.get('productId') as string;
  const isPrimary = formData.get('isPrimary') === '1';

  if (!file || !productId) return NextResponse.json({ error: 'Görsel ve ürün ID gerekli' }, { status: 400 });

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) return NextResponse.json({ error: 'Sadece JPEG, PNG, WebP görseller yüklenebilir' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Görsel boyutu 5MB\'dan fazla olamaz' }, { status: 400 });

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `product_${productId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'products');
  await mkdir(uploadDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));
  const imageUrl = `/products/${fileName}`;

  if (isPrimary) {
    await execute('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [productId]);
  }

  const maxSort = await query<any[]>('SELECT MAX(sort_order) as maxSort FROM product_images WHERE product_id = ?', [productId]);
  const nextSort = (maxSort[0]?.maxSort ?? -1) + 1;

  await execute(
    'INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES (?, ?, ?, ?)',
    [productId, imageUrl, nextSort, isPrimary ? 1 : 0]
  );
  return NextResponse.json({ success: true, imageUrl });
}

// DELETE: remove a product image
export async function DELETE(request: NextRequest) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get('imageId');
  if (!imageId) return NextResponse.json({ error: 'imageId gerekli' }, { status: 400 });
  await execute('DELETE FROM product_images WHERE id = ?', [imageId]);
  return NextResponse.json({ success: true });
}

// PUT: set an image as primary
export async function PUT(request: NextRequest) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { imageId, productId } = body;
  if (!imageId || !productId) return NextResponse.json({ error: 'imageId ve productId gerekli' }, { status: 400 });
  await execute('UPDATE product_images SET is_primary = 0 WHERE product_id = ?', [productId]);
  await execute('UPDATE product_images SET is_primary = 1 WHERE id = ?', [imageId]);
  return NextResponse.json({ success: true });
}
