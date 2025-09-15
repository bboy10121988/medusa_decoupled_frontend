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

// 從檔案讀取頁面
async function loadPageFromFile(pageId: string): Promise<GrapesJSPage | null> {
  try {
    const data = await fs.readFile(PAGES_FILE, 'utf-8')
    const pages = JSON.parse(data)
    return pages[pageId] || null
  } catch (error) {
    return null
  }
}

// 生成頁面組件
function PageViewer({ page }: { page: GrapesJSPage }) {
  // 移除 HTML 中的 body 標籤，避免 hydration 錯誤
  const cleanHtml = page.html
    .replace(/<body[^>]*>/gi, '') // 移除開始的 body 標籤（含屬性）
    .replace(/<\/body>/gi, '')    // 移除結束的 body 標籤
  
  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        ${page.css}
      ` }} />
      <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
    </div>
  )
}

function NotFoundPage({ message }: { message: string }) {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{ color: '#dc3545' }}>頁面不存在</h1>
      <p style={{ color: '#6c757d' }}>{message}</p>
      <a 
        href="/pages-manager" 
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '500'
        }}
      >
        返回頁面管理
      </a>
    </div>
  )
}

export default async function PageByIdRoute({
  params,
}: {
  params: Promise<{ countryCode: string; pageId: string }>
}) {
  const { pageId } = await params
  
  // 嘗試載入 GrapesJS 頁面
  const page = await loadPageFromFile(pageId)
  
  if (!page) {
    return <NotFoundPage message={`找不到 ID 為 "${pageId}" 的頁面`} />
  }
  
  return <PageViewer page={page} />
}

// 生成 metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string; pageId: string }>
}) {
  const { pageId } = await params
  const page = await loadPageFromFile(pageId)
  
  return {
    title: page?.name || '頁面不存在',
    description: `使用 GrapesJS 編輯器創建的頁面：${page?.name}`,
  }
}