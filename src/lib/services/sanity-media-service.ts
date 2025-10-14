/**
 * Sanity 媒體庫服務
 * 提供 GrapesJS 與 Sanity 媒體庫的整合功能
 */

import { client } from '@/sanity-client/client'
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// 創建具有寫入權限的客戶端
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-30',
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN || process.env.SANITY_API_TOKEN
})

export interface SanityImage {
  _id: string
  _type: 'sanity.imageAsset'
  url: string
  originalFilename?: string
  size?: number
  metadata: {
    dimensions: {
      width: number
      height: number
    }
    format: string
  }
  _createdAt: string
  _updatedAt: string
}

/**
 * 獲取 Sanity 媒體庫中的所有圖片
 */
export async function getSanityImages(): Promise<SanityImage[]> {
  try {
    const query = `*[_type == "sanity.imageAsset"] | order(_createdAt desc) [0...50] {
      _id,
      _type,
      url,
      originalFilename,
      size,
      metadata {
        dimensions {
          width,
          height
        },
        format
      },
      _createdAt,
      _updatedAt
    }`
    
    return await client.fetch<SanityImage[]>(query)
  } catch (error) {
    console.error('獲取 Sanity 圖片時發生錯誤:', error)
    return []
  }
}

/**
 * 上傳圖片到 Sanity
 */
export async function uploadImageToSanity(file: File): Promise<SanityImage | null> {
  try {
    const asset = await writeClient.assets.upload('image', file, {
      filename: file.name
    })
    
    return {
      _id: asset._id,
      _type: 'sanity.imageAsset',
      url: asset.url,
      originalFilename: asset.originalFilename,
      size: asset.size,
      metadata: asset.metadata as any,
      _createdAt: asset._createdAt,
      _updatedAt: asset._updatedAt
    }
  } catch (error) {
    console.error('上傳圖片到 Sanity 時發生錯誤:', error)
    return null
  }
}

/**
 * 生成 Sanity 圖片 URL 與參數
 */
const builder = imageUrlBuilder(client as any)

export function buildSanityImageUrl(image: SanityImage, width?: number, height?: number, quality?: number): string {
  try {
    let b = builder.image(image).auto('format')
    if (width) b = b.width(width)
    if (height) b = b.height(height)
    if (quality) b = b.quality(quality)
    // 預設以 cover/max 方式縮放，避免拉伸
    b = b.fit('max')
    return b.url()
  } catch {
    // 後備：回退至原始 URL（不含轉換參數）
    return image.url
  }
}
