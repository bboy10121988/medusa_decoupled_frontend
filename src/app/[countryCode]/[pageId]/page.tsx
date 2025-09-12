import { promises as fs } from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'

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

export default async function GrapesJSPage({
  params,
}: {
  params: Promise<{ countryCode: string; pageId: string }>
}) {
  const { countryCode, pageId } = await params
  const page = await loadPageFromFile(pageId)
  
  if (!page) {
    notFound()
  }
  
  return <PageViewer page={page} />
}

// 生成 metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string; pageId: string }>
}) {
  const { countryCode, pageId } = await params
  const page = await loadPageFromFile(pageId)
  
  return {
    title: page?.name || '頁面不存在',
    description: `使用 GrapesJS 編輯器創建的頁面：${page?.name}`,
  }
}
