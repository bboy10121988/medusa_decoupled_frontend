const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET) {
  try {
    const envPath = path.resolve(__dirname, '..', '.env.local')
    const raw = fs.readFileSync(envPath, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const idx = trimmed.indexOf('=')
      if (idx === -1) return
      const key = trimmed.slice(0, idx).trim()
      const value = trimmed.slice(idx + 1).trim()
      if (!(key in process.env)) {
        process.env[key] = value
      }
    })
  } catch (error) {
    // ignore if file not present
  }
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN || process.env.SANITY_API_TOKEN,
})

const slug = process.argv[2]

if (!slug) {
  console.error('Usage: node scripts/query-grapes-page.js <slug>')
  process.exit(1)
}

client
  .fetch('*[_type=="grapesJSPageV2" && slug.current==$slug][0]', { slug })
  .then((doc) => {
    if (!doc) {
      console.log('No document found for slug', slug)
      process.exit(0)
    }
    console.log(JSON.stringify(doc, null, 2))
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
