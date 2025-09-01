import { NextResponse } from 'next/server'
import { retrieveAffiliateAdmin } from '@lib/data/affiliate-admin-auth'
import { promises as fs } from 'fs'
import path from 'path'

type AffiliateApplication = {
  id: string
  email: string
  displayName: string
  website?: string
  passwordHash: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  rejectionReason?: string
  reviewedBy?: string
  reviewedAt?: string
}

type StoreShape = {
  applications: AffiliateApplication[]
  accounts: any[]
  rejected: AffiliateApplication[]
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await retrieveAffiliateAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { id } = await params
  
  try {
    // 獲取拒絕原因（如果有的話）
    let rejectionReason = ''
    try {
      const body = await req.json()
      rejectionReason = body.reason || body.rejectionReason || ''
    } catch {
      // 如果沒有 body 或解析失敗，使用空字串
    }
    
    // 直接操作 JSON 檔案
    const dataPath = path.join(process.cwd(), '..', 'backend', 'data', 'affiliate.json')
    console.log('Rejecting application directly in JSON:', dataPath, 'ID:', id)
    
    // 讀取當前資料
    let store: StoreShape
    try {
      const fileContent = await fs.readFile(dataPath, 'utf8')
      store = JSON.parse(fileContent)
    } catch (error) {
      console.error('Error reading JSON file:', error)
      return NextResponse.json({ error: 'Failed to read data file' }, { status: 500 })
    }
    
    // 找到要拒絕的申請
    const appIndex = store.applications.findIndex((a) => a.id === id)
    if (appIndex === -1) {
      console.error('Application not found:', id)
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    
    const app = store.applications[appIndex]
    console.log('Found application to reject:', app.email)
    
    // 從 applications 移除
    store.applications.splice(appIndex, 1)
    
    // 設置拒絕狀態和審核資訊
    app.status = 'rejected'
    app.rejectionReason = rejectionReason || '未提供拒絕原因'
    app.reviewedBy = admin.email
    app.reviewedAt = new Date().toISOString()
    
    // 新增到 rejected
    store.rejected.push(app)
    
    // 寫回檔案
    await fs.writeFile(dataPath, JSON.stringify(store, null, 2))
    console.log('Application rejected and moved to rejected list:', app.id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Application rejected successfully',
      rejection: {
        id: app.id,
        email: app.email,
        displayName: app.displayName,
        status: 'rejected',
        reason: rejectionReason
      }
    })
    
  } catch (error) {
    console.error('Error rejecting application:', error)
    return NextResponse.json({ 
      error: 'Failed to reject application',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
