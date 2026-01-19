const { createClient } = require('next-sanity')

require('dotenv').config({ path: '.env.local' })

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'm7o2mv1n'
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const TOKEN = process.env.SANITY_API_TOKEN
const WEBHOOK_URL = 'https://timsfantasyworld.com/api/webhooks/sanity-translation'

async function listWebhooks() {
    if (!TOKEN) {
        console.error('❌ Missing SANITY_API_TOKEN')
        return
    }

    console.log(`🚀 listing webhooks for project: ${PROJECT_ID}`)

    const apiEndpoint = `https://api.sanity.io/v2021-10-21/hooks/projects/${PROJECT_ID}`

    try {
        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            const err = await response.text()
            throw new Error(`API Error ${response.status}: ${err}`)
        }

        const result = await response.json()
        console.log('✅ Webhooks list:')
        console.log(JSON.stringify(result, null, 2))

    } catch (error) {
        console.error('❌ Failed to list webhooks:', error.message)
    }
}

listWebhooks()
