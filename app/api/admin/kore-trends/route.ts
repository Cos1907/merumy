import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '../../../lib/db';
import { cookies } from 'next/headers';

async function getAdminUser(): Promise<{ isAdmin: boolean; userId?: number; email?: string }> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken) return { isAdmin: false };
    const session = await queryOne<any>(
      `SELECT s.user_id, u.email FROM admin_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    );
    if (session) return { isAdmin: true, userId: session.user_id, email: session.email };
    return { isAdmin: false };
  } catch {
    return { isAdmin: false };
  }
}

// GET - Fetch all curated products for a section
export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await getAdminUser();
    if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'kore_trend';

    const products = await query<any[]>(
      `SELECT k.id as curatedId, k.product_id as productId, k.section, k.added_at as addedAt,
              p.name, p.slug, p.price, p.stock_status as stockStatus, b.name as brand
       FROM kore_trend_products k
       JOIN products p ON k.product_id = p.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE k.section = ?
       ORDER BY k.added_at DESC`,
      [section]
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Kore trends GET error:', error);
    return NextResponse.json({ error: 'Ürünler getirilemedi' }, { status: 500 });
  }
}

// POST - Add a product to a section
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, userId, email } = await getAdminUser();
    if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const { productId, section = 'kore_trend' } = await request.json();
    if (!productId) return NextResponse.json({ error: 'Ürün ID gerekli' }, { status: 400 });

    // Check product exists
    const product = await queryOne<any>('SELECT id, name FROM products WHERE id = ?', [productId]);
    if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });

    await execute(
      'INSERT IGNORE INTO kore_trend_products (product_id, section) VALUES (?, ?)',
      [productId, section]
    );

    // Log activity
    try {
      const sectionLabel = section === 'makeup' ? 'Makyaj Ürünleri' : 'Kore Trendleri';
      await execute(
        `INSERT INTO admin_activity_logs (user_id, action, details) VALUES (?, ?, ?)`,
        [userId, 'kore_trend_add', `${sectionLabel} listesine ürün eklendi: ${product.name}`]
      );
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kore trends POST error:', error);
    return NextResponse.json({ error: 'Ürün eklenemedi' }, { status: 500 });
  }
}

// DELETE - Remove a product from a section
export async function DELETE(request: NextRequest) {
  try {
    const { isAdmin, userId } = await getAdminUser();
    if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const curatedId = searchParams.get('id');
    if (!curatedId) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });

    // Get product name before deleting
    const entry = await queryOne<any>(
      `SELECT k.id, p.name, k.section FROM kore_trend_products k JOIN products p ON k.product_id = p.id WHERE k.id = ?`,
      [curatedId]
    );

    await execute('DELETE FROM kore_trend_products WHERE id = ?', [curatedId]);

    // Log activity
    try {
      if (entry) {
        const sectionLabel = entry.section === 'makeup' ? 'Makyaj Ürünleri' : 'Kore Trendleri';
        await execute(
          `INSERT INTO admin_activity_logs (user_id, action, details) VALUES (?, ?, ?)`,
          [userId, 'kore_trend_remove', `${sectionLabel} listesinden ürün kaldırıldı: ${entry.name}`]
        );
      }
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kore trends DELETE error:', error);
    return NextResponse.json({ error: 'Ürün kaldırılamadı' }, { status: 500 });
  }
}

