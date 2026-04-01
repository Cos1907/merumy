'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { products as allProducts } from '../../lib/products';

// Types
interface HeroSlide {
  id: number;
  desktopImage: string;
  mobileImage: string;
  link: string | null;
  title: string | null;
  slideOrder: number;
  isActive: boolean;
}

interface ActivityLog {
  id: number;
  user_email: string;
  action: string;
  description: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  brand?: string;
  barcode?: string;
}

interface Order {
  id: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: string;
  trackingNumber: string;
  createdAt: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

interface ProductSale {
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  brand?: string;
  barcode?: string;
}

interface DbProduct {
  id: number;
  slug: string;
  barcode: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number;
  stock: number;
  stockStatus: string;
  isActive: boolean;
  isFeatured: boolean;
  brand: string;
  category: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductEditForm {
  id: number;
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  stock: string;
  brand: string;
  category: string;
  barcode: string;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
}

// Order statuses
const ORDER_STATUSES = [
  { value: 'pending', label: 'Beklemede', color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'processing', label: 'İşleniyor', color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'confirmed', label: 'Onaylandı', color: 'bg-indigo-500', lightColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'preparing', label: 'Hazırlanıyor', color: 'bg-orange-500', lightColor: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'shipped', label: 'Kargoda', color: 'bg-purple-500', lightColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'delivered', label: 'Teslim Edildi', color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'cancelled', label: 'İptal', color: 'bg-red-500', lightColor: 'bg-red-50 text-red-700 border-red-200' },
];

const ITEMS_PER_PAGE = 15;

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users' | 'reports' | 'hero' | 'activity' | 'kore-trends' | 'discount-codes'>('orders');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Current user info
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  // null = all sections allowed, string[] = restricted list
  const [allowedSections, setAllowedSections] = useState<string[] | null>(null);
  
  // Hero management state
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroSaveSuccess, setHeroSaveSuccess] = useState(false);
  const [heroLoading, setHeroLoading] = useState(false);
  
  // Activity log state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityTotal, setActivityTotal] = useState(0);

  // Kore Trendleri management state
  const [koreSection, setKoreSection] = useState<'kore_trend' | 'makeup'>('kore_trend');
  const [koreTrendProducts, setKoreTrendProducts] = useState<any[]>([]);
  const [koreLoading, setKoreLoading] = useState(false);
  const [koreSearch, setKoreSearch] = useState('');
  const [koreSearchResults, setKoreSearchResults] = useState<any[]>([]);
  const [koreSearchLoading, setKoreSearchLoading] = useState(false);
  
