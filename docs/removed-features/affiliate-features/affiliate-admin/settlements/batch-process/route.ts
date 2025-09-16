import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { SettlementsData, Settlement } from '../../../../../types/affiliate'

const dataDir = path.join(process.cwd(), 'data')
const settlementsPath = path.join(dataDir, 'affiliate-settlements.json')

export async function POST(request: Request) {
  try {
    const { settlementIds } = await request.json()

    if (!Array.isArray(settlementIds) || settlementIds.length === 0) {
      return NextResponse.json(
        { error: '無效的結算ID列表' },
        { status: 400 }
      )
    }

    // 確保數據目錄存在
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // 讀取現有結算
    let settlements: SettlementsData = { settlements: [] }
    if (fs.existsSync(settlementsPath)) {
      const settlementsContent = fs.readFileSync(settlementsPath, 'utf8')
      settlements = JSON.parse(settlementsContent)
    }

    let processedCount = 0
    let failedCount = 0

    // 批量處理結算
    settlements.settlements = settlements.settlements.map((settlement: Settlement) => {
      if (settlementIds.includes(settlement.id) && settlement.status === 'pending') {
        processedCount++
        return {
          ...settlement,
          status: 'completed',
          processedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      } else if (settlementIds.includes(settlement.id)) {
        failedCount++
      }
      return settlement
    })

    // 保存到檔案
    fs.writeFileSync(settlementsPath, JSON.stringify(settlements, null, 2))

    return NextResponse.json({ 
      success: true,
      message: `批量處理完成: ${processedCount} 筆成功, ${failedCount} 筆失敗`,
      processedCount,
      failedCount
    })
  } catch (error) {
    console.error('批量處理結算錯誤:', error)
    return NextResponse.json(
      { error: '無法批量處理結算' },
      { status: 500 }
    )
  }
}
