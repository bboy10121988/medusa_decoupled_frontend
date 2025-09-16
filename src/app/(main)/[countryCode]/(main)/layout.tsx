import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import Nav from "@components/layout/templates/nav"
import Footer from "@components/layout/templates/footer"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {props.children}
      <Footer />
    </>
  )
}
