import Link from "next/link"
import { getHeader } from "../../../../lib/sanity/index"

export default async function Nav() {
  // 從 Sanity 獲取資料
  let headerData
  try {
    headerData = await getHeader()
    console.log("Header data from Sanity:", JSON.stringify(headerData, null, 2))
  } catch (error) {
    console.error("Error fetching header data:", error)
    headerData = null
  }

  // 安全地處理所有資料，提供預設值
  const storeName = headerData?.storeName || "Medusa Store"
  const navigation = Array.isArray(headerData?.navigation) ? headerData.navigation : [
    { name: "首頁", href: "/" },
    { name: "商品", href: "/store" },
    { name: "關於", href: "/about" },
    { name: "聯絡我們", href: "/contact" }
  ]

  // 處理跑馬燈資料
  const marqueeEnabled = headerData?.marquee?.enabled !== false // 預設為 true
  let marqueeTexts: string[] = []
  
  if (headerData?.marquee) {
    if (headerData.marquee.text1?.enabled && headerData.marquee.text1?.content) {
      marqueeTexts.push(headerData.marquee.text1.content)
    }
    if (headerData.marquee.text2?.enabled && headerData.marquee.text2?.content) {
      marqueeTexts.push(headerData.marquee.text2.content)
    }
    if (headerData.marquee.text3?.enabled && headerData.marquee.text3?.content) {
      marqueeTexts.push(headerData.marquee.text3.content)
    }
  }
  
  // 如果沒有跑馬燈內容，使用預設值
  const finalMarqueeTexts = marqueeTexts.length > 0 ? marqueeTexts : [
    "新會員首購享85折",
    "全館消費滿$2000免運",
    "會員點數最高30倍送"
  ]

  return (
    <>
      {/* 整合的導航容器：跑馬燈 + 主選單 */}
      <div className="sticky top-0 inset-x-0 z-[100] group transition-all duration-300">
        {/* 1. 跑馬燈部分 */}
        {marqueeEnabled && Array.isArray(finalMarqueeTexts) && (
          <div className="bg-gray-900 text-white overflow-hidden h-9">
            <div className="relative h-full">
              <div className="absolute inset-x-0 flex flex-col animate-marquee">
                {finalMarqueeTexts.map((text: string, index: number) => (
                  <div key={`marquee-${index}`} className="flex-none h-9 flex items-center justify-center text-xs text-white">
                    {text || ""}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. 主選單導覽列 */}
        <header className="relative w-full border-b bg-white border-ui-border-base shadow-sm h-16">
          <nav className="px-6 md:px-12 w-full h-full flex items-center">
            {/* 三等份布局容器 */}
            <div className="w-full grid grid-cols-3 items-center">
              {/* 左側區塊 - 1/3 */}
              <div className="flex items-center justify-start gap-x-6">
                {/* 桌機版導航選單 - 所有導航項目都在左側 */}
                <div className="hidden lg:flex items-center gap-x-6">
                  {Array.isArray(navigation) && navigation.map((navItem: any, index: number) => (
                    <Link
                      key={`nav-left-${index}-${navItem?.name || ""}`}
                      href={navItem?.href || "#"}
                      className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200"
                    >
                      <span className="!text-[13px] !font-medium !leading-none">
                        {navItem?.name || ""}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 中間區塊 - Logo 完全居中 - 1/3 */}
              <div className="flex justify-center">
                <Link
                  href="/"
                  className="text-xl font-bold text-black hover:text-black/70 transition-colors duration-200"
                  style={{ fontSize: `${headerData?.logoWidth ? Math.min(headerData.logoWidth / 8, 24) : 20}px` }}
                >
                  {storeName}
                </Link>
              </div>
              
              {/* 右側區塊 - 1/3 */}
              <div className="flex items-center justify-end gap-x-6">
                {/* 手機版圖標 */}
                <div className="flex lg:hidden items-center gap-x-3">
                  <Link
                    className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200 flex items-center"
                    href="/account"
                    aria-label="帳戶"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </Link>
                  
                  <Link
                    className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200 flex items-center"
                    href="/cart"
                    aria-label="購物車"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                  </Link>
                </div>

                {/* 桌機版導航項目和功能按鈕 */}
                <div className="hidden lg:flex items-center gap-x-4">
                  {/* 帳戶連結 */}
                  <Link
                    className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200 flex items-center gap-2"
                    href="/account"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span className="!text-[13px] !font-medium !leading-none">帳戶</span>
                  </Link>
                  
                  <Link
                    className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200 flex items-center gap-2"
                    href="/cart"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    <span className="!text-[13px] !font-medium !leading-none">購物車</span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </header>

        {/* 3. 分類導覽列 - 簡化版 */}
        <div className="hidden lg:block border-b border-ui-border-base bg-white shadow-sm">
          <div className="px-6 md:px-12 w-full flex justify-between items-center py-2 text-sm text-neutral-600">
            <div className="flex items-center gap-x-6">
              <Link href="/categories/electronics" className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200">
                <span className="!text-[13px] !font-medium !leading-none">電子產品</span>
              </Link>
              <Link href="/categories/clothing" className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200">
                <span className="!text-[13px] !font-medium !leading-none">服飾</span>
              </Link>
              <Link href="/categories/home" className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200">
                <span className="!text-[13px] !font-medium !leading-none">家居用品</span>
              </Link>
            </div>
            <div className="relative group flex items-center">
              {/* 簡化搜尋框 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋商品..."
                  className="w-full max-w-xs pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LINE 懸浮按鈕 */}
      <a
        href="https://line.me/ti/p/~YOUR_LINE_ID"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-gray-900 hover:bg-gray-800 text-white border border-white/20 rounded-full px-6 py-3 shadow-lg transition-all duration-200 hover:-translate-y-0.5 z-[9999] flex items-center gap-3"
        aria-label="加入 LINE 好友"
      >
        <svg 
          className="w-5 h-5"
          viewBox="0 0 24 24" 
          fill="none"
          stroke="white"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span className="text-white text-sm font-medium tracking-wide">幫助</span>
      </a>
    </>
  )
}
