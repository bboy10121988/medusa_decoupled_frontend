"use client"

import Hero from "../hero"
import type { MainBanner, BannerSlide } from "@lib/types/page-sections"

type HeroSectionProps = {
  banner: MainBanner
}

const HeroSection = ({ banner }: HeroSectionProps) => {
  if (!banner.slides || banner.slides.length === 0) {
    return null
  }
  
  // 輸出 Banner 的詳細信息以便調試
  console.log("🔍 HeroSection received banner:", {
    slidesCount: banner.slides.length,
    firstSlideImageLink: banner.slides[0]?.imageLink,
    settings: banner.settings
  })
  
  // 讓所有圖片使用原始尺寸，不限高也不限寬
  const mobileHeightClass = "min-h-fit" // 始終使用自適應內容高度
  
  const processedSlides = banner.slides.map((slide: BannerSlide, index: number) => {
    // 輸出 imageLink 是否存在及其值
    console.log(`🔍 處理 slide ${index} 的 imageLink:`, {
      hasImageLink: !!slide.imageLink,
      imageLink: slide.imageLink || "undefined"
    });
    
    return {
      heading: slide.heading,
      subheading: (slide as any).subheading,
      desktopImage: slide.desktopImage,
      desktopImageAlt: slide.desktopImageAlt,
      mobileImage: slide.mobileImage,
      mobileImageAlt: slide.mobileImageAlt,
      imageLink: slide.imageLink || "",
      buttonText: (slide as any).buttonText || "",
      buttonLink: (slide as any).buttonLink || ""
    }
  });
  
  return (
    <section className={`w-full ${mobileHeightClass} md:min-h-0`}>
      <div className={`w-full mb-4 last:mb-0 h-auto ${mobileHeightClass} md:min-h-0`}>
        <Hero
          slides={banner.slides.map((slide: BannerSlide) => ({
            heading: slide.heading,
            subheading: (slide as any).subheading,
            desktopImage: slide.desktopImage,
            desktopImageAlt: slide.desktopImageAlt,
            mobileImage: slide.mobileImage,
            mobileImageAlt: slide.mobileImageAlt,
            imageLink: slide.imageLink || "",
            buttonText: (slide as any).buttonText || "",
            buttonLink: (slide as any).buttonLink || ""
          }))}
          settings={banner.settings}
        />
      </div>
    </section>
  )
}

export default HeroSection
