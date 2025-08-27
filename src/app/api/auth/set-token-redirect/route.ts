import { NextRequest, NextResponse } from 'next/server'
import { setAuthToken } from '@lib/data/cookies'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const redirectUrl = searchParams.get('redirect') || '/'

  if (!token) {
    return NextResponse.redirect(redirectUrl)
  }

  await setAuthToken(token)
  return NextResponse.redirect(redirectUrl)
} 