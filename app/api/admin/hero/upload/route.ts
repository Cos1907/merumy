import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

async function getAdminUser(): Promise<{ isAdmin: boolean; email?: string }> {
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
    if (session) return { isAdmin: true, email: session.email };
    return { isAdmin: false };
  } catch {
    return { isAdmin: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await getAdminUser();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Görsel gerekli' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Sadece JPEG, PNG, WebP ve GIF görseller yüklenebilir' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Görsel boyutu 5MB\'dan fazla olamaz' }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;

    // Save to public/herosection directory
    const uploadDir = path.join(process.cwd(), 'public', 'herosection');
    await mkdir(uploadDir, { recursive: true });
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/herosection/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName 
    });
  } catch (error) {
    console.error('Hero upload error:', error);
    return NextResponse.json({ error: 'Görsel yüklenemedi' }, { status: 500 });
  }
}

