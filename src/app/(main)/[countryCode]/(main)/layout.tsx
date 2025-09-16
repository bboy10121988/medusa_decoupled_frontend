import { Metadata } from "next"
import { getBaseURL } from "@shared/utilities/env"
import Nav from "@features/site-navigation/layout/templates/nav"
import Footer from "@features/site-navigation/layout/templates/footer"

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
