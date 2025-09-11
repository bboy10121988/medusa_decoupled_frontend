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

// 已知的系統路由，這些路由不應該被 GrapesJS 頁面處理
const SYSTEM_ROUTES = [
  'account',
  'affiliate',
  'affiliate-admin', 
  'blog',
  'cart',
  'categories',
  'collections',
  'login-affiliate',
  'order',
  'products',
  'regitster-affiliate',
  'store',
  'test-footer'
]

// 生成頁面組件
function PageViewer({ page }: { page: GrapesJSPage }) {
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
      <div dangerouslySetInnerHTML={{ __html: page.html }} />
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

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ countryCode: string; slug: string[] }>
}) {
  const { countryCode, slug } = await params
  
  // 如果沒有 slug 或 slug 長度不是 1，則顯示 404
  if (!slug || slug.length !== 1) {
    return <NotFoundPage message="無效的頁面路徑" />
  }
  
  const pageId = slug[0]
  
  // 如果是系統路由，則顯示 404（讓其他路由處理）
  if (SYSTEM_ROUTES.includes(pageId)) {
    return <NotFoundPage message="這是系統保留路徑" />
  }
  
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
  params: Promise<{ countryCode: string; slug: string[] }>
}) {
  const { slug } = await params
  
  if (!slug || slug.length !== 1) {
    return {
      title: '頁面不存在',
      description: '找不到指定的頁面',
    }
  }
  
  const pageId = slug[0]
  const page = await loadPageFromFile(pageId)
  
  return {
    title: page?.name || '頁面不存在',
    description: `使用 GrapesJS 編輯器創建的頁面：${page?.name}`,
  }
}
