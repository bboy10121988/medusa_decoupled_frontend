"use client"

import { useEffect } from "react"

type HeaderHeightSetterProps = {
  totalHeight: number
}

export default function HeaderHeightSetter({ totalHeight }: HeaderHeightSetterProps) {
  useEffect(() => {
    // 設置全域 CSS 變數
    const root = document.documentElement
    root.style.setProperty('--header-total-height', `${totalHeight}px`)
    root.style.setProperty('--hero-mobile-height', `calc(100vh - ${totalHeight}px)`)
  }, [totalHeight])

  // 這是一個不可見的組件，只用於設置 CSS 變數
  return null
}