export const serviceCardSectionFragment = `
  _type == "serviceCardSection" => {
    _type,
    isActive,
    heading,
    subheading,
    cardsPerRow,
    "cards": cards[]-> {
      title,
      englishTitle,
      description,
      mainPrice,
      priceLabel,
      "cardImage": cardImage {
        "url": coalesce(asset->url, ""),
        "alt": coalesce(alt, title),
        "caption": caption
      },
      "stylists": coalesce(stylists, [])
    }
  }
`
