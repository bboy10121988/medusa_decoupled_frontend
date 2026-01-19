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
import zhTWAccount from '@/locales/zh-TW/account.json'
import zhTWCart from '@/locales/zh-TW/cart.json'

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
import jaJPAccount from '@/locales/ja-JP/account.json'
import jaJPCart from '@/locales/ja-JP/cart.json'

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
import enUSAccount from '@/locales/en-US/account.json'
import enUSCart from '@/locales/en-US/cart.json'

// Type definition for translations
export interface TranslationType {
    // common
    account: string
    cart: string
    search: string
    helpButton: string
    storeName: string
    home?: string
    // cart
    subtotal?: string
    goToCart?: string
    checkout?: string
    viewCart?: string
    summary?: string
    goToCheckout?: string
    item?: string
    // quantity?: string // Removed duplicate
    total?: string
    // account
    welcomeBack?: string
    becomeAMember?: string
    loginDescription?: string
    registerDescription?: string
    or?: string
    email?: string
    password?: string
    forgotPassword?: string
    signIn?: string
    notAMember?: string
    joinNow?: string
    alreadyAMember?: string
    signInNow?: string
    join?: string
    firstName?: string
    lastName?: string
    phone?: string
    privacyPolicy?: string
    termsOfUse?: string
    agreeToTerms?: string
    and?: string
    checkingAccount?: string
    emailCanLogin?: string
    emailNotRegistered?: string
    registerSuccess?: string
    googleLogin?: string
    emailValidation?: string
    questionsTitle?: string
    questionsText?: string
    customerServiceLink?: string
    // navigation
    categories: string
    collections: string
    featured: string
    // product
    addToCart: string
    collection?: string
    collectionHandle?: string
    tags?: string
    totalCategories?: string
    totalTags?: string
    noProductMeta?: string
    adding: string
    preorder: string
    soldOut: string
    addedToCart: string
    selectOptions: string
    pleaseSelectOptions: string
    failedToAddToCart: string
    productInfo?: string
    categoriesAndTags?: string
    returnPolicy?: string
    youMayAlsoLike?: string
    relatedProductsSubtitle?: string
    size?: string
    color?: string
    quantity?: string
    inStock?: string
    outOfStock?: string
    description?: string
    noDescription?: string
    material?: string
    weight?: string
    dimensions?: string
    priceNotAvailable?: string
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
// Note: checkout and home have nested structures, export them separately
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

// Export nested translation objects separately
export const checkoutTranslations = {
    tw: zhTWCheckout,
    jp: jaJPCheckout,
    us: enUSCheckout,
    'zh-TW': zhTWCheckout,
    'ja-JP': jaJPCheckout,
    'en-US': enUSCheckout,
    // Fallback mappings
    my: enUSCheckout,
    sg: enUSCheckout,
    au: enUSCheckout,
}

export const homeTranslations = {
    tw: zhTWHome,
    jp: jaJPHome,
    us: enUSHome,
    'zh-TW': zhTWHome,
    'ja-JP': jaJPHome,
    'en-US': enUSHome,
    // Fallback mappings
    my: enUSHome,
    sg: enUSHome,
    au: enUSHome,
}

export const accountTranslations = {
    tw: zhTWAccount,
    jp: jaJPAccount,
    us: enUSAccount,
    'zh-TW': zhTWAccount,
    'ja-JP': jaJPAccount,
    'en-US': enUSAccount,
    my: enUSAccount,
    sg: enUSAccount,
    au: enUSAccount,
}

export const cartTranslations = {
    tw: zhTWCart,
    jp: jaJPCart,
    us: enUSCart,
    'zh-TW': zhTWCart,
    'ja-JP': jaJPCart,
    'en-US': enUSCart,
    my: enUSCart,
    sg: enUSCart,
    au: enUSCart,
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
