'use client'

import Link from 'next/link'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'

interface BreadcrumbItem {
    name: string
    url: string
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
    className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://timsfantasyworld.com'

    // 為結構化數據添加完整 URL
    const schemaItems = items.map(item => ({
        name: item.name,
        url: `${baseUrl}${item.url}`
    }))

    return (
        <>
            <BreadcrumbSchema items={schemaItems} />
            <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
                <ol className="flex items-center space-x-2">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <span className="mx-2 text-gray-400">/</span>
                            )}
                            {index === items.length - 1 ? (
                                <span className="text-gray-600 font-medium" aria-current="page">
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    href={item.url}
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    )
}
