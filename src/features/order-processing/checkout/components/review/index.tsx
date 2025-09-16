"use client"

import { Heading, Text, clx, Button } from "@medusajs/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { useCallback } from "react"

const Review = ({ cart }: { cart: any }) => {

  const action:string = "Review"

  console.log(action,"購物車資料：",cart);

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "review"

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const handleBackToPayment = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  // 判斷支付方式
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s: any) => s.status === "pending"
  ) || cart.payment_collection?.payment_sessions?.[0]

  const isECPayCredit = paymentSession?.provider_id === process.env.NEXT_PUBLIC_PAYMENT_METHOD_ECPAY_CREDIT
  const isBankTransfer = paymentSession?.provider_id === process.env.NEXT_PUBLIC_PAYMENT_METHOD_DEFAULT

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          檢視訂單
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              {isECPayCredit ? (
                <div className="space-y-3">
                  <Text className="txt-medium-plus text-gray-900 mb-1">
                    點擊「前往綠界支付」按鈕後，系統將跳轉至綠界第三方金流平台進行刷卡支付。
                  </Text>
                  <Text className="txt-small text-gray-700">
                    • 支付完成後將自動返回訂單確認頁面<br/>
                    • 請確保在支付過程中不要關閉瀏覽器視窗<br/>
                    • 如有問題請聯繫客服
                  </Text>
                  <Text className="txt-small text-gray-600 mt-4">
                    點擊下方按鈕即表示您已閱讀、了解並接受我們的使用條款、銷售條款及退貨政策，並確認您已閱讀本站的隱私政策。
                  </Text>
                </div>
              ) : isBankTransfer ? (
                <div className="space-y-3">
                  <Text className="txt-medium-plus text-gray-900 mb-1">
                    您選擇了銀行轉帳付款方式，請於訂單確認後依照以下帳號進行轉帳：
                  </Text>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Text className="txt-small font-medium text-gray-800">
                      銀行：玉山銀行 (808)<br/>
                      帳號：0532-968-123456<br/>
                      戶名：您的店家名稱有限公司
                    </Text>
                    <Text className="txt-xs text-gray-600 mt-2">
                      轉帳備註請填寫：訂單編號 {cart.display_id || 'PENDING'}
                    </Text>
                  </div>
                  <Text className="txt-small text-red-600">
                    • 請於 3 個工作日內完成轉帳<br/>
                    • 轉帳完成請保留轉帳證明並聯繫客服<br/>
                    • 確認收款後將安排出貨
                  </Text>
                  <Text className="txt-small text-gray-600 mt-4">
                    點擊下方按鈕即表示您已閱讀、了解並接受我們的使用條款、銷售條款及退貨政策，並確認您已閱讀本站的隱私政策。
                  </Text>
                </div>
              ) : (
                <Text className="txt-medium-plus text-gray-900 mb-1">
                  點擊「送出訂單」按鈕，即表示您已閱讀、了解並接受我們的使用條款、銷售條款及退貨政策，並確認您已閱讀本站的隱私政策。
                </Text>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={handleBackToPayment}
              className="flex-1"
            >
              上一步：修改付款方式
            </Button>
            <div className="flex-2">
              <PaymentButton cart={cart} data-testid="submit-order-button" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Review
