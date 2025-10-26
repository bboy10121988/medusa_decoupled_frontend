"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export const retrieveOrder = async (id: string) => {

  const fieldList: string[] = [
    "id",
    "created_at",
    "email",
    "display_id",
    "metadata",
    "currency_code",
    "total",
    "original_total",
    "subtotal",
    "tax_total",
    "shipping_total",
    "discount_total",
    "gift_card_total",
    "shipping_subtotal",
    "status",
    "shipping_methods",
    "shipping_address.*",
    "billing_address",
    "*payment_collections.payments",
    "*items",
    "items.metadata",
    "*items.variant",
    "*items.product",
  ]

  return sdk.store.order.retrieve(id,{
      fields: fieldList.join(",")
  })
  .then(({order}) => {

    console.log("retrieve order heyhey:", order)
    console.log("retrieve order metadata:", order.metadata)

    return order
  })
  .catch((err) => medusaError(err))

  
  

  // 已經有現成的sdk方法可以用，不需要自己fetch
  // const headers = {
  //   ...(await getAuthHeaders()),
  // }

  // const next = {
  //   ...(await getCacheOptions("orders")),
  // }

  // return sdk.client
  //   .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
  //     method: "GET",
  //     query: {
  //       fields:
  //         // "*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product",
  //         "*items"
  //     },
  //     headers,
  //     next,
  //     cache: "force-cache",
  //   })
  //   .then(({ order }) => {

  //       console.log("retrieve order:", order.id)
  //       console.log("retrieve order metadata:", order.metadata)
  //     return order
  //   })
  //   .catch((err) => medusaError(err))
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) => {


  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        order: "-created_at",
        fields: "*items,+items.metadata,*items.variant,*items.product",
        ...filters,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
}

export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Order ID is required", order: null }
  }

  const headers = await getAuthHeaders()

  return await sdk.store.order
    .requestTransfer(
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .acceptTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .declineTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}
