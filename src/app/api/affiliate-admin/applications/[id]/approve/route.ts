import { NextResponse } from 'next/server'
import { retrieveAffiliateAdmin } from '@lib/data/affiliate-admin-auth'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

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
    // 直接操作 JSON 檔案
    const dataPath = path.join(process.cwd(), '..', 'backend', 'data', 'affiliate.json')
    console.log('Approving application directly in JSON:', dataPath, 'ID:', id)
    
    // 讀取當前資料
    let store: StoreShape
    try {
      const fileContent = await fs.readFile(dataPath, 'utf8')
      store = JSON.parse(fileContent)
    } catch (error) {
      console.error('Error reading JSON file:', error)
      return NextResponse.json({ error: 'Failed to read data file' }, { status: 500 })
    }
    
    // 找到要審核的申請
    const appIndex = store.applications.findIndex((a) => a.id === id)
    if (appIndex === -1) {
      console.error('Application not found:', id)
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    
    const app = store.applications[appIndex]
    console.log('Found application to approve:', app.email)
    
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
    console.log('Application approved and moved to accounts:', newAccount.id)
    
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
    console.error('Error approving application:', error)
    return NextResponse.json({ 
      error: 'Failed to approve application',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
