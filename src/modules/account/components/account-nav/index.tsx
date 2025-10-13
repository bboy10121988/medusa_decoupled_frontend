"use client"

import { clx } from "@medusajs/ui"
import { ArrowRightOnRectangle } from "@medusajs/icons"
import { useParams, usePathname } from "next/navigation"

import ChevronDown from "@modules/common/icons/chevron-down"
import User from "@modules/common/icons/user"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { useLogout } from "@lib/hooks/use-logout"

type AccountNavProps = {
  customer: HttpTypes.StoreCustomer | null
  onLogout?: () => void
}

const AccountNav = ({
  customer,
  onLogout,
}: AccountNavProps) => {
  const route = usePathname()
  const params = useParams()
  const { countryCode: rawCountryCode } = params as { countryCode: string }

  // 確保 countryCode 有效，從路徑中提取或使用默認值
  const countryCode = rawCountryCode && 
                     typeof rawCountryCode === 'string' &&
                     rawCountryCode !== 'api' && 
                     rawCountryCode.length === 2 && 
                     /^[a-z]{2}$/.test(rawCountryCode) 
                     ? rawCountryCode 
                     : 'tw'

  // 調試日誌
  if (process.env.NODE_ENV === 'development') {
    console.log('AccountNav debug:', { 
      route, 
      params, 
      rawCountryCode, 
      countryCode 
    })
  }

  const { logout, isLoggingOut } = useLogout({
    countryCode,
    onLoggedOut: onLogout,
  })

  const handleLogout = async () => {
    try {
      console.log('🔓 Account Nav: 開始簡化登出流程 - 委託給 useLogout hook')
      
      // 🔧 直接使用 useLogout hook，避免重複的清除邏輯
      await logout()
      
    } catch (error) {
      console.error('❌ Account Nav 登出失敗:', error)
      
      // 最後手段：強制重新加載頁面
      console.log('🔄 使用最後手段：強制重新加載')
      window.location.href = `/${countryCode}/account?force_logout=1`
    }
  }

  return (
    <div>
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-x-2 text-small-regular py-2"
            data-testid="account-main-link"
          >
            <>
              <ChevronDown className="transform rotate-90" />
              <span>帳戶</span>
            </>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="text-xl-semi mb-4 px-8">
              您好 {customer?.first_name}
            </div>
            <div className="text-base-regular">
              <ul>
                <li>
                  <LocalizedClientLink
                    href="/account/profile"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="profile-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <User size={20} />
                        <span>個人檔案</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/addresses"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="addresses-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <MapPin size={20} />
                        <span>地址簿</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/orders"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="orders-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <Package size={20} />
                      <span>訂單</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8 w-full"
                    onClick={handleLogout}
                    data-testid="logout-button"
                    disabled={isLoggingOut}
                  >
                    <div className="flex items-center gap-x-2">
                      <ArrowRightOnRectangle />
                      <span>登出</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="hidden small:block" data-testid="account-nav">
        <div>
          <div className="pb-4">
            <h3 className="text-base-semi">帳戶</h3>
          </div>
          <div className="text-base-regular">
            <ul className="flex mb-0 justify-start items-start flex-col gap-y-4">
              <li>
                <AccountNavLink
                  href="/account"
                  route={route!}
                  data-testid="overview-link"
                >
                  總覽
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/profile"
                  route={route!}
                  data-testid="profile-link"
                >
                  個人檔案
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/addresses"
                  route={route!}
                  data-testid="addresses-link"
                >
                  地址簿
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/orders"
                  route={route!}
                  data-testid="orders-link"
                >
                  訂單
                </AccountNavLink>
              </li>
              <li className="text-grey-700">
                <button
                  type="button"
                  onClick={handleLogout}
                  data-testid="logout-button"
                  disabled={isLoggingOut}
                >
                  登出
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode: rawCountryCode }: { countryCode: string } = useParams()
  
  // 確保 countryCode 有效
  const countryCode = rawCountryCode && 
                     typeof rawCountryCode === 'string' &&
                     rawCountryCode !== 'api' && 
                     rawCountryCode.length === 2 && 
                     /^[a-z]{2}$/.test(rawCountryCode) 
                     ? rawCountryCode 
                     : 'tw'

  const active = route.split(countryCode)[1] === href
  return (
    <LocalizedClientLink
      href={href}
      className={clx("text-ui-fg-subtle hover:text-ui-fg-base", {
        "text-ui-fg-base font-semibold": active,
      })}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
