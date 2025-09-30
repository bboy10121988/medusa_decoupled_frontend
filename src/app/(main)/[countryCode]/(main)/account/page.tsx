"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function AccountPage() {
  const router = useRouter()
  const params = useParams()
  const countryCode = params.countryCode as string

  useEffect(() => {
    // 重定向到 profile 頁面
    router.replace(`/${countryCode}/account/profile`)
  }, [router, countryCode])

  return null
}
