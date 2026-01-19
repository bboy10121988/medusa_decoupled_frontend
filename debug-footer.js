
const { createClient } = require('next-sanity')
const fs = require('fs')
const path = require('path')

// Load env vars
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
    console.log('Fetching all Footer documents...')
    const query = `*[_type == "footer"] {
    _id,
    language,
    title,
    logo { asset->{url} },
    logoWidth,
    sections,
    copyright
  }`

    const footers = await client.fetch(query)

    console.log(`Found ${footers.length} footer documents:`)
    footers.forEach(f => {
        console.log(`\n[Language: ${f.language || 'undefined'}] ID: ${f._id}`)
        console.log(`  Title: ${f.title}`)
        console.log(`  Logo URL: ${f.logo?.asset?.url || 'MISSING'}`)
        console.log(`  Logo Width: ${f.logoWidth}`)
        console.log(`  Sections Count: ${f.sections?.length || 0}`)
    })
}

main().catch(console.error)
