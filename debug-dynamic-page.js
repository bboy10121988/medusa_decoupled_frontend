const { createClient } = require('next-sanity')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-01-01',
    useCdn: false,
    // token: process.env.SANITY_API_TOKEN 
})

async function debugDynamicPages() {
    try {
        console.log('Fetching all dynamicPage documents (Public Access)...')
        const query = `*[_type == "dynamicPage"] {
      _id,
      title,
      "slug": slug.current,
      language,
      _updatedAt,
      medusaId,
      pageContent
    }`
        const docs = await client.fetch(query)
        console.log('Found documents:', docs.length)
        console.log(JSON.stringify(docs, null, 2))
    } catch (err) {
        console.error('Error:', err.message)
        if (err.statusCode === 401) {
            console.log('Public access failed. Dataset is likely private.')
        }
    }
}

debugDynamicPages()
