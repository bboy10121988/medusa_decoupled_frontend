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
  
  return (
    <section className="hero-section">
      <Hero
        slides={banner.slides.map((slide: BannerSlide) => ({
          heading: slide.heading,
          subheading: (slide as any).subheading,
          desktopImage: slide.desktopImage,
          desktopImageAlt: slide.desktopImageAlt || "",
          mobileImage: slide.mobileImage,
          mobileImageAlt: slide.mobileImageAlt || "",
          buttonText: slide.buttonText || "",
          buttonLink: slide.buttonLink || ""
        }))}
        settings={banner.settings}
      />
    </section>
  )
}

export default HeroSection
