import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav/index"
import { HttpTypes } from "@medusajs/types"

import { accountTranslations } from "@/lib/translations"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
  onLogout?: () => void
  countryCode?: string
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
  onLogout,
  countryCode = 'tw',
}) => {
  const t = accountTranslations[countryCode as keyof typeof accountTranslations] || accountTranslations.tw

  return (
    <div className="flex-1 small:py-12" data-testid="account-page">
      <div className="flex-1 content-container h-full max-w-5xl mx-auto bg-white flex flex-col">
        {/* 根據是否有客戶來決定佈局 */}
        <div className={`py-12 ${customer ? 'grid grid-cols-1 small:grid-cols-[240px_1fr]' : 'flex justify-center'}`}>
          {customer && (
            <div>
              <AccountNav customer={customer} onLogout={onLogout} />
            </div>
          )}
          <div className={`flex-1 ${!customer ? 'max-w-md w-full' : ''}`}>{children}</div>
        </div>
        <div className="flex flex-col small:flex-row items-end justify-between small:border-t border-gray-200 py-12 gap-8">
          <div>
            <h3 className="text-xl-semi mb-4">{t.questionsTitle}</h3>
            <span className="txt-medium">
              {t.questionsText}
            </span>
          </div>
          <div>
            <UnderlineLink href="/customer-service">
              {t.customerServiceLink}
            </UnderlineLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
