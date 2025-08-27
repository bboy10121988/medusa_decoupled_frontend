"use client"
import React from "react"
import { RegionProvider } from "@lib/context/region-context"

const ClientArea = ({ children }: { children: React.ReactNode }) => {
  return (
    <RegionProvider>
      <main className="relative">{children}</main>
    </RegionProvider>
  )
}

export default ClientArea
