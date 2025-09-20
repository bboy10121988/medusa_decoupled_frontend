import { promises as fs } from 'fs'
import path from 'path'
import Link from 'next/link'

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

// 從檔案讀取所有頁面
async function loadAllPages(): Promise<GrapesJSPage[]> {
  try {
    const data = await fs.readFile(PAGES_FILE, 'utf-8')
    const pages = JSON.parse(data)
    return Object.values(pages)
  } catch (error) {
    return []
  }
}

export default async function PagesIndex() {
  const pages = await loadAllPages()
  
  return (
    <div style={{
      padding: '40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#333', borderBottom: '2px solid #eee', paddingBottom: '16px' }}>
        GrapesJS 頁面管理
      </h1>
      
      <div style={{ marginBottom: '24px' }}>
        <Link 
          href="/studio" 
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
          創建新頁面
        </Link>
      </div>
      
      {pages.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center' as const,
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <p style={{ color: '#6c757d', fontSize: '18px', margin: '0' }}>
            還沒有任何頁面。
          </p>
          <p style={{ color: '#6c757d', margin: '8px 0 0 0' }}>
            點擊上面的「創建新頁面」按鈕開始創建您的第一個頁面。
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {pages.map((page) => (
            <div
              key={page.id}
              style={{
                padding: '20px',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                backgroundColor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
                    {page.name}
                  </h3>
                  <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                    ID: {page.id}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    href={`/page/${page.id}`}
                    target="_blank"
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    查看頁面
                  </Link>
                  <Link
                    href={`/api/pages/${page.id}`}
                    target="_blank"
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    原始 HTML
                  </Link>
                </div>
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>創建時間: {new Date(page.createdAt).toLocaleString('zh-TW')}</span>
                <span>更新時間: {new Date(page.updatedAt).toLocaleString('zh-TW')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '8px' 
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#495057' }}>使用說明</h3>
        <ol style={{ margin: '0', paddingLeft: '20px', color: '#6c757d' }}>
          <li style={{ marginBottom: '8px' }}>
            在 GrapesJS 編輯器中設計您的頁面
          </li>
          <li style={{ marginBottom: '8px' }}>
            使用 Ctrl+S (Windows) 或 Cmd+S (Mac) 儲存頁面
          </li>
          <li style={{ marginBottom: '8px' }}>
            儲存後，您的頁面將可以在 <code>/page/{'{'}頁面名稱{'}'}</code> 路徑訪問
          </li>
          <li>
            例如：頁面名稱為 "page_2" 的頁面可以在 <code>/page/page_2</code> 訪問（會自動重新導向到 <code>/tw/page/page_2</code>）
          </li>
        </ol>
      </div>
    </div>
  )
}

export const metadata = {
  title: '頁面管理 - GrapesJS',
  description: '管理使用 GrapesJS 編輯器創建的所有頁面',
}
