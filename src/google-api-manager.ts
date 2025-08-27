"use client"

// 全局 Google API 狀態管理
class GoogleApiManager {
  private static instance: GoogleApiManager | null = null
  private isInitialized = false
  private isLoading = false
  private callbacks: Array<(response: any) => void> = []
  private errorCallbacks: Array<(error: string) => void> = []

  static getInstance(): GoogleApiManager {
    if (!GoogleApiManager.instance) {
      GoogleApiManager.instance = new GoogleApiManager()
    }
    return GoogleApiManager.instance
  }

  isGoogleInitialized(): boolean {
    return this.isInitialized
  }

  isGoogleLoading(): boolean {
    return this.isLoading
  }

  async initializeGoogle(): Promise<void> {
    if (this.isInitialized) {
      console.log('Google API 已經初始化')
      return
    }

    if (this.isLoading) {
      console.log('Google API 正在初始化中')
      return
    }

    this.isLoading = true

    try {
      // 等待 Google Script 載入
      await this.waitForGoogleScript()
      
      if (!window.google?.accounts?.id) {
        throw new Error('Google API 載入失敗')
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '21147467753-jfjp5g559a1s61s416bu4ko41mq6no5g.apps.googleusercontent.com'
      
      console.log('初始化 Google API...')
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false,
      })

      this.isInitialized = true
      this.isLoading = false
      console.log('Google API 初始化完成')
    } catch (error) {
      this.isLoading = false
      console.error('Google API 初始化失敗:', error)
      throw error
    }
  }

  private async waitForGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0
      const maxAttempts = 50 // 10 秒

      const checkGoogle = () => {
        attempts++
        if (window.google?.accounts?.id) {
          resolve()
        } else if (attempts >= maxAttempts) {
          reject(new Error('Google Script 載入超時'))
        } else {
          setTimeout(checkGoogle, 200)
        }
      }

      checkGoogle()
    })
  }

  private handleCredentialResponse(response: any) {
    console.log('收到 Google 憑證:', response)
    
    // 調用所有註冊的回調函數
    const currentCallbacks = [...this.callbacks] // 創建副本避免並發修改
    currentCallbacks.forEach(callback => {
      try {
        callback(response)
      } catch (error) {
        console.error('Google 登入回調錯誤:', error)
      }
    })
  }

  renderButton(element: HTMLElement, onSuccess?: (response: any) => void, onError?: (error: string) => void): void {
    if (!this.isInitialized) {
      console.error('Google API 尚未初始化')
      return
    }

    if (!window.google?.accounts?.id) {
      console.error('Google API 不可用')
      return
    }

    try {
      // 清除之前的內容
      element.innerHTML = ''

      // 註冊回調函數（避免重複註冊）
      if (onSuccess && !this.callbacks.includes(onSuccess)) {
        this.callbacks.push(onSuccess)
      }
      if (onError && !this.errorCallbacks.includes(onError)) {
        this.errorCallbacks.push(onError)
      }

      // 渲染按鈕
      window.google.accounts.id.renderButton(element, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '100%',
      })

      console.log('Google 按鈕渲染完成')
    } catch (error) {
      console.error('Google 按鈕渲染失敗:', error)
      if (onError) {
        onError(`按鈕渲染失敗: ${error}`)
      }
    }
  }

  removeCallback(callback: (response: any) => void): void {
    const index = this.callbacks.indexOf(callback)
    if (index > -1) {
      this.callbacks.splice(index, 1)
    }
  }

  cleanup(): void {
    // 保留初始化狀態，只清理回調
    this.callbacks = []
    this.errorCallbacks = []
    console.log('Google API 回調已清理')
  }
}

export default GoogleApiManager
