"use client"

import { HttpTypes } from "@medusajs/types"
import React from "react"
import ECPayPaymentButton from "./ecpaypaymentbutton"
import BankTransferPaymentButton from "./banktransferpaymentbutton"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {

  const action:string = "PaymentButton"

  // 這裡一但判斷不符合條件，就直接回傳錯誤訊息，避免後續程式碼執行：notReady參數可以直接砍掉
  if (
    !cart?.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1
  ){
    return <ErrorMessage error="請先完成前置步驟" data-testid="payment-not-ready-error" />
  }
  
  // 保持單一資料來源
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  ) ?? cart.payment_collection?.payment_sessions?.[0]

  // console.log("paymentSession:",paymentSession)

  const providerId = paymentSession?.provider_id

  // console.log(action, "支付方式選擇:", {
    // paymentSessionProvider: paymentSession?.provider_id,
    // finalProviderId: providerId
  // })

  // 根據支付方式渲染對應的按鈕
  switch(providerId){
    case process.env.NEXT_PUBLIC_PAYMENT_METHOD_ECPAY_CREDIT:
      return <ECPayPaymentButton cart={cart} notReady={false} data-testid={dataTestId} />;
    case process.env.NEXT_PUBLIC_PAYMENT_METHOD_DEFAULT:
      return <BankTransferPaymentButton notReady={false} cart={cart} data-testid={dataTestId} />;
    default:
      return <ErrorMessage error="不支援的支付方式" data-testid="payment-unsupported-error" />
  }
  
}

// 其餘子按鈕（Stripe、BankTransfer、Manual）已拆分到個別檔案。

export default PaymentButton
