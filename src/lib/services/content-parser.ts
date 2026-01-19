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
    'desktopVideoUrl', 'mobileVideoUrl', 'href', 'url', 'src',

    // Sanity specific fields
    'style', 'listItem', 'marks', '_ref', '_weak', 'asset', 'markDefs'
]

export class ContentParser {
    constructor(private translationService: ITranslationService) { }

    /**
     * Deeply traverses an object, translates string values, and returns a new object.
     */
    /**
     * Deeply traverses an object, translates string values using BATCH optimization, and returns a new object.
     */
    async parseAndTranslate(data: any, targetLang: string): Promise<any> {
        // 1. Deep clone the data to avoid mutating original and to prepare the structure
        const result = structuredClone ? structuredClone(data) : JSON.parse(JSON.stringify(data));

        // 2. Collect all translatable strings and their references
        const translatableNodes: { parent: any, key: string | number, text: string }[] = [];
        this.collectTranslatableNodes(result, translatableNodes);

        if (translatableNodes.length === 0) {
            return result;
        }

        // 3. Extract text for batch translation
        const textsToTranslate = translatableNodes.map(node => node.text);
        console.log(`[ContentParser] Batch translating ${textsToTranslate.length} strings to ${targetLang}...`);

        // 4. Perform Batch Translation (Chunking if necessary, but DeepL handles 50 ok)
        // DeepL limit is usually 50 in one call, or payload size limit. 
        // Let's ensure we chunk if huge, but for now 1 call might suffice or simple chunking.
        // The service logic implementation usually assumes array fits? 
        // Let's add basic chunking here to be safe (50 items per chunk).
        const CHUNK_SIZE = 50;
        const translatedTexts: string[] = [];

        for (let i = 0; i < textsToTranslate.length; i += CHUNK_SIZE) {
            const chunk = textsToTranslate.slice(i, i + CHUNK_SIZE);
            const chunkResults = await this.translationService.translateBatch(chunk, targetLang);
            translatedTexts.push(...chunkResults.map(r => r.text));
        }

        // 5. Apply translations back to the result object
        translatableNodes.forEach((node, index) => {
            if (translatedTexts[index]) {
                node.parent[node.key] = translatedTexts[index];
            }
        });

        return result;
    }

    private collectTranslatableNodes(data: any, nodes: { parent: any, key: string | number, text: string }[]) {
        if (typeof data === 'string') {
            // Should not handle raw string root, but if called recursively it might?
            // Actually recursion happens on objects/arrays.
            return;
        }

        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                const value = data[i];
                if (typeof value === 'string') {
                    // Array of strings? translate them.
                    nodes.push({ parent: data, key: i, text: value });
                } else {
                    this.collectTranslatableNodes(value, nodes);
                }
            }
            return;
        }

        if (typeof data === 'object' && data !== null) {
            for (const key of Object.keys(data)) {
                // Skip excluded keys
                if (EXCLUDED_KEYS.includes(key)) {
                    continue;
                }

                const value = data[key];

                if (typeof value === 'string') {
                    // Check if it's a GUID or special string? 
                    // Usually safe to translate unless specific pattern.
                    // Empty strings?
                    if (value.trim()) {
                        nodes.push({ parent: data, key: key, text: value });
                    }
                } else {
                    this.collectTranslatableNodes(value, nodes);
                }
            }
        }
    }
}
