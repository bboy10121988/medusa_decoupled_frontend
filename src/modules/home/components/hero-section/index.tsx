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
  
  return (
    <section className="w-full">
      <div className="mb-4 last:mb-0">
        <Hero
          slides={banner.slides.map((slide: BannerSlide) => ({
            heading: slide.heading,
            backgroundImage: slide.backgroundImage,
            backgroundImageAlt: slide.backgroundImageAlt,
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
