import { Text } from "@medusajs/ui"

import Medusa from "../../../common/icons/medusa"
import NextJs from "../../../common/icons/nextjs"

const MedusaCTA = () => {
  return (
    <Text className="flex gap-x-2 txt-compact-small-plus items-center">
      Powered by
      <a href="https://www.medusajs.com" target="_blank" rel="noreferrer">
        <Medusa fill="#FFFFFF" className="fill-[#FFFFFF]" />
      </a>
      &
      <a href="https://nextjs.org" target="_blank" rel="noreferrer">
        <NextJs fill="#FFFFFF" />
      </a>
    </Text>
  )
}

export default MedusaCTA
