"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { StoreCustomer } from "@medusajs/types"
import { useEffect, useState } from "react"

export default function AccountButton() {
  const [customer, setCustomer] = useState<StoreCustomer | null>(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch("/api/customer")
        if (response.ok) {
          const data = await response.json()
          setCustomer(data.customer)
        }
      } catch (error) {
        console.log("Customer not logged in")
        setCustomer(null)
      }
    }
    fetchCustomer()
  }, [])

  return (
    <LocalizedClientLink
      className="text-[13px] tracking-wider uppercase font-medium hover:text-black/70 transition-colors duration-200 flex items-center gap-2"
      href="/account"
      data-testid="nav-account-link"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <span className="!text-[13px] !font-medium !leading-none">帳戶</span>
    </LocalizedClientLink>
  )
}
