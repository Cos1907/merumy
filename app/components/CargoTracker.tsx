'use client';

import { useState } from 'react';

interface TrackedOrder {
  orderId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number }>;
  itemCount: number;
  total: number;
  status: string;
  createdAt: string;
}

const ORDER_STATUSES: { [key: string]: { label: string; color: string; icon: string; step: number } } = {
  pending: { label: 'Beklemede', color: 'bg-yellow-500', icon: '⏳', step: 1 },
  processing: { label: 'İşleniyor', color: 'bg-blue-500', icon: '🔄', step: 2 },
  confirmed: { label: 'Onaylandı', color: 'bg-cyan-500', icon: '✓', step: 2 },
  preparing: { label: 'Hazırlanıyor', color: 'bg-purple-500', icon: '📦', step: 3 },
  shipped: { label: 'Kargoya Verildi', color: 'bg-indigo-500', icon: '🚚', step: 4 },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-500', icon: '✅', step: 5 },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-500', icon: '❌', step: 0 },
};

const TRACKING_STEPS = [
  { key: 'pending', label: 'Sipariş Alındı', icon: '📋' },
  { key: 'processing', label: 'İşleniyor', icon: '🔄' },
  { key: 'preparing', label: 'Hazırlanıyor', icon: '📦' },
  { key: 'shipped', label: 'Kargoda', icon: '🚚' },
  { key: 'delivered', label: 'Teslim Edildi', icon: '✅' },
];

export default function CargoTracker() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrders([]);

    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders);
        setShowResults(true);
      } else {
        setError(data.error || 'Sipariş bulunamadı');
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
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES[status] || ORDER_STATUSES.pending;
  };

  const getStepProgress = (status: string) => {
    const statusInfo = getStatusInfo(status);
    return statusInfo.step;
  };

  const resetForm = () => {
    setShowResults(false);
    setOrders([]);
    setError('');
  };

  return (
    <>
      {/* Footer'daki Kargo Takip Butonu */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-white hover:text-[#EEE695] transition-colors group font-grift font-light text-[10px] md:text-sm leading-tight"
      >
        <span className="text-base md:text-lg">🚚</span>
        <span>Kargo Takip</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#92D0AA]/20 rounded-full flex items-center justify-center text-xl">
                  🚚
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Kargo Takip</h2>
                  <p className="text-sm text-gray-500">Siparişinizi takip edin</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {!showResults ? (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-gray-600 text-sm mb-4">
                    Siparişinizi takip etmek için sipariş verirken kullandığınız e-posta ve telefon numarasını girin.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta Adresi
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#92D0AA] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon Numarası
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="5XX XXX XX XX"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#92D0AA] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#92D0AA] text-white py-3 rounded-xl font-medium hover:bg-[#7BC49A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              ) : (
                /* Results */
                <div className="space-y-6">
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 text-[#92D0AA] hover:text-[#7BC49A] transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Yeni Sorgu
                  </button>

                  <p className="text-sm text-gray-500">
                    {orders.length} sipariş bulundu
                  </p>

                  {orders.map((order, index) => {
                    const statusInfo = getStatusInfo(order.status);
                    const currentStep = getStepProgress(order.status);

                    return (
                      <div key={order.orderId} className="bg-gray-50 rounded-2xl p-5 space-y-4">
                        {/* Order Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-mono text-sm text-gray-500">
                              Sipariş No: #{order.orderId?.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>

                        {/* Progress Tracker */}
                        {order.status !== 'cancelled' && (
                          <div className="py-4">
                            <div className="flex justify-between relative">
                              {/* Progress Line */}
                              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full" />
                              <div 
                                className="absolute top-4 left-0 h-1 bg-[#92D0AA] rounded-full transition-all duration-500"
                                style={{ width: `${(currentStep / 5) * 100}%` }}
                              />

                              {TRACKING_STEPS.map((step, stepIndex) => {
                                const isCompleted = currentStep > stepIndex;
                                const isCurrent = currentStep === stepIndex + 1;
                                
                                return (
                                  <div key={step.key} className="flex flex-col items-center relative z-10">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                                        isCompleted || isCurrent
                                          ? 'bg-[#92D0AA] text-white'
                                          : 'bg-gray-200 text-gray-400'
                                      } ${isCurrent ? 'ring-4 ring-[#92D0AA]/30 scale-110' : ''}`}
                                    >
                                      {step.icon}
                                    </div>
                                    <span className={`text-[10px] mt-2 text-center max-w-[60px] leading-tight ${
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
                          <div className="bg-red-50 rounded-xl p-4 text-center">
                            <p className="text-red-600 font-medium">❌ Bu sipariş iptal edilmiştir</p>
                          </div>
                        )}

                        {/* Order Items */}
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Sipariş Detayı ({order.itemCount} ürün)
                          </p>
                          <div className="space-y-1">
                            {order.items.slice(0, 3).map((item, i) => (
                              <p key={i} className="text-sm text-gray-600">
                                • {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                              </p>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-sm text-gray-400">
                                +{order.items.length - 3} ürün daha
                              </p>
                            )}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                            <span className="font-medium text-gray-700">Toplam</span>
                            <span className="font-bold text-[#636363]">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

