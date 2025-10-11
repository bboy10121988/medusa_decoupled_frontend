"use client" // include with Next.js 13+

import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"
import { decodeToken } from "react-jwt"
import { sdk } from "@/lib/config"

// 檢查 JWT token 有效性的工具函數
const isValidJWT = (token: string): boolean => {
  if (!token) return false
  
  // JWT 應該由三部分組成，以點分隔
  const parts = token.split('.')
  if (parts.length !== 3) return false
  
  try {
    // 嘗試解析 payload 部分
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    
    // 檢查是否有基本的 JWT 欄位
    if (!payload.iat || !payload.exp) return false
    
    // 檢查是否過期
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return false
    
    return true
  } catch (e) {
    console.error("JWT 驗證失敗:", e)
    return false
  }
}

export default function GoogleCallback() {
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer>()
  const [tokenStatus, setTokenStatus] = useState<{
    received: boolean;
    valid: boolean;
    error?: string;
  }>({ received: false, valid: false })
  
  // 安全地獲取 URL 參數，避免伺服器端渲染問題
  const queryParams = useMemo(() => {
    if (typeof window === 'undefined') {
      return {}
    }
    const searchParams = new URLSearchParams(window.location.search)
    return Object.fromEntries(searchParams.entries())
  }, [])

  const sendCallback = async () => {
    let token = ""

    try {
      console.log("正在發送 Google 授權碼到後端...", {
        hasCode: !!queryParams.code,
        codeLength: queryParams.code ? queryParams.code.length : 0,
        endpoint: "/store/auth/google/callback"
      })
      
      token = await sdk.auth.callback(
        "customer", 
        "google", 
        // pass all query parameters received from the
        // third party provider
        queryParams
      )
      
      console.log("後端成功處理 Google 授權並返回 token", {
        hasToken: !!token,
        tokenLength: token ? token.length : 0
      })
    } catch (error) {
      console.error("後端處理 Google 授權碼失敗:", error)
      alert("Authentication Failed")
      
      throw error
    }

    return token
  }

  const createCustomer = async (email?: string) => {
    console.log("createCustomer 被調用 - 檢查客戶狀態")
    
    // 在 Medusa v2 中，認證訂閱者應該會自動創建客戶
    // 所以我們這裡只檢查客戶是否已存在，不做創建操作
    try {
      console.log("檢查是否已經存在客戶...")
      const { customer: existingCustomer } = await sdk.store.customer.retrieve()
      
      if (existingCustomer) {
        console.log("找到現有客戶:", existingCustomer.email)
        // 如果沒有電子郵件，更新從後端獲取的電子郵件
        if (!email && existingCustomer.email) {
          console.log("從後端獲取到電子郵件:", existingCustomer.email);
        }
        return { customer: existingCustomer, existing: true }
      }
      
      console.log("沒有找到客戶記錄，等待後端完成客戶創建")
      return { customer: null, existing: false }
    } catch (error) {
      console.log("客戶查詢失敗，這可能表示客戶尚未創建:", error)
      // 不再拋出錯誤，而是返回空結果
      return { customer: null, existing: false }
    }
  }

  const refreshToken = async () => {
    // refresh the token
    await sdk.auth.refresh()
  }

  const validateCallback = async () => {
    try {
      console.log("開始驗證 Google 回調...")
      console.log("查詢參數:", queryParams)
      
      // 檢查授權碼
      if (!queryParams.code) {
        console.error("錯誤: 缺少 Google 授權碼 (code)")
        setLoading(false)
        return
      }
      
      const token = await sendCallback()
      
      if (!token) {
        console.error("錯誤: 後端未返回 JWT token")
        setTokenStatus({ 
          received: false, 
          valid: false, 
          error: "後端未返回 JWT token" 
        })
        setLoading(false)
        return
      }
      
      // 驗證 token 格式
      const valid = isValidJWT(token)
      setTokenStatus({ 
        received: true, 
        valid, 
        error: valid ? undefined : "JWT 格式無效或已過期" 
      })
      
      console.log("已獲取 token, 開始解析...", { valid })
      
      // 1. 使用 lib/data/customer.ts 中的 handleGoogleCallback 函數來處理 token
      try {
        console.log("透過 handleGoogleCallback 設置和處理 token...")
        const { handleGoogleCallback } = await import('@/lib/data/customer')
        const result = await handleGoogleCallback(token)
        
        if (!result.success) {
          console.error("handleGoogleCallback 失敗:", result.error)
        } else {
          console.log("handleGoogleCallback 成功處理 token")
        }
      } catch (error) {
        console.error("調用 handleGoogleCallback 時出錯:", error)
      }
      
      const decoded = decodeToken(token) as { actor_id: string; email?: string }
      // 檢查 token 是否有效
      console.log("JWT Token 驗證:", {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenFormat: token ? (token.split('.').length === 3 ? "有效的 JWT 格式" : "無效的 JWT 格式") : "無 token",
        tokenPreview: token ? `${token.substring(0, 20)}...` : "無 token",
      })
      
      console.log("Token 解析結果:", {
        hasActorId: !!decoded.actor_id,
        actorId: decoded.actor_id,
        hasEmail: !!decoded.email,
        email: decoded.email,
        tokenPayload: decoded
      })

      // 檢查是否可以從 token 或查詢參數獲取電子郵件
      let email = decoded.email || 
                (queryParams.email as string) || 
                (queryParams.login_hint as string)
      
      // 如果沒有獲取到電子郵件，需要向後端請求用戶資料
      if (!email) {
        console.log("沒有從初始資料獲取到電子郵件，將嘗試多種方式獲取...")
        
        try {
          // 1. 首先嘗試通過數據庫直接查詢 Google 身份資料
          console.log("嘗試通過伺服器操作直接查詢數據庫 Google 身份資料...")
          try {
            // 首先獲取客戶 ID
            const { customer: customerData } = await sdk.store.customer.retrieve();
            
            if (customerData && customerData.id) {
              console.log("✅ 獲取到客戶 ID，尋找關聯的 Google 身份:", customerData.id);
              
              // 使用伺服器操作查詢 Google 身份
              const { getGoogleIdentityByCustomerId } = await import('@/lib/data/google-identity');
              const googleIdentityResult = await getGoogleIdentityByCustomerId(customerData.id);
              
              if (googleIdentityResult.success && googleIdentityResult.data && googleIdentityResult.data.email) {
                email = googleIdentityResult.data.email;
                console.log("✅ 從數據庫成功獲取 Google 身份電子郵件:", email);
                
                // 如果客戶的電子郵件是預設值，嘗試更新為 Google 身份電子郵件
                if (customerData.email === "example@medusajs.com" && email) {
                  try {
                    console.log("檢測到預設電子郵件，嘗試更新客戶資料...");
                    // 注意: Medusa SDK 可能不允許更新電子郵件，這裡使用可用的欄位
                    await sdk.store.customer.update({
                      first_name: googleIdentityResult.data.given_name || googleIdentityResult.data.name?.split(' ')[0] || '',
                      last_name: googleIdentityResult.data.family_name || googleIdentityResult.data.name?.split(' ').slice(1).join(' ') || '',
                      // 使用 metadata 來儲存 Google 電子郵件
                      metadata: {
                        google_email: email
                      }
                    });
                    console.log("✅ 客戶資料已使用 Google 身份資料更新");
                  } catch (updateError) {
                    console.error("更新客戶資料失敗:", updateError);
                  }
                }
              } else {
                console.log("從數據庫查詢 Google 身份失敗或未獲取到電子郵件:", googleIdentityResult.error || '未找到資料');
              }
            } else {
              console.log("❌ 無法獲取客戶 ID，跳過數據庫查詢");
            }
          } catch (dbError) {
            console.error("從數據庫獲取 Google 身份時出錯:", dbError);
          }
          
          // 2. 如果仍未獲取電子郵件，嘗試通過自定義 API 獲取
          if (!email) {
            console.log("嘗試從自定義的 Google API 端點獲取資料...");
            try {
              // 顯示嘗試訪問的 API URL
              const apiUrl = `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/auth/google/me`;
              console.log(`請求 API URL: ${apiUrl}`);
              
              // 使用更穩健的錯誤處理
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 8000);
              
              const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                cache: 'no-store',
                signal: controller.signal
              }).catch(error => {
                console.error(`API 請求過程中發生網絡錯誤:`, error.message);
                return null;
              });
              
              clearTimeout(timeoutId);
              
              if (!response) {
                console.log("API 請求失敗，可能是網絡問題或後端未運行");
              } else if (response.ok) {
                const googleData = await response.json();
                if (googleData && googleData.success && googleData.data && googleData.data.email) {
                  email = googleData.data.email;
                  console.log("✅ 從自定義 Google API 成功獲取電子郵件:", email);
                } else {
                  console.log("自定義 API 返回成功，但未包含電子郵件:", googleData);
                }
              } else {
                console.log("自定義 API 請求失敗:", response.status, response.statusText);
                // 如果是 404，表示 API 路由未正確配置
                if (response.status === 404) {
                  console.log("API 路由未找到，可能需要在後端配置 /store/auth/google/me 路由");
                }
              }
            } catch (googleApiError) {
              console.error("調用自定義 Google API 時出錯:", googleApiError);
            }
          }
          
          // 3. 如果仍未獲取電子郵件，嘗試使用標準 SDK 方法（可能會獲取到預設電子郵件）
          if (!email) {
            console.log("嘗試使用標準 Medusa SDK 獲取用戶資料...");
            const { customer: customerData } = await sdk.store.customer.retrieve();
            
            if (customerData && customerData.email && customerData.email !== "example@medusajs.com") {
              email = customerData.email;
              console.log("✅ 從 SDK 成功獲取非預設電子郵件:", email);
            } else {
              console.log("從 SDK 獲取到預設或空電子郵件:", customerData?.email);
              
              // 4. 最後嘗試，嘗試從數據庫中獲取所有 Google 身份並尋找最新的一個
              console.log("嘗試從數據庫獲取所有 Google 身份資料...");
              try {
                const { getAllGoogleIdentities } = await import('@/lib/data/google-identity');
                const allIdentitiesResult = await getAllGoogleIdentities();
                
                if (allIdentitiesResult.success && allIdentitiesResult.data && allIdentitiesResult.data.length > 0) {
                  const latestIdentity = allIdentitiesResult.data[0]; // 最新的身份
                  if (latestIdentity.email) {
                    email = latestIdentity.email;
                    console.log("✅ 從所有 Google 身份中找到最新的電子郵件:", email);
                  }
                }
              } catch (allIdentitiesError) {
                console.error("獲取所有 Google 身份時出錯:", allIdentitiesError);
              }
            }
          }
        } catch (error) {
          console.error("獲取用戶資料時出錯:", error);
        }
      } else {
        console.log("從初始資料獲取到電子郵件:", email);
      }
      
      // 即使在這個階段還是沒有電子郵件，我們也要繼續流程
      if (!email) {
        console.warn("無法獲取用戶電子郵件，將使用後續流程嘗試獲取用戶資訊");
      }
      
      // 檢查是否需要創建客戶
      // actor_id 為空時表示可能需要創建或關聯客戶
      const shouldCreateCustomer = decoded.actor_id === ""
      console.log("需要創建客戶?", shouldCreateCustomer, "可用的電子郵件:", email)

      // 即使沒有電子郵件，也嘗試進行後續流程
      // Medusa 後端可能已經有足夠的資訊來處理
      if (shouldCreateCustomer) {
        console.log("認證成功，但 token 中沒有 actor_id，這表示可能需要創建客戶或刷新 token")
        try {
          // 檢查客戶狀態，email 可選
          const { existing } = await createCustomer(email)
          
          // 無論客戶是否存在，都刷新 token 以獲取最新狀態
          console.log("刷新 token...")
          await refreshToken()
          console.log("token 已刷新")
          
          if (!existing) {
            // 如果客戶不存在，給後端一些時間處理
            console.log("等待後端完成客戶創建和關聯...")
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // 再次刷新 token 以確保獲取最新狀態
            await refreshToken()
          }
        } catch (error) {
          console.error("處理認證後操作時出錯:", error)
        }
      }

      // 使用改進的重試邏輯獲取客戶資料
      const getCustomerWithRetry = async (expectedEmail: string | null) => {
        let customerData = null
        const maxAttempts = 5 // 增加嘗試次數
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          console.log(`嘗試獲取客戶資料... (第 ${attempt}/${maxAttempts} 次)`)
          
          try {
            // 先使用 SDK 標準方法
            const result = await sdk.store.customer.retrieve()
            customerData = result.customer
            
            if (!customerData) {
              console.log("未返回客戶數據，等待後重試...")
              await new Promise(resolve => setTimeout(resolve, 2000)) // 增加等待時間
              continue
            }
            
            console.log("客戶資料獲取結果:", {
              customerId: customerData.id,
              email: customerData.email,
              attempt
            })
            
            // 檢查是否獲取到預設 email (這表示後端還沒有完成客戶資料的更新)
            if (customerData.email === "example@medusajs.com" && expectedEmail) {
              console.log("獲取到默認 email，而非預期的 Google email，等待後重試...", {
                current: customerData.email,
                expected: expectedEmail
              })
              
              // 嘗試使用 server action 直接從後端獲取最新數據
              try {
                // 1. 首先嘗試獲取客戶數據
                const { retrieveCustomer } = await import('@/lib/data/customer')
                console.log("使用 retrieveCustomer server action 獲取最新資料")
                const freshCustomer = await retrieveCustomer()
                
                // 2. 如果獲取到客戶數據，且不是預設郵箱，直接返回
                if (freshCustomer && freshCustomer.email !== "example@medusajs.com") {
                  console.log("從 server action 獲取到有效客戶數據:", freshCustomer.email)
                  return freshCustomer
                }
                
                // 3. 如果是預設郵箱，但客戶 ID 存在，嘗試從 Google 身份表中獲取真實郵箱
                if (freshCustomer && freshCustomer.id) {
                  console.log("檢測到預設郵箱，嘗試從 Google Identity 表獲取真實郵箱...")
                  const { getGoogleIdentityByCustomerId } = await import('@/lib/data/google-identity')
                  const googleIdentityResult = await getGoogleIdentityByCustomerId(freshCustomer.id)
                  
                  if (googleIdentityResult.success && googleIdentityResult.data?.email) {
                    console.log("✅ 從 Google Identity 獲取到真實郵箱:", googleIdentityResult.data.email)
                    // 只在開發環境中顯示詳細資料
                    if (process.env.NODE_ENV === 'development') {
                      console.log("Google 身份完整資料:", googleIdentityResult.data)
                    }
                    
                    // 克隆客戶對象並更新郵箱
                    const updatedCustomer = {
                      ...freshCustomer,
                      email: googleIdentityResult.data.email,
                      // 如果 Google 數據中有名字，也可以更新
                      first_name: googleIdentityResult.data.given_name || googleIdentityResult.data.name?.split(' ')[0] || freshCustomer.first_name,
                      last_name: googleIdentityResult.data.family_name || googleIdentityResult.data.name?.split(' ').slice(1).join(' ') || freshCustomer.last_name,
                      // 添加 Google 身份數據到元數據
                      metadata: {
                        ...freshCustomer.metadata,
                        googleIdentity: {
                          name: googleIdentityResult.data.name,
                          picture: googleIdentityResult.data.picture,
                          provider_user_id: googleIdentityResult.data.provider_user_id,
                        }
                      }
                    }
                    return updatedCustomer
                  } else {
                    console.log("❌ 無法從 Google Identity 獲取真實郵箱:", googleIdentityResult.error)
                  }
                }
              } catch (serverError) {
                console.error("使用 server action 獲取客戶資料失敗:", serverError)
              }
              
              await new Promise(resolve => setTimeout(resolve, 2000))
              // 嘗試刷新 token 再試一次
              await refreshToken()
              continue
            }
            
            // 找到有效的客戶數據，退出循環
            return customerData
          } catch (error) {
            console.error(`獲取客戶資料失敗 (嘗試 ${attempt}/${maxAttempts}):`, error)
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            // 在某些嘗試失敗後刷新 token
            if (attempt % 2 === 0) {
              try {
                await refreshToken()
                console.log("已刷新 token，繼續嘗試")
              } catch (refreshError) {
                console.error("刷新 token 失敗:", refreshError)
              }
            }
          }
        }
        
        // 返回最後一次嘗試的結果，可能為 null
        return customerData
      }
      
      // 預期的 email
      const expectedEmail = decoded.email || 
                         (queryParams.email as string) || 
                         (queryParams.login_hint as string)
      
      // 使用重試函數獲取客戶資料
      const customerData = await getCustomerWithRetry(expectedEmail)
      
      setCustomer(customerData || undefined)
      setLoading(false)
    } catch (error) {
      console.error("驗證回調過程中發生錯誤:", error)
      setLoading(false)
    }
  }

  // 只有在客戶端並且有參數時才執行回調驗證
  useEffect(() => {
    if (!loading) {
      return
    }

    // 確保我們在客戶端環境並且有查詢參數
    if (typeof window !== 'undefined' && Object.keys(queryParams).length > 0) {
      validateCallback()
    }
  }, [loading, queryParams])

  const [realGoogleIdentity, setRealGoogleIdentity] = useState<{
    email?: string;
    name?: string;
    picture?: string;
    loading: boolean;
  }>({ loading: false });
  
  useEffect(() => {
    if (!customer) {
      return
    }

    // 認證成功後顯示客戶信息，但不重定向
    console.log("認證成功，顯示客戶信息:", customer.email)
    
    // 如果客戶電子郵件仍然是 example@medusajs.com，嘗試獲取真實的 Google 身份數據
    if (customer.email === "example@medusajs.com" && customer.id) {
      console.log("檢測到預設電子郵件，嘗試獲取真實 Google 身份數據...")
      setRealGoogleIdentity(prev => ({ ...prev, loading: true }));
      
      // 使用客戶 ID 從數據庫中獲取 Google 身份數據
      (async () => {
        try {
          const { getGoogleIdentityByCustomerId } = await import('@/lib/data/google-identity');
          const result = await getGoogleIdentityByCustomerId(customer.id);
          
          if (result.success && result.data) {
            console.log("✅ 成功獲取 Google 身份數據");
            // 只在開發環境中顯示詳細資料
            if (process.env.NODE_ENV === 'development') {
              console.log("Google 身份數據詳情:", result.data);
              console.log("完整的 Google 身份數據結構:", JSON.stringify(result.data, null, 2));
            }
            
            setRealGoogleIdentity({
              email: result.data.email,
              name: result.data.name || (result.data.given_name && result.data.family_name) 
                ? `${result.data.given_name || ''} ${result.data.family_name || ''}`.trim() 
                : undefined,
              picture: result.data.picture,
              loading: false
            });
            
            // 理想情況下這裡還可以向 Medusa 後端發送請求，更新客戶資料
            // 但這需要後端提供相應的 API，現在只在前端顯示正確信息
          } else {
            console.log("⚠️ 無法獲取 Google 身份數據:", result.error);
            setRealGoogleIdentity(prev => ({ ...prev, loading: false }));
          }
        } catch (error) {
          console.error("獲取 Google 身份數據時出錯:", error);
          setRealGoogleIdentity(prev => ({ ...prev, loading: false }));
        }
      })();
    }
  }, [customer])

  // 渲染不同的內容根據當前狀態
  const renderContent = () => {
    // 統一返回一致的消息，等待客戶端邏輯接管
    if (loading) {
      return (
        <div className="text-center">
          <p className="text-gray-600 mb-4">正在處理 Google 登入請求...</p>
          <div className="animate-pulse flex space-x-4 justify-center">
            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
          </div>
        </div>
      )
    }
    
    // 缺少認證參數 (僅在客戶端執行時才會檢查)
    if (typeof window !== 'undefined' && Object.keys(queryParams).length === 0) {
      return (
        <div className="text-center">
          <p className="text-red-500 mb-4">缺少 Google 認證參數</p>
          <p className="text-gray-600">無法處理認證回調，請重新嘗試登入</p>
          <div className="mt-4">
            <button 
              onClick={() => window.location.href = '/tw/account'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              返回登入頁面
            </button>
          </div>
        </div>
      )
    }
    
    // 認證成功
    if (customer) {
      // 決定顯示的郵箱：如果有真實 Google 郵箱則使用它，否則使用客戶的郵箱
      const displayEmail = realGoogleIdentity.email || customer.email;
      const isDefaultEmail = customer.email === "example@medusajs.com";
      
      return (
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-800 mb-2">登入成功！</h2>
          <p className="text-green-600 mb-4">
            已使用 {displayEmail} 登入系統
            {isDefaultEmail && realGoogleIdentity.loading && (
              <span className="text-xs text-gray-500 block mt-1">
                (正在獲取實際的 Google 郵箱...)
              </span>
            )}
          </p>
          
          {realGoogleIdentity.picture && (
            <div className="flex justify-center mb-4">
              <img 
                src={realGoogleIdentity.picture} 
                alt="Google profile" 
                className="w-16 h-16 rounded-full border-2 border-blue-400"
              />
            </div>
          )}
          
          <div className="text-left bg-gray-50 p-3 rounded mb-4 text-xs overflow-auto max-h-60">
            <h3 className="font-medium mb-2">客戶詳細信息：</h3>
            <pre>
              {JSON.stringify(
                {
                  id: customer.id,
                  email: isDefaultEmail && realGoogleIdentity.email 
                    ? `${customer.email} (實際: ${realGoogleIdentity.email})` 
                    : customer.email,
                  firstName: customer.first_name,
                  lastName: customer.last_name,
                  metadata: customer.metadata,
                  ...(realGoogleIdentity.name ? { googleName: realGoogleIdentity.name } : {})
                }, 
                null, 
                2
              )}
            </pre>
          </div>
          <div className="flex justify-center mt-6 space-x-4">
            <button 
              onClick={() => window.location.href = '/tw'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              返回首頁
            </button>
            <button 
              onClick={() => window.location.href = '/tw/account'}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              前往會員中心
            </button>
          </div>
        </div>
      )
    }
    
    // 其他錯誤情況，但有認證參數 - 顯示更詳細的狀態
    return (
      <div className="text-center">
        <p className="text-red-500 mb-4">認證處理中遇到問題</p>
        <div className="text-left bg-gray-50 p-3 rounded mb-4 text-xs overflow-auto max-h-60">
          <h3 className="font-medium mb-2 text-base">認證狀態：</h3>
          
          <div className="mb-3">
            <p><strong>Google 授權碼：</strong> {queryParams.code ? "已接收" : "未接收"}</p>
            <p><strong>授權狀態：</strong> {queryParams.state ? "已接收" : "未接收"}</p>
            <p><strong>授權範圍：</strong> {queryParams.scope || "未知"}</p>
            <p><strong>回調參數數量：</strong> {Object.keys(queryParams).length}</p>
          </div>
          
          <div className="mb-3 pt-3 border-t border-gray-200">
            <h4 className="font-medium text-base">JWT Token 狀態：</h4>
            <p><strong>Token 是否接收：</strong> 
              <span className={tokenStatus.received ? "text-green-600" : "text-red-600"}>
                {tokenStatus.received ? "是" : "否"}
              </span>
            </p>
            {tokenStatus.received && (
              <p><strong>Token 是否有效：</strong> 
                <span className={tokenStatus.valid ? "text-green-600" : "text-red-600"}>
                  {tokenStatus.valid ? "是" : "否"}
                </span>
              </p>
            )}
            {tokenStatus.error && (
              <p><strong>錯誤訊息：</strong> <span className="text-red-600">{tokenStatus.error}</span></p>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="font-medium">可能的問題：</p>
            <ol className="list-decimal pl-5 mt-2">
              <li>授權碼已接收，但後端無法與 Google 交換 access token</li>
              <li>後端成功獲取 access token，但無法從 Google 獲取用戶資料</li>
              <li>後端無法生成有效的 JWT token</li>
              <li>前端無法正確解析 JWT token</li>
            </ol>
          </div>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <button 
            onClick={() => window.location.href = '/tw/account'}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            返回登入頁面
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            重新嘗試
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {renderContent()}
      </div>
    </div>
  )
}