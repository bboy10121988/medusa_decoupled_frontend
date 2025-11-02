import { NextResponse } from 'next/server'
import * as fs from 'fs'

// 定義會員資料的類型
type Member = {
  id: string
  email: string
  displayName: string
  status: 'active' | 'pending' | 'suspended'
  totalOrders: number
  totalRevenue: number
  totalCommission: number
  registeredAt: string
  lastActive: string
  referralCode: string
  commissionRate: number
  website?: string
  socialMedia?: string
  description?: string // 申請說明
}

// 後端資料檔案路徑 - 指向VM後端
const backendUrl = 'http://35.236.182.29:9000'
const backendDataPath = '/Users/raychou/tim-web/medusa_decoupled/backend_vm/medusa-backend/src/data/affiliate.json'

export async function GET() {
  try {
    // 讀取後端的真實聯盟資料
    let affiliateData: any = { affiliates: [], applications: [] }
    
    try {
      // 首先嘗試使用本機後端 API
      const membersResponse = await fetch(`${backendUrl}/admin/affiliate-members`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      })
      
      if (membersResponse.ok) {
        affiliateData = await membersResponse.json()
        // console.log('Members data loaded from backend API:', affiliateData.affiliates?.length || 0)
      } else {
        // console.warn('Backend API not available, falling back to file system')
        // 回退到讀取檔案
        if (fs.existsSync(backendDataPath)) {
          const backendContent = fs.readFileSync(backendDataPath, 'utf8')
          affiliateData = JSON.parse(backendContent)
          // console.log('Members data loaded from file:', affiliateData.affiliates?.length || 0)
        }
      }
    } catch (fetchError) {
      // console.warn('Failed to fetch from backend API, falling back to file system:', fetchError)
      // 回退到讀取檔案
      if (fs.existsSync(backendDataPath)) {
        const backendContent = fs.readFileSync(backendDataPath, 'utf8')
        affiliateData = JSON.parse(backendContent)
        // console.log('Members data loaded from file (fallback):', affiliateData.affiliates?.length || 0)
      }
    }

    // 將已批准的聯盟夥伴轉換為前端需要的格式
    const approvedMembers: Member[] = affiliateData.affiliates.map((affiliate: any) => {
      // 計算總收入和總佣金
      const totalRevenue = affiliate.total_earnings + affiliate.pending_earnings
      const totalCommission = affiliate.total_earnings
      
      // 估算訂單數量（基於收入，假設平均單價為1000元）
      const totalOrders = Math.floor(totalRevenue / 1000) || 0
      
      // 解析社群媒體資訊
      const socialMediaText = affiliate.social_media ? 
        Object.entries(affiliate.social_media)
          .map(([platform, url]) => `${platform}: ${url}`)
          .join(', ') : ''

      return {
        id: affiliate.id,
        email: affiliate.email,
        displayName: affiliate.name,
        status: affiliate.status as 'active' | 'pending' | 'suspended',
        totalOrders,
        totalRevenue,
        totalCommission,
        registeredAt: affiliate.created_at,
        lastActive: affiliate.updated_at,
        referralCode: affiliate.referral_code,
        commissionRate: affiliate.commission_rate,
        website: affiliate.website,
        socialMedia: socialMediaText
      }
    })

    // 將待審核的申請轉換為前端需要的格式
    const pendingApplications: Member[] = affiliateData.applications
      .filter((app: any) => app.status === 'pending')
      .map((app: any) => {
        return {
          id: app.id,
          email: app.email,
          displayName: app.name,
          status: 'pending' as const,
          totalOrders: 0,
          totalRevenue: 0,
          totalCommission: 0,
          registeredAt: app.created_at,
          lastActive: app.updated_at,
          referralCode: '', // 申請階段還沒有推薦碼
          commissionRate: 0.05, // 預設佣金率
          website: app.website,
          socialMedia: app.social_media,
          description: app.description // 新增申請說明
        }
      })

    // 合併所有會員資料
    const members = [...approvedMembers, ...pendingApplications]

    // 按註冊時間排序（最新的在前）
    members.sort((a: Member, b: Member) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())

    return NextResponse.json({ members })
  } catch (error) {
    // console.error('獲取會員列表錯誤:', error)
    return NextResponse.json(
      { error: '無法獲取會員列表' },
      { status: 500 }
    )
  }
}
