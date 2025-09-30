"use client"

import { MouseEvent, ReactNode } from "react"
import { useLogout } from "@lib/hooks/use-logout"

interface SignoutButtonProps {
  countryCode: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export default function SignoutButton({ 
  countryCode, 
  children, 
  className,
  onClick 
}: Readonly<SignoutButtonProps>) {
  const { logout, isLoggingOut } = useLogout({
    countryCode,
    onLoggedOut: onClick,
  })

  const handleSignout = (event?: MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    void logout()
  }

  return (
    <button
      type="button"
      className={className}
      onClick={(e) => handleSignout(e)}
      data-testid="logout-button"
      disabled={isLoggingOut}
    >
      {children}
    </button>
  )
}
