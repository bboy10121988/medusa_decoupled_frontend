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

    // Fetch zh-TW homePage
    const zhHomePage = await client.fetch(`*[_type == "homePage" && language == "zh-TW"][0]`)

    if (!zhHomePage) {
        console.error('No zh-TW homePage found!')
        return
    }

    console.log('Found zh-TW homePage:', zhHomePage.title)
    console.log('mainSections count:', zhHomePage.mainSections?.length || 0)

    // Check if Japanese homePage already exists
    const existingJaHomePage = await client.fetch(`*[_type == "homePage" && language == "ja-JP"][0]`)

    if (existingJaHomePage) {
        console.log('Japanese homePage already exists:', existingJaHomePage._id)
        return
    }

    // Create Japanese homePage by copying from zh-TW
    const jaHomePage = {
        ...zhHomePage,
        _id: `homePage-ja-JP-${Date.now()}`,
        _rev: undefined,
        _createdAt: undefined,
        _updatedAt: undefined,
        _system: undefined,
        language: 'ja-JP'
    }

    console.log('Creating Japanese homePage...')
    const result = await client.create(jaHomePage)
    console.log('Created Japanese homePage:', result._id)
    console.log('Done!')
}

createJapaneseDocuments().catch(console.error)
