/**
 * Script to create JP and US regions in Medusa
 * Run with: npx ts-node scripts/create-medusa-regions.ts
 */

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'https://admin.timsfantasyworld.com'
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL || 'temp_admin_direct@example.com'
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || 'TempPass123!'

interface Region {
    id: string
    name: string
    currency_code: string
    countries: { iso_2: string }[]
}

async function getAdminToken(): Promise<string> {
    console.log('🔐 Authenticating with Medusa Admin...')

    const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    })

    if (!response.ok) {
        throw new Error(`Failed to authenticate: ${response.status}`)
    }

    // Get the cookie from response
    const cookies = response.headers.get('set-cookie')
    return cookies || ''
}

async function getExistingRegions(cookie: string): Promise<Region[]> {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/regions`, {
        headers: { 'Cookie': cookie }
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch regions: ${response.status}`)
    }

    const data = await response.json()
    return data.regions || []
}

async function createRegion(cookie: string, regionData: {
    name: string
    currency_code: string
    countries: string[]
    tax_rate: number
    payment_providers: string[]
    fulfillment_providers: string[]
}): Promise<Region> {
    console.log(`📍 Creating region: ${regionData.name} (${regionData.currency_code})...`)

    const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/regions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify(regionData)
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to create region: ${response.status} - ${error}`)
    }

    const data = await response.json()
    console.log(`✅ Created region: ${data.region.name} (ID: ${data.region.id})`)
    return data.region
}

async function main() {
    console.log('🚀 Medusa Region Setup Script')
    console.log('='.repeat(50))

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.log('⚠️  Admin credentials not provided in environment.')
        console.log('')
        console.log('Please set the following environment variables:')
        console.log('  MEDUSA_ADMIN_EMAIL=your-admin@email.com')
        console.log('  MEDUSA_ADMIN_PASSWORD=your-password')
        console.log('')
        console.log('Then run: npx ts-node scripts/create-medusa-regions.ts')
        console.log('')
        console.log('Alternatively, you can create regions manually via Medusa Admin UI:')
        console.log(`  ${MEDUSA_BACKEND_URL}/app/settings/regions`)
        console.log('')
        console.log('Required regions:')
        console.log('  1. Japan - Currency: JPY, Country: JP')
        console.log('  2. United States - Currency: USD, Country: US')
        process.exit(1)
    }

    try {
        const cookie = await getAdminToken()

        // Check existing regions
        const existingRegions = await getExistingRegions(cookie)
        console.log(`📋 Found ${existingRegions.length} existing region(s):`)
        existingRegions.forEach(r => {
            console.log(`   - ${r.name} (${r.currency_code.toUpperCase()}) → [${r.countries.map(c => c.iso_2).join(', ')}]`)
        })

        const existingCountries = new Set(existingRegions.flatMap(r => r.countries.map(c => c.iso_2)))

        // Define regions to create
        const regionsToCreate = [
            { name: 'Japan', currency_code: 'jpy', countries: ['jp'], tax_rate: 10, payment_providers: [], fulfillment_providers: [] },
            { name: 'United States', currency_code: 'usd', countries: ['us'], tax_rate: 0, payment_providers: [], fulfillment_providers: [] }
        ]

        for (const regionData of regionsToCreate) {
            const countryExists = regionData.countries.some(c => existingCountries.has(c))
            if (countryExists) {
                console.log(`⏭️  Skipping ${regionData.name} - country already exists in another region`)
                continue
            }

            await createRegion(cookie, regionData)
        }

        console.log('')
        console.log('✅ Region setup complete!')
        console.log('')
        console.log('Next steps:')
        console.log('  1. Set product prices for JPY and USD in Medusa Admin')
        console.log('  2. Restart your frontend to pick up the new regions')

    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

main()
