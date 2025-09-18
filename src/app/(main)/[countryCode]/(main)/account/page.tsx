import { retrieveCustomer } from "@lib/data/customer"
import { redirect } from "next/navigation"

export default async function AccountPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const customer = await retrieveCustomer().catch(() => null)
  const { countryCode } = await params

  if (!customer) {
    // 如果沒有登入，重定向到登入頁面
    redirect(`/${countryCode}/account/login`)
  }

  // 如果已登入，重定向到儀表板
  redirect(`/${countryCode}/account/dashboard`)
}