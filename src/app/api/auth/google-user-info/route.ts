import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: '需要 token' }, { status: 400 })
    }

    console.log('🔍 解析 Google JWT token 並提取用戶資訊...')
    
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
        const email = getNestedProperty(payload, path)
        if (email && typeof email === 'string' && email.includes('@')) {
          emails.push(email)
        }
      })
      
      return [...new Set(emails)] // 去重
    }
    
    const getNestedProperty = (obj: any, path: string): any => {
      return path.split('.').reduce((current, key) => current?.[key], obj)
    }
    
    const possibleEmails = getAllPossibleEmails(parsedPayload)
    const email = possibleEmails[0] || ""
    
    const firstName = parsedPayload?.given_name ||
                     parsedPayload?.first_name ||
                     getNestedProperty(parsedPayload, 'data.given_name') ||
                     getNestedProperty(parsedPayload, 'user.given_name') ||
                     getNestedProperty(parsedPayload, 'profile.given_name') ||
                     getNestedProperty(parsedPayload, 'userinfo.given_name') ||
                     "Google"
    
    const lastName = parsedPayload?.family_name ||
                    parsedPayload?.last_name ||
                    getNestedProperty(parsedPayload, 'data.family_name') ||
                    getNestedProperty(parsedPayload, 'user.family_name') ||
                    getNestedProperty(parsedPayload, 'profile.family_name') ||
                    getNestedProperty(parsedPayload, 'userinfo.family_name') ||
                    "User"
    
    console.log('✅ 提取的用戶資訊:', { 
      email, 
      firstName, 
      lastName,
      possibleEmails,
      hasEmail: !!email 
    })
    
    return NextResponse.json({
      email,
      firstName,
      lastName,
      hasEmail: !!email,
      possibleEmails, // 調試用
      payload: parsedPayload // 用於調試
    })
    
  } catch (error) {
    console.error('❌ 解析 Google token 失敗:', error)
    return NextResponse.json({ 
      error: '解析 token 失敗',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}