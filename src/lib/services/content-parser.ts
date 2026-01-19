import { ITranslationService } from "./translation-service"

// Fields to exclude from translation
const EXCLUDED_KEYS = [
    // System fields
    '_id', '_type', '_rev', '_createdAt', '_updatedAt', '_key',

    // Reference and metadata fields
    'slug', 'metadata', 'mainImage', 'images', 'categories', 'author', 'language',

    // Code fields (should not be translated)
    'customCSS', 'customJS',

    // Fields that should remain in original language
    'englishTitle',

    // URL fields (should not be translated)
    'buttonUrl', 'buttonLink', 'videoUrl', 'googleMapsUrl', 'imageLink', 'linkUrl',
    'desktopVideoUrl', 'mobileVideoUrl', 'href', 'url', 'src'
]

export class ContentParser {
    constructor(private translationService: ITranslationService) { }

    /**
     * Deeply traverses an object, translates string values, and returns a new object.
     */
    async parseAndTranslate(data: any, targetLang: string): Promise<any> {
        if (typeof data === 'string') {
            // Translate string values
            const result = await this.translationService.translate(data, targetLang)
            return result.text
        }

        if (Array.isArray(data)) {
            // Recursively process arrays
            return Promise.all(data.map(item => this.parseAndTranslate(item, targetLang)))
        }

        if (typeof data === 'object' && data !== null) {
            const result: any = {}

            for (const [key, value] of Object.entries(data)) {
                // Skip excluded keys (metadata, system fields, etc.)
                if (EXCLUDED_KEYS.includes(key)) {
                    result[key] = value
                    continue
                }

                // Special handling for Portable Text (blocks)? 
                // For now, standard recursion covers most text fields within blocks (like 'text' children)
                // Note: Sanity Reference types ({_ref: ...}) usually fall under EXCLUDED_KEYS or objects without translatable strings

                result[key] = await this.parseAndTranslate(value, targetLang)
            }
            return result
        }

        // Return other primitives (number, boolean, null) as is
        return data
    }
}
