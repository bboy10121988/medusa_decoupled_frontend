"use server"

import { cookies } from "next/headers"
import { MEDUSA_BACKEND_URL } from "../config"
import { setAffiliateAuthToken } from "./affiliate-auth"

export async function syncAffiliateSession() {
    const cookieStore = await cookies()
    const medusaJwt = cookieStore.get("_medusa_jwt")?.value

    if (!medusaJwt) return { success: false, message: "No Medusa session" }

    try {
        const res = await fetch(`${MEDUSA_BACKEND_URL}/store/affiliates/me/sync`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${medusaJwt}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        })

        if (!res.ok) return { success: false, message: "Sync failed" }

        const data = await res.json()

        if (data.is_affiliate && data.token && data.session) {
            await setAffiliateAuthToken(data.session, data.token)
            return { success: true, is_affiliate: true }
        }

        return { success: true, is_affiliate: false }
    } catch (error) {
        console.error("Affiliate sync error:", error)
        return { success: false, error }
    }
}
