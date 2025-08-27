import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('_medusa_jwt')
  
  return NextResponse.json({
    hasAuthToken: !!authToken,
    authTokenValue: authToken?.value ? `${authToken.value.substring(0, 20)}...` : null,
    allCookies: Object.fromEntries(
      cookieStore.getAll().map(cookie => [cookie.name, cookie.value.substring(0, 20) + '...'])
    ),
    headers: Object.fromEntries(request.headers.entries()),
  })
}
