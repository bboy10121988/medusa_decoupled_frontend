import { NextResponse } from 'next/server'
import { retrieveAffiliateAdmin } from '@lib/data/affiliate-admin-auth'
import type { AffiliateApplication } from 'types/affiliate-admin'
import { promises as fs } from 'fs'
import path from 'path'

type StoreShape = {
  applications: any[]
  accounts: any[]
  rejected: any[]
}

export async function GET() {
  const admin = await retrieveAffiliateAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // 直接讀取 JSON 檔案
    const dataPath = path.join(process.cwd(), '..', 'backend', 'data', 'affiliate.json')
    console.log('Reading JSON file from:', dataPath)
    
    let applications: any[] = []
    
    try {
      const fileContent = await fs.readFile(dataPath, 'utf8')
      const data: StoreShape = JSON.parse(fileContent)
      applications = data.applications || []
    } catch (fileError) {
      console.error('Error reading JSON file:', fileError)
      // 如果檔案不存在或讀取失敗，回傳空陣列
      applications = []
    }
    
    console.log('Applications loaded from JSON:', applications.length)
    
    // 標準化資料格式以符合前端需求
    const formattedApplications: AffiliateApplication[] = applications.map((app: any) => ({
      id: app.id,
      email: app.email,
      displayName: app.displayName,
      website: app.website || '',
      created_at: app.created_at,
      status: app.status || 'pending'
    }))
    
    return NextResponse.json({ 
      applications: formattedApplications,
      count: formattedApplications.length,
      source: 'direct-json'
    })
    
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch applications',
      applications: [],
      count: 0
    }, { status: 500 })
  }
}
