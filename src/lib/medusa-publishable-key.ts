export function getPublishableKeyForBackend(backendUrl?: string): string {
  const DEFAULT = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
  const LOCAL = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_LOCAL || ''
  const REMOTE = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_REMOTE || ''
  const RAILWAY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_RAILWAY || ''

  if (!backendUrl) return DEFAULT
  try {
    const { hostname } = new URL(backendUrl)
    if (hostname === 'localhost' || hostname === '127.0.0.1') return LOCAL || DEFAULT
    if (hostname.endsWith('.railway.app')) return RAILWAY || REMOTE || DEFAULT
    // Fallback: treat anything else as remote/VM
    return REMOTE || DEFAULT
  } catch {
    return DEFAULT
  }
}

