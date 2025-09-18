import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import Nav from '@modules/layout/templates/nav'
import Footer from '@modules/layout/templates/footer'

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
  'regitster-affiliate', // 保留原有的拼寫錯誤以保持一致性
  'store',
  'test-footer',
  // 管理相關路由
  'studio',
  'grapesjs-pages',
  'pages-manager',
  // 其他系統路由
  'checkout',
  'admin',
  'api'
]

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

// 生成靜態參數，只為已存在的 GrapesJS 頁面生成路由
export async function generateStaticParams() {
  // 在開發模式下，返回空陣列以允許動態路由
  if (process.env.NODE_ENV === 'development') {
    return []
  }
  
  try {
    const data = await fs.readFile(PAGES_FILE, 'utf-8')
    const pages = JSON.parse(data)
    
    // 只為已存在的頁面生成路由，並排除系統路由
    const validPages = Object.keys(pages).filter(pageId => !SYSTEM_ROUTES.includes(pageId))
    
    // 為所有支援的國家代碼生成路由
    const countryCodes = ['tw', 'us', 'de', 'fr', 'dk']
    
    return countryCodes.flatMap(countryCode => 
      validPages.map(pageId => ({
        countryCode,
        slug: [pageId]
      }))
    )
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
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
  
  // 如果是系統路由，則調用 notFound() 讓其他路由處理
  if (SYSTEM_ROUTES.includes(pageId)) {
    notFound()
  }
  
  // 嘗試載入 GrapesJS 頁面
  const page = await loadPageFromFile(pageId)
  
  if (!page) {
    return <NotFoundPage message={`找不到 ID 為 "${pageId}" 的頁面`} />
  }
  
  return (
    <>
      <Nav />
      <main>
        <PageViewer page={page} />
      </main>
      <Footer />
    </>
  )
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
