import { MEDUSA_BACKEND_URL } from '@lib/config'

// Store-facing base, e.g. http://localhost:9000/store/affiliate
export function getAffiliateStoreApiUrl(): string {
  const direct = process.env.AFFILIATE_STORE_API_URL?.trim()
  if (direct) return direct.replace(/\/$/, '')
  return `${MEDUSA_BACKEND_URL.replace(/\/$/, '')}/store/affiliate`
}

// Admin-facing base, e.g. http://localhost:9000/admin/affiliate
export function getAffiliateAdminApiUrl(): string {
  const direct = process.env.AFFILIATE_ADMIN_API_URL?.trim()
  if (direct) return direct.replace(/\/$/, '')
  return `${MEDUSA_BACKEND_URL.replace(/\/$/, '')}/admin/affiliate`
}

// Backwards compat (deprecated)
export function getAffiliateApiUrl(): string {
  return getAffiliateStoreApiUrl()
}
