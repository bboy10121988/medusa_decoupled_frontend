const { createClient } = require('next-sanity')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
})

async function checkLinks() {
    console.log('Checking translation metadata for dynamicPage...')

    // Fetch all metadata documents associated with dynamicPage
    // We explicitly look for _type="translation.metadata" (used by plugin)
    const query = `*[_type == "translation.metadata"] {
    _id,
    translations[] {
      _key,
      value->{
        _id,
        _type,
        title,
        language,
        "slug": slug.current
      }
    }
  }`

    try {
        const results = await client.fetch(query)

        // Filter for dynamicPage related metadata (sometimes schemaType field exists, sometimes inferred from docs)
        const pageLinks = results.filter(meta => {
            return meta.translations.some(t => t.value && t.value._type === 'dynamicPage')
        })

        console.log(`Found ${pageLinks.length} linked groups for dynamicPage:`)

        pageLinks.forEach((group, index) => {
            console.log(`\nGroup ${index + 1}:`)
            group.translations.forEach(t => {
                if (t.value) {
                    console.log(`  - [${t._key}] ${t.value.title} (Slug: ${t.value.slug}) (ID: ${t.value._id})`)
                } else {
                    console.log(`  - [${t._key}] (Missing Document Reference)`)
                }
            })
        })

    } catch (err) {
        console.error('Error fetching links:', err)
    }
}

checkLinks()
