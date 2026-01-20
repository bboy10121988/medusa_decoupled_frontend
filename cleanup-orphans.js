
const { createClient } = require('next-sanity')
const fs = require('fs')
const path = require('path')

// Load env vars from .env.local
const envPath = path.resolve(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = require('dotenv').parse(fs.readFileSync(envPath))
    for (const k in envConfig) {
        process.env[k] = envConfig[k]
    }
}

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
})

async function main() {
    console.log('Starting Orphan Post Cleanup...')
    const dryRun = !process.argv.includes('--delete')

    if (dryRun) {
        console.log('NOTICE: Running in DRY RUN mode. Use --delete to actually delete.')
    } else {
        console.log('WARNING: DELETION MODE ENABLED.')
    }

    // 1. Fetch all EN/JP posts
    // We explicitly exclude drafts to avoid messing with work in progress, 
    // but usually we want to clean drafts of orphans too? 
    // Let's stick to published first.
    // Query: All posts where language is NOT zh-TW.
    const query = `*[_type == "post" && language != 'zh-TW' && !(_id in path('drafts.**'))]`
    const foreignPosts = await client.fetch(query)
    console.log(`Found ${foreignPosts.length} foreign language posts (en/ja-JP).`)

    let deleteCount = 0
    let keptCount = 0

    for (const post of foreignPosts) {
        // Check for metadata
        const metaQuery = `*[_type == "translation.metadata" && references($id)][0]`
        const meta = await client.fetch(metaQuery, { id: post._id })

        let isOrphan = false
        let reason = ''

        if (!meta) {
            isOrphan = true
            reason = 'No translation metadata found'
        } else {
            // Meta exists, check if it has a zh-TW source
            const zhSource = meta.translations.find(t => t._key === 'zh-TW')
            if (!zhSource) {
                isOrphan = true
                reason = 'Metadata exists but no zh-TW source linked'
            } else {
                // Check if the source doc actually exists
                const sourceDoc = await client.fetch(`*[_id == $id][0]`, { id: zhSource.value._ref })
                if (!sourceDoc) {
                    isOrphan = true
                    reason = `Linked zh-TW source (${zhSource.value._ref}) does not exist`
                }
            }
        }

        if (isOrphan) {
            console.log(`[ORPHAN] ${post._id} (${post.language}): ${post.title} - Reason: ${reason}`)
            if (!dryRun) {
                try {
                    await client.delete(post._id)
                    console.log(`   -> DELETED ${post._id}`)
                    deleteCount++

                    // Also delete metadata if it exists and essentially empty/orphan?
                    if (meta) {
                        // If we delete the post, we should remove it from metadata.
                        // If metadata becomes empty or only has 1 item left (orphaned), maybe delete metadata?
                        // For safety, let's just remove this post from metadata translations.
                        const newTranslations = meta.translations.filter(t => t.value._ref !== post._id)
                        if (newTranslations.length <= 1) {
                            // If only 1 or 0 left, the metadata is useless (unless it's the source itself awaiting translation?)
                            // But here we are cleaning up.
                            // Let's safe-delete metadata if it has NO zh-TW and we just removed the foreign one.
                            console.log(`   -> Cleaning up metadata ${meta._id}`)
                            await client.delete(meta._id)
                        } else {
                            // Just patch
                            await client
                                .patch(meta._id)
                                .set({ translations: newTranslations })
                                .commit()
                        }
                    }
                } catch (e) {
                    console.error(`   -> Failed to delete: ${e.message}`)
                }
            } else {
                deleteCount++
            }
        } else {
            // console.log(`[KEEP] ${post._id} is valid.`)
            keptCount++
        }
    }

    console.log('--------------------------------------------------')
    console.log(`Summary:`)
    console.log(`Found: ${foreignPosts.length}`)
    console.log(`Orphans (to be deleted): ${deleteCount}`)
    console.log(`Valid (kept): ${keptCount}`)
    if (dryRun) console.log('Run with --delete to execute deletion.')
}

main().catch(console.error)
