import { createHash } from 'crypto';

export class PaymentData {

  private HashKey: string = ""

  private HashIV: string = ""

  private data: URLSearchParams = new URLSearchParams();

  
  getDataParams(): URLSearchParams {

    const dstData = this.data;
    
    dstData.set('CheckMacValue', this.getCheckMacValue());

    return dstData;

  }

  /**
   * 設定hashkey
   * 用途：驗證資料正確性
   * @param hashKey 
   */
  setHashKey(hashKey:string):void{
    this.HashKey = hashKey;
  }

  setHashIV(hashIV:string):void{
    this.HashIV = hashIV;
  }
  
  /**
   * 設定特店編號
   * 用途：ECPay 特店編號，用來識別商店
   * 參數說明：由 ECPay 提供的特店編號，長度為 10 碼
   */
  setMerchantID(id: string): void {
    this.data.set('MerchantID', id);
  }

  /**
   * 設定特店交易編號
   * 用途：特店產生的唯一交易編號，用來識別此筆交易
   * 參數說明：英數字大小寫混合，長度限制為 1~20 碼
   */
  setMerchantTradeNo(tradeNo: string): void {
    this.data.set('MerchantTradeNo', tradeNo);
  }

  /**
   * 設定特店交易時間
   * 用途：特店產生此筆交易的時間
   * 參數說明：格式為 yyyy/MM/dd HH:mm:ss
   */
  setMerchantTradeDate(tradeDate: string): void {
    this.data.set('MerchantTradeDate', tradeDate);
  }

  /**
   * 設定交易類型
   * 用途：設定此次交易的付款方式
   * 參數說明：固定填入 aio
   */
  setPaymentType(paymentType: string = 'aio'): void {
    this.data.set('PaymentType', paymentType);
  }

  /**
   * 設定交易金額
   * 用途：此筆訂單的金額
   * 參數說明：純數字，不可有符號，如：1000
   */
  setTotalAmount(amount: number): void {
    this.data.set('TotalAmount', amount.toString());
  }

  /**
   * 設定交易描述
   * 用途：交易描述
   * 參數說明：中英數字，長度限制為 1~200 碼
   */
  setTradeDesc(desc: string): void {
    this.data.set('TradeDesc', desc);
  }

  /**
   * 設定商品名稱
   * 用途：商品名稱
   * 參數說明：中英數字，長度限制為 1~400 碼，多項商品請以 # 分隔
   */
  setItemName(itemName: string): void {
    this.data.set('ItemName', itemName);
  }

  /**
   * 設定付款完成通知回傳網址
   * 用途：付款完成後，ECPay 會將付款結果參數以背景連線的方式回傳到該網址
   * 參數說明：僅接受 http 或 https 開頭之網址，長度限制為 1~200 碼
   */
  setReturnURL(returnURL: string): void {
    this.data.set('ReturnURL', returnURL);
  }

  /**
   * 設定選擇預設付款方式
   * 用途：選擇預設付款方式
   * 參數說明：Credit(信用卡)、WebATM(網路ATM)、ATM(自動櫃員機)、CVS(超商代碼)、BARCODE(超商條碼)、AndroidPay、ALL(不指定付款方式，由ECPay付款頁面提供選擇)
   */
  setChoosePayment(choosePayment: string = "ALL"): void {
    this.data.set('ChoosePayment', choosePayment);
  }

  /**
   * 設定檢查碼
   * 用途：檢查碼，用來驗證來源與資料正確性
   * 參數說明：由參數產生之檢查碼，請參考附錄檢查碼機制
   */
  setCheckMacValue(checkMacValue: string): void {
    this.data.set('CheckMacValue', checkMacValue);
  }

  getCheckMacValue():string{
    
    const originParam = this.data;

    // step1. 將傳遞參數依照第一個英文字母，由A到Z的順序來排序(遇到第一個英文字母相同時，以第二個英文字母來比較，以此類推)，並且以&方式將所有參數串連。
    // step2. 參數最前面加上HashKey、最後面加上HashIV
    // step3. 將整串字串進行URL encode
    // step4. 轉為小寫
    // step5. 以SHA256加密方式來產生雜凑值
    // step6. 再轉大寫產生CheckMacValue
    
    const params: Record<string, string> = {};
    for (const [key, value] of originParam.entries()) {
        params[key] = value;
    }

    // 排序參數
    const sortedKeys = Object.keys(params).sort();
    const sortedParams = sortedKeys.map(key => `${key}=${params[key]}`).join('&');

    // 加上 HashKey 和 HashIV
    const rawString = `HashKey=${this.HashKey}&${sortedParams}&HashIV=${this.HashIV}`;

    // URL encode
    const urlEncoded = encodeURIComponent(rawString)
        .replace(/%20/g, '+')
        .replace(/%21/g, '!')
        .replace(/%28/g, '(')
        .replace(/%29/g, ')')
        .replace(/%2A/g, '*')
        .replace(/%2D/g, '-')
        .replace(/%2E/g, '.')
        .replace(/%5F/g, '_');

    // 轉小寫
    const lowerCase = urlEncoded.toLowerCase();

    // SHA256 加密
    const hash = createHash('sha256').update(lowerCase).digest('hex');

    // 轉大寫
    return hash.toUpperCase();

  }

  /**
   * 設定加密類型
   * 用途：CheckMacValue加密類型
   * 參數說明：請固定填入1，使用SHA256加密
   */
  setEncryptType(encryptType: string = '1'): void {
    this.data.set('EncryptType', encryptType);
  }

