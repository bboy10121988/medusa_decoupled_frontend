import { NextRequest, NextResponse } from 'next/server'import { NextRequest, NextResponse } from 'next/server'



export async function POST(request: NextRequest) {export async function POST(request: NextRequest) {

  try {  try {

    const { token } = await request.json()    const { token } = await request.json()



    if (!token) {    

      return NextResponse.json({ error: '需要 token' }, { status: 400 })

    }    if (!token) {  try {



    // 解析 JWT token      return NextResponse.json({ error: '需要 token' }, { status: 400 })

    const parseJwt = (token: string): Record<string, any> | null => {

      try {    }    const { token } = await request.json()export async function POST(request: NextRequest) {export async function POST(request: NextRequest) {

        const [, payload] = token.split(".")

        if (!payload) return null    



        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")    // 解析 JWT token    

        const decoded = decodeURIComponent(

          Buffer.from(normalized, 'base64')    const [, payload] = token.split(".")

            .toString('utf-8')

            .split("")    if (!payload) {    if (!token) {  try {  try {

            .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)

            .join("")      return NextResponse.json({ error: '無效的 JWT 格式' }, { status: 400 })

        )

    }      return NextResponse.json({ error: '需要 token' }, { status: 400 })

        const parsedPayload = JSON.parse(decoded)

        return parsedPayload

      } catch (error) {

        console.error('JWT 解析錯誤:', error)    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")    }    const { token } = await request.json()    const { token } = await request.json()

        return null

      }    const decoded = decodeURIComponent(

    }

      Buffer.from(normalized, 'base64')    

    const parsedPayload = parseJwt(token)

            .toString('utf-8')

    if (!parsedPayload) {

      return NextResponse.json({ error: '無效的 JWT 格式' }, { status: 400 })        .split("")    // 解析 JWT token        

    }

        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)

    // 嘗試從各種可能的位置提取 email

    let email = parsedPayload.email || ""        .join("")    const [, payload] = token.split(".")



    // 如果直接沒有 email，嘗試深度搜索    )

    if (!email) {

      const findEmail = (obj: any): string => {        if (!payload) {    if (!token) {    if (!token) {

        if (typeof obj === 'string' && obj.includes('@')) return obj

        if (typeof obj === 'object' && obj !== null) {    const parsedPayload = JSON.parse(decoded)

          for (const key in obj) {

            const result = findEmail(obj[key])          return NextResponse.json({ error: '無效的 JWT 格式' }, { status: 400 })

            if (result) return result

          }    // 從 JWT payload 提取 email 和使用者資訊

        }

        return ""    let email = parsedPayload.email || ""    }      return NextResponse.json({ error: '需要 token' }, { status: 400 })      return NextResponse.json({ error: '需要 token' }, { status: 400 })

      }

    const firstName = parsedPayload.given_name || parsedPayload.first_name || "Google"

      email = findEmail(parsedPayload)

    }    const lastName = parsedPayload.family_name || parsedPayload.last_name || "User"



    if (!email) {    const picture = parsedPayload.picture || ""

      return NextResponse.json({

        error: '無法從 JWT 中提取 email',        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")    }    }

        payload: parsedPayload

      }, { status: 400 })    // 如果直接欄位沒有 email，深度搜尋

    }

    if (!email) {    const decoded = decodeURIComponent(

    return NextResponse.json({

      success: true,      const findEmail = (obj: any): string => {

      email,

      payload: parsedPayload,        if (typeof obj === 'string' && obj.includes('@')) return obj      Buffer.from(normalized, 'base64')        

      debug: {

        hasEmail: !!parsedPayload.email,        if (obj && typeof obj === 'object') {

        emailVerified: parsedPayload.email_verified,

        allKeys: Object.keys(parsedPayload)          for (const key in obj) {        .toString('utf-8')

      }

    })            const result = findEmail(obj[key])



  } catch (error) {            if (result) return result        .split("")    // 解析 JWT token    // 解析 JWT token

    console.error('Google token 處理錯誤:', error)

    return NextResponse.json({           }

      error: '處理 token 時發生錯誤',

      details: error instanceof Error ? error.message : '未知錯誤'        }        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)

    }, { status: 500 })

  }        return ""

}
      }        .join("")    const [, payload] = token.split(".")    const [, payload] = token.split(".")

      email = findEmail(parsedPayload)

    }    )

    

    if (!email) {        if (!payload) {    if (!payload) {

      return NextResponse.json({ 

        error: '無法從 JWT 中提取 email',    const parsedPayload = JSON.parse(decoded)

        payload: parsedPayload

      }, { status: 400 })          return NextResponse.json({ error: '無效的 JWT 格式' }, { status: 400 })      return NextResponse.json({ error: '無效的 JWT 格式' }, { status: 400 })

    }

        // 簡化的 email 提取

    return NextResponse.json({

      email,    let email = parsedPayload.email || ""    }    }

      firstName,

      lastName,    let firstName = parsedPayload.given_name || parsedPayload.first_name || "Google"

      picture,

      hasEmail: !!email    let lastName = parsedPayload.family_name || parsedPayload.last_name || "User"

    })

        let picture = parsedPayload.picture || ""

  } catch (error) {

    return NextResponse.json({         const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")

      error: '解析 JWT 失敗',

      details: error instanceof Error ? error.message : String(error)    // 如果沒有 email，搜尋所有可能的位置

    }, { status: 500 })

  }    if (!email) {    const decoded = decodeURIComponent(    const decoded = decodeURIComponent(

}
      const findEmail = (obj: any): string => {

        if (typeof obj === 'string' && obj.includes('@')) return obj      Buffer.from(normalized, 'base64')      Buffer.from(normalized, 'base64')

        if (obj && typeof obj === 'object') {

          for (const key in obj) {        .toString('utf-8')        .toString('utf-8')

            const result = findEmail(obj[key])

            if (result) return result        .split("")        .split("")

          }

        }        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)

        return ""

      }        .join("")        .join("")

      email = findEmail(parsedPayload)

    }    )    )

    

    if (!email) {        

      return NextResponse.json({ 

        error: '無法從 JWT 中提取 email',    const parsedPayload = JSON.parse(decoded)    const parsedPayload = JSON.parse(decoded)

        payload: parsedPayload

      }, { status: 400 })        

    }

        // 多層級的 email 提取策略    // 從 JWT payload 中提取用戶資訊

    return NextResponse.json({

      email,    let email = ""    let email = ""

      firstName,

      lastName,    let firstName = ""    let firstName = ""

      picture,

      hasEmail: !!email    let lastName = ""    let lastName = ""

    })

        let picture = ""    let picture = ""

  } catch (error) {

    return NextResponse.json({         

      error: '解析前端 JWT 失敗',

      details: error instanceof Error ? error.message : String(error)    // 策略 1: 直接從根層級獲取    // 首先嘗試最直接的路徑

    }, { status: 500 })

  }    email = parsedPayload.email    email = parsedPayload.email || ""

}
    firstName = parsedPayload.given_name || parsedPayload.first_name    firstName = parsedPayload.given_name || parsedPayload.first_name || ""

    lastName = parsedPayload.family_name || parsedPayload.last_name    lastName = parsedPayload.family_name || parsedPayload.last_name || ""

    picture = parsedPayload.picture    picture = parsedPayload.picture || ""

        

    // 策略 2: 如果沒有 email，進行深度搜尋    // 如果基本路徑沒有 email，則進行深度搜尋

    if (!email) {      

      const searchForEmail = (obj: any): string => {      // 提取 Google 用戶資訊 - 擴展搜索範圍

        if (typeof obj === 'string' && obj.includes('@') && obj.includes('.')) {      const getAllPossibleEmails = (payload: any): string[] => {

          return obj        const emails: string[] = []

        }        

                // 常見的 email 位置 (擴展搜索路徑)

        if (obj && typeof obj === 'object') {        const emailPaths = [

          // 優先檢查常見的 email 欄位          'email',

          const emailFields = ['email', 'emailAddress', 'mail', 'user_email', 'google_email']          'data.email', 

          for (const field of emailFields) {          'user.email',

            if (obj[field] && typeof obj[field] === 'string' && obj[field].includes('@')) {          'profile.email',

              return obj[field]          'actor.email',

            }          'identity.email',

          }          'auth_identity.email',

                    'provider_user_data.email',

          // 遞歸搜尋所有欄位          'userinfo.email',

          for (const key in obj) {          'google_user.email',

            const result = searchForEmail(obj[key])          'claims.email',

            if (result) return result          'claims.emailaddress',

          }          'preferred_username',

        }          'unique_name',

                  'upn'

        return ""        ]

      }        

              // 直接檢查根層級的 email

      email = searchForEmail(parsedPayload)        if (payload.email && typeof payload.email === 'string' && payload.email.includes('@')) {

    }          emails.push(payload.email)

            }

    // 策略 3: 如果還是沒有，檢查 Medusa 可能使用的特殊欄位        

    if (!email) {        // 遞歸搜尋所有層級

      const specialFields = [        const searchAllLevels = (obj: any, currentPath = '') => {

        'actor.email',          if (typeof obj === 'string' && obj.includes('@') && obj.includes('.')) {

        'identity.email',             emails.push(obj)

        'auth_identity.email',            return

        'provider_metadata.email',          }

        'user_metadata.email',          

        'app_metadata.email'          if (obj && typeof obj === 'object') {

      ]            Object.keys(obj).forEach(key => {

                    const fullPath = currentPath ? `${currentPath}.${key}` : key

      for (const fieldPath of specialFields) {              const value = obj[key]

        const fields = fieldPath.split('.')              

        let current = parsedPayload              if (typeof value === 'string' && value.includes('@') && value.includes('.')) {

                        emails.push(value)

        for (const field of fields) {              } else if (typeof value === 'object' && value !== null) {

          if (current && current[field]) {                searchAllLevels(value, fullPath)

            current = current[field]              }

          } else {            })

            current = null          }

            break        }

          }        

        }        searchAllLevels(payload)

                

        if (current && typeof current === 'string' && current.includes('@')) {        // 特定路徑檢查

          email = current        emailPaths.forEach(path => {

          break          const emailFromPath = getNestedProperty(payload, path)

        }          if (emailFromPath && typeof emailFromPath === 'string' && emailFromPath.includes('@')) {

      }            emails.push(emailFromPath)

    }          }

            })

    // 確保預設值        

    firstName = firstName || "Google"        return [...new Set(emails)] // 去重

    lastName = lastName || "User"      }

          

    if (!email) {      const getNestedProperty = (obj: any, path: string): any => {

      return NextResponse.json({         return path.split('.').reduce((current, key) => current?.[key], obj)

        error: '無法從 JWT 中提取 email',      }

        payload: parsedPayload      

      }, { status: 400 })      const possibleEmails = getAllPossibleEmails(parsedPayload)

    }      email = possibleEmails[0] || ""

          

    return NextResponse.json({      // 從 JWT 獲取姓名資訊

      email,      if (!firstName) {

      firstName,        firstName = parsedPayload?.given_name ||

      lastName,                   parsedPayload?.first_name ||

      picture,                   getNestedProperty(parsedPayload, 'data.given_name') ||

      hasEmail: !!email                   getNestedProperty(parsedPayload, 'user.given_name') ||

    })                   getNestedProperty(parsedPayload, 'profile.given_name') ||

                       getNestedProperty(parsedPayload, 'userinfo.given_name') ||

  } catch (error) {                   "Google"

    return NextResponse.json({       }

      error: '解析 JWT 失敗',      

      details: error instanceof Error ? error.message : String(error)      if (!lastName) {

    }, { status: 500 })        lastName = parsedPayload?.family_name ||

  }                   parsedPayload?.last_name ||

}                   getNestedProperty(parsedPayload, 'data.family_name') ||
                   getNestedProperty(parsedPayload, 'user.family_name') ||
                   getNestedProperty(parsedPayload, 'profile.family_name') ||
                   getNestedProperty(parsedPayload, 'userinfo.family_name') ||
                   "User"
      }
      
      if (!picture) {
        picture = parsedPayload?.picture ||
                  getNestedProperty(parsedPayload, 'data.picture') ||
                  getNestedProperty(parsedPayload, 'user.picture') ||
                  getNestedProperty(parsedPayload, 'profile.picture')
      }
    }
    
    if (!email) {
      return NextResponse.json({ 
        error: '無法提取 email，請檢查 Google OAuth 權限設定',
        payload: parsedPayload
      }, { status: 400 })
    }
    
    return NextResponse.json({
      email,
      firstName,
      lastName,
      picture,
      hasEmail: !!email,
      source: 'JWT'
    })
    
  } catch (error) {
    console.error('❌ 解析 Google token 失敗:', error)
    return NextResponse.json({ 
      error: '解析 token 失敗',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}