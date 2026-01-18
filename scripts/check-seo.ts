import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || '',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN
})

async function checkSEO() {
    console.log('🔍 檢查 SEO 模組...\n')
    console.log('='.repeat(70))

    // 1. 檢查首頁 SEO
    console.log('\n📄 首頁 (homePage) SEO')
    console.log('-'.repeat(70))

    const homePages = await client.fetch(`*[_type == "homePage"] {
    language,
    title,
    seoTitle,
    seoDescription,
    seoKeywords,
    canonicalUrl,
    ogTitle,
    ogDescription,
    "ogImageUrl": ogImage.asset->url
  }`)

    homePages.forEach((page: any) => {
        console.log(`\n語言: ${page.language}`)
        console.log(`  標題: ${page.title}`)
        console.log(`  SEO Title: ${page.seoTitle || '❌ 缺少'}`)
        console.log(`  SEO Description: ${page.seoDescription ? '✅ 有' : '❌ 缺少'}`)
        console.log(`  SEO Keywords: ${page.seoKeywords?.length > 0 ? `✅ ${page.seoKeywords.length} 個` : '❌ 缺少'}`)
        console.log(`  Canonical URL: ${page.canonicalUrl || '❌ 缺少'}`)
        console.log(`  OG Title: ${page.ogTitle || '❌ 缺少'}`)
        console.log(`  OG Description: ${page.ogDescription ? '✅ 有' : '❌ 缺少'}`)
        console.log(`  OG Image: ${page.ogImageUrl ? '✅ 有' : '❌ 缺少'}`)
    })

    // 2. 檢查動態頁面 SEO
    console.log('\n\n📄 動態頁面 (dynamicPage) SEO')
    console.log('-'.repeat(70))

    const dynamicPages = await client.fetch(`*[_type == "dynamicPage"] {
    language,
    title,
    "slug": slug.current,
    "seoTitle": seo.metaTitle,
    "seoDescription": seo.metaDescription,
    "canonicalUrl": seo.canonicalUrl
  }`)

    const pagesByLang: Record<string, any[]> = {}
    dynamicPages.forEach((page: any) => {
        const lang = page.language || 'undefined'
        if (!pagesByLang[lang]) pagesByLang[lang] = []
        pagesByLang[lang].push(page)
    })

    Object.keys(pagesByLang).sort().forEach(lang => {
        console.log(`\n語言: ${lang}`)
        pagesByLang[lang].forEach((page: any) => {
            console.log(`  - ${page.title} (/${page.slug})`)
            console.log(`    SEO Title: ${page.seoTitle || '❌ 缺少'}`)
            console.log(`    SEO Description: ${page.seoDescription ? '✅ 有' : '❌ 缺少'}`)
            console.log(`    Canonical URL: ${page.canonicalUrl || '❌ 缺少'}`)
        })
    })

    // 3. 檢查部落格頁面設定 SEO
    console.log('\n\n📄 部落格頁面設定 (blogPage) SEO')
    console.log('-'.repeat(70))

    const blogSettings = await client.fetch(`*[_type == "blogPage"][0] {
    seoTitle,
    seoDescription,
    seoKeywords,
    "ogImageUrl": ogImage.asset->url
  }`)

    if (blogSettings) {
        console.log(`  SEO Title: ${blogSettings.seoTitle || '❌ 缺少'}`)
        console.log(`  SEO Description: ${blogSettings.seoDescription ? '✅ 有' : '❌ 缺少'}`)
        console.log(`  SEO Keywords: ${blogSettings.seoKeywords?.length > 0 ? `✅ ${blogSettings.seoKeywords.length} 個` : '❌ 缺少'}`)
        console.log(`  OG Image: ${blogSettings.ogImageUrl ? '✅ 有' : '❌ 缺少'}`)
    } else {
        console.log('  ❌ 沒有部落格頁面設定')
    }

    // 統計缺少 SEO 的頁面
    console.log('\n\n' + '='.repeat(70))
    console.log('📊 SEO 完整度統計')
    console.log('='.repeat(70))

    const homePageMissing = homePages.filter((p: any) =>
        !p.seoTitle || !p.seoDescription
    )

    const dynamicPageMissing = dynamicPages.filter((p: any) =>
        !p.seoTitle || !p.seoDescription
    )

    console.log(`\n首頁缺少 SEO: ${homePageMissing.length}/${homePages.length}`)
    if (homePageMissing.length > 0) {
        homePageMissing.forEach((p: any) => {
            console.log(`  - ${p.language}: ${!p.seoTitle ? 'Title' : ''} ${!p.seoDescription ? 'Description' : ''}`)
        })
    }

    console.log(`\n動態頁面缺少 SEO: ${dynamicPageMissing.length}/${dynamicPages.length}`)
    if (dynamicPageMissing.length > 0) {
        dynamicPageMissing.forEach((p: any) => {
            console.log(`  - ${p.language} ${p.title}: ${!p.seoTitle ? 'Title' : ''} ${!p.seoDescription ? 'Description' : ''}`)
        })
    }

    if (homePageMissing.length === 0 && dynamicPageMissing.length === 0) {
        console.log('\n✅ 所有頁面都有完整的 SEO 設定！')
    } else {
        console.log('\n⚠️  需要補充 SEO 內容')
    }
}

checkSEO().catch(console.error)
