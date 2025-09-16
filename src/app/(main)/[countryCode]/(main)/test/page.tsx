import HeroSection from "@modules/home/components/hero-section"
import ImageTextBlock from "@modules/home/components/image-text-block"
import type { MainBanner } from '@lib/types/page-sections'
import type { ImageTextBlock as ImageTextBlockType } from '@lib/types/page-sections'
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Test Page - Hero & Image Block',
  description: 'Testing hero section and image text block components'
}

export default function TestPage() {
  // Mock data based on the logs from the problem statement
  const mockMainBanner: MainBanner = {
    _type: "mainBanner",
    isActive: true,
    settings: {
      autoplay: true,
      autoplaySpeed: 3,
      showArrows: true,
      showDots: true
    },
    slides: [
      {
        backgroundImage: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=2000&h=1080&fit=crop",
        backgroundImageAlt: "Test hero image 1",
        buttonLink: null,
        buttonText: null,
        heading: "Welcome to our salon"
      },
      {
        backgroundImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=2000&h=1080&fit=crop",
        backgroundImageAlt: "Test hero image 2",
        buttonLink: null,
        buttonText: null,
        heading: "Professional styling"
      }
    ]
  }

  const mockImageTextBlock: ImageTextBlockType = {
    _type: "imageTextBlock",
    content: null,
    heading: null,
    hideTitle: false,
    image: {
      alt: "Main image",
      url: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=1920&h=960&fit=crop"
    },
    isActive: true,
    layout: "imageLeftImageRight",
    leftContent: null,
    leftImage: {
      alt: "Left side image",
      url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1000&h=1080&fit=crop"
    },
    rightContent: null,
    rightImage: {
      alt: "Right side image", 
      url: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=997&h=1080&fit=crop"
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-center py-8 bg-gray-100">Test Page - Hero & Image Block Components</h1>
      
      {/* Hero Section Test */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-center py-4">Hero Section (Full Width, Dynamic Height)</h2>
        <HeroSection banner={mockMainBanner} />
      </section>

      {/* Image Text Block Test */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-center py-4">Image Text Block (imageLeftImageRight Layout)</h2>
        <ImageTextBlock
          heading={mockImageTextBlock.heading}
          content={mockImageTextBlock.content}
          image={mockImageTextBlock.image}
          layout={mockImageTextBlock.layout}
          leftImage={mockImageTextBlock.leftImage}
          rightImage={mockImageTextBlock.rightImage}
          leftContent={mockImageTextBlock.leftContent}
          rightContent={mockImageTextBlock.rightContent}
          hideTitle={mockImageTextBlock.hideTitle}
        />
      </section>

      <div className="text-center py-8 text-sm text-gray-600">
        This is a test page to verify the Hero Section and Image Text Block components work correctly.
      </div>
    </div>
  )
}