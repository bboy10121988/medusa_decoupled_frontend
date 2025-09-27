/**
 * 
 * Note !!! 已棄用
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

"use client"
// 目前這份檔案沒有用到
import React, { useState } from "react"
import { Button } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { PaymentData } from "@/internal/ecpayments"
import { sub } from "date-fns"

type Props = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

const ECPayPaymentButton: React.FC<Props> = ({ cart, notReady, "data-testid": dataTestId }) => {

  const action:string = "ECPayPaymentButton"

  let defaultError:string | null = null

  const paymentSessions = cart.payment_collection?.payment_sessions

  let paymentSessionID = ""

  if (!paymentSessions || paymentSessions.length === 0){
    defaultError = "尚未建立支付會話"
  }else{
    paymentSessionID = paymentSessions[0].id
  }

  console.log(action,"payment session id",paymentSessionID)

  const [submitting] = useState(false)
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




  // "使用者"付款完成後返回的網址
  const clientBackURL = `${window.location.origin}/order/confirmed`

  const tradeNo = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join("");

  let data: PaymentData = new PaymentData();

  data.setHashKey(hashKey)

  data.setHashIV(hashIV)

  data.setMerchantID(merchantID);

  data.setMerchantTradeNo(tradeNo.toString())

  data.setMerchantTradeDate(new Date().toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Taipei'
  }).replace(/\//g, '/').replace(',', ''))

  data.setPaymentType("aio")

  data.setTotalAmount(totalAmount)

  data.setTradeDesc("商品購買")

  data.setItemName(itemName)

  data.setReturnURL(returnURL)

  data.setClientBackURL(clientBackURL)

  data.setChoosePayment("ALL")
  
  data.setEncryptType("1")

  data.setCustomField3("cart_id")

  data.setCustomField4(cart.id)

  const params:URLSearchParams = data.getDataParams();

  if (errorMessage){
    console.log(action,"error:",errorMessage)
  }

  const submitHandler = () => {

    if (errorMessage){  
      return
    }

    // 建立隱藏表單
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = ecpayAPI
    form.target = '_blank' // 開啟新視窗
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


  return !errorMessage ? (
    <Button
      onClick={submitHandler}
      disabled={notReady || submitting}
      size="large"
      isLoading={submitting}
      data-testid={dataTestId}
    >
        {submitting ? "處理中..." : "前往 ECPay 付款223"}
    </Button>
    // <form 
    //   method="POST" 
    //   action={ecpayAPI}
    //   target="_blank"
    //   encType="application/x-www-form-urlencoded"
    // >
      
    //   {Array.from(params.entries()).map(([key, value]) => (
    //     <input key={key} type="hidden" name={key} value={value} />
    //   ))}
      
    //   <Button
    //     type="submit"
    //     disabled={notReady || submitting}
    //     size="large"
    //     isLoading={submitting}
    //     data-testid={dataTestId}
    //   >
    //     {submitting ? "處理中..." : "前往 ECPay 付款"}
    //   </Button>
    // </form>
  ):null;
}

export default ECPayPaymentButton

