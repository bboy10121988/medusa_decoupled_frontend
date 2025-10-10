import { NextRequest, NextResponse } from "next/server"
import { setAuthToken } from "@lib/data/cookies"

// 簡單的 JWT 解碼函數 
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    
    const decodedData = Buffer.from(base64, 'base64').toString('utf8')
    return JSON.parse(decodedData)
  } catch (error) {
    console.error('JWT 解碼失敗:', error)
    return null
  }
}

type GoogleJWTPayload = {
  email: string
  name?: string
  given_name?: string
  family_name?: string
  picture?: string
  sub?: string
}

type EnsureCustomerParams = {
  baseUrl: string
  publishableKey?: string
  token: string
  payload: GoogleJWTPayload
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function ensureMedusaCustomer({
  baseUrl,
  publishableKey,
  token,
  payload,
}: EnsureCustomerParams) {
  const authHeaders: Record<string, string> = {
    authorization: `Bearer ${token}`,
  }

  if (publishableKey) {
    authHeaders["x-publishable-api-key"] = publishableKey
  }

  const tryFetchCustomer = async () => {
    try {
      const meResponse = await fetch(`${baseUrl}/store/customers/me`, {
        method: "GET",
        headers: authHeaders,
        cache: "no-store",
      })

      if (meResponse.ok) {
        const meData = await meResponse.json()
        console.log("✅ 已取得現有客戶資料:", {
          id: meData?.customer?.id,
          email: meData?.customer?.email,
        })
        return meData?.customer ?? null
      }

      console.warn("⚠️ 無法直接取得客戶資料:", {
        status: meResponse.status,
      })
    } catch (error) {
      console.error("❌ 取得客戶資料時發生錯誤:", error)
    }

    return null
  }

  // 先嘗試取得客戶資料（最多重試 3 次）
  for (let attempt = 0; attempt < 3; attempt++) {
    const existingCustomer = await tryFetchCustomer()
    if (existingCustomer) {
      return existingCustomer
    }

    await wait(150)
  }

  // 若沒有客戶資料，嘗試建立
  const customerPayload: Record<string, string> = {
    email: payload.email,
  }

  const firstName =
    payload.given_name ||
    payload.name?.split(" ").slice(0, -1).join(" ") ||
    payload.name?.split(" ")[0]

  const lastName =
    payload.family_name ||
    payload.name?.split(" ").slice(-1).join(" ") ||
    payload.email.split("@")[0] ||
    ""

  if (firstName) {
    customerPayload.first_name = firstName
  }

  if (lastName) {
    customerPayload.last_name = lastName
  }

  if (!customerPayload.first_name) {
    customerPayload.first_name = "Google"
  }

  if (!customerPayload.last_name) {
    customerPayload.last_name = "User"
  }

  try {
    const createResponse = await fetch(`${baseUrl}/store/customers`, {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerPayload),
    })

    if (createResponse.ok) {
      const createData = await createResponse.json()
      console.log("✅ 成功建立客戶資料:", {
        id: createData?.customer?.id,
        email: createData?.customer?.email,
      })
      return createData?.customer ?? null
    }

    if (createResponse.status === 409) {
      console.warn("⚠️ 客戶已存在，重新嘗試取得資料")
      const retryResponse = await fetch(`${baseUrl}/store/customers/me`, {
        method: "GET",
        headers: authHeaders,
        cache: "no-store",
      })

      if (retryResponse.ok) {
        const retryData = await retryResponse.json()
        console.log("✅ 重新取得客戶資料成功:", {
          id: retryData?.customer?.id,
          email: retryData?.customer?.email,
        })
        return retryData?.customer ?? null
      }

      console.error("❌ 重新取得客戶資料仍失敗:", {
        status: retryResponse.status,
      })
    } else {
      const errorText = await createResponse.text()
      console.error("❌ 建立客戶資料失敗:", {
        status: createResponse.status,
        error: errorText,
      })
    }
  } catch (error) {
      console.error("❌ 建立客戶資料時發生錯誤:", error)
  }

  // 建立失敗時最後再嘗試抓取一次
  for (let attempt = 0; attempt < 3; attempt++) {
    const fallbackCustomer = await tryFetchCustomer()
    if (fallbackCustomer) {
      return fallbackCustomer
    }

    await wait(150)
  }

  return null
}

/**
 * Google Identity Services (GIS) 登入處理
 * 恢復 JWT 版本：已驗證可以成功的版本
 */
