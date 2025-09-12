import { promises as fs } from 'fs'
import path from 'path'

// 儲存設定
const STORAGE_DIR = path.join(process.cwd(), 'data', 'grapesjs-pages')
const PAGES_FILE = path.join(STORAGE_DIR, 'pages.json')

// 檢查 GrapesJS 頁面是否存在
export async function checkGrapesJSPageExists(pageId: string): Promise<boolean> {
  try {
    const data = await fs.readFile(PAGES_FILE, 'utf-8')
    const pages = JSON.parse(data)
    return !!pages[pageId]
  } catch (error) {
    return false
  }
}

// 獲取 GrapesJS 頁面
export async function getGrapesJSPage(pageId: string) {
  try {
    const data = await fs.readFile(PAGES_FILE, 'utf-8')
    const pages = JSON.parse(data)
    return pages[pageId] || null
  } catch (error) {
    return null
  }
}
