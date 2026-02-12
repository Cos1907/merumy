'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Merhaba! Ben MERUMY AI Asistanınız. Kore güzellik ürünleri konusunda size yardımcı olmaya hazırım! Cilt tipiniz nedir?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const aiResponses = [
    {
      keywords: ['kuru', 'dry'],
      response: 'Kuru cilt için MERUMY\'nin özel nemlendirme serisi mükemmel! Hyaluronic acid içeren ürünlerimiz cildinizi 24 saat nemli tutar. MERUMY\'nin kuru cilt bakım setini deneyin - müşterilerimiz %98 memnuniyet oranı bildiriyor! 🌟'
    },
    {
      keywords: ['yağlı', 'oily'],
      response: 'Yağlı cilt için MERUMY\'nin dengeleyici serisi harika! Salicylic acid içeren temizleyicilerimiz gözenekleri derinlemesine temizler. MERUMY\'nin yağlı cilt bakım rutini ile parlamayı kontrol altına alın! ✨'
    },
    {
      keywords: ['karma', 'combination'],
      response: 'Karma cilt için MERUMY\'nin çok amaçlı ürünleri ideal! T-zone\'u dengeleyen, yanakları nemlendiren formüllerimiz var. MERUMY\'nin karma cilt seti ile mükemmel dengeyi yakalayın! 💫'
    },
    {
      keywords: ['normal', 'normal'],
      response: 'Normal cilt için MERUMY\'nin koruyucu serisi harika! Anti-aging özellikli ürünlerimiz cildinizi genç tutar. MERUMY\'nin normal cilt bakım koleksiyonu ile sağlıklı görünümü koruyun! 🌸'
    },
    {
      keywords: ['hassas', 'sensitive'],
      response: 'Hassas cilt için MERUMY\'nin yumuşak formülleri mükemmel! Paraben ve SLS içermeyen ürünlerimiz cildinizi tahriş etmez. MERUMY\'nin hassas cilt serisi ile güvenle bakım yapın! 🕊️'
    },
    {
      keywords: ['merumy', 'marka'],
      response: 'MERUMY, Kore\'nin en seçkin güzellik markalarını Türkiye\'ye getiren güvenilir adres! Orijinal ürünler, uzman danışmanlık ve müşteri memnuniyeti odaklı hizmet anlayışımızla K-Beauty dünyasında fark yaratıyoruz. 🌟'
    },
    {
      keywords: ['fiyat', 'ucuz', 'pahalı'],
      response: 'MERUMY\'de kalite-fiyat dengesi mükemmel! Orijinal Kore ürünlerini en uygun fiyatlarla sunuyoruz. Sadakat programımızla puan kazanın, özel indirimlerden yararlanın! 💰'
    },
    {
      keywords: ['kargo', 'teslimat'],
      response: 'MERUMY\'de hızlı ve güvenli teslimat! İstanbul içi 24 saat, Türkiye geneli 2-3 iş günü. 1000 TL ve üzeri alışverişlerde ücretsiz kargo! 🚚'
    },
    {
      keywords: ['orijinal', 'sahte'],
      response: 'MERUMY\'de %100 orijinal ürün garantisi! Kore\'deki partner markalarımızdan doğrudan temin ediyoruz. Her ürünün sertifikasını sunuyoruz - güvenle alışveriş yapın! ✅'
    }
  ]

  const getDefaultResponse = () => {
    const responses = [
      'MERUMY\'nin geniş ürün yelpazesinde kesinlikle aradığınızı bulacaksınız! Cilt tipinize uygun öneriler için mağazalarımızı ziyaret edin. 🌟',
      'MERUMY uzman ekibimiz size kişisel önerilerde bulunmaya hazır! K-Beauty dünyasında en iyi deneyimi yaşayın. ✨',
      'MERUMY\'de her cilt tipi için özel çözümler var! Orijinal Kore ürünleriyle cildinizi dönüştürün. 💫',
      'MERUMY müşterilerimiz %98 memnuniyet oranı bildiriyor! Siz de bu mutlu ailenin parçası olun. 🌸'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const getAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase()
    
    for (const response of aiResponses) {
      if (response.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return response.response
      }
    }
    
    return getDefaultResponse()
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getAIResponse(inputMessage),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-accent text-white w-14 h-14 rounded-full shadow-lg hover:bg-accent/90 transition-all duration-300 flex items-center justify-center group hover:scale-105 relative"
        >
          <MessageCircle size={24} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </button>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-4">
          <div className="bg-white rounded-2xl w-full max-w-md h-[500px] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-accent text-white rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-sf-pro font-bold">MERUMY AI Asistanı</h3>
                  <p className="text-sm opacity-90">Çevrimiçi</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="font-sf-pro text-sm leading-relaxed">
                      {message.content}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-accent font-sf-pro text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-accent text-white p-2 rounded-full hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
