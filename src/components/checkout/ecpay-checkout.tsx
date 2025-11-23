import React from "react"

interface EcpayCheckoutProps {
  cart?: any
  onSuccess?: () => void
  onError?: (error: any) => void
}

const EcpayCheckout: React.FC<EcpayCheckoutProps> = () => {
  const handlePayment = () => {
    // ECPay 支付邏輯
    // console.log("Processing ECPay payment for cart:", cart?.id)
  }

  return (
    <div className="ecpay-checkout">
      <button 
        onClick={handlePayment}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        使用 ECPay 結帳
      </button>
    </div>
  )
}

export default EcpayCheckout
