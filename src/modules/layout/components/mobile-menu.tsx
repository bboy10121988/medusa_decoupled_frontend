"use client"

import { useState, useRef, useEffect } from "react"
import { XMarkIcon, Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "@modules/layout/components/country-select"
import thumbnail from "../../products/components/thumbnail"
import ClientPreviewPrice from "../../products/components/product-preview/client-price"
import { SanityHeader, NavigationItem } from "../../../types/global"
import { getTranslation, translateText } from "../../../lib/translations"

type MobileMenuProps = {
  regions: StoreRegion[]
  navigation?: NavigationItem[]  // 更新為 NavigationItem[] 類型
  categories?: Array<{ id: string; handle: string; name: string }>
  headerData?: SanityHeader
  countryCode?: string
}

export default function MobileMenu({ regions, navigation, categories, headerData: _headerData, countryCode = 'tw' }: MobileMenuProps) {
  const t = getTranslation(countryCode)
  const [isOpen, setIsOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [menuTopOffset, setMenuTopOffset] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)

  // 動態計算選單頂部偏移 - 確保選單緊貼導覽列底部
  useEffect(() => {
    const calculateMenuTopOffset = () => {
      // 直接使用 sticky 導覽列的位置計算
      const stickyNav = document.querySelector('.sticky.top-0')

      if (stickyNav) {
        const stickyNavRect = stickyNav.getBoundingClientRect()
        // 選單頂部位置 = sticky 導覽列頂部 + sticky 導覽列高度
        const totalOffset = stickyNavRect.top + stickyNavRect.height

        setMenuTopOffset(totalOffset)
      }
    }

    // 初始計算
    calculateMenuTopOffset()

    // 監聽視窗大小變化
    window.addEventListener('resize', calculateMenuTopOffset)

    // 使用 MutationObserver 監聽 DOM 變化
    const observer = new MutationObserver(() => {
      // 延遲一點計算，確保 DOM 更新完成
      setTimeout(calculateMenuTopOffset, 100)
    })
    const targetNode = document.body
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    return () => {
      window.removeEventListener('resize', calculateMenuTopOffset)
      observer.disconnect()
    }
  }, [isOpen]) // 當選單開啟時重新計算

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus()
    }
  }, [showSearch])

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus()
    }
  }, [showSearch])

  return (
    <div className="block lg:hidden">
      <button
        onClick={() => {
          setIsOpen(true)
          // 立即重新計算選單位置
          setTimeout(() => {
            const stickyNav = document.querySelector('.sticky.top-0')
            if (stickyNav) {
              const stickyNavRect = stickyNav.getBoundingClientRect()
              const totalOffset = stickyNavRect.top + stickyNavRect.height
              setMenuTopOffset(totalOffset)
              // console.log(`📱 開啟選單時位置: ${totalOffset}px`)
            }
          }, 10)
        }}
        className="flex items-center justify-center w-8 h-8"
        aria-label="開啟選單"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-x-0 bottom-0 z-[110] bg-white shadow-lg border-t border-gray-200"
          style={{
            top: `${menuTopOffset}px`,
            maxHeight: `calc(100vh - ${menuTopOffset}px)`,
            overflowY: 'auto'
          }}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex-1"></div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-8 h-8"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="flex items-center">
              {showSearch ? (
                <div className="relative w-full">
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder={t.search}
                    className="w-full p-2 border rounded-lg"
                    onBlur={() => setShowSearch(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Navigation */}
            {navigation?.map(({ name, href }, index) => {
              // 判斷是否為外部連結
              const isExternal = /^(http|https|www)/.test(href)
              // 判斷是否為首頁連結 (支援 / 和 /home)
              const isHome = href === '/' || href === '/home'
              // 處理連結
              const processedHref = isExternal
                ? href
                : isHome
                  ? '/'
                  : href.startsWith('/')
                    ? href
                    : `/${href}`

              const uniqueKey = `mobile-nav-${index}-${name.replace(/[^a-zA-Z0-9]/g, '')}-${href.replace(/[^a-zA-Z0-9]/g, '')}`

              return isExternal ? (
                <a
                  key={uniqueKey}
                  href={href}
                  className="block py-2 text-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                >
                  {translateText(name, countryCode)}
                </a>
              ) : (
                <LocalizedClientLink
                  key={uniqueKey}
                  href={processedHref}
                  className="block py-2 text-lg"
                  onClick={() => setIsOpen(false)}
                >
                  {translateText(name, countryCode)}
                </LocalizedClientLink>
              )
            })}

            {regions && (
              <div className="pt-4 border-t">
                <CountrySelect regions={regions} />
              </div>
            )}

            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="pt-2 border-t">
                <h3 className="py-2 font-medium">{t.categories}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <LocalizedClientLink
                      key={category.id}
                      href={`/categories/${category.handle}`}
                      className="block py-1 text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      {translateText(category.name, countryCode)}
                    </LocalizedClientLink>
                  ))}
                </div>
              </div>
            )}

            {/* Account only */}
            <div className="pt-2 border-t">
              <LocalizedClientLink
                href="/account"
                className="block py-2 text-lg"
                onClick={() => setIsOpen(false)}
              >
                {t.account}
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
