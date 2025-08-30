import { getHeader } from "../../../lib/sanity"

export async function GET() {
  try {
    const headerData = await getHeader()
    if (process.env.NODE_ENV === 'development') {
      console.log('=== Header Debug ===')
      console.log('headerData:', JSON.stringify(headerData, null, 2))
      console.log('marquee:', headerData?.marquee)
      console.log('marquee.enabled:', headerData?.marquee?.enabled)
      console.log('text1:', headerData?.marquee?.text1)
      console.log('text2:', headerData?.marquee?.text2)
      console.log('text3:', headerData?.marquee?.text3)
      console.log('===================')
    }
    
    return Response.json({ 
      headerData, 
      marquee: headerData?.marquee,
      debug: 'success'
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Header test error:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: 'failed'
    }, { status: 500 })
  }
}
