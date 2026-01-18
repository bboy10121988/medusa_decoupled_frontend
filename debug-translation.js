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

async function debugTranslationMetadata() {
    try {
        console.log('Fetching translation metadata and duplicates...')

        // 1. Check for duplicates (same slug, same lang)
        const duplicatesQuery = `*[_type == "dynamicPage"] {
      _id,
      title,
      "slug": slug.current,
      language,
      _createdAt
    } | order(slug asc, language asc)`

        const docs = await client.fetch(duplicatesQuery)
        console.log('--- Dynamic Pages ---')
        docs.forEach(doc => {
            console.log(`[${doc.language}] ${doc.slug} (${doc._id}) - Created: ${doc._createdAt}`)
        })

        // 2. Check translation.metadata
        const metaQuery = `*[_type == "translation.metadata"]`
        const metas = await client.fetch(metaQuery)
        console.log('\n--- Translation Metadata ---')
        console.log(`Found ${metas.length} metadata docs.`)
        if (metas.length > 0) {
            console.log('Sample:', JSON.stringify(metas[0], null, 2))
        }

    } catch (err) {
        console.error('Error:', err.message)
    }
}

debugTranslationMetadata()
