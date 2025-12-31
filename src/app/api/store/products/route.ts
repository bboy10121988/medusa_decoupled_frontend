import { NextRequest, NextResponse } from "next/server"
import { MEDUSA_BACKEND_URL } from "@lib/config"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const limit = searchParams.get("limit") || "5"

    if (!query) {
        return NextResponse.json({ products: [] })
    }

    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }

        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers["x-publishable-api-key"] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        const res = await fetch(
            `${MEDUSA_BACKEND_URL}/store/products?q=${encodeURIComponent(query)}&limit=${limit}`,
            {
                headers,
                next: { revalidate: 60 } // Cache results for 1 minute
            }
        )

        if (!res.ok) {
            console.error("Product search proxy failed:", res.status, res.statusText)
            return NextResponse.json({ products: [] }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("Product search proxy error:", error)
        return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }
}
