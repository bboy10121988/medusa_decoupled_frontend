import React, { useState } from "react"
import { Button } from "@medusajs/ui"
import ErrorMessage from "../error-message"
import { HttpTypes } from "@medusajs/types"
import { PaymentData } from "../../../../internal/ecpayments"
import {sdk} from "@lib/config";
import { removeCartIdClient } from "@/lib/data/cart-storage"

type Props = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

const ECPayPaymentButton: React.FC<Props> = ({ cart, notReady, "data-testid": dataTestId }) => {
    
  if (notReady){
    return <ErrorMessage error="請先完成前置步驟" data-testid="payment-not-ready-error" />
  }

  const action:string = "ECPayPaymentButton"

  console.log(action,": cart:",cart)

  const paymentCollection = cart.payment_collection

  if (!paymentCollection){
    return <ErrorMessage error="請先完成前置步驟" data-testid="payment-not-ready-error" />
  }

  console.log(action,": paymentCollection:",paymentCollection)

  const paymentSessions = paymentCollection.payment_sessions

  if (!paymentSessions || paymentSessions.length === 0){
    return <ErrorMessage error="請先完成前置步驟" data-testid="payment-not-ready-error" />
  } 

  console.log(action,": paymentSessions:",paymentSessions)

  const paymentSessionID = paymentSessions[0].id

  console.log(action,"payment session id",paymentSessionID)

  // 計算總金額（轉換為整數，ECPay 不接受小數）
  const totalAmount = Math.round(cart.total || 0)

  // 商品名稱（取購物車商品名稱，限制長度）
  const itemName = cart.items?.map(item => item.product_title).join(',').substring(0, 200) ?? '購物車商品'

  // ecpay API URL
  const ecpayAPI = process.env.NEXT_PUBLIC_ECPAY_ACTION_URL ?? "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"

  // ecpay在完成付款後callback的網址，這裡要指向medusa ecpay 轉換器
  const returnURL = process.env.NEXT_PUBLIC_ECPAY_RETURN_URL ?? ""
  // const returnURL = ""

  // 特店代號
  const merchantID = process.env.NEXT_PUBLIC_ECPAY_MERCHANT_ID ?? ""

  // hash key
  const hashKey = process.env.NEXT_PUBLIC_ECPAY_HASH_KEY ?? ""

  // hash iv
  const hashIV = process.env.NEXT_PUBLIC_ECPAY_HASH_IV ?? ""


  let initError:Error|null = null

  if (returnURL === ""){
    initError = new Error("missing ECPay return URL")
  }

  if (merchantID === ""){
    initError = new Error("missing ECPay merchant ID")
  }

  if (hashKey === ""){
    initError = new Error("missing ECPay hash key")
  }

  if (hashIV === ""){
    initError = new Error("missing ECPay hash iv")
  }

  if (initError){
    console.error(action,initError)
  }

  const [errorMessage, setErrorMessage] = useState<string | null>(initError?.message ?? null)
  
  const tradeNo = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join("");

  const paymentData: PaymentData = new PaymentData();

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

  paymentData.setChoosePayment("Credit")
  
  paymentData.setEncryptType("1")

  paymentData.setNeedExtraPaidInfo("Y")

  const submitHandler = () => {

    try{

      sdk.store.cart.complete(cart.id).then((data) => {

        if (data.type === "cart" && data.cart) {
          // 發生錯誤
          console.error(data.error)
          throw new Error(data.error?.message || "無法建立訂單，請稍後再試")

        } else if (data.type === "order" && data.order) {

          console.log("order pleaced : ",data.order)

          console.log("order ID : ",data.order.id)

          const orderID: string = data.order.id

          // 清除 cart id
          removeCartIdClient()

          // "使用者"付款完成後返回的網址

          const clientBackURL = `${window.location.origin}/order/${orderID}/confirmed`

          paymentData.setClientBackURL(clientBackURL)

          paymentData.setCustomField2(data.order.id)

          paymentData.setCustomField3(paymentCollection.id)

          paymentData.setCustomField4(paymentSessionID)

          const params:URLSearchParams = paymentData.getDataParams();

          // 建立隱藏表單
          const form = document.createElement('form')
          form.method = 'POST'
          form.action = ecpayAPI
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
          
        }

      })
      
    }catch(error){
      console.log(action,"error:",error)
      setErrorMessage("發生錯誤，請稍後再試")
    }

  }
  

  return !errorMessage ? (
    <Button onClick={submitHandler} size="large" data-testid={dataTestId} >
      前往 ECPay 付款
    </Button>
  ):<ErrorMessage error={errorMessage} data-testid="ecpay-error" />;
}

export default ECPayPaymentButton

