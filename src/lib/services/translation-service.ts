export interface TranslationResult {
    text: string
    detectedSourceLang?: string | undefined
}

export interface ITranslationService {
    translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResult>
    translateBatch(texts: string[], targetLang: string, sourceLang?: string): Promise<TranslationResult[]>
}

/**
 * Mock translation service - adds [JP] or [EN] prefix to text
 * Used when DEEPL_API_KEY is not configured
 */
export class MockTranslationService implements ITranslationService {
    async translate(text: string, targetLang: string, sourceLang: string = 'zh-TW'): Promise<TranslationResult> {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 100))

        // Simple mock: append language code to text
        // "Hello" -> "[JP] Hello"
        const prefix = targetLang === 'ja-JP' ? '[JP]' : `[${targetLang}]`
        return {
            text: `${prefix} ${text}`,
            detectedSourceLang: sourceLang
        }
    }

    async translateBatch(texts: string[], targetLang: string, sourceLang: string = 'zh-TW'): Promise<TranslationResult[]> {
        return Promise.all(texts.map(text => this.translate(text, targetLang, sourceLang)))
    }
}

/**
 * DeepL translation service - uses DeepL API for real translations
 * Requires DEEPL_API_KEY environment variable
 */
export class DeepLTranslationService implements ITranslationService {
    private apiKey: string
    private baseUrl: string

    constructor(apiKey: string) {
        this.apiKey = apiKey
        // Use free API endpoint if key ends with :fx
        this.baseUrl = apiKey.endsWith(':fx')
            ? 'https://api-free.deepl.com/v2'
            : 'https://api.deepl.com/v2'
    }

    private mapLangCode(lang: string): string {
        // Map our lang codes to DeepL format
        const mapping: Record<string, string> = {
            'ja-JP': 'JA',
            'en-US': 'EN',
            'en': 'EN',
            'zh-TW': 'ZH',
        }
        return mapping[lang] || lang.toUpperCase().split('-')[0]
    }

    async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResult> {
        const response = await fetch(`${this.baseUrl}/translate`, {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: [text],
                target_lang: this.mapLangCode(targetLang),
                source_lang: sourceLang ? this.mapLangCode(sourceLang) : undefined,
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            console.error(`[DeepL] Translation failed: ${response.status} - ${error}`)
            // Fallback to original text on error
            return { text, detectedSourceLang: sourceLang }
        }

        const data = await response.json()
        return {
            text: data.translations[0].text,
            detectedSourceLang: data.translations[0].detected_source_language,
        }
    }

    async translateBatch(texts: string[], targetLang: string, sourceLang?: string): Promise<TranslationResult[]> {
        const response = await fetch(`${this.baseUrl}/translate`, {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: texts,
                target_lang: this.mapLangCode(targetLang),
                source_lang: sourceLang ? this.mapLangCode(sourceLang) : undefined,
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            console.error(`[DeepL] Batch translation failed: ${response.status} - ${error}`)
            // Fallback to original texts on error
            return texts.map(text => ({ text, detectedSourceLang: sourceLang }))
        }

        const data = await response.json()
        return data.translations.map((t: any) => ({
            text: t.text,
            detectedSourceLang: t.detected_source_language,
        }))
    }
}

/**
 * Factory to get translation service
 * Returns DeepL service if API key is configured, otherwise Mock service
 */
export function getTranslationService(): ITranslationService {
    const apiKey = process.env.DEEPL_API_KEY

    if (apiKey && apiKey.trim() !== '') {
        console.log('[Translation] Using DeepL translation service')
        return new DeepLTranslationService(apiKey)
    }

    console.log('[Translation] Using Mock translation service (no API key)')
    return new MockTranslationService()
}

