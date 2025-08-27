import client from "@lib/sanity"

const returnPolicyQuery = `*[_type == "returnPolicy"][0]{
  title,
  _updatedAt,
  highlights,
  fullPolicy
}`

// 完整退換貨政策數據
export async function getReturnPolicy() {
  if (!client) throw new Error('Sanity client is not configured')
  return await client.fetch(returnPolicyQuery)
}

// 用於產品頁面的退換貨政策摘要
export async function getReturnPolicyHighlights() {
  if (!client) throw new Error('Sanity client is not configured')
  return await client.fetch(`*[_type == "returnPolicy"][0].highlights`)
}
