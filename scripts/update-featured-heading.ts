import { createClient } from '@sanity/client'
import 'dotenv/config'

const client = createClient({
    projectId: 'm7o2mv1n',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN
})

async function updateShowHeading() {
    // 找出 homePage 文件
    const homePage = await client.fetch(`*[_type == 'homePage' && language == 'zh-TW'][0]{ _id, mainSections }`)
    console.log('Found homePage:', homePage._id)

    // 找到 featuredProducts 的索引
    const fpIndex = homePage.mainSections.findIndex((s: any) => s._type === 'featuredProducts')
    console.log('featuredProducts index:', fpIndex)

    if (fpIndex === -1) {
        console.log('No featuredProducts section found')
        return
    }

    // 更新 showHeading 為 false
    const result = await client.patch(homePage._id)
        .set({ [`mainSections[${fpIndex}].showHeading`]: false })
        .commit()

    console.log('Updated successfully:', result._id)

    // 驗證更新
    const updated = await client.fetch(`*[_type == 'homePage' && language == 'zh-TW'][0].mainSections[${fpIndex}]`)
    console.log('Verification:', JSON.stringify(updated, null, 2))
}

updateShowHeading().catch(e => console.error('Error:', e.message))
