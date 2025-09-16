import { Metadata } from "next"

import LoginTemplate from "@features/user/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Medusa Store account.",
}

export default function Login() {
  return <LoginTemplate />
}
