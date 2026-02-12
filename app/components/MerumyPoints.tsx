'use client'

import { useState } from 'react'
import { Gift, X, ChevronUp } from 'lucide-react'

export default function MerumyPoints() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const discounts = [
    {
      id: 1,
      title: "%5 İndirim",
      description: "1.000 puan için %5 indirim",
      points: 1000,
      icon: "%"
    },
    {
      id: 2,
      title: "%10 İndirim", 
      description: "2.500 puan için %10 indirim",
      points: 2500,
      icon: "%"
    },
    {
      id: 3,
      title: "%15 İndirim",
      description: "5.000 puan için %15 indirim", 
      points: 5000,
      icon: "%"
    },
    {
      id: 4,
      title: "%20 İndirim",
      description: "10.000 puan için %20 indirim",
      points: 10000,
      icon: "%"
    },
    {
      id: 5,
      title: "Ücretsiz Kargo",
      description: "1000 puan için ücretsiz kargo",
      points: 1000,
      icon: "🚚"
    },
    {
      id: 6,
      title: "Hediye Ürün",
      description: "3.000 puan için hediye ürün",
      points: 3000,
      icon: "🎁"
    }
  ]

  return (
    <>
      {/* Floating Button */}
      <div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-accent text-white px-4 py-3 rounded-xl shadow-lg hover:bg-accent/90 transition-all duration-300 flex items-center space-x-2 group hover:shadow-xl"
        >
          <Gift size={18} />
          <span className="font-sf-pro font-medium text-sm whitespace-nowrap">MERUMY Puan</span>
        </button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-sf-pro font-bold text-primary">Hoş Geldiniz</h2>
                <p className="text-sm text-gray-500 font-sf-pro">MERUMY Sadakat Programı</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Membership Card */}
            <div className="p-6">
              <div className="bg-gradient-to-br from-primary to-gray-800 text-white p-6 rounded-xl mb-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4">
                    <Gift size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-sf-pro font-bold">Premium Üyelik</h3>
                    <p className="text-gray-300 text-sm">MERUMY Sadakat Programı</p>
                  </div>
                </div>
                <p className="text-gray-200 mb-6 leading-relaxed">Özel indirimler, erken erişim ve kişiselleştirilmiş önerilerle K-Beauty deneyiminizi zenginleştirin.</p>
                <button className="w-full bg-accent text-white py-3 rounded-lg font-sf-pro font-semibold hover:bg-accent/90 transition-all duration-300 hover:shadow-lg">
                  Üye Ol ve Puan Kazanmaya Başla
                </button>
                <p className="text-center text-gray-300 text-sm mt-4">
                  Zaten üye misiniz? <span className="text-accent underline cursor-pointer hover:text-accent/80 transition-colors">Giriş Yapın</span>
                </p>
              </div>

              {/* Discounts Section */}
              <div className="bg-gradient-to-r from-accent-light to-gray-50 rounded-xl border border-gray-100">
                <div 
                  className="flex justify-between items-center p-5 cursor-pointer hover:bg-white/50 transition-colors rounded-t-xl"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  <div>
                    <h4 className="font-sf-pro font-bold text-primary text-lg">Özel İndirimler</h4>
                    <p className="text-sm text-gray-600 font-sf-pro">{discounts.length} farklı indirim seçeneği</p>
                  </div>
                  <ChevronUp 
                    size={20} 
                    className={`text-gray-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                  />
                </div>

                {!isCollapsed && (
                  <div className="px-5 pb-5 space-y-4">
                    {discounts.map((discount) => (
                      <div key={discount.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center shadow-sm">
                              <span className="text-white font-bold text-lg">
                                {discount.icon}
                              </span>
                            </div>
                            <div>
                              <h5 className="font-sf-pro font-bold text-primary text-lg">
                                {discount.title}
                              </h5>
                              <p className="text-sm text-gray-600 font-sf-pro">
                                {discount.description}
                              </p>
                            </div>
                          </div>
                          <button className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-sf-pro font-semibold hover:bg-accent/90 transition-all duration-300 hover:shadow-lg">
                            Kullan
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Social Media Points */}
              <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                <h4 className="font-sf-pro font-bold text-primary mb-4 text-lg">Puan Kazanma Yolları</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold">f</span>
                      </div>
                      <span className="font-sf-pro text-sm font-medium text-gray-700">Facebook'u Takip Et</span>
                    </div>
                    <span className="text-accent font-sf-pro font-bold text-lg">+50</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold">@</span>
                      </div>
                      <span className="font-sf-pro text-sm font-medium text-gray-700">Instagram'ı Takip Et</span>
                    </div>
                    <span className="text-accent font-sf-pro font-bold text-lg">+50</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold">🛒</span>
                      </div>
                      <span className="font-sf-pro text-sm font-medium text-gray-700">İlk Alışveriş</span>
                    </div>
                    <span className="text-accent font-sf-pro font-bold text-lg">+100</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-accent-strong rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold">★</span>
                      </div>
                      <span className="font-sf-pro text-sm font-medium text-gray-700">Ürün Değerlendirmesi</span>
                    </div>
                    <span className="text-accent font-sf-pro font-bold text-lg">+25</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
