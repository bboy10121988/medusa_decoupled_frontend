const { createClient } = require('@sanity/client')

const client = createClient({
    projectId: 'm7o2mv1n',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN
})

// 繁中到日文翻譯對照表
const translations = {
    // Header 跑馬燈
    "＊滿千免運＊": "＊1000円以上送料無料＊",
    "LINE好友募集中！": "LINE友達募集中！",
    "新會員首購享85折": "新規会員初回購入15%OFF",
    "全館消費滿$2000免運": "全店2000円以上送料無料",
    "會員點數最高30倍送": "ポイント最大30倍",

    // 導覽
    "Home": "ホーム",
    "store": "ストア",
    "Blog": "ブログ",

    // Store name
    "Tim's Fantasy World 男士美髮造型": "Tim's Fantasy World メンズヘアサロン",

    // Blog posts
    "男士剪髮": "メンズカット",
    "頭皮護理": "スカルプケア",
    "男士燙髮": "メンズパーマ",
    "洗剪修眉": "シャンプー・カット・眉カット",
    "男士洗剪髮含頭皮噴霧": "メンズシャンプー・カット（頭皮スプレー付き）",

    // Products
    "高支撐度髮泥 紅帽": "ハイホールドヘアクレイ レッドキャップ",
    "蓬蓬造型粉": "ボリュームパウダー",
    "髮根蓬蓬水": "ルートボリューマースプレー",
    "水凝髮蠟 綠罐": "ウォーターベースワックス グリーン",
    "Styling Spray定型噴霧": "スタイリングスプレー",
    "強力定型髮油 黃罐": "ストロングホールドポマード イエロー",
    "迷幻香根草洗髮精": "ベチバーシャンプー",

    // Common terms
    "精選商品": "おすすめ商品",
    "客戶服務": "カスタマーサービス",
    "退換貨政策": "返品・交換について",
    "隱私權政策": "プライバシーポリシー",
    "聯絡資訊": "お問い合わせ",
    "常見問題": "よくある質問",
    "shop now": "今すぐ購入",
    "了解更多": "詳しく見る",
    "加入購物車": "カートに入れる",

    // Homepage sections
    "專業男士理髮": "プロのメンズスタイリング",
    "造型產品": "スタイリング製品",
    "最新文章": "最新の記事",
}

// 深層翻譯物件中的字串
function translateObject(obj) {
    if (typeof obj === 'string') {
        return translations[obj] || obj
    }
    if (Array.isArray(obj)) {
        return obj.map(item => translateObject(item))
    }
    if (obj && typeof obj === 'object') {
        const translated = {}
        for (const key of Object.keys(obj)) {
            // 跳過 Sanity 內部欄位
            if (key.startsWith('_') && key !== '_type' && key !== '_key') {
                translated[key] = obj[key]
            } else {
                translated[key] = translateObject(obj[key])
            }
        }
        return translated
    }
    return obj
}

async function translateDocuments() {
    console.log('=== 翻譯所有日文 Sanity 文件 ===\n')

    // 1. 翻譯 Header
    console.log('1. 翻譯 Header...')
    const jaHeader = await client.fetch(`*[_type == "header" && language == "ja-JP"][0]`)
    if (jaHeader) {
        const translatedHeader = translateObject(jaHeader)
        translatedHeader.storeName = "Tim's Fantasy World メンズヘアサロン"
        translatedHeader.marquee = {
            ...translatedHeader.marquee,
            text1: { ...translatedHeader.marquee?.text1, content: "＊1000円以上送料無料＊" },
            text2: { ...translatedHeader.marquee?.text2, content: "LINE友達募集中！" },
        }
        translatedHeader.navigation = [
            { _key: "nav-home", href: "/", name: "ホーム" },
            { _key: "nav-store", href: "/store", name: "ストア" },
            { _key: "nav-blog", href: "/blog", name: "ブログ" }
        ]
        await client.patch(jaHeader._id).set(translatedHeader).commit()
        console.log('   ✓ Header 翻譯完成')
    }

    // 2. 翻譯 Footer
    console.log('2. 翻譯 Footer...')
    const jaFooter = await client.fetch(`*[_type == "footer" && language == "ja-JP"][0]`)
    if (jaFooter) {
        const translatedFooter = translateObject(jaFooter)
        translatedFooter.copyright = "© {year} Tim's Fantasy World. All rights reserved."
        await client.patch(jaFooter._id).set(translatedFooter).commit()
        console.log('   ✓ Footer 翻譯完成')
    }

    // 3. 翻譯 HomePage
    console.log('3. 翻譯 HomePage...')
    const jaHomePage = await client.fetch(`*[_type == "homePage" && language == "ja-JP"][0]`)
    if (jaHomePage) {
        const translatedHomePage = translateObject(jaHomePage)
        await client.patch(jaHomePage._id).set(translatedHomePage).commit()
        console.log('   ✓ HomePage 翻譯完成')
    }

    // 4. 複製並翻譯 Blog Posts
    console.log('4. 複製並翻譯 Blog Posts...')
    const zhPosts = await client.fetch(`*[_type == "post" && language == "zh-TW"]`)
    for (const post of zhPosts) {
        const existingJaPost = await client.fetch(
            `*[_type == "post" && language == "ja-JP" && slug.current == $slug][0]`,
            { slug: post.slug?.current }
        )

        if (!existingJaPost) {
            const jaPost = {
                ...post,
                _id: `post-ja-JP-${post.slug?.current || Date.now()}`,
                _rev: undefined,
                _createdAt: undefined,
                _updatedAt: undefined,
                _system: undefined,
                language: 'ja-JP',
                title: translations[post.title] || post.title
            }
            await client.create(jaPost)
            console.log(`   ✓ 建立: ${jaPost.title}`)
        } else {
            console.log(`   - 已存在: ${post.slug?.current}`)
        }
    }

    // 5. 複製並翻譯 Products
    console.log('5. 複製並翻譯 Products...')
    const zhProducts = await client.fetch(`*[_type == "product" && language == "zh-TW"]`)
    for (const product of zhProducts) {
        const existingJaProduct = await client.fetch(
            `*[_type == "product" && language == "ja-JP" && slug.current == $slug][0]`,
            { slug: product.slug?.current }
        )

        if (!existingJaProduct) {
            const jaProduct = {
                ...product,
                _id: `product-ja-JP-${product.slug?.current || Date.now()}`,
                _rev: undefined,
                _createdAt: undefined,
                _updatedAt: undefined,
                _system: undefined,
                language: 'ja-JP',
                title: translations[product.title] || product.title
            }
            await client.create(jaProduct)
            console.log(`   ✓ 建立: ${jaProduct.title}`)
        } else {
            console.log(`   - 已存在: ${product.slug?.current}`)
        }
    }

    console.log('\n=== 翻譯完成！===')
}

translateDocuments().catch(console.error)
