import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { retrieveCustomer } from "@lib/data/customer"
import { sdk } from "@/lib/config"

export async function GET(_request: NextRequest) {
  try {
    // console.log("🔍 API: /api/auth/customer - 開始認證診斷")
    
    const cookieStore = await cookies()
    const token = cookieStore.get("_medusa_jwt")?.value
    
    // console.log("🔑 API: JWT Token 狀態", {
      // hasToken: !!token,
      // tokenLength: token?.length || 0,
      // tokenPreview: token ? `${token.substring(0, 30)}...` : null
    // })
    
    // 方法 1: 使用 retrieveCustomer 函數
    try {
      // console.log("📡 API: 方法 1 - 使用 retrieveCustomer")
      const customer = await retrieveCustomer()
      
      if (customer) {
        // console.log("✅ API: retrieveCustomer 成功", {
          // customerId: customer.id,
          // email: customer.email
        // })
        
        return NextResponse.json({ 
          authenticated: true,
          customer,
          method: "retrieveCustomer",
          hasToken: !!token
        })
      }
    } catch (retrieveError) {
      // console.log("❌ API: retrieveCustomer 失敗", retrieveError)
    }

    // 方法 2: 直接使用 SDK (如果有 token)
    if (token) {
      try {
        // console.log("📡 API: 方法 2 - 直接使用 SDK")
        
        // 設置 token 到 SDK (使用私有方法)
        ;(sdk.auth as any).setToken_(token)
        
        const { customer } = await sdk.store.customer.retrieve()
        
        if (customer) {
          // console.log("✅ API: SDK 直接調用成功", {
            // customerId: customer.id,
            // email: customer.email
          // })
          
          return NextResponse.json({ 
            authenticated: true,
            customer,
            method: "sdk_direct",
            hasToken: true
          })
        }
      } catch (sdkError) {
        // console.log("❌ API: SDK 直接調用失敗", sdkError)
      }
    }

    // 如果都失敗了
    // console.log("❌ API: 所有方法都失敗")
    return NextResponse.json({ 
      authenticated: false,
      customer: null,
      hasToken: !!token,
      error: "All authentication methods failed"
    }, { status: 401 })

  } catch (error) {
    // console.error("❌ API: 認證檢查失敗:", error)
    return NextResponse.json({ 
      authenticated: false,
      customer: null,
      error: "Authentication check failed"
    }, { status: 500 })
  }
}
