import React, { useState } from "react"
import { Button } from "@medusajs/ui"
import ErrorMessage from "../error-message"
import { HttpTypes } from "@medusajs/types"
import { placeOrder } from "@lib/data/cart"
import { PaymentData } from "../../../../internal/ecpayments"
import { removeCartIdClient } from "@/lib/data/cart-storage"

type Props = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

const ECPayPaymentButton: React.FC<Props> = ({ cart, notReady, "data-testid": dataTestId }) => {
    
  const action:string = "ECPayPaymentButton"

  let defaultError:string | null = null

  // 檢查是否選擇了 ECPay 支付方式
  const selectedPaymentProvider = cart.metadata?.selected_payment_provider
  if (selectedPaymentProvider !== "ecpay_credit_card") {
    defaultError = "請先選擇綠界支付方式"
  }

  console.log(action,"selected payment provider:", selectedPaymentProvider)

  // 支援舊版 payment sessions 檢查（向後兼容）
  const paymentSessions = cart.payment_collection?.payment_sessions
  let paymentSessionID = ""

  if (paymentSessions && paymentSessions.length > 0) {
    paymentSessionID = paymentSessions[0].id
    console.log(action,"payment session id found:",paymentSessionID)
  } else {
    console.log(action,"no payment sessions, using metadata approach")
  }

  const [submitting, setSubmitting] = useState(false)
  let errorMessage: string|null = defaultError
  // const [errorMessage, setErrorMessage] = useState<string | null>(defaultError)


  // 計算總金額（轉換為整數，ECPay 不接受小數）
  const totalAmount = Math.round(cart.total || 0)

  // 商品名稱（取購物車商品名稱，限制長度）
  const itemName = cart.items?.map(item => item.product_title).join(',').substring(0, 200) || '購物車商品'

  // ecpay API URL
  const ecpayAPI = process.env.NEXT_PUBLIC_ECPAY_ACTION_URL || "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"

  // ecpay在完成付款後callback的網址，這裡要指向medusa ecpay 轉換器
  const returnURL = process.env.NEXT_PUBLIC_ECPAY_RETURN_URL || ""
  // const returnURL = ""

  // 特店代號
  const merchantID = process.env.NEXT_PUBLIC_ECPAY_MERCHANT_ID || ""

  // hash key
  const hashKey = process.env.NEXT_PUBLIC_ECPAY_HASH_KEY || ""

  // hash iv
  const hashIV = process.env.NEXT_PUBLIC_ECPAY_HASH_IV || ""

  if (returnURL === ""){
    errorMessage = "missing ECPay return URL"
    // setErrorMessage("missing ECPay return URL")
  }

  if (merchantID === ""){
    errorMessage = "missing ECPay merchant ID"
  }

  if (hashKey === ""){
    errorMessage = "missing ECPay hash key"
  }

  if (hashIV === ""){
    errorMessage = "missing ECPay hash iv"
  }

  

  const tradeNo = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join("");

  let paymentData: PaymentData = new PaymentData();

  paymentData.setHashKey(hashKey)

  paymentData.setHashIV(hashIV)

  paymentData.setMerchantID(merchantID);

  paymentData.setMerchantTradeNo(tradeNo.toString())

  paymentData.setMerchantTradeDate(new Date().toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Taipei'
  }).replace(/\//g, '/').replace(',', ''))

  paymentData.setPaymentType("aio")

  paymentData.setTotalAmount(totalAmount)

  paymentData.setTradeDesc("商品購買")

  paymentData.setItemName(itemName)

  paymentData.setReturnURL(returnURL)

  

  paymentData.setChoosePayment("ALL")
  
  paymentData.setEncryptType("1")

  paymentData.setCustomField3("order_id")

  // data.setCustomField4(cart.id)

  

  if (errorMessage){
    console.log(action,"error:",errorMessage)
  }


  const submitHandler = async () => {

    if (errorMessage){  
      console.log(action,"blocking due to error:",errorMessage)
      return
    }

    setSubmitting(true)

    try{
      console.log("🏪 ECPay: 開始建立訂單...")
      
      // 使用改進的 placeOrder 函數
      const orderResult = await placeOrder()
      
      if (orderResult?.id) {

          console.log("✅ 訂單創建成功:", orderResult)

          console.log("🔢 訂單 ID:", orderResult.id)

          const orderID: string = orderResult.id

          // 清除 cart id
          removeCartIdClient()

          // "使用者"付款完成後返回的網址
          const clientBackURL = `${window.location.origin}/order/${orderID}/confirmed`

          paymentData.setClientBackURL(clientBackURL)

          paymentData.setCustomField4(orderID)

          const params:URLSearchParams = paymentData.getDataParams();

          // 建立隱藏表單
          const form = document.createElement('form')
          form.method = 'POST'
          form.action = ecpayAPI
          // form.target = '_blank' // 開啟新視窗
          form.encType = 'application/x-www-form-urlencoded'

          // 添加所有參數作為隱藏輸入欄位
          params.forEach((value, key) => {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = key
            input.value = value
            form.appendChild(input)
          })
        
          // 將表單添加到頁面並提交
          document.body.appendChild(form)
          form.submit()

          // 移除表單
          document.body.removeChild(form)
          
        } else {
          console.error("❌ 訂單創建失敗: 無效的回應格式")
          throw new Error("訂單創建失敗，請稍後再試")
        }
      
    } catch(error: any) {
      console.error("❌ ECPay 訂單處理錯誤:", error)
      
      let errorMsg = "發生錯誤，請稍後再試"
      if (error?.message) {
        errorMsg = error.message
      }
      
      alert(errorMsg)
    } finally {
      setSubmitting(false)
    }


  }
  

  return (
    <>
      <Button
        onClick={submitHandler}
        disabled={notReady || submitting || !!errorMessage}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        {submitting ? "處理中..." : "前往 ECPay 付款"}
      </Button>
      
      {errorMessage && (
        <ErrorMessage 
          error={errorMessage} 
          data-testid="ecpay-payment-error-message" 
        />
      )}
    </>
  )
        // <form 
        //   method="POST" 
        //   action={ecpayAPI}
        //   target="_blank"
        //   encType="application/x-www-form-urlencoded"
}

export default ECPayPaymentButton

