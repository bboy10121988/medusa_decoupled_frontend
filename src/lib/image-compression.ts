/**
 * 圖片壓縮工具函數
 */

interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

/**
 * 壓縮圖片
 * @param file 圖片文件或 URL
 * @param options 壓縮選項
 * @returns Promise<string> 壓縮後的 base64 字符串
 */
export async function compressImage(
  input: File | string,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.8,
    maxSizeKB = 500
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // 計算壓縮後的尺寸
        let { width, height } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        )

        canvas.width = width
        canvas.height = height

        if (!ctx) {
          throw new Error('無法獲取 canvas context')
        }

        // 繪製壓縮後的圖片
        ctx.drawImage(img, 0, 0, width, height)

        // 轉換為 base64
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality)

        // 檢查文件大小，如果還是太大就進一步壓縮
        let currentQuality = quality
        while (getBase64SizeKB(compressedDataUrl) > maxSizeKB && currentQuality > 0.1) {
          currentQuality -= 0.1
          compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality)
        }

        // 如果尺寸還是太大，進一步縮小圖片
        if (getBase64SizeKB(compressedDataUrl) > maxSizeKB) {
          width = Math.floor(width * 0.8)
          height = Math.floor(height * 0.8)
          
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6)
        }

        console.log(`圖片壓縮完成: ${img.width}x${img.height} -> ${width}x${height}, 大小: ${getBase64SizeKB(compressedDataUrl).toFixed(1)}KB`)
        resolve(compressedDataUrl)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('無法載入圖片'))
    }

    if (typeof input === 'string') {
      // 如果是 URL，直接設置
      img.crossOrigin = 'anonymous' // 處理跨域問題
      img.src = input
    } else {
      // 如果是 File，轉換為 URL
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('無法讀取文件'))
      reader.readAsDataURL(input)
    }
  })
}

/**
 * 計算保持比例的壓縮尺寸
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth
  let height = originalHeight

  // 計算縮放比例
  const widthRatio = maxWidth / originalWidth
  const heightRatio = maxHeight / originalHeight
  const ratio = Math.min(widthRatio, heightRatio, 1) // 不放大，只縮小

  width = Math.floor(originalWidth * ratio)
  height = Math.floor(originalHeight * ratio)

  return { width, height }
}

/**
 * 計算 base64 字符串的大小（KB）
 */
function getBase64SizeKB(base64String: string): number {
  // base64 字符串大小約等於原始數據的 4/3
  const base64Data = base64String.split(',')[1] || base64String
  const sizeInBytes = (base64Data.length * 3) / 4
  return sizeInBytes / 1024
}

/**
 * 批量壓縮 HTML 中的圖片
 */
export async function compressImagesInHtml(html: string): Promise<string> {
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g
  const matches = Array.from(html.matchAll(imgRegex))
  
  if (matches.length === 0) {
    return html
  }

  console.log(`發現 ${matches.length} 張圖片需要處理`)
  
  let compressedHtml = html

  for (const match of matches) {
    const [fullMatch, src] = match
    
    // 跳過已經是 base64 或相對路徑的圖片
    if (src.startsWith('data:') || !src.startsWith('http')) {
      continue
    }

    try {
      console.log(`壓縮圖片: ${src.substring(0, 50)}...`)
      const compressedSrc = await compressImage(src, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.7,
        maxSizeKB: 300 // 每張圖片限制為 300KB
      })

      // 替換原始圖片 URL
      compressedHtml = compressedHtml.replace(src, compressedSrc)
    } catch (error) {
      console.warn(`壓縮圖片失敗: ${src}`, error)
      // 壓縮失敗時保留原始圖片
    }
  }

  return compressedHtml
}