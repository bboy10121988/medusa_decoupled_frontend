#!/usr/bin/env node

// 清除聯盟夥伴 cookie 的工具
// 用法: node clear-affiliate-cookie.js

console.log('🍪 聯盟夥伴 Cookie 清除工具\n')

console.log('請在瀏覽器中執行以下步驟來清除聯盟夥伴 cookie：')
console.log('1. 打開 http://localhost:8000')
console.log('2. 按 F12 打開開發者工具')
console.log('3. 切換到 Application 標籤（或 Storage 標籤）')
console.log('4. 在左側找到 Cookies > http://localhost:8000')
console.log('5. 刪除名為 "_affiliate_jwt" 的 cookie')
console.log('6. 重新整理頁面')
console.log('\n或者，在瀏覽器的 console 中執行：')
console.log('document.cookie = "_affiliate_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"')
console.log('\n✅ 清除 cookie 後，重新登入將使用新的 ID 生成機制')