  /**
   * 設定分店代號
   * 用途：提供特店填入分店代號使用，僅可用英數字大小寫混合。
   * @param storeID 分店代號
   */
  setStoreID(storeID: string):void{
    this.data.set('StoreID', storeID);
  }

  /**
   * 設定Client端返回特店的按鈕連結
   * 用途：消費者點選此按鈕後，會將頁面導回到此設定的網址
   * 參數說明：僅接受 http 或 https 開頭之網址，長度限制為 1~200 碼
   * 注意：
   *   - 導回時不會帶付款結果到此網址，只是將頁面導回而已。
   *   - 設定此參數，綠界會在付款完成或取號完成頁面上顯示[返回商店]的按鈕。
   *   - 設定此參數，發生簡訊OTP驗證失敗時，頁面上會顯示[返回商店]的按鈕。
   *   - 若未設定此參數，則綠界付款完成頁或取號完成頁面，不會顯示[返回商店]的按鈕。
   *   - 若導回網址未使用https時，部份瀏覽器可能會出現警告訊息。
   *   - 參數內容若有包含%26(&)及%3C(<) 這二個值時，請先進行urldecode() 避免呼叫API失敗。
   */
  setClientBackURL(clientBackURL: string): void {
    this.data.set('ClientBackURL', clientBackURL);
  }

  /**
   * 設定商品銷售網址
   * 用途：商品銷售網址
   * 參數說明：僅接受 http 或 https 開頭之網址，長度限制為 1~200 碼
   */
  setItemURL(itemURL: string): void {
    this.data.set('ItemURL', itemURL);
  }

  /**
   * 設定備註欄位
   * 用途：備註欄位
   * 參數說明：中英數字，長度限制為 1~100 碼
   */
  setRemark(remark: string): void {
    this.data.set('Remark', remark);
  }

  /**
   * 設定選擇預設付款子項目
   * 用途：選擇預設付款子項目
   * 參數說明：請參考付款方式參數說明，當ChoosePayment設定為Credit時，可設定的值：CreditCard
   */
  setChooseSubPayment(chooseSubPayment: string): void {
    this.data.set('ChooseSubPayment', chooseSubPayment);
  }

  /**
   * 有別於ReturnURL (server端的網址)，OrderResultURL為特店的client端(前端)網址。消費者付款完成後，綠界會將付款結果參數以POST方式回傳到到該網址。詳細說明請參考付款結果通知。
   * 用途：Client端回傳付款結果網址
   * 參數說明：僅接受 http 或 https 開頭之網址，長度限制為 1~200 碼
   * 注意：
   *   - 若與[ClientBackURL]同時設定，將會以此參數為主。
   *   - 銀聯卡及非即時交易( ATM、CVS、BARCODE )不支援此參數。
   *   - 付款結果通知請依ReturnURL (server端的網址)為主,避免因前端操作或網路問題未收到OrderResultURL 特店的client端(前端)的通知。
   *   - 參數內容若有包含%26(&)及%3C(<) 這二個值時，請先進行urldecode() 避免呼叫API失敗。
   */
  setOrderResultURL(orderResultURL: string): void {
    this.data.set('OrderResultURL', orderResultURL);
  }

  /**
   * 設定是否需要額外的付款資訊
   * 用途：是否需要額外的付款資訊
   * 參數說明：Y(需要額外付款資訊)、N(不需要額外付款資訊)，預設為N
   * 注意：
   *   - 付款完成後綠界後端會以POST方式回傳額外付款資訊到特店的ReturnURL 與OrderResultURL。
   */
  setNeedExtraPaidInfo(needExtraPaidInfo: string = "N"): void {
    this.data.set('NeedExtraPaidInfo', needExtraPaidInfo);
  }

  /**
   * 設定隱藏付款方式
   * 用途：當付款方式[ChoosePayment]為ALL時，可隱藏不需要的付款方式，多筆請以井號分隔 (#)。
   * 參數說明：Credit(隱藏信用卡)、WebATM(隱藏網路ATM)、ATM(隱藏自動櫃員機)、CVS(隱藏超商代碼)、BARCODE(隱藏超商條碼)
   */
  setIgnorePayment(ignorePayment: string): void {
    this.data.set('IgnorePayment', ignorePayment);
  }

  /**
   * 設定特約合作平台商代號
   * 用途：特約合作平台商代號(由ECPay提供)
   * 參數說明：10碼純數字
   */
  setPlatformID(platformID: string): void {
    this.data.set('PlatformID', platformID);
  }

  /**
   * 設定自訂名稱欄位1
   * 用途：自訂名稱欄位1
   * 參數說明：提供合作廠商使用記錄用客製化使用欄位，回傳時將會回傳此欄位的值
   */
  setCustomField1(customField1: string): void {
    this.data.set('CustomField1', customField1);
  }

  /**
   * 設定自訂名稱欄位2
   * 用途：自訂名稱欄位2
   * 參數說明：提供合作廠商使用記錄用客製化使用欄位，回傳時將會回傳此欄位的值
   */
  setCustomField2(customField2: string): void {
    this.data.set('CustomField2', customField2);
  }

  /**
   * 設定自訂名稱欄位3
   * 用途：自訂名稱欄位3
   * 參數說明：提供合作廠商使用記錄用客製化使用欄位，回傳時將會回傳此欄位的值
   */
  setCustomField3(customField3: string): void {
    this.data.set('CustomField3', customField3);
  }

  /**
   * 設定自訂名稱欄位4
   * 用途：自訂名稱欄位4
   * 參數說明：提供合作廠商使用記錄用客製化使用欄位，回傳時將會回傳此欄位的值
   */
  setCustomField4(customField4: string): void {
    this.data.set('CustomField4', customField4);
  }

  
  
}
