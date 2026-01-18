import { NextRequest, NextResponse } from "next/server"
import { getTranslationService } from "@lib/services/translation-service"
import { ContentParser } from "@lib/services/content-parser"
import { client } from "@lib/sanity-client"

// Secret for verifying Sanity webook (Phase 3: Real validation)
// const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET

// Safety flag: Set to 'true' to prevent actual writes to Sanity
const DRY_RUN = process.env.TRANSLATION_DRY_RUN !== 'false' // Default to true (safe mode)

/**
 * Generate a deterministic ID for the translated document.
 * Convention: {baseId}__i18n_{langCode}
 */
function generateTranslatedId(originalId: string, targetLang: string): string {
    // Handle 'drafts.' prefix
    const isDraft = originalId.startsWith('drafts.')
    const baseId = isDraft ? originalId.replace('drafts.', '') : originalId
    const langSuffix = targetLang.replace('-', '') // ja-JP -> jaJP
    const newId = `${baseId}__i18n_${langSuffix}`
    return isDraft ? `drafts.${newId}` : newId
}

export async function POST(req: NextRequest) {
    try {
        // 1. Validate signature (Skip for Mock Mode / Dev)
        // const signature = req.headers.get("sanity-webhook-signature")
        // if (!isValidSignature(body, signature, WEBHOOK_SECRET)) { ... }

        const body = await req.json()
        const { _id, _type, language } = body

        console.log(`[Webhook] Received update for document: ${_id} (${_type}), Language: ${language}`)

        // 2. Filter: Only process 'zh-TW' documents
        if (language !== 'zh-TW') {
            console.log(`[Webhook] Ignoring non-source language: ${language}`)
            return NextResponse.json({ message: "Ignored (Not source language)" }, { status: 200 })
        }

        // 3. Parse and Translate using Content Parser
        const translationService = getTranslationService()
        const contentParser = new ContentParser(translationService)
        const sourceTitle = body.title || "No Title"

        console.log(`[Webhook] Starting extraction and translation for: ${sourceTitle}`)

        // Generate translated documents
        const translatedDocJP = await contentParser.parseAndTranslate(body, 'ja-JP')
        const translatedDocEN = await contentParser.parseAndTranslate(body, 'en-US')

        // Assign deterministic IDs and language fields
        const jpId = generateTranslatedId(_id, 'ja-JP')
        const enId = generateTranslatedId(_id, 'en-US')

        translatedDocJP._id = jpId
        translatedDocJP.language = 'ja-JP'

        translatedDocEN._id = enId
        translatedDocEN.language = 'en-US'

        console.log(`[Webhook] JP Doc ID: ${jpId}, Title: ${translatedDocJP.title}`)
        console.log(`[Webhook] EN Doc ID: ${enId}, Title: ${translatedDocEN.title}`)

        // 4. Write back to Sanity (or DRY_RUN)
        if (DRY_RUN) {
            console.log(`[Webhook] DRY_RUN mode enabled. Skipping Sanity write.`)
            console.log(`[Webhook] Would createOrReplace JP: ${jpId}`)
            console.log(`[Webhook] Would createOrReplace EN: ${enId}`)
        } else {
            console.log(`[Webhook] Writing to Sanity...`)
            const transaction = client.transaction()
            transaction.createOrReplace(translatedDocJP)
            transaction.createOrReplace(translatedDocEN)
            await transaction.commit()
            console.log(`[Webhook] Successfully wrote JP and EN documents to Sanity.`)
        }

        return NextResponse.json({
            message: DRY_RUN ? "Processing complete (DRY_RUN)" : "Processing complete (Written to Sanity)",
            dryRun: DRY_RUN,
            original: {
                id: _id,
                title: body.title
            },
            generated: {
                ja: { id: jpId, title: translatedDocJP.title },
                en: { id: enId, title: translatedDocEN.title }
            }
        }, { status: 200 })

    } catch (error) {
        console.error("[Webhook] Error processing request:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

