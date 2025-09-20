import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

    if (!token) {
      console.error('[Sanity Upload] 缺少 server-side Sanity token。請在 .env.local 中加入 SANITY_API_TOKEN 或 SANITY_WRITE_TOKEN')
      return NextResponse.json({ 
        success: false, 
        error: '媒體上傳功能需要設定 Sanity API Token。請聯繫開發者設定 SANITY_API_TOKEN 環境變數。' 
      }, { status: 503 })
    }
    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Missing NEXT_PUBLIC_SANITY_PROJECT_ID' }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // 基本安全檢查：限制檔案大小與類型
    const MAX_SIZE_BYTES = 6 * 1024 * 1024 // 6MB
    if (typeof (file as any).size === 'number' && (file as any).size > MAX_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: 'File too large (max 6MB)' }, { status: 413 })
    }
    const mime = (file as any).type as string | undefined
    if (!mime || !mime.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Only image uploads are allowed' }, { status: 415 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const writeClient = createClient({
      projectId,
      dataset,
      apiVersion: '2023-05-30',
      token,
      useCdn: false,
      perspective: 'published',
    })

    const sanitizedName = (file.name || 'upload.jpg').replace(/[^a-zA-Z0-9._-]+/g, '_')
    const asset = await writeClient.assets.upload('image', buffer, {
      filename: sanitizedName,
      contentType: mime || 'image/jpeg',
    })

    return NextResponse.json({
      success: true,
      image: {
        _id: asset._id,
        _type: 'sanity.imageAsset',
        url: asset.url,
        originalFilename: asset.originalFilename,
        size: asset.size,
        metadata: asset.metadata,
        _createdAt: asset._createdAt,
        _updatedAt: asset._updatedAt,
      },
    })
  } catch (error: any) {
    console.error('Sanity image upload error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
