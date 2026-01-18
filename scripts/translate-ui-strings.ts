/**
 * UI String Translation Script
 *
 * This script automatically translates UI strings from zh-TW to ja-JP and en-US
 * using the DeepL API.
 *
 * Features:
 * - Reads source translations from /src/locales/zh-TW/*.json
 * - Translates to ja-JP and en-US using DeepL API
 * - Preserves existing translations (does not overwrite manually reviewed content)
 * - Supports dry-run mode for previewing changes
 *
 * Usage:
 *   npm run translate:ui              # Run translation
 *   npm run translate:ui -- --dry-run # Preview changes without writing
 *
 * Environment:
 *   DEEPL_API_KEY - Required for real translation
 */

import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Configuration
const LOCALES_DIR = path.resolve(__dirname, '../src/locales')
const SOURCE_LOCALE = 'zh-TW'
const TARGET_LOCALES = ['ja-JP', 'en-US']
const NAMESPACES = ['common', 'navigation', 'product', 'blog', 'footer', 'promotion', 'data-mapping']

// DeepL language code mapping
const DEEPL_LANG_MAP: Record<string, string> = {
    'ja-JP': 'JA',
    'en-US': 'EN',
    'zh-TW': 'ZH',
}

interface TranslationEntry {
    key: string
    source: string
    target: string | null
    needsTranslation: boolean
}

interface TranslationStats {
    total: number
    translated: number
    skipped: number
    failed: number
}

/**
 * DeepL API client for translations
 */
class DeepLClient {
    private apiKey: string
    private baseUrl: string

    constructor(apiKey: string) {
        this.apiKey = apiKey
        // Use free API endpoint if key ends with :fx
        this.baseUrl = apiKey.endsWith(':fx')
            ? 'https://api-free.deepl.com/v2'
            : 'https://api.deepl.com/v2'
    }

    async translate(texts: string[], targetLang: string): Promise<string[]> {
        const deepLLang = DEEPL_LANG_MAP[targetLang] || targetLang.split('-')[0].toUpperCase()

        const response = await fetch(`${this.baseUrl}/translate`, {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: texts,
                target_lang: deepLLang,
                source_lang: 'ZH',
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`DeepL API error: ${response.status} - ${error}`)
        }

        const data = await response.json()
        return data.translations.map((t: any) => t.text)
    }

    async getUsage(): Promise<{ character_count: number; character_limit: number }> {
        const response = await fetch(`${this.baseUrl}/usage`, {
            headers: {
                'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to get DeepL usage: ${response.status}`)
        }

        return response.json()
    }
}

/**
 * Read JSON file safely
 */
function readJsonFile(filePath: string): Record<string, string> {
    try {
        if (!fs.existsSync(filePath)) {
            return {}
        }
        const content = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error)
        return {}
    }
}

/**
 * Write JSON file with pretty formatting
 */
function writeJsonFile(filePath: string, data: Record<string, string>): void {
    const content = JSON.stringify(data, null, 2) + '\n'
    fs.writeFileSync(filePath, content, 'utf-8')
}

/**
 * Get translation entries that need to be translated
 */
function getTranslationEntries(
    sourceData: Record<string, string>,
    targetData: Record<string, string>
): TranslationEntry[] {
    const entries: TranslationEntry[] = []

    for (const [key, sourceValue] of Object.entries(sourceData)) {
        const targetValue = targetData[key]
        const needsTranslation = !targetValue || targetValue.trim() === ''

        entries.push({
            key,
            source: sourceValue,
            target: targetValue || null,
            needsTranslation,
        })
    }

    return entries
}

/**
 * Translate a single namespace file
 */
async function translateNamespace(
    client: DeepLClient | null,
    namespace: string,
    targetLocale: string,
    dryRun: boolean
): Promise<TranslationStats> {
    const stats: TranslationStats = {
        total: 0,
        translated: 0,
        skipped: 0,
        failed: 0,
    }

    const sourceFile = path.join(LOCALES_DIR, SOURCE_LOCALE, `${namespace}.json`)
    const targetFile = path.join(LOCALES_DIR, targetLocale, `${namespace}.json`)

    // Read source and target files
    const sourceData = readJsonFile(sourceFile)
    const targetData = readJsonFile(targetFile)

    if (Object.keys(sourceData).length === 0) {
        console.log(`  ⚠ ${namespace}.json: No source data found`)
        return stats
    }

    // Get entries that need translation
    const entries = getTranslationEntries(sourceData, targetData)
    stats.total = entries.length

    const toTranslate = entries.filter(e => e.needsTranslation)
    stats.skipped = entries.filter(e => !e.needsTranslation).length

    if (toTranslate.length === 0) {
        console.log(`  ✓ ${namespace}.json: All ${stats.total} keys already translated`)
        return stats
    }

    console.log(`  → ${namespace}.json: ${toTranslate.length}/${stats.total} keys need translation`)

    if (dryRun) {
        console.log(`    [DRY-RUN] Would translate:`)
        for (const entry of toTranslate.slice(0, 5)) {
            console.log(`      - ${entry.key}: "${entry.source}"`)
        }
        if (toTranslate.length > 5) {
            console.log(`      ... and ${toTranslate.length - 5} more`)
        }
        stats.translated = toTranslate.length
        return stats
    }

    if (!client) {
        console.log(`    ⚠ No API key - skipping actual translation`)
        return stats
    }

    // Translate in batches
    const batchSize = 50
    const updatedData = { ...targetData }

    for (let i = 0; i < toTranslate.length; i += batchSize) {
        const batch = toTranslate.slice(i, i + batchSize)
        const texts = batch.map(e => e.source)

        try {
            const translations = await client.translate(texts, targetLocale)

            for (let j = 0; j < batch.length; j++) {
                updatedData[batch[j].key] = translations[j]
                stats.translated++
            }

            // Rate limiting
            if (i + batchSize < toTranslate.length) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
        } catch (error) {
            console.error(`    ✗ Batch translation failed:`, error)
            stats.failed += batch.length
        }
    }

    // Write updated translations
    writeJsonFile(targetFile, updatedData)
    console.log(`    ✓ Wrote ${stats.translated} translations to ${targetLocale}/${namespace}.json`)

    return stats
}

/**
 * Main translation function
 */
async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║           UI String Translation Tool (DeepL)               ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    console.log()

