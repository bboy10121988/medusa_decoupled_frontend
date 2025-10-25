import { Heading } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {

  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  console.log("order:" ,order)
  console.log("payment collections",order.payment_collections)

  let msg = "您的訂單已成功建立。"

  if (order.status == "canceled"){
    msg = "您的訂單因錯誤(付款失敗或是尚未完成)已取消。如有任何疑問，請聯繫商店客服。"
  }

  // 可能有的狀態
  // switch (order.status){
  //   case "pending":
  //   case "completed":
  //   case "draft":
  //   case "archived":
  //   case "canceled":
  //   case "requires_action":
  // }

  console.log("payment status message:", msg)


  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            <span>謝謝您！</span>
            <span>{msg}</span>
            <span className="text-lg text-ui-fg-subtle mt-2">如有任何問題，請點擊「幫助」按鈕可諮詢商店，將有專人為您服務。</span>
          </Heading>
          <OrderDetails order={order} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            訂單摘要
          </Heading>
          <Items order={order} />
          <CartTotals totals={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
