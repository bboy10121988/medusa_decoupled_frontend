import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: "m7o2mv1n",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
})

const PAGES_PATH = path.join(process.cwd(), 'src/app/[countryCode]/(main)')

async function generatePages() {
  const query = `*[_type == "pages" && isActive == true]`
  const pages = await client.fetch(query)

  for (const page of pages) {
    const slug = page.slug.current
    const pagePath = path.join(PAGES_PATH, slug)
    
    if (!fs.existsSync(pagePath)) {
      fs.mkdirSync(pagePath, { recursive: true })
    }

    const pageContent = `import { Metadata } from "next"
import { getPageBySlug } from "@lib/sanity"
import PageRenderer from "@modules/pages/components/page-renderer"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "${page.title}",
  description: "${page.seo?.metaDescription || ''}"
}

export default async function Page(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const pageData = await getPageBySlug("${slug}")

  if (!pageData || !pageData.isActive) {
    return notFound()
  }

  return <PageRenderer pageData={pageData} />
}
`
    fs.writeFileSync(path.join(pagePath, 'page.tsx'), pageContent)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 檢查請求是否來自 Sanity
    const signature = request.headers.get('sanity-webhook-signature')
    if (!signature) {
      return NextResponse.json({ error: '未授權的請求' }, { status: 401 })
    }

    // 如果是頁面發布事件
    if (body._type === 'pages') {
      await generatePages()
      return NextResponse.json({ 
        message: '頁面已生成',
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({ message: '非頁面發布事件' })
  } catch (error: any) {
    console.error('Webhook 處理錯誤:', error)
    return NextResponse.json({ 
      error: error.message 
    }, { 
      status: 500 
    })
  }
}
