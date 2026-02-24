import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'merumy_user',
  password: process.env.DB_PASSWORD || 'MLD)JQR4*#W%(*m&',
  database: process.env.DB_NAME || 'merumy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create connection pool
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Execute a query with parameters
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

// Execute a query and return affected rows
export async function execute(sql: string, params?: any[]): Promise<mysql.ResultSetHeader> {
  const pool = getPool();
  const [result] = await pool.execute(sql, params);
  return result as mysql.ResultSetHeader;
}

// Get a single row
export async function queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T[]>(sql, params);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

// Transaction helper
export async function transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Close pool (for graceful shutdown)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Type definitions for database models
export interface DBUser {
  id: number;
  uuid: string;
  email: string;
  password_hash: string;
  name: string;
  phone: string | null;
  role: 'customer' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
}

export interface DBProduct {
  id: number;
  slug: string;
  barcode: string | null;
  sku: string | null;
  name: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_price: number | null;
  cost_price: number | null;
  stock: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'low_stock' | 'preorder';
  min_stock_alert: number;
  brand_id: number | null;
  category_id: number | null;
  weight: number | null;
  dimensions: string | null;
  is_active: boolean;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  tags: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DBOrder {
  id: number;
  order_id: string;
  dekont_id: string | null;
  user_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string | null;
  shipping_district: string | null;
  shipping_postal_code: string | null;
  billing_address: string | null;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_method: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  tracking_number: string | null;
  shipping_carrier: string | null;
  notes: string | null;
  admin_notes: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
  updated_at: Date;
  shipped_at: Date | null;
  delivered_at: Date | null;
}

export interface DBOrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_sku: string | null;
  product_barcode: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_snapshot: string | null;
  created_at: Date;
}

export interface DBBrand {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DBCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}





