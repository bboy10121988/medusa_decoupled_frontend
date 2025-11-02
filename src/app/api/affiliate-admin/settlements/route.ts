import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { SettlementsData, Settlement } from '../../../../types/affiliate'

const dataDir = path.join(process.cwd(), 'data')
const settlementsPath = path.join(dataDir, 'affiliate-settlements.json')
const settingsPath = path.join(dataDir, 'affiliate-settings.json')

export async function GET() {
  try {
    // 讀取結算數據
    let settlements: SettlementsData = { settlements: [] }
    if (fs.existsSync(settlementsPath)) {
      const settlementsContent = fs.readFileSync(settlementsPath, 'utf8')
      settlements = JSON.parse(settlementsContent)
    }

    // 讀取設置數據來獲取會員名稱
    let settings: { settings: Record<string, any> } = { settings: {} }
    if (fs.existsSync(settingsPath)) {
      const settingsContent = fs.readFileSync(settingsPath, 'utf8')
      settings = JSON.parse(settingsContent)
    }

    // 豐富結算數據
    const enrichedSettlements = settlements.settlements.map((settlement: Settlement) => {
      const affiliateSettings = settings.settings[settlement.affiliateId] || {}
      
      return {
        ...settlement,
        affiliateName: affiliateSettings.profile?.displayName || 
                      affiliateSettings.profile?.email || 
                      settlement.affiliateId
      }
    })

    // 按創建時間排序
    enrichedSettlements.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ settlements: enrichedSettlements })
  } catch (error) {
    // console.error('獲取結算列表錯誤:', error)
    return NextResponse.json(
      { error: '無法獲取結算列表' },
      { status: 500 }
    )
  }
}
