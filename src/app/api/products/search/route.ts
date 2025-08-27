import { NextRequest, NextResponse } from 'next/server'
import { sdk } from "@lib/config"

interface RegionResponse {
  regions: Array<{
    id: string
  }>
}

interface Product {
  id: string
  title: string
  handle: string
  description?: string
  thumbnail?: string
  variants?: Array<{
    id: string
    title: string
    prices: Array<{
      amount: number
      original_amount?: number
    }>
  }>
  options?: any[]
}

interface ProductsResponse {
  products: Product[]
}

export const maxDuration = 10 // 設置函數的最大執行時間為10秒

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const format = searchParams.get('format') // 'simple' 或默認為完整格式
  
  if (!query) {
    return NextResponse.json(
      { message: '請輸入搜尋詞', products: [] },
      { status: 400 }
    )
  }

  try {
    // 獲取預設區域
    const defaultRegionResponse = await sdk.client.fetch<RegionResponse>(`/store/regions?limit=1`, {
      method: "GET",
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      }
    })

    if (!defaultRegionResponse?.regions || defaultRegionResponse.regions.length === 0) {
      return NextResponse.json(
        { message: '無法獲取區域資訊', products: [] },
        { status: 500 }
      )
    }

    const defaultRegion = defaultRegionResponse.regions[0]

    // 獲取所有產品後在前端過濾
    const productsResponse = await sdk.client.fetch<ProductsResponse>(`/store/products`, {
      method: "GET",
      query: {
        limit: 100,  // 獲取更多產品以確保搜索準確性
        region_id: defaultRegion.id,
        fields: "handle,id,title,thumbnail,variants,options,metadata,variants.title,variants.prices.amount,variants.prices.original_amount,variants.manage_inventory,variants.allow_backorder,variants.inventory_quantity,description,images,collection_id,created_at,updated_at,type_id,status,weight,length,height,width,material,hs_code,origin_country,mid_code",
      },
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      }
    })

    // 在前端進行搜索過濾
    const filteredProducts = productsResponse.products.filter(product => {
      return (
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.variants?.some(variant => 
          variant.title.toLowerCase().includes(query.toLowerCase())
        )
      )
    })

    // 根據 format 參數決定返回格式
    if (format === 'simple') {
      // 為搜尋模態框返回簡化格式
      const formattedProducts = filteredProducts.slice(0, 10).map((product) => {
        const variants = product.variants || []
        const lowestPriceVariant = variants.length > 0 ? 
          variants.reduce((lowest, current) => {
            if (!lowest) return current
            
            const lowestPrice = lowest.prices?.[0]?.amount || Number.MAX_SAFE_INTEGER
            const currentPrice = current.prices?.[0]?.amount || Number.MAX_SAFE_INTEGER
            
            return currentPrice < lowestPrice ? current : lowest
          }, null as any) : null

        const calculatedPrice = lowestPriceVariant?.prices?.[0]?.amount || 0
        const originalPrice = lowestPriceVariant?.prices?.[0]?.original_amount || 0

        return {
          id: product.id,
          title: product.title,
          handle: product.handle,
          thumbnail: product.thumbnail,
          price: {
            calculated_price: `NT$${calculatedPrice}`,
            original_price: originalPrice > 0 && originalPrice !== calculatedPrice ? 
              `NT$${originalPrice}` : undefined
          }
        }
      })
      
      return NextResponse.json({ products: formattedProducts })
    } else {
      // 為搜尋結果頁面返回完整格式（Medusa 標準格式）
      return NextResponse.json({ products: filteredProducts.slice(0, 24) })
    }

  } catch (error) {
    console.error('搜尋商品時出錯:', error)
    return NextResponse.json(
      { message: '搜尋商品時出錯', error: (error as Error).message },
      { status: 500 }
    )
  }
}