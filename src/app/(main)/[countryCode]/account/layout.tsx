import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import Nav from "@modules/layout/templates/nav"
import Footer from "@modules/layout/templates/footer"
import ClientAccountLayout from "./client-layout"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function AccountPageLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params

  return (
    <>
      <Nav countryCode={countryCode} />
      <ClientAccountLayout>
        {props.children}
      </ClientAccountLayout>
      <Footer countryCode={countryCode} />
    </>
  )
}
