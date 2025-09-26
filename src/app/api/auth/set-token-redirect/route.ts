import { NextRequest, NextResponse } from 'next/server'
import { setAuthToken } from '@lib/data/cookies'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const redirectPath = searchParams.get('redirect') || '/tw/account'

  if (!token) {
    const redirectUrl = new URL(redirectPath, request.url)
    return NextResponse.redirect(redirectUrl)
  }

  await setAuthToken(token)
  const redirectUrl = new URL(redirectPath, request.url)
  return NextResponse.redirect(redirectUrl)
} 