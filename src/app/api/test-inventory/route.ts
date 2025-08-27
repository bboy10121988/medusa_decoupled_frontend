import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const productId = searchParams.get("productId")
  
  if (!productId) {
    return NextResponse.json({ error: "產品ID是必需的" }, { status: 400 })
  }
  
  try {
    const response = await sdk.client.fetch(`/store/products/${productId}`, {
      method: "GET",
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      },
      query: {
        fields: "id,title,subtitle,description,thumbnail,variants,variants.id,variants.title,+variants.inventory_quantity,variants.manage_inventory,variants.allow_backorder",
      },
    })
    
    return NextResponse.json(response)
  } catch (error) {
    console.error("獲取產品數據時出錯:", error)
    return NextResponse.json({ error: "獲取產品數據時出錯" }, { status: 500 })
  }
}
