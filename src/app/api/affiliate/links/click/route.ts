import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { AffiliateLink } from '../../../../../types/affiliate'

const STORAGE_MODE = process.env.AFFILIATE_STORAGE_MODE || 'memory'
const STORAGE_DIR = path.join(process.cwd(), 'data', 'affiliate-links')
const STORAGE_FILE = path.join(STORAGE_DIR, 'links.json')

let memoryStorage: { [affiliateId: string]: AffiliateLink[] } = {}

async function loadLinksFromFile(): Promise<{ [affiliateId: string]: AffiliateLink[] }> {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return {}
  }
}

async function saveLinksToFile(allLinks: { [affiliateId: string]: AffiliateLink[] }) {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
    await fs.writeFile(STORAGE_FILE, JSON.stringify(allLinks, null, 2), 'utf-8')
  } catch (error) {
    // console.error('儲存連結到檔案失敗:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { linkId, affiliateId } = await request.json()

    if (!linkId || !affiliateId) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 })
    }

    // 獲取所有連結
    let allLinks: { [affiliateId: string]: AffiliateLink[] }
    if (STORAGE_MODE === 'json') {
      allLinks = await loadLinksFromFile()
    } else {
      allLinks = memoryStorage
    }

    // 找到並更新指定連結的點擊數
    const affiliateLinks = allLinks[affiliateId] || []
    const linkIndex = affiliateLinks.findIndex(link => link.id === linkId)
    
    if (linkIndex !== -1) {
      affiliateLinks[linkIndex].clicks += 1
      
      // 保存更新
      if (STORAGE_MODE === 'json') {
        await saveLinksToFile(allLinks)
      } else {
        memoryStorage = allLinks
      }
      
      return NextResponse.json({ 
        success: true, 
        clickCount: affiliateLinks[linkIndex].clicks 
      })
    } else {
      return NextResponse.json({ error: '連結不存在' }, { status: 404 })
    }

  } catch (error) {
    // console.error('更新點擊數失敗:', error)
    return NextResponse.json({ error: '更新點擊數失敗' }, { status: 500 })
  }
}
