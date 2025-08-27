import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import CheckoutTemplate from "@modules/checkout/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "結帳",
  description: "安全結帳流程",
}

export default async function Checkout() {
  const cart = await retrieveCart().catch((error) => {
    console.error("Error retrieving cart:", error)
    return notFound()
  })

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer().catch((error) => {
    console.error("Error retrieving customer:", error)
    return null
  })

  return (
    <CheckoutTemplate cart={cart} customer={customer} />
  )
}
