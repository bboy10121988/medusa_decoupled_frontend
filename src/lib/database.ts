import { Pool } from 'pg'

// 資料庫連接池
let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL 環境變數未設置')
    }

    console.log('🔗 建立資料庫連接池:', databaseUrl.replace(/\/\/.*@/, '//***:***@'))

    pool = new Pool({
      connectionString: databaseUrl,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      // 針對本地連接優化
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false }
    })

    pool.on('error', (err) => {
      console.error('資料庫連接池錯誤:', err)
      // 重置 pool 以便下次重新建立連接
      pool = null
    })
  }
  
  return pool
}

// 從 provider_identity 表查詢真實的 Google email
export async function getRealGoogleEmailFromDB(customerId: string): Promise<string | null> {
  const pool = getPool()
  
  try {
    console.log('🔍 查詢客戶的 Google email:', customerId)
    
    // 查詢 provider_identity 表，找到該客戶的 Google OAuth 資料
    const query = `
      SELECT 
        pi.user_metadata,
        pi.provider_metadata,
        c.email as customer_email,
        c.id as customer_id
      FROM provider_identity pi
      INNER JOIN customer c ON pi.entity_id = c.id
      WHERE pi.entity_id = $1 
        AND pi.provider = 'google'
      ORDER BY pi.created_at DESC
      LIMIT 1
    `
    
    const result = await pool.query(query, [customerId])
    
    if (result.rows.length === 0) {
      console.log('⚠️ 未找到該客戶的 Google 身份資料')
      return null
    }
    
    const row = result.rows[0]
    console.log('📊 查詢結果:', {
      customer_id: row.customer_id,
      customer_email: row.customer_email,
      user_metadata: row.user_metadata,
      provider_metadata: row.provider_metadata
    })
    
    // 從 user_metadata 中提取真實的 Google email
    let realEmail = null
    
    if (row.user_metadata && typeof row.user_metadata === 'object') {
      realEmail = row.user_metadata.email || 
                  row.user_metadata.emailAddress ||
                  row.user_metadata.googleEmail
    }
    
    // 如果 user_metadata 中沒有，嘗試從 provider_metadata 中查找
    if (!realEmail && row.provider_metadata && typeof row.provider_metadata === 'object') {
      realEmail = row.provider_metadata.email ||
                  row.provider_metadata.emailAddress
    }
    
    if (realEmail) {
      console.log('✅ 從資料庫找到真實 Google email:', realEmail)
      return realEmail
    } else {
      console.log('⚠️ metadata 中未包含 email 資訊')
      return null
    }
    
  } catch (error) {
    console.error('❌ 查詢資料庫失敗:', error)
    return null
  }
}

// 關閉資料庫連接池（用於清理）
export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}