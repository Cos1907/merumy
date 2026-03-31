import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '../../lib/db';

// GET - Fetch products for frontend (public API)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const brand = searchParams.get('brand') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const slug = searchParams.get('slug') || '';
    const barcode = searchParams.get('barcode') || '';
    const featured = searchParams.get('featured') === 'true';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // If slug is provided, return single product
    if (slug) {
      const product = await queryOne<any>(`
        SELECT 
          p.id,
          p.slug,
          p.barcode,
          p.sku as code,
          p.name,
          p.description,
          p.price,
          p.compare_price as originalPrice,
          p.stock,
          p.stock_status as stockStatus,
          p.is_active as isActive,
          p.is_featured as isFeatured,
          b.name as brand,
          p.category,
          p.tags,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image,
          (SELECT JSON_ARRAYAGG(image_url) FROM product_images WHERE product_id = p.id) as images
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.slug = ? AND p.is_active = TRUE
      `, [slug]);
      
      if (!product) {
        return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
      }
      
      // Parse tags if it's a JSON string
      if (product.tags && typeof product.tags === 'string') {
        try {
          product.tags = JSON.parse(product.tags);
        } catch {
          product.tags = [];
        }
      }
      
      // Format for compatibility with existing frontend
      product.inStock = product.stockStatus !== 'out_of_stock';
      product.rating = 4.5; // Default rating
      product.reviews = Math.floor(Math.random() * 200) + 50;
      product.sold = Math.floor(Math.random() * 500) + 100;
      
      return NextResponse.json({ product });
    }
    
    // If barcode is provided, return single product
    if (barcode) {
      const product = await queryOne<any>(`
        SELECT 
          p.id,
          p.slug,
          p.barcode,
          p.sku as code,
          p.name,
          p.description,
          p.price,
          p.compare_price as originalPrice,
          p.stock,
          b.name as brand,
          p.category,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.barcode = ? AND p.is_active = TRUE
      `, [barcode]);
      
      if (!product) {
        return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
      }
      
      product.inStock = product.stock > 0;
      
      return NextResponse.json({ product });
    }
    
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = ['p.is_active = TRUE'];
    let params: any[] = [];
    
    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (brand) {
      whereConditions.push('b.name = ?');
      params.push(brand);
    }
    
    if (category) {
      whereConditions.push('p.category = ?');
      params.push(category);
    }
    
    if (featured) {
      whereConditions.push('p.is_featured = TRUE');
    }
    
    const whereClause = 'WHERE ' + whereConditions.join(' AND ');
    
    // Determine sort column
    let sortColumn = 'p.created_at';
    switch (sortBy) {
      case 'price': sortColumn = 'p.price'; break;
      case 'name': sortColumn = 'p.name'; break;
      case 'stock': sortColumn = 'p.stock'; break;
      default: sortColumn = 'p.created_at';
    }
    
    const orderDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';
    
    // Get total count
    const [countResult] = await query<any[]>(
      `SELECT COUNT(*) as total 
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       ${whereClause}`,
      params
    );
    const total = countResult?.total || 0;
    
    // Get products
    const productsQuery = `
      SELECT 
        p.id,
        p.slug,
        p.barcode,
        p.sku as code,
        p.name,
        p.description,
        p.price,
        p.compare_price as originalPrice,
        p.stock,
        p.stock_status as stockStatus,
        b.name as brand,
        p.category,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY ${sortColumn} ${orderDirection}
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;
    
    const products = await query<any[]>(productsQuery, params);
    
    // Format products for frontend compatibility
    const formattedProducts = products.map((p: any) => ({
      ...p,
      id: String(p.barcode),
      inStock: p.stockStatus !== 'out_of_stock',
      rating: (Math.random() * 1 + 4).toFixed(1),
      reviews: Math.floor(Math.random() * 200) + 50,
      sold: Math.floor(Math.random() * 500) + 100
    }));
    
    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Ürünler getirilemedi' }, { status: 500 });
  }
}

