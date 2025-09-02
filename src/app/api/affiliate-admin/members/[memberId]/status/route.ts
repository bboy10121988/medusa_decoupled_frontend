import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const settingsPath = path.join(dataDir, 'affiliate-settings.json')

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params
    const { status } = await request.json()

    if (!['active', 'pending', 'suspended'].includes(status)) {
      return NextResponse.json(
        { error: '無效的狀態值' },
        { status: 400 }
      )
    }

    // 確保數據目錄存在
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // 讀取現有設置
    let settings = { settings: {} }
    if (fs.existsSync(settingsPath)) {
      const settingsContent = fs.readFileSync(settingsPath, 'utf8')
      settings = JSON.parse(settingsContent)
    }

    // 檢查會員是否存在
    if (!settings.settings[memberId]) {
      return NextResponse.json(
        { error: '會員不存在' },
        { status: 404 }
      )
    }

    // 更新狀態
    settings.settings[memberId] = {
      ...settings.settings[memberId],
      status: status,
      updatedAt: new Date().toISOString()
    }

    // 保存到檔案
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))

    return NextResponse.json({ 
      success: true,
      message: '會員狀態更新成功'
    })
  } catch (error) {
    console.error('更新會員狀態錯誤:', error)
    return NextResponse.json(
      { error: '無法更新會員狀態' },
      { status: 500 }
    )
  }
}
