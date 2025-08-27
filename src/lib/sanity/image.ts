import imageUrlBuilder from '@sanity/image-url'
import { SanityImage } from '@lib/types/sanity'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlForImage(source: SanityImage | null) {
  if (!source?.asset?._ref) {
    return null
  }

  return builder.image(source).auto('format').fit('max').url()
}
