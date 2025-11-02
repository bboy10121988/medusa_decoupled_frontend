'use client'

import { useState, useEffect } from 'react'

export default function HelpButtonWrapper() {
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    // 監聽 mobile-actions 的顯示狀態
    const handleVisibilityChange = (event: CustomEvent) => {
      setIsHidden(event.detail.visible)
    }

    window.addEventListener('mobile-actions-visibility', handleVisibilityChange as EventListener)

    return () => {
      window.removeEventListener('mobile-actions-visibility', handleVisibilityChange as EventListener)
    }
  }, [])

  return (
    <a
      href="https://page.line.me/timsfantasyworld?fbclid=PARlRTSAMmHoRleHRuA2FlbQIxMAABp_nJitfDUH8W4pRlcRgKeusvIELFdTvXpbu791GiXgPIOarBh8LO2Hg2YJrV_aem_9pdT5ans7oJyF7F17iQPHw"
      target="_blank"
      rel="noopener noreferrer"
      className={`
        fixed bottom-6 right-6 
        bg-gray-900 hover:bg-gray-800 text-white 
        border border-white/20 rounded-full 
        px-6 py-3 shadow-lg 
        transition-all duration-300
        hover:-translate-y-0.5 
        z-[9999] 
        flex items-center gap-3
        ${isHidden ? 'opacity-0 invisible pointer-events-none translate-y-4' : 'opacity-100 visible'}
      `}
      aria-label="加入 LINE 好友"
    >
      <svg 
        className="w-5 h-5"
        viewBox="0 0 24 24" 
        fill="none"
        stroke="white"
        strokeWidth="2"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span className="text-white text-xs font-medium tracking-wide">幫助</span>
    </a>
  )
}
