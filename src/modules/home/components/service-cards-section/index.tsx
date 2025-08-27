"use client"

import { useState } from 'react'
import { Select } from '@medusajs/ui'
import Image from 'next/image'
import clsx from 'clsx'

interface Stylist {
  levelName: string
  price: number
  priceType?: 'up' | 'fixed'
  stylistName?: string
  isDefault?: boolean
  cardImage?: {
    url: string
    alt?: string
  }
}

interface Card {
  title: string
  englishTitle: string
  stylists?: Stylist[]
}

interface ServiceCardProps {
  card: Card
  selectedDesigner: string
}

function ServiceCard({ card, selectedDesigner }: ServiceCardProps) {
  if (!card) return null

  const getCardPrice = (card: Card): string => {
    try {
      if (!Array.isArray(card?.stylists) || !card.stylists.length) {
        return "價格請洽詢"
      }
      
      if (selectedDesigner === "all") {
        // 使用標示為預設的設計師價格
        const defaultStylist = card.stylists.find(s => s.isDefault === true)
        if (defaultStylist) {
          const priceText = `NT$ ${defaultStylist.price}`
          return defaultStylist.priceType === 'up' ? `${priceText} 起` : priceText
        }
        // 如果沒有預設設計師，顯示最低價格起
        const minPrice = Math.min(...card.stylists.map(s => s.price))
        return `NT$ ${minPrice} 起`
      }
      
      const stylist = card.stylists.find((s) => s?.stylistName === selectedDesigner)
      if (stylist?.price) {
        const priceText = `NT$ ${stylist.price}`
        return stylist.priceType === 'up' ? `${priceText} 起` : priceText
      }
      return "價格請洽詢"
    } catch (error) {
      console.error('Error calculating card price:', error)
      return "價格請洽詢"
    }
  }

  const getSelectedStylistLevel = (): string | null => {
    try {
      if (!Array.isArray(card?.stylists) || !card.stylists.length) return null
      
      if (selectedDesigner === "all") {
        // 當選擇 "all" 時，使用標示為預設的設計師等級
        const defaultStylist = card.stylists.find(s => s.isDefault === true)
        return defaultStylist?.levelName ?? null
      }
      
      const stylist = card.stylists.find((s) => s?.stylistName === selectedDesigner)
      return stylist?.levelName ?? null
    } catch (error) {
      console.error('Error getting stylist level:', error)
      return null
    }
  }

  const getCardImage = (): { url: string; alt: string } => {
    try {
      // 優先級 1: 如果選擇了特定設計師，使用該設計師的專用圖片
      if (selectedDesigner !== "all" && Array.isArray(card?.stylists) && card.stylists.length) {
        const stylist = card.stylists.find((s) => s?.stylistName === selectedDesigner)
        if (stylist?.cardImage?.url) {
          return {
            url: stylist.cardImage.url,
            alt: stylist.cardImage.alt ?? `${stylist.stylistName} - ${card.title}`
          }
        }
      }
      
      // 優先級 2: 當選擇 "all" 時，使用標示為預設的設計師圖片
      if (Array.isArray(card?.stylists) && card.stylists.length > 0) {
        const defaultStylist = card.stylists.find(s => s.isDefault === true)
        if (defaultStylist?.cardImage?.url) {
          return {
            url: defaultStylist.cardImage.url,
            alt: defaultStylist.cardImage.alt ?? `${defaultStylist.stylistName || '預設設計師'} - ${card.title}`
          }
        }
      }
      
      // 優先級 3: 使用第一位有圖片的設計師（排除通用標籤）
      if (Array.isArray(card?.stylists) && card.stylists.length > 0) {
        const stylistWithImage = card.stylists.find(s => {
          const hasImage = s?.cardImage?.url
          const isNotGeneric = s?.stylistName && 
            !s.stylistName.toLowerCase().includes('all') &&
            !s.stylistName.toLowerCase().includes('指定')
          return hasImage && isNotGeneric
        })
        
        if (stylistWithImage?.cardImage?.url) {
          return {
            url: stylistWithImage.cardImage.url,
            alt: stylistWithImage.cardImage.alt ?? `${stylistWithImage.stylistName} - ${card.title}`
          }
        }
      }
      
      // 優先級 4: 使用任意有圖片的設計師（包含通用）
      if (Array.isArray(card?.stylists) && card.stylists.length > 0) {
        const anyWithImage = card.stylists.find(s => s?.cardImage?.url)
        if (anyWithImage?.cardImage?.url) {
          return {
            url: anyWithImage.cardImage.url,
            alt: anyWithImage.cardImage.alt ?? card.title
          }
        }
      }
      
      // 最後備選：使用預設圖片
      const defaultImageUrl = getDefaultServiceImage(card.title)
      return {
        url: defaultImageUrl,
        alt: card.title
      }
    } catch (error) {
      console.error('Error getting card image:', error)
      const defaultImageUrl = getDefaultServiceImage(card.title)
      return {
        url: defaultImageUrl,
        alt: card.title
      }
    }
  }

  const getDefaultServiceImage = (serviceTitle: string): string => {
    // 根據服務類型返回適合的預設圖片 - 暫時使用透明圖片避免 404 錯誤
    return 'data:image/svg+xml,%3Csvg width="600" height="450" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100%25" height="100%25" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="20" fill="%236b7280" text-anchor="middle" dy=".3em"%3E服務圖片%3C/text%3E%3C/svg%3E'
  }

  const getSelectedStylistName = (): string | null => {
    try {
      if (!Array.isArray(card?.stylists) || !card.stylists.length) return null
      
      if (selectedDesigner === "all") {
        // 當選擇 "all" 時，優先使用標示為預設的設計師名稱
        const defaultStylist = card.stylists.find(s => s.isDefault === true)
        if (defaultStylist?.stylistName) {
          // 排除通用標籤
          const name = defaultStylist.stylistName
          if (!name.toLowerCase().includes('all') && !name.toLowerCase().includes('指定')) {
            return name
          }
        }
        
        // 如果沒有適合的預設設計師，找第一個非通用的設計師
        const specificStylist = card.stylists.find(s => {
          const name = s?.stylistName
          return name && !name.toLowerCase().includes('all') && !name.toLowerCase().includes('指定')
        })
        return specificStylist?.stylistName ?? null
      }
      
      const stylist = card.stylists.find((s) => s?.stylistName === selectedDesigner)
      return stylist?.stylistName ?? null
    } catch (error) {
      console.error('Error getting stylist name:', error)
      return null
    }
  }

  return (
    <div className="group relative bg-white overflow-hidden transition-all duration-700 border border-stone-200/60 hover:border-stone-300/80 hover:-translate-y-2 hover:shadow-xl">
      {/* 服務圖片區域 */}
      {(() => {
        const cardImage = getCardImage()
        return cardImage.url ? (
          <div className="aspect-[4/3] relative overflow-hidden">
            <Image
              src={cardImage.url}
              alt={cardImage.alt}
              fill
              className="object-cover transition-all duration-1000 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {/* 簡約漸層覆蓋層 */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

            {/* 等級標籤 - 簡約設計 */}
            {getSelectedStylistLevel() && (
              <div className="absolute top-3 left-3 md:top-6 md:left-6 transform group-hover:scale-105 transition-transform duration-300">
                <div className="bg-stone-800/90 text-white px-2 py-1 shadow-sm text-[10px] md:text-xs font-medium tracking-widest uppercase inline-block">
                  {getSelectedStylistLevel()}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
            <div className="text-stone-400 text-sm font-medium tracking-wide">
              圖片暫不可用
            </div>
            {/* 簡約裝飾圖案 */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.5"/>
                <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.5"/>
              </svg>
            </div>
          </div>
        )
      })()}

      {/* 卡片內容區域 - Kitsuné 風格 */}
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        {/* 服務標題區域 - 添加價格到右側 */}
        <div className="flex justify-between items-start">
          <div className="space-y-1 md:space-y-2 flex-1">
            <h3 className="text-lg md:text-xl font-light text-stone-900 group-hover:text-stone-700 transition-colors duration-300 leading-tight tracking-wide">
              {card.title}
            </h3>
            {card.englishTitle && (
              <p className="text-[10px] md:text-xs text-stone-500 font-light tracking-[0.2em] uppercase">
                {card.englishTitle}
              </p>
            )}
          </div>
          {/* 價格區域 - 右側對齊 */}
          <div className="ml-2 md:ml-4 text-right">
            <span className="text-sm md:text-lg font-medium text-stone-800 tracking-wide">
              {getCardPrice(card)}
            </span>
          </div>
        </div>

        {/* 設計師資訊 - 簡約設計，始終顯示 */}
        <div className="space-y-2 md:space-y-4 p-3 md:p-5 bg-stone-50/50 border border-stone-100/50">
          <div className="flex items-center space-x-2 md:space-x-3">
            <svg className="w-3 h-3 md:w-4 md:h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs md:text-sm font-medium text-stone-700 tracking-wide">
              {getSelectedStylistName() || "所有設計師"}
            </span>
          </div>
        </div>
      </div>

      {/* 底部微光效果 - 更簡約 */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
    </div>
  )
}

interface ServiceCardsSectionProps {
  heading?: string
  cardsPerRow?: number
  cards?: Card[]
}

export default function ServiceCardsSection({
  heading,
  cardsPerRow = 4,
  cards = [],
}: ServiceCardsSectionProps) {
  const [selectedDesigner, setSelectedDesigner] = useState<string>("all")

  // 資料驗證
  const validCards = cards?.filter(card => 
    card && 
    typeof card === 'object' && 
    'title' in card &&
    'englishTitle' in card
  ) ?? []

  // 從有效卡片中提取設計師資訊，過濾掉通用標籤
  const allStylists = Array.from(new Set(
    validCards.flatMap(card => 
      Array.isArray(card?.stylists) 
        ? card.stylists
            .filter((s): s is Stylist => s !== null && s !== undefined && typeof s.stylistName === 'string')
            .map(s => s.stylistName!)
            .filter(name => {
              const lowercaseName = name.toLowerCase()
              // 過濾掉通用設計師標籤（包含更多變體）
              return !lowercaseName.includes('all stylists') && 
                     !lowercaseName.includes('all stylist') && 
                     !lowercaseName.includes('指定') &&
                     lowercaseName !== 'all' &&
                     name.trim().length > 0
            })
        : []
    )
  )).sort()

  if (!validCards.length) {
    return null
  }

  return (
    <section className={heading ? "py-8 md:py-12 bg-stone-50/30" : "py-0 bg-stone-50/30"}>
      <div className="max-w-[1440px] mx-auto w-full">
        {heading && (
          <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-light text-stone-900 mb-4 tracking-wide">{heading}</h1>
          </div>
        )}
        
        {allStylists.length > 0 && (
          <div className="mb-16">
            <div className="w-full max-w-[280px] mx-auto">
              <Select 
                value={selectedDesigner}
                onValueChange={setSelectedDesigner}
              >
                <Select.Trigger className="bg-white border-stone-200 hover:border-stone-300 py-3 px-6 text-stone-700 font-light tracking-wide">
                  <Select.Value placeholder="所有設計師" />
                </Select.Trigger>
                <Select.Content className="bg-white border-stone-200 shadow-lg">
                  <Select.Item value="all" className="font-light tracking-wide text-stone-700 hover:bg-stone-50">所有設計師</Select.Item>
                  {allStylists.map((designer) => (
                    <Select.Item 
                      key={designer} 
                      value={designer}
                      className="font-light tracking-wide text-stone-700 hover:bg-stone-50"
                    >
                      {designer}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>
        )}

        <div className={clsx(
          "grid grid-cols-2 gap-0 w-full",
          cardsPerRow === 3 && "lg:grid-cols-3",
          cardsPerRow === 4 && "lg:grid-cols-4"
        )}>
          {validCards.map((card, idx) => (
            <div key={`${selectedDesigner}-${idx}`} className="w-full">
              <ServiceCard 
                card={card}
                selectedDesigner={selectedDesigner}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
