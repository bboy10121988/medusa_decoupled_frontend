"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement> | undefined
  passHref?: true
  [x: string]: any
}) => {
  const { countryCode: rawCountryCode } = useParams()
  
    const { onClick, ...rest } = props

  // 確保 countryCode 只有兩位小寫字母
  const countryCode = typeof rawCountryCode === 'string' 
                     ? rawCountryCode.toLowerCase() 
                     : 'tw'

  // 如果 countryCode 不合法，使用預設值
  const validCountryCode = /^[a-z]{2}$/.test(countryCode) 
                     ? countryCode 
                     : 'tw'

  // 避免重複添加 countryCode
  const finalHref = href.startsWith(`/${validCountryCode}`) 
    ? href 
    : `/${validCountryCode}${href}`

  return (
    <Link href={finalHref} {...rest} {...(onClick ? { onClick } : {})}>
      {children}
    </Link>
  )


}

export default LocalizedClientLink
