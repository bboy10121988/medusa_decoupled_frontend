const { Medusa } = require("@medusajs/medusa-js")

const medusa = new Medusa({ baseUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000", maxRetries: 3 })

async function listRegions() {
    try {
        const { regions } = await medusa.admin.regions.list()
        console.log("Existing Regions:")
        regions.forEach(r => {
            console.log(`- ${r.name} (${r.id}): Currency: ${r.currency_code}, Countries: ${r.countries.map(c => c.iso_2).join(', ')}`)
        })
    } catch (error) {
        console.error("Error listing regions:", error)
    }
}

listRegions()
