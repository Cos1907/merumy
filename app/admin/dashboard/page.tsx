'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { products as allProducts } from '../../lib/products';

// Types
interface HeroSlide {
  id: number;
  desktopImage: string;
  mobileImage: string;
  buttonLink: string | null;
  title: string | null;
  sortOrder: number;
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
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users' | 'reports' | 'hero' | 'activity' | 'kore-trends' | 'fatura' | 'analytics' | 'mail-marketing' | 'admin-users' | 'coupons'>('orders');
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
  const [activityPage, setActivityPage] = useState(1);
  const [activityUserFilter, setActivityUserFilter] = useState('');
  const [activityDateFrom, setActivityDateFrom] = useState('');
  const [activityDateTo, setActivityDateTo] = useState('');
  const [activityTotalPages, setActivityTotalPages] = useState(1);

  // Fatura state
  const [faturaOrders, setFaturaOrders] = useState<any[]>([]);
  const [faturaLoading, setFaturaLoading] = useState(false);
  const [faturaSearch, setFaturaSearch] = useState('');
  const [faturaDateFrom, setFaturaDateFrom] = useState('');
  const [faturaDateTo, setFaturaDateTo] = useState('');
  const [faturaFilter, setFaturaFilter] = useState('all');
  const [faturaPage, setFaturaPage] = useState(1);
  const [faturaTotal, setFaturaTotal] = useState(0);
  const [faturaMsg, setFaturaMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [faturaProcessing, setFaturaProcessing] = useState<string | null>(null);
  const [faturaPreviewOrder, setFaturaPreviewOrder] = useState<any | null>(null);
  const [faturaSettingsOpen, setFaturaSettingsOpen] = useState(false);
  const [faturaSettings, setFaturaSettings] = useState({ username: '', password: '', vkn: '', erpKodu: '', userServiceUrl: '', earsivServiceUrl: '' });
  const [faturaSettingsSaving, setFaturaSettingsSaving] = useState(false);
  const [faturaSelected, setFaturaSelected] = useState<Set<string>>(new Set());
  const [faturaTuru, setFaturaTuru] = useState<'temel' | 'ticari'>('temel');
  const [musteriVkn, setMusteriVkn] = useState('');
  const [bulkFaturaProcessing, setBulkFaturaProcessing] = useState(false);

  // Kore Trendleri management state
  const [koreSection, setKoreSection] = useState<'kore_trend' | 'makeup' | 'bestsellers' | 'exclusive'>('kore_trend');
  const [koreTrendProducts, setKoreTrendProducts] = useState<any[]>([]);
  const [koreLoading, setKoreLoading] = useState(false);
  const [koreSearch, setKoreSearch] = useState('');
  const [koreSearchResults, setKoreSearchResults] = useState<any[]>([]);
  const [koreSearchLoading, setKoreSearchLoading] = useState(false);
  
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

  // Product Gallery state
  const [productGalleryImages, setProductGalleryImages] = useState<{id:number; image_url:string; is_primary:boolean; sort_order:number; alt_text:string|null}[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [galleryMsg, setGalleryMsg] = useState<{type:'success'|'error';text:string}|null>(null);

  // Analytics state (admin@merumy.com only)
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsDateFrom, setAnalyticsDateFrom] = useState('');
  const [analyticsDateTo, setAnalyticsDateTo] = useState('');

  // Mail Marketing state
  const [mailUsers, setMailUsers] = useState<any[]>([]);
  const [mailLoading, setMailLoading] = useState(false);
  const [mailFilter, setMailFilter] = useState('all');
  const [mailSearch, setMailSearch] = useState('');
  const [mailTotal, setMailTotal] = useState(0);
  const [mailCopied, setMailCopied] = useState(false);
  const [mailDateFrom, setMailDateFrom] = useState('');
  const [mailDateTo, setMailDateTo] = useState('');

  // Admin users state
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [showNewAdminUserForm, setShowNewAdminUserForm] = useState(false);
  const [newAdminUserForm, setNewAdminUserForm] = useState({ name: '', email: '', password: '', role: 'admin', allowedSections: [] as string[] });
  const [adminUserMsg, setAdminUserMsg] = useState<{type:'success'|'error';text:string}|null>(null);
  const [editingAdminUser, setEditingAdminUser] = useState<any|null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');
  const [adminUserEditSections, setAdminUserEditSections] = useState<string[]>([]);
  const [adminUserEditRole, setAdminUserEditRole] = useState('admin');
  const [savingAdminUser, setSavingAdminUser] = useState(false);

  // Must change password state
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [changePasswordValue, setChangePasswordValue] = useState('');
  const [changePasswordConfirm, setChangePasswordConfirm] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');

  // Coupons state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showNewCouponForm, setShowNewCouponForm] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{type:'success'|'error';text:string}|null>(null);
  const [newCouponForm, setNewCouponForm] = useState({
    code: '', description: '', discountType: 'fixed', discountValue: '',
    minOrderAmount: '5000', maxDiscountAmount: '', usageLimit: '',
    brandId: '', userId: '', expiresAt: '', isActive: true,
  });
  const [savingCoupon, setSavingCoupon] = useState(false);

  // New product form state
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '', brand: '', category: '', barcode: '', sku: '',
    price: '', comparePrice: '', stock: '0', description: '', image: '',
    isActive: true, isFeatured: false,
  });
  const [savingNewProduct, setSavingNewProduct] = useState(false);
  const [newProductMsg, setNewProductMsg] = useState<{type:'success'|'error',text:string}|null>(null);
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
    else if (activeTab === 'kore-trends') fetchKoreTrendProducts(koreSection as 'kore_trend' | 'makeup' | 'bestsellers' | 'exclusive');
    else if (activeTab === 'fatura') fetchFaturaOrders();
    else if (activeTab === 'analytics') fetchAnalytics();
    else if (activeTab === 'mail-marketing') fetchMailMarketing();
    else if (activeTab === 'admin-users') fetchAdminUsers();
    else if (activeTab === 'coupons') fetchCoupons();
  }, [activeTab, orderPage, orderStatusFilter, userPage, userSort, dbProductsPage]);

  // Clear selection when changing filters
  useEffect(() => {
    setSelectedOrders(new Set());
  }, [orderStatusFilter, orderSearch, orderPage]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      if (!res.ok) {
        router.push('/admin/login');
      } else {
        const data = await res.json();
        if (data.user) {
          setCurrentUserEmail(data.user.email || '');
          setCurrentUserName(data.user.name || '');
          if (data.user.allowedSections) {
            setAllowedSections(data.user.allowedSections);
          }
          if (data.user.mustChangePassword) {
            setMustChangePassword(true);
          }
        }
        setLoading(false);
        fetchOrders();
      }
    } catch {
      router.push('/admin/login');
    }
  };

  // Fatura siparişlerini getir
  const fetchFaturaOrders = async () => {
    setFaturaLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(faturaPage),
        limit: '20',
        search: faturaSearch,
        fatura: faturaFilter,
      });
      if (faturaDateFrom) params.append('dateFrom', faturaDateFrom);
      if (faturaDateTo) params.append('dateTo', faturaDateTo);
      const res = await fetch(`/api/admin/fatura?${params}`);
      const data = await res.json();
      if (data.orders) {
        setFaturaOrders(data.orders);
        setFaturaTotal(data.total || 0);
      }
    } catch (e) {
      console.error('Fatura orders error:', e);
    } finally {
      setFaturaLoading(false);
    }
  };

  // Fatura Kes butonuna basınca önizleme modalını aç
  const handleFaturaKes = (order: any) => {
    setFaturaPreviewOrder(order);
    setFaturaMsg(null);
  };

  // Toplu fatura kes
  const handleBulkFaturaKes = async () => {
    if (faturaSelected.size === 0 || bulkFaturaProcessing) return;
    setBulkFaturaProcessing(true);
    setFaturaMsg(null);
    try {
      const res = await fetch('/api/admin/fatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk-fatura',
          orderIds: Array.from(faturaSelected),
          faturaTuru,
          musteriVkn: faturaTuru === 'ticari' ? musteriVkn : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const ok = data.results.filter((r: any) => r.success).length;
        const err = data.results.filter((r: any) => r.error).length;
        const skip = data.results.filter((r: any) => r.skip).length;
        setFaturaMsg({ type: 'success', text: `✅ ${ok} fatura oluşturuldu${err > 0 ? ` | ❌ ${err} hata` : ''}${skip > 0 ? ` | ⏭ ${skip} atlandı` : ''}` });
        setFaturaSelected(new Set());
        fetchFaturaOrders();
      } else {
        setFaturaMsg({ type: 'error', text: `❌ ${data.error || 'Toplu fatura oluşturulamadı'}` });
      }
    } catch (e: any) {
      setFaturaMsg({ type: 'error', text: `❌ Bağlantı hatası: ${e.message}` });
    } finally {
      setBulkFaturaProcessing(false);
    }
  };

  // Önizleme onaylandıktan sonra gerçekten fatura oluştur
  const handleFaturaOnayla = async () => {
    if (!faturaPreviewOrder || faturaProcessing) return;
    const orderId = faturaPreviewOrder.orderId;
    setFaturaProcessing(orderId);
    setFaturaMsg(null);
    try {
      const res = await fetch('/api/admin/fatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, faturaTuru, musteriVkn: faturaTuru === 'ticari' ? musteriVkn : undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFaturaMsg({ type: 'success', text: `✅ Fatura oluşturuldu! Fatura No: ${data.faturaNo || '-'}${data.faturaUrl ? ' — ' : ''}` });
        setFaturaPreviewOrder(null);
        fetchFaturaOrders();
      } else if (res.status === 409) {
        setFaturaMsg({ type: 'error', text: `⚠️ ${data.error} — Fatura No: ${data.faturaNo || '-'}` });
        setFaturaPreviewOrder(null);
      } else {
        setFaturaMsg({ type: 'error', text: `❌ ${data.error || 'Fatura oluşturulamadı'}` });
      }
    } catch (e: any) {
      setFaturaMsg({ type: 'error', text: `❌ Bağlantı hatası: ${e.message}` });
    } finally {
      setFaturaProcessing(null);
    }
  };

  // e-Arşiv ayarlarını kaydet
  const handleFaturaSettingsSave = async () => {
    setFaturaSettingsSaving(true);
    try {
      const res = await fetch('/api/admin/fatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save-settings', ...faturaSettings }),
      });
      const data = await res.json();
      if (res.ok) {
        setFaturaMsg({ type: 'success', text: '✅ e-Arşiv ayarları kaydedildi' });
        setFaturaSettingsOpen(false);
      } else {
        setFaturaMsg({ type: 'error', text: `❌ ${data.error}` });
      }
    } catch (e: any) {
      setFaturaMsg({ type: 'error', text: `❌ Hata: ${e.message}` });
    } finally {
      setFaturaSettingsSaving(false);
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
      if (data.total !== undefined) setOrderTotal(Number(data.total));
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProductForm.name || !newProductForm.price) {
      setNewProductMsg({ type: 'error', text: 'Ürün adı ve fiyat zorunludur.' });
      return;
    }
    setSavingNewProduct(true);
    setNewProductMsg(null);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductForm.name,
          brand: newProductForm.brand,
          category: newProductForm.category,
          barcode: newProductForm.barcode,
          sku: newProductForm.sku,
          price: parseFloat(newProductForm.price) || 0,
          comparePrice: parseFloat(newProductForm.comparePrice) || null,
          stock: parseInt(newProductForm.stock) || 0,
          description: newProductForm.description,
          image: newProductForm.image,
          isActive: newProductForm.isActive,
          isFeatured: newProductForm.isFeatured,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewProductMsg({ type: 'success', text: `✅ Ürün başarıyla eklendi! (ID: ${data.productId})` });
        setNewProductForm({ name: '', brand: '', category: '', barcode: '', sku: '', price: '', comparePrice: '', stock: '0', description: '', image: '', isActive: true, isFeatured: false });
        setShowNewProductForm(false);
        fetchDbProducts();
      } else {
        setNewProductMsg({ type: 'error', text: data.error || 'Ürün eklenemedi.' });
      }
    } catch {
      setNewProductMsg({ type: 'error', text: 'Bağlantı hatası.' });
    } finally {
      setSavingNewProduct(false);
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
        setSelectedOrder(null);
        await fetchOrders();
        if (data.emailSent) {
          alert('✅ Sipariş güncellendi ve müşteriye bilgilendirme maili gönderildi.');
        } else {
          alert('✅ Sipariş durumu başarıyla güncellendi.');
        }
      } else {
        const err = await res.json();
        alert('❌ Hata: ' + (err.error || 'Sipariş güncellenemedi'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Bağlantı hatası oluştu.');
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
    setProductGalleryImages([]);
    setGalleryMsg(null);
    setGalleryUrlInput('');
    fetchProductGallery(product.id);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditForm(null);
    setSaveSuccess(false);
    setProductGalleryImages([]);
    setGalleryUrlInput('');
    setGalleryMsg(null);
  };

  const fetchProductGallery = async (productId: number) => {
    setGalleryLoading(true);
    try {
      const res = await fetch(`/api/admin/product-images?productId=${productId}`);
      const data = await res.json();
      if (data.images) setProductGalleryImages(data.images);
    } catch {
      // ignore
    } finally {
      setGalleryLoading(false);
    }
  };

  const uploadGalleryImage = async (file: File, productId: number) => {
    setGalleryUploading(true);
    setGalleryMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', String(productId));
      formData.append('isPrimary', productGalleryImages.length === 0 ? 'true' : 'false');
      const res = await fetch('/api/admin/product-images', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        setGalleryMsg({ type: 'success', text: 'Görsel yüklendi' });
        fetchProductGallery(productId);
      } else {
        setGalleryMsg({ type: 'error', text: data.error || 'Görsel yüklenemedi' });
      }
    } catch {
      setGalleryMsg({ type: 'error', text: 'Yükleme sırasında hata oluştu' });
    } finally {
      setGalleryUploading(false);
    }
  };

  const addGalleryImageByUrl = async (productId: number) => {
    if (!galleryUrlInput.trim()) return;
    setGalleryUploading(true);
    setGalleryMsg(null);
    try {
      const res = await fetch('/api/admin/product-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, imageUrl: galleryUrlInput.trim(), isPrimary: productGalleryImages.length === 0 }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGalleryMsg({ type: 'success', text: 'Görsel eklendi' });
        setGalleryUrlInput('');
        fetchProductGallery(productId);
      } else {
        setGalleryMsg({ type: 'error', text: data.error || 'Görsel eklenemedi' });
      }
    } catch {
      setGalleryMsg({ type: 'error', text: 'Hata oluştu' });
    } finally {
      setGalleryUploading(false);
    }
  };

  const setGalleryPrimary = async (imageId: number, productId: number) => {
    try {
      const res = await fetch('/api/admin/product-images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, productId }),
      });
      if (res.ok) {
        fetchProductGallery(productId);
        setGalleryMsg({ type: 'success', text: 'Ana görsel güncellendi' });
      }
    } catch { /* ignore */ }
  };

  const deleteGalleryImage = async (imageId: number, productId: number) => {
    if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/product-images?id=${imageId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProductGallery(productId);
        setGalleryMsg({ type: 'success', text: 'Görsel silindi' });
      }
    } catch { /* ignore */ }
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
      const res = await fetch('/api/admin/hero-slides');
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
      // Save each slide individually
      for (const slide of heroSlides) {
        await fetch('/api/admin/hero-slides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: slide.id,
            title: slide.title,
            buttonLink: slide.buttonLink,
            desktopImage: slide.desktopImage,
            mobileImage: slide.mobileImage,
            sortOrder: slide.sortOrder,
            isActive: slide.isActive,
          }),
        });
      }
      setHeroSaveSuccess(true);
      logActivity('hero_updated', 'Hero section slaytları güncellendi', 'hero');
      setTimeout(() => setHeroSaveSuccess(false), 3000);
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
      formData.append('file', file);
      formData.append('type', field === 'desktopImage' ? 'desktop' : 'mobile');
      const res = await fetch('/api/admin/hero-slides', { method: 'POST', body: formData });
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

  const addNewHeroSlide = async () => {
    // Save to DB immediately
    try {
      const res = await fetch('/api/admin/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: null,
          buttonLink: null,
          desktopImage: '/herosection/herosection01.jpg',
          mobileImage: '/mobilsliderlar/mobile-slider1.jpg',
          sortOrder: heroSlides.length + 1,
          isActive: true,
        }),
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
      const res = await fetch(`/api/admin/hero-slides?id=${slideId}`, { method: 'DELETE' });
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
  const fetchActivityLogs = async (page = activityPage) => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '25');
      params.append('page', page.toString());
      if (activityUserFilter.trim()) params.append('userEmail', activityUserFilter.trim());
      if (activityDateFrom) params.append('dateFrom', activityDateFrom);
      if (activityDateTo) params.append('dateTo', activityDateTo);
      const res = await fetch(`/api/admin/activity?${params.toString()}`);
      const data = await res.json();
      if (data.logs) setActivityLogs(data.logs);
      if (data.pagination?.total !== undefined) setActivityTotal(data.pagination.total);
      if (data.pagination?.totalPages !== undefined) setActivityTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const params = new URLSearchParams();
      if (analyticsDateFrom) params.append('dateFrom', analyticsDateFrom);
      if (analyticsDateTo) params.append('dateTo', analyticsDateTo);
      const res = await fetch(`/api/admin/analytics?${params}`);
      const data = await res.json();
      if (res.ok) setAnalyticsData(data);
    } catch (e) { console.error('Analytics error:', e); }
    finally { setAnalyticsLoading(false); }
  };

  const fetchMailMarketing = async () => {
    setMailLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('filter', mailFilter);
      if (mailSearch) params.append('search', mailSearch);
      if (mailDateFrom) params.append('dateFrom', mailDateFrom);
      if (mailDateTo) params.append('dateTo', mailDateTo);
      params.append('limit', '2000');
      const res = await fetch(`/api/admin/mail-marketing?${params}`);
      const data = await res.json();
      if (res.ok) { setMailUsers(data.users || []); setMailTotal(data.total || 0); }
    } catch (e) { console.error('Mail marketing error:', e); }
    finally { setMailLoading(false); }
  };

  const fetchAdminUsers = async () => {
    setAdminUsersLoading(true);
    try {
      const res = await fetch('/api/admin/admin-users');
      const data = await res.json();
      if (data.users) setAdminUsers(data.users);
    } catch (e) { console.error('fetchAdminUsers error:', e); }
    finally { setAdminUsersLoading(false); }
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (e) { console.error('fetchCoupons error:', e); }
    finally { setCouponsLoading(false); }
  };

  const handleCreateAdminUser = async () => {
    if (!newAdminUserForm.name || !newAdminUserForm.email || !newAdminUserForm.password) {
      setAdminUserMsg({ type: 'error', text: 'Ad, e-posta ve şifre zorunludur' });
      return;
    }
    setSavingAdminUser(true);
    try {
      const res = await fetch('/api/admin/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdminUserForm),
      });
      const data = await res.json();
      if (res.ok) {
        setAdminUserMsg({ type: 'success', text: '✅ Kullanıcı oluşturuldu!' });
        setShowNewAdminUserForm(false);
        setNewAdminUserForm({ name: '', email: '', password: '', role: 'admin', allowedSections: [] });
        fetchAdminUsers();
      } else {
        setAdminUserMsg({ type: 'error', text: `❌ ${data.error}` });
      }
    } catch { setAdminUserMsg({ type: 'error', text: '❌ Bağlantı hatası' }); }
    finally { setSavingAdminUser(false); }
  };

  const handleUpdateAdminUserPassword = async (userId: number) => {
    if (!newPasswordForUser || newPasswordForUser.length < 6) {
      setAdminUserMsg({ type: 'error', text: 'Şifre en az 6 karakter olmalıdır' });
      return;
    }
    setSavingAdminUser(true);
    try {
      const res = await fetch('/api/admin/admin-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, action: 'update_password', newPassword: newPasswordForUser }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdminUserMsg({ type: 'success', text: '✅ Şifre güncellendi!' });
        setEditingAdminUser(null);
        setNewPasswordForUser('');
      } else {
        setAdminUserMsg({ type: 'error', text: `❌ ${data.error}` });
      }
    } catch { setAdminUserMsg({ type: 'error', text: '❌ Bağlantı hatası' }); }
    finally { setSavingAdminUser(false); }
  };

  const handleUpdateAdminUserPermissions = async (userId: number) => {
    setSavingAdminUser(true);
    try {
      const res = await fetch('/api/admin/admin-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, action: 'update_permissions', allowedSections: adminUserEditSections.length > 0 ? adminUserEditSections : null, role: adminUserEditRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdminUserMsg({ type: 'success', text: '✅ İzinler güncellendi!' });
        setEditingAdminUser(null);
        fetchAdminUsers();
      } else {
        setAdminUserMsg({ type: 'error', text: `❌ ${data.error}` });
      }
    } catch { setAdminUserMsg({ type: 'error', text: '❌ Bağlantı hatası' }); }
    finally { setSavingAdminUser(false); }
  };

  const handleDeleteAdminUser = async (userId: number) => {
    if (!confirm('Bu admin kullanıcısını silmek istediğinizden emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/admin-users?id=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setAdminUserMsg({ type: 'success', text: '✅ Kullanıcı silindi' });
        fetchAdminUsers();
      } else {
        setAdminUserMsg({ type: 'error', text: `❌ ${data.error}` });
      }
    } catch { setAdminUserMsg({ type: 'error', text: '❌ Bağlantı hatası' }); }
  };

  const handleOwnPasswordChange = async () => {
    if (changePasswordValue.length < 6) { setChangePasswordError('Şifre en az 6 karakter olmalıdır'); return; }
    if (changePasswordValue !== changePasswordConfirm) { setChangePasswordError('Şifreler eşleşmiyor'); return; }
    setChangingPassword(true);
    setChangePasswordError('');
    try {
      const res = await fetch('/api/admin/admin-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_own_password', newPassword: changePasswordValue }),
      });
      if (res.ok) {
        setMustChangePassword(false);
        setChangePasswordValue('');
        setChangePasswordConfirm('');
      } else {
        const data = await res.json();
        setChangePasswordError(data.error || 'Şifre değiştirilemedi');
      }
    } catch { setChangePasswordError('Bağlantı hatası'); }
    finally { setChangingPassword(false); }
  };

  const handleCreateCoupon = async () => {
    if (!newCouponForm.code || !newCouponForm.discountValue) {
      setCouponMsg({ type: 'error', text: 'Kod ve indirim değeri zorunludur' });
      return;
    }
    setSavingCoupon(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCouponForm,
          discountValue: Number(newCouponForm.discountValue),
          minOrderAmount: newCouponForm.minOrderAmount ? Number(newCouponForm.minOrderAmount) : null,
          maxDiscountAmount: newCouponForm.maxDiscountAmount ? Number(newCouponForm.maxDiscountAmount) : null,
          usageLimit: newCouponForm.usageLimit ? Number(newCouponForm.usageLimit) : null,
          brandId: newCouponForm.brandId ? Number(newCouponForm.brandId) : null,
          userId: newCouponForm.userId ? Number(newCouponForm.userId) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponMsg({ type: 'success', text: '✅ Kupon oluşturuldu!' });
        setShowNewCouponForm(false);
        setNewCouponForm({ code: '', description: '', discountType: 'fixed', discountValue: '', minOrderAmount: '5000', maxDiscountAmount: '', usageLimit: '', brandId: '', userId: '', expiresAt: '', isActive: true });
        fetchCoupons();
      } else {
        setCouponMsg({ type: 'error', text: `❌ ${data.error}` });
      }
    } catch { setCouponMsg({ type: 'error', text: '❌ Bağlantı hatası' }); }
    finally { setSavingCoupon(false); }
  };

  const handleToggleCoupon = async (id: number, isActive: boolean) => {
    try {
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      fetchCoupons();
    } catch {}
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('Bu kuponu silmek istediğinizden emin misiniz?')) return;
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      fetchCoupons();
    } catch {}
  };

  const fetchKoreTrendProducts = async (section: 'kore_trend' | 'makeup' | 'bestsellers' | 'exclusive') => {
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

  const addToKoreTrends = async (productId: number, section: 'kore_trend' | 'makeup' | 'bestsellers' | 'exclusive') => {
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

  const removeFromKoreTrends = async (curatedId: number, section: 'kore_trend' | 'makeup' | 'bestsellers' | 'exclusive') => {
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b1117' }}>
        <div className="text-center">
          <img src="/logo.svg" alt="Merumy" className="h-8 w-auto mx-auto mb-8 opacity-80" />
          <div className="w-10 h-10 border-2 border-t-[#92D0AA] rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'rgba(146,208,170,0.2)', borderTopColor: '#92D0AA' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0d1117' }}>
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'transition-all duration-300 flex flex-col',
          'fixed lg:static inset-y-0 left-0 z-50',
          mobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 w-72',
          sidebarOpen ? 'lg:w-64' : 'lg:w-20',
        ].join(' ')}
        style={{ background: '#0b1117', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Sidebar Logo Area */}
        <div className="px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <img
                src="/logo.svg"
                alt="Merumy"
                className={`object-contain ${(sidebarOpen || mobileSidebarOpen) ? 'h-7 w-auto' : 'h-7 w-7'}`}
                style={{ opacity: 0.9 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            {(sidebarOpen || mobileSidebarOpen) && <div className="flex-1 min-w-0" />}
            {/* Mobile close button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden ml-auto p-1.5 rounded-lg transition-colors flex-shrink-0"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* User Info */}
        {(sidebarOpen || mobileSidebarOpen) && (currentUserName || currentUserEmail) && (
          <div className="mx-3 mt-3 px-3 py-3 rounded-xl" style={{ background: 'rgba(146,208,170,0.06)', border: '1px solid rgba(146,208,170,0.12)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'rgba(146,208,170,0.15)', color: '#92D0AA' }}>
                {(currentUserName || currentUserEmail).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate text-white">
                  {currentUserName || currentUserEmail.split('@')[0]}
                </p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {currentUserEmail}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
          {[
            { id: 'orders', icon: '📦', label: 'Siparişler', count: orderStats?.total },
            { id: 'products', icon: '🛍️', label: 'Ürün Yönetimi', count: dbProductsTotal || undefined },
            { id: 'users', icon: '👥', label: 'Kullanıcılar' },
            { id: 'reports', icon: '📊', label: 'Satış Raporu' },
            { id: 'hero', icon: '🎨', label: 'Hero Yönetimi' },
            { id: 'kore-trends', icon: '🌸', label: 'Kore Trendleri' },
            { id: 'fatura', icon: '🧾', label: 'Fatura' },
          ].filter(item => !allowedSections || allowedSections.includes(item.id)).map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === item.id ? '' : ''
              }`}
              style={activeTab === item.id ? {
                background: 'rgba(146,208,170,0.12)',
                color: '#92D0AA',
                border: '1px solid rgba(146,208,170,0.2)',
              } : {
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = '';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                }
              }}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {(sidebarOpen || mobileSidebarOpen) && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
          {/* Analytics - Only for admin@merumy.com */}
          {currentUserEmail === 'admin@merumy.com' && (
            <button
              onClick={() => { setActiveTab('analytics'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={activeTab === 'analytics' ? {
                background: 'rgba(56,189,248,0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56,189,248,0.2)',
              } : {
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => { if (activeTab !== 'analytics') { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
              onMouseLeave={e => { if (activeTab !== 'analytics') { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
            >
              <span className="text-lg flex-shrink-0">📈</span>
              {(sidebarOpen || mobileSidebarOpen) && <span className="flex-1 text-left text-sm font-medium">Analiz</span>}
            </button>
          )}

          {/* Mail Marketing - for sena, serap, buse, admin */}
          {['admin@merumy.com','sena@merumy.com','serap@merumy.com','buse@merumy.com'].includes(currentUserEmail) && (
            <button
              onClick={() => { setActiveTab('mail-marketing'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={activeTab === 'mail-marketing' ? {
                background: 'rgba(249,115,22,0.12)',
                color: '#fb923c',
                border: '1px solid rgba(249,115,22,0.2)',
              } : {
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => { if (activeTab !== 'mail-marketing') { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
              onMouseLeave={e => { if (activeTab !== 'mail-marketing') { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
            >
              <span className="text-lg flex-shrink-0">📧</span>
              {(sidebarOpen || mobileSidebarOpen) && <span className="flex-1 text-left text-sm font-medium">Mail Marketing</span>}
            </button>
          )}

          {/* Admin Users - Only for super admins */}
          {(currentUserEmail === 'admin@merumy.com' || currentUserEmail === 'huseyin@merumy.com') && (
            <button
              onClick={() => { setActiveTab('admin-users'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={activeTab === 'admin-users' ? {
                background: 'rgba(251,191,36,0.12)',
                color: '#fbbf24',
                border: '1px solid rgba(251,191,36,0.2)',
              } : {
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => { if (activeTab !== 'admin-users') { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
              onMouseLeave={e => { if (activeTab !== 'admin-users') { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
            >
              <span className="text-lg flex-shrink-0">👤</span>
              {(sidebarOpen || mobileSidebarOpen) && <span className="flex-1 text-left text-sm font-medium">Admin Kullanıcılar</span>}
            </button>
          )}

          {/* Coupons - for duygu, buse, sena, serap */}
          {(!allowedSections || allowedSections.includes('coupons') || ['admin@merumy.com','duygu@merumy.com','buse@merumy.com','sena@merumy.com','serap@merumy.com','huseyin@merumy.com'].includes(currentUserEmail)) && (
            <button
              onClick={() => { setActiveTab('coupons'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={activeTab === 'coupons' ? {
                background: 'rgba(168,85,247,0.12)',
                color: '#c084fc',
                border: '1px solid rgba(168,85,247,0.2)',
              } : {
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => { if (activeTab !== 'coupons') { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
              onMouseLeave={e => { if (activeTab !== 'coupons') { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
            >
              <span className="text-lg flex-shrink-0">🎟️</span>
              {(sidebarOpen || mobileSidebarOpen) && <span className="flex-1 text-left text-sm font-medium">İndirim Kodları</span>}
            </button>
          )}

          {/* Activity Log - Only for admin@merumy.com */}
          {currentUserEmail === 'admin@merumy.com' && (!allowedSections || allowedSections.includes('activity')) && (
            <button
              onClick={() => { setActiveTab('activity'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={activeTab === 'activity' ? {
                background: 'rgba(167,139,250,0.12)',
                color: '#a78bfa',
                border: '1px solid rgba(167,139,250,0.2)',
              } : {
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => {
                if (activeTab !== 'activity') {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                }
              }}
              onMouseLeave={e => {
                if (activeTab !== 'activity') {
                  e.currentTarget.style.background = '';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                }
              }}
            >
              <span className="text-lg flex-shrink-0">📋</span>
              {(sidebarOpen || mobileSidebarOpen) && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">Yapılan İşlemler</span>
                  {activityTotal > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
                      {activityTotal}
                    </span>
                  )}
                </>
              )}
            </button>
          )}
        </nav>
        
        <div className="p-3 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid transparent' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '';
              e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <span className="text-lg flex-shrink-0">🚪</span>
            {(sidebarOpen || mobileSidebarOpen) && <span className="text-sm font-medium">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0 w-full">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 px-4 md:px-6 py-3.5 backdrop-blur-md"
          style={{ background: 'rgba(13,17,23,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="p-2 rounded-lg lg:hidden flex-shrink-0 transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {/* Desktop sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hidden lg:flex flex-shrink-0 transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="min-w-0">
                <h1 className="text-sm md:text-base font-semibold text-white truncate">
                  {activeTab === 'orders' && 'Siparişler'}
                  {activeTab === 'products' && 'Ürün Yönetimi'}
                  {activeTab === 'users' && 'Kullanıcılar'}
                  {activeTab === 'reports' && 'Satış Raporu'}
                  {activeTab === 'hero' && 'Hero Yönetimi'}
                  {activeTab === 'activity' && 'Yapılan İşlemler'}
                  {activeTab === 'kore-trends' && 'Kore Trendleri'}
                  {activeTab === 'fatura' && 'Fatura Yönetimi'}
                  {activeTab === 'analytics' && 'Analiz & Raporlar'}
                  {activeTab === 'mail-marketing' && 'Mail Marketing'}
                  {activeTab === 'admin-users' && 'Admin Kullanıcılar'}
                  {activeTab === 'coupons' && 'İndirim Kodları'}
              </h1>
                {currentUserName && (
                  <p className="text-xs hidden sm:block" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Hoş geldin, <span style={{ color: '#92D0AA' }}>{currentUserName}</span> 👋
                  </p>
                )}
            </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href="https://merumy.com"
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden sm:inline font-medium">Siteyi Görüntüle</span>
              </a>

              {/* User Avatar */}
              {currentUserName && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold hidden md:flex"
                  style={{ background: 'rgba(146,208,170,0.15)', color: '#92D0AA' }}>
                  {currentUserName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-3 md:p-6">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Stats */}
              {orderStats && (
                <div className={`grid gap-3 ${currentUserEmail === 'admin@merumy.com' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'}`}>
                  {[
                    { label: 'Toplam', value: orderStats.total, color: 'from-slate-500 to-slate-600' },
                    { label: 'Beklemede', value: orderStats.pending, color: 'from-amber-500 to-orange-500' },
                    { label: 'İşleniyor', value: orderStats.processing, color: 'from-blue-500 to-indigo-500' },
                    { label: 'Hazırlanıyor', value: orderStats.preparing, color: 'from-orange-500 to-red-500' },
                    { label: 'Kargoda', value: orderStats.shipped, color: 'from-purple-500 to-pink-500' },
                    { label: 'Teslim', value: orderStats.delivered, color: 'from-emerald-500 to-teal-500' },
                    ...(currentUserEmail === 'admin@merumy.com'
                      ? [{ label: 'Gelir', value: formatPrice(orderStats.totalRevenue || 0), color: 'from-emerald-400 to-cyan-500', isPrice: true }]
                      : []
                    ),
                  ].map((stat, i) => (
                    <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                        <span className="text-white text-base font-bold">{(stat as any).isPrice ? '₺' : stat.value}</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{(stat as any).isPrice ? stat.value : stat.value || 0}</p>
                      <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{stat.label}</p>
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
                  <table className="w-full min-w-[800px]">
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
                {orderTotal > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                    <p className="text-slate-400 text-sm">Sayfa <span className="text-white font-medium">{orderPage}</span> / <span className="text-white font-medium">{orderTotalPages || 1}</span> &nbsp;·&nbsp; Toplam <span className="text-white font-medium">{orderTotal}</span> sipariş</p>
                    <div className="flex items-center gap-2">
                      <button disabled={orderPage === 1} onClick={() => setOrderPage(1)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors">«</button>
                      <button disabled={orderPage === 1} onClick={() => setOrderPage(p => p - 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors">Önceki</button>
                      <span className="text-slate-500 text-sm px-2">{orderPage} / {orderTotalPages || 1}</span>
                      <button disabled={orderPage === (orderTotalPages || 1)} onClick={() => setOrderPage(p => p + 1)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors">Sonraki</button>
                      <button disabled={orderPage === (orderTotalPages || 1)} onClick={() => setOrderPage(orderTotalPages || 1)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors">»</button>
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

              {/* New Product Form */}
              {showNewProductForm && (
                <div className="bg-slate-800 rounded-2xl p-6 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-white">➕ Yeni Ürün Ekle</h3>
                    <button onClick={() => { setShowNewProductForm(false); setNewProductMsg(null); }} className="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
                  </div>
                  {newProductMsg && (
                    <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${newProductMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {newProductMsg.text}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Ürün Adı <span className="text-red-400">*</span></label>
                      <input type="text" value={newProductForm.name} onChange={e => setNewProductForm(p => ({...p, name: e.target.value}))} placeholder="Ürün adını girin..." className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Marka</label>
                      <input type="text" value={newProductForm.brand} onChange={e => setNewProductForm(p => ({...p, brand: e.target.value}))} placeholder="Örn: L'Oréal" list="brand-list" className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500" />
                      <datalist id="brand-list">{dbBrands.map(b => <option key={b} value={b}/>)}</datalist>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Kategori</label>
                      <input type="text" value={newProductForm.category} onChange={e => setNewProductForm(p => ({...p, category: e.target.value}))} placeholder="Örn: Cilt Bakımı" list="category-list" className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500" />
                      <datalist id="category-list">{dbCategories.map(c => <option key={c} value={c}/>)}</datalist>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Fiyat (₺) <span className="text-red-400">*</span></label>
                      <input type="number" step="0.01" min="0" value={newProductForm.price} onChange={e => setNewProductForm(p => ({...p, price: e.target.value}))} placeholder="0.00" className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Karşılaştırma Fiyatı (₺)</label>
                      <input type="number" step="0.01" min="0" value={newProductForm.comparePrice} onChange={e => setNewProductForm(p => ({...p, comparePrice: e.target.value}))} placeholder="0.00" className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Stok Adedi</label>
                      <input type="number" min="0" value={newProductForm.stock} onChange={e => setNewProductForm(p => ({...p, stock: e.target.value}))} placeholder="0" className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Barkod</label>
                      <input type="text" value={newProductForm.barcode} onChange={e => setNewProductForm(p => ({...p, barcode: e.target.value}))} placeholder="EAN/ISBN/UPC..." className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">SKU</label>
                      <input type="text" value={newProductForm.sku} onChange={e => setNewProductForm(p => ({...p, sku: e.target.value}))} placeholder="Stok Kodu..." className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Görsel URL</label>
                      <input type="text" value={newProductForm.image} onChange={e => setNewProductForm(p => ({...p, image: e.target.value}))} placeholder="https://..." className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">Açıklama</label>
                      <textarea value={newProductForm.description} onChange={e => setNewProductForm(p => ({...p, description: e.target.value}))} rows={3} placeholder="Ürün açıklaması..." className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 resize-none" />
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={newProductForm.isActive} onChange={e => setNewProductForm(p => ({...p, isActive: e.target.checked}))} className="w-4 h-4 rounded accent-emerald-500" />
                        <span className="text-sm text-slate-300">Aktif</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={newProductForm.isFeatured} onChange={e => setNewProductForm(p => ({...p, isFeatured: e.target.checked}))} className="w-4 h-4 rounded accent-amber-500" />
                        <span className="text-sm text-slate-300">Öne Çıkan</span>
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleCreateProduct}
                        disabled={savingNewProduct}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors"
                      >
                        {savingNewProduct ? 'Ekleniyor...' : '➕ Ürün Ekle'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                  <button onClick={() => { setShowNewProductForm(p => !p); setNewProductMsg(null); }} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                    ➕ Yeni Ürün
                  </button>
                </div>
              </div>

              {productLoadError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">{productLoadError}</div>
              )}

              {/* Products Table */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
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
                  <table className="w-full min-w-[600px]">
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
                  <table className="w-full min-w-[600px]">
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
                            onClick={async () => {
                              const updated = [...heroSlides];
                              updated[idx] = { ...updated[idx], isActive: !updated[idx].isActive };
                              setHeroSlides(updated);
                              // Auto-save immediately
                              try {
                                const s = updated[idx];
                                await fetch('/api/admin/hero-slides', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    id: s.id,
                                    title: s.title,
                                    buttonLink: s.buttonLink,
                                    desktopImage: s.desktopImage,
                                    mobileImage: s.mobileImage,
                                    sortOrder: s.sortOrder,
                                    isActive: s.isActive,
                                  }),
                                });
                              } catch {}
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
                            value={slide.buttonLink || ''}
                            onChange={(e) => {
                              const updated = [...heroSlides];
                              updated[idx] = { ...updated[idx], buttonLink: e.target.value || null };
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
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => { setKoreSection('kore_trend'); fetchKoreTrendProducts('kore_trend'); setKoreSearch(''); setKoreSearchResults([]); }}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${koreSection === 'kore_trend' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    🌸 Kore Trendleri
                  </button>
                  <button
                    onClick={() => { setKoreSection('bestsellers'); fetchKoreTrendProducts('bestsellers'); setKoreSearch(''); setKoreSearchResults([]); }}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${koreSection === 'bestsellers' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    🏆 En Çok Satanlar
                  </button>
                  <button
                    onClick={() => { setKoreSection('exclusive'); fetchKoreTrendProducts('exclusive'); setKoreSearch(''); setKoreSearchResults([]); }}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${koreSection === 'exclusive' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    ⭐ Merumy.com'a Özel
                  </button>
                  <button
                    onClick={() => { setKoreSection('makeup'); fetchKoreTrendProducts('makeup'); setKoreSearch(''); setKoreSearchResults([]); }}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${koreSection === 'makeup' ? 'bg-pink-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
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
                    {koreSection === 'kore_trend' ? '🌸 Kore Trendleri Listesi' : koreSection === 'bestsellers' ? '🏆 En Çok Satanlar Listesi' : koreSection === 'exclusive' ? '⭐ Merumy.com\'a Özel Listesi' : '💄 Makyaj Ürünleri Listesi'}
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

          {/* FATURA TAB */}
          {activeTab === 'fatura' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">🧾 E-Arşiv Fatura Yönetimi</h2>
                    <p className="text-slate-400 text-sm mt-1">Geçmiş siparişler için QNB eSolutions e-Arşiv faturası oluşturun.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchFaturaOrders()}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors"
                    >
                      🔄 Yenile
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/admin/fatura?action=settings');
                          const data = await res.json();
                          if (data.settings) setFaturaSettings({
                            username: data.settings.username || '',
                            password: data.settings.password || '',
                            vkn: data.settings.vkn || '',
                            erpKodu: data.settings.erpKodu || '',
                            userServiceUrl: data.settings.userServiceUrl || '',
                            earsivServiceUrl: data.settings.earsivServiceUrl || '',
                          });
                        } catch {}
                        setFaturaSettingsOpen(true);
                      }}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-colors"
                      title="e-Arşiv Bağlantı Ayarları"
                    >
                      ⚙️ Ayarlar
                    </button>
                  </div>
                </div>

                {/* Filtreler */}
                <div className="mt-5 space-y-3">
                  {/* Row 1: search + fatura status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Sipariş no, müşteri adı veya e-posta..."
                        value={faturaSearch}
                        onChange={(e) => setFaturaSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { setFaturaPage(1); fetchFaturaOrders(); } }}
                        className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <select
                        value={faturaFilter}
                        onChange={(e) => { setFaturaFilter(e.target.value); setFaturaPage(1); setTimeout(() => fetchFaturaOrders(), 50); }}
                        className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="all">Tümü</option>
                        <option value="bekliyor">Fatura Kesilmemiş</option>
                        <option value="kesildi">Fatura Kesilmiş</option>
                      </select>
                    </div>
                  </div>
                  {/* Row 2: date range + search button */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Başlangıç Tarihi</label>
                      <input
                        type="date"
                        value={faturaDateFrom}
                        onChange={(e) => setFaturaDateFrom(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Bitiş Tarihi</label>
                      <input
                        type="date"
                        value={faturaDateTo}
                        onChange={(e) => setFaturaDateTo(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-xs text-slate-400 mb-1">&nbsp;</label>
                      <button
                        onClick={() => { setFaturaPage(1); fetchFaturaOrders(); }}
                        className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        🔍 Ara
                      </button>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-xs text-slate-400 mb-1">&nbsp;</label>
                      <button
                        onClick={() => { setFaturaSearch(''); setFaturaDateFrom(''); setFaturaDateTo(''); setFaturaFilter('all'); setFaturaPage(1); setTimeout(() => fetchFaturaOrders(), 50); }}
                        className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-colors"
                      >
                        ✕ Temizle
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mesaj */}
              {faturaMsg && (
                <div className={`rounded-xl p-4 text-sm font-medium ${
                  faturaMsg.type === 'success'
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
                }`}>
                  {faturaMsg.text}
                  <button onClick={() => setFaturaMsg(null)} className="ml-3 opacity-60 hover:opacity-100">✕</button>
                </div>
              )}

              {/* Toplu Seçim Çubuğu */}
              {faturaSelected.size > 0 && (
                <div className="bg-amber-600/20 border border-amber-500/40 rounded-xl p-3 flex flex-wrap items-center gap-3">
                  <span className="text-amber-400 font-semibold text-sm">{faturaSelected.size} sipariş seçildi</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={faturaTuru}
                      onChange={e => setFaturaTuru(e.target.value as 'temel' | 'ticari')}
                      className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs"
                    >
                      <option value="temel">Temel Fatura (B2C)</option>
                      <option value="ticari">Ticari Fatura (B2B)</option>
                    </select>
                    {faturaTuru === 'ticari' && (
                      <input
                        type="text"
                        placeholder="Müşteri VKN..."
                        value={musteriVkn}
                        onChange={e => setMusteriVkn(e.target.value)}
                        className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs w-36"
                      />
                    )}
                  </div>
                  <button
                    onClick={handleBulkFaturaKes}
                    disabled={bulkFaturaProcessing}
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    {bulkFaturaProcessing ? (
                      <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>İşleniyor...</>
                    ) : (
                      <>🧾 Toplu Fatura Kes</>
                    )}
                  </button>
                  <button onClick={() => setFaturaSelected(new Set())} className="text-slate-400 hover:text-white text-xs ml-auto">Seçimi Temizle</button>
                </div>
              )}

              {/* Tablo */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Toplam: <span className="text-white font-semibold">{faturaTotal}</span> sipariş</span>
                  <span className="text-slate-500 text-xs">Sayfa {faturaPage}</span>
                </div>

                {faturaLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                  </div>
                ) : faturaOrders.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-5xl mb-3">🧾</p>
                    <p className="text-slate-400">Sipariş bulunamadı</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-750">
                          <th className="px-3 py-3">
                            <input type="checkbox"
                              className="rounded border-slate-600 bg-slate-700 accent-amber-500"
                              checked={faturaSelected.size === faturaOrders.length && faturaOrders.length > 0}
                              onChange={e => setFaturaSelected(e.target.checked ? new Set(faturaOrders.map((o:any)=>o.orderId)) : new Set())}
                            />
                          </th>
                          <th className="text-left px-4 py-3 text-slate-400 font-medium">Sipariş</th>
                          <th className="text-left px-4 py-3 text-slate-400 font-medium">Müşteri</th>
                          <th className="text-left px-4 py-3 text-slate-400 font-medium">Tarih</th>
                          <th className="text-right px-4 py-3 text-slate-400 font-medium">Tutar</th>
                          <th className="text-center px-4 py-3 text-slate-400 font-medium">Fatura Durumu</th>
                          <th className="text-center px-4 py-3 text-slate-400 font-medium">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {faturaOrders.map((order: any) => (
                          <tr key={order.orderId} className="hover:bg-slate-700/20 transition-colors">
                            <td className="px-3 py-3">
                              <input type="checkbox"
                                className="rounded border-slate-600 bg-slate-700 accent-amber-500"
                                checked={faturaSelected.has(order.orderId)}
                                onChange={e => {
                                  const s = new Set(faturaSelected);
                                  e.target.checked ? s.add(order.orderId) : s.delete(order.orderId);
                                  setFaturaSelected(s);
                                }}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-white font-mono text-xs">{order.orderId}</p>
                              <p className="text-slate-500 text-xs mt-0.5">{order.status}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-white text-sm">{order.customerName}</p>
                              <p className="text-slate-500 text-xs">{order.customerEmail}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs">
                              {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                                day: '2-digit', month: '2-digit', year: '2-digit'
                              })}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-white font-semibold">{Number(order.total).toLocaleString('tr-TR')} ₺</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {order.faturaDurum === 'kesildi' ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                                    ✅ Kesildi
                                  </span>
                                  {order.faturaNo && (
                                    <p className="text-slate-400 text-xs">{order.faturaNo}</p>
                                  )}
                                  {order.faturaUrl && (
                                    <a
                                      href={order.faturaUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                                    >
                                      📄 Görüntüle
                                    </a>
                                  )}
                                </div>
                              ) : order.faturaDurum === 'bekleniyor' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                                  ⏳ İşleniyor
                                </span>
                              ) : order.faturaDurum === 'hata' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                                  ❌ Hata
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-700 text-slate-400 rounded-full text-xs font-medium">
                                  — Kesilmedi
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {order.faturaDurum !== 'kesildi' ? (
                                <button
                                  onClick={() => handleFaturaKes(order)}
                                  disabled={!!faturaProcessing}
                                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 mx-auto"
                                >
                                  {faturaProcessing === order.orderId ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      İşleniyor...
                                    </>
                                  ) : (
                                    <>🧾 Önizle & Kes</>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleFaturaKes(order)}
                                  disabled={!!faturaProcessing}
                                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-slate-300 rounded-lg text-xs transition-colors mx-auto"
                                >
                                  🔄 Yeniden Kes
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Sayfalama */}
                {faturaTotal > 20 && (
                  <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                    <button
                      onClick={() => { setFaturaPage(p => Math.max(1, p - 1)); setTimeout(() => fetchFaturaOrders(), 50); }}
                      disabled={faturaPage <= 1}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-lg text-sm transition-colors"
                    >
                      ← Önceki
                    </button>
                    <span className="text-slate-400 text-sm">
                      Sayfa {faturaPage} / {Math.ceil(faturaTotal / 20)}
                    </span>
                    <button
                      onClick={() => { setFaturaPage(p => p + 1); setTimeout(() => fetchFaturaOrders(), 50); }}
                      disabled={faturaPage >= Math.ceil(faturaTotal / 20)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-lg text-sm transition-colors"
                    >
                      Sonraki →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FATURA ÖNİZLEME MODALI */}
          {faturaPreviewOrder && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white">🧾 Fatura Önizleme</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Faturayı oluşturmadan önce kontrol edin</p>
                  </div>
                  <button onClick={() => setFaturaPreviewOrder(null)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Fatura Bilgileri */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 rounded-xl p-4">
                      <p className="text-slate-400 text-xs font-medium mb-1">SATICI (Fatura Kesen)</p>
                      <p className="text-white font-semibold text-xs">Merumy Güzellik ve Bakım Ürünleri Tic. A.Ş.</p>
                      <p className="text-slate-400 text-xs mt-0.5">VKN: 6191329041 | Vergi D.: ERENKÖY</p>
                      <p className="text-slate-400 text-xs">info@merumy.com</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-4">
                      <p className="text-slate-400 text-xs font-medium mb-1">ALICI (Müşteri)</p>
                      <p className="text-white font-semibold">{faturaPreviewOrder.customerName}</p>
                      <p className="text-slate-400 text-xs mt-0.5">TCKN: 11111111111</p>
                      <p className="text-slate-400 text-xs">{faturaPreviewOrder.customerEmail}</p>
                      {faturaPreviewOrder.customerPhone && <p className="text-slate-400 text-xs">{faturaPreviewOrder.customerPhone}</p>}
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-slate-400 text-xs font-medium mb-1">TESLİMAT ADRESİ</p>
                    <p className="text-white text-sm">{faturaPreviewOrder.address}{faturaPreviewOrder.city ? `, ${faturaPreviewOrder.city}` : ''}</p>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <div className="bg-slate-700/50 rounded-xl p-3 flex-1">
                      <p className="text-slate-400 text-xs">Sipariş No</p>
                      <p className="text-white font-mono text-xs mt-0.5">{faturaPreviewOrder.orderId}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-3 flex-1">
                      <p className="text-slate-400 text-xs">Fatura Tarihi</p>
                      <p className="text-white text-xs mt-0.5">{new Date().toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-3 flex-1">
                      <p className="text-slate-400 text-xs">KDV Oranı</p>
                      <p className="text-white text-xs mt-0.5">%20</p>
                    </div>
                  </div>

                  {/* Fatura Türü */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-slate-400 text-xs font-medium mb-2">FATURA TÜRÜ</p>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="faturaTuru" value="temel"
                          checked={faturaTuru === 'temel'}
                          onChange={() => setFaturaTuru('temel')}
                          className="accent-amber-500"
                        />
                        <span className="text-white text-sm font-medium">Temel</span>
                        <span className="text-slate-400 text-xs">(B2C - Bireysel)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="faturaTuru" value="ticari"
                          checked={faturaTuru === 'ticari'}
                          onChange={() => setFaturaTuru('ticari')}
                          className="accent-amber-500"
                        />
                        <span className="text-white text-sm font-medium">Ticari</span>
                        <span className="text-slate-400 text-xs">(B2B - Kurumsal)</span>
                      </label>
                    </div>
                    {faturaTuru === 'ticari' && (
                      <div className="mt-3">
                        <label className="text-slate-400 text-xs block mb-1">Müşteri VKN</label>
                        <input
                          type="text"
                          placeholder="10 haneli VKN girin..."
                          value={musteriVkn}
                          onChange={e => setMusteriVkn(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Ürün Kalemleri */}
                  <div>
                    <p className="text-slate-400 text-xs font-medium mb-2">FATURA KALEMLERİ</p>
                    <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/50">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-700 bg-slate-800/80">
                            <th className="text-left px-3 py-2.5 text-slate-400 font-medium">Ürün</th>
                            <th className="text-center px-3 py-2.5 text-slate-400 font-medium">Adet</th>
                            <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Birim (KDV dahil)</th>
                            <th className="text-right px-3 py-2.5 text-slate-400 font-medium">KDV Matrahı</th>
                            <th className="text-center px-3 py-2.5 text-slate-400 font-medium">KDV %</th>
                            <th className="text-right px-3 py-2.5 text-slate-400 font-medium">Toplam</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {(faturaPreviewOrder.items || []).map((item: any, i: number) => {
                            const gross = Number(item.totalPrice || (item.price * item.quantity));
                            const net = gross / 1.20;
                            const kdv = gross - net;
                            const unitGross = Number(item.price);
                            return (
                              <tr key={i} className="hover:bg-slate-700/20">
                                <td className="px-3 py-2.5 text-white">{item.name}</td>
                                <td className="px-3 py-2.5 text-center text-slate-300">{item.quantity}</td>
                                <td className="px-3 py-2.5 text-right text-slate-300">{unitGross.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td>
                                <td className="px-3 py-2.5 text-right text-slate-400">{net.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td>
                                <td className="px-3 py-2.5 text-center text-amber-400 font-semibold">%20</td>
                                <td className="px-3 py-2.5 text-right text-white font-medium">{gross.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td>
                              </tr>
                            );
                          })}
                          {Number(faturaPreviewOrder.shipping) > 0 && (
                            <tr className="hover:bg-slate-700/20">
                              <td className="px-3 py-2.5 text-slate-400 italic">Kargo Bedeli</td>
                              <td className="px-3 py-2.5 text-center text-slate-300">1</td>
                              <td className="px-3 py-2.5 text-right text-slate-300">{Number(faturaPreviewOrder.shipping).toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td>
                              <td className="px-3 py-2.5 text-right text-slate-400">{(Number(faturaPreviewOrder.shipping)/1.20).toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td>
                              <td className="px-3 py-2.5 text-center text-amber-400 font-semibold">%20</td>
                              <td className="px-3 py-2.5 text-right text-white font-medium">{Number(faturaPreviewOrder.shipping).toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Toplam */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 space-y-2">
                    {(() => {
                      const gross = Number(faturaPreviewOrder.total);
                      const net = gross / 1.20;
                      const kdv = gross - net;
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">KDV Matrahı (%20 hariç)</span>
                            <span className="text-slate-300">{net.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">KDV (%20)</span>
                            <span className="text-slate-300">{kdv.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span>
                          </div>
                          <div className="border-t border-slate-700 pt-2 flex justify-between">
                            <span className="text-white font-bold">Fatura Toplamı (KDV Dahil)</span>
                            <span className="text-emerald-400 font-bold text-lg">{gross.toLocaleString('tr-TR', {minimumFractionDigits:2})} ₺</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Uyarı */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-amber-400 text-xs">
                    ⚠️ Bu fatura e-Arşiv sistemine gönderilecektir. Onayladıktan sonra geri alınamaz.
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-700 flex gap-3 justify-end sticky bottom-0 bg-slate-800">
                  <button
                    onClick={() => setFaturaPreviewOrder(null)}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleFaturaOnayla}
                    disabled={!!faturaProcessing}
                    className="px-8 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                  >
                    {faturaProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Fatura Oluşturuluyor...
                      </>
                    ) : '🧾 Faturayı Oluştur'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FATURA AYARLAR MODALI */}
          {faturaSettingsOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
                <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">⚙️ e-Arşiv Bağlantı Ayarları</h2>
                  <button onClick={() => setFaturaSettingsOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Kullanıcı Adı (userId)</label>
                    <input type="text" value={faturaSettings.username} onChange={e => setFaturaSettings(s => ({...s, username: e.target.value}))}
                      placeholder="sena.ozbeyYq7"
                      className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Şifre</label>
                    <input type="password" value={faturaSettings.password} onChange={e => setFaturaSettings(s => ({...s, password: e.target.value}))}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">VKN</label>
                      <input type="text" value={faturaSettings.vkn} onChange={e => setFaturaSettings(s => ({...s, vkn: e.target.value}))}
                        placeholder="6191329041"
                        className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">ERP Kodu</label>
                      <input type="text" value={faturaSettings.erpKodu} onChange={e => setFaturaSettings(s => ({...s, erpKodu: e.target.value}))}
                        placeholder="VYN31280"
                        className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">User Service URL</label>
                    <input type="text" value={faturaSettings.userServiceUrl} onChange={e => setFaturaSettings(s => ({...s, userServiceUrl: e.target.value}))}
                      placeholder="https://connectortest.qnbesolutions.com.tr/connector/ws/userService"
                      className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">e-Arşiv Service URL</label>
                    <input type="text" value={faturaSettings.earsivServiceUrl} onChange={e => setFaturaSettings(s => ({...s, earsivServiceUrl: e.target.value}))}
                      placeholder="https://earsivtest.qnbesolutions.com.tr/earsiv/ws/EarsivWebService"
                      className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-blue-400 text-xs">
                    💡 Test ortamı için QNB eSolutions&apos;dan aldığınız WS kullanıcı adı ve şifresini girin. Canlıya geçişte production URL&apos;lerini kullanın.
                  </div>
                </div>
                <div className="p-6 border-t border-slate-700 flex gap-3 justify-end">
                  <button onClick={() => setFaturaSettingsOpen(false)} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm">İptal</button>
                  <button onClick={handleFaturaSettingsSave} disabled={faturaSettingsSaving}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2">
                    {faturaSettingsSaving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Kaydediliyor...</> : '💾 Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVITY LOG TAB (admin@merumy.com only) */}
          {activeTab === 'activity' && currentUserEmail === 'admin@merumy.com' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-slate-800 rounded-2xl p-4 md:p-6 border border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">📋 Yapılan İşlemler</h2>
                    <p className="text-slate-400 text-sm mt-1">{activityTotal} kayıt bulundu</p>
                  </div>
                  <button
                    onClick={() => { setActivityPage(1); fetchActivityLogs(1); }}
                    disabled={activityLoading}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2 self-start"
                  >
                    {activityLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🔄'} Yenile
                  </button>
                </div>

                {/* Filters */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* User filter */}
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">👤 Kullanıcı (e-posta)</label>
                    <input
                      type="text"
                      placeholder="örn. sena@merumy.com"
                      value={activityUserFilter}
                      onChange={(e) => setActivityUserFilter(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { setActivityPage(1); fetchActivityLogs(1); } }}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  {/* Date from */}
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">📅 Başlangıç Tarihi</label>
                    <input
                      type="date"
                      value={activityDateFrom}
                      onChange={(e) => setActivityDateFrom(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  {/* Date to */}
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">📅 Bitiş Tarihi</label>
                    <input
                      type="date"
                      value={activityDateTo}
                      onChange={(e) => setActivityDateTo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-end">
                    <button
                      onClick={() => { setActivityPage(1); fetchActivityLogs(1); }}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      🔍 Filtrele
                    </button>
                    {(activityUserFilter || activityDateFrom || activityDateTo) && (
                      <button
                        onClick={() => {
                          setActivityUserFilter('');
                          setActivityDateFrom('');
                          setActivityDateTo('');
                          setActivityPage(1);
                          setTimeout(() => fetchActivityLogs(1), 100);
                        }}
                        className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded-xl text-sm transition-colors"
                      >
                        ✕ Temizle
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick user shortcuts */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-slate-500 text-xs self-center">Hızlı:</span>
                  {['sena@merumy.com', 'devrim@merumy.com', 'duygu@merumy.com', 'admin@merumy.com'].map(email => (
                    <button
                      key={email}
                      onClick={() => {
                        setActivityUserFilter(email);
                        setActivityPage(1);
                        setTimeout(() => fetchActivityLogs(1), 50);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        activityUserFilter === email
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                      }`}
                    >
                      {email.split('@')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {activityLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
                  <p className="text-slate-500 text-lg">Kayıt bulunamadı</p>
                  <p className="text-slate-600 text-sm mt-2">
                    {activityUserFilter || activityDateFrom || activityDateTo
                      ? 'Filtreleri değiştirerek tekrar deneyin'
                      : 'İşlemler gerçekleştirildikçe burada görünecek'}
                  </p>
                </div>
              ) : (
                <>
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
                          <div key={log.id} className="flex items-start gap-3 md:gap-4 p-3 md:p-4 hover:bg-slate-700/30 transition-colors">
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-700 flex items-center justify-center text-base md:text-lg flex-shrink-0">
                              {actionInfo.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm font-semibold ${actionInfo.color}`}>{actionInfo.label}</span>
                                <span className="text-slate-500 text-xs">•</span>
                                <button
                                  onClick={() => {
                                    setActivityUserFilter(log.user_email);
                                    setActivityPage(1);
                                    setTimeout(() => fetchActivityLogs(1), 50);
                                  }}
                                  className="text-slate-400 text-xs font-medium hover:text-purple-400 transition-colors"
                                >
                                  {log.user_email}
                                </button>
                              </div>
                              {log.description && (
                                <p className="text-slate-300 text-sm mt-0.5">{log.description}</p>
                              )}
                            </div>
                            <div className="text-slate-500 text-xs flex-shrink-0 text-right whitespace-nowrap">
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

                  {/* Pagination */}
                  {activityTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { const p = Math.max(1, activityPage - 1); setActivityPage(p); fetchActivityLogs(p); }}
                        disabled={activityPage === 1}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm disabled:opacity-40"
                      >
                        ← Önceki
                      </button>
                      <span className="text-slate-400 text-sm px-4">
                        {activityPage} / {activityTotalPages} ({activityTotal} kayıt)
                      </span>
                      <button
                        onClick={() => { const p = Math.min(activityTotalPages, activityPage + 1); setActivityPage(p); fetchActivityLogs(p); }}
                        disabled={activityPage === activityTotalPages}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm disabled:opacity-40"
                      >
                        Sonraki →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {/* ── ANALYTICS TAB (admin@merumy.com only) ── */}
          {activeTab === 'analytics' && currentUserEmail === 'admin@merumy.com' && (
            <div className="space-y-6">
              {/* Header + Filters */}
              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Analiz & Raporlar</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Tarih aralığı seçerek satış verilerini filtreleyin</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-end">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Başlangıç</label>
                      <input type="date" value={analyticsDateFrom} onChange={e => setAnalyticsDateFrom(e.target.value)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Bitiş</label>
                      <input type="date" value={analyticsDateTo} onChange={e => setAnalyticsDateTo(e.target.value)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <button onClick={fetchAnalytics} disabled={analyticsLoading}
                      className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                      {analyticsLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : null}
                      Filtrele
                    </button>
                    {(analyticsDateFrom || analyticsDateTo) && (
                      <button onClick={() => { setAnalyticsDateFrom(''); setAnalyticsDateTo(''); setTimeout(fetchAnalytics, 50); }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-colors">
                        Temizle
                      </button>
                    )}
                    {/* Quick presets */}
                    {[
                      { label: 'Bugün', df: new Date().toISOString().split('T')[0], dt: new Date().toISOString().split('T')[0] },
                      { label: 'Bu Hafta', df: (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().split('T')[0]; })(), dt: new Date().toISOString().split('T')[0] },
                      { label: 'Bu Ay', df: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], dt: new Date().toISOString().split('T')[0] },
                      { label: 'Son 30 Gün', df: (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; })(), dt: new Date().toISOString().split('T')[0] },
                    ].map(p => (
                      <button key={p.label}
                        onClick={() => { setAnalyticsDateFrom(p.df); setAnalyticsDateTo(p.dt); setTimeout(fetchAnalytics, 50); }}
                        className="px-3 py-2 bg-slate-700 hover:bg-sky-600/30 text-slate-300 hover:text-sky-400 rounded-xl text-xs font-medium transition-colors border border-slate-600 hover:border-sky-500/40">
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {analyticsLoading && !analyticsData ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                </div>
              ) : analyticsData ? (
                <>
                  {/* Today Highlight */}
                  <div className="bg-gradient-to-r from-sky-900/40 to-indigo-900/40 rounded-2xl p-5 border border-sky-500/20">
                    <p className="text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">Bugün</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Sipariş', value: analyticsData.today.ordersToday, color: '#38bdf8' },
                        { label: 'Ciro', value: `₺${Number(analyticsData.today.revenueToday).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, color: '#34d399' },
                        { label: 'Ürün Satıldı', value: analyticsData.today.itemsToday, color: '#a78bfa' },
                        { label: 'Kargoya Çıktı', value: analyticsData.today.shippedToday, color: '#fb923c' },
                      ].map(s => (
                        <div key={s.label} className="text-center">
                          <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                          <p className="text-slate-400 text-sm mt-1">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary KPIs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Toplam Ciro', value: `₺${Number(analyticsData.summary.totalRevenue).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, sub: analyticsDateFrom ? `${analyticsDateFrom} – ${analyticsDateTo || 'bugün'}` : 'Tüm zamanlar', color: '#34d399' },
                      { label: 'Sipariş Sayısı', value: analyticsData.summary.totalOrders, sub: `${analyticsData.summary.uniqueCustomers} benzersiz müşteri`, color: '#38bdf8' },
                      { label: 'Satılan Ürün', value: analyticsData.summary.totalItemsSold, sub: `Ort. ₺${Number(analyticsData.summary.avgOrderValue).toLocaleString('tr-TR', { minimumFractionDigits: 0 })} / sipariş`, color: '#a78bfa' },
                      { label: 'Kargoya Çıkan', value: analyticsData.summary.shippedOrders, sub: `${analyticsData.summary.activeOrders} aktif sipariş`, color: '#fb923c' },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                        <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-white font-medium mt-1 text-sm">{s.label}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Status Breakdown */}
                  <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                    <h3 className="text-white font-semibold mb-4">Durum Dağılımı</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {(analyticsData.statusBreakdown || []).map((s: any) => {
                        const statusMap: Record<string, { label: string; color: string }> = {
                          pending: { label: 'Beklemede', color: '#f59e0b' },
                          processing: { label: 'İşleniyor', color: '#3b82f6' },
                          confirmed: { label: 'Onaylandı', color: '#6366f1' },
                          preparing: { label: 'Hazırlanıyor', color: '#f97316' },
                          shipped: { label: 'Kargoda', color: '#a855f7' },
                          delivered: { label: 'Teslim', color: '#10b981' },
                          cancelled: { label: 'İptal', color: '#ef4444' },
                        };
                        const info = statusMap[s.status] || { label: s.status, color: '#94a3b8' };
                        return (
                          <div key={s.status} className="rounded-xl p-3 text-center" style={{ background: `${info.color}15`, border: `1px solid ${info.color}25` }}>
                            <p className="text-2xl font-bold" style={{ color: info.color }}>{s.count}</p>
                            <p className="text-xs mt-1" style={{ color: info.color }}>{info.label}</p>
                            <p className="text-slate-500 text-xs mt-0.5">₺{Number(s.revenue).toLocaleString('tr-TR', { minimumFractionDigits: 0 })}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Table */}
                  {analyticsData.daily && analyticsData.daily.length > 0 && (
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                      <div className="p-4 border-b border-slate-700">
                        <h3 className="text-white font-semibold">Günlük Detay</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-sm">
                          <thead>
                            <tr className="border-b border-slate-700 bg-slate-900/50">
                              <th className="text-left px-4 py-3 text-slate-400 font-medium">Tarih</th>
                              <th className="text-center px-4 py-3 text-slate-400 font-medium">Sipariş</th>
                              <th className="text-right px-4 py-3 text-slate-400 font-medium">Ciro</th>
                              <th className="text-center px-4 py-3 text-slate-400 font-medium">Satılan Ürün</th>
                              <th className="text-center px-4 py-3 text-slate-400 font-medium">Kargoya Çıkan</th>
                              <th className="text-center px-4 py-3 text-slate-400 font-medium">Bekleyen</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                            {analyticsData.daily.map((row: any) => (
                              <tr key={row.date} className="hover:bg-slate-700/20 transition-colors">
                                <td className="px-4 py-3 text-slate-300 font-medium">{new Date(row.date).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-sky-400 bg-sky-400/10">{row.orderCount}</span>
                                </td>
                                <td className="px-4 py-3 text-right text-emerald-400 font-semibold">₺{Number(row.revenue).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3 text-center text-slate-300">{row.itemsSold}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium text-orange-400 bg-orange-400/10">{row.shippedCount}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium text-amber-400 bg-amber-400/10">{row.pendingCount}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Top Products */}
                  {analyticsData.topProducts && analyticsData.topProducts.length > 0 && (
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                      <div className="p-4 border-b border-slate-700">
                        <h3 className="text-white font-semibold">En Çok Satan Ürünler</h3>
                      </div>
                      <div className="divide-y divide-slate-700/50">
                        {analyticsData.topProducts.map((p: any, i: number) => (
                          <div key={i} className="px-4 py-3 flex items-center gap-4 hover:bg-slate-700/20 transition-colors">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: i < 3 ? '#f59e0b20' : 'rgba(255,255,255,0.06)', color: i < 3 ? '#f59e0b' : '#94a3b8' }}>
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{p.name}</p>
                              <p className="text-slate-500 text-xs">{p.brand || '-'}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-emerald-400 font-semibold text-sm">₺{Number(p.revenue).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                              <p className="text-slate-400 text-xs">{p.qty} adet</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-16 text-center">
                  <p className="text-slate-400">Analiz yüklemek için Filtrele butonuna basın veya tarih seçin.</p>
                  <button onClick={fetchAnalytics} className="mt-4 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition-colors">
                    Tüm Zamanları Yükle
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── MAIL MARKETING TAB ── */}
          {activeTab === 'mail-marketing' && ['admin@merumy.com','sena@merumy.com','serap@merumy.com','buse@merumy.com'].includes(currentUserEmail) && (
            <div className="space-y-5">
              {/* Header */}
              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Mail Marketing</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Kullanıcıları filtreleyin ve e-posta listelerini dışa aktarın</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="mt-5 space-y-4">
                  {/* Segment buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'Tüm Kullanıcılar' },
                      { value: 'with_orders', label: 'Sipariş Verenler' },
                      { value: 'no_orders', label: 'Hiç Sipariş Vermeyen' },
                      { value: 'multiple_orders', label: 'Tekrar Alışveriş Yapan' },
                      { value: 'high_value', label: 'Yüksek Değerli (≥₺1000)' },
                      { value: 'recent_30', label: 'Son 30 Gün Kayıt' },
                      { value: 'recent_90', label: 'Son 90 Gün Kayıt' },
                    ].map(f => (
                      <button
                        key={f.value}
                        onClick={() => setMailFilter(f.value)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all border"
                        style={mailFilter === f.value ? {
                          background: 'rgba(249,115,22,0.15)',
                          color: '#fb923c',
                          borderColor: 'rgba(249,115,22,0.35)',
                        } : {
                          background: 'rgba(255,255,255,0.04)',
                          color: 'rgba(255,255,255,0.45)',
                          borderColor: 'rgba(255,255,255,0.08)',
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <input type="text" placeholder="Ad veya e-posta ara..."
                        value={mailSearch} onChange={e => setMailSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchMailMarketing()}
                        className="w-full px-4 py-2.5 pl-10 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                      <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <input type="date" placeholder="Kayıt başlangıç" value={mailDateFrom} onChange={e => setMailDateFrom(e.target.value)}
                        className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <div>
                      <input type="date" placeholder="Kayıt bitiş" value={mailDateTo} onChange={e => setMailDateTo(e.target.value)}
                        className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-orange-500" />
                    </div>
                    <button onClick={fetchMailMarketing} disabled={mailLoading}
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                      {mailLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : null}
                      Listele
                    </button>
                  </div>
                </div>
              </div>

              {/* Results */}
              {mailLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                </div>
              ) : mailUsers.length > 0 ? (
                <div className="space-y-4">
                  {/* Action bar */}
                  <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-white font-medium">
                      <span className="text-orange-400 font-bold">{mailTotal}</span> kullanıcı bulundu
                    </p>
                    <div className="flex gap-2">
                      {/* Copy all emails */}
                      <button
                        onClick={() => {
                          const emails = mailUsers.map(u => u.email).join(', ');
                          navigator.clipboard.writeText(emails);
                          setMailCopied(true);
                          setTimeout(() => setMailCopied(false), 2500);
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all border"
                        style={mailCopied ? {
                          background: 'rgba(52,211,153,0.15)',
                          color: '#34d399',
                          borderColor: 'rgba(52,211,153,0.3)',
                        } : {
                          background: 'rgba(249,115,22,0.12)',
                          color: '#fb923c',
                          borderColor: 'rgba(249,115,22,0.25)',
                        }}
                      >
                        {mailCopied ? (
                          <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg> Kopyalandı!</>
                        ) : (
                          <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg> E-postaları Kopyala</>
                        )}
                      </button>
                      {/* CSV Download */}
                      <button
                        onClick={() => {
                          const csv = ['Ad,E-posta,Telefon,Sipariş Sayısı,Toplam Harcama,Kayıt Tarihi', ...mailUsers.map(u =>
                            [`"${u.name || ''}"`, u.email, u.phone || '', u.orderCount, `₺${Number(u.totalSpent).toFixed(2)}`, new Date(u.created_at).toLocaleDateString('tr-TR')].join(',')
                          )].join('\n');
                          const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a'); a.href = url;
                          a.download = `mail-marketing-${new Date().toISOString().split('T')[0]}.csv`;
                          a.click(); URL.revokeObjectURL(url);
                        }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm font-medium flex items-center gap-2 border border-slate-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        CSV İndir
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] text-sm">
                        <thead>
                          <tr className="border-b border-slate-700 bg-slate-900/50">
                            <th className="text-left px-4 py-3 text-slate-400 font-medium">#</th>
                            <th className="text-left px-4 py-3 text-slate-400 font-medium">Ad Soyad</th>
                            <th className="text-left px-4 py-3 text-slate-400 font-medium">E-posta</th>
                            <th className="text-left px-4 py-3 text-slate-400 font-medium">Telefon</th>
                            <th className="text-center px-4 py-3 text-slate-400 font-medium">Sipariş</th>
                            <th className="text-right px-4 py-3 text-slate-400 font-medium">Harcama</th>
                            <th className="text-left px-4 py-3 text-slate-400 font-medium">Kayıt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {mailUsers.map((u, i) => (
                            <tr key={u.id} className="hover:bg-slate-700/20 transition-colors">
                              <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                              <td className="px-4 py-3 text-white font-medium">{u.name || '—'}</td>
                              <td className="px-4 py-3">
                                <span className="text-orange-400 font-mono text-xs">{u.email}</span>
                              </td>
                              <td className="px-4 py-3 text-slate-400 text-xs">{u.phone || '—'}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${Number(u.orderCount) > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                                  {u.orderCount}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold" style={{ color: Number(u.totalSpent) >= 1000 ? '#fb923c' : Number(u.totalSpent) > 0 ? '#34d399' : '#64748b' }}>
                                {Number(u.totalSpent) > 0 ? `₺${Number(u.totalSpent).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—'}
                              </td>
                              <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString('tr-TR')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-16 text-center">
                  <p className="text-slate-400 text-lg">Listelemek için Listele butonuna basın</p>
                  <p className="text-slate-600 text-sm mt-2">Segment seçin ve kullanıcıları filtreleyin</p>
                </div>
              )}
            </div>
          )}

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
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: '#161b22', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="p-6 flex justify-between items-center sticky top-0 z-10" style={{ background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <h2 className="text-lg font-bold text-white">Ürün Düzenle</h2>
                <p className="text-sm mt-0.5 line-clamp-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{editingProduct.name}</p>
              </div>
              <button onClick={closeEditModal} className="p-2 rounded-xl transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Product image preview */}
              {editingProduct.image && (
                <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <img
                    src={editingProduct.image}
                    alt={editingProduct.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/gorselsizurun.jpg'; }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Ana Görsel</p>
                    <p className="text-xs mt-1 break-all" style={{ color: 'rgba(255,255,255,0.25)' }}>{editingProduct.image}</p>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>Ürün Adı *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(146,208,170,0.5)'; e.currentTarget.style.background = 'rgba(146,208,170,0.04)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>Açıklama</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(146,208,170,0.5)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>

              {/* Price & Compare Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>Fiyat (₺) *</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(146,208,170,0.5)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>İndirimden Önceki Fiyat (₺)</label>
                  <input
                    type="number"
                    value={editForm.comparePrice}
                    onChange={(e) => setEditForm({ ...editForm, comparePrice: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(146,208,170,0.5)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>Stok Miktarı</label>
                <input
                  type="number"
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(146,208,170,0.5)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  min="0"
                />
                <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>0 = Stok dışı · 1-5 = Az stok · 6+ = Stokta</p>
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>Marka</label>
                  <input
                    type="text"
                    value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    list="brand-options"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(146,208,170,0.5)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                  <datalist id="brand-options">
                    {dbBrands.map(b => <option key={b} value={b} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>Kategori</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    list="category-options"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(146,208,170,0.5)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                  <datalist id="category-options">
                    {dbCategories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              {/* Barcode & SKU */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>Barkod</label>
                  <input
                    type="text"
                    value={editForm.barcode}
                    onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-white text-sm font-mono focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(146,208,170,0.5)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>SKU / Kod</label>
                  <input
                    type="text"
                    value={editForm.sku}
                    onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-white text-sm font-mono focus:outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(146,208,170,0.5)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                    onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                  className="flex items-center gap-3 rounded-xl p-4 flex-1 text-left transition-all"
                  style={{ background: editForm.isActive ? 'rgba(146,208,170,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${editForm.isActive ? 'rgba(146,208,170,0.2)' : 'rgba(255,255,255,0.07)'}` }}
                  >
                  <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${editForm.isActive ? 'bg-[#92D0AA]' : ''}`}
                    style={!editForm.isActive ? { background: 'rgba(255,255,255,0.15)' } : {}}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editForm.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Aktif / Satışta</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{editForm.isActive ? 'Sitede görünür' : 'Sitede gizli'}</p>
                  </div>
                </button>
                <button
                  type="button"
                    onClick={() => setEditForm({ ...editForm, isFeatured: !editForm.isFeatured })}
                  className="flex items-center gap-3 rounded-xl p-4 flex-1 text-left transition-all"
                  style={{ background: editForm.isFeatured ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${editForm.isFeatured ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.07)'}` }}
                  >
                  <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0`}
                    style={{ background: editForm.isFeatured ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${editForm.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Öne Çıkan</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{editForm.isFeatured ? 'Öne çıkan ürün' : 'Normal ürün'}</p>
                  </div>
                </button>
              </div>

              {/* ── Product Gallery ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-slate-400 text-sm font-medium">🖼️ Ürün Görselleri (Galeri)</label>
                  {galleryLoading && (
                    <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  )}
                </div>

                {galleryMsg && (
                  <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-medium ${galleryMsg.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25'}`}>
                    {galleryMsg.text}
                  </div>
                )}

                {/* Gallery Grid */}
                {productGalleryImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                    {productGalleryImages.map(img => (
                      <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-700 border border-slate-600">
                        <img
                          src={img.image_url}
                          alt="Ürün görseli"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/gorselsizurun.jpg'; }}
                        />
                        {img.is_primary && (
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-emerald-500 rounded-md text-[10px] text-white font-bold leading-none">
                            Ana
                          </div>
                        )}
                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                          {!img.is_primary && (
                            <button
                              onClick={() => setGalleryPrimary(img.id, editingProduct!.id)}
                              className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-medium rounded-lg transition-colors w-20 text-center"
                            >
                              Ana Yap
                            </button>
                          )}
                          <button
                            onClick={() => deleteGalleryImage(img.id, editingProduct!.id)}
                            className="px-2 py-1 bg-red-500/80 hover:bg-red-600 text-white text-[11px] font-medium rounded-lg transition-colors w-20 text-center"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !galleryLoading && (
                    <div className="mb-3 py-6 rounded-xl border border-dashed border-slate-600 text-center">
                      <p className="text-slate-500 text-sm">Henüz galeri görseli eklenmemiş</p>
                      <p className="text-slate-600 text-xs mt-1">Aşağıdan görsel yükleyin veya URL ekleyin</p>
                    </div>
                  )
                )}

                {/* Upload / URL Add */}
                <div className="space-y-2">
                  {/* File upload */}
                  <label className="flex items-center gap-2 px-3 py-2.5 bg-slate-700/60 border border-slate-600 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors">
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-slate-300 text-sm">{galleryUploading ? 'Yükleniyor...' : 'Bilgisayardan Görsel Yükle'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={galleryUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && editingProduct) {
                          await uploadGalleryImage(file, editingProduct.id);
                          e.target.value = '';
                        }
                      }}
                    />
                </label>

                  {/* URL input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={galleryUrlInput}
                      onChange={e => setGalleryUrlInput(e.target.value)}
                      placeholder="https://... (görsel URL'si)"
                      className="flex-1 px-3 py-2.5 bg-slate-700/60 border border-slate-600 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-slate-500"
                      onKeyDown={e => { if (e.key === 'Enter' && editingProduct) addGalleryImageByUrl(editingProduct.id); }}
                    />
                    <button
                      onClick={() => editingProduct && addGalleryImageByUrl(editingProduct.id)}
                      disabled={!galleryUrlInput.trim() || galleryUploading}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm rounded-xl transition-colors font-medium whitespace-nowrap"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>

              {/* Success message */}
              {saveSuccess && (
                <div className="rounded-xl p-4 text-center text-sm font-medium" style={{ background: 'rgba(146,208,170,0.12)', border: '1px solid rgba(146,208,170,0.25)', color: '#92D0AA' }}>
                  ✓ Ürün başarıyla güncellendi!
                </div>
              )}
            </div>
            
            <div className="p-5 flex justify-end gap-3 sticky bottom-0" style={{ background: '#161b22', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={closeEditModal}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              >
                İptal
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={savingProduct || !editForm.name || !editForm.price}
                className="px-7 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                style={{ background: '#92D0AA', color: '#0a1f14' }}
                onMouseEnter={e => { if (!savingProduct) e.currentTarget.style.background = '#7abb96'; }}
                onMouseLeave={e => { if (!savingProduct) e.currentTarget.style.background = '#92D0AA'; }}
              >
                {savingProduct ? (
                  <>
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(10,31,20,0.3)', borderTopColor: '#0a1f14' }} />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN USERS TAB ── */}
      {activeTab === 'admin-users' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">👤 Admin Kullanıcı Yönetimi</h2>
                <p className="text-slate-400 text-sm mt-1">Admin paneline erişen kullanıcıları yönetin.</p>
              </div>
              <button
                onClick={() => { setShowNewAdminUserForm(true); setAdminUserMsg(null); }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors"
              >+ Yeni Admin</button>
            </div>
            {adminUserMsg && (
              <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${adminUserMsg.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25'}`}>
                {adminUserMsg.text}
              </div>
            )}

            {/* New Admin User Form */}
            {showNewAdminUserForm && (
              <div className="mb-6 bg-slate-700 rounded-xl p-5 border border-slate-600">
                <h3 className="text-white font-semibold mb-4">Yeni Admin Oluştur</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <input type="text" placeholder="Ad Soyad" value={newAdminUserForm.name}
                    onChange={e => setNewAdminUserForm({...newAdminUserForm, name: e.target.value})}
                    className="px-3 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400" />
                  <input type="email" placeholder="E-posta" value={newAdminUserForm.email}
                    onChange={e => setNewAdminUserForm({...newAdminUserForm, email: e.target.value})}
                    className="px-3 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400" />
                  <input type="text" placeholder="Başlangıç Şifresi" value={newAdminUserForm.password}
                    onChange={e => setNewAdminUserForm({...newAdminUserForm, password: e.target.value})}
                    className="px-3 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400" />
                  <select value={newAdminUserForm.role}
                    onChange={e => setNewAdminUserForm({...newAdminUserForm, role: e.target.value, allowedSections: e.target.value === 'super_admin' ? [] : newAdminUserForm.allowedSections})}
                    className="px-3 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400">
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin (Tam Yetki)</option>
                  </select>
                </div>
                {newAdminUserForm.role !== 'super_admin' && (
                  <div className="mb-4">
                    <p className="text-slate-400 text-xs mb-2">Erişim İzinleri (boş = tüm bölümler):</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {id:'orders',label:'Siparişler'},{id:'products',label:'Ürün Yönetimi'},
                        {id:'users',label:'Kullanıcılar'},{id:'reports',label:'Satış Raporu'},
                        {id:'hero',label:'Hero Yönetimi'},{id:'kore-trends',label:'Kore Trendleri'},
                        {id:'fatura',label:'Fatura'},{id:'analytics',label:'Analiz'},
                        {id:'mail-marketing',label:'Mail Marketing'},{id:'coupons',label:'İndirim Kodları'},
                      ].map(s => (
                        <button key={s.id} type="button"
                          onClick={() => {
                            const cur = newAdminUserForm.allowedSections;
                            setNewAdminUserForm({...newAdminUserForm, allowedSections: cur.includes(s.id) ? cur.filter(x => x !== s.id) : [...cur, s.id]});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${newAdminUserForm.allowedSections.includes(s.id) ? 'bg-amber-500 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'}`}
                        >{s.label}</button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowNewAdminUserForm(false)} className="px-4 py-2 bg-slate-600 text-slate-300 rounded-xl text-sm hover:bg-slate-500 transition-colors">İptal</button>
                  <button onClick={handleCreateAdminUser} disabled={savingAdminUser} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                    {savingAdminUser ? 'Kaydediliyor...' : 'Oluştur'}
                  </button>
                </div>
              </div>
            )}

            {/* Admin Users List */}
            {adminUsersLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /></div>
            ) : (
              <div className="space-y-3">
                {adminUsers.map((u: any) => (
                  <div key={u.id} className="bg-slate-700 rounded-xl p-4 border border-slate-600">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold text-sm">{u.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${u.role === 'super_admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-600 text-slate-300'}`}>
                            {u.role === 'super_admin' ? '⭐ Super Admin' : '🔧 Admin'}
                          </span>
                          {u.must_change_password === 1 && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">🔑 Şifre Değiştirilmeli</span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mt-1">{u.email}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {u.allowedSections ? (
                            u.allowedSections.map((s: string) => (
                              <span key={s} className="px-2 py-0.5 bg-slate-600 text-slate-300 rounded text-[10px]">{s}</span>
                            ))
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px]">Tüm bölümler</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingAdminUser({...u, mode: 'password'});
                            setNewPasswordForUser('');
                            setAdminUserEditSections(u.allowedSections || []);
                            setAdminUserEditRole(u.role || 'admin');
                          }}
                          className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded-lg text-xs transition-colors"
                        >🔑 Şifre</button>
                        <button
                          onClick={() => {
                            setEditingAdminUser({...u, mode: 'permissions'});
                            setAdminUserEditSections(u.allowedSections || []);
                            setAdminUserEditRole(u.role || 'admin');
                          }}
                          className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded-lg text-xs transition-colors"
                        >✏️ İzinler</button>
                        <button
                          onClick={() => handleDeleteAdminUser(u.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-colors"
                        >🗑️</button>
                      </div>
                    </div>

                    {/* Inline edit for this user */}
                    {editingAdminUser?.id === u.id && editingAdminUser.mode === 'password' && (
                      <div className="mt-4 pt-4 border-t border-slate-600">
                        <p className="text-slate-400 text-xs mb-2">Yeni şifre:</p>
                        <div className="flex gap-2">
                          <input type="text" placeholder="Yeni şifre (min 6 karakter)" value={newPasswordForUser}
                            onChange={e => setNewPasswordForUser(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400" />
                          <button onClick={() => handleUpdateAdminUserPassword(u.id)} disabled={savingAdminUser}
                            className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                            {savingAdminUser ? '...' : 'Kaydet'}
                          </button>
                          <button onClick={() => setEditingAdminUser(null)} className="px-3 py-2 bg-slate-600 text-slate-300 rounded-xl text-sm hover:bg-slate-500 transition-colors">İptal</button>
                        </div>
                      </div>
                    )}

                    {editingAdminUser?.id === u.id && editingAdminUser.mode === 'permissions' && (
                      <div className="mt-4 pt-4 border-t border-slate-600">
                        <div className="mb-3">
                          <p className="text-slate-400 text-xs mb-2">Rol:</p>
                          <select value={adminUserEditRole} onChange={e => setAdminUserEditRole(e.target.value)}
                            className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400">
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin (Tam Yetki)</option>
                          </select>
                        </div>
                        {adminUserEditRole !== 'super_admin' && (
                          <div className="mb-3">
                            <p className="text-slate-400 text-xs mb-2">Erişim İzinleri (boş = tüm bölümler):</p>
                            <div className="flex flex-wrap gap-2">
                              {[
                                {id:'orders',label:'Siparişler'},{id:'products',label:'Ürün Yönetimi'},
                                {id:'users',label:'Kullanıcılar'},{id:'reports',label:'Satış Raporu'},
                                {id:'hero',label:'Hero Yönetimi'},{id:'kore-trends',label:'Kore Trendleri'},
                                {id:'fatura',label:'Fatura'},{id:'analytics',label:'Analiz'},
                                {id:'mail-marketing',label:'Mail Marketing'},{id:'coupons',label:'İndirim Kodları'},
                              ].map(s => (
                                <button key={s.id} type="button"
                                  onClick={() => setAdminUserEditSections(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${adminUserEditSections.includes(s.id) ? 'bg-amber-500 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'}`}
                                >{s.label}</button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateAdminUserPermissions(u.id)} disabled={savingAdminUser}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                            {savingAdminUser ? 'Kaydediliyor...' : 'İzinleri Kaydet'}
                          </button>
                          <button onClick={() => setEditingAdminUser(null)} className="px-4 py-2 bg-slate-600 text-slate-300 rounded-xl text-sm hover:bg-slate-500 transition-colors">İptal</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COUPONS TAB ── */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">🎟️ İndirim Kodu Yönetimi</h2>
                <p className="text-slate-400 text-sm mt-1">Kampanya kodları oluşturun ve yönetin.</p>
              </div>
              <button
                onClick={() => { setShowNewCouponForm(true); setCouponMsg(null); }}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors"
              >+ Yeni Kod</button>
            </div>

            {couponMsg && (
              <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${couponMsg.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25'}`}>
                {couponMsg.text}
              </div>
            )}

            {/* New Coupon Form */}
            {showNewCouponForm && (
              <div className="mb-6 bg-slate-700 rounded-xl p-5 border border-slate-600">
                <h3 className="text-white font-semibold mb-4">Yeni İndirim Kodu</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Kupon Kodu *</label>
                    <input type="text" placeholder="ör: MERUMY2026" value={newCouponForm.code}
                      onChange={e => setNewCouponForm({...newCouponForm, code: e.target.value.toUpperCase()})}
                      className="w-full px-3 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-400 uppercase" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Açıklama</label>
                    <input type="text" placeholder="ör: 5000 TL üzeri 1000 TL indirim" value={newCouponForm.description}
                      onChange={e => setNewCouponForm({...newCouponForm, description: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-400" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">İndirim Tipi *</label>
                    <select value={newCouponForm.discountType}
                      onChange={e => setNewCouponForm({...newCouponForm, discountType: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white text-sm focus:outline-none focus:border-purple-400">
                      <option value="fixed">Sabit Tutar (₺)</option>
                      <option value="percentage">Yüzde (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">İndirim Değeri *</label>
                    <input type="number" placeholder={newCouponForm.discountType === 'fixed' ? 'ör: 1000' : 'ör: 20'} value={newCouponForm.discountValue}
                      onChange={e => setNewCouponForm({...newCouponForm, discountValue: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-400" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Minimum Sepet Tutarı (₺)</label>
                    <input type="number" placeholder="ör: 5000" value={newCouponForm.minOrderAmount}
                      onChange={e => setNewCouponForm({...newCouponForm, minOrderAmount: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-400" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Max İndirim Limiti (₺, yüzde için)</label>
                    <input type="number" placeholder="ör: 500" value={newCouponForm.maxDiscountAmount}
                      onChange={e => setNewCouponForm({...newCouponForm, maxDiscountAmount: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-400" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Kullanım Limiti (boş = sınırsız)</label>
                    <input type="number" placeholder="ör: 100" value={newCouponForm.usageLimit}
                      onChange={e => setNewCouponForm({...newCouponForm, usageLimit: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-400" />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Son Kullanma Tarihi</label>
                    <input type="date" value={newCouponForm.expiresAt}
                      onChange={e => setNewCouponForm({...newCouponForm, expiresAt: e.target.value})}
                      className="w-full px-3 py-2.5 bg-slate-600 border border-slate-500 rounded-xl text-white text-sm focus:outline-none focus:border-purple-400" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowNewCouponForm(false)} className="px-4 py-2 bg-slate-600 text-slate-300 rounded-xl text-sm hover:bg-slate-500 transition-colors">İptal</button>
                  <button onClick={handleCreateCoupon} disabled={savingCoupon} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                    {savingCoupon ? 'Kaydediliyor...' : 'Oluştur'}
                  </button>
                </div>
              </div>
            )}

            {/* Coupons List */}
            {couponsLoading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-4xl mb-3">🎟️</p>
                <p>Henüz indirim kodu oluşturulmamış</p>
              </div>
            ) : (
              <div className="space-y-3">
                {coupons.map((c: any) => {
                  const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                  const isActive = c.is_active && !isExpired;
                  return (
                    <div key={c.id} className={`rounded-xl p-4 border ${isActive ? 'bg-slate-700 border-slate-600' : 'bg-slate-800 border-slate-700 opacity-60'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-bold text-base font-mono tracking-wider">{c.code}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-600 text-slate-400'}`}>
                              {isExpired ? '⏰ Süresi Dolmuş' : isActive ? '✅ Aktif' : '❌ Pasif'}
                            </span>
                            {c.brand_name && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[11px]">🏷️ {c.brand_name}</span>}
                          </div>
                          <p className="text-slate-400 text-xs mt-1">{c.description || '-'}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                            <span>💰 {c.discount_type === 'fixed' ? `₺${Number(c.discount_value || 0).toFixed(0)} indirim` : `%${Number(c.discount_value || 0)} indirim`}</span>
                            {c.min_order_amount && <span>🛒 Min ₺{Number(c.min_order_amount).toFixed(0)}</span>}
                            {c.usage_limit && <span>📊 {c.used_count || 0}/{c.usage_limit} kullanım</span>}
                            {c.expires_at && <span>📅 {new Date(c.expires_at).toLocaleDateString('tr-TR')}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleToggleCoupon(c.id, c.is_active)}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${c.is_active ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'}`}
                          >{c.is_active ? 'Pasif Yap' : 'Aktif Yap'}</button>
                          <button onClick={() => handleDeleteCoupon(c.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-colors">🗑️</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

        </div>
      </main>

      {/* ── MUST CHANGE PASSWORD MODAL ── */}
      {mustChangePassword && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md mx-4 border border-amber-500/30 shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-5xl">🔑</span>
              <h2 className="text-xl font-bold text-white mt-3">Şifrenizi Değiştirin</h2>
              <p className="text-slate-400 text-sm mt-2">İlk girişinizde şifrenizi değiştirmeniz gerekmektedir.</p>
            </div>
            {changePasswordError && (
              <div className="mb-4 px-4 py-3 bg-red-500/15 text-red-400 border border-red-500/25 rounded-xl text-sm">
                {changePasswordError}
              </div>
            )}
            <div className="space-y-3">
              <input type="password" placeholder="Yeni Şifre (min 6 karakter)" value={changePasswordValue}
                onChange={e => setChangePasswordValue(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400" />
              <input type="password" placeholder="Şifreyi Tekrar Girin" value={changePasswordConfirm}
                onChange={e => setChangePasswordConfirm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400"
                onKeyDown={e => { if (e.key === 'Enter') handleOwnPasswordChange(); }} />
              <button onClick={handleOwnPasswordChange} disabled={changingPassword}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50">
                {changingPassword ? 'Değiştiriliyor...' : 'Şifremi Değiştir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
