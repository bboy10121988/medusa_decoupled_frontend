import { headers } from 'next/headers'

export async function getRequestOrigin() {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') || 'http'
  const host = h.get('host') || 'localhost:8000'
  return `${proto}://${host}`
}

