
import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
})

async function updateAuthors() {
    const authors = await client.fetch('*[_type == "author"]')
    for (const author of authors) {
        if (!author.language) {
            await client.patch(author._id).set({ language: 'zh-TW' }).commit()
            console.log(`Updated author: ${author.name}`)
        }
    }
}

updateAuthors().catch(console.error)
