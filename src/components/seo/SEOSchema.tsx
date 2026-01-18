import { LocalBusinessSchema, WebSiteSchema } from '@/components/seo/StructuredData'

interface SEOSchemaProps {
    countryCode: string
}

export function SEOSchema({ countryCode }: SEOSchemaProps) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://timsfantasyworld.com'

    // 根據語言設定內容
    const content: Record<string, any> = {
        'tw': {
            name: "Tim's Fantasy World 男士專業美髮造型",
            description: "Tim's Fantasy World 提供專業男士理髮、染髮、燙髮服務。位於台北，經驗豐富的設計師為您打造完美造型。",
            addressLocality: "台北",
            addressCountry: "TW"
        },
        'jp': {
            name: "Tim's Fantasy World メンズヘアサロン",
            description: "Tim's Fantasy Worldは、プロフェッショナルなメンズカット、カラー、パーマサービスを提供しています。",
            addressLocality: "東京",
            addressCountry: "JP"
        },
        'us': {
            name: "Tim's Fantasy World",
            description: "Tim's Fantasy World offers professional men's haircut, color, and perm services.",
            addressLocality: "Taipei",
            addressCountry: "US"
        }
    }

    const lang = content[countryCode] || content['tw']

    return (
        <>
            <LocalBusinessSchema
                name={lang.name}
                description={lang.description}
                url={`${baseUrl}/${countryCode}`}
                address={{
                    streetAddress: "",
                    addressLocality: lang.addressLocality,
                    addressCountry: lang.addressCountry
                }}
                geo={{
                    latitude: 25.030775,
                    longitude: 121.527158
                }}
                openingHours={['10:00-20:00']}
                priceRange="$$"
                image={`${baseUrl}/logo.png`}
            />

            <WebSiteSchema
                name={lang.name}
                url={`${baseUrl}/${countryCode}`}
                description={lang.description}
                potentialAction={{
                    target: `${baseUrl}/${countryCode}/store?search={search_term_string}`,
                    queryInput: 'required name=search_term_string'
                }}
            />
        </>
    )
}
