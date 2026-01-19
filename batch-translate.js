
const { createClient } = require('next-sanity')
const fs = require('fs')
const path = require('path')

// Load env vars from .env.local
const envPath = path.resolve(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = require('dotenv').parse(fs.readFileSync(envPath))
    for (const k in envConfig) {
        process.env[k] = envConfig[k]
    }
}

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
})

const DEEPL_API_KEY = process.env.DEEPL_API_KEY
const DEEPL_API_URL = DEEPL_API_KEY?.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate'

const SUPPORTED_TYPES = [
    'homePage',
    'dynamicPage',
    'blogPage',
    'post',
    'category',
    'header',
    'footer',
    'product'
]

async function translateText(text, targetLang) {
    if (!text) return ''
    const params = new URLSearchParams()
    params.append('auth_key', DEEPL_API_KEY)
    params.append('text', text)
    params.append('target_lang', targetLang)

    try {
        const res = await fetch(DEEPL_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        })

        if (!res.ok) {
            console.error(`[DeepL] API Error for text "${text.substring(0, 20)}...":`, await res.text())
            return text
        }

        const data = await res.json()
        return data.translations[0].text
    } catch (error) {
        console.error('[DeepL] Request Failed:', error)
        return text
    }
}

async function translatePortableText(blocks, targetLang) {
    if (!blocks || !Array.isArray(blocks)) return []
    return Promise.all(blocks.map(async (block) => {
        if (block._type === 'block' && block.children) {
            const newChildren = await Promise.all(block.children.map(async (child) => {
                if (child._type === 'span' && child.text && child.text.trim()) {
                    const translated = await translateText(child.text, targetLang)
                    return { ...child, text: translated }
                }
                return child
            }))
            return { ...block, children: newChildren }
        }
        return block
    }))
}

// Simplified generic recursive translator for objects
async function translateObject(obj, targetLang) {
    if (!obj) return obj
    if (typeof obj === 'string') return await translateText(obj, targetLang)
    if (typeof obj === 'number' || typeof obj === 'boolean') return obj

    if (Array.isArray(obj)) {
        // Special handling for Portable Text (blocks)
        if (obj.length > 0 && obj[0]._type === 'block') {
            return await translatePortableText(obj, targetLang)
        }
        // General array
        return await Promise.all(obj.map(item => translateObject(item, targetLang)))
    }

    if (typeof obj === 'object') {
        const newObj = {}
        for (const key of Object.keys(obj)) {
            // Skip internal keys
            if (key.startsWith('_')) {
                newObj[key] = obj[key]
                continue
            }
            // Skip helper fields that shouldn't be translated
            if (['slug', 'image', 'icon'].includes(key)) {
                newObj[key] = obj[key]
                continue
            }

            newObj[key] = await translateObject(obj[key], targetLang)
        }
        return newObj
    }

    return obj
}


// More specific page section translator (adapting from route.ts)
async function translatePageSections(sections, targetLang) {
    if (!sections || !Array.isArray(sections)) return []
    const targetLangCode = targetLang === 'ja-JP' ? 'JA' : 'EN-US'

    return Promise.all(sections.map(async (section) => {
        // Simple clone strategies often fail with deep recursion, let's use the helper
        // But for known structure, specific fields are safer.
        // Reusing the generic one might translate Keys or values we don't want (like layout strings 'full').
        // Let's stick to the generic one but be careful? 
        // No, route.ts has specific logic. Let's try to be generic BUT smart.
        // Actually, for this batch script, let's reuse the helper above but apply it selectively?
        // Or just map the known translatable fields.

        // Let's reuse the generic Recursive Translator for entire Sections array?
        // It might translate "layout": "grid" -> "layout": "grid" (if not translated) or some weird text.
        // Safe approach: Translate only string values that look like text? Hard.

        // Let's implement specific logic for sections similar to route.ts
        const newSection = { ...section }
        try {
            if (newSection.title) newSection.title = await translateText(newSection.title, targetLangCode)
            if (newSection.heading) newSection.heading = await translateText(newSection.heading, targetLangCode)
            if (newSection.description) newSection.description = await translateText(newSection.description, targetLangCode)
            if (newSection.content) newSection.content = await translatePortableText(newSection.content, targetLangCode)
            if (newSection.caption) newSection.caption = await translateText(newSection.caption, targetLangCode)
            if (newSection.buttonText) newSection.buttonText = await translateText(newSection.buttonText, targetLangCode)
            if (newSection.mobileTitle) newSection.mobileTitle = await translateText(newSection.mobileTitle, targetLangCode)

            // Recursion for cards
            if (newSection.cards && Array.isArray(newSection.cards)) {
                newSection.cards = await Promise.all(newSection.cards.map(async card => ({
                    ...card,
                    title: card.title ? await translateText(card.title, targetLangCode) : '',
                    description: card.description ? await translateText(card.description, targetLangCode) : ''
                })))
            }

            // Images alt
            if (newSection.image?.alt) {
                newSection.image = { ...newSection.image, alt: await translateText(newSection.image.alt, targetLangCode) }
            }

        } catch (e) {
            console.error('Section translation error:', e)
        }
        return newSection
    }))
}


