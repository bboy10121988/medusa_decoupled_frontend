import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "tw"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(_cacheId: string) {
  const { regionMap } = regionMapCache

  // If map is already populated, return it
  if (regionMap.size > 0) {
    return regionMap
  }

  // Performance Optimization: Use static region configuration instead of blocking fetch
  // This improves TTFB significantly by removing the backend dependency in middleware
  // If you need to support multiple regions, add them to this array
  const supportedRegions = [DEFAULT_REGION]

  supportedRegions.forEach((regionCode) => {
    regionMap.set(regionCode, {
      id: `static-${regionCode}`,
      name: regionCode.toUpperCase(),
      countries: [{ iso_2: regionCode }],
    } as unknown as HttpTypes.StoreRegion)
  })

  regionMapCache.regionMapUpdated = Date.now()
  return regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // console.error(
      // "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      // )
    }
    return undefined
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
// Middleware to handle region selection and onboarding status.
export async function middleware(request: NextRequest) {
  // Skip middleware for studio, cms routes
  if (request.nextUrl.pathname.startsWith("/studio") ||
    request.nextUrl.pathname.startsWith("/cms")) {
    return NextResponse.next()
  }

  // Skip middleware for affiliate-admin routes
  if (request.nextUrl.pathname.includes("/affiliate-admin")) {
    return NextResponse.next()
  }

  // Skip middleware for auth routes
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  // Skip middleware for reset-password routes
  if (request.nextUrl.pathname.includes("/reset-password")) {
    return NextResponse.next()
  }

  // Admin Route Protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('_affiliate_session')
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    try {
      const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
      if (session.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // if one of the country codes is in the url and the cache id is set, return next
  if (urlHasCountryCode && cacheIdCookie) {
    // Check for affiliate tracking even if URL is correct
    // But usually we track on the first hit. If params exist, we should process them.
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and continue
  if (urlHasCountryCode && !cacheIdCookie) {
    // If we have params, we might need to process them before returning
  }

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath = request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // Affiliate tracking middleware
  let finalResponse: NextResponse

  const url = request.nextUrl.clone()
  const affiliateRef = url.searchParams.get('ref')
  const linkId = url.searchParams.get('lid') // Unique Link Code
  const affiliateId = url.searchParams.get('affiliate_id')
  const utmSource = url.searchParams.get('utm_source')
  const utmMedium = url.searchParams.get('utm_medium')
  const utmCampaign = url.searchParams.get('utm_campaign')

  const hasAffiliateParams = affiliateRef || linkId || affiliateId || utmSource || utmMedium || utmCampaign

  // Logic 1: Handle Country Code Redirect
  if (!urlHasCountryCode && countryCode) {
    const redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    finalResponse = NextResponse.redirect(redirectUrl, 307)
  }
  // Logic 2: Handle Clean URL Redirect (if we have params AND we are already on correct country)
  else if (hasAffiliateParams && urlHasCountryCode) {
    const cleanUrl = new URL(request.url)
    cleanUrl.searchParams.delete('ref')
    cleanUrl.searchParams.delete('lid')
    cleanUrl.searchParams.delete('affiliate_id')
    cleanUrl.searchParams.delete('utm_source')
    cleanUrl.searchParams.delete('utm_medium')
    cleanUrl.searchParams.delete('utm_campaign')

    finalResponse = NextResponse.redirect(cleanUrl)
  }
  // Logic 3: Normal Request
  else {
    finalResponse = NextResponse.next()
  }

  // Set cookies on the FINAL response (whether it's a redirect or next)
  if (affiliateRef || affiliateId) {
    if (affiliateRef) {
      finalResponse.cookies.set('affiliate_ref', affiliateRef, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }

    if (affiliateId && affiliateId !== affiliateRef) {
      finalResponse.cookies.set('affiliate_id', affiliateId, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }

    if (utmSource) finalResponse.cookies.set('utm_source', utmSource, { maxAge: 30 * 24 * 60 * 60, path: '/' })
    if (utmMedium) finalResponse.cookies.set('utm_medium', utmMedium, { maxAge: 30 * 24 * 60 * 60, path: '/' })
    if (utmCampaign) finalResponse.cookies.set('utm_campaign', utmCampaign, { maxAge: 30 * 24 * 60 * 60, path: '/' })
  }

  // Log affiliate click tracking (Side Effect)
  const trackingCode = linkId || affiliateRef
  if (trackingCode) {
    const backendUrl = process.env.MEDUSA_BACKEND_URL || 'https://admin.timsfantasyworld.com'
    const trackingUrl = `${backendUrl}/store/affiliates/links/click`

    fetch(trackingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
      },
      body: JSON.stringify({
        code: trackingCode,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
        metadata: {
          referrer: request.headers.get('referer'),
          utmSource,
          utmMedium,
          utmCampaign,
          affiliateRef
        }
      })
    }).catch((err) => {
      console.error('[Affiliate Middleware] Tracking failed:', err)
    })
  }

  // Ensure cache ID is set if missing
  if (!cacheIdCookie) {
    finalResponse.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
  }

  return finalResponse
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|studio|cms|auth|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
