"use client"

import { HttpTypes } from "@medusajs/types"
import React from "react"
import ECPayPaymentButton from "./ecpaypaymentbutton"
import BankTransferPaymentButton from "./banktransferpaymentbutton"

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
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  ) || cart.payment_collection?.payment_sessions?.[0]

  console.log(action, "paymentSession:", paymentSession)

  const providerId = paymentSession?.provider_id

  // return <ECPayPaymentButton cart={cart} notReady={notReady} data-testid={dataTestId} />;
  switch(providerId){
    case process.env.NEXT_PUBLIC_PAYMENT_METHOD_ECPAY_CREDIT:
      return <ECPayPaymentButton cart={cart} notReady={notReady} data-testid={dataTestId} />;
    default:
      return <BankTransferPaymentButton notReady={notReady} cart={cart} data-testid={dataTestId} />;
  }  

}

// 其餘子按鈕（Stripe、BankTransfer、Manual）已拆分到個別檔案。

export default PaymentButton
