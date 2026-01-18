
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

// Initialize privileged Sanity client (write access)
const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN || '', // Critical: Write token
    useCdn: false,
})

const DEEPL_API_KEY = process.env.DEEPL_API_KEY
const DEEPL_API_URL = DEEPL_API_KEY?.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate'

export async function POST(req: NextRequest) {
    try {
        if (!process.env.SANITY_API_TOKEN) {
            return NextResponse.json({ error: 'Missing SANITY_API_TOKEN' }, { status: 500 })
        }
        if (!DEEPL_API_KEY) {
            return NextResponse.json({ error: 'Missing DEEPL_API_KEY' }, { status: 500 })
        }

        const body = await req.json()
        const { documentId } = body

        if (!documentId) {
            return NextResponse.json({ error: 'Missing documentId' }, { status: 400 })
        }

        // 1. Fetch source document (ZH-TW)
        const sourceDoc = await client.fetch(`* [_id == $id][0]`, { id: documentId })
        if (!sourceDoc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }

        // Only process supported types
        const supportedTypes = ['homePage', 'dynamicPage', 'page', 'product']
        if (!supportedTypes.includes(sourceDoc._type)) {
            return NextResponse.json({ message: `Skipping unsupported type: ${sourceDoc._type} ` })
        }

        const { title, _type } = sourceDoc
        const targets = ['en', 'ja-JP']

        const results = []

        for (const targetLang of targets) {
            // 2. Translate Title
            let translatedTitle = title
            if (title) {
                translatedTitle = await translateText(title, targetLang === 'ja-JP' ? 'JA' : 'EN-US')
            }

            // 3. Find existing document for this language
            // Note: This relies on manual linking or consistent ID naming if using @sanity/document-internationalization
            // We will attempt to find a document with same _type and language, referencing the source?
            // Or just create a new one with deterministic ID if possible.
            // Strategy: Use query to find doc with `translation.metadata` linking?
            // Fallback: Create new doc with deterministic ID: `${ sourceDoc._id }__i18n_${ targetLang } `

            const targetId = `${sourceDoc._id}__i18n_${targetLang.toLowerCase()} `

            // 4. Create or Patch
            const transaction = client.transaction()

            const doc = {
                _id: targetId,
                _type: _type,
                language: targetLang,
                title: translatedTitle,
                // TODO: Translate Body/Content (complex recursive translation needed for Portable Text)
                slug: sourceDoc.slug ? { ...sourceDoc.slug, current: `${sourceDoc.slug.current} -${targetLang} ` } : undefined,
            } as any

            // Create if not exists, or patch if exists
            transaction.createIfNotExists(doc)
            transaction.patch(targetId, p => p.set({
                title: translatedTitle,
                language: targetLang,
            }))

            await transaction.commit()
            results.push({ lang: targetLang, id: targetId, title: translatedTitle })
        }

        return NextResponse.json({ success: true, results })

    } catch (error: any) {
        console.error('Translation error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

async function translateText(text: string, targetLang: string) {
    if (!text) return ''

    const params = new URLSearchParams()
    params.append('auth_key', DEEPL_API_KEY!)
    params.append('text', text)
    params.append('target_lang', targetLang)

    const res = await fetch(DEEPL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    })

    if (!res.ok) {
        const err = await res.text()
        console.error('DeepL API Error:', err)
        return text // Fallback to original
    }

    const data = await res.json()
    return data.translations[0].text
}
