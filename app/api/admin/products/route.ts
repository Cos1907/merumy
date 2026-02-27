import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '../../../lib/db';
import { cookies } from 'next/headers';
import * as fs from 'fs';
import * as path from 'path';

// Sync a single product update to the JSON data file
function syncProductToJson(productId: string | number, updates: Record<string, any>) {
  try {
    const jsonPaths = [
      path.join(process.cwd(), 'app', 'data', 'products.json'),
      path.join(process.cwd(), 'data', 'products.json'),
    ];
    for (const jsonPath of jsonPaths) {
      if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, 'utf-8');
        const productsArray: any[] = JSON.parse(raw);
        const idx = productsArray.findIndex(
          (p: any) => String(p.id) === String(productId) || String(p.barcode) === String(updates.barcode || productId)
        );
        if (idx !== -1) {
          if (updates.name !== undefined) productsArray[idx].name = updates.name;
          if (updates.description !== undefined) productsArray[idx].description = updates.description;
          if (updates.price !== undefined) productsArray[idx].price = Number(updates.price);
          if (updates.comparePrice !== undefined) productsArray[idx].originalPrice = updates.comparePrice ? Number(updates.comparePrice) : null;
          if (updates.stock !== undefined) {
            productsArray[idx].stock = Number(updates.stock);
            productsArray[idx].inStock = Number(updates.stock) > 0 && updates.isActive !== false && updates.stockStatus !== 'out_of_stock';
          }
          if (updates.isActive !== undefined) productsArray[idx].inStock = updates.isActive && productsArray[idx].stock > 0;
          if (updates.barcode !== undefined) productsArray[idx].barcode = updates.barcode;
          if (updates.brand !== undefined) productsArray[idx].brand = updates.brand;
          if (updates.category !== undefined) productsArray[idx].category = updates.category;
          if (updates.image !== undefined) productsArray[idx].image = updates.image;
          fs.writeFileSync(jsonPath, JSON.stringify(productsArray, null, 2), 'utf-8');
        }
      }
    }
  } catch (err) {
    console.error('Error syncing product to JSON:', err);
  }
}

// Session check helper
async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) return false;
    
    const session = await queryOne<any>(
      'SELECT * FROM admin_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    );
    
    return !!session;
  } catch {
    return false;
  }
}

// GET - Fetch all products with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || '';
    const category = searchParams.get('category') || '';
    const stockStatus = searchParams.get('stockStatus') || '';
    
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = [];
    let params: any[] = [];
    
    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.barcode LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (brand) {
      whereConditions.push('b.name = ?');
      params.push(brand);
    }
    
    if (category) {
      whereConditions.push('p.category = ?');
      params.push(category);
    }
    
    if (stockStatus) {
      whereConditions.push('p.stock_status = ?');
      params.push(stockStatus);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
    `;
    const [countResult] = await query<any[]>(countQuery, params);
    const total = countResult?.total || 0;
    
    // Get products
    const productsQuery = `
      SELECT 
        p.id,
        p.slug,
        p.barcode,
        p.sku,
        p.name,
        p.description,
        p.price,
        p.compare_price as comparePrice,
        p.stock,
        p.stock_status as stockStatus,
        p.is_active as isActive,
        p.is_featured as isFeatured,
        p.created_at as createdAt,
        p.updated_at as updatedAt,
        b.name as brand,
        p.category,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY p.updated_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;
    
    const products = await query<any[]>(productsQuery, params);
    
    // Get filter options
    const brands = await query<any[]>('SELECT DISTINCT name FROM brands WHERE is_active = TRUE ORDER BY name');
    const categories = await query<any[]>('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category');
    
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        brands: brands.map((b: any) => b.name),
        categories: categories.map((c: any) => c.category)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Ürünler getirilemedi' }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();
    const { name, barcode, sku, description, price, comparePrice, stock, brand, category, isActive, isFeatured, image } = body;
    
    // Generate slug
    const slug = name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-ğüşıöç]/g, '')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .substring(0, 100);
    
    // Get brand_id
    let brandId = null;
    if (brand) {
      const brandRow = await queryOne<any>('SELECT id FROM brands WHERE name = ?', [brand]);
      brandId = brandRow?.id;
    }
    
    // Determine stock status
    let stockStatus = 'in_stock';
    if (stock <= 0) stockStatus = 'out_of_stock';
    else if (stock <= 5) stockStatus = 'low_stock';
    
    const result = await execute(
      `INSERT INTO products 
       (slug, barcode, sku, name, description, price, compare_price, stock, stock_status, brand_id, category, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [slug, barcode, sku, name, description, price, comparePrice, stock, stockStatus, brandId, category || null, isActive ?? true, isFeatured ?? false]
    );
    
    // Add image if provided
    if (image && result.insertId) {
      await execute(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, TRUE)',
        [result.insertId, image]
      );
    }
    
    return NextResponse.json({ success: true, productId: result.insertId });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Ürün oluşturulamadı' }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, barcode, sku, description, price, comparePrice, stock, brand, category, isActive, isFeatured, image } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Ürün ID gerekli' }, { status: 400 });
    }
    
    // Get brand_id
    let brandId = null;
    if (brand) {
      const brandRow = await queryOne<any>('SELECT id FROM brands WHERE name = ?', [brand]);
      brandId = brandRow?.id;
    }
    
    // Determine stock status
    let stockStatus = 'in_stock';
    if (stock <= 0) stockStatus = 'out_of_stock';
    else if (stock <= 5) stockStatus = 'low_stock';
    
    await execute(
      `UPDATE products SET 
        name = ?, barcode = ?, sku = ?, description = ?, 
        price = ?, compare_price = ?, stock = ?, stock_status = ?,
        brand_id = ?, category = ?, is_active = ?, is_featured = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [name, barcode, sku, description, price, comparePrice, stock, stockStatus, brandId, category || null, isActive, isFeatured, id]
    );
    
    // Update image if provided
    if (image) {
      // Check if primary image exists
      const existingImage = await queryOne<any>('SELECT id FROM product_images WHERE product_id = ? AND is_primary = TRUE', [id]);
      if (existingImage) {
        await execute('UPDATE product_images SET image_url = ? WHERE id = ?', [image, existingImage.id]);
      } else {
        await execute('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, TRUE)', [id, image]);
      }
    }
    
    // Sync changes to JSON data file for live frontend updates
    syncProductToJson(id, { name, description, price, comparePrice, stock, brand, category, barcode, isActive, image,
      stockStatus: stock <= 0 ? 'out_of_stock' : (stock <= 5 ? 'low_stock' : 'in_stock') });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Ürün güncellenemedi' }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Ürün ID gerekli' }, { status: 400 });
    }
    
    await execute('DELETE FROM products WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Ürün silinemedi' }, { status: 500 });
  }
}

