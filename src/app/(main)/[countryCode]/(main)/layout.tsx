import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import Nav from "@modules/layout/templates/nav"
import Footer from "@modules/layout/templates/footer"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen m-0 p-0 border-0 outline-0" style={{ margin: 0, padding: 0, border: 'none' }}>
      <Nav />
      <main className="m-0 p-0 border-0 outline-0" style={{ margin: 0, padding: 0, border: 'none' }}>
        {props.children}
      </main>
      <Footer />
    </div>
  )
}
