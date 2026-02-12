'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Leaf, Globe, TrendingUp, Heart } from 'lucide-react'

export default function KBeautyInfo() {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    {
      id: 0,
      title: 'K-Beauty Nedir?',
      icon: Leaf,
      content: {
        title: 'K-Beauty Nedir?',
        paragraphs: [
          'K-beauty veya Kore güzelliği, önleyici felsefesiyle cilt bakım endüstrisini değiştiren küresel bir trend haline gelmiştir. Sadece sorunları çözmek yerine, yeşil çay ve pirinç suyu gibi doğal, bilimsel olarak kanıtlanmış içeriklerle uzun vadeli cilt sağlığına odaklanır.',
          'K-beauty, mükemmel nemlendirilmiş, parlak bir cilt olan "cam cilt" hedefini güder. Yenilikçi ve uygun fiyatlı ürünleriyle K-beauty, geleneği ve bilimi dengeleyerek dünya çapında popüler hale gelmiştir.'
        ],
        image: '/images/1.gorsel.webp'
      }
    },
    {
      id: 1,
      title: 'Nasıl Başladı?',
      icon: Globe,
      content: {
        title: 'Nasıl Başladı?',
        paragraphs: [
          'K-Beauty hareketi, Kore\'nin geleneksel cilt bakım rutinlerinden ve doğal içeriklere olan saygısından doğmuştur. 1990\'larda Kore kozmetik şirketleri, bilimsel araştırma ve geleneksel bilgiyi birleştirerek devrim niteliğinde ürünler geliştirmeye başladı.',
          'İnternet ve sosyal medyanın yükselişiyle birlikte, Kore güzellik trendleri dünya çapında yayılmaya başladı. Özellikle 10 adımlı cilt bakım rutini ve "glass skin" kavramı, global güzellik standartlarını değiştirdi.'
        ],
        image: '/images/2.gorsel.webp'
      }
    },
    {
      id: 2,
      title: 'Avantajları',
      icon: TrendingUp,
      content: {
        title: 'Avantajları',
        paragraphs: [
          'K-Beauty\'nin en büyük avantajı, önleyici yaklaşımıdır. Cilt sorunları ortaya çıkmadan önce önlem almayı hedefler. Bu yaklaşım, uzun vadede daha sağlıklı ve genç görünen bir cilt sağlar.',
          'Ayrıca, K-Beauty ürünleri genellikle doğal içerikler kullanır ve hayvan dostu formüllere sahiptir. Yenilikçi teknolojiler ve geleneksel Kore bitkilerinin birleşimi, benzersiz ve etkili ürünler yaratır.'
        ],
        image: '/images/3.gorsel.webp'
      }
    },
    {
      id: 3,
      title: 'Topluluk',
      icon: Heart,
      content: {
        title: 'Topluluk',
        paragraphs: [
          'K-Beauty topluluğu, dünya çapında milyonlarca güzellik tutkununu bir araya getiren güçlü bir ağdır. Sosyal medya platformlarında cilt bakım rutinlerini paylaşan, deneyimlerini aktaran ve birbirlerine destek olan bir topluluk.',
          'Bu topluluk, sadece ürün önerileri değil, aynı zamanda cilt sağlığı hakkında bilgi paylaşımı da yapar. K-Beauty felsefesini benimseyen herkes, bu kapsayıcı ve destekleyici topluluğun bir parçası olabilir.'
        ],
        image: '/images/4.gorsel.webp'
      }
    }
  ]

  const nextTab = () => {
    setActiveTab((prev) => (prev + 1) % tabs.length)
  }

  const prevTab = () => {
    setActiveTab((prev) => (prev - 1 + tabs.length) % tabs.length)
  }

  const currentTab = tabs[activeTab]
  const IconComponent = currentTab.icon

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="cs_fs_48 md:cs_fs_64 font-engram font-bold text-primary mb-4">
            K-Beauty Hakkında
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>

        {/* Tab Navigation - Modern Minimal Design */}
        <div className="flex justify-center mb-20">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full max-w-5xl">
            {tabs.map((tab, index) => {
              const TabIcon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`group relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-500 ${
                    activeTab === index
                      ? 'bg-primary text-white shadow-xl scale-105'
                      : 'bg-gray-50 text-secondary hover:bg-gray-100 hover:shadow-md'
                  }`}
                >
                  <div className={`transition-all duration-300 ${
                    activeTab === index 
                      ? 'text-white' 
                      : 'text-primary group-hover:scale-110'
                  }`}>
                    <TabIcon size={22} strokeWidth={2} />
                  </div>
                  <span className={`cs_fs_16 font-engram font-medium whitespace-nowrap ${
                    activeTab === index ? 'text-white' : 'text-secondary'
                  }`}>
                    {tab.title}
                  </span>
                  {activeTab === index && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-white rounded-full"></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content - Elegant Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-16">
          {/* Left Column - Text Content */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl transition-all duration-500 ${
                activeTab === 0 ? 'bg-green-50 text-green-600' :
                activeTab === 1 ? 'bg-blue-50 text-blue-600' :
                activeTab === 2 ? 'bg-purple-50 text-purple-600' :
                'bg-pink-50 text-pink-600'
              }`}>
                <IconComponent size={32} strokeWidth={2} />
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
            </div>
            
            <h2 className="cs_fs_48 md:cs_fs_56 font-engram font-bold text-primary leading-tight">
              {currentTab.content.title}
            </h2>
            
            <div className="space-y-6 pt-4">
              {currentTab.content.paragraphs.map((paragraph, index) => (
                <p key={index} className="cs_fs_18 md:cs_fs_20 font-engram font-light text-secondary leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Right Column - Image with Elegant Frame */}
          <div className="relative order-1 lg:order-2 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
            <div className="relative cs_radius_20 overflow-hidden shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500">
              <Image
                src={currentTab.content.image}
                alt={currentTab.content.title}
                width={600}
                height={700}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Navigation Controls - Refined Design */}
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={prevTab}
            className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 text-primary hover:bg-primary hover:text-white hover:border-primary rounded-full transition-all duration-300 shadow-sm hover:shadow-lg group"
            aria-label="Önceki"
          >
            <ChevronLeft size={20} className="group-hover:translate-x-[-2px] transition-transform" />
          </button>
          
          <div className="flex space-x-2">
            {tabs.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeTab === index 
                    ? 'bg-primary w-8 shadow-md' 
                    : 'bg-gray-300 hover:bg-primary/50 w-2'
                }`}
                aria-label={`Sekme ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextTab}
            className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 text-primary hover:bg-primary hover:text-white hover:border-primary rounded-full transition-all duration-300 shadow-sm hover:shadow-lg group"
            aria-label="Sonraki"
          >
            <ChevronRight size={20} className="group-hover:translate-x-[2px] transition-transform" />
          </button>
        </div>
      </div>
    </section>
  )
}
