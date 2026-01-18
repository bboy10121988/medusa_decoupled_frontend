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

async function checkSanityImageControl() {
    console.log('🔍 檢查 Sanity 圖片和內容控制...\n')
    console.log('='.repeat(70))

    // 1. 檢查首頁模組的圖片
    console.log('\n📄 首頁模組 (homePage mainSections)')
    console.log('-'.repeat(70))

    const homePages = await client.fetch(`*[_type == "homePage"] {
    language,
    title,
    "sections": mainSections[] {
      _type,
      _key,
      "hasImages": defined(desktopImage) || defined(mobileImage) || defined(image) || defined(slides),
      "imageCount": select(
        defined(slides) => count(slides),
        defined(desktopImage) => 1,
        defined(image) => 1,
        0
      )
    }
  }`)

    homePages.forEach((page: any) => {
        console.log(`\n語言: ${page.language} - ${page.title}`)
        console.log(`總區塊數: ${page.sections.length}`)

        const sectionsWithImages = page.sections.filter((s: any) => s.hasImages)
        console.log(`有圖片的區塊: ${sectionsWithImages.length}`)

        sectionsWithImages.forEach((section: any) => {
            console.log(`  - ${section._type}: ${section.imageCount} 張圖片`)
        })
    })

    // 2. 檢查動態頁面的圖片
    console.log('\n\n📄 動態頁面 (dynamicPage)')
    console.log('-'.repeat(70))

    const dynamicPages = await client.fetch(`*[_type == "dynamicPage"] {
    language,
    title,
    "slug": slug.current,
    "hasContent": defined(pageContent),
    "contentBlocks": count(pageContent),
    "imageBlocks": count(pageContent[_type == "imageBlock"])
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
            console.log(`    內容區塊: ${page.contentBlocks}, 圖片區塊: ${page.imageBlocks}`)
        })
    })

    // 3. 檢查 Header
    console.log('\n\n📄 Header (頁首)')
    console.log('-'.repeat(70))

    const headers = await client.fetch(`*[_type == "header"] {
    language,
    storeName,
    "hasLogo": defined(logo),
    "hasFavicon": defined(favicon),
    "logoUrl": logo.asset->url,
    "faviconUrl": favicon.asset->url,
    "navCount": count(navigation),
    "hasMarquee": defined(marquee)
  }`)

    headers.forEach((header: any) => {
        console.log(`\n語言: ${header.language}`)
        console.log(`  店名: ${header.storeName}`)
        console.log(`  Logo: ${header.hasLogo ? '✅ 有' : '❌ 無'} ${header.logoUrl ? `(${header.logoUrl.substring(0, 50)}...)` : ''}`)
        console.log(`  Favicon: ${header.hasFavicon ? '✅ 有' : '❌ 無'}`)
        console.log(`  導航項目: ${header.navCount} 個`)
        console.log(`  跑馬燈: ${header.hasMarquee ? '✅ 有' : '❌ 無'}`)
    })

    // 4. 檢查 Footer
    console.log('\n\n📄 Footer (頁尾)')
    console.log('-'.repeat(70))

    const footers = await client.fetch(`*[_type == "footer"] {
    language,
    title,
    "hasLogo": defined(logo),
    "logoUrl": logo.asset->url,
    "sectionsCount": count(sections),
    "hasSocialMedia": defined(socialMedia),
    copyright
  }`)

    footers.forEach((footer: any) => {
        console.log(`\n語言: ${footer.language}`)
        console.log(`  標題: ${footer.title}`)
        console.log(`  Logo: ${footer.hasLogo ? '✅ 有' : '❌ 無'} ${footer.logoUrl ? `(${footer.logoUrl.substring(0, 50)}...)` : ''}`)
        console.log(`  區塊數: ${footer.sectionsCount}`)
        console.log(`  社交媒體: ${footer.hasSocialMedia ? '✅ 有' : '❌ 無'}`)
        console.log(`  版權: ${footer.copyright || 'N/A'}`)
    })

    // 總結
    console.log('\n\n' + '='.repeat(70))
    console.log('📊 總結')
    console.log('='.repeat(70))

    const allLanguages = ['zh-TW', 'ja-JP', 'en']
    const checks = [
        { name: '首頁', data: homePages, key: 'language' },
        { name: 'Header', data: headers, key: 'language' },
        { name: 'Footer', data: footers, key: 'language' },
    ]

    checks.forEach(check => {
        const langs = new Set(check.data.map((item: any) => item[check.key]))
        const missing = allLanguages.filter(lang => !langs.has(lang))

        if (missing.length === 0) {
            console.log(`\n✅ ${check.name}: 所有語言都有獨立控制`)
        } else {
            console.log(`\n⚠️  ${check.name}: 缺少 ${missing.join(', ')}`)
        }
    })

    // 檢查圖片是否由 Sanity 控制
    console.log('\n\n🖼️  圖片控制檢查')
    console.log('-'.repeat(70))

    const hasImages = homePages.some((page: any) =>
        page.sections.some((s: any) => s.hasImages)
    )

    if (hasImages) {
        console.log('✅ 首頁模組有圖片由 Sanity 控制')
    } else {
        console.log('⚠️  首頁模組沒有圖片')
    }

    const hasHeaderImages = headers.every((h: any) => h.hasLogo)
    if (hasHeaderImages) {
        console.log('✅ 所有 Header 都有 Logo 由 Sanity 控制')
    } else {
        console.log('⚠️  部分 Header 缺少 Logo')
    }

    const hasFooterImages = footers.some((f: any) => f.hasLogo)
    if (hasFooterImages) {
        console.log('✅ Footer 有 Logo 由 Sanity 控制')
    } else {
        console.log('⚠️  Footer 沒有 Logo')
    }
}

checkSanityImageControl().catch(console.error)
