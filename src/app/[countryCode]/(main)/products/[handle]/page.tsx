import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProduct, listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import { generateProductKeywords } from "../../../../../lib/seo"
import ProductTemplate from "../../../../../modules/products/templates"
import { getStoreName } from "../../../../../lib/store-name"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateStaticParams() {
  // 返回一個簡單的靜態路徑陣列，讓頁面在訪問時按需生成
  try {
    return [
      { countryCode: "tw", handle: "product-1" },
      { countryCode: "tw", handle: "product-2" }
    ]
  } catch (error) {
    console.error(`產生靜態路徑時發生錯誤: ${error instanceof Error ? error.message : "未知錯誤"}.`)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { handle, countryCode } = await params
    const region = await getRegion(countryCode)
    const storeName = await getStoreName()

    if (!region) {
      return {
        title: `商品不存在 | ${storeName}`,
        description: "找不到您請求的商品",
      }
    }

    // 嘗試使用 getProduct 函數直接獲取產品
    try {
      const product = await getProduct({
        handle,
        countryCode,
      })

      const keywords = generateProductKeywords(product, {
        presetKeywords: {},
        extractFields: ['title', 'subtitle', 'description', 'tags', 'collection']
      })

      return {
        title: `${product.title} | ${storeName}`,
        description: product.description || `${product.title} - ${storeName}`,
        keywords: keywords,
        openGraph: {
          title: `${product.title} | ${storeName}`,
          description: product.description || `${product.title} - ${storeName}`,
          images: product.thumbnail ? [product.thumbnail] : [],
        },
      }
    } catch (error) {
      console.error(`無法獲取產品詳情: ${error instanceof Error ? error.message : "未知錯誤"}`)
      
      // 回退到基本元數據
      return {
        title: `商品 | ${storeName}`,
        description: `${storeName} 的商品頁面`,
      }
    }
  } catch (error) {
    console.error(`生成商品頁面元數據時出錯: ${error instanceof Error ? error.message : "未知錯誤"}`)
    
    // 由於不知道是否能獲取 storeName，所以返回固定文字
    return {
      title: "商品頁面",
      description: "商品頁面",
    }
  }
}

export default async function ProductPage({ params }: Props) {
  try {
    const { countryCode, handle } = await params
    const region = await getRegion(countryCode)

    if (!region) {
      notFound()
    }

    // 使用 getProduct 函數獲取完整產品資訊
    try {
      const pricedProduct = await getProduct({
        handle,
        countryCode,
      })

      if (!pricedProduct) {
        notFound()
      }

      return (
        <ProductTemplate
          product={pricedProduct}
          region={region}
          countryCode={countryCode}
        />
      )
    } catch (error) {
      console.error(`無法獲取產品資料: ${error instanceof Error ? error.message : "未知錯誤"}`)
      notFound()
    }
  } catch (error) {
    console.error(`獲取商品資料時出錯: ${error instanceof Error ? error.message : "未知錯誤"}`)
    notFound()
  }
}
