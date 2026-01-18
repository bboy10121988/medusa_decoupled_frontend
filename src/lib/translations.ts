// Import JSON translation files
// zh-TW
import zhTWCommon from '@/locales/zh-TW/common.json'
import zhTWNavigation from '@/locales/zh-TW/navigation.json'
import zhTWProduct from '@/locales/zh-TW/product.json'
import zhTWBlog from '@/locales/zh-TW/blog.json'
import zhTWFooter from '@/locales/zh-TW/footer.json'
import zhTWPromotion from '@/locales/zh-TW/promotion.json'
import zhTWDataMapping from '@/locales/zh-TW/data-mapping.json'
import zhTWCheckout from '@/locales/zh-TW/checkout.json'
import zhTWHome from '@/locales/zh-TW/home.json'

// ja-JP
import jaJPCommon from '@/locales/ja-JP/common.json'
import jaJPNavigation from '@/locales/ja-JP/navigation.json'
import jaJPProduct from '@/locales/ja-JP/product.json'
import jaJPBlog from '@/locales/ja-JP/blog.json'
import jaJPFooter from '@/locales/ja-JP/footer.json'
import jaJPPromotion from '@/locales/ja-JP/promotion.json'
import jaJPDataMapping from '@/locales/ja-JP/data-mapping.json'
import jaJPCheckout from '@/locales/ja-JP/checkout.json'
import jaJPHome from '@/locales/ja-JP/home.json'

// en-US
import enUSCommon from '@/locales/en-US/common.json'
import enUSNavigation from '@/locales/en-US/navigation.json'
import enUSProduct from '@/locales/en-US/product.json'
import enUSBlog from '@/locales/en-US/blog.json'
import enUSFooter from '@/locales/en-US/footer.json'
import enUSPromotion from '@/locales/en-US/promotion.json'
import enUSDataMapping from '@/locales/en-US/data-mapping.json'
import enUSCheckout from '@/locales/en-US/checkout.json'
import enUSHome from '@/locales/en-US/home.json'

// Type definition for translations
export interface TranslationType {
    // common
    account: string
    cart: string
    search: string
    helpButton: string
    storeName: string
    // navigation
    categories: string
    collections: string
    featured: string
    // product
    addToCart: string
    adding: string
    preorder: string
    soldOut: string
    addedToCart: string
    selectOptions: string
    pleaseSelectOptions: string
    failedToAddToCart: string
    // blog
    noPosts: string
    viewMore: string
    readMore: string
    latestPosts: string
    allArticles: string
    noPostsInCat: string
    // footer
    customerService: string
    contactInfo: string
    tel: string
    officialLine: string
    lineConsult: string
    // promotion
    marquee1: string
    marquee2: string
    marquee3: string
}

// Merge all JSON files for each locale
const zhTW: TranslationType = {
    ...zhTWCommon,
    ...zhTWNavigation,
    ...zhTWProduct,
    ...zhTWBlog,
    ...zhTWFooter,
    ...zhTWPromotion,
}

const jaJP: TranslationType = {
    ...jaJPCommon,
    ...jaJPNavigation,
    ...jaJPProduct,
    ...jaJPBlog,
    ...jaJPFooter,
    ...jaJPPromotion,
}

const enUS: TranslationType = {
    ...enUSCommon,
    ...enUSNavigation,
    ...enUSProduct,
    ...enUSBlog,
    ...enUSFooter,
    ...enUSPromotion,
}

// Translation map with locale codes
export const translations: Record<string, TranslationType> = {
    // Country code mapping (for URL routing)
    tw: zhTW,
    us: enUS,
    jp: jaJP,
    // Full locale code mapping
    'zh-TW': zhTW,
    'en-US': enUS,
    'ja-JP': jaJP,
    // Fallback mappings
    my: enUS,
    sg: enUS,
    au: enUS,
}

export type Language = keyof typeof translations

// Data mapping for dynamic content translation
type DataMappingType = Record<string, string>

const dataMappings: Record<string, DataMappingType> = {
    tw: zhTWDataMapping,
    us: enUSDataMapping,
    jp: jaJPDataMapping,
    'zh-TW': zhTWDataMapping,
    'en-US': enUSDataMapping,
    'ja-JP': jaJPDataMapping,
    my: enUSDataMapping,
    sg: enUSDataMapping,
    au: enUSDataMapping,
}

/**
 * Get translation object for a given language/country code
 */
export const getTranslation = (lang: string = 'tw'): TranslationType => {
    const code = lang.toLowerCase()
    return translations[code] || translations.tw
}

/**
 * Translates a given text based on the country code using a mapping of common terms.
 * If no mapping is found, it returns the original text.
 */
export const translateText = (text: string | null | undefined, lang: string = 'tw'): string => {
    if (!text) return ""

    const code = lang.toLowerCase()

    // If requesting zh-TW/tw, return original text
    if (code === 'tw' || code === 'zh-tw') return text

    const mapping = dataMappings[code] || dataMappings.us

    // Exact match
    if (mapping[text]) {
        return mapping[text]
    }

    // Partial matches for things like "電話：02-..."
    for (const [key, value] of Object.entries(mapping)) {
        if (text.startsWith(key)) {
            return text.replace(key, value)
        }
    }

    return text
}

/**
 * Get available namespaces for a locale
 */
export const getNamespaces = () => [
    'common',
    'navigation',
    'product',
    'blog',
    'footer',
    'promotion',
    'data-mapping',
    'checkout',
    'home'
] as const

/**
 * Get available locales
 */
export const getLocales = () => ['zh-TW', 'ja-JP', 'en-US'] as const

/**
 * Map country code to full locale code
 */
export const countryToLocale = (countryCode: string): string => {
    const mapping: Record<string, string> = {
        tw: 'zh-TW',
        jp: 'ja-JP',
        us: 'en-US',
        my: 'en-US',
        sg: 'en-US',
        au: 'en-US',
    }
    return mapping[countryCode.toLowerCase()] || 'zh-TW'
}
