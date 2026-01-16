"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
// import { StoreCustomer } from "@medusajs/types"
// import { useEffect, useState } from "react"
// import safeFetchGlobal from '../../../../lib/safe-fetch'

import { getTranslation } from "../../../../lib/translations"

export default function AccountButton({ countryCode = 'tw' }: { countryCode?: string }) {
  const t = getTranslation(countryCode)
  // const [customer, setCustomer] = useState<StoreCustomer | null>(null)

  /*
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await safeFetchGlobal('/api/customer', undefined, null)
        if (data && typeof data === 'object') {
          setCustomer((data as any).customer || null)
        }
      } catch (error) {
        // console.log('Customer not logged in')
        setCustomer(null)
      }
    }
    fetchCustomer()
  }, [])
  */

  return (
    <LocalizedClientLink
      className="text-xs tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200 flex items-center gap-2"
      href="/account"
      data-testid="nav-account-link"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <span className="!text-xs !font-medium !leading-none">{t.account}</span>
    </LocalizedClientLink>
  )
}
