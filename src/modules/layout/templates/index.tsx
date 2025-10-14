import React from "react"
import { Suspense } from "react"
import Nav from "@modules/layout/templates/nav"
import FaviconMeta from "@/components/favicon-meta"
import { getHeader } from "@/lib/sanity"

async function FaviconProvider() {
  try {
    const headerData = await getHeader()
    return (
      <FaviconMeta 
        faviconUrl={headerData?.favicon?.url} 
        altText={headerData?.favicon?.alt} 
      />
    )
  } catch (error) {
    console.warn('無法載入 favicon:', error)
    return null
  }
}

const Layout: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div>
      <Suspense fallback={null}>
        <FaviconProvider />
      </Suspense>
      <Nav />
      <main className="relative">{children}</main>
    </div>
  )
}

export default Layout
