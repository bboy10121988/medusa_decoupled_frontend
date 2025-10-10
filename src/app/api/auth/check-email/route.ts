import { NextRequest, NextResponse } from "next/server"
import Medusa from "@medusajs/js-sdk"
import { getApiConfig } from "@lib/config"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        {
          exists: false,
          authProvider: null,
          message: "請提供有效的電子郵件",
        },
        { status: 400 }
      )
    }

    const adminToken = process.env.MEDUSA_ADMIN_TOKEN

    if (!adminToken) {
      return NextResponse.json({
        exists: false,
        authProvider: null,
        message: "無法檢查電子郵件，缺少管理員權杖",
      })
    }

    const medusa = new Medusa(getApiConfig())

    const { customers } = await medusa.client.fetch<{
      customers: Array<{ email: string; metadata?: Record<string, any> }>
    }>("/admin/customers", {
      query: {
        q: email,
        limit: 1,
      },
      headers: {
        "x-medusa-access-token": adminToken,
      },
    })

    const customer = customers?.find(
      (c) => c.email?.toLowerCase() === email.toLowerCase()
    )

    if (!customer) {
      return NextResponse.json({
        exists: false,
        authProvider: null,
        message: "此電子郵件尚未註冊",
      })
    }

    const authProvider =
      (customer.metadata?.auth_provider as string | undefined) || "password"

    return NextResponse.json({
      exists: true,
      authProvider,
      message: authProvider === "password" ? "此電子郵件可使用密碼登入" : `此電子郵件綁定 ${authProvider} 登入`,
    })
  } catch (error) {
    console.error("檢查電子郵件時發生錯誤:", error)
    return NextResponse.json({
      exists: false,
      authProvider: null,
      message: "暫時無法檢查電子郵件",
    })
  }
}
