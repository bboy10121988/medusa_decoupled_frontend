// Google OAuth Debug Helper
// 用於檢查 Google OAuth 返回的 JWT token 內容

export function debugGoogleToken(token: string) {
  try {
    const [, payload] = token.split(".")
    if (!payload) {
      console.error("Invalid JWT token format")
      return null
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    )
    
    const parsedPayload = JSON.parse(decoded)
    
    console.log("=== Google OAuth JWT Debug ===")
    console.log("Raw Payload:", parsedPayload)
    console.log("Available fields:", Object.keys(parsedPayload))
    
    // 檢查各種可能的 email 欄位
    const emailFields = [
      'email',
      'data.email', 
      'user.email',
      'profile.email',
      'emailAddress'
    ]
    
    console.log("Email field check:")
    emailFields.forEach(field => {
      const value = getNestedValue(parsedPayload, field)
      console.log(`  ${field}: ${value || 'not found'}`)
    })
    
    // 檢查姓名欄位
    const nameFields = [
      'given_name',
      'family_name', 
      'first_name',
      'last_name',
      'name'
    ]
    
    console.log("Name field check:")
    nameFields.forEach(field => {
      const value = getNestedValue(parsedPayload, field)
      console.log(`  ${field}: ${value || 'not found'}`)
    })
    
    return parsedPayload
  } catch (error) {
    console.error("Failed to debug JWT token:", error)
    return null
  }
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// 使用方式：
// import { debugGoogleToken } from './debug-google-token'
// debugGoogleToken(yourJWTToken)