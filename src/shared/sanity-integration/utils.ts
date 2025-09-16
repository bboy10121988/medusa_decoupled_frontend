import { createClient } from '@sanity/client'

// 使用專案中已有的 Sanity 設定
const client = createClient({
  projectId: "m7o2mv1n",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
})

export const getClient = () => client
