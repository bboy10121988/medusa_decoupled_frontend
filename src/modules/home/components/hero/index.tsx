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

  useEffect(() => {
    if (!slides || slides.length <= 1 || !settings?.autoplay) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, (settings?.autoplaySpeed || 3) * 1000) // 將秒轉換為毫秒

    return () => clearInterval(interval)
  }, [slides?.length, settings?.autoplay, settings?.autoplaySpeed])

  if (!slides?.length) return null

  const slide = slides[currentSlide]
  
  // 根據是否顯示指示點決定手機版高度行為
  const shouldUseFixedHeight = settings?.showDots && slides.length > 1
  const mobileHeightClass = shouldUseFixedHeight 
    ? "min-h-hero-mobile" // 固定高度（扣掉 header）
    : "min-h-fit" // 自適應內容高度

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // 手勢滑動處理 - 改進版本
  const handleTouchStart = (e: React.TouchEvent) => {
    if (slides.length <= 1) return
    touchStartXRef.current = e.touches[0].clientX
    touchStartTimeRef.current = Date.now()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // 只阻止水平滾動，允許垂直滾動
    if (touchStartXRef.current !== null && slides.length > 1) {
      const currentX = e.touches[0].clientX
      const diffX = Math.abs(touchStartXRef.current - currentX)
      
      // 如果水平滑動距離大於垂直滑動距離，阻止默認行為
      if (diffX > 20) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || slides.length <= 1) return
    
    const touchEndX = e.changedTouches[0].clientX
    const diffX = touchStartXRef.current - touchEndX
    const diffTime = Date.now() - touchStartTimeRef.current
    const minSwipeDistance = 30 // 降低最小滑動距離
    const maxSwipeTime = 1000
    
    // 檢查是否為有效滑動
    if (Math.abs(diffX) > minSwipeDistance && diffTime < maxSwipeTime) {
      if (diffX > 0) {
        // 向左滑動 - 下一張
        goToNextSlide()
      } else {
        // 向右滑動 - 上一張
        goToPrevSlide()
      }
    }
    
    // 重置
    touchStartXRef.current = null
  }

  return (
    <div className={`relative w-full ${mobileHeightClass} md:min-h-0`}>
      {/* 輪播圖片容器 - 根據設定決定手機版高度行為 */}
      <div 
        className={`relative w-full overflow-hidden ${mobileHeightClass} md:min-h-0 select-none`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        {/* 左側滑動觸摸區域 */}
        <div 
          className="absolute left-0 top-0 w-1/3 h-full z-30 md:hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={(e) => {
            handleTouchEnd(e)
            // 如果是點擊而非滑動，觸發上一張
            if (touchStartXRef.current !== null) {
              const touchEndX = e.changedTouches[0].clientX
              const diffX = Math.abs(touchStartXRef.current - touchEndX)
              if (diffX < 10) {
                goToPrevSlide()
              }
            }
          }}
        />
        
        {/* 右側滑動觸摸區域 */}
        <div 
          className="absolute right-0 top-0 w-1/3 h-full z-30 md:hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={(e) => {
            handleTouchEnd(e)
            // 如果是點擊而非滑動，觸發下一張
            if (touchStartXRef.current !== null) {
              const touchEndX = e.changedTouches[0].clientX
              const diffX = Math.abs(touchStartXRef.current - touchEndX)
              if (diffX < 10) {
                goToNextSlide()
              }
            }
          }}
        />
        {slides.map((slideItem, index) => {
          return (
            <div
              key={`slide-${slideItem.heading}-${index}`}
              className={`transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              } ${index !== currentSlide ? 'absolute inset-0' : ''}`}
            >
              {/* 桌面版圖片容器 - 只在 md 以上顯示 */}
              <div className="hidden md:block w-full">
                {slideItem.desktopImage && slideItem.desktopImage.trim() !== '' ? (
                  <img
                    key={`desktop-${currentSlide}-${index}`}
                    src={slideItem.desktopImage}
                    alt={slideItem.desktopImageAlt || slideItem.heading || `桌面版輪播圖片 ${index + 1}`}
                    className="w-full h-auto object-cover"
                    loading="eager"
                    style={{ imageRendering: 'auto' }}
                    decoding="async"
                  />
                ) : (
                  <div className="w-full bg-gray-300 flex items-center justify-center h-64">
                    <span className="text-gray-500">桌面版圖片未設定</span>
                  </div>
                )}
              </div>
              
              {/* 手機版圖片容器 - 只在 md 以下顯示 */}
              <div className="block md:hidden w-full">
                {slideItem.mobileImage && slideItem.mobileImage.trim() !== '' ? (
                  <img
                    key={`mobile-${currentSlide}-${index}`}
                    src={slideItem.mobileImage}
                    alt={slideItem.mobileImageAlt || slideItem.heading || `手機版輪播圖片 ${index + 1}`}
                    className={`w-full ${shouldUseFixedHeight ? 'h-hero-mobile' : 'h-auto'} object-cover`}
                    loading="eager"
                    style={{ imageRendering: 'auto' }}
                    decoding="async"
                  />
                ) : (
                  <div className="w-full bg-gray-300 flex items-center justify-center h-32">
                    <span className="text-gray-500 text-sm">手機版圖片未設定</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* 內容覆蓋層 - 手機版滿屏垂直居中，桌面版底部對齊 */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center md:justify-end items-center text-center p-4 pb-16 md:pb-16 sm:p-16 md:p-16 lg:p-32 gap-3 sm:gap-6 bg-gradient-to-b from-black/10 via-black/30 to-black/60">
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

      {/* 左右箭頭 */}
      {settings?.showArrows && slides.length > 1 && (
        <>
          {/* 左箭頭 */}
          <button
            onClick={goToPrevSlide}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
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
          
          {/* 右箭頭 */}
          <button
            onClick={goToNextSlide}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
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
          {slides.map((slideItem, index) => (
            <button
              key={`dot-${slideItem.heading}-${index}`}
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
