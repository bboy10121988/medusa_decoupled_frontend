export function getPublishableKeyForBackend(backendUrl?: string): string {
  const DEFAULT = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
  const LOCAL = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_LOCAL || ''
  const REMOTE = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_REMOTE || ''
  const RAILWAY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_RAILWAY || ''

  // 開發環境除錯信息
  if (process.env.NODE_ENV === 'development') {
    // console.log('🔐 Publishable Key Debug:', {
      // backendUrl,
      // DEFAULT: DEFAULT ? `${DEFAULT.slice(0, 10)}...` : 'empty',
      // LOCAL: LOCAL ? `${LOCAL.slice(0, 10)}...` : 'empty',
      // REMOTE: REMOTE ? `${REMOTE.slice(0, 10)}...` : 'empty',
      // RAILWAY: RAILWAY ? `${RAILWAY.slice(0, 10)}...` : 'empty'
    // })
  }

  if (!backendUrl) {
    if (process.env.NODE_ENV === 'development') {
      // console.log('🔐 Using DEFAULT key (no backendUrl provided)')
    }
    return DEFAULT
  }
  
  try {
    const { hostname } = new URL(backendUrl)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const result = LOCAL || DEFAULT
      if (process.env.NODE_ENV === 'development') {
        // console.log(`🔐 Using LOCAL key for ${hostname}:`, result ? `${result.slice(0, 10)}...` : 'empty')
      }
      return result
    }
    if (hostname.endsWith('.railway.app')) {
      const result = RAILWAY || REMOTE || DEFAULT
      if (process.env.NODE_ENV === 'development') {
        // console.log(`🔐 Using RAILWAY key for ${hostname}:`, result ? `${result.slice(0, 10)}...` : 'empty')
      }
      return result
    }
    // Fallback: treat anything else as remote/VM
    const result = REMOTE || DEFAULT
    if (process.env.NODE_ENV === 'development') {
      // console.log(`🔐 Using REMOTE key for ${hostname}:`, result ? `${result.slice(0, 10)}...` : 'empty')
    }
    return result
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // console.log('🔐 URL parsing failed, using DEFAULT key:', error)
    }
    return DEFAULT
  }
}

