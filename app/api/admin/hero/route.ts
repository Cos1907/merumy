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

