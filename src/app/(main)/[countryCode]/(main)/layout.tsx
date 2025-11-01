import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import Nav from "@modules/layout/templates/nav"
import Footer from "@modules/layout/templates/footer"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main style={{ margin: 0, padding: 0, border: 'none', outline: 'none', display: 'block' }}>
        {props.children}
      </main>
      <Footer />
    </>
  )
}
