import React from 'react'
import Link from 'next/link'

export default function AffiliateManagerLayout({
    children,
    params: { countryCode },
}: {
    children: React.ReactNode
    params: { countryCode: string }
}) {
    return (
        <div className="min-h-screen bg-ui-bg-subtle">
            <header className="sticky top-0 z-50 w-full border-b bg-white">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold">推廣管理後台</h1>
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link href={`/${countryCode}/affiliate/manager`} className="text-ui-fg-base hover:text-ui-fg-interactive">總覽 & 列表</Link>
                            <Link href={`/${countryCode}/affiliate/manager/payouts`} className="text-ui-fg-base hover:text-ui-fg-interactive">撥款管理</Link>
                        </nav>

                    </div>
                    <div>
                        <Link href={`/${countryCode}/affiliate`} className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-gray-100">回自己的推廣頁</Link>
                    </div>
                </div>
            </header>
            <main className="container py-8 px-4 sm:px-8">
                {children}
            </main>
        </div>
    )
}
