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

// GET - Fetch all hero slides
export async function GET() {
  try {
    const { isAdmin } = await getAdminUser();
    if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const slides = await query<any[]>(
      'SELECT id, slide_order as slideOrder, desktop_image as desktopImage, mobile_image as mobileImage, link, title, is_active as isActive FROM hero_slides ORDER BY slide_order ASC'
    );
    return NextResponse.json({ slides });
  } catch (error) {
    console.error('Hero GET error:', error);
    return NextResponse.json({ error: 'Slaytlar getirilemedi' }, { status: 500 });
  }
}

// POST - Create new hero slide
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, userId, email } = await getAdminUser();
    if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const { desktopImage, mobileImage, link, title, slideOrder } = await request.json();
    if (!desktopImage) return NextResponse.json({ error: 'Masaüstü görseli gerekli' }, { status: 400 });

    // Get max order
    const maxOrder = await queryOne<any>('SELECT MAX(slide_order) as maxOrder FROM hero_slides');
    const newOrder = slideOrder || (maxOrder?.maxOrder || 0) + 1;

    await execute(
      `INSERT INTO hero_slides (desktop_image, mobile_image, link, title, slide_order, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [desktopImage, mobileImage || desktopImage, link || null, title || null, newOrder]
    );

    // Log activity
    if (userId) {
      await execute(
        `INSERT INTO admin_activity_logs (user_id, action, details) VALUES (?, ?, ?)`,
        [userId, 'hero_updated', 'Yeni hero slayt eklendi']
      ).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hero POST error:', error);
    return NextResponse.json({ error: 'Slayt eklenemedi' }, { status: 500 });
  }
}

// DELETE - Delete hero slide
export async function DELETE(request: NextRequest) {
  try {
    const { isAdmin, userId } = await getAdminUser();
    if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Slayt ID gerekli' }, { status: 400 });

    await execute('DELETE FROM hero_slides WHERE id = ?', [id]);

    // Log activity
    if (userId) {
      await execute(
        `INSERT INTO admin_activity_logs (user_id, action, details) VALUES (?, ?, ?)`,
        [userId, 'hero_updated', `Hero slayt #${id} silindi`]
      ).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hero DELETE error:', error);
    return NextResponse.json({ error: 'Slayt silinemedi' }, { status: 500 });
  }
}

// PUT - Update hero slides
export async function PUT(request: NextRequest) {
  try {
    const { isAdmin, userId, email } = await getAdminUser();
    if (!isAdmin) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const { slides } = await request.json();
    if (!Array.isArray(slides)) {
      return NextResponse.json({ error: 'Geçersiz veri' }, { status: 400 });
    }

    for (const slide of slides) {
      await execute(
        `UPDATE hero_slides SET 
          desktop_image = ?, mobile_image = ?, link = ?, title = ?, 
          slide_order = ?, is_active = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          slide.desktopImage,
          slide.mobileImage,
          slide.link || null,
          slide.title || null,
          slide.slideOrder,
          slide.isActive !== false ? 1 : 0,
          slide.id,
        ]
      );
    }

    // Log activity
    if (userId && email) {
      await execute(
        `INSERT INTO admin_activity_logs (user_id, user_email, action, description, entity_type) VALUES (?, ?, ?, ?, ?)`,
        [userId, email, 'hero_updated', 'Hero section slaytları güncellendi', 'hero']
      ).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Hero PUT error:', error);
    return NextResponse.json({ error: 'Slaytlar güncellenemedi' }, { status: 500 });
  }
}

