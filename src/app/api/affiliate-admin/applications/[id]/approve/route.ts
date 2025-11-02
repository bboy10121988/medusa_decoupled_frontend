import { NextResponse } from 'next/server'
import { retrieveAffiliateAdmin } from '@lib/data/affiliate-admin-auth'
import { promises as fs } from 'fs'

type AffiliateApplication = {
  id: string
  email: string
  displayName: string
  website?: string
  passwordHash: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

type AffiliateAccount = {
  id: string
  email: string
  displayName: string
  website?: string
  passwordHash: string
  status: 'approved'
  created_at: string
  reviewedBy?: string
  reviewedAt?: string
}

type StoreShape = {
  applications: AffiliateApplication[]
  accounts: AffiliateAccount[]
  rejected: AffiliateApplication[]
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await retrieveAffiliateAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { id } = await params
  
  try {
    // 首先嘗試使用VM後端 API
    const backendUrl = 'http://35.236.182.29:9000'
    
    try {
      const approveResponse = await fetch(`${backendUrl}/admin/affiliate-applications/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          reviewedBy: admin.email,
          reviewedAt: new Date().toISOString()
        }),
        cache: 'no-store',
      })
      
      if (approveResponse.ok) {
        const result = await approveResponse.json()
        // console.log('Application approved via backend API:', result)
        return NextResponse.json({ 
          success: true, 
          message: 'Application approved successfully',
          source: 'backend-api'
        })
      } else {
        // console.warn('Backend API not available, falling back to file system')
        // 回退到檔案系統操作
      }
    } catch (fetchError) {
      // console.warn('Failed to approve via backend API, falling back to file system:', fetchError)
      // 回退到檔案系統操作
    }
    
    // 直接操作 JSON 檔案（回退方案）
    const dataPath = '/Users/raychou/tim-web/medusa_decoupled/backend_vm/medusa-backend/src/data/affiliate.json'
    // console.log('Approving application directly in JSON:', dataPath, 'ID:', id)
    
    // 讀取當前資料
    let store: StoreShape
    try {
      const fileContent = await fs.readFile(dataPath, 'utf8')
      store = JSON.parse(fileContent)
    } catch (error) {
      // console.error('Error reading JSON file:', error)
      return NextResponse.json({ error: 'Failed to read data file' }, { status: 500 })
    }
    
    // 找到要審核的申請
    const appIndex = store.applications.findIndex((a) => a.id === id)
    if (appIndex === -1) {
      // console.error('Application not found:', id)
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    
    const app = store.applications[appIndex]
    // console.log('Found application to approve:', app.email)
    
    // 從 applications 移除
    store.applications.splice(appIndex, 1)
    
    // 新增到 accounts
    const newAccount: AffiliateAccount = {
      id: 'aff_' + Math.random().toString(36).slice(2, 10),
      email: app.email,
      displayName: app.displayName,
      website: app.website,
      passwordHash: app.passwordHash,
      status: 'approved',
      created_at: new Date().toISOString(),
      reviewedBy: admin.email,
      reviewedAt: new Date().toISOString()
    }
    
    store.accounts.push(newAccount)
    
    // 寫回檔案
    await fs.writeFile(dataPath, JSON.stringify(store, null, 2))
    // console.log('Application approved and moved to accounts:', newAccount.id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Application approved successfully',
      account: {
        id: newAccount.id,
        email: newAccount.email,
        displayName: newAccount.displayName,
        status: 'approved'
      }
    })
        
  } catch (error) {
    // console.error('Error approving application:', error)
    return NextResponse.json({ 
      error: 'Failed to approve application',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
