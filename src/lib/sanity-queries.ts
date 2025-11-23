export const HOMEPAGE_OLD_QUERY = `*[_type == "homePage"][0] {
    title,
    mainSections
  }`

export const FEATURED_PRODUCTS_QUERY = `*[_type == "featuredProducts" && isActive == true]{
    title,
    handle,
    collection_id,
    description,
    isActive
  }`

export const FEATURED_PRODUCTS_HEADING_QUERY = `*[_type == "homePage"][0]{
    "featuredSection": mainSections[_type == "featuredProducts" && collection_id == $collectionId][0]{
      heading,
      showHeading
    }
  }.featuredSection`

export const HEADER_QUERY = `*[_type == "header"][0]{
    logo{
      "url": asset->url,
      alt
    },
    favicon{
      "url": asset->url,
      alt
    },
    storeName,
    logoHeight,
    logoSize{
      desktop,
      mobile
    },
    navigation[]{
      name,
      href
    },
    marquee {
      enabled,
      text1 {
        enabled,
        content
      },
    text2 {
      enabled,
      content
    },
    text3 {
      enabled,
      content
    },
    linkUrl,
    pauseOnHover
  }
}`

const PAGE_SECTIONS_PROJECTION = `
        _type,
        ...select(
          _type == "mainBanner" => {
            isActive,
            paddingX,
            "slides": slides[] {
              heading,
              subheading,
              "desktopImage": desktopImage.asset->url,
              "desktopImageAlt": desktopImage.alt,
              "mobileImage": mobileImage.asset->url,
              "mobileImageAlt": mobileImage.alt,
              buttonText,
              buttonLink,
              imageLink
            },
            "settings": settings {
              autoplay,
              autoplaySpeed,
              showArrows,
              showDots
            }
          },
          _type == "imageTextBlock" => {
            isActive,
            paddingX,
            heading,
            hideTitle,
            content,
            "image": image {
              "url": asset->url,
              "alt": alt,
              "linkUrl": linkUrl
            },
            layout,
            "leftImage": leftImage {
              "url": asset->url,
              "alt": alt,
              "linkUrl": linkUrl
            },
            "rightImage": rightImage {
              "url": asset->url,
              "alt": alt,
              "linkUrl": linkUrl
            },
            leftContent,
            rightContent
          },
          _type == "featuredProducts" => {
            isActive,
            paddingX,
            heading,
            showHeading,
            showSubheading,
            collection_id
          },
          _type == "blogSection" => {
            isActive,
            title,
            "category": category->title,
            limit,
            postsPerRow
          },
          _type == "youtubeSection" => {
            isActive,
            paddingX,
            videoUrl,
            heading,
            description,
            fullWidth,
            videoMode,
            "youtubeSettings": youtubeSettings {
              desktopVideoUrl,
              mobileVideoUrl,
              useSameVideo,
              autoplay,
              loop,
              muted,
              showControls
            },
            "uploadSettings": uploadSettings {
              "desktopVideo": desktopVideo {
                "asset": asset-> {
                  _id,
                  url,
                  originalFilename,
                  mimeType
                }
              },
              "mobileVideo": mobileVideo {
                "asset": asset-> {
                  _id,
                  url,
                  originalFilename,
                  mimeType
                }
              },
              useSameVideo,
              autoplay,
              loop,
              muted,
              showControls
            },
            "videoSettings": videoSettings {
              desktopVideoUrl,
              mobileVideoUrl,
              useSameVideo
            }
          },
          _type == "contentSection" => {
            isActive,
            title,
            "content": content[]{
              ...,
              markDefs[]{
                ...,
                _type == "internalLink" => {
                  "slug": @.reference->slug.current
                }
              },
              _type == "image" => {
                "url": asset->url,
                "altText": alt
              }
            }
          },
          _type == "serviceCardSection" => {
            isActive,
            heading,
            cardsPerRow,
            "cards": cards[] {
              title,
              englishTitle,
              "stylists": stylists[] {
                levelName,
                price,
                priceType,
                stylistName,
                isDefault,
                "cardImage": cardImage {
                  "url": asset->url,
                  "alt": alt
                }
              },
              link
            }
          },
          _type == "contactSection" => {
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
          },
          _type == "googleMapsSection" => {
            isActive,
            heading,
            description,
            googleMapsUrl,
            mapHeight,
            showDirections,
            businessName,
            telephone,
            streetAddress,
            addressLocality,
            addressRegion,
            postalCode,
            latitude,
            longitude,
            priceRange,
            "openingHours": openingHours[] {
              days,
              opens,
              closes
            }
          },
          _type == "textBlock" => {
            title,
            content[] {
              ...,
              _type == "image" => {
                "url": asset->url,
                "altText": alt
              }
            }
          },
          _type == "imageBlock" => {
            title,
            "image": image {
              "url": asset->url,
              "alt": alt
            },
            alt,
            caption,
            layout
          },
          _type == "videoBlock" => {
            title,
            videoUrl,
            "thumbnail": thumbnail {
              "url": asset->url
            },
            description
          },
          _type == "ctaBlock" => {
            title,
            buttonText,
            buttonUrl,
            buttonStyle,
            alignment
          },
          // Default case
          {
            _type,
            "isUnknownType": true
          }
        )
`

