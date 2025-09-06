import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { SettlementsData, Settlement } from '../../../../../../types/affiliate'

const dataDir = path.join(process.cwd(), 'data')
const settlementsPath = path.join(dataDir, 'affiliate-settlements.json')

export async function POST(
  request: Request,
  { params }: { params: Promise<{ settlementId: string }> }
) {
  try {
    const { settlementId } = await params

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

    // 查找要處理的結算
    const settlementIndex = settlements.settlements.findIndex(
      (s: Settlement) => s.id === settlementId
    )

    if (settlementIndex === -1) {
      return NextResponse.json(
        { error: '結算不存在' },
        { status: 404 }
      )
    }

    const settlement = settlements.settlements[settlementIndex]

    if (settlement.status !== 'pending') {
      return NextResponse.json(
        { error: '只能處理待處理狀態的結算' },
        { status: 400 }
      )
    }

    // 模擬處理結算（在實際應用中這裡會調用支付服務）
    // 這裡我們直接標記為已完成
    settlements.settlements[settlementIndex] = {
      ...settlement,
      status: 'completed',
      processedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 保存到檔案
    fs.writeFileSync(settlementsPath, JSON.stringify(settlements, null, 2))

    return NextResponse.json({ 
      success: true,
      message: '結算處理成功'
    })
  } catch (error) {
    console.error('處理結算錯誤:', error)
    return NextResponse.json(
      { error: '無法處理結算' },
      { status: 500 }
    )
  }
}
