import { ClientConfig, createClient } from '@sanity/client'

const sanityConfig: ClientConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-30',
  useCdn: true,
  perspective: 'published' as const
}

if (!sanityConfig.projectId) {
  throw new Error('未設定 Sanity Project ID')
}

export const client = createClient(sanityConfig)