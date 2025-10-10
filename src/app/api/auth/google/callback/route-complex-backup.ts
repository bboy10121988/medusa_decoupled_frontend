import { NextRequest, NextResponse } from "next/server"
import Medusa from "@medusajs/js-sdk"
import { revalidateTag } from "next/cache"
import { getApiConfig } from "@lib/config"
import { getCartId, setAuthToken, getCacheTag } from "@lib/data/cookies"

type JwtPayload = Record<string, any> | null

const parseJwt = (token: string): JwtPayload => {
  try {
    const [, payload] = token.split(".")
    if (!payload) {
      return null
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = Buffer.from(normalized, "base64").toString("utf8")
    return JSON.parse(decoded)
  } catch (error) {
    console.error("解析 Google OAuth token 時發生錯誤:", error)
    return null
  }
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const tryParseJSON = (value: any) => {
  if (typeof value !== "string") {
    return null
  }

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const findEmailInValue = (value: any, depth = 0): string | null => {
  if (!value || depth > 5) {
    return null
  }

  if (typeof value === "string") {
    if (emailRegex.test(value)) {
      return value
    }

    const parsed = tryParseJSON(value)
    if (parsed) {
      return findEmailInValue(parsed, depth + 1)
    }

    return null
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const email = findEmailInValue(item, depth + 1)
      if (email) {
        return email
      }
    }
    return null
  }

  if (typeof value === "object") {
    for (const key of Object.keys(value)) {
      const email = findEmailInValue(value[key], depth + 1)
      if (email) {
        return email
      }
    }
  }

  return null
}

const exchangeGoogleCode = async (
  code: string,
  redirectUri: string | undefined
) => {
  const clientId =
    process.env.GOOGLE_CLIENT_ID_LOCAL ||
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    ""
  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET_LOCAL ||
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET ||
    ""

  if (!clientId || !clientSecret || !redirectUri) {
    return null
  }

  try {
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    })

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      console.warn("Google token exchange failed:", {
        status: response.status,
        error: errorBody.error || response.statusText,
      })
      return null
    }

    return response.json() as Promise<{
      id_token?: string
      access_token?: string
    }>
  } catch (error) {
    console.error("交換 Google token 失敗:", error)
    return null
  }
}

const extractProfile = (payload: Record<string, any> | null) => {
  if (!payload) {
    return { email: null, firstName: "", lastName: "" }
  }

  const email =
    payload.email ||
    payload.data?.email ||
    payload.user?.email ||
    payload.profile?.email ||
    payload.emailAddress ||
    findEmailInValue(payload) ||
    null

  let firstName =
    payload.given_name ||
    payload.first_name ||
    payload.data?.given_name ||
    payload.user?.given_name ||
    payload.profile?.given_name ||
    ""

  let lastName =
    payload.family_name ||
    payload.last_name ||
    payload.data?.family_name ||
    payload.user?.family_name ||
    payload.profile?.family_name ||
    ""

  if ((!firstName || !lastName) && typeof payload.name === "string") {
    const [first, ...rest] = payload.name.trim().split(" ")
    if (!firstName) {
      firstName = first ?? ""
    }
    if (!lastName) {
      lastName = rest.join(" ")
    }
  }

  return { email, firstName, lastName }
}

const createSdkClient = () => {
  const config = getApiConfig()
  return {
    client: new Medusa({
      baseUrl: config.baseUrl,
      publishableKey: config.publishableKey,
    }),
    publishableKey: config.publishableKey,
  }
}

const fetchCurrentCustomer = async (medusa: Medusa) => {
  try {
    const { customer } = await medusa.store.customer.retrieve()
    return customer
  } catch {
    return null
  }
}

