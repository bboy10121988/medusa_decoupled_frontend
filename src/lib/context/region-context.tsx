'use client'

import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from "react"

export type Region = {
  countryCode: string
  name: string
}

type RegionContext = {
  region: Region | null
  setRegion: Dispatch<SetStateAction<Region | null>>
}

// 提供一個預設值
const defaultContextValue: RegionContext = {
  region: null,
  setRegion: () => null,
}

export const RegionContext = createContext<RegionContext>(defaultContextValue)

export const RegionProvider = ({ children }: { children: ReactNode }) => {
  const [region, setRegion] = useState<Region | null>(null)

  useEffect(() => {
    // 從 localStorage 讀取區域設定，如果沒有則設為預設值
    if (typeof window !== 'undefined') {
      const savedCountryCode = localStorage.getItem("region") || "TW"
      setRegion({
        countryCode: savedCountryCode,
        name: savedCountryCode === "TW" ? "台灣" : "其他"
      })
    }
  }, [])

  const handleSetRegion: Dispatch<SetStateAction<Region | null>> = (newRegion) => {
    setRegion(newRegion)
    if (typeof window !== 'undefined' && newRegion) {
      // 當 newRegion 是函數時，我們需要先計算新值
      const actualRegion = typeof newRegion === 'function' 
        ? newRegion(region) 
        : newRegion
      
      if (actualRegion) {
        localStorage.setItem("region", actualRegion.countryCode)
      }
    }
  }

  return (
    <RegionContext.Provider value={{ region, setRegion: handleSetRegion }}>
      {children}
    </RegionContext.Provider>
  )
}

export const useRegion = () => {
  const context = useContext(RegionContext)
  if (context === undefined) {
    throw new Error("useRegion must be used within a RegionProvider")
  }
  return context
}
