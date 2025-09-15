import { NextRequest, NextResponse } from 'next/server'
import { getPublishableKeyForBackend } from '@lib/medusa-publishable-key'

type RouteCtx = { params: { slug: string[] } }

function getAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_CORS_ORIGINS || ''
  const defaults = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL && `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
    'http://localhost:8000',
    'http://localhost:3000',
  ].filter(Boolean) as string[]
  const extra = env
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return Array.from(new Set([...defaults, ...extra]))
}

function pickOrigin(req: NextRequest): string | null {
  const origin = req.headers.get('origin') || req.headers.get('referer')
  if (!origin) return null
  const allowed = getAllowedOrigins()
  const found = allowed.find((o) => origin.startsWith(o))
  return found || null
}

function corsHeaders(origin: string | null) {
  return origin
    ? {
        'Access-Control-Allow-Origin': origin,
        Vary: 'Origin',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-publishable-api-key',
        'Access-Control-Max-Age': '600',
      }
    : {}
}

function sanitizePath(segments: string[]): string {
  const safe = segments
    .filter((s) => !!s && s !== '.' && s !== '..')
    .join('/')
    .replace(/^\/+|\/+$/g, '')
  return safe
}

function isAllowedPath(path: string): boolean {
  const env = process.env.MEDUSA_PROXY_ALLOWED_PREFIXES || ''
  const defaults = ['store/', 'auth/', 'products/', 'collections/', 'variants/', 'inventory/', 'regions/']
  const prefixes = (env ? env.split(',') : defaults).map((p) => p.trim()).filter(Boolean)
  return prefixes.some((p) => path.startsWith(p))
}

async function proxyFetch(method: 'GET' | 'POST' | 'DELETE', req: NextRequest, pathSegments: string[]) {
  const origin = pickOrigin(req)
  const path = sanitizePath(pathSegments)
  if (!isAllowedPath(path)) {
    return NextResponse.json({ error: 'Forbidden path' }, { status: 403, headers: corsHeaders(origin) })
  }

  const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (!backend) {
    return NextResponse.json({ error: 'Medusa backend not configured' }, { status: 500, headers: corsHeaders(origin) })
  }

  const url = new URL(`${backend.replace(/\/$/, '')}/${path}`)
  if (method === 'GET') {
    req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v))
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': getPublishableKeyForBackend(backend),
  }

  // 可選：將 Authorization 轉發（若有需要保留會話語義）
  const auth = req.headers.get('authorization')
  if (auth) headers['authorization'] = auth

  const init: RequestInit = { method, headers }
  if (method === 'POST') {
    init.body = await req.text()
  }

  try {
    const resp = await fetch(url.toString(), init)
    const text = await resp.text()
    const isJson = resp.headers.get('content-type')?.includes('application/json')
    const body = isJson ? (text ? JSON.parse(text) : {}) : { data: text }
    const res = NextResponse.json(body, { status: resp.status, headers: corsHeaders(origin) })
    return res
  } catch (e: any) {
    if (process.env.NODE_ENV === 'development') console.error('Medusa proxy error:', e)
    return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 502, headers: corsHeaders(origin) })
  }
}

// Handlers
export async function GET(request: NextRequest, ctx: RouteCtx) {
  return proxyFetch('GET', request, ctx.params.slug)
}

export async function POST(request: NextRequest, ctx: RouteCtx) {
  return proxyFetch('POST', request, ctx.params.slug)
}

export async function DELETE(request: NextRequest, ctx: RouteCtx) {
  return proxyFetch('DELETE', request, ctx.params.slug)
}

export async function OPTIONS(request: NextRequest) {
  const origin = pickOrigin(request)
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}
