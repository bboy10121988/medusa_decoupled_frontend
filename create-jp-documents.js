const { createClient } = require('@sanity/client')

const client = createClient({
    projectId: 'm7o2mv1n',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN
})

async function createJapaneseDocuments() {
    console.log('Fetching zh-TW documents...')

    // Fetch zh-TW header
    const zhHeader = await client.fetch(`*[_type == "header" && language == "zh-TW"][0]`)
    const zhFooter = await client.fetch(`*[_type == "footer" && language == "zh-TW"][0]`)

    if (!zhHeader) {
        console.error('No zh-TW header found!')
        return
    }

    if (!zhFooter) {
        console.error('No zh-TW footer found!')
        return
    }

    console.log('Found zh-TW header:', zhHeader.storeName)
    console.log('Found zh-TW footer:', zhFooter._id)

    // Check if Japanese documents already exist
    const existingJaHeader = await client.fetch(`*[_type == "header" && language == "ja-JP"][0]`)
    const existingJaFooter = await client.fetch(`*[_type == "footer" && language == "ja-JP"][0]`)

    if (existingJaHeader) {
        console.log('Japanese header already exists:', existingJaHeader._id)
    } else {
        // Create Japanese header
        const jaHeader = {
            ...zhHeader,
            _id: `header-ja-JP-${Date.now()}`,
            _rev: undefined,
            _createdAt: undefined,
            _updatedAt: undefined,
            _system: undefined,
            language: 'ja-JP',
            storeName: zhHeader.storeName // Keep same store name for now
        }

        console.log('Creating Japanese header...')
        const result = await client.create(jaHeader)
        console.log('Created Japanese header:', result._id)
    }

    if (existingJaFooter) {
        console.log('Japanese footer already exists:', existingJaFooter._id)
    } else {
        // Create Japanese footer
        const jaFooter = {
            ...zhFooter,
            _id: `footer-ja-JP-${Date.now()}`,
            _rev: undefined,
            _createdAt: undefined,
            _updatedAt: undefined,
            _system: undefined,
            language: 'ja-JP'
        }

        console.log('Creating Japanese footer...')
        const result = await client.create(jaFooter)
        console.log('Created Japanese footer:', result._id)
    }

    console.log('Done!')
}

createJapaneseDocuments().catch(console.error)
