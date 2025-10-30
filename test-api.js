#!/usr/bin/env node

// 測試 Medusa publishable key 的腳本
const https = require('http')

const publishableKey = 'pk_06a1d9f1e084ae6eaa1696b4b058f2dd37e80bdd84e7d0fec6a7a1d04dd9497b'
const backendUrl = 'http://localhost:9000'

async function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 9000,
      path: path,
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-publishable-api-key': publishableKey
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        console.log(`\n${description}:`)
        console.log(`Status: ${res.statusCode}`)
        console.log(`Headers:`, JSON.stringify(res.headers, null, 2))
        
        try {
          const parsed = JSON.parse(data)
          console.log(`Response:`, JSON.stringify(parsed, null, 2))
        } catch (e) {
          console.log(`Raw Response:`, data.substring(0, 200))
        }
        resolve()
      })
    })

    req.on('error', (e) => {
      console.error(`Error for ${path}:`, e.message)
      resolve()
    })

    req.end()
  })
}

async function main() {
  console.log(`🔍 Testing Medusa API endpoints with publishable key`)
  console.log(`Key: ${publishableKey.substring(0, 20)}...`)
  console.log(`Backend: ${backendUrl}`)
  
  await testEndpoint('/health', '1. Health Check (no auth needed)')
  await testEndpoint('/store/regions', '2. Regions API')
  await testEndpoint('/store/collections', '3. Collections API')
  await testEndpoint('/store/products', '4. Products API')
}

main().catch(console.error)