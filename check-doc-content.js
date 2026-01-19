const { createClient } = require('next-sanity')
require('dotenv').config({ path: '.env.local' })

async function checkDocContent() {
    // 1. Get client
    const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        apiVersion: "2024-01-01",
        useCdn: false, // Ensure fresh data
        token: process.env.SANITY_API_TOKEN
    })

    console.log(`Checking Sanity Content... Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`)

    // Check Header
    const headers = await client.fetch(`*[_type == "header"]{_id, language, storeName}`)
    console.log(`\nFound ${headers.length} headers:`)
    headers.forEach(d => console.log(`- Lang: ${d.language}, ID: ${d._id}`))

    // Check Footer
    const footers = await client.fetch(`*[_type == "footer"]{_id, language, copyright}`)
    console.log(`\nFound ${footers.length} footers:`)
    footers.forEach(d => console.log(`- Lang: ${d.language}, ID: ${d._id}`))

    // Check HomePage
    const homePages = await client.fetch(`*[_type == "homePage"]{_id, language, title}`)
    console.log(`\nFound ${homePages.length} homePages:`)
    homePages.forEach(d => console.log(`- Lang: ${d.language}, ID: ${d._id}`))

    // Check DynamicPage slugs
    const dynamicPages = await client.fetch(`*[_type == "dynamicPage"]{_id, language, slug}`)
    console.log(`\nAll DynamicPages slugs:`)
    dynamicPages.forEach(d => console.log(`- Lang: ${d.language}, Slug: ${d.slug ? d.slug.current : 'NULL'}, ID: ${d._id}`))
}

checkDocContent()
