"use client"
import React from "react"
import dynamic from "next/dynamic"

// 使用動態導入 Sanity 控制的 Footer
const Footer = dynamic(
  () => import("./index"),
  { ssr: true } // 開啟SSR以避免閃爍
)

const ClientFooter = () => {
  return <Footer />
}

export default ClientFooter
