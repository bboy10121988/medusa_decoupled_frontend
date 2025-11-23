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

  const paddingStyle = {
    ...(banner.paddingX ? {
      paddingLeft: `${banner.paddingX / 2}%`,
      paddingRight: `${banner.paddingX / 2}%`
    } : {}),
    ...(banner.paddingTop ? { 
      '--pt-desktop': `${banner.paddingTop}px`,
      '--pt-mobile': `${Math.round(banner.paddingTop * 0.6)}px`
    } : {}),
    ...(banner.paddingBottom ? { 
      '--pb-desktop': `${banner.paddingBottom}px`,
      '--pb-mobile': `${Math.round(banner.paddingBottom * 0.6)}px`
    } : {})
  } as React.CSSProperties
  
  const paddingClasses = [
    "hero-section",
    banner.paddingTop ? "pt-[var(--pt-mobile)] md:pt-[var(--pt-desktop)]" : "",
    banner.paddingBottom ? "pb-[var(--pb-mobile)] md:pb-[var(--pb-desktop)]" : ""
  ].filter(Boolean).join(" ")
  
  return (
    <section className={paddingClasses} style={paddingStyle}>
      <Hero
        slides={banner.slides.map((slide: BannerSlide) => ({
          heading: slide.heading,
          subheading: (slide as any).subheading,
          desktopImage: slide.desktopImage,
          desktopImageAlt: slide.desktopImageAlt || "",
          mobileImage: slide.mobileImage,
          mobileImageAlt: slide.mobileImageAlt || "",
          imageLink: slide.imageLink || "",
          buttonText: slide.buttonText || "",
          buttonLink: slide.buttonLink || ""
        }))}
        settings={banner.settings}
      />
    </section>
  )
}

export default HeroSection
