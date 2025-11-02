import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// 後端資料檔案路徑
const backendDataPath = path.join('/Users/raychou/tim-web/medusa_decoupled/backend_vm/medusa-backend/src/data/affiliate.json')

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { status } = await request.json()
    
    // 驗證狀態值
    if (!['active', 'pending', 'suspended'].includes(status)) {
      return NextResponse.json(
        { error: '無效的狀態值' },
        { status: 400 }
      )
    }

    // 讀取現有的聯盟資料
    if (!fs.existsSync(backendDataPath)) {
      return NextResponse.json(
        { error: '找不到聯盟資料檔案' },
        { status: 404 }
      )
    }

    const backendContent = fs.readFileSync(backendDataPath, 'utf8')
    const affiliateData = JSON.parse(backendContent)

    // 首先檢查是否為現有的聯盟夥伴
    const affiliateIndex = affiliateData.affiliates.findIndex((affiliate: any) => affiliate.id === id)
    
    if (affiliateIndex !== -1) {
      // 更新現有聯盟夥伴的狀態
      affiliateData.affiliates[affiliateIndex].status = status
      affiliateData.affiliates[affiliateIndex].updated_at = new Date().toISOString()
    } else {
      // 檢查是否為待審核的申請
      const applicationIndex = affiliateData.applications.findIndex((app: any) => app.id === id)
      
      if (applicationIndex === -1) {
        return NextResponse.json(
          { error: '找不到指定的聯盟會員或申請' },
          { status: 404 }
        )
      }

      const application = affiliateData.applications[applicationIndex]

      if (status === 'active') {
        // 申請通過，移動到聯盟夥伴列表
        const newAffiliate = {
          id: `aff_${Date.now()}`, // 生成新的聯盟夥伴ID
          name: application.name,
          email: application.email,
          referral_code: generateReferralCode(),
          commission_rate: 0.05, // 預設佣金率
          status: 'active',
          total_earnings: 0,
          pending_earnings: 0,
          website: application.website,
          social_media: application.social_media ? parseJsonString(application.social_media) : {},
          created_at: application.created_at,
          updated_at: new Date().toISOString()
        }

        // 添加到聯盟夥伴列表
        affiliateData.affiliates.push(newAffiliate)
        
        // 更新申請狀態為已批准
        affiliateData.applications[applicationIndex].status = 'approved'
        affiliateData.applications[applicationIndex].updated_at = new Date().toISOString()
        
      } else if (status === 'suspended') {
        // 申請被拒絕
        affiliateData.applications[applicationIndex].status = 'rejected'
        affiliateData.applications[applicationIndex].updated_at = new Date().toISOString()
      }
    }

    // 寫回檔案
    fs.writeFileSync(backendDataPath, JSON.stringify(affiliateData, null, 2))

    return NextResponse.json({ 
      success: true, 
      message: '狀態更新成功',
      data: {
        id,
        status,
        updated_at: new Date().toISOString()
      }
    })
  } catch (error) {
    // console.error('更新狀態錯誤:', error)
    return NextResponse.json(
      { error: '無法更新狀態' },
      { status: 500 }
    )
  }
}

// 生成推薦碼的輔助函數
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 解析社群媒體字符串的輔助函數
function parseJsonString(str: string): any {
  try {
    // 如果已經是對象，直接返回
    if (typeof str === 'object') return str
    
    // 嘗試解析 JSON
    return JSON.parse(str)
  } catch {
    // 如果不是 JSON，嘗試解析為簡單的 key: value 格式
    const result: any = {}
    const pairs = str.split(', ')
    pairs.forEach(pair => {
      const [key, value] = pair.split(': ')
      if (key && value) {
        result[key.toLowerCase().trim()] = value.trim()
      }
    })
    return result
  }
}
