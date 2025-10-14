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

  const notReady =
    !cart?.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  if (notReady){
    return <ErrorMessage error="請先完成前置步驟" data-testid="payment-not-ready-error" />
  }
  
  // 從 metadata 或 payment_session 中獲取支付方式
  const selectedPaymentProvider = cart.metadata?.selected_payment_provider
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  ) || cart.payment_collection?.payment_sessions?.[0]

  const providerId = selectedPaymentProvider || paymentSession?.provider_id

  console.log(action, "支付方式選擇:", { 
    selectedPaymentProvider, 
    paymentSessionProvider: paymentSession?.provider_id,
    finalProviderId: providerId 
  })

  // 根據支付方式渲染對應的按鈕
  switch(providerId){
    case "ecpay_credit_card":
      return <ECPayPaymentButton cart={cart} notReady={notReady} data-testid={dataTestId} />;
    case "manual_manual":
    default:
      return <BankTransferPaymentButton notReady={notReady} cart={cart} data-testid={dataTestId} />;
  }  

}

// 其餘子按鈕（Stripe、BankTransfer、Manual）已拆分到個別檔案。

export default PaymentButton
