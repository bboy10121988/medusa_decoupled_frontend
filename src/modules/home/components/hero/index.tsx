"use client"

import { Button, Heading } from "@medusajs/ui"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

type Slide = {
  heading: string
  subheading?: string
  desktopImage: string
  desktopImageAlt?: string
  mobileImage: string
  mobileImageAlt?: string
  buttonText: string
  buttonLink: string
}

type Settings = {
  autoplay: boolean
  autoplaySpeed: number
  showArrows: boolean
  showDots: boolean
}

type HeroProps = {
  slides: Slide[]
  settings: Settings
}

const Hero = ({ slides, settings }: HeroProps) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const touchStartXRef = useRef<number | null>(null)
  const touchStartTimeRef = useRef<number>(0)
  const isSwipingRef = useRef<boolean>(false)

  useEffect(() => {
    if (!slides || slides.length <= 1 || !settings?.autoplay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, (settings?.autoplaySpeed || 3) * 1000) // 將秒轉換為毫秒

    return () => clearInterval(interval)
  }, [slides?.length, settings?.autoplay, settings?.autoplaySpeed])

  if (!slides?.length) return null

  const slide = slides[currentSlide]
  
  // 響應式高度：手機版全高度，桌面版自適應

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // 觸摸手勢處理 - 增強版
  const handleTouchStart = (e: React.TouchEvent) => {
    // 防止多點觸控干擾
    if (e.touches.length !== 1) return
    
    touchStartXRef.current = e.touches[0].clientX
    touchStartTimeRef.current = Date.now()
    isSwipingRef.current = false
    
    // 阻止預設行為，避免頁面滾動干擾
    e.preventDefault()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || e.touches.length !== 1) return
    
    const touchCurrentX = e.touches[0].clientX
    const diffX = touchStartXRef.current - touchCurrentX
    
    // 降低滑動檢測閾值，提高敏感度
    if (Math.abs(diffX) > 5) {
      isSwipingRef.current = true
      // 阻止頁面滾動
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    
    // 確保有 changedTouches
    if (e.changedTouches?.length === 0) return
    
    const touchEndX = e.changedTouches[0].clientX
    const diffX = touchStartXRef.current - touchEndX
    const diffTime = Date.now() - touchStartTimeRef.current
    
    // 調整參數以提高手勢識別精度
    const minSwipeDistance = 30 // 降低最小滑動距離
    const maxSwipeTime = 800 // 增加最大滑動時間
    const minSwipeSpeed = minSwipeDistance / maxSwipeTime * 1000 // 最小滑動速度 (px/s)
    const actualSpeed = Math.abs(diffX) / diffTime * 1000
    
    // 只有在有輪播圖片且滑動有效時才切換
    if (slides.length > 1 && 
        Math.abs(diffX) > minSwipeDistance && 
        diffTime < maxSwipeTime &&
        actualSpeed > minSwipeSpeed) {
      
      if (diffX > 0) {
        // 向左滑動 - 下一張
        console.log('📱 手勢滑動: 下一張')
        goToNextSlide()
      } else {
        // 向右滑動 - 上一張
        console.log('📱 手勢滑動: 上一張')  
        goToPrevSlide()
      }
    }
    
    // 重置
    touchStartXRef.current = null
    isSwipingRef.current = false
  }

  return (
    <div 
      className="relative w-full hero-section-inner"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        touchAction: 'pan-y',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: slides.length > 1 ? 'grab' : 'default',
        margin: 0,
        padding: 0,
        border: 'none',
        outline: 'none',
        lineHeight: 0,
        fontSize: 0,
        display: 'block',
        // Chrome 特殊處理
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        WebkitTransform: 'translateZ(0)'
      }}
    >
        {slides.map((slideItem, index) => {
          return (
            <div
              key={index}
              className={`transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              } ${index !== currentSlide ? 'absolute inset-0' : ''}`}
            >
              {/* 響應式圖片顯示邏輯 - 強制分離桌面和手機版 */}
              
              {/* 桌面版圖片容器 - 只在 md 以上顯示 */}
              <div className="hidden md:block w-full">
                {slideItem.desktopImage && slideItem.desktopImage.trim() !== '' ? (
                  <img
                    key={`desktop-${index}-${slideItem.desktopImage.slice(-20)}`}
                    src={slideItem.desktopImage}
                    alt={slideItem.desktopImageAlt || slideItem.heading || `桌面版輪播圖片 ${index + 1}`}
                    className="w-full h-auto object-cover block"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    style={{
                      margin: 0,
                      padding: 0,
                      border: 'none',
                      outline: 'none',
                      display: 'block',
                      lineHeight: 0,
                      fontSize: 0,
                      verticalAlign: 'top',
                      // Chrome 特殊處理
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  />
                ) : (
                  <div className="w-full bg-gray-300 flex items-center justify-center h-64">
                    <span className="text-gray-500">桌面版圖片未設定</span>
                  </div>
                )}
              </div>
              
              {/* 手機版圖片容器 - 只在 md 以下顯示 */}
              <div 
                className="block md:hidden w-full" 
                style={{
                  margin: 0,
                  padding: 0,
                  border: 'none',
                  outline: 'none',
                  lineHeight: 0,
                  fontSize: 0,
                  display: 'block',
                  // 手機版容器強化
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  WebkitTransform: 'translateZ(0)',
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%'
                }}
              >
                {slideItem.mobileImage && slideItem.mobileImage.trim() !== '' ? (
                  <img
                    key={`mobile-${index}-${slideItem.mobileImage.slice(-20)}`}
                    src={slideItem.mobileImage}
                    alt={slideItem.mobileImageAlt || slideItem.heading || `手機版輪播圖片 ${index + 1}`}
                    className="w-full h-auto object-cover block"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    style={{
                      margin: 0,
                      padding: 0,
                      border: 'none',
                      outline: 'none',
                      display: 'block',
                      lineHeight: 0,
                      fontSize: 0,
                      // 手機版特殊處理 - 強化版
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      WebkitTransform: 'translateZ(0)',
                      WebkitFontSmoothing: 'antialiased',
                      position: 'relative',
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                      // 強制消除手機版白線
                      bottom: '-1px',
                      top: '-1px'
                    }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">手機版圖片未設定</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

      {/* 內容覆蓋層 - 手機版滿屏垂直居中，桌面版底部對齊 - 減少 padding 避免白線 */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center md:justify-end items-center text-center px-4 py-2 pb-8 md:pb-12 sm:px-8 md:px-12 lg:px-16 gap-3 sm:gap-6 bg-gradient-to-b from-black/10 via-black/30 to-black/60">
        <div 
          key={`slide-${currentSlide}`}
          className="animate-fade-in-content max-w-[90%] sm:max-w-4xl"
        >
          <Heading
            level="h1"
            className="text-heading-1 text-white font-heading text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-2 sm:mb-6"
            style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              letterSpacing: "var(--letter-spacing-tight)"
            }}
          >
            {slide.heading}
          </Heading>
          {slide.subheading && (
            <p
              className="text-white/95 text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-6 max-w-3xl mx-auto"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
            >
              {slide.subheading}
            </p>
          )}
          {slide.buttonText && slide.buttonLink && (
            <Button asChild variant="secondary" 
              className="btn bg-white hover:bg-white/90 text-gray-900 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base md:text-lg font-medium rounded-lg 
                shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              style={{
                letterSpacing: "var(--letter-spacing-wide)",
                fontFamily: "var(--font-base)"
              }}
            >
              <Link href={slide.buttonLink}>{slide.buttonText}</Link>
            </Button>
          )}
        </div>
      </div>

      {/* 箭頭導航 - 只在有多張圖片且啟用箭頭時顯示 */}
      {settings?.showArrows && slides.length > 1 && (
        <>
          {/* 上一張按鈕 */}
          <button
            onClick={goToPrevSlide}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="上一張圖片"
          >
            <svg 
              className="w-4 h-4 sm:w-6 sm:h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 下一張按鈕 */}
          <button
            onClick={goToNextSlide}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="下一張圖片"
          >
            <svg 
              className="w-4 h-4 sm:w-6 sm:h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* 點點導航 - 適應動態高度 */}
      {settings?.showDots && slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 sm:gap-3">
          {slides.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "bg-white scale-110 shadow-lg" 
                  : "bg-white/60 hover:bg-white/80 scale-100"
              }`}
              aria-label={`前往第 ${index + 1} 張圖片`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Hero
