import { MetadataRoute } from 'next'
import { MEDUSA_BACKEND_URL } from "@lib/config"
import client from "@lib/sanity"

const BASE_URL = 'https://timsfantasyworld.com'

// All supported countries/locales
const SUPPORTED_COUNTRIES = ['tw', 'jp', 'us', 'my']

async function getProducts() {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }

        // Use publishable key if available
        if (process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY) {
            headers["x-publishable-api-key"] = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        }

        // Fetch all products
        const res = await fetch(`${MEDUSA_BACKEND_URL}/store/products?limit=1000`, {
            headers,
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!res.ok) return []
        const { products } = await res.json()
        return products
    } catch (error) {
        console.error("Sitemap product fetch error:", error)
        return []
    }
}

async function getBlogPosts() {
    try {
        const query = `*[_type == "post"] {
      slug { current },
      publishedAt
    }`
        const posts = await client.fetch(query)
        return posts
    } catch (error) {
        console.error("Sitemap blog fetch error:", error)
        return []
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await getProducts()
    const posts = await getBlogPosts()

    // Static routes for all countries (updated with dynamic pages)
    const staticPages = [
        '',
        '/store',
        '/blog',
        '/account',
        '/cart',
        '/intro',
        '/contact',
        '/faq',
        '/return',
        '/privacy-policy'
    ]

    const staticRoutes = staticPages.flatMap(page =>
        SUPPORTED_COUNTRIES.map(country => ({
            url: `${BASE_URL}/${country}${page}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: page === '' ? 1 : 0.9,
        }))
    )

    // Product routes for all countries
    const productRoutes = products.flatMap((product: any) =>
        SUPPORTED_COUNTRIES.map(country => ({
            url: `${BASE_URL}/${country}/products/${product.handle}`,
            lastModified: new Date(product.updated_at),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))
    )

    // Blog routes for all countries
    const blogRoutes = posts.flatMap((post: any) =>
        SUPPORTED_COUNTRIES.map(country => ({
            url: `${BASE_URL}/${country}/blog/${post.slug.current}`,
            lastModified: new Date(post.publishedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    )

    return [...staticRoutes, ...productRoutes, ...blogRoutes]
}
