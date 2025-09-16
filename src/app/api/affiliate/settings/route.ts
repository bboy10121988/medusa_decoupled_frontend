import { NextRequest, NextResponse } from 'next/server'
import { retrieveAffiliate } from '@lib/data/affiliate-auth'
import { promises as fs } from 'fs'
import path from 'path'

type AffiliateSettings = {
  displayName: string
  website?: string
  payoutMethod: 'bank_transfer' | 'paypal' | 'stripe'
  paypalEmail?: string
  bankAccount?: {
    bankName: string
    accountName: string
    accountNumber: string
    branch?: string
  }
  stripeAccountId?: string
  notifications: {
    emailOnNewOrder: boolean
    emailOnPayment: boolean
    emailOnCommissionUpdate: boolean
  }
  profile: {
    company?: string
    phone?: string
    address?: string
    taxId?: string
  }
}

type AffiliateSettingsData = {
  settings: { [affiliateId: string]: AffiliateSettings }
  lastUpdated: string
}

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'affiliate-settings.json')

// 確保數據文件存在
async function ensureSettingsFile(): Promise<AffiliateSettingsData> {
  try {
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true })
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    const initialData: AffiliateSettingsData = {
      settings: {},
      lastUpdated: new Date().toISOString()
    }
    await saveSettingsData(initialData)
    return initialData
  }
}

// 儲存數據
async function saveSettingsData(data: AffiliateSettingsData): Promise<void> {
  data.lastUpdated = new Date().toISOString()
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2))
}

// 獲取預設設定
function getDefaultSettings(): AffiliateSettings {
  return {
    displayName: '聯盟會員',
    payoutMethod: 'bank_transfer',
    notifications: {
      emailOnNewOrder: true,
      emailOnPayment: true,
      emailOnCommissionUpdate: false
    },
    profile: {}
  }
}

// GET - 獲取設定
export async function GET() {
  try {
    const session = await retrieveAffiliate()
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const settingsData = await ensureSettingsFile()
    const userSettings = settingsData.settings[session.id] || getDefaultSettings()

    return NextResponse.json(userSettings)
  } catch (error) {
    console.error('獲取設定失敗:', error)
    return NextResponse.json({ error: '獲取設定失敗' }, { status: 500 })
  }
}

// PUT - 更新設定
export async function PUT(request: NextRequest) {
  try {
    const session = await retrieveAffiliate()
    if (!session) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const newSettings = await request.json() as AffiliateSettings

    // 基本驗證
    if (!newSettings.displayName?.trim()) {
      return NextResponse.json({ error: '顯示名稱不能為空' }, { status: 400 })
    }

    if (newSettings.payoutMethod === 'bank_transfer') {
      if (!newSettings.bankAccount?.bankName || 
          !newSettings.bankAccount?.accountName || 
          !newSettings.bankAccount?.accountNumber) {
        return NextResponse.json({ error: '銀行轉帳需要完整的帳戶資訊' }, { status: 400 })
      }
    }

    if (newSettings.payoutMethod === 'paypal' && !newSettings.paypalEmail) {
      return NextResponse.json({ error: 'PayPal 收款需要提供電子郵件' }, { status: 400 })
    }

    // 儲存設定
    const settingsData = await ensureSettingsFile()
    settingsData.settings[session.id] = newSettings
    await saveSettingsData(settingsData)

    console.log(`💾 聯盟會員 ${session.id} 更新設定`)

    return NextResponse.json({ 
      success: true,
      settings: newSettings
    })
  } catch (error) {
    console.error('更新設定失敗:', error)
    return NextResponse.json({ error: '更新設定失敗' }, { status: 500 })
  }
}