const extractEmailFromAuthIdentity = (authIdentity: any): string | null => {
  if (!authIdentity) {
    return null
  }

  const possibleEmail =
    authIdentity.user_metadata?.email ||
    authIdentity.provider_metadata?.email ||
    authIdentity.data?.email ||
    authIdentity.app_metadata?.email ||
    findEmailInValue(authIdentity) ||
    null

  if (typeof possibleEmail === "string" && possibleEmail.length > 0) {
    return possibleEmail
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const {
      code,
      state,
      redirect_uri: providedRedirectUri,
    } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "缺少授權碼",
        },
        { status: 400 }
      )
    }

    const { client: medusa, publishableKey } = createSdkClient()
    const callbackParams: Record<string, string> = { code }
    if (typeof state === "string" && state.length > 0) {
      callbackParams.state = state
    }

    const token = await medusa.auth.callback("customer", "google", callbackParams)

    if (typeof token !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Google OAuth 驗證失敗，請重新嘗試",
        },
        { status: 401 }
      )
    }

    let tokenToPersist = token
    await setAuthToken(tokenToPersist)

    const payload = parseJwt(token)
    let customerCreated = false

    const { email: payloadEmail, firstName, lastName } = extractProfile(payload)

    const guessedRedirectUri =
      providedRedirectUri ||
      process.env.GOOGLE_CALLBACK_URL ||
      `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/tw/auth/google/callback`

    let customer = await fetchCurrentCustomer(medusa)
    let derivedEmail = payloadEmail

    let authIdentityInfo: any = null
    try {
      authIdentityInfo = await medusa.auth.retrieve()
    } catch (identityError) {
      console.warn("取得 Medusa auth identity 失敗:", identityError)
    }

    if (!derivedEmail) {
      const fallbackEmail = extractEmailFromAuthIdentity(authIdentityInfo?.auth_identity)

      if (fallbackEmail) {
        derivedEmail = fallbackEmail
      } else if (authIdentityInfo?.auth_identity?.provider_metadata?.profile?.email) {
        derivedEmail = authIdentityInfo.auth_identity.provider_metadata.profile.email
      }
    }

    if (!derivedEmail) {
      const googleTokenData = await exchangeGoogleCode(code, guessedRedirectUri)

      if (googleTokenData?.id_token && !derivedEmail) {
        const decoded = parseJwt(googleTokenData.id_token)
        if (decoded?.email && emailRegex.test(decoded.email)) {
          derivedEmail = decoded.email
        }
      }

      if (googleTokenData?.access_token && !derivedEmail) {
        try {
          const userinfoResp = await fetch(
            "https://openidconnect.googleapis.com/v1/userinfo",
            {
              headers: {
                Authorization: `Bearer ${googleTokenData.access_token}`,
              },
            }
          )

          if (userinfoResp.ok) {
            const userinfo = await userinfoResp.json()
            if (userinfo?.email && emailRegex.test(userinfo.email)) {
              derivedEmail = userinfo.email
            }
          } else {
            console.warn("Google userinfo 取得失敗", {
              status: userinfoResp.status,
            })
          }
        } catch (userinfoError) {
          console.warn("呼叫 Google userinfo 發生錯誤:", userinfoError)
        }
      }
    }

    if (!payload?.actor_id) {
      if (!derivedEmail) {
        console.error("無法從 Google OAuth 資料推導 email", {
          payloadKeys: payload ? Object.keys(payload) : null,
          authIdentityHasData: !!authIdentityInfo?.auth_identity,
        })
        return NextResponse.json(
          {
            success: false,
            message: "授權資料缺少 email，無法建立會員",
          },
          { status: 400 }
        )
      }

      const { customer: created } = await medusa.store.customer.create({
        email: derivedEmail,
        first_name: firstName || "Google",
        last_name: lastName || "使用者",
        metadata: {
          auth_provider: "google",
          google_entity_id: payload?.sub,
          google_email: derivedEmail,
        },
      })

      customerCreated = true
      customer = created

      const refreshedToken = await medusa.auth.refresh()

      if (typeof refreshedToken !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "刷新登入憑證失敗",
          },
          { status: 500 }
        )
      }

      tokenToPersist = refreshedToken
      await setAuthToken(tokenToPersist)

      try {
        customer = await fetchCurrentCustomer(medusa)
      } catch {
        // ignore
      }
    } else if (!derivedEmail) {
      const tokenDataEmail =
        authIdentityInfo?.auth_identity?.provider_metadata?.email ??
        authIdentityInfo?.auth_identity?.user_metadata?.email ??
        authIdentityInfo?.auth_identity?.data?.email ??
        null

      if (tokenDataEmail) {
        derivedEmail = tokenDataEmail
      }
    }

    if (!customer) {
      customer = await fetchCurrentCustomer(medusa)
    }

    if (customer && derivedEmail && customer.email !== derivedEmail) {
      try {
        const updatePayload: Record<string, any> = {
          email: derivedEmail,
          metadata: {
            ...(customer.metadata || {}),
            auth_provider: "google",
            google_entity_id: payload?.sub,
            google_email: derivedEmail,
          },
        }

        if (!customer.first_name && firstName) {
          updatePayload.first_name = firstName
        }

        if (!customer.last_name && lastName) {
          updatePayload.last_name = lastName
        }

        const { customer: updatedCustomer } = await medusa.store.customer.update(updatePayload)
        customer = updatedCustomer
      } catch (updateError) {
        console.warn("同步 Google Email 至客戶資料失敗:", updateError)
      }
    } else if (customer && customer.metadata) {
      const shouldSyncMetadata =
        customer.metadata.auth_provider !== "google" ||
        customer.metadata.google_email !== email ||
        customer.metadata.google_entity_id !== payload?.sub

      if (shouldSyncMetadata) {
        try {
          const { customer: updatedCustomer } = await medusa.store.customer.update({
            metadata: {
              ...(customer.metadata || {}),
              auth_provider: "google",
              google_entity_id: payload?.sub,
              google_email: email,
            },
          })
          customer = updatedCustomer
        } catch (metadataError) {
          console.warn("更新客戶 Google metadata 失敗:", metadataError)
        }
      }
    } else if (!customer && derivedEmail) {
      try {
        await medusa.store.customer.update({
          metadata: {
            auth_provider: "google",
            google_entity_id: payload?.sub,
            google_email: derivedEmail,
          },
        })
      } catch (metadataError) {
        console.warn("為登入者更新 Google metadata 失敗:", metadataError)
      }
    }

    try {
      const customerTag = await getCacheTag("customers")
      if (customerTag) {
        revalidateTag(customerTag)
      }
      const cartTag = await getCacheTag("carts")
      if (cartTag) {
        revalidateTag(cartTag)
      }
    } catch (cacheError) {
      console.warn("重新驗證客戶/購物車 cache 失敗:", cacheError)
    }

    // 嘗試轉移匿名購物車
    try {
      const cartId = await getCartId()

      if (cartId) {
        const headers: Record<string, string> = {
          authorization: `Bearer ${tokenToPersist}`,
        }

        if (publishableKey) {
          headers["x-publishable-api-key"] = publishableKey
        }

        await medusa.store.cart.transferCart(cartId, {}, headers)
      }
    } catch (cartError) {
      console.warn("Google OAuth 登入後轉移購物車失敗:", cartError)
    }

    return NextResponse.json({
      success: true,
      customerCreated,
      email: customer?.email ?? derivedEmail ?? payloadEmail ?? null,
    })
  } catch (error: any) {
    console.error("Google OAuth callback 錯誤:", error)

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Google OAuth 登入失敗，請稍後再試",
      },
      { status: 500 }
    )
  }
}
