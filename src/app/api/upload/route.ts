/**
 * GrapesJS AssetManager 上傳端點
 * 雖然我們主要使用自定義的 uploadFile 函數，
 * 但提供這個端點以防 GrapesJS 需要標準上傳支持
 */

import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToSanity, buildSanityImageUrl } from '@/lib/services/sanity-media-service'
import { compressImage } from '@/lib/image-compression'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: '沒有找到文件' }, { status: 400 })
    }

    const uploadedAssets = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue
      }

      try {
        console.log(`🖼️ API 處理上傳圖片: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`)
        
        // 壓縮圖片
        const compressedDataUrl = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 800,
          quality: 0.8,
          maxSizeKB: 500
        })
        
        // 將壓縮後的 base64 轉換回 File 對象
        const response = await fetch(compressedDataUrl)
        const blob = await response.blob()
        const compressedFile = new File([blob], file.name, { type: 'image/jpeg' })
        
        // 上傳到 Sanity
        const uploadedImage = await uploadImageToSanity(compressedFile)
        
        if (uploadedImage) {
          const imageUrl = buildSanityImageUrl(uploadedImage, 1200, 800, 90)
          uploadedAssets.push({
            type: 'image',
            src: imageUrl,
            height: uploadedImage.metadata.dimensions.height,
            width: uploadedImage.metadata.dimensions.width,
            name: uploadedImage.originalFilename || file.name
          })
          console.log(`✅ API 圖片已上傳到 Sanity: ${file.name}`)
        }
      } catch (error) {
        console.error(`❌ API 處理圖片失敗: ${file.name}`, error)
      }
    }

    return NextResponse.json({ 
      data: uploadedAssets,
      message: `成功上傳 ${uploadedAssets.length} 張圖片`
    })

  } catch (error) {
    console.error('上傳 API 錯誤:', error)
    return NextResponse.json(
      { error: '上傳失敗，請重試' }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  // 返回 AssetManager 可用的方法說明
  return NextResponse.json({
    message: 'GrapesJS AssetManager API',
    methods: {
      'POST': 'Upload images to Sanity via AssetManager'
    },
    usage: 'POST multipart/form-data with files[] field'
  })
}