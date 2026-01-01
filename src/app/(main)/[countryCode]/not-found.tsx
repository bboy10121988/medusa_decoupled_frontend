import { redirect } from "next/navigation"

export default function NotFound() {
    // Server-side redirect to country homepage
    redirect("/tw")
}
