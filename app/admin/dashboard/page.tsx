'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { products as allProducts } from '../../lib/products';

// Types
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
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
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users' | 'reports'>('orders');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStats, setOrderStats] = useState<any>(null);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  
  // Bulk selection state
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkTrackingNumber, setBulkTrackingNumber] = useState('');
  const [bulkSendEmail, setBulkSendEmail] = useState(true);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  
  // Products state - from JSON
  const [productSearch, setProductSearch] = useState('');
  const [productBrandFilter, setProductBrandFilter] = useState('');
  const [productPage, setProductPage] = useState(1);
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  
  // Reports state
  const [productSalesReport, setProductSalesReport] = useState<ProductSale[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSearch, setReportSearch] = useState('');
  const [reportPage, setReportPage] = useState(1);
  
  // Updating state
  const [updating, setUpdating] = useState(false);

  // Products from JSON (filtered)
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];
    if (productSearch) {
      const search = productSearch.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search) ||
        p.barcode?.toLowerCase().includes(search)
      );
    }
    if (productBrandFilter) {
      list = list.filter(p => p.brand === productBrandFilter);
    }
    return list;
  }, [productSearch, productBrandFilter]);

  const productBrands = useMemo(() => {
    return Array.from(new Set(allProducts.map(p => p.brand))).filter(Boolean).sort();
  }, []);

  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, productPage]);

  const productTotalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'reports') fetchAllOrdersForReport();
  }, [activeTab, orderPage, orderStatusFilter, userPage]);

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
        setLoading(false);
        fetchOrders();
      }
    } catch {
      router.push('/admin/login');
    }
  };

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (orderSearch) params.append('search', orderSearch);
      if (orderStatusFilter !== 'all') params.append('status', orderStatusFilter);
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

  const fetchAllOrdersForReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetch('/api/admin/orders?limit=10000');
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
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += item.price * item.quantity;
          existing.orderCount += 1;
        } else {
          productMap.set(key, {
            productName: item.name,
            totalQuantity: item.quantity,
            totalRevenue: item.price * item.quantity,
            orderCount: 1
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
    <h3>Ürünler</h3><table><thead><tr><th>Ürün</th><th>Adet</th><th>Fiyat</th><th>Toplam</th></tr></thead>
    <tbody>${order.items?.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${formatPrice(i.price)}</td><td>${formatPrice(i.price * i.quantity)}</td></tr>`).join('') || ''}</tbody></table>
    <p class="total">Genel Toplam: ${formatPrice(order.total)}</p>
    <script>window.print()</script></body></html>`);
    w.document.close();
  };

  // Export functions
  const exportToCSV = () => {
    const BOM = '\uFEFF';
    const headers = ['Sıra', 'Ürün Adı', 'Satış Adedi', 'Toplam Gelir', 'Sipariş Sayısı'];
    const filteredReport = productSalesReport.filter(p => !reportSearch || p.productName.toLowerCase().includes(reportSearch.toLowerCase()));
    const rows = filteredReport.map((p, i) => [i + 1, `"${p.productName.replace(/"/g, '""')}"`, p.totalQuantity, p.totalRevenue.toFixed(2), p.orderCount].join(','));
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
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            {sidebarOpen && <span className="text-white font-semibold text-lg">Merumy</span>}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'orders', icon: '📦', label: 'Siparişler', count: orderStats?.total },
            { id: 'products', icon: '🛍️', label: 'Ürünler', count: allProducts.length },
            { id: 'users', icon: '👥', label: 'Kullanıcılar' },
            { id: 'reports', icon: '📊', label: 'Satış Raporu' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs">{item.count}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="font-medium">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-white">
                {activeTab === 'orders' && '📦 Siparişler'}
                {activeTab === 'products' && '🛍️ Ürünler'}
                {activeTab === 'users' && '👥 Kullanıcılar'}
                {activeTab === 'reports' && '📊 Satış Raporu'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://merumy.com" target="_blank" className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
                🌐 Siteyi Görüntüle
              </a>
            </div>
          </div>
        </header>

        <div className="p-6">
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
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
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
                              <button onClick={() => setSelectedOrder(order)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
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

          {/* PRODUCTS TAB - FROM JSON */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <p className="text-3xl font-bold text-white">{allProducts.length}</p>
                  <p className="text-slate-400 text-sm">Toplam Ürün</p>
                </div>
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <p className="text-3xl font-bold text-emerald-400">{allProducts.filter(p => p.inStock).length}</p>
                  <p className="text-slate-400 text-sm">Stokta</p>
                </div>
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <p className="text-3xl font-bold text-red-400">{allProducts.filter(p => !p.inStock).length}</p>
                  <p className="text-slate-400 text-sm">Stok Dışı</p>
                </div>
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                  <p className="text-3xl font-bold text-purple-400">{productBrands.length}</p>
                  <p className="text-slate-400 text-sm">Marka</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Ürün adı, marka veya barkod ara..."
                      value={productSearch}
                      onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                      className="w-full px-4 py-3 pl-11 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                    />
                    <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <select
                    value={productBrandFilter}
                    onChange={(e) => { setProductBrandFilter(e.target.value); setProductPage(1); }}
                    className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Tüm Markalar</option>
                    {productBrands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedProducts.map(product => (
                  <div key={product.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:border-emerald-500/50 transition-colors">
                    <div className="aspect-square bg-slate-700 relative">
                      <img
                        src={product.image || '/gorselsizurun.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/gorselsizurun.jpg'; }}
                      />
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">Stok Dışı</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-emerald-400 text-xs font-medium mb-1">{product.brand}</p>
                      <h3 className="text-white font-medium line-clamp-2 mb-2 min-h-[48px]">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold">{formatPrice(product.price)}</p>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-slate-500 text-sm line-through">{formatPrice(product.originalPrice)}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.inStock ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {product.inStock ? 'Stokta' : 'Tükendi'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-2">Barkod: {product.barcode}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {productTotalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button disabled={productPage === 1} onClick={() => setProductPage(p => p - 1)} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl">Önceki</button>
                  <span className="text-slate-400">Sayfa {productPage} / {productTotalPages}</span>
                  <button disabled={productPage === productTotalPages} onClick={() => setProductPage(p => p + 1)} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl">Sonraki</button>
                </div>
              )}
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <div className="flex gap-4">
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
                  <button onClick={() => fetchUsers()} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium">Ara</button>
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
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
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
              </div>

              {/* Report Table */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">#</th>
                        <th className="text-left py-4 px-6 text-slate-400 font-medium text-sm">Ürün Adı</th>
                        <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">Satış</th>
                        <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">Gelir</th>
                        <th className="text-right py-4 px-6 text-slate-400 font-medium text-sm">Sipariş</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {paginatedReport.map((p, i) => {
                        const rank = (reportPage - 1) * ITEMS_PER_PAGE + i + 1;
                        return (
                          <tr key={i} className="hover:bg-slate-700/30">
                            <td className="py-4 px-6">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                rank === 1 ? 'bg-yellow-500 text-black' :
                                rank === 2 ? 'bg-slate-400 text-black' :
                                rank === 3 ? 'bg-orange-500 text-black' :
                                'bg-slate-700 text-white'
                              }`}>{rank}</span>
                            </td>
                            <td className="py-4 px-6 text-white max-w-md">{p.productName}</td>
                            <td className="py-4 px-6 text-right">
                              <span className="text-emerald-400 font-bold text-lg">{p.totalQuantity}</span>
                              <span className="text-slate-500 text-sm ml-1">adet</span>
                            </td>
                            <td className="py-4 px-6 text-right text-white font-semibold">{formatPrice(p.totalRevenue)}</td>
                            <td className="py-4 px-6 text-right text-slate-400">{p.orderCount}</td>
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
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-700/50 rounded-xl p-4">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-slate-400 text-sm">x{item.quantity}</p>
                      </div>
                      <p className="text-emerald-400 font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
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
    </div>
  );
}
