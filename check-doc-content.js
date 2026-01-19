const { createClient } = require('next-sanity')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
})

async function checkContent() {
    const baseId = 'mETyawm5busawrS3UHXpaD' // Return Policy ID
    console.log(`Checking content for base ID: ${baseId}`)

    // Fetch Source, EN, JP
    const query = `*[_id in [$baseId, $enId, $jpId]]`
    const params = {
        baseId: baseId,
        enId: `${baseId}__i18n_en_us`,
        jpId: `${baseId}__i18n_ja_jp`
        // Note: checking variations of ID just in case
    }

    const results = await client.fetch(query, params)

    if (results.length === 0) {
        console.log("No documents found!")
        return
    }

    results.forEach(doc => {
        console.log(`\n-----------------------------------`)
        console.log(`Document: ${doc.title} (${doc.language})`)
        console.log(`ID: ${doc._id}`)
        console.log(`Keys present: ${Object.keys(doc).join(', ')}`)

        // Check body or content fields
        if (doc.body) {
            console.log(`Body field type: ${Array.isArray(doc.body) ? `Array (${doc.body.length} blocks)` : typeof doc.body}`)
            if (Array.isArray(doc.body) && doc.body.length > 0) {
                console.log(`First block sample:`, JSON.stringify(doc.body[0], null, 2))
            }
        } else if (doc.pageContent) {
            console.log(`pageContent field found! Type: ${Array.isArray(doc.pageContent) ? `Array (${doc.pageContent.length} blocks)` : typeof doc.pageContent}`)
            if (Array.isArray(doc.pageContent) && doc.pageContent.length > 0) {
                console.log(`First block sample:`, JSON.stringify(doc.pageContent[0], null, 2))
            }
        } else if (doc.content) {
            console.log(`Content field found (fallback?)`)
        } else {
            console.log(`❌ No 'body' or 'content' field found!`)
        }
    })
}

checkContent()
