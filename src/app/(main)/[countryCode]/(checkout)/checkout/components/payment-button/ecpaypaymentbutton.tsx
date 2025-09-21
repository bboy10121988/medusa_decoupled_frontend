"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@medusajs/ui"
import ErrorMessage from "../error-message"
import { HttpTypes } from "@medusajs/types"
import { placeOrder } from "@lib/data/cart"
import { PaymentData } from "../../../../internal/ecpayments"
import { de, id } from "date-fns/locale"

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

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(defaultError)


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
    setErrorMessage("missing ECPay return URL")
  }

  if (merchantID === ""){
    setErrorMessage("missing ECPay merchant ID")
  }

  if (hashKey === ""){
    setErrorMessage("missing ECPay hash key")
  }

  if (hashIV === ""){
    setErrorMessage("missing ECPay hash iv")
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

  data.setChoosePayment("ALL")
  
  data.setEncryptType("1")

  data.setCustomField3("cart_id")

  data.setCustomField4(cart.id)

  const params:URLSearchParams = data.getDataParams();
  
  

  // const handleSubmit = async(e:React.FormEvent) => {

  //    e.preventDefault() // 阻止預設提交行為


  //   try{

  //     // const data = await placeOrder(cart.id)

  //     // console.log("place order:",data)

  //     const form = e.target as HTMLFormElement

  //     form.submit()

  //   }catch(err:any){
  //     setErrorMessage(err.message || err)
  //   }

  // }



  return !errorMessage ? (
    <>
      <form 
        method="POST" 
        action={ecpayAPI}
        target="_blank"
        encType="application/x-www-form-urlencoded"
      >
        
        {Array.from(params.entries()).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        
        <Button
          type="submit"
          disabled={notReady || submitting}
          size="large"
          isLoading={submitting}
          data-testid={dataTestId}
        >
          {submitting ? "處理中..." : "前往 ECPay 付款"}
        </Button>
      </form>
      
      
    </>
  ):(
    <ErrorMessage error={errorMessage} data-testid="ecpay-payment-error-message" />
  );
}

export default ECPayPaymentButton

