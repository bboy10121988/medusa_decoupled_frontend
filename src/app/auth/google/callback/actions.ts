"use server"

import { setAuthToken } from "@/lib/data/cookies"

export async function setGoogleAuthCookie(token: string) {
    console.log("🔵 setGoogleAuthCookie Server Action called with token length:", token?.length)
    await setAuthToken(token)
    return { success: true }
}
