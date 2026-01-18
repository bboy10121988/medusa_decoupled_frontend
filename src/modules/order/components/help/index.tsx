import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getTranslation } from "@lib/translations"
import React from "react"

type HelpProps = {
  countryCode?: string
}

const Help = ({ countryCode = 'tw' }: HelpProps) => {
  const t = getTranslation(countryCode)
  return (
    <div className="mt-6">
      <Heading className="text-base-semi">{(t as any).help?.title || '需要幫助嗎？'}</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink href="/contact">{(t as any).help?.contact_us || '聯絡我們'}</LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/contact">
              {(t as any).help?.returns || '退換貨服務'}
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
