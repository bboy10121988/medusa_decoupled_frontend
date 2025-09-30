import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, accessToken } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: '需要 token' }, { status: 400 })
    }

    console.log('🔍 解析 Google JWT token 並提取用戶資訊...')
    
    // 首先嘗試使用 Google API 直接獲取用戶資訊
    let googleUserInfo = null
    if (accessToken) {
      try {
        console.log('🌐 使用 Google API 獲取用戶資訊...')
        const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`)
        if (googleResponse.ok) {
          googleUserInfo = await googleResponse.json()
          console.log('✅ Google API 返回用戶資訊:', googleUserInfo)
        }
      } catch (googleError) {
        console.log('⚠️ Google API 調用失敗，使用 JWT 解析:', googleError)
      }
    }
    
    // 解析 JWT token
    const [, payload] = token.split(".")
    if (!payload) {
      return NextResponse.json({ error: '無效的 JWT 格式' }, { status: 400 })
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    )
    
    const parsedPayload = JSON.parse(decoded)
    
    console.log('🔍 JWT payload:', JSON.stringify(parsedPayload, null, 2))
    
    // 優先使用 Google API 的資訊
    let email = googleUserInfo?.email
    let firstName = googleUserInfo?.given_name
    let lastName = googleUserInfo?.family_name
    let picture = googleUserInfo?.picture

    console.log('🌐 Google API 提供的資訊:', { email, firstName, lastName, picture })
    
    // 如果 Google API 沒有提供 email，則從 JWT 中提取
    if (!email) {
      console.log('🔍 從 JWT 中提取用戶資訊...')
      
      // 提取 Google 用戶資訊 - 擴展搜索範圍
      const getAllPossibleEmails = (payload: any): string[] => {
        const emails: string[] = []
        
        // 常見的 email 位置
        const emailPaths = [
          'email',
          'data.email', 
          'user.email',
          'profile.email',
          'actor.email',
          'identity.email',
          'auth_identity.email',
          'provider_user_data.email',
          'userinfo.email',
          'google_user.email'
        ]
        
        emailPaths.forEach(path => {
          const emailFromPath = getNestedProperty(payload, path)
          if (emailFromPath && typeof emailFromPath === 'string' && emailFromPath.includes('@')) {
            emails.push(emailFromPath)
          }
        })
        
        return [...new Set(emails)] // 去重
      }
      
      const getNestedProperty = (obj: any, path: string): any => {
        return path.split('.').reduce((current, key) => current?.[key], obj)
      }
      
      const possibleEmails = getAllPossibleEmails(parsedPayload)
      email = possibleEmails[0] || ""
      
      // 從 JWT 獲取姓名資訊
      if (!firstName) {
        firstName = parsedPayload?.given_name ||
                   parsedPayload?.first_name ||
                   getNestedProperty(parsedPayload, 'data.given_name') ||
                   getNestedProperty(parsedPayload, 'user.given_name') ||
                   getNestedProperty(parsedPayload, 'profile.given_name') ||
                   getNestedProperty(parsedPayload, 'userinfo.given_name') ||
                   "Google"
      }
      
      if (!lastName) {
        lastName = parsedPayload?.family_name ||
                   parsedPayload?.last_name ||
                   getNestedProperty(parsedPayload, 'data.family_name') ||
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
    
    console.log('✅ 最終提取的用戶資訊:', { 
      email, 
      firstName, 
      lastName,
      picture,
      hasEmail: !!email,
      source: googleUserInfo ? 'Google API' : 'JWT'
    })
    
    if (!email) {
      console.log('❌ 無法從 Google API 或 JWT 中提取 email')
      return NextResponse.json({ 
        error: '無法提取 email，請檢查 Google OAuth 權限設定',
        googleUserInfo,
        payload: parsedPayload
      }, { status: 400 })
    }
    
    return NextResponse.json({
      email,
      firstName,
      lastName,
      picture,
      hasEmail: !!email,
      source: googleUserInfo ? 'Google API' : 'JWT'
    })
    
  } catch (error) {
    console.error('❌ 解析 Google token 失敗:', error)
    return NextResponse.json({ 
      error: '解析 token 失敗',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}