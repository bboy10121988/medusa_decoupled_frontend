import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// 頁面資料類型
interface GrapesJSPage {
  id: string
  name: string
  html: string
  css: string
  components: any
  styles: any
  createdAt: string
  updatedAt: string
}

// 儲存設定
const STORAGE_DIR = path.join(process.cwd(), 'data', 'grapesjs-pages')
const PAGES_FILE = path.join(STORAGE_DIR, 'pages.json')

// 確保儲存目錄存在
async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
  } catch (error) {
    // 目錄已存在或其他錯誤，繼續執行
  }
}

// 從檔案讀取所有頁面
async function loadPagesFromFile(): Promise<{ [pageId: string]: GrapesJSPage }> {
  try {
    await ensureStorageDir()
    const data = await fs.readFile(PAGES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // 檔案不存在或讀取錯誤，返回空物件
    return {}
  }
}

// 儲存頁面到檔案
async function savePagesToFile(pages: { [pageId: string]: GrapesJSPage }) {
  try {
    await ensureStorageDir()
    await fs.writeFile(PAGES_FILE, JSON.stringify(pages, null, 2), 'utf-8')
  } catch (error) {
    // console.error('儲存頁面到檔案失敗:', error)
    throw error
  }
}

// GET - 獲取所有頁面或特定頁面
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('id')
    
    const pages = await loadPagesFromFile()
    
    if (pageId) {
      // 獲取特定頁面
      const page = pages[pageId]
      if (!page) {
        return NextResponse.json(
          { success: false, message: '頁面不存在' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, page })
    } else {
      // 獲取所有頁面列表
      const pageList = Object.values(pages).map(page => ({
        id: page.id,
        name: page.name,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt
      }))
      return NextResponse.json({ success: true, pages: pageList })
    }
  } catch (error) {
    // console.error('獲取頁面失敗:', error)
    return NextResponse.json(
      { success: false, message: '獲取頁面失敗' },
      { status: 500 }
    )
  }
}

// POST - 創建新頁面或更新現有頁面
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageId, name, html, css, components, styles } = body
    
    if (!pageId || !name) {
      return NextResponse.json(
        { success: false, message: '頁面 ID 和名稱為必填項' },
        { status: 400 }
      )
    }
    
    const pages = await loadPagesFromFile()
    const now = new Date().toISOString()
    
    // 檢查是否為更新現有頁面
    const isUpdate = pages[pageId] !== undefined
    
    const pageData: GrapesJSPage = {
      id: pageId,
      name,
      html: html || '',
      css: css || '',
      components: components || {},
      styles: styles || {},
      createdAt: isUpdate ? pages[pageId].createdAt : now,
      updatedAt: now
    }
    
    pages[pageId] = pageData
    await savePagesToFile(pages)
    
    return NextResponse.json({
      success: true,
      message: isUpdate ? '頁面更新成功' : '頁面創建成功',
      page: pageData
    })
    
  } catch (error) {
    // console.error('儲存頁面失敗:', error)
    return NextResponse.json(
      { success: false, message: '儲存頁面失敗' },
      { status: 500 }
    )
  }
}

// DELETE - 刪除頁面
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('id')
    
    if (!pageId) {
      return NextResponse.json(
        { success: false, message: '頁面 ID 為必填項' },
        { status: 400 }
      )
    }
    
    const pages = await loadPagesFromFile()
    
    if (!pages[pageId]) {
      return NextResponse.json(
        { success: false, message: '頁面不存在' },
        { status: 404 }
      )
    }
    
    delete pages[pageId]
    await savePagesToFile(pages)
    
    return NextResponse.json({
      success: true,
      message: '頁面刪除成功'
    })
    
  } catch (error) {
    // console.error('刪除頁面失敗:', error)
    return NextResponse.json(
      { success: false, message: '刪除頁面失敗' },
      { status: 500 }
    )
  }
}
