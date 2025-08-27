import client from "@lib/sanity"

export type ServiceCardType = {
  title: string
  englishTitle: string
  stylists: {
    levelName: string
    price: number
    stylistName?: string
    cardImage?: {
      url: string
      alt?: string
    }
  }[]
}

export type ServiceCardsType = {
  isActive: boolean
  heading?: string
  subheading?: string
  cardsPerRow: number
  cards: ServiceCardType[]
}

export async function getServiceCards(): Promise<ServiceCardsType | null> {
  if (!client) throw new Error('Sanity client is not configured')

  const query = `*[_type == "homePage"][0] {
    mainSections[] {
      _type == "serviceCardSection" => {
        isActive,
        heading,
        subheading,
        cardsPerRow,
        cards[] {
          title,
          englishTitle,
          stylists[] {
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
    }
  }`

  const result = await client.fetch(query)
  
  if (!result?.mainSections) return null

  const serviceCardsSection = result.mainSections.find(
    (section: any) => section?._type === 'serviceCardSection'
  )

  return serviceCardsSection || null
}
