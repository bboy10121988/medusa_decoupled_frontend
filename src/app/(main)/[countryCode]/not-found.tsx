'use client'

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function NotFound() {
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        if (params?.countryCode) {
            router.replace(`/${params.countryCode}`)
        } else {
            router.replace('/')
        }
    }, [params, router])

    return null
}
