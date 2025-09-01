// Temporary debug script for fetch issues
async function testFetch() {
  console.log('Testing fetch...')
  
  try {
    const response = await fetch('http://localhost:9000/health', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    console.log('Fetch successful:', response.status)
    const data = await response.text()
    console.log('Response:', data)
  } catch (error) {
    console.error('Fetch failed:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause,
      stack: error.stack
    })
  }
}

if (typeof window === 'undefined') {
  // Server side
  testFetch()
} else {
  // Client side
  console.log('Client side - fetch should work')
}
