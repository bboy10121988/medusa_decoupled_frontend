import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET() {
  try {
    // 首先嘗試從後端 API 獲取數據（與註冊路徑一致）
    const backendUrl = 'http://35.236.182.29:9000'
    
    try {
      console.log('Fetching applications from backend API...')
      const response = await fetch(`${backendUrl}/admin/affiliate/applications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      })
      
      if (response.ok) {
        const applications = await response.json()
        console.log('Successfully fetched applications from backend API')
        return NextResponse.json({ applications: applications || [] })
      }
      
      console.log('Backend API not available, falling back to file system')
    } catch (apiError) {
      console.log('Backend API error, falling back to file system:', apiError)
    }

    // 備用方案：讀取檔案系統（保持與註冊相同的資料來源）
    const backendPath = path.join(process.cwd(), '..', 'medusa_decoupled', 'backend_vm', 'medusa-backend', 'src', 'data', 'affiliate.json')
    
    if (fs.existsSync(backendPath)) {
      console.log('Reading applications from backend file system...')
      const fileContent = fs.readFileSync(backendPath, 'utf8')
      const data = JSON.parse(fileContent)
      const applications = data.applications || []
      
      console.log(`Found ${applications.length} applications from backend file`)
      return NextResponse.json({ applications })
    }

    // 如果後端檔案不存在，嘗試前端本地檔案
    const frontendPath = path.join(process.cwd(), 'src', 'data', 'affiliate.json')
    
    if (fs.existsSync(frontendPath)) {
      console.log('Reading applications from frontend file system...')
      const fileContent = fs.readFileSync(frontendPath, 'utf8')
      const data = JSON.parse(fileContent)
      const applications = data.applications || []
      
      console.log(`Found ${applications.length} applications from frontend file`)
      return NextResponse.json({ applications })
    }

    console.log('No data source found, returning empty array')
    return NextResponse.json({ applications: [] })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications', applications: [] },
      { status: 500 }
    )
  }
}
