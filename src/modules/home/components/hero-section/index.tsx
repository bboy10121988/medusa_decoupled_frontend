"use client"

import Hero from "../hero"
import type { MainBanner, BannerSlide } from "@lib/types/page-sections"

type HeroSectionProps = {
  banner: MainBanner
}

const HeroSection = ({ banner }: HeroSectionProps) => {
  if (banner.slides?.length === 0) {
    return null
  }
  
  // 根據是否顯示指示點決定手機版高度行為
  const shouldUseFixedHeight = banner.settings?.showDots && banner.slides.length > 1
  const mobileHeightClass = shouldUseFixedHeight 
    ? "min-h-hero-mobile" // 固定高度（扣掉 header）
    : "min-h-fit" // 自適應內容高度
  
  const processedSlides = banner.slides.map((slide: BannerSlide, index: number) => {
    return {
      heading: slide.heading,
      subheading: (slide as any).subheading,
      desktopImage: slide.desktopImage,
      desktopImageAlt: slide.desktopImageAlt,
      mobileImage: slide.mobileImage,
      mobileImageAlt: slide.mobileImageAlt,
      buttonText: slide.buttonText || "",
      buttonLink: slide.buttonLink || ""
    }
  });
  
  return (
    <section className={`w-full overflow-hidden ${mobileHeightClass} md:min-h-0`}>
      <div className={`w-full h-auto ${mobileHeightClass} md:min-h-0`}>
        <Hero
          slides={banner.slides.map((slide: BannerSlide) => ({
            heading: slide.heading,
            subheading: (slide as any).subheading,
            desktopImage: slide.desktopImage,
            desktopImageAlt: slide.desktopImageAlt,
            mobileImage: slide.mobileImage,
            mobileImageAlt: slide.mobileImageAlt,
            buttonText: slide.buttonText || "",
            buttonLink: slide.buttonLink || ""
          }))}
          settings={banner.settings}
        />
      </div>
    </section>
  )
}

export default HeroSection
