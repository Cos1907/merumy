import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

async function getAdminUser(): Promise<{ isAdmin: boolean }> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    if (!sessionToken) return { isAdmin: false };
    const session = await queryOne<any>(
      `SELECT s.user_id FROM admin_sessions s
       WHERE s.session_token = ? AND s.expires_at > NOW()`,
      [sessionToken]
    );
    return { isAdmin: !!session };
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

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Sadece JPEG, PNG, WebP ve GIF görseller yüklenebilir' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Görsel boyutu 10MB\'dan fazla olamaz' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'products');
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const baseName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let finalBuffer: Buffer;
    let fileName: string;

    if (file.type === 'image/gif') {
      finalBuffer = buffer;
      fileName = `${baseName}.gif`;
    } else {
      // WebP'ye dönüştür
      finalBuffer = await sharp(buffer)
        .webp({ quality: 85, effort: 4 })
        .toBuffer();
      fileName = `${baseName}.webp`;
      const origKB = (buffer.length / 1024).toFixed(1);
      const webpKB = (finalBuffer.length / 1024).toFixed(1);
      console.log(`Product upload: ${file.name} | ${origKB}KB → ${webpKB}KB (WebP)`);
    }

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, finalBuffer);

    return NextResponse.json({
      success: true,
      url: `/products/${fileName}`,
      fileName,
      originalSize: Math.round(buffer.length / 1024),
      webpSize: Math.round(finalBuffer.length / 1024),
    });
  } catch (error) {
    console.error('Product upload error:', error);
    return NextResponse.json({ error: 'Görsel yüklenemedi' }, { status: 500 });
  }
}
