import { NextRequest, NextResponse } from 'next/server'
import { getPublishableKeyForBackend } from '@lib/medusa-publishable-key'

// 代理所有 Medusa API 請求
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const slug = await params
  const path = slug.slug.join('/')
  const searchParams = request.nextUrl.searchParams
  
  const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const medusaUrl = `${backend}/${path}?${searchParams.toString()}`
  
  try {
    const response = await fetch(medusaUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': getPublishableKeyForBackend(backend),
      },
    })

    // 檢查響應狀態並提供更詳細的錯誤信息
    if (!response.ok) {
      const errorText = await response.text()
      if (process.env.NODE_ENV === 'development') console.error(`Medusa API GET error (${response.status}):`, errorText)
      return NextResponse.json(
        { error: `Medusa API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-publishable-api-key',
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Medusa API GET proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from Medusa API' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const slug = await params
  const path = slug.slug.join('/')
  const body = await request.text()
  
  const backend2 = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const medusaUrl = `${backend2}/${path}`
  
  try {
    const response = await fetch(medusaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': getPublishableKeyForBackend(backend2),
      },
      body,
    })

    // 檢查響應狀態並提供更詳細的錯誤信息
    if (!response.ok) {
      const errorText = await response.text()
      if (process.env.NODE_ENV === 'development') console.error(`Medusa API error (${response.status}):`, errorText)
      return NextResponse.json(
        { error: `Medusa API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-publishable-api-key',
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Medusa API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from Medusa API' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const slug = await params
  const path = slug.slug.join('/')
  
  const backend3 = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const medusaUrl = `${backend3}/${path}`
  
  try {
    const response = await fetch(medusaUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': getPublishableKeyForBackend(backend3),
      },
    })

    let data
    try {
      data = await response.json()
    } catch {
      // DELETE 請求可能不返回 JSON
      data = { success: true }
    }
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-publishable-api-key',
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Medusa API proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from Medusa API' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-publishable-api-key',
    },
  })
}
