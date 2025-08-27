import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { cart, customer, shippingAddress, shippingMethod, selectedStore } = await req.json()
    
    console.log('🧪 Testing cart data from frontend...')
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/ecpay/test-cart`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ 
          cart,
          customer,
          shippingAddress,
          shippingMethod,
          selectedStore
        }),
      }
    )

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("Cart test error:", error)
    return NextResponse.json(
      { error: "Cart test failed" },
      { status: 500 }
    )
  }
}
