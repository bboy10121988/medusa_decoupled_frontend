export const serviceCardSectionFragment = `
  _type == "serviceCardSection" => {
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
      }
    }
  }
`
