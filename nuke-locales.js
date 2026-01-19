const { createClient } = require('next-sanity')
require('dotenv').config({ path: '.env.local' })

async function nukeLocales() {
    const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        apiVersion: "2024-01-01",
        token: process.env.SANITY_API_TOKEN,
        useCdn: false
    })

    console.log(`☢️ Nuke Operation Initiated for EN and JP Dynamic Pages...`)

    // 1. Clean Metadata References first
    console.log(`\nPhase 1: Cleaning Translation Metadata...`)
    const metadataQuery = `*[_type == "translation.metadata"]`
    const metadataDocs = await client.fetch(metadataQuery)

    for (const doc of metadataDocs) {
        let patches = []
        // Check for en, en-US, ja-JP keys
        const keysToRemove = ['en', 'en-US', 'ja-JP']
        const presentKeys = doc.translations.filter(t => keysToRemove.includes(t._key)).map(t => t._key)

        if (presentKeys.length > 0) {
            console.log(`Found keys to remove in ${doc._id}: ${presentKeys.join(', ')}`)
            // Unset each key. 
            // Note: Parallel unset requests might conflict if not batched, but here we can just do one patch per doc.
            // Using array filter path for safety
            const unsetPaths = presentKeys.map(key => `translations[_key=="${key}"]`)

            try {
                await client.patch(doc._id).unset(unsetPaths).commit()
                console.log(`✅ Cleaned metadata ${doc._id}`)
            } catch (e) {
                console.error(`❌ Failed to clean metadata ${doc._id}: ${e.message}`)
            }
        }
    }

    // 2. Delete Documents
    console.log(`\nPhase 2: Deleting Documents...`)
    const query = `*[_type == "dynamicPage" && language in ["en", "en-US", "ja-JP"]]{_id, title, language, slug}`
    const docs = await client.fetch(query)

    if (docs.length === 0) {
        console.log("No documents found to delete.")
    } else {
        console.log(`Found ${docs.length} documents. Terminating...`)
        for (const doc of docs) {
            console.log(`Deleting: [${doc.language}] ${doc.title} (${doc._id})`)
            try {
                await client.delete(doc._id)
                await client.delete(`drafts.${doc._id}`).catch(() => { })
                console.log(`✅ Deleted`)
            } catch (e) {
                console.error(`❌ Failed to delete ${doc._id}: ${e.message}`)
            }
        }
    }

    console.log(`\n☢️ Nuke Operation Complete.`)
}

nukeLocales()
