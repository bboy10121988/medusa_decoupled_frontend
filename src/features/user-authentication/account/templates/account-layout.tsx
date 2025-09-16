import React from "react"

import UnderlineLink from "@shared/common/components/interactive-link"

import AccountNav from "../components/account-nav/index"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1 small:py-12" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-white flex flex-col">
        {/* 根據是否有客戶來決定佈局 */}
        <div className={`py-12 ${customer ? 'grid grid-cols-1 small:grid-cols-[240px_1fr]' : 'flex justify-center'}`}>
          {customer && (
            <div>
              <AccountNav customer={customer} />
            </div>
          )}
          <div className={`flex-1 ${!customer ? 'max-w-md w-full' : ''}`}>{children}</div>
        </div>
        <div className="flex flex-col small:flex-row items-end justify-between small:border-t border-gray-200 py-12 gap-8">
          <div>
            <h3 className="text-xl-semi mb-4">有任何問題嗎？</h3>
            <span className="txt-medium">
              您可以在我們的客戶服務頁面找到常見問題和解答。
            </span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