export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json(
        { success: false, message: "缺少 Google 登入憑證" },
        { status: 400 }
      )
    }

    console.log("🔐 處理 Google Identity Services 登入 (JWT 版本):", {
      hasCredential: !!credential,
      timestamp: new Date().toISOString()
    })

    // 從 JWT 中提取用戶資訊
    const jwtPayload = decodeJWT(credential)
    if (!jwtPayload?.email) {
      return NextResponse.json(
        { success: false, message: "無法解析 Google 憑證" },
        { status: 400 }
      )
    }

    console.log("✅ JWT 解析成功:", {
      email: jwtPayload.email,
      name: jwtPayload.name,
      sub: jwtPayload.sub
    })

    // 配置
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

    console.log("🔍 嘗試 Google 用戶認證:", { email: jwtPayload.email, baseUrl, hasKey: !!publishableKey })

    let authData
    let isNewUser = false
    let customerData = null

    // 使用固定的密碼策略 - Google 用戶的 sub ID
    const password = `google_user_${jwtPayload.sub}`

    // 首先嘗試註冊
    const registerResponse = await fetch(`${baseUrl}/auth/customer/emailpass/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey || '',
      },
      body: JSON.stringify({
        email: jwtPayload.email,
        password: password,
      }),
    })

    console.log("📡 註冊回應狀態:", registerResponse.status)
    
    if (registerResponse.ok) {
      authData = await registerResponse.json()
      isNewUser = true
      console.log("✅ 註冊成功:", authData)
    } else if (registerResponse.status === 400 || registerResponse.status === 401 || registerResponse.status === 422) {
      // 用戶可能已存在，嘗試登入
      console.log("⚠️ 註冊失敗，可能用戶已存在，嘗試登入...")
      
      const loginResponse = await fetch(`${baseUrl}/auth/customer/emailpass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': publishableKey || '',
        },
        body: JSON.stringify({
          email: jwtPayload.email,
          password: password,
        }),
      })

      console.log("📡 登入回應狀態:", loginResponse.status)
      
      if (loginResponse.ok) {
        authData = await loginResponse.json()
        console.log("✅ 登入成功:", authData)
      } else {
        const loginError = await loginResponse.text()
        console.error("❌ 登入失敗:", loginError)
        return NextResponse.json({
          success: false,
          message: "Google 用戶認證失敗",
          details: loginError,
          statusCode: loginResponse.status
        }, { status: loginResponse.status })
      }
    } else {
      const errorText = await registerResponse.text()
      console.error("❌ 註冊錯誤:", errorText)
      return NextResponse.json({
        success: false,
        message: "會員註冊失敗",
        details: errorText,
        statusCode: registerResponse.status
      }, { status: registerResponse.status })
    }

    // 設置認證 token cookie
    if (authData.token) {
      customerData =
        authData.customer ||
        (await ensureMedusaCustomer({
          baseUrl,
          publishableKey,
          token: authData.token,
          payload: jwtPayload as GoogleJWTPayload,
        }))

      console.log('🍪 設置認證 token 到 cookie:', {
        hasToken: !!authData.token,
        tokenLength: authData.token?.length || 0,
        tokenPreview: authData.token ? `${authData.token.substring(0, 50)}...` : null
      })
      await setAuthToken(authData.token)
      console.log('✅ Cookie 設置完成')
      
      // 重新驗證客戶快取
      const { revalidateTag } = await import('next/cache')
      const { getCacheTag } = await import('@lib/data/cookies')
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      console.log('🔄 客戶快取已重新驗證')
    } else {
      console.warn('⚠️ 無法設置 cookie：缺少 token')
      return NextResponse.json({
        success: false,
        message: "登入成功但缺少授權令牌",
      }, { status: 500 })
    }

    // 返回成功回應
    return NextResponse.json({
      success: true,
      message: `歡迎，${jwtPayload.name || jwtPayload.email}！Google ${isNewUser ? '註冊' : '登入'}成功`,
      token: authData.token,
      email: jwtPayload.email,
      customer: customerData,
      user: {
        email: jwtPayload.email,
        name: jwtPayload.name,
        given_name: jwtPayload.given_name,
        family_name: jwtPayload.family_name,
        picture: jwtPayload.picture,
        sub: jwtPayload.sub
      },
      isNewUser
    })

  } catch (error) {
    console.error('❌ Google 登入處理錯誤:', error)
    return NextResponse.json({
      success: false,
      message: "登入處理失敗",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
