import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CheckoutTemplate from "@modules/checkout/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "結帳",
  description: "安全結帳流程",
}

export default async function Checkout({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params

  let cart
  try {
    cart = await retrieveCart()
  } catch {
    return notFound()
  }

  if (!cart) {
    return notFound()
  }

  let customer = null
  try {
    customer = await retrieveCustomer()
  } catch {
    // 未登入或取得客戶資料失敗，繼續以訪客身份結帳
  }

  return (
    <CheckoutTemplate cart={cart} customer={customer} countryCode={countryCode} />
  )
}
