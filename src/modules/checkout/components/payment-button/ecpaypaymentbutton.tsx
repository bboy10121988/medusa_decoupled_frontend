"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@medusajs/ui"
import ErrorMessage from "../error-message"
import { HttpTypes } from "@medusajs/types"
import { placeOrder } from "@lib/data/cart"
import { PaymentData } from "internal/ecpayments/paymentdata"
import { id } from "date-fns/locale"

type Props = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

const ECPayPaymentButton: React.FC<Props> = ({ cart, notReady, "data-testid": dataTestId }) => {

  const action:string = "ECPayPaymentButton"

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const idArr = cart.id.split('_')
  const cartID = idArr.length > 1 ? idArr[1] : cart.id
  

  // 計算總金額（轉換為整數，ECPay 不接受小數）
  const totalAmount = Math.round(cart.total || 0)

  // 商品名稱（取購物車商品名稱，限制長度）
  const itemName = cart.items?.map(item => item.product_title).join(',').substring(0, 200) || '購物車商品'

  // 返回網址
  const returnURL = `${window.location.origin}/api/ecpay/return`
  const orderResultURL = `${window.location.origin}/order/confirmed`
  const clientBackURL = `${window.location.origin}/checkout`

  const tradeNo = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join("");


  let data: PaymentData = new PaymentData();

  data.setHashKey("pwFHCqoQZGmho4w6")

  data.setHashIV("EkRm7iFT261dpevs")

  data.setMerchantID("3002607");

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

  const params:URLSearchParams = data.getDataParams();
  
  
  console.log(action,"payment params:",params)

  params.forEach((value, key) => {
    console.log(key, value)
  })



  return (
    <>
      <form 
        method="POST" 
        action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5" 
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
      
      <ErrorMessage
        error={errorMessage}
        data-testid="ecpay-payment-error-message"
      />
    </>
  )
}

export default ECPayPaymentButton

