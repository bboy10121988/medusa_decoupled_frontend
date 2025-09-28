import { NextRequest, NextResponse } from 'next/server'
import { setAuthToken } from '@lib/data/cookies'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const redirectPath = searchParams.get('redirect') || '/tw/account'

  if (!token) {
    // If a base URL is configured, use it to build absolute redirect URLs so that
    // reverse proxies or local host headers don't produce wrong hosts (e.g. localhost:8000).
    const base = process.env.NEXT_PUBLIC_BASE_URL || request.url
    const redirectUrl = new URL(redirectPath, base)
    return NextResponse.redirect(redirectUrl)
  }

  await setAuthToken(token)
  const base = process.env.NEXT_PUBLIC_BASE_URL || request.url
  const redirectUrl = new URL(redirectPath, base)
  return NextResponse.redirect(redirectUrl)
} 