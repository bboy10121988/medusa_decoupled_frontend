"use client"

import React from 'react'
import { defineReactWebComponent } from './base'
import HeroSection from '@/modules/home/components/hero-section'
import type { BannerSlide, BannerSettings } from '@/lib/types/page-sections'

type Props = {
  // 可直接傳入完整 slides/settings
  slides?: BannerSlide[]
  settings?: BannerSettings
  // 也允許以個別屬性快速帶入第一張幻燈片的重要欄位
  title?: string
  subheading?: string
  backgroundImage?: string
  backgroundImageAlt?: string
  buttonText?: string
  buttonLink?: string
}

const styles = `:host{display:block}`

const WCInner: React.FC<Props> = (props) => {
  const slides: BannerSlide[] = Array.isArray(props.slides) && props.slides.length
    ? props.slides
    : [{
        heading: props.title || '',
        subheading: props.subheading || '',
        backgroundImage: props.backgroundImage || '',
        backgroundImageAlt: props.backgroundImageAlt || '',
        buttonText: props.buttonText || '',
        buttonLink: props.buttonLink || '',
      }]

  const settings: BannerSettings = {
    autoplay: props.settings?.autoplay ?? true,
    autoplaySpeed: props.settings?.autoplaySpeed ?? 5,
    showArrows: props.settings?.showArrows ?? true,
    showDots: props.settings?.showDots ?? true,
  }

  return (
    <div>
      <HeroSection banner={{ _type: 'mainBanner', isActive: true, slides, settings }} />
    </div>
  )
}

defineReactWebComponent<Props>('home-hero-section', WCInner, { styles })

export {}

