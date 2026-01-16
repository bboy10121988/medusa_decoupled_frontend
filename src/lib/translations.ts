export const translations = {
    tw: {
        account: "帳戶",
        cart: "購物車",
        categories: "商品分類",
        collections: "商品系列",
        search: "搜尋商品...",
        featured: "精選商品",
        addToCart: "加入購物車",
        adding: "處理中...",
        preorder: "預訂",
        soldOut: "售完",
        addedToCart: "商品已加入購物車",
        selectOptions: "選擇商品規格",
        pleaseSelectOptions: "請選擇所有必要的選項",
        failedToAddToCart: "添加到購物車失敗，請稍後再試",
        customerService: "客戶服務",
        contactInfo: "聯絡資訊",
        tel: "電話",
        officialLine: "官方Line",
        noPosts: "目前還沒有已發布的文章",
        viewMore: "查看更多文章",
        readMore: "閱讀更多",
    },
    us: {
        account: "Account",
        cart: "Cart",
        categories: "Categories",
        collections: "Collections",
        search: "Search...",
        featured: "Featured",
        addToCart: "Add to Cart",
        adding: "Processing...",
        preorder: "Pre-order",
        soldOut: "Sold Out",
        addedToCart: "Added to Cart",
        selectOptions: "Select Options",
        pleaseSelectOptions: "Please select all required options",
        failedToAddToCart: "Failed to add to cart, please try again",
        customerService: "Customer Service",
        contactInfo: "Contact Information",
        tel: "Tel",
        officialLine: "Official LINE",
        noPosts: "No posts published yet",
        viewMore: "View more posts",
        readMore: "Read more",
    }
}

export type Language = keyof typeof translations

// Mapping for dynamic content (Medusa categories/collections and Sanity sections)
const dataMapping: Record<string, Record<string, string>> = {
    "精選商品": { us: "Featured Products" },
    "髮品造型": { us: "Hair Styling" },
    "洗沐用品": { us: "Bath & Body" },
    "客戶服務": { us: "Customer Service" },
    "退換貨政策": { us: "Returns & Exchanges" },
    "隱私權政策": { us: "Privacy Policy" },
    "聯絡資訊": { us: "Contact Information" },
    "電話：": { us: "Tel: " },
    "官方Line: ": { us: "Official LINE: " },
    "常見問題": { us: "FAQ" }
}

export const getTranslation = (lang: string = 'tw') => {
    const code = lang.toLowerCase() as Language
    return translations[code] || translations.tw
}

/**
 * Translates a given text based on the country code using a mapping of common terms.
 * If no mapping is found, it returns the original text.
 */
export const translateText = (text: string | null | undefined, lang: string = 'tw'): string => {
    if (!text) return ""
    if (lang.toLowerCase() === 'tw') return text

    const code = lang.toLowerCase()

    // Exact match
    if (dataMapping[text] && dataMapping[text][code]) {
        return dataMapping[text][code]
    }

    // Partial matches for things like "電話：02-..."
    for (const [key, mapping] of Object.entries(dataMapping)) {
        if (text.startsWith(key) && mapping[code]) {
            return text.replace(key, mapping[code])
        }
    }

    return text
}
