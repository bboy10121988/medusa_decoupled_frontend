import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { promises as fs } from 'fs'
import path from 'path'
import type { AffiliateLink } from '../../../../types/affiliate'

// 記憶體儲存 (開發模式)
const memoryStorage: { [affiliateId: string]: AffiliateLink[] } = {}

// 檔案儲存設定
const STORAGE_MODE = process.env.AFFILIATE_STORAGE_MODE || 'memory' // 'memory' | 'json'
const STORAGE_DIR = path.join(process.cwd(), 'data', 'affiliate-links')
const STORAGE_FILE = path.join(STORAGE_DIR, 'links.json')

// 確保儲存目錄存在
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
  } catch (error) {
    // 目錄已存在或其他錯誤，繼續執行
  }
}

// 從檔案讀取所有連結
async function loadLinksFromFile(): Promise<{ [affiliateId: string]: AffiliateLink[] }> {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(STORAGE_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // 檔案不存在或讀取錯誤，返回空物件
    return {}
  }
}

// 儲存所有連結到檔案
async function saveLinksToFile(allLinks: { [affiliateId: string]: AffiliateLink[] }) {
  try {
    await ensureStorageDir()
    await fs.writeFile(STORAGE_FILE, JSON.stringify(allLinks, null, 2), 'utf-8')
  } catch (error) {
    // console.error('儲存連結到檔案失敗:', error)
    throw error
  }
}

// 取得聯盟會員的連結
async function getAffiliateLinks(affiliateId: string): Promise<AffiliateLink[]> {
  if (STORAGE_MODE === 'json') {
    const allLinks = await loadLinksFromFile()
    return allLinks[affiliateId] || []
  } else {
    return memoryStorage[affiliateId] || []
  }
}

// 新增連結
async function addAffiliateLink(affiliateId: string, link: AffiliateLink) {
  if (STORAGE_MODE === 'json') {
    const allLinks = await loadLinksFromFile()
    if (!allLinks[affiliateId]) {
      allLinks[affiliateId] = []
    }
    allLinks[affiliateId].push(link)
    await saveLinksToFile(allLinks)
  } else {
    if (!memoryStorage[affiliateId]) {
      memoryStorage[affiliateId] = []
    }
    memoryStorage[affiliateId].push(link)
  }
}

// 刪除連結
async function removeAffiliateLink(affiliateId: string, linkId: string) {
  if (STORAGE_MODE === 'json') {
    const allLinks = await loadLinksFromFile()
    if (allLinks[affiliateId]) {
      allLinks[affiliateId] = allLinks[affiliateId].filter(link => link.id !== linkId)
      await saveLinksToFile(allLinks)
    }
  } else {
    if (memoryStorage[affiliateId]) {
      memoryStorage[affiliateId] = memoryStorage[affiliateId].filter(link => link.id !== linkId)
    }
  }
}

// 輔助函數：獲取當前聯盟會員
async function getCurrentAffiliate() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('_affiliate_jwt')?.value
    if (!token) return null
    const json = Buffer.from(token, 'base64').toString()
    return JSON.parse(json)
  } catch {
    return null
  }
}

export async function GET() {
  const affiliate = await getCurrentAffiliate()
  if (!affiliate) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  try {
    const links = await getAffiliateLinks(affiliate.id)
    // console.log(`取得聯盟會員 ${affiliate.id} 的 ${links.length} 個連結 (儲存模式: ${STORAGE_MODE})`)
    
    return NextResponse.json({ links })
  } catch (error) {
    // console.error('獲取連結失敗:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const affiliate = await getCurrentAffiliate()
  if (!affiliate) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, targetUrl, utmParams } = body

    // 驗證必填欄位
    if (!name || !targetUrl) {
      return NextResponse.json(
        { error: '缺少必填欄位' },
        { status: 400 }
      )
    }

    // 建構完整的推廣連結
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const url = new URL(targetUrl, baseUrl)
    
    // 添加聯盟參數
    url.searchParams.set('ref', affiliate.id)
    url.searchParams.set('utm_source', utmParams?.utm_source || 'affiliate')
    url.searchParams.set('utm_medium', utmParams?.utm_medium || 'referral')
    url.searchParams.set('utm_campaign', utmParams?.utm_campaign || name)
    
    // 創建新連結
    const newLink: AffiliateLink = {
      id: `lnk_${Date.now()}`,
      name,
      url: url.toString(),
      createdAt: new Date().toISOString(),
      clicks: 0,
      conversions: 0,
    }

    // 儲存連結
    await addAffiliateLink(affiliate.id, newLink)
    
    // console.log('創建新的聯盟連結:', {
      // affiliateId: affiliate.id,
      // linkId: newLink.id,
      // name,
      // targetUrl,
      // finalUrl: newLink.url,
      // utmParams,
      // storageMode: STORAGE_MODE
    // })

    return NextResponse.json({ 
      success: true, 
      link: newLink,
      message: '連結創建成功' 
    })

  } catch (error) {
    // console.error('創建連結失敗:', error)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const affiliate = await getCurrentAffiliate()
  if (!affiliate) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('id')

    if (!linkId) {
      return NextResponse.json(
        { error: '缺少連結 ID' },
        { status: 400 }
      )
    }

    // 刪除連結
    await removeAffiliateLink(affiliate.id, linkId)
    
    // console.log('刪除聯盟連結:', {
      // affiliateId: affiliate.id,
      // linkId,
      // storageMode: STORAGE_MODE
    // })

    return NextResponse.json({ 
      success: true,
      message: '連結已刪除' 
    })

  } catch (error) {
    // console.error('刪除連結失敗:', error)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
