const { listRegions } = require('./src/lib/data/regions');
// Mocking the environment for the script
process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL = "https://admin.timsfantasyworld.com";

// We need to bypass the 'use server' restriction or import differently?
// Actually 'regions.ts' has 'use server' directive. We cannot require it in a plain node script easily if it uses Next.js specific features.
// But 'regions.ts' imports 'sdk' from '../config'.

// Alternative: Just use fetch directly to Medusa.
async function debugMedusa() {
    const backendUrl = "https://admin.timsfantasyworld.com";
    const apiKey = "pk_01JM5ZNKO243869842323948723948"; // I need the Publishable Key. 
    // It's usually in process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY.
    // I can read it from .env.local
    require('dotenv').config({ path: '.env.local' });

    const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
    console.log(`Fetching regions from ${backendUrl} with key ${key ? 'PRESENT' : 'MISSING'}...`);

    try {
        const res = await fetch(`${backendUrl}/store/regions`, {
            headers: {
                'x-publishable-api-key': key
            }
        });

        if (!res.ok) {
            console.error(`Failed: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error(text);
            return;
        }

        const data = await res.json();
        console.log(`Got ${data.regions.length} regions.`);

        data.regions.forEach(r => {
            console.log(`Region: ${r.name} (${r.id})`);
            console.log(`  Countries: ${r.countries.map(c => c.iso_2).join(', ')}`);
        });

    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

debugMedusa();
