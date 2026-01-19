const { createClient } = require('next-sanity')
require('dotenv').config({ path: '.env.local' })

async function checkDocContent() {
    const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        apiVersion: "2024-01-01",
        useCdn: false,
        token: process.env.SANITY_API_TOKEN
    })

    console.log(`Checking 'en' Dynamic Pages...`)

    // Fetch ALL 'en' dynamic pages, including drafts
    const query = `*[_type == "dynamicPage" && language == "en"]{
        _id, 
        title, 
        slug, 
        "hasPageContent": defined(pageContent), 
        "pageContentLen": count(pageContent),
        _updatedAt
    }`
    const docs = await client.fetch(query)

    if (docs.length === 0) {
        console.log("No 'en' documents found.")
    } else {
        console.log(`Found ${docs.length} 'en' documents:`)
        docs.forEach(doc => {
            console.log(`\n-----------------------------------`)
            console.log(`ID: ${doc._id}`)
            console.log(`Title: ${doc.title}`)
            console.log(`Slug: ${doc.slug?.current || '❌ MISSING'}`)
            console.log(`Content: ${doc.hasPageContent ? `${doc.pageContentLen} blocks` : '❌ MISSING'}`)
            console.log(`Updated: ${doc._updatedAt}`)
        })
    }

    // Check metadata
    const refId = "f37f64ae-fa67-4a6f-afd1-3eb1ffecab78" // Return Policy Metadata
    const meta = await client.fetch(`*[_id == $id][0]`, { id: refId })

    // Fix broken 'en' reference
    if (meta) {
        // Check if 'en' reference points to a missing doc
        const enRef = meta.translations.find(t => t._key === 'en')
        if (enRef) {
            const enId = enRef.value?._ref
            // Check if this ID exists
            const exists = await client.fetch(`count(*[_id == $id])`, { id: enId })
            if (exists === 0) {
                console.log(`\n❌ Found BROKEN 'en' reference to ${enId}. Removing...`)
                await client.patch(refId).unset(['translations[_key=="en"]']).commit()
                console.log(`✅ Removed broken reference. You can now re-translate.`)
            } else {
                console.log(`\n✅ 'en' reference points to existing doc (${enId}).`)
            }
        }
    }
}

checkDocContent()
