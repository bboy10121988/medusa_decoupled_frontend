const { createClient } = require('next-sanity')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
})

async function deleteLocales() {
    console.log('🧹 Starting cleanup of EN/JP dynamic pages and metadata...')

    try {
        // 1. Find all EN and JP dynamic pages
        const query = `*[_type == "dynamicPage" && language in ["en", "en-US", "ja-JP", "ja"]] { _id, title, language }`
        const docs = await client.fetch(query)

        if (docs.length === 0) {
            console.log('✅ No EN/JP dynamic pages found.')
        } else {
            console.log(`Found ${docs.length} documents to delete:`)
            docs.forEach(d => console.log(` - [${d.language}] ${d.title} (${d._id})`))

            const transaction = client.transaction()
            docs.forEach(d => transaction.delete(d._id))
            await transaction.commit()
            console.log('🗑️  Deleted all EN/JP dynamic pages.')
        }

        // 2. Clear translation metadata to unlink everything
        // We only clear metadata related to dynamicPage to avoid breaking other types if mixed?
        // But user said "fresh start", usually implies cleaning up broken links.
        // Let's filter by schemaType if possible, or just delete all metadata referencing these IDs?
        // Safest: Delete ALL translation.metadata for dynamicPage type.

        // Note: translation.metadata documents usually don't have a 'schemaType' field unless we put it there.
        // But our new code DOES put it there. Old ones might not.
        // Strategy: Find metadata where translations point to the deleted docs? 
        // OR just delete all metadata for dynamicPage.

        // Let's look for metadata containing dynamicPage references.
        console.log('Searching for translation metadata...')
        const metaQuery = `*[_type == "translation.metadata"]`
        const allMeta = await client.fetch(metaQuery)

        // Filter metadata where any value._type is dynamicPage
        const metaToDelete = allMeta.filter(m =>
            m.translations.some(t => t.value && t.value._type === 'dynamicPage')
        )

        if (metaToDelete.length === 0) {
            console.log('✅ No metadata to delete.')
        } else {
            console.log(`Found ${metaToDelete.length} metadata records to delete.`)
            const tx2 = client.transaction()
            metaToDelete.forEach(m => tx2.delete(m._id))
            await tx2.commit()
            console.log('🗑️  Deleted translation metadata for dynamic pages.')
        }

    } catch (err) {
        console.error('❌ Error during cleanup:', err)
    }
}

deleteLocales()
