import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import Nav from "@modules/layout/templates/nav"
import Footer from "@modules/layout/templates/footer"
import { SEOSchema } from "@/components/seo/SEOSchema"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  return (
    <>
      <SEOSchema countryCode={countryCode} />
      <Nav countryCode={countryCode} />
      <main style={{ margin: 0, padding: 0, border: 'none', outline: 'none', display: 'block' }}>
        {props.children}
      </main>
      <Footer countryCode={countryCode} />
    </>
  )
}
