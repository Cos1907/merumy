'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface TrackedOrder {
  orderId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  itemCount: number;
  total: number;
  status: string;
  createdAt: string;
  shippingCity?: string;
}

const ORDER_STATUSES: { [key: string]: { label: string; color: string; bgColor: string; icon: string; step: number; description: string } } = {
  pending: { 
    label: 'Beklemede', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100',
    icon: '⏳', 
    step: 1,
    description: 'Siparişiniz alındı ve onay bekliyor.'
  },
  processing: { 
    label: 'İşleniyor', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100',
    icon: '🔄', 
    step: 2,
    description: 'Siparişiniz işleme alındı.'
  },
  confirmed: { 
    label: 'Onaylandı', 
    color: 'text-cyan-600', 
    bgColor: 'bg-cyan-100',
    icon: '✓', 
    step: 2,
    description: 'Siparişiniz onaylandı.'
  },
  preparing: { 
    label: 'Hazırlanıyor', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-100',
    icon: '📦', 
    step: 3,
    description: 'Siparişiniz hazırlanıyor.'
  },
  shipped: { 
    label: 'Kargoya Verildi', 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-100',
    icon: '🚚', 
    step: 4,
    description: 'Siparişiniz kargoya verildi ve yola çıktı!'
  },
  delivered: { 
    label: 'Teslim Edildi', 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    icon: '✅', 
    step: 5,
    description: 'Siparişiniz başarıyla teslim edildi.'
  },
  cancelled: { 
    label: 'İptal Edildi', 
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    icon: '❌', 
    step: 0,
    description: 'Bu sipariş iptal edilmiştir.'
  },
};

const TRACKING_STEPS = [
  { key: 'pending', label: 'Sipariş Alındı', icon: '📋' },
  { key: 'processing', label: 'İşleniyor', icon: '🔄' },
  { key: 'preparing', label: 'Hazırlanıyor', icon: '📦' },
  { key: 'shipped', label: 'Kargoda', icon: '🚚' },
  { key: 'delivered', label: 'Teslim Edildi', icon: '✅' },
];

export default function SiparisTakipPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email && !phone) {
      setError('E-posta veya telefon numarasından en az birini girin');
      return;
    }
    
    setLoading(true);
    setError('');
    setOrders([]);
    setSearched(false);

    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email || undefined, 
          phone: phone || undefined 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders || []);
        setSearched(true);
      } else {
        setError(data.error || 'Sipariş bulunamadı');
        setSearched(true);
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price) + ' TL';
  };

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES[status] || ORDER_STATUSES.pending;
  };

  const getStepProgress = (status: string) => {
    const statusInfo = getStatusInfo(status);
    return statusInfo.step;
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-[120px] pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#92D0AA]/20 rounded-full mb-4">
              <span className="text-3xl">🚚</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sipariş Takip</h1>
            <p className="text-gray-600">
              E-posta adresiniz veya telefon numaranız ile siparişlerinizi takip edin
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#92D0AA] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="5XX XXX XX XX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#92D0AA] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Her iki alanı da doldurabilirsiniz veya sadece birini girerek arama yapabilirsiniz.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#92D0AA] text-white py-4 rounded-xl font-semibold hover:bg-[#7BC49A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sorgulanıyor...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Sipariş Sorgula
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          {searched && (
            <div className="space-y-6">
              {orders.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Siparişleriniz ({orders.length})
                    </h2>
                    <button
                      onClick={() => {
                        setSearched(false);
                        setOrders([]);
                        setEmail('');
                        setPhone('');
                      }}
                      className="text-[#92D0AA] hover:text-[#7BC49A] font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Yeni Sorgu
                    </button>
                  </div>

                  {orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const currentStep = getStepProgress(order.status);

                    return (
                      <div key={order.orderId} className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
                        {/* Order Header */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                          <div>
                            <p className="font-mono text-sm text-gray-500">
                              Sipariş No: <span className="font-semibold text-gray-900">#{order.orderId?.slice(-8).toUpperCase()}</span>
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              {formatDate(order.createdAt)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {order.customerName}
                            </p>
                          </div>
                          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color} ${statusInfo.bgColor}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>

                        {/* Status Description */}
                        <div className={`p-4 rounded-xl ${statusInfo.bgColor} border border-current/10`}>
                          <p className={`text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.description}
                          </p>
                        </div>

                        {/* Progress Tracker */}
                        {order.status !== 'cancelled' && (
                          <div className="py-6">
                            <div className="flex justify-between relative">
                              {/* Progress Line */}
                              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
                              <div 
                                className="absolute top-5 left-0 h-1 bg-[#92D0AA] rounded-full transition-all duration-500"
                                style={{ width: `${(currentStep / 5) * 100}%` }}
                              />

                              {TRACKING_STEPS.map((step, stepIndex) => {
                                const isCompleted = currentStep > stepIndex;
                                const isCurrent = currentStep === stepIndex + 1;
                                
                                return (
                                  <div key={step.key} className="flex flex-col items-center relative z-10">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                                        isCompleted || isCurrent
                                          ? 'bg-[#92D0AA] text-white'
                                          : 'bg-gray-200 text-gray-400'
                                      } ${isCurrent ? 'ring-4 ring-[#92D0AA]/30 scale-110' : ''}`}
                                    >
                                      {step.icon}
                                    </div>
                                    <span className={`text-xs mt-2 text-center max-w-[70px] leading-tight ${
                                      isCompleted || isCurrent ? 'text-gray-700 font-medium' : 'text-gray-400'
                                    }`}>
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {order.status === 'cancelled' && (
                          <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                            <p className="text-red-600 font-medium">❌ Bu sipariş iptal edilmiştir</p>
                            <p className="text-red-500 text-xs mt-1">Detaylı bilgi için bizimle iletişime geçebilirsiniz.</p>
                          </div>
                        )}

                        {/* Order Items */}
                        <div className="border-t border-gray-100 pt-5">
                          <p className="text-sm font-semibold text-gray-700 mb-3">
                            Sipariş Detayı ({order.itemCount} ürün)
                          </p>
                          <div className="space-y-2 bg-gray-50 rounded-xl p-4">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {item.name} {item.quantity > 1 && <span className="text-gray-400">(x{item.quantity})</span>}
                                </span>
                                <span className="text-gray-700 font-medium">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                            <span className="font-semibold text-gray-700">Toplam</span>
                            <span className="font-bold text-lg text-[#636363]">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📭</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sipariş Bulunamadı</h3>
                  <p className="text-gray-600 mb-4">
                    Girdiğiniz bilgilerle eşleşen sipariş bulunamadı. 
                    Lütfen bilgilerinizi kontrol edip tekrar deneyin.
                  </p>
                  <button
                    onClick={() => {
                      setSearched(false);
                      setError('');
                    }}
                    className="text-[#92D0AA] hover:text-[#7BC49A] font-medium"
                  >
                    Tekrar Ara
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Help Section */}
          {!searched && (
            <div className="bg-[#92D0AA]/10 rounded-2xl p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Yardıma mı ihtiyacınız var?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Siparişinizle ilgili sorularınız için bize ulaşabilirsiniz.
              </p>
              <a 
                href="mailto:siparis@merumy.com.tr?subject=Sipariş Hakkında" 
                className="inline-flex items-center gap-2 text-[#92D0AA] hover:text-[#7BC49A] font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                İletişime Geç
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

