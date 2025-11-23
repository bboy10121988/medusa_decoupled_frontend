"use server"

import { pool } from '@/lib/db'

interface GoogleIdentity {
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  verified_email?: boolean;
  sub?: string;
  provider_user_id?: string;
  customer_id?: string;
  raw_user_info?: any;  // 存儲原始的 Google 用戶資訊，以備將來使用
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  id_token?: string;
  expires_at?: number;
}

interface GoogleIdentityResult {
  success: boolean;
  data?: GoogleIdentity;
  error?: string;
}

/**
 * 從數據庫中獲取 Google OAuth 用戶資料
 * 
 * @param customerId Medusa 客戶 ID
 * @returns Google 用戶資料結果
 */
export async function getGoogleIdentityByCustomerId(
  customerId: string
): Promise<GoogleIdentityResult> {
  let client;
  try {
    // 連接到資料庫
    client = await pool.connect()
    
          // 查詢客戶關聯的 Google 身份資料
      const query = `
        SELECT 
          pi.id,
          pi.entity_id as provider_user_id,
          pi.user_metadata,
          pi.provider_metadata,
          ai.app_metadata
        FROM auth_identity ai 
        JOIN provider_identity pi ON ai.id = pi.auth_identity_id
        WHERE ai.app_metadata->>'customer_id' = $1 AND pi.provider = 'google'
        ORDER BY pi.created_at DESC 
        LIMIT 1
      `
    
    // console.log(`🔍 查詢客戶 ${customerId} 的 Google 身份資料`)
    const result = await client.query(query, [customerId])
    
    if (result.rows.length === 0) {
      // console.log(`⚠️ 未找到客戶 ${customerId} 的 Google 身份資料`)
      return {
        success: false,
        error: `未找到客戶 ${customerId} 的 Google 身份資料`
      }
    }
    
    const data = result.rows[0]
    // 在 Medusa v2 中，user_metadata 已經是 JSON 對象
    const userMetadata = data.user_metadata || {};
    const providerMetadata = data.provider_metadata || {};
    
    // 只在開發環境中記錄數據
    if (process.env.NODE_ENV === 'development') {
      // console.log("完整的 user_metadata:", JSON.stringify(userMetadata, null, 2));
      // console.log("完整的 provider_metadata:", JSON.stringify(providerMetadata, null, 2));
    }
    
    const googleIdentity: GoogleIdentity = {
      // 從 user_metadata 中提取資訊
      email: userMetadata.email || '',
      name: userMetadata.name,
      given_name: userMetadata.given_name,
      family_name: userMetadata.family_name,
      picture: userMetadata.picture,
      locale: userMetadata.locale,
      verified_email: userMetadata.verified_email,
      sub: userMetadata.sub,
      
      // Medusa 資料庫相關欄位
      provider_user_id: data.entity_id, // entity_id 是 Medusa v2 的欄位
      customer_id: data.app_metadata?.customer_id,
      
      // 來自 provider_metadata 的可能資料
      access_token: providerMetadata.access_token,
      refresh_token: providerMetadata.refresh_token,
      token_type: providerMetadata.token_type,
      id_token: providerMetadata.id_token,
      expires_at: providerMetadata.expires_at,
      
      // 儲存完整的原始資料，以備將來使用
      raw_user_info: userMetadata
    }
    
    // console.log(`✅ 成功獲取 Google 身份資料:`, {
      // hasEmail: !!googleIdentity.email,
      // hasName: !!googleIdentity.name,
      // email: googleIdentity.email,
      // providerId: data.provider_user_id
    // })
    
    return {
      success: true,
      data: googleIdentity
    }
    
  } catch (error) {
    // console.error('❌ 獲取 Google 身份資料時出錯:', error)
    return {
      success: false,
      error: `數據庫查詢失敗: ${error instanceof Error ? error.message : String(error)}`
    }
  } finally {
    // 釋放客戶端連接
    if (client) client.release()
  }
}

/**
 * 獲取所有 Google OAuth 身份資料
 * 
 * @returns 所有 Google 身份資料結果
 */
export async function getAllGoogleIdentities(): Promise<{
  success: boolean;
  data?: GoogleIdentity[];
  error?: string;
}> {
  let client;
  try {
    // 連接到資料庫
    client = await pool.connect()
    
    // 查詢所有 Google 身份資料
    const query = `
      SELECT 
        pi.id,
        pi.provider,
        pi.entity_id as provider_user_id,
        pi.user_metadata,
        pi.provider_metadata,
        ai.app_metadata
      FROM 
        public.auth_identity ai
      JOIN 
        public.provider_identity pi ON ai.id = pi.auth_identity_id
      WHERE 
        pi.provider = 'google'
      ORDER BY 
        pi.created_at DESC
    `
    
    // console.log('🔍 查詢所有 Google 身份資料')
    const result = await client.query(query)
    
    const identities = result.rows.map(row => {
      // 在 Medusa v2 中，user_metadata 已經是 JSON 對象
      const userMetadata = row.user_metadata || {};
      const providerMetadata = row.provider_metadata || {};
      
      // 只在開發環境中記錄數據
      if (process.env.NODE_ENV === 'development' && userMetadata.email) {
        // console.log(`✅ 找到 Google 帳戶 ${userMetadata.email} 的詳細資料`);
        // console.log("user_metadata 範例:", JSON.stringify(userMetadata, null, 2));
        // console.log("provider_metadata 範例:", JSON.stringify(providerMetadata, null, 2));
      }
      
      return {
        // 從 user_metadata 中提取資訊
        email: userMetadata.email || '',
        name: userMetadata.name,
        given_name: userMetadata.given_name,
        family_name: userMetadata.family_name,
        picture: userMetadata.picture,
        locale: userMetadata.locale,
        verified_email: userMetadata.verified_email,
        sub: userMetadata.sub,
        
        // Medusa 資料庫相關欄位
        provider_user_id: row.entity_id, // entity_id 是 Medusa v2 的欄位
        customer_id: row.app_metadata?.customer_id,
        
        // 來自 provider_metadata 的可能資料
        access_token: providerMetadata.access_token,
        refresh_token: providerMetadata.refresh_token,
        token_type: providerMetadata.token_type,
        id_token: providerMetadata.id_token,
        expires_at: providerMetadata.expires_at,
        
        // 儲存完整的原始資料，以備將來使用
        raw_user_info: userMetadata
      } as GoogleIdentity;
    });
    
    // console.log(`✅ 成功獲取 ${identities.length} 筆 Google 身份資料`)
    
    return {
      success: true,
      data: identities
    }
    
  } catch (error) {
    // console.error('❌ 獲取所有 Google 身份資料時出錯:', error)
    return {
      success: false,
      error: `數據庫查詢失敗: ${error instanceof Error ? error.message : String(error)}`
    }
  } finally {
    // 釋放客戶端連接
    if (client) client.release()
  }
}