// 注意：這個文件不能使用 "use server" 指令，因為它導出了非異步函數的值

import { Pool } from 'pg'

// 從環境變數獲取資料庫連接字串
const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:simple123@localhost/medusa-medusa_decoupled'

// 創建資料庫連接池
const pool = new Pool({
  connectionString: databaseUrl,
})

// 測試連接
pool.on('connect', () => {
  // console.log('Connected to Medusa database')
})

pool.on('error', () => {
  // console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// 導出 pool 給其他模塊使用
export { pool }