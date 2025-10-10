import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    google_client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'NOT_SET',
    has_client_id: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    publishable_key: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'NOT_SET',
    has_publishable_key: !!process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    medusa_backend_url: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'NOT_SET',
  })
}