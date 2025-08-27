import { Suspense } from "react"
import Image from "next/image"

import { listRegions } from "@lib/data/regions"
import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
// @ts-ignore - Medusa 型別過於複雜
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import AccountButton from "@modules/layout/components/account-button"
import CountrySelect from "@modules/layout/components/country-select"
import { getHeader } from "@lib/sanity"
import MobileMenu from "../../components/mobile-menu"
import SearchBarClient from "../../components/search-bar-client"

// 簡化的型別定義，避免複雜的 union 型別
type SimpleHeader = {
  marquee?: {
    enabled?: boolean
    text1?: { enabled?: boolean; content?: string }
    text2?: { enabled?: boolean; content?: string }
    text3?: { enabled?: boolean; content?: string }
    pauseOnHover?: boolean
  }
  navigation?: Array<{ name: string; href: string }>
  storeName?: string
  logoWidth?: number
} | null

export default async function Nav() {
  // @ts-ignore - 忽略 Medusa 複雜型別推斷
  const regions = await listRegions().then((regions: any) => regions)
  // @ts-ignore - 忽略 Medusa 複雜型別推斷
  const collections = await listCollections().then((res: any) => res.collections)
  // @ts-ignore - 忽略 Medusa 複雜型別推斷
  const categories = await listCategories()
  
  // 使用簡化型別，避免 TypeScript 複雜推斷
  const headerData: SimpleHeader = await getHeader()

  // 從 Sanity 獲取跑馬燈資料
  const enabledTexts = headerData?.marquee?.enabled 
    ? [
        ...(headerData.marquee.text1?.enabled && headerData.marquee.text1?.content?.trim() 
            ? [{content: headerData.marquee.text1.content}] : []),
        ...(headerData.marquee.text2?.enabled && headerData.marquee.text2?.content?.trim() 
            ? [{content: headerData.marquee.text2.content}] : []),
        ...(headerData.marquee.text3?.enabled && headerData.marquee.text3?.content?.trim() 
            ? [{content: headerData.marquee.text3.content}] : [])
      ]
    : []

  const marqueeTexts = enabledTexts.map(item => String(item.content)).filter(text => text.trim())
  const textCount = marqueeTexts.length

  const textDisplayTime = 3
  const calculateAnimationDuration = (count: number) => {
    if (count === 1) return textDisplayTime * 2
    return count * textDisplayTime
  }
  
  const animationDuration = calculateAnimationDuration(textCount)
  const pauseOnHover = headerData?.marquee?.pauseOnHover !== false

  const getMarqueeClass = (count: number) => {
    if (count === 0) return ''
    if (count === 1) return 'animate-marquee-1'
    if (count === 2) return 'animate-marquee-2'
    return 'animate-marquee-3'
  }

  return (
    <>
      {/* 整合的導航容器：跑馬燈 + 主選單 */}
      <div className="sticky top-0 inset-x-0 z-[100] group transition-all duration-300">
        {/* 1. 跑馬燈部分 */}
        {headerData?.marquee?.enabled && textCount > 0 && (
          <div className="bg-gray-900 text-white overflow-hidden h-9">
            <div className="relative h-full">
              <div 
                className={`absolute inset-x-0 flex flex-col ${getMarqueeClass(textCount)} ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}
                style={{ 
                  animationDuration: `${animationDuration}s`,
                  animationIterationCount: 'infinite'
                }}
              >
                {marqueeTexts.map((text: string, index: number) => (
                  <div key={`marquee-${index}`} className="flex-none h-9 flex items-center justify-center text-xs text-white">
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. 主選單導覽列 */}
        <header className="relative mx-auto border-b bg-white border-ui-border-base shadow-sm h-16">
          <nav className="px-6 md:px-12 max-w-[1440px] mx-auto h-full flex items-center">
            {/* 三等份布局容器 */}
            <div className="w-full grid grid-cols-3 items-center">
              {/* 左側區塊 - 1/3 */}
              <div className="flex items-center justify-start gap-x-6">
                {/* 桌機版導航選單 - 所有導航項目都在左側 */}
                <div className="hidden lg:flex items-center gap-x-6">
                  {/* 使用預設導航或 Sanity 導航 */}
                  {(headerData?.navigation || [
                    { name: "首頁", href: "/" },
                    { name: "商品", href: "/store" },
                    { name: "關於", href: "/about" },
                    { name: "聯絡我們", href: "/contact" }
                  ]).map((navItem: any, index: number) => (
                    <LocalizedClientLink
                      key={`nav-left-${index}`}
                      href={navItem.href || "#"}
                      className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200"
                    >
                      <span className="!text-[13px] !font-medium !leading-none">
                        {navItem.name || ""}
                      </span>
                    </LocalizedClientLink>
                  ))}
                </div>

                {/* 手機版選單按鈕 */}
                <div className="block lg:hidden">
                  <MobileMenu regions={regions || []} />
                </div>
              </div>

              {/* 中間區塊 - Logo 完全居中 - 1/3 */}
              <div className="flex justify-center">
                <LocalizedClientLink
                  href="/"
                  className="text-xl font-bold text-black hover:text-black/70 transition-colors duration-200"
                  style={{ fontSize: `${headerData?.logoWidth ? Math.min(headerData.logoWidth / 8, 24) : 20}px` }}
                >
                  {headerData?.storeName || "Medusa Store"}
                </LocalizedClientLink>
              </div>
              
              {/* 右側區塊 - 1/3 */}
              <div className="flex items-center justify-end gap-x-6">
                {/* 手機版圖標 */}
                <div className="flex lg:hidden items-center gap-x-3">
                  <Suspense fallback={<div className="h-6 w-6" />}>
                    <AccountButton />
                  </Suspense>
                  
                  <Suspense fallback={<div className="h-6 w-6" />}>
                    <CartButton />
                  </Suspense>
                </div>

                {/* 桌機版導航項目和功能按鈕 */}
                <div className="hidden lg:flex items-center gap-x-4">
                  {/* 國家選擇器 */}
                  <Suspense fallback={<div className="h-6 w-6" />}>
                    <CountrySelect regions={regions || []} />
                  </Suspense>
                  
                  {/* 帳戶按鈕 */}
                  <Suspense fallback={<div className="h-6 w-6" />}>
                    <AccountButton />
                  </Suspense>
                  
                  {/* 購物車按鈕 */}
                  <Suspense fallback={<div className="h-6 w-6" />}>
                    <CartButton />
                  </Suspense>
                </div>
              </div>
            </div>
          </nav>
        </header>

        {/* 3. 分類導覽列 - 簡化版 */}
        <div className="hidden lg:block border-b border-ui-border-base bg-white shadow-sm">
          <div className="px-6 md:px-12 max-w-[1440px] mx-auto flex justify-between items-center py-2 text-sm text-neutral-600">
            <div className="flex items-center gap-x-6">
              {/* 商品分類 */}
              {(categories || []).slice(0, 4).map((category: any) => (
                <LocalizedClientLink 
                  key={category.id}
                  href={`/categories/${category.handle}`}
                  className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200"
                >
                  <span className="!text-[13px] !font-medium !leading-none">
                    {category.name}
                  </span>
                </LocalizedClientLink>
              ))}
            </div>
            {/* 搜尋框 - 移到第二行右側 */}
            <div className="relative group flex items-center">
              <SearchBarClient />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
