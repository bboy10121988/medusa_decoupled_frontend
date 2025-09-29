# 首頁Google搜尋結果優化指南

## 如何修改首頁的Google搜尋結果內容

### 方法一：通過Sanity CMS管理（推薦）

1. **登入Sanity Studio**
   - 前往 `/cms` 頁面
   - 選擇 "首頁" (homePage) 文件

2. **基本SEO設定**
   - **SEO標題**: 建議格式 "Tim's Fantasy World - 專業美髮沙龍與造型產品"
   - **SEO描述**: 140-160字元，例如：
     ```
     Tim's Fantasy World專業美髮沙龍，提供剪髮、染髮、燙髮等專業服務。
     銷售優質美髮產品包含洗髮精、護髮乳、造型產品等。預約專線: XXX-XXXX
     ```
   - **目標關鍵字**: "美髮沙龍"
   - **相關關鍵字**: 添加標籤如 "剪髮"、"染髮"、"燙髮"、"造型"、"洗髮精"等

3. **社群媒體分享設定**
   - **Facebook/社群標題**: 可以比SEO標題更具吸引力
   - **Facebook/社群描述**: 針對社群媒體優化的描述
   - **社群分享圖片**: 上傳高質量的品牌或店面圖片 (1200x630px)

### 方法二：直接修改代碼

如果需要快速修改或Sanity資料暫時無法使用，已經在以下檔案中設定了後備內容：

- `/src/app/(main)/[countryCode]/(main)/page.tsx` - 首頁SEO metadata
- `/src/app/layout.tsx` - 全域SEO設定

### 目前的改進

1. **改善了SEO標題和描述**
   - 從原本的 "手機版輪播圖片 2" 
   - 改為 "Tim's Fantasy World - 專業美髮沙龍與造型產品"

2. **添加了結構化資料支援**
   - 包含Open Graph標籤
   - Twitter Card支援
   - 正確的語言設定 (zh-TW)

3. **優化了robots.txt和sitemap**
   - 禁止搜尋引擎索引管理頁面
   - 允許重要商品和服務頁面

### 建議的SEO內容

**標題 (50-60字元)**
```
Tim's Fantasy World - 專業美髮沙龍 | 高品質美髮產品
```

**描述 (140-160字元)**
```
Tim's Fantasy World提供專業剪髮、染髮、燙髮服務，銷售優質洗髮精、護髮乳、造型產品。
專業髮型設計師為您打造完美造型，立即預約體驗！
```

**關鍵字**
- 主要：美髮沙龍、專業美髮、髮型設計
- 服務：剪髮、染髮、燙髮、護髮、造型
- 產品：洗髮精、護髮乳、造型產品、美髮用品

### 檢查SEO效果

1. **Google搜尋測試**
   - 使用 `site:timsfantasyworld.com` 查看索引狀況
   
2. **Google Search Console**
   - 提交sitemap.xml
   - 監控搜尋表現

3. **測試工具**
   - Google Rich Results Test
   - Facebook Sharing Debugger
   - Twitter Card Validator

### 注意事項

- SEO改變需要時間才能在Google搜尋結果中生效（通常1-4週）
- 確保網站內容與SEO描述一致
- 定期更新關鍵字以反映業務重點