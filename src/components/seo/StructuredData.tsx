// Schema.org 結構化數據組件

export interface LocalBusinessSchemaProps {
    name: string
    description: string
    url: string
    telephone?: string
    address?: {
        streetAddress: string
        addressLocality: string
        addressRegion?: string
        postalCode?: string
        addressCountry: string
    }
    geo?: {
        latitude: number
        longitude: number
    }
    openingHours?: string[]
    priceRange?: string
    image?: string
}

export function LocalBusinessSchema(props: LocalBusinessSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'HairSalon',
        name: props.name,
        description: props.description,
        url: props.url,
        telephone: props.telephone,
        address: props.address ? {
            '@type': 'PostalAddress',
            ...props.address
        } : undefined,
        geo: props.geo ? {
            '@type': 'GeoCoordinates',
            latitude: props.geo.latitude,
            longitude: props.geo.longitude
        } : undefined,
        openingHoursSpecification: props.openingHours?.map(hours => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: hours.split('-')[0],
            closes: hours.split('-')[1]
        })),
        priceRange: props.priceRange,
        image: props.image,
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export interface BreadcrumbSchemaProps {
    items: Array<{
        name: string
        url: string
    }>
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export interface ProductSchemaProps {
    name: string
    description: string
    image: string[]
    sku?: string
    brand?: string
    offers: {
        price: number
        priceCurrency: string
        availability: string
        url: string
    }
}

export function ProductSchema(props: ProductSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: props.name,
        description: props.description,
        image: props.image,
        sku: props.sku,
        brand: props.brand ? {
            '@type': 'Brand',
            name: props.brand
        } : undefined,
        offers: {
            '@type': 'Offer',
            ...props.offers
        }
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export interface ArticleSchemaProps {
    headline: string
    description: string
    image: string
    datePublished: string
    dateModified?: string
    author: {
        name: string
    }
    publisher: {
        name: string
        logo: string
    }
}

export function ArticleSchema(props: ArticleSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: props.headline,
        description: props.description,
        image: props.image,
        datePublished: props.datePublished,
        dateModified: props.dateModified || props.datePublished,
        author: {
            '@type': 'Person',
            name: props.author.name
        },
        publisher: {
            '@type': 'Organization',
            name: props.publisher.name,
            logo: {
                '@type': 'ImageObject',
                url: props.publisher.logo
            }
        }
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export interface WebSiteSchemaProps {
    name: string
    url: string
    description: string
    potentialAction?: {
        target: string
        queryInput: string
    }
}

export function WebSiteSchema(props: WebSiteSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: props.name,
        url: props.url,
        description: props.description,
        potentialAction: props.potentialAction ? {
            '@type': 'SearchAction',
            target: props.potentialAction.target,
            'query-input': props.potentialAction.queryInput
        } : undefined
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}
