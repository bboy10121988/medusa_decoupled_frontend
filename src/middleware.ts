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
export async function middleware(request: NextRequest) {
  // Skip middleware for studio, cms routes
  if (request.nextUrl.pathname.startsWith("/studio") || 
      request.nextUrl.pathname.startsWith("/cms")) {
    return NextResponse.next()
  }

  // Skip middleware for affiliate-admin routes (they handle their own region routing)
  if (request.nextUrl.pathname.includes("/affiliate-admin")) {
    return NextResponse.next()
  }
  
  // Skip middleware for auth routes (needed for OAuth callbacks)
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.next()
  }
  
  // Skip middleware for reset-password routes (allow direct access without region routing)
  if (request.nextUrl.pathname.includes("/reset-password")) {
    return NextResponse.next()
  }

  // 預設不重導，必要時才建立 redirect 回應
  // const response = NextResponse.next()

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")

  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // if one of the country codes is in the url and the cache id is set, return next
  if (urlHasCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and continue
  if (urlHasCountryCode && !cacheIdCookie) {
    const res = NextResponse.next()
    res.cookies.set("_medusa_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
    return res
  }

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath = request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // Affiliate tracking middleware
  const affiliateResponse = NextResponse.next()
  const url = request.nextUrl.clone()
  
  // Check for affiliate parameters
  const affiliateRef = url.searchParams.get('ref')
  const affiliateId = url.searchParams.get('affiliate_id')
  const utmSource = url.searchParams.get('utm_source')
  const utmMedium = url.searchParams.get('utm_medium')
  const utmCampaign = url.searchParams.get('utm_campaign')
  
  // Set affiliate tracking cookies if parameters are present
  if (affiliateRef || affiliateId) {
    if (affiliateRef) {
      affiliateResponse.cookies.set('affiliate_ref', affiliateRef, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    if (affiliateId && affiliateId !== affiliateRef) {
      affiliateResponse.cookies.set('affiliate_id', affiliateId, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    // Set UTM parameter cookies
    if (utmSource) {
      affiliateResponse.cookies.set('utm_source', utmSource, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    if (utmMedium) {
      affiliateResponse.cookies.set('utm_medium', utmMedium, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    if (utmCampaign) {
      affiliateResponse.cookies.set('utm_campaign', utmCampaign, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }
    
    // Log affiliate click tracking (in production, save to database)
    // console.log('Affiliate click tracked:', {
      // affiliateId: affiliateRef || affiliateId,
      // timestamp: Date.now(),
      // referrer: request.headers.get('referer'),
      // userAgent: request.headers.get('user-agent'),
      // ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      // utmSource,
      // utmMedium,
      // utmCampaign,
      // path: url.pathname
    // })
    
    // Remove affiliate parameters from URL to keep it clean
    url.searchParams.delete('ref')
    url.searchParams.delete('affiliate_id')
    url.searchParams.delete('utm_source')
    url.searchParams.delete('utm_medium')
    url.searchParams.delete('utm_campaign')
    url.searchParams.delete('utm_content')
    url.searchParams.delete('utm_term')
    url.searchParams.delete('t') // timestamp
    
    // If URL has changed, redirect to clean URL
    if (url.href !== request.url) {
      // But first handle country code redirect if needed
      if (!urlHasCountryCode && countryCode) {
        const cleanPath = url.pathname === "/" ? "" : url.pathname
        const cleanQuery = url.search ? url.search : ""
        url.pathname = `/${countryCode}${cleanPath}`
        url.search = cleanQuery
      }
      return NextResponse.redirect(url.href)
    }
  }

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    const redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    return NextResponse.redirect(redirectUrl, 307)
  }

  return affiliateResponse
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|studio|cms|auth|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
