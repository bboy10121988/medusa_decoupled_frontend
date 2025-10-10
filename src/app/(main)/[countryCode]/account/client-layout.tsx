"use client"

import { ReactNode } from "react"
import { useParams } from "next/navigation"
import { Toaster } from "@medusajs/ui"
import AccountLayout from "@modules/account/templates/account-layout"
import LoginTemplate from "@modules/account/templates/login-template"
import { AccountProvider, useAccount } from "@lib/context/account-context"

export const dynamic = 'force-dynamic'

function AccountContent({ children }: { children: ReactNode }) {
  const params = useParams()
  const countryCode = params?.countryCode as string || 'tw'
  const { customer, loading, refreshCustomer } = useAccount()

  const handleLogoutComplete = async () => {
    await refreshCustomer()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <>
      <AccountLayout customer={customer} onLogout={handleLogoutComplete}>
        {customer ? children : <LoginTemplate countryCode={countryCode} />}
      </AccountLayout>
      <Toaster />
    </>
  )
}

export default function ClientAccountLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <AccountProvider>
      <AccountContent>{children}</AccountContent>
    </AccountProvider>
  )
}
