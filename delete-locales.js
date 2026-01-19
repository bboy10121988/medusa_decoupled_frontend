const { createClient } = require('next-sanity')
require('dotenv').config({ path: '.env.local' })

async function deleteEnUS() {
    const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        apiVersion: "2024-01-01",
        token: process.env.SANITY_API_TOKEN,
        useCdn: false
    })

    console.log(`Searching for 'en-US' dynamicPage documents to delete...`)

    const refId = "f37f64ae-fa67-4a6f-afd1-3eb1ffecab78"
    const refDoc = await client.fetch(`*[_id == $id][0]`, { id: refId })
    console.log(`\nReferencing Document (${refId}):`)
    console.log(`Type: ${refDoc?._type}`)
    console.log(`Translations:`, refDoc?.translations)

    if (refDoc?._type === 'translation.metadata') {
        // Remove en-US reference using array filter
        console.log("Removing en-US from translation metadata array...")
        // Sanity API unset for arrays usually requires index or path.
        // But better: use insert/replace or read-modify-write?
        // Actually 'unset' works with path like 'translations[_key=="en-US"]'

        await client.patch(refId).unset(['translations[_key=="en-US"]']).commit()
        console.log("Updated metadata. Retrying deletion...")

        // Retry deletion
        const enUSId = "mETyawm5busawrS3UHXpaD__i18n_en_us"
        try {
            await client.delete(enUSId)
            console.log(`✅ Deleted ${enUSId}`)
        } catch (e) {
            console.error(`❌ Still failed: ${e.message}`)
        }
    }

    // Find all dynamic pages with language 'en-US'
    const query = `*[_type == "dynamicPage" && language == "en-US"]{_id, title, slug}`
    const docs = await client.fetch(query)

    if (docs.length === 0) {
        console.log("No 'en-US' documents found.")
        return
    }

    console.log(`Found ${docs.length} documents. Deleting...`)

    for (const doc of docs) {
        console.log(`Deleting: ${doc.title} (${doc._id}) Slug: ${doc.slug?.current}`)
        try {
            await client.delete(doc._id)
            // Also check for draft ID
            const draftId = `drafts.${doc._id}`
            await client.delete(draftId).catch(() => { })
            console.log(`✅ Deleted ${doc._id}`)
        } catch (e) {
            console.error(`❌ Failed to delete ${doc._id}: ${e.message}`)
        }
    }

    console.log("Cleanup complete.")
}

deleteEnUS()