    // Parse arguments
    const args = process.argv.slice(2)
    const dryRun = args.includes('--dry-run')

    if (dryRun) {
        console.log('🔍 DRY-RUN MODE: No files will be modified\n')
    }

    // Check API key
    const apiKey = process.env.DEEPL_API_KEY
    let client: DeepLClient | null = null

    if (!apiKey) {
        console.log('⚠ DEEPL_API_KEY not found in environment')
        console.log('  Set it in .env.local to enable real translation\n')
    } else {
        client = new DeepLClient(apiKey)
        console.log('✓ DeepL API key configured')

        // Show usage
        try {
            const usage = await client.getUsage()
            const usedPercent = ((usage.character_count / usage.character_limit) * 100).toFixed(1)
            console.log(`  Usage: ${usage.character_count.toLocaleString()} / ${usage.character_limit.toLocaleString()} chars (${usedPercent}%)\n`)
        } catch (error) {
            console.log('  ⚠ Could not fetch usage info\n')
        }
    }

    // Process each target locale
    const totalStats: Record<string, TranslationStats> = {}

    for (const targetLocale of TARGET_LOCALES) {
        console.log(`\n📁 Translating to ${targetLocale}`)
        console.log('─'.repeat(50))

        totalStats[targetLocale] = {
            total: 0,
            translated: 0,
            skipped: 0,
            failed: 0,
        }

        for (const namespace of NAMESPACES) {
            const stats = await translateNamespace(client, namespace, targetLocale, dryRun)

            totalStats[targetLocale].total += stats.total
            totalStats[targetLocale].translated += stats.translated
            totalStats[targetLocale].skipped += stats.skipped
            totalStats[targetLocale].failed += stats.failed
        }
    }

    // Print summary
    console.log('\n')
    console.log('═'.repeat(50))
    console.log('📊 Summary')
    console.log('═'.repeat(50))

    for (const [locale, stats] of Object.entries(totalStats)) {
        console.log(`\n${locale}:`)
        console.log(`  Total keys:    ${stats.total}`)
        console.log(`  Translated:    ${stats.translated}`)
        console.log(`  Skipped:       ${stats.skipped} (already translated)`)
        if (stats.failed > 0) {
            console.log(`  Failed:        ${stats.failed}`)
        }
    }

    if (dryRun) {
        console.log('\n✨ Dry run complete. Run without --dry-run to apply changes.')
    } else {
        console.log('\n✨ Translation complete!')
    }
}

// Run
main().catch(console.error)
