import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"

import { cartTranslations } from "@/lib/translations"

export async function generateMetadata({ params }: { params: { countryCode: string } }) {
  const { countryCode } = params
  const t = cartTranslations[countryCode as keyof typeof cartTranslations] || cartTranslations.tw

  return {
    title: t.cart,
    description: t.viewCart,
  }
}

export default async function Cart({ params }: { params: { countryCode: string } }) {
  const { countryCode } = params
  const cart = await retrieveCart().catch(() => {
    // console.error(error)
    return null // 返回 null 而不是 notFound()，讓 CartTemplate 處理空購物車的情況
  })

  const customer = await retrieveCustomer()

  return <CartTemplate cart={cart} customer={customer} countryCode={countryCode} />
}
