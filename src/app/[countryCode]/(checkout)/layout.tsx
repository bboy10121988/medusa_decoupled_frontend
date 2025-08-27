import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MedusaCTA from "@modules/layout/components/medusa-cta"
import AccountButton from "@modules/layout/components/account-button"
import { getHeader, getFooter } from "@lib/sanity"
import Image from "next/image"
import Footer from "@modules/layout/templates/footer"

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerData = await getHeader()
  
  // 使用與主頁面相同的 logo 尺寸計算邏輯
  const logoHeight = headerData?.logoSize?.desktop || headerData?.logoHeight || 36
  const mobileLogoHeight = headerData?.logoSize?.mobile || 28
  const mainNavHeight = Math.max(48, logoHeight + 24)

  return (
    <div className="w-full bg-white relative small:min-h-screen flex flex-col">
      {/* 頁首 */}
      <div 
        className="bg-white border-b"
        style={{
          height: `${mainNavHeight}px`
        }}
      >
        <nav className="flex h-full items-center content-container justify-between">
          {/* 左邊：返回購物車 */}
          <div className="flex-1 basis-0">
            <LocalizedClientLink
              href="/cart"
              className="text-small-semi text-ui-fg-base flex items-center gap-x-2 uppercase"
              data-testid="back-to-cart-link"
            >
              <ChevronDown className="rotate-90" size={16} />
              <span className="mt-px hidden small:block txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base ">
                返回購物車
              </span>
              <span className="mt-px block small:hidden txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
                返回
              </span>
            </LocalizedClientLink>
          </div>

          {/* 中間：LOGO */}
          <div className="flex justify-center">
            <LocalizedClientLink
              href="/"
              className="flex items-center"
              data-testid="checkout-logo-link"
            >
              {headerData?.logo ? (
                <>
                  {/* Desktop Logo */}
                  <Image
                    src={headerData.logo.url}
                    alt={headerData.logo.alt || "Store logo"}
                    width={200}
                    height={logoHeight}
                    className="w-auto object-contain transition-all duration-300 hidden md:block"
                    style={{ 
                      height: `${logoHeight}px`,
                      width: 'auto'
                    }}
                  />
                  {/* Mobile Logo */}
                  <Image
                    src={headerData.logo.url}
                    alt={headerData.logo.alt || "Store logo"}
                    width={200}
                    height={mobileLogoHeight}
                    className="w-auto object-contain transition-all duration-300 block md:hidden"
                    style={{ 
                      height: `${mobileLogoHeight}px`,
                      width: 'auto'
                    }}
                  />
                </>
              ) : (
                <span className="txt-compact-xlarge-plus text-ui-fg-base font-semibold">
                  SALON
                </span>
              )}
            </LocalizedClientLink>
          </div>

          {/* 右邊：帳戶功能按鈕 */}
          <div className="flex-1 basis-0 flex justify-end">
            <AccountButton />
          </div>
        </nav>
      </div>
      
      {/* 主要內容 */}
      <div className="relative flex-1" data-testid="checkout-container">
        {children}
      </div>
      
      {/* 頁尾 */}
      <Footer />
    </div>
  )
}
