import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import ChevronDown from "@/modules/common/icons/chevron-down"
import Image from "next/image"
import { getHeader } from "@/lib/sanity"
import { SanityHeader } from "@/types/global"

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerData = await getHeader() as SanityHeader
  
  // 與首頁 nav 保持一致的 logo 高度計算
  const logoHeight = headerData?.logoSize?.desktop || headerData?.logoHeight || 36

  return (
    <div className="w-full bg-white relative small:min-h-screen">
      <div className="h-16 bg-white border-b border-ui-border-base">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* 左側 - 返回購物車 */}
            <LocalizedClientLink
              href="/cart"
              className="flex items-center gap-x-2 text-ui-fg-base hover:text-ui-fg-base transition-colors"
              data-testid="back-to-cart-link"
            >
              <ChevronDown className="rotate-90" size={16} />
              <span className="text-sm font-medium">
                返回購物車
              </span>
            </LocalizedClientLink>

            {/* 中間 - Logo */}
            <LocalizedClientLink
              href="/"
              className="flex items-center justify-center"
              data-testid="store-link"
            >
              {headerData?.logo?.url ? (
                <>
                  {/* Desktop Logo */}
                  <Image
                    src={headerData.logo.url!}
                    alt={headerData.logo.alt || "Store logo"}
                    width={200}
                    height={logoHeight}
                    className="w-auto object-contain transition-all duration-300 hidden md:block"
                    style={{ 
                      height: `${headerData?.logoSize?.desktop || logoHeight}px`,
                      width: 'auto'
                    }}
                    priority
                  />
                  {/* Mobile Logo */}
                  <Image
                    src={headerData.logo.url!}
                    alt={headerData.logo.alt || "Store logo"}
                    width={200}
                    height={headerData?.logoSize?.mobile || 28}
                    className="w-auto object-contain transition-all duration-300 md:hidden"
                    style={{ 
                      height: `${headerData?.logoSize?.mobile || 28}px`,
                      width: 'auto'
                    }}
                    priority
                  />
                </>
              ) : (
                <span className="text-xl font-bold text-ui-fg-base">
                  {headerData?.storeName || "Medusa Store"}
                </span>
              )}
            </LocalizedClientLink>

            {/* 右側 - 空白區域用於平衡佈局 */}
            <div className="w-24"></div>
          </div>
        </div>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
    </div>
  )
}