export const PAGE_BY_SLUG_QUERY = `*[_type == "dynamicPage" && slug.current == $slug && status == "published"][0]{
      _type,
      title,
      "slug": slug.current,
      seo {
        metaTitle,
        metaDescription,
        canonicalUrl
      },
      "mainSections": pageContent[] {
        ${PAGE_SECTIONS_PROJECTION}
      }
    }`

export const ALL_PAGES_QUERY = `*[_type == "dynamicPage" && status == "published"] | order(_createdAt desc) {
      _type,
      title,
      "slug": slug.current,
      status,
      seo {
        metaTitle,
        metaDescription,
        canonicalUrl
      },
      "mainSections": pageContent[] {
        ${PAGE_SECTIONS_PROJECTION}
      }
    }`

export const HOMEPAGE_QUERY = `*[_type == "homePage"][0] {
    title,
    seoTitle,
    seoDescription,
    seoKeywords,
    canonicalUrl,
    noIndex,
    noFollow,
    ogTitle,
    ogDescription,
    "ogImage": ogImage {
      "asset": asset->{url},
      alt
    },
    twitterCard,
    "mainSections": mainSections[] {
      ${PAGE_SECTIONS_PROJECTION}
    }
  }`

export const ALL_POSTS_BASE_QUERY = `*[_type == "post"`

export const ALL_POSTS_PROJECTION = `{
      _id,
      _type,
      title,
      slug,
      mainImage {
        asset->{
          url
        }
      },
      publishedAt,
      excerpt,
      categories[]->{
        _id,
        title
      },
      author->{
        name,
        image
      },
      status,
      body
    }`

export const CATEGORIES_QUERY = `*[_type == "category"] {
      _id,
      _type,
      title
    }`

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0]{
      _id,
      title,
      slug {
        current
      },
      publishedAt,
      body,
      "author": author->{name, bio, "image": image.asset->url},
      mainImage {
        asset-> {
          url
        }
      },
      "categories": categories[]->{title}
    }`

export const POST_BY_TITLE_OR_ID_QUERY = `*[_type == "post" && title match "*" + $title + "*" || _id match $slug + "*"][0]{
      _id,
      title,
      slug {
        current
      },
      publishedAt,
      body,
      "author": author->{name, bio, "image": image.asset->url},
      mainImage {
        asset-> {
          url
        }
      },
      "categories": categories[]->{title}
    }`

export const SERVICE_SECTION_QUERY = `*[_type == "homePage"][0].mainSections[_type == "serviceCardSection" && isActive == true][0] {
      _type,
      isActive,
      heading,
      cardsPerRow,
      "cards": cards[] {
        title,
        englishTitle,
        "stylists": stylists[] {
          levelName,
          price,
          priceType,
          stylistName,
          isDefault,
          "cardImage": cardImage {
            "url": asset->url,
            "alt": alt
          }
        }
      }
    }`

export const FOOTER_QUERY = `*[_type == "footer" && !(_id in path('drafts.**'))] | order(_updatedAt desc)[0] {
    title,
    logo {
      "url": asset->url,
      alt
    },
    logoWidth,
    sections[] {
      title,
      links[] {
        text,
        linkType,
        internalLink,
        externalUrl,
        "url": coalesce(
          select(
            linkType == "internal" => internalLink,
            linkType == "external" => externalUrl,
            url
          ),
          url,
          href
        )
      }
    },
    socialMedia {
      facebook {
        enabled,
        url
      },
      instagram {
        enabled,
        url
      },
      line {
        enabled,
        url
      },
      youtube {
        enabled,
        url
      },
      twitter {
        enabled,
        url
      }
    },
    copyright
  }`

export const ALL_FOOTERS_QUERY = `*[_type == "footer" && !(_id in path('drafts.**'))] | order(_updatedAt desc) {
    title,
    _id,
    _updatedAt,
    _createdAt
  }`
