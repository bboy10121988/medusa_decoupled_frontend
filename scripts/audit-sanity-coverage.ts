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

async function auditSanityContent() {
    console.log('🔍 檢查 Sanity 內容的語言覆蓋率...\n')
    console.log('目標語言: zh-TW (台灣), ja-JP (日本), en (美國)\n')
    console.log('='.repeat(60))

    // 1. 檢查首頁 (homePage)
    console.log('\n📄 首頁 (homePage)')
    console.log('-'.repeat(60))
    const homePages = await client.fetch(`*[_type == "homePage"] {
    _id,
    language,
    title,
    "sectionsCount": count(mainSections)
  }`)

    console.log(`找到 ${homePages.length} 個首頁`)
    const homeLanguages = new Set(homePages.map((p: any) => p.language))
    homePages.forEach((page: any) => {
        console.log(`  ${page.language || 'undefined'}: ${page.title || 'N/A'} (${page.sectionsCount} 個區塊)`)
    })

    checkCoverage('首頁', homeLanguages)

    // 2. 檢查 Header
    console.log('\n📄 Header (導航)')
    console.log('-'.repeat(60))
    const headers = await client.fetch(`*[_type == "header"] {
    _id,
    language,
    storeName,
    "navCount": count(navigation)
  }`)

    console.log(`找到 ${headers.length} 個 Header`)
    const headerLanguages = new Set(headers.map((h: any) => h.language))
    headers.forEach((header: any) => {
        console.log(`  ${header.language || 'undefined'}: ${header.storeName || 'N/A'} (${header.navCount} 個導航項目)`)
    })

    checkCoverage('Header', headerLanguages)

    // 3. 檢查 Footer
    console.log('\n📄 Footer (頁尾)')
    console.log('-'.repeat(60))
    const footers = await client.fetch(`*[_type == "footer"] {
    _id,
    language,
    title,
    "sectionsCount": count(sections)
  }`)

    console.log(`找到 ${footers.length} 個 Footer`)
    const footerLanguages = new Set(footers.map((f: any) => f.language))
    footers.forEach((footer: any) => {
        console.log(`  ${footer.language || 'undefined'}: ${footer.title || 'N/A'} (${footer.sectionsCount} 個區塊)`)
    })

    checkCoverage('Footer', footerLanguages)

    // 4. 檢查動態頁面 (dynamicPage)
    console.log('\n📄 動態頁面 (dynamicPage)')
    console.log('-'.repeat(60))
    const dynamicPages = await client.fetch(`*[_type == "dynamicPage"] {
    _id,
    language,
    title,
    "slug": slug.current,
    status
  }`)

    console.log(`找到 ${dynamicPages.length} 個動態頁面`)
    const pagesByLang: Record<string, any[]> = {}
    dynamicPages.forEach((page: any) => {
        const lang = page.language || 'undefined'
        if (!pagesByLang[lang]) pagesByLang[lang] = []
        pagesByLang[lang].push(page)
    })

    Object.keys(pagesByLang).sort().forEach(lang => {
        console.log(`\n  ${lang} (${pagesByLang[lang].length} 頁):`)
        pagesByLang[lang].forEach((page: any) => {
            console.log(`    - ${page.title} (/${page.slug}) [${page.status}]`)
        })
    })

    const dynamicPageLanguages = new Set(dynamicPages.map((p: any) => p.language))
    checkCoverage('動態頁面', dynamicPageLanguages)

    // 5. 檢查部落格文章 (post)
    console.log('\n📄 部落格文章 (post)')
    console.log('-'.repeat(60))
    const posts = await client.fetch(`*[_type == "post"] {
    language
  }`)

    const postsByLang: Record<string, number> = {}
    posts.forEach((post: any) => {
        const lang = post.language || 'undefined'
        postsByLang[lang] = (postsByLang[lang] || 0) + 1
    })

    console.log(`找到 ${posts.length} 篇文章`)
    Object.keys(postsByLang).sort().forEach(lang => {
        console.log(`  ${lang}: ${postsByLang[lang]} 篇`)
    })

    const postLanguages = new Set(posts.map((p: any) => p.language))
    checkCoverage('部落格文章', postLanguages)

    // 6. 檢查分類 (category)
    console.log('\n📄 部落格分類 (category)')
    console.log('-'.repeat(60))
    const categories = await client.fetch(`*[_type == "category"] {
    _id,
    language,
    title
  }`)

    console.log(`找到 ${categories.length} 個分類`)
    const catsByLang: Record<string, any[]> = {}
    categories.forEach((cat: any) => {
        const lang = cat.language || 'undefined'
        if (!catsByLang[lang]) catsByLang[lang] = []
        catsByLang[lang].push(cat)
    })

    Object.keys(catsByLang).sort().forEach(lang => {
        console.log(`  ${lang} (${catsByLang[lang].length} 個):`)
        catsByLang[lang].forEach((cat: any) => {
            console.log(`    - ${cat.title}`)
        })
    })

    const categoryLanguages = new Set(categories.map((c: any) => c.language))
    checkCoverage('部落格分類', categoryLanguages)

    // 7. 檢查精選商品 (featuredProducts)
    console.log('\n📄 精選商品 (featuredProducts)')
    console.log('-'.repeat(60))
    const featuredProducts = await client.fetch(`*[_type == "featuredProducts"] {
    _id,
    language,
    title,
    isActive
  }`)

    console.log(`找到 ${featuredProducts.length} 個精選商品設定`)
    const fpByLang: Record<string, any[]> = {}
    featuredProducts.forEach((fp: any) => {
        const lang = fp.language || 'undefined'
        if (!fpByLang[lang]) fpByLang[lang] = []
        fpByLang[lang].push(fp)
    })

    Object.keys(fpByLang).sort().forEach(lang => {
        console.log(`  ${lang} (${fpByLang[lang].length} 個):`)
        fpByLang[lang].forEach((fp: any) => {
            console.log(`    - ${fp.title} [${fp.isActive ? '啟用' : '停用'}]`)
        })
    })

    const fpLanguages = new Set(featuredProducts.map((fp: any) => fp.language))
    checkCoverage('精選商品', fpLanguages)

    // 總結
    console.log('\n' + '='.repeat(60))
    console.log('📊 總結報告')
    console.log('='.repeat(60))

    const allModules = [
        { name: '首頁', langs: homeLanguages },
        { name: 'Header', langs: headerLanguages },
        { name: 'Footer', langs: footerLanguages },
        { name: '動態頁面', langs: dynamicPageLanguages },
        { name: '部落格文章', langs: postLanguages },
        { name: '部落格分類', langs: categoryLanguages },
        { name: '精選商品', langs: fpLanguages },
    ]

    const missingModules: string[] = []

    allModules.forEach(module => {
        const missing = getMissingLanguages(module.langs)
        if (missing.length > 0) {
            missingModules.push(`${module.name}: 缺少 ${missing.join(', ')}`)
        }
    })

    if (missingModules.length === 0) {
        console.log('\n✅ 所有模組都已完整支援三種語言！')
    } else {
        console.log('\n⚠️  以下模組缺少部分語言版本：')
        missingModules.forEach(msg => console.log(`   - ${msg}`))
    }
}

function checkCoverage(moduleName: string, languages: Set<string>) {
    const missing = getMissingLanguages(languages)
    if (missing.length === 0) {
        console.log(`  ✅ 完整覆蓋三種語言`)
    } else {
        console.log(`  ⚠️  缺少: ${missing.join(', ')}`)
    }
}

function getMissingLanguages(languages: Set<string>): string[] {
    const required = ['zh-TW', 'ja-JP', 'en']
    const missing: string[] = []

    required.forEach(lang => {
        if (!languages.has(lang)) {
            missing.push(lang)
        }
    })

    return missing
}

auditSanityContent().catch(console.error)