  // Discount codes state
  const [discountCodes, setDiscountCodes] = useState<any[]>([]);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountForm, setDiscountForm] = useState({ code: '', type: 'amount', value: '', minAmount: '', notes: '', expiresAt: '', maxUses: '' });
  const [discountSaving, setDiscountSaving] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [discountSuccess, setDiscountSuccess] = useState('');
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStats, setOrderStats] = useState<any>(null);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  
  // Bulk selection state
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkTrackingNumber, setBulkTrackingNumber] = useState('');
  const [bulkSendEmail, setBulkSendEmail] = useState(true);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  
  // Products state - from DB API
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [dbProductsTotal, setDbProductsTotal] = useState(0);
  const [dbProductsPage, setDbProductsPage] = useState(1);
  const [dbProductsTotalPages, setDbProductsTotalPages] = useState(1);
  const [dbBrands, setDbBrands] = useState<string[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productBrandFilter, setProductBrandFilter] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [productStockFilter, setProductStockFilter] = useState('');
  const [productLoadError, setProductLoadError] = useState('');
  
  // Product edit state
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [editForm, setEditForm] = useState<ProductEditForm | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userSort, setUserSort] = useState('newest');
  const [userDateFrom, setUserDateFrom] = useState('');
  const [userDateTo, setUserDateTo] = useState('');
  
  // Reports state
  const [productSalesReport, setProductSalesReport] = useState<ProductSale[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSearch, setReportSearch] = useState('');
  const [reportPage, setReportPage] = useState(1);
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');
  
  // Updating state
  const [updating, setUpdating] = useState(false);

  // Products from JSON (for brand list in reports/orders - fallback)
  const productBrands = useMemo(() => {
    return Array.from(new Set(allProducts.map(p => p.brand))).filter(Boolean).sort();
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'products') fetchDbProducts();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'reports') fetchAllOrdersForReport();
    else if (activeTab === 'hero') fetchHeroSlides();
    else if (activeTab === 'activity') fetchActivityLogs();
    else if (activeTab === 'kore-trends') fetchKoreTrendProducts(koreSection as 'kore_trend' | 'makeup');
    else if (activeTab === 'discount-codes') fetchDiscountCodes();
  }, [activeTab, orderPage, orderStatusFilter, userPage, userSort, dbProductsPage]);

  // Clear selection when changing filters
  useEffect(() => {
    setSelectedOrders(new Set());
  }, [orderStatusFilter, orderSearch, orderPage]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth/check');
      if (!res.ok) {
        router.push('/admin/login');
      } else {
        const data = await res.json();
        if (data.user) {
          setCurrentUserEmail(data.user.email || '');
          setCurrentUserName(data.user.name || '');
          const sections = data.user.allowedSections as string[] | null;
          setAllowedSections(sections);
          // If user has restricted access, set default tab to first allowed section
          if (sections && sections.length > 0 && !sections.includes('orders')) {
            setActiveTab(sections[0] as any);
          }
        }
        setLoading(false);
        fetchOrders();
      }
    } catch {
      router.push('/admin/login');
    }
  };

  // Log activity to backend
  const logActivity = async (action: string, description: string, entityType?: string, entityId?: string) => {
    try {
      await fetch('/api/admin/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, description, entityType, entityId }),
      });
    } catch {}
  };

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (orderSearch) params.append('search', orderSearch);
      if (orderStatusFilter !== 'all') params.append('status', orderStatusFilter);
      if (orderDateFrom) params.append('dateFrom', orderDateFrom);
      if (orderDateTo) params.append('dateTo', orderDateTo);
      params.append('page', orderPage.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());
      
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      if (data.stats) setOrderStats(data.stats);
      if (data.pagination) setOrderTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchDbProducts = async () => {
    setProductLoadError('');
    try {
      const params = new URLSearchParams();
      if (productSearch) params.append('search', productSearch);
      if (productBrandFilter) params.append('brand', productBrandFilter);
      if (productCategoryFilter) params.append('category', productCategoryFilter);
      if (productStockFilter) params.append('stockStatus', productStockFilter);
      params.append('page', dbProductsPage.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());
      
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      if (data.products) {
        setDbProducts(data.products);
        setDbProductsTotal(data.pagination?.total || 0);
        setDbProductsTotalPages(data.pagination?.totalPages || 1);
      }
      if (data.filters?.brands) setDbBrands(data.filters.brands);
      if (data.filters?.categories) setDbCategories(data.filters.categories);
    } catch (error) {
      console.error('Error fetching DB products:', error);
      setProductLoadError('Ürünler yüklenemedi.');
    }
  };

  const fetchAllOrdersForReport = async () => {
    setReportLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '10000');
      if (reportDateFrom) params.append('dateFrom', reportDateFrom);
      if (reportDateTo) params.append('dateTo', reportDateTo);
      
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (data.orders) {
        setAllOrders(data.orders);
        generateProductSalesReport(data.orders);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setReportLoading(false);
    }
  };

  const generateProductSalesReport = (orders: Order[]) => {
    const productMap = new Map<string, ProductSale>();
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    
    validOrders.forEach(order => {
      order.items?.forEach(item => {
        const key = item.name;
        const existing = productMap.get(key);
        const productInfo = allProducts.find(p => 
          p.name.toLowerCase() === item.name?.toLowerCase() ||
          p.name.toLowerCase().includes(item.name?.toLowerCase()) ||
          item.name?.toLowerCase().includes(p.name.toLowerCase())
        );
        const brand = item.brand || productInfo?.brand || '-';
        const barcode = item.barcode || productInfo?.barcode || '-';
        
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += item.price * item.quantity;
          existing.orderCount += 1;
        } else {
          productMap.set(key, {
            productName: item.name,
            totalQuantity: item.quantity,
            totalRevenue: item.price * item.quantity,
            orderCount: 1,
            brand,
            barcode
          });
        }
      });
    });
    
    const sorted = Array.from(productMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
    setProductSalesReport(sorted);
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      if (userSort) params.append('sortBy', userSort);
      if (userDateFrom) params.append('dateFrom', userDateFrom);
      if (userDateTo) params.append('dateTo', userDateTo);
      params.append('page', userPage.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());
      
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.users) setUsers(data.users);
      if (data.pagination) setUserTotal(data.pagination.total);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus, trackingNumber, sendEmail: true }),
      });
      if (res.ok) {
        const data = await res.json();
        logActivity('order_status_updated', `Sipariş durumu güncellendi: #${orderId.slice(-8).toUpperCase()} → ${newStatus}`, 'order', orderId);
        fetchOrders();
        setSelectedOrder(null);
        if (data.emailSent) {
          alert('Sipariş güncellendi ve müşteriye bilgilendirme maili gönderildi.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Bulk selection handlers
  const toggleOrderSelection = (orderId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(orderId)) {
      newSelection.delete(orderId);
    } else {
      newSelection.add(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const toggleAllOrders = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(o => o.orderId)));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedOrders.size === 0 || !bulkStatus) return;
    
    setBulkUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: Array.from(selectedOrders),
          status: bulkStatus,
          trackingNumber: bulkTrackingNumber || undefined,
          sendEmail: bulkSendEmail
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(`${data.results.success} sipariş güncellendi, ${data.results.emailsSent} mail gönderildi.`);
        setSelectedOrders(new Set());
        setShowBulkModal(false);
        setBulkStatus('');
        setBulkTrackingNumber('');
        fetchOrders();
      } else {
        alert('Hata: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      alert('Güncelleme sırasında hata oluştu');
    } finally {
      setBulkUpdating(false);
    }
  };

  // Product edit handlers
  const openEditModal = (product: DbProduct) => {
    setEditingProduct(product);
    setEditForm({
      id: product.id,
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      comparePrice: (product.comparePrice && product.comparePrice > 0) ? String(product.comparePrice) : '',
      stock: String(product.stock ?? ''),
      brand: product.brand || '',
      category: product.category || '',
      barcode: product.barcode || '',
      sku: product.sku || '',
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured || false,
    });
    setSaveSuccess(false);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditForm(null);
    setSaveSuccess(false);
  };

  const handleSaveProduct = async () => {
    if (!editForm) return;
    setSavingProduct(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editForm.id,
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price) || 0,
          comparePrice: editForm.comparePrice ? parseFloat(editForm.comparePrice) : null,
          stock: parseInt(editForm.stock) || 0,
          brand: editForm.brand,
          category: editForm.category,
          barcode: editForm.barcode,
          sku: editForm.sku,
          isActive: editForm.isActive,
          isFeatured: editForm.isFeatured,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        logActivity(
          'product_updated',
          `Ürün güncellendi: ${editForm.name} - Fiyat: ${editForm.price} TL, Stok: ${editForm.stock}`,
          'product',
          String(editForm.id)
        );
        fetchDbProducts();
        setTimeout(() => {
          closeEditModal();
        }, 1200);
      } else {
        const err = await res.json();
        alert('Hata: ' + (err.error || 'Kayıt edilemedi'));
      }
    } catch (error) {
      console.error('Save product error:', error);
      alert('Kayıt sırasında hata oluştu');
    } finally {
      setSavingProduct(false);
    }
  };

  const toggleStockQuick = async (product: DbProduct) => {
    const newStock = product.stockStatus === 'out_of_stock' ? 100 : 0;
    const newIsActive = product.isActive !== false;
    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          stock: newStock,
          brand: product.brand,
          category: product.category,
          barcode: product.barcode,
          sku: product.sku,
          isActive: newIsActive,
          isFeatured: product.isFeatured,
        }),
      });
      const newStatus = product.stockStatus === 'out_of_stock' ? 'stokta' : 'stok dışı';
      logActivity('stock_toggled', `Stok değiştirildi: ${product.name} → ${newStatus}`, 'product', String(product.id));
      fetchDbProducts();
    } catch (error) {
      console.error('Toggle stock error:', error);
    }
  };

  // Hero management functions
  const fetchHeroSlides = async () => {
    setHeroLoading(true);
    try {
      const res = await fetch('/api/admin/hero');
      const data = await res.json();
      if (data.slides) setHeroSlides(data.slides);
    } catch (error) {
      console.error('Error fetching hero slides:', error);
    } finally {
      setHeroLoading(false);
    }
  };

  const saveHeroSlides = async () => {
    setHeroSaving(true);
    setHeroSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: heroSlides }),
      });
      if (res.ok) {
        setHeroSaveSuccess(true);
        logActivity('hero_updated', 'Hero section slaytları güncellendi', 'hero');
        setTimeout(() => setHeroSaveSuccess(false), 3000);
      } else {
        alert('Hero kayıt edilemedi');
      }
    } catch (error) {
      console.error('Error saving hero slides:', error);
      alert('Hata oluştu');
    } finally {
      setHeroSaving(false);
    }
  };

  // Hero image upload
  const [heroUploadLoading, setHeroUploadLoading] = useState<string | null>(null);

  const uploadHeroImage = async (file: File, slideIdx: number, field: 'desktopImage' | 'mobileImage') => {
    const key = `${slideIdx}-${field}`;
    setHeroUploadLoading(key);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/admin/hero/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        const updated = [...heroSlides];
        updated[slideIdx] = { ...updated[slideIdx], [field]: data.url };
        setHeroSlides(updated);
      } else {
        alert(data.error || 'Görsel yüklenemedi');
      }
    } catch {
      alert('Görsel yüklenirken hata oluştu');
    } finally {
      setHeroUploadLoading(null);
    }
  };

  const fetchDiscountCodes = async () => {
    setDiscountLoading(true);
    try {
      const res = await fetch('/api/admin/discount-codes');
      const data = await res.json();
      if (data.codes) setDiscountCodes(data.codes);
    } catch (err) {
      console.error('Error fetching discount codes:', err);
    } finally {
      setDiscountLoading(false);
    }
  };

  const saveDiscountCode = async () => {
    if (!discountForm.code || !discountForm.value) {
      setDiscountError('Kod ve değer zorunlu');
      return;
    }
    setDiscountSaving(true);
    setDiscountError('');
    setDiscountSuccess('');
    try {
      const res = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountForm.code,
          type: discountForm.type,
          value: parseFloat(discountForm.value),
          minAmount: discountForm.minAmount ? parseFloat(discountForm.minAmount) : 0,
          notes: discountForm.notes || null,
          expiresAt: discountForm.expiresAt || null,
          maxUses: discountForm.maxUses ? parseInt(discountForm.maxUses) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiscountSuccess('Kod başarıyla eklendi!');
        setDiscountForm({ code: '', type: 'amount', value: '', minAmount: '', notes: '', expiresAt: '', maxUses: '' });
        fetchDiscountCodes();
        setTimeout(() => setDiscountSuccess(''), 3000);
      } else {
        setDiscountError(data.error || 'Kod eklenemedi');
      }
    } catch {
      setDiscountError('Hata oluştu');
    } finally {
      setDiscountSaving(false);
    }
  };

  const toggleDiscountCode = async (id: number, isActive: boolean) => {
    await fetch('/api/admin/discount-codes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    fetchDiscountCodes();
  };

  const deleteDiscountCode = async (id: number) => {
    if (!confirm('Bu indirim kodunu silmek istediğinizden emin misiniz?')) return;
    await fetch(`/api/admin/discount-codes?id=${id}`, { method: 'DELETE' });
    fetchDiscountCodes();
  };

    const addNewHeroSlide = async () => {
    const newSlide = {
      id: 'new-' + Date.now(),
      desktopImage: '/herosection/herosection01.jpg',
      mobileImage: '/mobilsliderlar/slider1.jpg',
      link: null,
      title: null,
      slideOrder: heroSlides.length + 1,
      isActive: true,
    };
    // Save to DB immediately
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlide),
      });
      if (res.ok) {
        await fetchHeroSlides(); // Refresh to get the new DB id
      }
    } catch {
      alert('Slayt eklenemedi');
    }
  };

  const deleteHeroSlide = async (slideId: string | number) => {
    if (!confirm('Bu slaytı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/hero?id=${slideId}`, { method: 'DELETE' });
      if (res.ok) {
        setHeroSlides(prev => prev.filter(s => String(s.id) !== String(slideId)));
      } else {
        alert('Slayt silinemedi');
      }
    } catch {
      alert('Hata oluştu');
    }
  };

  // Activity log functions
  const fetchActivityLogs = async () => {
    setActivityLoading(true);
    try {
      const res = await fetch('/api/admin/activity?limit=100');
      const data = await res.json();
      if (data.logs) setActivityLogs(data.logs);
      if (data.total !== undefined) setActivityTotal(data.total);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchKoreTrendProducts = async (section: 'kore_trend' | 'makeup') => {
    setKoreLoading(true);
    try {
      const res = await fetch(`/api/admin/kore-trends?section=${section}`);
      const data = await res.json();
      if (data.products) setKoreTrendProducts(data.products);
    } catch (error) {
      console.error('Error fetching kore trend products:', error);
    } finally {
      setKoreLoading(false);
    }
  };

  const searchProductsForKore = async (q: string) => {
    if (!q.trim()) { setKoreSearchResults([]); return; }
    setKoreSearchLoading(true);
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(q)}&limit=10`);
      const data = await res.json();
      if (data.products) setKoreSearchResults(data.products);
    } catch {}
    setKoreSearchLoading(false);
  };

  const addToKoreTrends = async (productId: number, section: 'kore_trend' | 'makeup') => {
    try {
      const res = await fetch('/api/admin/kore-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, section }),
      });
      if (res.ok) {
        fetchKoreTrendProducts(section);
        setKoreSearch('');
        setKoreSearchResults([]);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const removeFromKoreTrends = async (curatedId: number, section: 'kore_trend' | 'makeup') => {
    try {
      const res = await fetch(`/api/admin/kore-trends?id=${curatedId}`, { method: 'DELETE' });
      if (res.ok) fetchKoreTrendProducts(section);
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };

  const getStatusInfo = (status: string) => ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price || 0);
  };

  const printOrder = (order: Order) => {
    const w = window.open('', '_blank');
    if (!w) return;
    
    const itemsHtml = order.items?.map(item => {
      const productInfo = allProducts.find(p => 
        p.name.toLowerCase() === item.name?.toLowerCase() ||
        p.name.toLowerCase().includes(item.name?.toLowerCase()) ||
        item.name?.toLowerCase().includes(p.name.toLowerCase())
      );
      const brand = item.brand || productInfo?.brand || '-';
      const barcode = item.barcode || productInfo?.barcode || '-';
      return `<tr><td><strong style="color:#10b981">${brand}</strong><br>${item.name}<br><small style="color:#666">Barkod: ${barcode}</small></td><td>${item.quantity}</td><td>${formatPrice(item.price)}</td><td>${formatPrice(item.price * item.quantity)}</td></tr>`;
    }).join('') || '';
    
    w.document.write(`<!DOCTYPE html><html><head><title>Sipariş #${order.orderId?.slice(-8)}</title>
    <style>body{font-family:system-ui;padding:20px;max-width:800px;margin:0 auto}
    .header{border-bottom:2px solid #10b981;padding-bottom:15px;margin-bottom:20px}
    .logo{font-size:24px;font-weight:bold;color:#10b981}
    table{width:100%;border-collapse:collapse;margin:20px 0}
    th,td{padding:10px;border:1px solid #e5e7eb;text-align:left}
    th{background:#f9fafb}
    .total{font-size:18px;font-weight:bold;text-align:right;color:#10b981}</style></head>
    <body><div class="header"><div class="logo">MERUMY</div>
    <p>Sipariş #${order.orderId?.slice(-8).toUpperCase()} • ${formatDate(order.createdAt)}</p></div>
    <h3>Müşteri</h3><p>${order.customerName}<br>${order.customerPhone}<br>${order.customerEmail || ''}</p>
    <h3>Adres</h3><p>${order.address || '-'}</p>
    <h3>Ürünler</h3><table><thead><tr><th>Ürün (Marka / Barkod)</th><th>Adet</th><th>Fiyat</th><th>Toplam</th></tr></thead>
    <tbody>${itemsHtml}</tbody></table>
    <p class="total">Genel Toplam: ${formatPrice(order.total)}</p>
    <script>window.print()</script></body></html>`);
    w.document.close();
  };

  // Export functions
  const exportToCSV = () => {
    const BOM = '\uFEFF';
    const headers = ['Sıra', 'Marka', 'Ürün Adı', 'Barkod', 'Satış Adedi', 'Toplam Gelir', 'Sipariş Sayısı'];
    const filteredReport = productSalesReport.filter(p => !reportSearch || p.productName.toLowerCase().includes(reportSearch.toLowerCase()));
    const rows = filteredReport.map((p, i) => [
      i + 1, 
      `"${(p.brand || '-').replace(/"/g, '""')}"`,
      `"${p.productName.replace(/"/g, '""')}"`, 
      `"${(p.barcode || '-').replace(/"/g, '""')}"`,
      p.totalQuantity, 
      p.totalRevenue.toFixed(2), 
      p.orderCount
    ].join(','));
    const content = BOM + headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'urun-satis-raporu.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    logActivity('report_exported', 'Satış raporu CSV olarak indirildi', 'report');
  };

  // Filter report
  const filteredReport = productSalesReport.filter(p => !reportSearch || p.productName.toLowerCase().includes(reportSearch.toLowerCase()));
  const reportTotalPages = Math.ceil(filteredReport.length / ITEMS_PER_PAGE);
  const paginatedReport = filteredReport.slice((reportPage - 1) * ITEMS_PER_PAGE, reportPage * ITEMS_PER_PAGE);
  const orderTotalPages = Math.ceil(orderTotal / ITEMS_PER_PAGE);
  const userTotalPages = Math.ceil(userTotal / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col',
          'fixed lg:static inset-y-0 left-0 z-50',
          mobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 w-72',
          sidebarOpen ? 'lg:w-64' : 'lg:w-20',
        ].join(' ')}
      >
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            {(sidebarOpen || mobileSidebarOpen) && (
              <div className="flex-1 min-w-0">
                <span className="text-white font-semibold text-lg block truncate">Merumy</span>
                {currentUserName && <span className="text-slate-400 text-xs truncate block">{currentUserName}</span>}
              </div>
            )}
            {/* Mobile close button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden ml-auto p-1 text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'orders', icon: '📦', label: 'Siparişler', count: orderStats?.total },
            { id: 'products', icon: '🛍️', label: 'Ürün Yönetimi', count: dbProductsTotal || undefined },
            { id: 'users', icon: '👥', label: 'Kullanıcılar' },
            { id: 'reports', icon: '📊', label: 'Satış Raporu' },
            { id: 'hero', icon: '🎨', label: 'Hero Yönetimi' },
            { id: 'kore-trends', icon: '🌸', label: 'Kore Trendleri' },
          ].filter(item => !allowedSections || allowedSections.includes(item.id)).map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {(sidebarOpen || mobileSidebarOpen) && (
                <>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs">{item.count}</span>
                  )}
                </>
              )}
            </button>
          ))}
          {/* Activity Log - Only for admin@merumy.com */}
          {currentUserEmail === 'admin@merumy.com' && (!allowedSections || allowedSections.includes('activity')) && (
            <button
              onClick={() => { setActiveTab('activity'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'activity'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <span className="text-xl flex-shrink-0">📋</span>
              {(sidebarOpen || mobileSidebarOpen) && (
                <>
                  <span className="flex-1 text-left font-medium">Yapılan İşlemler</span>
                  {activityTotal > 0 && (
                    <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full text-xs">{activityTotal}</span>
                  )}
                </>
              )}
            </button>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-700">
          {(sidebarOpen || mobileSidebarOpen) && currentUserEmail && (
            <div className="mb-3 px-3 py-2 bg-slate-700/50 rounded-lg">
              <p className="text-slate-400 text-xs truncate">{currentUserEmail}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            {(sidebarOpen || mobileSidebarOpen) && <span className="font-medium">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0 w-full">
        {/* Top Bar */}
        <header className="bg-slate-800/50 border-b border-slate-700 px-3 md:px-6 py-3 md:py-4 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 lg:hidden flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {/* Desktop sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hidden lg:flex flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-base md:text-xl font-semibold text-white truncate">
                {activeTab === 'orders' && '📦 Siparişler'}
                {activeTab === 'products' && '🛍️ Ürün Yönetimi'}
                {activeTab === 'users' && '👥 Kullanıcılar'}
                {activeTab === 'reports' && '📊 Satış Raporu'}
                {activeTab === 'hero' && '🎨 Hero Yönetimi'}
                {activeTab === 'activity' && '📋 Yapılan İşlemler'}
                {activeTab === 'kore-trends' && '🌸 Kore Trendleri'}
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a href="https://merumy.com" target="_blank" className="px-2 md:px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs md:text-sm transition-colors whitespace-nowrap">
                🌐 <span className="hidden sm:inline">Siteyi Görüntüle</span>
              </a>
            </div>
          </div>
        </header>

        <div className="p-3 md:p-6">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Stats */}
              {orderStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {[
                    { label: 'Toplam', value: orderStats.total, color: 'from-slate-500 to-slate-600' },
                    { label: 'Beklemede', value: orderStats.pending, color: 'from-amber-500 to-orange-500' },
                    { label: 'İşleniyor', value: orderStats.processing, color: 'from-blue-500 to-indigo-500' },
                    { label: 'Hazırlanıyor', value: orderStats.preparing, color: 'from-orange-500 to-red-500' },
                    { label: 'Kargoda', value: orderStats.shipped, color: 'from-purple-500 to-pink-500' },
                    { label: 'Teslim', value: orderStats.delivered, color: 'from-emerald-500 to-teal-500' },
                    { label: 'Gelir', value: formatPrice(orderStats.totalRevenue || 0), color: 'from-emerald-400 to-cyan-500', isPrice: true },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                        <span className="text-white text-lg font-bold">{stat.isPrice ? '₺' : stat.value}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.isPrice ? stat.value : stat.value || 0}</p>
                      <p className="text-slate-400 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Bulk Actions Bar */}
              {selectedOrders.size > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-400 font-medium">
                      ✓ {selectedOrders.size} sipariş seçildi
                    </span>
                    <button
                      onClick={() => setSelectedOrders(new Set())}
                      className="text-slate-400 hover:text-white text-sm"
                    >
                      Seçimi Temizle
                    </button>
                  </div>
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Toplu İşlem Yap
                  </button>
                </div>
              )}

              {/* Filters */}
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-3">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Sipariş no, müşteri adı veya telefon ara..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
                      className="w-full px-4 py-3 pl-11 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
                    className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Tüm Durumlar</option>
                    {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <button onClick={() => { setOrderPage(1); fetchOrders(); }} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">
                    Ara
                  </button>
                </div>
                {/* Date Range Filter */}
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <span className="text-slate-400 text-sm whitespace-nowrap">📅 Tarih Aralığı:</span>
                  <input
                    type="date"
                    value={orderDateFrom}
                    onChange={(e) => setOrderDateFrom(e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-slate-500 text-sm">—</span>
                  <input
                    type="date"
                    value={orderDateTo}
                    onChange={(e) => setOrderDateTo(e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => { setOrderPage(1); fetchOrders(); }}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-xl text-sm transition-colors"
                  >
                    Filtrele
                  </button>
                  {(orderDateFrom || orderDateTo) && (
                    <button
                      onClick={() => { setOrderDateFrom(''); setOrderDateTo(''); setTimeout(() => { setOrderPage(1); fetchOrders(); }, 100); }}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm transition-colors"
                    >
                      ✕ Temizle
                    </button>
                  )}
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="py-4 px-4 text-slate-400">
                          <input
                            type="checkbox"
                            checked={orders.length > 0 && selectedOrders.size === orders.length}
                            onChange={toggleAllOrders}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                          />
                        </th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Sipariş</th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Müşteri</th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Ürün</th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Toplam</th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Durum</th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Tarih</th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {orders.map(order => {
                        const status = getStatusInfo(order.status);
                        const isSelected = selectedOrders.has(order.orderId);
                        return (
                          <tr key={order.id} className={`hover:bg-slate-700/30 transition-colors ${isSelected ? 'bg-emerald-500/5' : ''}`}>
                            <td className="py-4 px-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleOrderSelection(order.orderId)}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-mono text-emerald-400 font-medium">#{order.orderId?.slice(-8).toUpperCase()}</span>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-white font-medium">{order.customerName}</p>
                              <p className="text-slate-400 text-sm">{order.customerPhone}</p>
                            </td>
                            <td className="py-4 px-4 text-slate-300">{order.items?.length || 0} ürün</td>
                            <td className="py-4 px-4 text-white font-semibold">{formatPrice(order.total)}</td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${status.lightColor}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-400 text-sm">{formatDate(order.createdAt)}</td>
                            <td className="py-4 px-4">
                              <button onClick={() => { setSelectedOrder(order); logActivity('order_viewed', `Sipariş görüntülendi: #${order.orderId?.slice(-8).toUpperCase()} - ${order.customerName}`, 'order', order.orderId); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
                                Detay
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {orderTotalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                    <p className="text-slate-400 text-sm">Sayfa {orderPage} / {orderTotalPages} (Toplam {orderTotal})</p>
                    <div className="flex gap-2">
                      <button disabled={orderPage === 1} onClick={() => setOrderPage(p => p - 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm">Önceki</button>
                      <button disabled={orderPage === orderTotalPages} onClick={() => setOrderPage(p => p + 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm">Sonraki</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB - DB-BASED MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <p className="text-3xl font-bold text-white">{dbProductsTotal}</p>
                  <p className="text-slate-400 text-sm">Toplam Ürün</p>
                </div>
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <p className="text-3xl font-bold text-emerald-400">{dbProducts.filter(p => p.stockStatus !== 'out_of_stock' && p.isActive).length}</p>
                  <p className="text-slate-400 text-sm">Stokta (Bu Sayfa)</p>
                </div>
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <p className="text-3xl font-bold text-red-400">{dbProducts.filter(p => p.stockStatus === 'out_of_stock').length}</p>
                  <p className="text-slate-400 text-sm">Stok Dışı (Bu Sayfa)</p>
                </div>
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <p className="text-3xl font-bold text-purple-400">{dbBrands.length}</p>
                  <p className="text-slate-400 text-sm">Marka</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <div className="flex flex-col md:flex-row gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 relative">
                    <input
                      type="text"
                      placeholder="Ürün adı, marka veya barkod ara..."
                      value={productSearch}
                      onChange={(e) => { setProductSearch(e.target.value); setDbProductsPage(1); }}
                      onKeyDown={(e) => e.key === 'Enter' && fetchDbProducts()}
                      className="w-full px-4 py-3 pl-11 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                    />
                    <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <select
                    value={productBrandFilter}
                    onChange={(e) => { setProductBrandFilter(e.target.value); setDbProductsPage(1); }}
                    className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Tüm Markalar</option>
                    {dbBrands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => { setProductCategoryFilter(e.target.value); setDbProductsPage(1); }}
                    className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {dbCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={productStockFilter}
                    onChange={(e) => { setProductStockFilter(e.target.value); setDbProductsPage(1); }}
                    className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Tüm Stok</option>
                    <option value="in_stock">Stokta</option>
                    <option value="out_of_stock">Stok Dışı</option>
                    <option value="low_stock">Az Stok</option>
                  </select>
                  <button onClick={() => { setDbProductsPage(1); fetchDbProducts(); }} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">
                    Ara
                  </button>
                </div>
              </div>

              {productLoadError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">{productLoadError}</div>
              )}

              {/* Products Table */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm w-16">Görsel</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Ürün</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Marka</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Fiyat</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Stok</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Durum</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {dbProducts.map(product => {
                        const inStock = product.stockStatus !== 'out_of_stock' && product.isActive !== false;
                        return (
                          <tr key={product.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700">
                                <img
                                  src={product.image || '/gorselsizurun.jpg'}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/gorselsizurun.jpg'; }}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-white font-medium text-sm line-clamp-2 max-w-xs">{product.name}</p>
                              <p className="text-slate-500 text-xs font-mono mt-0.5">{product.barcode}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-emerald-400 text-sm">{product.brand || '-'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-white font-semibold text-sm">{formatPrice(product.price)}</p>
                              {product.comparePrice > product.price && (
                                <p className="text-slate-500 text-xs line-through">{formatPrice(product.comparePrice)}</p>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-sm font-medium ${product.stock > 5 ? 'text-emerald-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                                {product.stock ?? '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => toggleStockQuick(product)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                                  inStock 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30' 
                                    : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'
                                }`}
                                title={inStock ? 'Stoku kapat' : 'Stoku aç'}
                              >
                                {inStock ? '✓ Stokta' : '✕ Stok Dışı'}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => openEditModal(product)}
                                className="px-4 py-2 bg-slate-700 hover:bg-emerald-500/20 hover:text-emerald-400 text-white rounded-lg text-sm transition-colors"
                              >
                                ✏️ Düzenle
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {dbProducts.length === 0 && !productLoadError && (
                  <div className="py-12 text-center text-slate-500">
                    <p className="text-4xl mb-3">🔍</p>
                    <p>Ürün bulunamadı</p>
                  </div>
                )}

                {/* Pagination */}
                {dbProductsTotalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                    <p className="text-slate-400 text-sm">Sayfa {dbProductsPage} / {dbProductsTotalPages} (Toplam {dbProductsTotal})</p>
                    <div className="flex gap-2">
                      <button disabled={dbProductsPage === 1} onClick={() => setDbProductsPage(p => p - 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg text-sm">Önceki</button>
                      <button disabled={dbProductsPage === dbProductsTotalPages} onClick={() => setDbProductsPage(p => p + 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg text-sm">Sonraki</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-3">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Ad, e-posta veya telefon ara..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                      className="w-full px-4 py-3 pl-11 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                    />
                    <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <select
                    value={userSort}
                    onChange={(e) => { setUserSort(e.target.value); setUserPage(1); }}
                    className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="newest">En Yeni Kayıt</option>
                    <option value="oldest">En Eski Kayıt</option>
                    <option value="most_orders">En Çok Sipariş</option>
                    <option value="most_spent">En Çok Harcama</option>
                  </select>
                  <button onClick={() => { setUserPage(1); fetchUsers(); }} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium">Ara</button>
                </div>
                {/* Date Range Filter for registration */}
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <span className="text-slate-400 text-sm whitespace-nowrap">📅 Kayıt Tarihi:</span>
                  <input
                    type="date"
                    value={userDateFrom}
                    onChange={(e) => setUserDateFrom(e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-slate-500 text-sm">—</span>
                  <input
                    type="date"
                    value={userDateTo}
                    onChange={(e) => setUserDateTo(e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => { setUserPage(1); fetchUsers(); }}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-xl text-sm transition-colors"
                  >
                    Filtrele
                  </button>
                  {(userDateFrom || userDateTo) && (
                    <button
                      onClick={() => { setUserDateFrom(''); setUserDateTo(''); setTimeout(() => { setUserPage(1); fetchUsers(); }, 100); }}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm transition-colors"
                    >
                      ✕ Temizle
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Kullanıcı</th>
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Telefon</th>
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Sipariş</th>
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Harcama</th>
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Kayıt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-700/30">
                          <td className="py-4 px-6">
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                          </td>
                          <td className="py-4 px-6 text-slate-300">{user.phone || '-'}</td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">{user.orderCount || 0}</span>
                          </td>
                          <td className="py-4 px-6 text-white font-semibold">{formatPrice(user.totalSpent || 0)}</td>
                          <td className="py-4 px-6 text-slate-400 text-sm">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {userTotalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                    <p className="text-slate-400 text-sm">Sayfa {userPage} / {userTotalPages}</p>
                    <div className="flex gap-2">
                      <button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg text-sm">Önceki</button>
                      <button disabled={userPage === userTotalPages} onClick={() => setUserPage(p => p + 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg text-sm">Sonraki</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6">
                  <p className="text-emerald-100 text-sm mb-1">Toplam Satılan</p>
                  <p className="text-white text-3xl font-bold">{productSalesReport.reduce((s, p) => s + p.totalQuantity, 0).toLocaleString('tr-TR')} adet</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6">
                  <p className="text-blue-100 text-sm mb-1">Toplam Gelir</p>
                  <p className="text-white text-3xl font-bold">{formatPrice(productSalesReport.reduce((s, p) => s + p.totalRevenue, 0))}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6">
                  <p className="text-purple-100 text-sm mb-1">Ürün Çeşidi</p>
                  <p className="text-white text-3xl font-bold">{productSalesReport.length}</p>
                </div>
              </div>

              {/* Filters & Export */}
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-3">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Ürün adı ara..."
                      value={reportSearch}
                      onChange={(e) => { setReportSearch(e.target.value); setReportPage(1); }}
                      className="w-full px-4 py-3 pl-11 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400"
                    />
                    <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button onClick={fetchAllOrdersForReport} disabled={reportLoading} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl">
                    {reportLoading ? 'Yükleniyor...' : '🔄 Yenile'}
                  </button>
                  <button onClick={exportToCSV} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium">
                    📥 CSV İndir
                  </button>
                </div>
                {/* Date Range Filter */}
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <span className="text-slate-400 text-sm whitespace-nowrap">📅 Sipariş Tarihi:</span>
                  <input
                    type="date"
                    value={reportDateFrom}
                    onChange={(e) => setReportDateFrom(e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-slate-500 text-sm">—</span>
                  <input
                    type="date"
                    value={reportDateTo}
                    onChange={(e) => setReportDateTo(e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => { setReportPage(1); fetchAllOrdersForReport(); }}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-xl text-sm transition-colors"
                  >
                    Filtrele
                  </button>
                  {(reportDateFrom || reportDateTo) && (
                    <button
                      onClick={() => { setReportDateFrom(''); setReportDateTo(''); setTimeout(() => fetchAllOrdersForReport(), 100); }}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm transition-colors"
                    >
                      ✕ Temizle
                    </button>
                  )}
                </div>
              </div>

              {/* Report Table */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">#</th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Marka</th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Ürün Adı</th>
                        <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Barkod</th>
                        <th className="text-right py-4 px-4 text-slate-400 font-medium text-sm">Satış</th>
                        <th className="text-right py-4 px-4 text-slate-400 font-medium text-sm">Gelir</th>
                        <th className="text-right py-4 px-4 text-slate-400 font-medium text-sm">Sipariş</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {paginatedReport.map((p, i) => {
                        const rank = (reportPage - 1) * ITEMS_PER_PAGE + i + 1;
                        return (
                          <tr key={i} className="hover:bg-slate-700/30">
                            <td className="py-4 px-4">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                rank === 1 ? 'bg-yellow-500 text-black' :
                                rank === 2 ? 'bg-slate-400 text-black' :
                                rank === 3 ? 'bg-orange-500 text-black' :
                                'bg-slate-700 text-white'
                              }`}>{rank}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-emerald-400 text-sm font-medium">{p.brand || '-'}</span>
                            </td>
                            <td className="py-4 px-4 text-white max-w-xs">{p.productName}</td>
                            <td className="py-4 px-4">
                              <span className="text-slate-400 text-xs font-mono">{p.barcode || '-'}</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="text-emerald-400 font-bold text-lg">{p.totalQuantity}</span>
                              <span className="text-slate-500 text-sm ml-1">adet</span>
                            </td>
                            <td className="py-4 px-4 text-right text-white font-semibold">{formatPrice(p.totalRevenue)}</td>
                            <td className="py-4 px-4 text-right text-slate-400">{p.orderCount}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {reportTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 py-4 border-t border-slate-700">
                    <button disabled={reportPage === 1} onClick={() => setReportPage(p => p - 1)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg">Önceki</button>
                    <span className="text-slate-400">Sayfa {reportPage} / {reportTotalPages}</span>
                    <button disabled={reportPage === reportTotalPages} onClick={() => setReportPage(p => p + 1)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg">Sonraki</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HERO TAB */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-white">🎨 Hero Section Yönetimi</h2>
                    <p className="text-slate-400 text-sm mt-1">Ana sayfadaki slider görsellerini ve linklerini düzenleyin. Görsel yükleyin veya yol girin. Değişiklikler sitede anlık yansır.</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={addNewHeroSlide}
                      className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                    >
                      ➕ Yeni Slayt Ekle
                    </button>
                    <button
                      onClick={saveHeroSlides}
                      disabled={heroSaving || heroSlides.length === 0}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      {heroSaving ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Kaydediliyor...</>
                      ) : '💾 Kaydet'}
                    </button>
                  </div>
                </div>
                {heroSaveSuccess && (
                  <div className="mt-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-center font-medium">
                    ✓ Hero slaytları başarıyla güncellendi! Değişiklikler sitede canlı olarak yansıtıldı.
                  </div>
                )}
              </div>

              {heroLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {heroSlides.map((slide, idx) => (
                    <div key={slide.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                      <div className="flex items-center gap-4 p-4 border-b border-slate-700 bg-slate-700/30">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">Slayt {idx + 1}</p>
                          <p className="text-slate-400 text-xs">{slide.isActive ? '✅ Aktif' : '❌ Pasif'}</p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-slate-400 text-sm">Aktif</span>
                          <div
                            onClick={() => {
                              const updated = [...heroSlides];
                              updated[idx] = { ...updated[idx], isActive: !updated[idx].isActive };
                              setHeroSlides(updated);
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${slide.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${slide.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                          </div>
                        </label>
                        <button
                          onClick={() => deleteHeroSlide(slide.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Slaytı Sil"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Desktop Image */}
                        <div>
                          <label className="block text-slate-400 text-sm mb-2">🖥️ Masaüstü Görsel</label>
                          {/* Preview */}
                          {slide.desktopImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={slide.desktopImage} alt="desktop" className="w-full h-28 object-cover rounded-xl mb-2 border border-slate-600" onError={(e: any) => { e.target.style.display='none' }} />
                          )}
                          {/* Upload Button */}
                          <label className="block mb-2">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadHeroImage(file, idx, 'desktopImage');
                                e.target.value = '';
                              }}
                            />
                            <span className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer text-sm transition-all ${heroUploadLoading === `${idx}-desktopImage` ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-600 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/5'}`}>
                              {heroUploadLoading === `${idx}-desktopImage` ? (
                                <><div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />Yükleniyor...</>
                              ) : (
                                <>📤 Görsel Yükle (max 5MB)</>
                              )}
                            </span>
                          </label>
                          {/* Or path input */}
                          <input
                            type="text"
                            value={slide.desktopImage}
                            onChange={(e) => {
                              const updated = [...heroSlides];
                              updated[idx] = { ...updated[idx], desktopImage: e.target.value };
                              setHeroSlides(updated);
                            }}
                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="/herosection/herosection01.jpg"
                          />
                          <p className="text-slate-500 text-xs mt-1">Görsel yükleyin veya yol girin</p>
                        </div>

                        {/* Mobile Image */}
                        <div>
                          <label className="block text-slate-400 text-sm mb-2">📱 Mobil Görsel</label>
                          {/* Preview */}
                          {slide.mobileImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={slide.mobileImage} alt="mobile" className="w-full h-28 object-cover rounded-xl mb-2 border border-slate-600" onError={(e: any) => { e.target.style.display='none' }} />
                          )}
                          {/* Upload Button */}
                          <label className="block mb-2">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadHeroImage(file, idx, 'mobileImage');
                                e.target.value = '';
                              }}
                            />
                            <span className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed cursor-pointer text-sm transition-all ${heroUploadLoading === `${idx}-mobileImage` ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-600 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/5'}`}>
                              {heroUploadLoading === `${idx}-mobileImage` ? (
                                <><div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />Yükleniyor...</>
                              ) : (
                                <>📤 Görsel Yükle (max 5MB)</>
                              )}
                            </span>
                          </label>
                          {/* Or path input */}
                          <input
                            type="text"
                            value={slide.mobileImage}
                            onChange={(e) => {
                              const updated = [...heroSlides];
                              updated[idx] = { ...updated[idx], mobileImage: e.target.value };
                              setHeroSlides(updated);
                            }}
                            className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="/mobilsliderlar/slider1.jpg"
                          />
                          <p className="text-slate-500 text-xs mt-1">Görsel yükleyin veya yol girin</p>
                        </div>

                        {/* Link */}
                        <div className="md:col-span-2">
                          <label className="block text-slate-400 text-sm mb-2">🔗 Tıklanınca Gidilecek Link</label>
                          <input
                            type="text"
                            value={slide.link || ''}
                            onChange={(e) => {
                              const updated = [...heroSlides];
                              updated[idx] = { ...updated[idx], link: e.target.value || null };
                              setHeroSlides(updated);
                            }}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="/product/urun-slug veya /shop veya /booster-pro"
                          />
                          <p className="text-slate-500 text-xs mt-1">Boş bırakılırsa slayt tıklanamaz hale gelir</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* KORE TRENDLERİ MANAGEMENT TAB */}
          {activeTab === 'kore-trends' && (
            <div className="space-y-6">
              {/* Section Switcher */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">🌸 Kore Trendleri Yönetimi</h2>
                <p className="text-slate-400 text-sm mb-5">Anasayfadaki Kore Trendleri, En Çok Satanlar ve Merumy.com'a Özel bölümlerinde gösterilecek ürünleri seçin. Her sayfa yenilemesinde bu listeden rastgele ürünler gösterilir.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setKoreSection('kore_trend'); fetchKoreTrendProducts('kore_trend'); setKoreSearch(''); setKoreSearchResults([]); }}
                    className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${koreSection === 'kore_trend' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    🌸 Kore Trendleri / En Çok Satanlar / Özel
                  </button>
                  <button
                    onClick={() => { setKoreSection('makeup'); fetchKoreTrendProducts('makeup'); setKoreSearch(''); setKoreSearchResults([]); }}
                    className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${koreSection === 'makeup' ? 'bg-pink-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    💄 Korean Make Up
                  </button>
                </div>
              </div>

              {/* Search & Add */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-white font-semibold mb-3">Ürün Ekle</h3>
                <div className="relative">
                  <input
                    type="text"
                    value={koreSearch}
                    onChange={(e) => { setKoreSearch(e.target.value); searchProductsForKore(e.target.value); }}
                    placeholder="Ürün adı veya marka ara..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  {koreSearchLoading && (
                    <div className="absolute right-3 top-3.5 w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  )}
                </div>
                {koreSearchResults.length > 0 && (
                  <div className="mt-2 bg-slate-700 rounded-xl border border-slate-600 max-h-60 overflow-y-auto divide-y divide-slate-600">
                    {koreSearchResults.map((p: any) => {
                      const alreadyAdded = koreTrendProducts.some(k => k.productId === p.id);
                      return (
                        <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-600/50">
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">{p.name}</p>
                            <p className="text-slate-400 text-xs">{p.brand} • {Number(p.price).toLocaleString('tr-TR')} ₺</p>
                          </div>
                          <button
                            onClick={() => !alreadyAdded && addToKoreTrends(p.id, koreSection)}
                            disabled={alreadyAdded}
                            className={`ml-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${alreadyAdded ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                          >
                            {alreadyAdded ? '✓ Eklendi' : '+ Ekle'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Current List */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="text-white font-semibold">
                    {koreSection === 'kore_trend' ? '🌸 Kore Trendleri Listesi' : '💄 Makyaj Ürünleri Listesi'}
                    <span className="ml-2 text-slate-400 text-sm font-normal">({koreTrendProducts.length} ürün)</span>
                  </h3>
                  <button onClick={() => fetchKoreTrendProducts(koreSection)} className="text-slate-400 hover:text-white text-sm">🔄 Yenile</button>
                </div>
                {koreLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                ) : koreTrendProducts.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-slate-500">Henüz ürün eklenmemiş</p>
                    <p className="text-slate-600 text-sm mt-1">Yukarıdan ürün arayarak ekleyebilirsiniz</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700">
                    {koreTrendProducts.map((item: any) => (
                      <div key={item.curatedId} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-700/30">
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">{item.name}</p>
                          <p className="text-slate-400 text-xs">{item.brand} • {Number(item.price).toLocaleString('tr-TR')} ₺
                            {item.stockStatus === 'out_of_stock' && <span className="ml-2 text-red-400">• Stokta Yok</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromKoreTrends(item.curatedId, koreSection)}
                          className="ml-4 p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex-shrink-0"
                          title="Listeden Çıkar"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* DISCOUNT CODES TAB */}
          {activeTab === 'discount-codes' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-1">🏷️ İndirim Kodu Yönetimi</h2>
                <p className="text-slate-400 text-sm">İndirim kodları ekleyin, düzenleyin veya silin. Kodlar anlık olarak uygulanır.</p>
              </div>

              {/* Add New Code */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">➕ Yeni İndirim Kodu Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Kod *</label>
                    <input
                      type="text"
                      placeholder="ÖRNEK10"
                      value={discountForm.code}
                      onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">İndirim Tipi *</label>
                    <select
                      value={discountForm.type}
                      onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="amount">Sabit Tutar (₺)</option>
                      <option value="percent">Yüzde (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">İndirim Değeri * ({discountForm.type === 'percent' ? '%' : '₺'})</label>
                    <input
                      type="number"
                      placeholder={discountForm.type === 'percent' ? '10' : '100'}
                      value={discountForm.value}
                      onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Min. Sepet Tutarı (₺)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={discountForm.minAmount}
                      onChange={(e) => setDiscountForm({ ...discountForm, minAmount: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Maks. Kullanım (boş = sınırsız)</label>
                    <input
                      type="number"
                      placeholder="Sınırsız"
                      value={discountForm.maxUses}
                      onChange={(e) => setDiscountForm({ ...discountForm, maxUses: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">Bitiş Tarihi (boş = süresiz)</label>
                    <input
                      type="datetime-local"
                      value={discountForm.expiresAt}
                      onChange={(e) => setDiscountForm({ ...discountForm, expiresAt: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-sm mb-1">Notlar (opsiyonel)</label>
                    <input
                      type="text"
                      placeholder="Bu kod hakkında not..."
                      value={discountForm.notes}
                      onChange={(e) => setDiscountForm({ ...discountForm, notes: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                {discountError && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">{discountError}</div>
                )}
                {discountSuccess && (
                  <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">✓ {discountSuccess}</div>
                )}
                <button
                  onClick={saveDiscountCode}
                  disabled={discountSaving}
                  className="mt-4 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  {discountSaving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Ekleniyor...</> : '💾 Kodu Ekle'}
                </button>
              </div>

              {/* Codes List */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="text-white font-semibold">Aktif İndirim Kodları ({discountCodes.length})</h3>
                  <button onClick={fetchDiscountCodes} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">🔄</button>
                </div>
                {discountLoading ? (
                  <div className="p-12 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                ) : discountCodes.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <p className="text-lg">Henüz indirim kodu yok</p>
                    <p className="text-sm mt-1">Yukarıdan yeni kod ekleyebilirsiniz</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">KOD</th>
                          <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">İNDİRİM</th>
                          <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">MİN. TUTAR</th>
                          <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">KULLANIM</th>
                          <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">BİTİŞ</th>
                          <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">DURUM</th>
                          <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">İŞLEM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {discountCodes.map((dc: any) => (
                          <tr key={dc.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-mono font-bold text-white">{dc.code}</span>
                              {dc.notes && <p className="text-slate-500 text-xs mt-0.5">{dc.notes}</p>}
                            </td>
                            <td className="px-4 py-3 text-emerald-400 font-semibold">
                              {dc.type === 'percent' ? `%${dc.value}` : `₺${dc.value}`}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {dc.min_amount > 0 ? `₺${dc.min_amount}` : '-'}
                            </td>
                            <td className="px-4 py-3 text-slate-300 text-sm">
                              {dc.used_count}/{dc.max_uses ?? '∞'}
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs">
                              {dc.expires_at ? new Date(dc.expires_at).toLocaleDateString('tr-TR') : 'Süresiz'}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleDiscountCode(dc.id, dc.is_active)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${dc.is_active ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40' : 'bg-slate-600 text-slate-400 hover:bg-slate-500'}`}
                              >
                                {dc.is_active ? '✓ Aktif' : '✗ Pasif'}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => deleteDiscountCode(dc.id)}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Sil"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTIVITY LOG TAB (admin@merumy.com only) */}
          {activeTab === 'activity' && currentUserEmail === 'admin@merumy.com' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">📋 Yapılan İşlemler</h2>
                    <p className="text-slate-400 text-sm mt-1">Tüm yönetici kullanıcıların gerçekleştirdiği işlemler ({activityTotal} kayıt)</p>
                  </div>
                  <button
                    onClick={fetchActivityLogs}
                    disabled={activityLoading}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2"
                  >
                    {activityLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🔄'} Yenile
                  </button>
                </div>
              </div>

              {activityLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
                  <p className="text-slate-500 text-lg">Henüz kayıtlı işlem yok</p>
                  <p className="text-slate-600 text-sm mt-2">İşlemler gerçekleştirildikçe burada görünecek</p>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                  <div className="divide-y divide-slate-700">
                    {activityLogs.map((log) => {
                      const actionLabels: Record<string, { icon: string; label: string; color: string }> = {
                        product_updated: { icon: '✏️', label: 'Ürün Güncellendi', color: 'text-emerald-400' },
                        stock_toggled: { icon: '📦', label: 'Stok Değiştirildi', color: 'text-yellow-400' },
                        report_exported: { icon: '📊', label: 'Rapor İndirildi', color: 'text-blue-400' },
                        hero_updated: { icon: '🎨', label: 'Hero Güncellendi', color: 'text-purple-400' },
                        order_viewed: { icon: '👁️', label: 'Sipariş Görüntülendi', color: 'text-slate-400' },
                        order_status_updated: { icon: '🔄', label: 'Sipariş Durumu', color: 'text-orange-400' },
                      };
                      const actionInfo = actionLabels[log.action] || { icon: '⚡', label: log.action, color: 'text-slate-400' };
                      
                      return (
                        <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-slate-700/30 transition-colors">
                          <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                            {actionInfo.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-medium ${actionInfo.color}`}>{actionInfo.label}</span>
                              <span className="text-slate-500 text-xs">•</span>
                              <span className="text-slate-400 text-xs font-medium">{log.user_email}</span>
                            </div>
                            {log.description && (
                              <p className="text-slate-300 text-sm mt-0.5 truncate">{log.description}</p>
                            )}
                          </div>
                          <div className="text-slate-500 text-xs flex-shrink-0 text-right">
                            {new Date(log.created_at).toLocaleString('tr-TR', {
                              day: '2-digit', month: '2-digit', year: '2-digit',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex justify-between items-start sticky top-0 bg-slate-800 z-10">
              <div>
                <h2 className="text-xl font-bold text-white">Sipariş #{selectedOrder.orderId?.slice(-8).toUpperCase()}</h2>
                <p className="text-slate-400 text-sm mt-1">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => printOrder(selectedOrder)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm">🖨️ Yazdır</button>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">✕</button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Müşteri</p>
                  <p className="text-white font-medium">{selectedOrder.customerName}</p>
                  <p className="text-slate-300 text-sm">{selectedOrder.customerPhone}</p>
                  <p className="text-slate-300 text-sm">{selectedOrder.customerEmail}</p>
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <p className="text-slate-400 text-sm mb-1">Adres</p>
                  <p className="text-white text-sm">{selectedOrder.address || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-3">Ürünler</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => {
                    const productInfo = allProducts.find(p => 
                      p.name.toLowerCase() === item.name?.toLowerCase() ||
                      p.name.toLowerCase().includes(item.name?.toLowerCase()) ||
                      item.name?.toLowerCase().includes(p.name.toLowerCase())
                    );
                    const brand = item.brand || productInfo?.brand || '-';
                    const barcode = item.barcode || productInfo?.barcode || '-';
                    
                    return (
                      <div key={i} className="bg-slate-700/50 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-emerald-400 text-xs font-medium mb-1">{brand}</p>
                            <p className="text-white font-medium">{item.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-slate-400 text-sm">x{item.quantity}</p>
                              <p className="text-slate-500 text-xs">Barkod: {barcode}</p>
                            </div>
                          </div>
                          <p className="text-emerald-400 font-semibold">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center bg-emerald-500/20 rounded-xl p-4 border border-emerald-500/30">
                    <p className="text-white font-semibold">Toplam</p>
                    <p className="text-emerald-400 font-bold text-xl">{formatPrice(selectedOrder.total)}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-3">Durum Güncelle</p>
                <p className="text-yellow-400 text-xs mb-2">⚡ Durum değiştiğinde müşteriye otomatik mail gönderilir</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ORDER_STATUSES.map(status => (
                    <button
                      key={status.value}
                      onClick={() => updateOrderStatus(selectedOrder.orderId, status.value)}
                      disabled={updating || selectedOrder.status === status.value}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                        selectedOrder.status === status.value
                          ? `${status.lightColor} ring-2 ring-offset-2 ring-offset-slate-800`
                          : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                      } disabled:opacity-50`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Toplu Sipariş Güncelleme</h2>
              <p className="text-slate-400 text-sm mt-1">{selectedOrders.size} sipariş seçildi</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Yeni Durum</label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Durum Seçin</option>
                  {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {bulkStatus === 'shipped' && (
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Kargo Takip No (Opsiyonel)</label>
                  <input
                    type="text"
                    value={bulkTrackingNumber}
                    onChange={(e) => setBulkTrackingNumber(e.target.value)}
                    placeholder="Tüm siparişlere aynı takip no uygulanır"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400"
                  />
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulkSendEmail}
                  onChange={(e) => setBulkSendEmail(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-white">Müşterilere bilgilendirme maili gönder</span>
              </label>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-amber-400 text-sm">
                  ⚠️ Bu işlem {selectedOrders.size} siparişi aynı anda güncelleyecektir.
                  {bulkSendEmail && ' Tüm müşterilere mail gönderilecektir.'}
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
              >
                İptal
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={!bulkStatus || bulkUpdating}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium"
              >
                {bulkUpdating ? 'Güncelleniyor...' : `${selectedOrders.size} Siparişi Güncelle`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      {editingProduct && editForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
              <div>
                <h2 className="text-xl font-bold text-white">Ürün Düzenle</h2>
                <p className="text-slate-400 text-sm mt-1 line-clamp-1">{editingProduct.name}</p>
              </div>
              <button onClick={closeEditModal} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 text-xl">✕</button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Product image preview */}
              {editingProduct.image && (
                <div className="flex items-center gap-4">
                  <img
                    src={editingProduct.image}
                    alt={editingProduct.name}
                    className="w-20 h-20 rounded-xl object-cover bg-slate-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/gorselsizurun.jpg'; }}
                  />
                  <div>
                    <p className="text-slate-400 text-xs">Mevcut Görsel</p>
                    <p className="text-slate-500 text-xs mt-1 break-all">{editingProduct.image}</p>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">Ürün Adı *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Description - Rich Text Editor */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">Açıklama (HTML destekler)</label>
                {/* Formatting toolbar */}
                <div className="flex flex-wrap gap-1 mb-2 p-2 bg-slate-700 rounded-t-xl border border-slate-600 border-b-0">
                  {[
                    { label: 'B', title: 'Kalın', tag: 'b' },
                    { label: 'I', title: 'İtalik', tag: 'i' },
                    { label: 'U', title: 'Altı Çizili', tag: 'u' },
                  ].map(({ label, title, tag }) => (
                    <button
                      key={tag}
                      type="button"
                      title={title}
                      onClick={() => {
                        const ta = document.getElementById('desc-editor') as HTMLTextAreaElement;
                        if (!ta) return;
                        const start = ta.selectionStart;
                        const end = ta.selectionEnd;
                        const sel = ta.value.slice(start, end);
                        const newVal = ta.value.slice(0, start) + `<${tag}>${sel}</${tag}>` + ta.value.slice(end);
                        setEditForm({ ...editForm, description: newVal });
                        setTimeout(() => { ta.focus(); ta.selectionStart = start + tag.length + 2; ta.selectionEnd = start + tag.length + 2 + sel.length; }, 0);
                      }}
                      className="px-2 py-1 text-white text-sm font-bold bg-slate-600 hover:bg-slate-500 rounded transition-colors min-w-[28px]"
                    >{label}</button>
                  ))}
                  <button
                    type="button"
                    title="Liste maddesi"
                    onClick={() => {
                      const ta = document.getElementById('desc-editor') as HTMLTextAreaElement;
                      if (!ta) return;
                      const start = ta.selectionStart;
                      const ins = '<li>madde</li>';
                      const newVal = ta.value.slice(0, start) + ins + ta.value.slice(start);
                      setEditForm({ ...editForm, description: newVal });
                    }}
                    className="px-2 py-1 text-white text-xs bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                  >• Liste</button>
                  <button
                    type="button"
                    title="UL Listesi sar"
                    onClick={() => {
                      const ta = document.getElementById('desc-editor') as HTMLTextAreaElement;
                      if (!ta) return;
                      const start = ta.selectionStart; const end = ta.selectionEnd;
                      const sel = ta.value.slice(start, end);
                      const newVal = ta.value.slice(0, start) + `<ul>${sel}</ul>` + ta.value.slice(end);
                      setEditForm({ ...editForm, description: newVal });
                    }}
                    className="px-2 py-1 text-white text-xs bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                  >UL</button>
                  <button
                    type="button"
                    title="Paragraf"
                    onClick={() => {
                      const ta = document.getElementById('desc-editor') as HTMLTextAreaElement;
                      if (!ta) return;
                      const start = ta.selectionStart; const end = ta.selectionEnd;
                      const sel = ta.value.slice(start, end);
                      const newVal = ta.value.slice(0, start) + `<p>${sel}</p>` + ta.value.slice(end);
                      setEditForm({ ...editForm, description: newVal });
                    }}
                    className="px-2 py-1 text-white text-xs bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                  >&lt;p&gt;</button>
                  <button
                    type="button"
                    title="h3 başlık"
                    onClick={() => {
                      const ta = document.getElementById('desc-editor') as HTMLTextAreaElement;
                      if (!ta) return;
                      const start = ta.selectionStart; const end = ta.selectionEnd;
                      const sel = ta.value.slice(start, end);
                      const newVal = ta.value.slice(0, start) + `<h3>${sel}</h3>` + ta.value.slice(end);
                      setEditForm({ ...editForm, description: newVal });
                    }}
                    className="px-2 py-1 text-white text-xs bg-slate-600 hover:bg-slate-500 rounded transition-colors font-bold"
                  >H3</button>
                </div>
                <textarea
                  id="desc-editor"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-b-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y font-mono text-sm"
                  placeholder="Ürün açıklaması... HTML etiketi kullanabilirsiniz: <b>, <i>, <ul>, <li>, <p>, vb."
                />
                {/* HTML Preview */}
                {editForm.description && (
                  <details className="mt-2">
                    <summary className="text-slate-400 text-xs cursor-pointer hover:text-slate-300">👁️ HTML Önizleme</summary>
                    <div
                      className="mt-2 p-3 bg-white/5 border border-slate-600 rounded-xl text-slate-300 text-sm prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: editForm.description }}
                    />
                  </details>
                )}
              </div>

              {/* Price & Compare Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Fiyat (₺) *</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">İndirimden Önceki Fiyat (₺)</label>
                  <input
                    type="number"
                    value={editForm.comparePrice}
                    onChange={(e) => setEditForm({ ...editForm, comparePrice: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-slate-400 text-sm mb-2">Stok Miktarı</label>
                <input
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  min="0"
                />
                <p className="text-slate-500 text-xs mt-1">0 = Stok dışı, 1-5 = Az stok, 6+ = Stokta</p>
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Marka</label>
                  <input
                    type="text"
                    value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    list="brand-options"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <datalist id="brand-options">
                    {dbBrands.map(b => <option key={b} value={b} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Kategori</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    list="category-options"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <datalist id="category-options">
                    {dbCategories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              {/* Barcode & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Barkod</label>
                  <input
                    type="text"
                    value={editForm.barcode}
                    onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">SKU / Kod</label>
                  <input
                    type="text"
                    value={editForm.sku}
                    onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 rounded-xl p-4 flex-1">
                  <div
                    onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${editForm.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editForm.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Aktif / Satışta</p>
                    <p className="text-slate-400 text-xs">{editForm.isActive ? 'Sitede görünür' : 'Sitede gizli'}</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-slate-700/50 rounded-xl p-4 flex-1">
                  <div
                    onClick={() => setEditForm({ ...editForm, isFeatured: !editForm.isFeatured })}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${editForm.isFeatured ? 'bg-amber-500' : 'bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editForm.isFeatured ? 'translate-x-7' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Öne Çıkan</p>
                    <p className="text-slate-400 text-xs">{editForm.isFeatured ? 'Öne çıkan ürün' : 'Normal ürün'}</p>
                  </div>
                </label>
              </div>

              {/* Success message */}
              {saveSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 text-emerald-400 text-center font-medium">
                  ✓ Ürün başarıyla güncellendi! Değişiklikler sitede canlı olarak yansıtıldı.
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3 sticky bottom-0 bg-slate-800">
              <button
                onClick={closeEditModal}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl"
              >
                İptal
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={savingProduct || !editForm.name || !editForm.price}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                {savingProduct ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : '💾 Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