async function main() {
    console.log('Starting Batch Translation...')

    // 1. Fetch all zh-TW documents
    const query = `*[_type in $types && language == 'zh-TW']`
    const sourceDocs = await client.fetch(query, { types: SUPPORTED_TYPES })
    console.log(`Found ${sourceDocs.length} source documents.`)

    for (const doc of sourceDocs) {
        console.log(`Processing: [${doc._type}] ${doc.title || doc._id}`)

        // Targets
        const targets = ['en', 'ja-JP']

        for (const targetLang of targets) {
            const targetLangCode = targetLang === 'ja-JP' ? 'JA' : 'EN-US'

            // Check if already exists?
            // Or just update content fields? User asked to "ensure all fields have translation".
            // We should find the existing translation doc and UPDATE it.

            // Find target doc
            // Strategy: Look for translation.metadata first? 
            // Or query by slug/lang? ID convention `_i18n_` is common but not guaranteed if created manually.
            // We can query by `translation.metadata`.

            let targetDocId = null
            let targetDoc = null

            // Find metadata
            const meta = await client.fetch(`*[_type == "translation.metadata" && references($id)][0]`, { id: doc._id })

            if (meta) {
                const translation = meta.translations.find(t => t._key === targetLang)
                if (translation) {
                    targetDocId = translation.value._ref
                    targetDoc = await client.fetch(`*[_id == $id][0]`, { id: targetDocId })
                }
            }

            // Prepare Translated Content
            const translatedTitle = doc.title ? await translateText(doc.title, targetLangCode) : undefined
            const translatedSubtitle = doc.subtitle ? await translateText(doc.subtitle, targetLangCode) : undefined

            // Content logic
            let translatedContent = []
            const contentField = doc._type === 'homePage' ? 'mainSections' :
                doc._type === 'dynamicPage' ? 'pageContent' :
                    doc._type === 'post' ? 'body' : // Post uses Body
                        doc._type === 'product' ? 'body' : // Product uses Body for details
                            undefined

            // Handle 'body' (Portable Text) vs 'pageContent' (Sections)
            if (contentField && doc[contentField]) {
                if (contentField === 'body') {
                    translatedContent = await translatePortableText(doc[contentField], targetLangCode)
                } else {
                    translatedContent = await translatePageSections(doc[contentField], targetLang)
                }
            }

            // Prepare Patch Object
            const patchData = {
                language: targetLang,
                ...(translatedTitle && { title: translatedTitle }),
                ...(translatedSubtitle && { subtitle: translatedSubtitle }), // For updated product schema
                ...(contentField && { [contentField]: translatedContent }),
                ...(doc.description && { description: await translateText(doc.description, targetLangCode) }) // Common field
            }

            // If doc exists, patch it
            if (targetDocId && targetDoc) {
                console.log(`  -> Patching ${targetLang} (${targetDocId})...`)
                await client.patch(targetDocId).set(patchData).commit()
            } else {
                // Create new if missing
                console.log(`  -> Creating new ${targetLang} doc...`)
                // Use deterministic ID
                targetDocId = `${doc._id}__i18n_${targetLang.toLowerCase()}`.replace('drafts.', '') // ensure clean ID

                const newDoc = {
                    ...patchData,
                    _id: targetDocId,
                    _type: doc._type,
                    slug: doc.slug,
                    // Copy other key fields like 'medusaId' for product?
                    ...(doc.medusaId && { medusaId: doc.medusaId }),
                    ...(doc.mainImage && { mainImage: doc.mainImage }), // Copy image ref
                    ...(doc.images && { images: doc.images }), // Copy images refs
                    // categories? posts?
                }

                const transaction = client.transaction()
                transaction.createIfNotExists(newDoc)

                // Link metadata
                if (meta) {
                    transaction.patch(meta._id, p => p.setIfMissing({ translations: [] }).insert('after', 'translations[-1]', [{
                        _key: targetLang,
                        value: { _type: 'reference', _ref: targetDocId }
                    }]))
                } else {
                    // Create metadata
                    transaction.create({
                        _type: 'translation.metadata',
                        translations: [
                            { _key: 'zh-TW', value: { _type: 'reference', _ref: doc._id } },
                            { _key: targetLang, value: { _type: 'reference', _ref: targetDocId } }
                        ],
                        schemaType: doc._type
                    })
                }

                await transaction.commit()
            }
        }
    }
    console.log('Batch Translation Complete!')
}

main().catch(console.error)
