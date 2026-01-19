import { NextRequest, NextResponse } from "next/server"
import { getTranslationService } from "@lib/services/translation-service"
import { ContentParser } from "@lib/services/content-parser"
import { client } from "@lib/sanity-client"

// Safety flag: Set 'TRANSLATION_DRY_RUN=true' in env to validation without writing
const DRY_RUN = process.env.TRANSLATION_DRY_RUN === 'true'

/**
 * Generate a deterministic ID for the translated document.
 * Convention: {baseId}__i18n_{langCode}
 */
function generateTranslatedId(originalId: string, targetLang: string): string {
    // Handle 'drafts.' prefix
    const isDraft = originalId.startsWith('drafts.')
    const baseId = isDraft ? originalId.replace('drafts.', '') : originalId
    // Convert ja-JP to jaJP for ID safety if needed, but standard i18n convention usually keeps hyphen or uses underscores
    // Previous implementations used various styles. Let's stick to a clean one.
    // If we use document-internationalization conventions, it might expect something specific? 
    // The plugin usually just links them via metadata, ID format matters less, but deterministic is good.
    const langSuffix = targetLang.replace('-', '_').toLowerCase() // ja-JP -> ja_jp
    const newId = `${baseId}__i18n_${langSuffix}`
    return isDraft ? `drafts.${newId}` : newId
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { _id, _type, language, title } = body

        console.log(`[Webhook] Received update for: ${_id} (${_type}), Lang: ${language}`)

        // 1. Filter: Only process 'zh-TW' documents
        // Also skip system documents like sanity.* or translation.metadata
        if (language !== 'zh-TW') {
            // For products/pages, if language is missing, it might be unlocalized.
            // But we only want to trigger FROM the source of truth (zh-TW).
            console.log(`[Webhook] Ignoring non-source language: ${language}`)
            return NextResponse.json({ message: "Ignored" }, { status: 200 })
        }

        if (_type.startsWith('sanity.') || _type === 'translation.metadata') {
            return NextResponse.json({ message: "Ignored system type" }, { status: 200 })
        }

        // 2. Initialize Services
        const translationService = getTranslationService()
        const contentParser = new ContentParser(translationService)

        console.log(`[Webhook] Processing: ${title || _id}`)

        // 3. Translate to targets
        // 3. Translate to targets
        // Frontend uses 'en' for US/Global, and 'ja-JP' for Japan.
        // We must match the language code stored in Sanity.
        const targets = ['en', 'ja-JP']
        const results = []

        for (const targetLang of targets) {
            console.log(`[Webhook] Translating to ${targetLang}...`)

            // Parse and translate content
            const translatedContent = await contentParser.parseAndTranslate(body, targetLang)

            // Generate IDs
            // We search for existing document first to be safe? 
            // Since we use deterministic IDs based on source ID, we can just use that.
            // BUT: if Sanity plugin created a doc with random ID before?
            // Ideally we query first.

            // Find existing doc by "reference from metadata" is hardest from here without querying metadata first.
            // Let's rely on deterministic ID for now. If user manually created one with random ID, we might duplicate.
            // To be robust: Check if there is a linked doc in metadata?
            // Let's implement robust metadata check.

            // A. Check for existing metadata
            const metaQuery = `*[_type == "translation.metadata" && references($id)][0]`
            const existingMeta = await client.fetch(metaQuery, { id: _id })

            let targetId = generateTranslatedId(_id, targetLang)

            if (existingMeta) {
                // Check if this lang is already linked
                const existingLink = existingMeta.translations.find((t: any) => t._key === targetLang)
                if (existingLink && existingLink.value?._ref) {
                    targetId = existingLink.value._ref
                    console.log(`[Webhook] Found existing linked doc for ${targetLang}: ${targetId}`)
                }
            }

            // Set basic fields on translated doc
            translatedContent._id = targetId
            translatedContent.language = targetLang
            // Ensure slug is unique? Usually handled by dataset. 
            // If slug exists, we might want to append lang? 
            // For now, keep same slug structure (if Next.js handles /en/slug)

            if (DRY_RUN) {
                console.log(`[Webhook] [DRY_RUN] Would write ${targetId}`)
            } else {
                const transaction = client.transaction()

                // Create or Replace the translated document
                transaction.createOrReplace(translatedContent)

                // Link in Metadata
                const metaId = existingMeta ? existingMeta._id : `${_id}__metadata`

                const newTranslationEntry = {
                    _key: targetLang,
                    value: {
                        _type: 'reference',
                        _ref: targetId
                    }
                }

                if (!existingMeta) {
                    // Create new metadata
                    const sourceEntry = {
                        _key: 'zh-TW',
                        value: { _type: 'reference', _ref: _id }
                    }
                    transaction.create({
                        _id: metaId,
                        _type: 'translation.metadata',
                        translations: [sourceEntry, newTranslationEntry],
                        schemaType: _type
                    })
                } else {
                    // Patch existing if not present
                    const hasLang = existingMeta.translations.some((t: any) => t._key === targetLang)
                    if (!hasLang) {
                        transaction.patch(metaId, p => p.insert('after', 'translations[-1]', [newTranslationEntry]))
                    }
                }

                await transaction.commit()
                console.log(`[Webhook] Saved ${targetLang} (${targetId})`)
            }

            results.push({ lang: targetLang, id: targetId })
        }

        return NextResponse.json({
            success: true,
            dryRun: DRY_RUN,
            results
        }, { status: 200 })

    } catch (error: any) {
        console.error("[Webhook] Error:", error)
        return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
    }
}

