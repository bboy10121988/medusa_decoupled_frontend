import { NextResponse } from "next/server"
import { MEDUSA_BACKEND_URL } from "@lib/config"

/**
 * API 路由處理程序 - 檢查 Medusa 後端連接狀態
 */
export async function GET() {
  try {
    const baseUrl = MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    
    // 檢查 Medusa 後端是否可訪問
    const response = await fetch(`${baseUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    
    if (!response.ok) {
      return NextResponse.json({
        status: "error",
        message: "Medusa backend is not responding correctly",
        medusaStatus: response.status,
        medusaUrl: baseUrl
      }, { status: 500 })
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      status: "success",
      message: "Connected to Medusa backend",
      medusaStatus: response.status,
      medusaHealth: data,
      medusaUrl: baseUrl
    })
  } catch (error) {
    console.error("Error checking Medusa backend:", error)
    
    return NextResponse.json({
      status: "error",
      message: "Failed to connect to Medusa backend",
      error: error instanceof Error ? error.message : "Unknown error",
      medusaUrl: MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    }, { status: 500 })
  }
}
