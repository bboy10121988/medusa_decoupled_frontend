"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { StoreRegion } from "@medusajs/types"
import CountrySelect from "./country-select"

interface Navigation {
  name: string
  href: string
}

interface Category {
  id: string
  handle: string
  name: string
}

interface HeaderData {
  storeName?: string
  navigation?: Navigation[]
}

interface MobileMenuProps {
  regions: StoreRegion[]
  navigation?: Navigation[]
  categories?: Category[]
  headerData?: HeaderData
}

export default function MobileMenu({ regions, navigation, categories, headerData }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const openMenu = () => setIsOpen(true)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* 漢堡按鈕 */}
      <button
        type="button"
        onClick={openMenu}
        className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* 側邊選單背景遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-25 z-[110]"
          onClick={closeMenu}
        />
      )}

      {/* 側邊選單 */}
      <div className={`fixed inset-y-0 left-0 z-[111] w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col overflow-y-scroll py-6">
          {/* 標題和關閉按鈕 */}
          <div className="flex items-center justify-between px-4 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-900">選單</h2>
            <button
              type="button"
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={closeMenu}
            >
              <span className="sr-only">關閉選單</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 選單內容 */}
          <div className="mt-6 flex-1 px-4 sm:px-6">
            <div className="flex flex-col space-y-6">
              {/* 導航連結 */}
              {navigation?.map((item) => (
                <div key={`mobile-nav-${item.name}`}>
                  <LocalizedClientLink
                    href={item.href}
                    className="flex items-center justify-between py-3 text-base font-medium text-gray-900 hover:text-gray-700 border-b border-gray-100"
                    onClick={closeMenu}
                  >
                    <span>{item.name}</span>
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </LocalizedClientLink>
                </div>
              ))}

              {/* 商品分類 */}
              {categories && categories.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">商品分類</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <LocalizedClientLink
                        key={`mobile-category-${category.id}`}
                        href={`/categories/${category.handle}`}
                        className="flex items-center justify-between py-2 text-sm text-gray-900 hover:text-gray-700"
                        onClick={closeMenu}
                      >
                        <span>{category.name}</span>
                        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </LocalizedClientLink>
                    ))}
                  </div>
                </div>
              )}

              {/* 帳戶與購物車 */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">帳戶</h3>
                <div className="space-y-2">
                  <LocalizedClientLink
                    href="/account"
                    className="flex items-center justify-between py-2 text-sm text-gray-900 hover:text-gray-700"
                    onClick={closeMenu}
                  >
                    <span>我的帳戶</span>
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/cart"
                    className="flex items-center justify-between py-2 text-sm text-gray-900 hover:text-gray-700"
                    onClick={closeMenu}
                  >
                    <span>購物車</span>
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </LocalizedClientLink>
                </div>
              </div>

              {/* 國家/地區選擇 */}
              {regions && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">國家/地區</h3>
                  <CountrySelect regions={regions} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
