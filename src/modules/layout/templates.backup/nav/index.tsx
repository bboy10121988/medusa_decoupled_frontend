import { Suspense } from "react"
import Image from "next/image"

import { listRegions } from "@lib/data/regions"
import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import AccountButton from "@modules/layout/components/account-button"
import CountrySelect from "@modules/layout/components/country-select"
import { getHeader } from "@lib/sanity"
import { SanityHeader } from "../../../../types/global"
import MobileMenu from "../../components/mobile-menu"
import SearchBarClient from "../../components/search-bar-client"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const collections = await listCollections().then((res) => res.collections)
  const categories = await listCategories()
  
  // @ts-ignore
  const headerData = await getHeader() as SanityHeader

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
    if (count === 3) return 'animate-marquee-3'
    return 'animate-marquee'
  }

  const defaultAnnouncements = [
    "新會員首購享85折",
    "全館消費滿$2000免運",
    "會員點數最高30倍送"
  ]

  // 計算主導覽列高度
  const mainNavHeight = Math.max(48, (headerData?.logoHeight || 36) + 24)

  return (
    <>
      {/* 整合的導航容器：跑馬燈 + 主選單 + 分類列 */}
      <div className="sticky top-0 inset-x-0 z-[100] group transition-all duration-300">
        {/* 1. 跑馬燈部分 */}
        {(headerData?.marquee?.enabled && textCount > 0) ? (
          <div className="bg-gray-900 text-white overflow-hidden h-9">
            <div className="relative h-full">
              {headerData?.marquee?.linkUrl ? (
                <a 
                  href={headerData.marquee.linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full h-full"
                >
                  <div 
                    className={`absolute inset-x-0 flex flex-col ${getMarqueeClass(textCount)} ${pauseOnHover ? 'hover:animation-paused' : ''}`}
                    style={{
                      animationDuration: `${animationDuration}s`,
                      animationIterationCount: 'infinite',
                      animationTimingFunction: 'linear'
                    }}
                  >
                    {marqueeTexts.map((text, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-center h-9 text-xs font-medium tracking-wide px-4 flex-shrink-0"
                      >
                        {text}
                      </div>
                    ))}
                    {/* 重複一遍以確保無縫循環 */}
                    {marqueeTexts.map((text, index) => (
                      <div 
                        key={`repeat-${index}`} 
                        className="flex items-center justify-center h-9 text-xs font-medium tracking-wide px-4 flex-shrink-0"
                      >
                        {text}
                      </div>
                    ))}
                  </div>
                </a>
              ) : (
                <div 
                  className={`absolute inset-x-0 flex flex-col ${getMarqueeClass(textCount)} ${pauseOnHover ? 'hover:animation-paused' : ''}`}
                  style={{
                    animationDuration: `${animationDuration}s`,
                    animationIterationCount: 'infinite',
                    animationTimingFunction: 'linear'
                  }}
                >
                  {marqueeTexts.map((text, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-center h-9 text-xs font-medium tracking-wide px-4 flex-shrink-0"
                    >
                      {text}
                    </div>
                  ))}
                  {/* 重複一遍以確保無縫循環 */}
                  {marqueeTexts.map((text, index) => (
                    <div 
                      key={`repeat-${index}`} 
                      className="flex items-center justify-center h-9 text-xs font-medium tracking-wide px-4 flex-shrink-0"
                    >
                      {text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // 使用預設跑馬燈（如果 Sanity 沒有資料或關閉跑馬燈）
          <div className="bg-gray-900 text-white overflow-hidden h-9">
            <div className="relative h-full">
              <div className="absolute inset-x-0 flex flex-col animate-marquee-3">
                {defaultAnnouncements.map((text, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-center h-9 text-xs font-medium tracking-wide px-4 flex-shrink-0"
                  >
                    {text}
                  </div>
                ))}
                {/* 重複一遍以確保無縫循環 */}
                {defaultAnnouncements.map((text, index) => (
                  <div 
                    key={`repeat-${index}`} 
                    className="flex items-center justify-center h-9 text-xs font-medium tracking-wide px-4 flex-shrink-0"
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. 主導覽列 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto px-5 md:px-10">
            {/* 第二行 - 主導航 */}
            <div 
              className="grid grid-cols-3 items-center py-3"
              style={{ minHeight: `${mainNavHeight}px` }}
            >
              {/* 左側區塊 - 1/3 */}
              <div className="flex items-center justify-start">
                {/* 大螢幕模式 - 導覽選單 (1024px以上) */}
                <div className="hidden lg:flex items-center space-x-8">
                  {headerData?.navigation?.map((item, index) => {
                    // 檢查是否有子選單
                    const hasSubmenu = item.submenu && item.submenu.length > 0;
                    const uniqueKey = `${item.name}-${index}-${item.href || 'no-href'}`;
                    
                    // 處理 href，確保以 / 開頭
                    const processedHref = item.href?.startsWith('/') ? item.href : `/${item.href || ''}`;

                    return hasSubmenu ? (
                      <div key={uniqueKey} className="relative group">
                        <button className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200 flex items-center gap-1">
                          <span className="!text-[13px] !font-medium !leading-none">{item.name}</span>
                          <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-sm shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-48">
                          <div className="py-2">
                            {item.submenu.map((subItem, subIndex) => (
                              <LocalizedClientLink
                                key={`${subItem.name}-${subIndex}`}
                                href={subItem.href?.startsWith('/') ? subItem.href : `/${subItem.href || ''}`}
                                className="block px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                              >
                                {subItem.name}
                              </LocalizedClientLink>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <LocalizedClientLink
                        key={uniqueKey}
                        href={processedHref}
                        className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200"
                        data-testid={`${item.name.toLowerCase()}-link`}
                      >
                        <span className="!text-[13px] !font-medium !leading-none">{item.name}</span>
                      </LocalizedClientLink>
                    )
                  })}
                </div>
              </div>

              {/* 中間區塊 - Logo 完全居中 - 1/3 */}
              <div className="flex items-center justify-center">
                <LocalizedClientLink
                  href="/"
                  className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase xsmall:text-lg"
                  data-testid="nav-store-link"
                >
                  {headerData?.logo?.url ? (
                    <Image
                      src={headerData.logo.url}
                      alt={headerData.logo.alt || "Store logo"}
                      width={headerData?.logoWidth || 200}
                      height={headerData?.logoHeight || 36}
                      className="w-auto object-contain transition-all duration-300"
                      style={{ 
                        height: `${headerData?.logoHeight || 36}px`,
                        width: 'auto'
                      }}
                    />
                  ) : (
                    headerData?.storeName || "Medusa Store"
                  )}
                </LocalizedClientLink>
              </div>
              
              {/* 右側區塊 - 1/3 */}
              <div className="flex items-center justify-end gap-x-6">
                {/* 漢堡選單模式 - 只顯示圖標的帳戶和購物車 (小於1024px) */}
                <div className="flex lg:hidden items-center gap-x-3">
                  {/* 只有圖標的帳戶按鈕 */}
                  <LocalizedClientLink
                    className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200 flex items-center"
                    href="/account"
                    data-testid="nav-account-link-mobile"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </LocalizedClientLink>

                  {/* 只有圖標的購物車按鈕 */}
                  <Suspense
                    fallback={
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base flex gap-2"
                        href="/cart"
                        data-testid="nav-cart-link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                      </LocalizedClientLink>
                    }
                  >
                    <CartButton />
                  </Suspense>

                  {/* 漢堡選單圖標 */}
                  <MobileMenu />
                </div>

                {/* 大螢幕模式 - 文字+圖標 (1024px以上) */}
                <div className="hidden lg:flex items-center gap-x-6">
                  {/* 文字帳戶按鈕 */}
                  <div className="small:flex items-center gap-x-6">
                    <div className="flex items-center gap-x-6">
                      {process.env.FEATURE_SEARCH_ENABLED && (
                        <LocalizedClientLink
                          className="hover:text-ui-fg-base"
                          href="/search"
                          scroll={false}
                          data-testid="nav-search-link"
                        >
                          Search
                        </LocalizedClientLink>
                      )}
                      <Suspense fallback="登入">
                        <AccountButton />
                      </Suspense>
                    </div>
                  </div>

                  {/* 購物車按鈕 */}
                  <Suspense
                    fallback={
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base flex gap-2"
                        href="/cart"
                        data-testid="nav-cart-link"
                      >
                        Cart (0)
                      </LocalizedClientLink>
                    }
                  >
                    <CartButton />
                  </Suspense>
                </div>

                {/* 搜尋欄位 - 只在大螢幕顯示 */}
                <div className="hidden lg:block">
                  <SearchBarClient />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 分類導覽列 */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto px-5 md:px-10">
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide">
                {/* Collections */}
                {collections?.slice(0, 4)?.map((collection) => (
                  <LocalizedClientLink
                    key={collection.id}
                    href={`/collections/${collection.handle}`}
                    className="text-xs uppercase tracking-wide text-gray-600 hover:text-black transition-colors duration-200 whitespace-nowrap font-medium"
                    data-testid={`nav-collection-${collection.handle}`}
                  >
                    {collection.title}
                  </LocalizedClientLink>
                ))}
                
                {/* Categories */}
                {categories?.product_categories?.slice(0, 4)?.map((category: any) => (
                  <LocalizedClientLink
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    className="text-xs uppercase tracking-wide text-gray-600 hover:text-black transition-colors duration-200 whitespace-nowrap font-medium"
                    data-testid={`nav-category-${category.handle}`}
                  >
                    {category.name}
                  </LocalizedClientLink>
                ))}

                {/* Store Link */}
                <LocalizedClientLink
                  href="/store"
                  className="text-xs uppercase tracking-wide text-gray-600 hover:text-black transition-colors duration-200 whitespace-nowrap font-medium"
                  data-testid="nav-store-link"
                >
                  所有商品
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
