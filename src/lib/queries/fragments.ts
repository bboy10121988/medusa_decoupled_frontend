export const mainBannerFragment = `
  _type == "mainBanner" => {
    _type,
    isActive,
    "slides": slides[] {
      heading,
      subheading,
      "backgroundImage": backgroundImage.asset->url,
      buttonText,
      buttonLink
    },
    "settings": settings {
      autoplay,
      autoplaySpeed,
      showArrows,
      showDots
    }
  }
`

export const serviceCardFragment = `
  _type == "serviceCardSection" => {
    _type,
    isActive,
    heading,
    subheading,
    cardsPerRow,
    "cards": cards[] {
      title,
      englishTitle,
      "stylists": stylists[] {
        levelName,
        price,
        stylistName,
        "cardImage": cardImage {
          "url": asset->url,
          "alt": alt
        }
      },
      link
    }
  }
`

export const blogSectionFragment = `
  _type == "blogSection" => {
    _type,
    isActive,
    heading,
    showLatestPosts,
    postsCount
  }
`

export const contentSectionFragment = `
  _type == "contentSection" => {
    _type,
    isActive,
    title,
    content[] {
      ...,
      _type == "image" => {
        "url": asset->url,
        "altText": alt
      }
    }
  }
`

export const contactSectionFragment = `
  _type == "contactSection" => {
    _type,
    isActive,
    title,
    address,
    phone,
    email,
    businessHours[]{
      days,
      hours
    },
    socialLinks[]{
      platform,
      url
    },
    googleMapsUrl
  }
`
